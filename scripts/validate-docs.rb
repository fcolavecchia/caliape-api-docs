#!/usr/bin/env ruby
# frozen_string_literal: true

require "open3"
require "json"
require "set"
require "yaml"

ROOT = File.expand_path("..", __dir__)
SPEC_PATH = File.join(ROOT, "recorder-api.yaml")
EXAMPLES_PATH = File.join(ROOT, "ejemplos", "codeExamplesByOperation.js")
DOCS_INDEX_PATH = File.join(ROOT, "docs", "index.html")
SPEC_INDEX_PATH = File.join(ROOT, "spec", "index.html")
SMOKE_TEST_SCRIPTS = [
  File.join(ROOT, "scripts", "test-endpoints.sh"),
  File.join(ROOT, "scripts", "test-endpoints.py"),
  File.join(ROOT, "scripts", "test-endpoints.ts"),
  File.join(ROOT, "scripts", "test-processing.py")
].freeze

errors = []

def fail_with(errors, message)
  errors << message
end

def local_ref?(value)
  value.is_a?(String) && value.start_with?("#/")
end

def resolve_ref(document, ref)
  ref.delete_prefix("#/").split("/").reduce(document) do |current, part|
    return nil unless current.respond_to?(:[])

    current[part]
  end
end

def walk(value, &block)
  yield value
  case value
  when Hash
    value.each_value { |child| walk(child, &block) }
  when Array
    value.each { |child| walk(child, &block) }
  end
end

spec = begin
  YAML.load_file(SPEC_PATH)
rescue Psych::SyntaxError => e
  fail_with(errors, "recorder-api.yaml no es YAML valido: #{e.message}")
  nil
end

if spec
  fail_with(errors, "recorder-api.yaml debe declarar openapi 3.x") unless spec["openapi"].to_s.start_with?("3.")
  fail_with(errors, "recorder-api.yaml debe tener info.title") unless spec.dig("info", "title")
  fail_with(errors, "recorder-api.yaml debe tener info.version") unless spec.dig("info", "version")

  paths = spec["paths"]
  fail_with(errors, "recorder-api.yaml debe tener paths") unless paths.is_a?(Hash) && !paths.empty?

  operations = []
  if paths.is_a?(Hash)
    paths.each do |path, path_item|
      unless path.start_with?("/")
        fail_with(errors, "path invalido, debe empezar con /: #{path}")
        next
      end

      path_item.each do |method, operation|
        next unless %w[get post put patch delete options head trace].include?(method)

        operation_key = "#{method.upcase} #{path}"
        operations << operation_key

        fail_with(errors, "#{operation_key} debe tener summary") unless operation["summary"]
        fail_with(errors, "#{operation_key} debe tener responses") unless operation["responses"].is_a?(Hash)
      end
    end
  end

  security_schemes = spec.dig("components", "securitySchemes") || {}
  operations.each do |operation_key|
    method, path = operation_key.split(" ", 2)
    operation = paths.dig(path, method.downcase)
    Array(operation["security"]).each do |security_requirement|
      security_requirement.each_key do |scheme_name|
        next if security_schemes.key?(scheme_name)

        fail_with(errors, "#{operation_key} usa security scheme inexistente: #{scheme_name}")
      end
    end
  end

  walk(spec) do |node|
    next unless node.is_a?(Hash) && local_ref?(node["$ref"])

    fail_with(errors, "referencia local inexistente: #{node["$ref"]}") unless resolve_ref(spec, node["$ref"])
  end

  node_script = <<~JS
    const fs = require("fs");
    const vm = require("vm");
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(#{EXAMPLES_PATH.dump}, "utf8"), context);
    console.log(JSON.stringify(context.window.codeExamplesByOperation || {}));
  JS
  examples_json, examples_stderr, examples_status = Open3.capture3("node", "-e", node_script)
  examples_map = if examples_status.success?
    JSON.parse(examples_json)
  else
    fail_with(errors, "no se pudieron leer los ejemplos JS:\n#{examples_stderr}")
    {}
  end

  examples = examples_map.keys.to_set
  spec_operations = operations.to_set

  missing_examples = spec_operations - examples
  extra_examples = examples - spec_operations

  missing_examples.sort.each do |operation_key|
    fail_with(errors, "falta ejemplo para #{operation_key}")
  end

  extra_examples.sort.each do |operation_key|
    fail_with(errors, "hay ejemplo sin endpoint en spec: #{operation_key}")
  end

  %w[curl python typescript].each do |language|
    operations.each do |operation_key|
      next if examples_map.dig(operation_key, language).to_s.strip != ""

      fail_with(errors, "#{operation_key} no tiene ejemplo #{language}")
    end
  end
end

unless File.read(DOCS_INDEX_PATH).include?("../recorder-api.yaml")
  fail_with(errors, "docs/index.html debe cargar ../recorder-api.yaml")
end

spec_index = File.read(SPEC_INDEX_PATH)
unless spec_index.include?("/recorder-api.yaml")
  fail_with(errors, "spec/index.html debe enlazar/cargar /recorder-api.yaml")
end

stdout, stderr, status = Open3.capture3("node", "--check", EXAMPLES_PATH)
unless status.success?
  fail_with(errors, "ejemplos/codeExamplesByOperation.js no pasa node --check:\n#{stdout}#{stderr}")
end

stdout, stderr, status = Open3.capture3("bash", "-n", SMOKE_TEST_SCRIPTS[0])
unless status.success?
  fail_with(errors, "scripts/test-endpoints.sh no pasa bash -n:\n#{stdout}#{stderr}")
end

stdout, stderr, status = Open3.capture3("python3", "-m", "py_compile", SMOKE_TEST_SCRIPTS[1], SMOKE_TEST_SCRIPTS[3])
unless status.success?
  fail_with(errors, "scripts/test-endpoints.py o scripts/test-processing.py no pasa py_compile:\n#{stdout}#{stderr}")
end

stdout, stderr, status = Open3.capture3("node", "--experimental-strip-types", "--check", SMOKE_TEST_SCRIPTS[2])
unless status.success?
  fail_with(errors, "scripts/test-endpoints.ts no pasa node --check:\n#{stdout}#{stderr}")
end

if errors.empty?
  puts "OK: spec, Swagger UI y ejemplos estan alineados."
else
  warn errors.map { |error| "- #{error}" }.join("\n")
  exit 1
end
