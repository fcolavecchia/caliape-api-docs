import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

type JsonValue = Record<string, unknown>;

const root = resolve(import.meta.dirname, "..");

function loadEnv(path: string): void {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    process.env[key.trim()] ??= value;
  }
}

function requiredEnv(name: string): string {
  const value = (process.env[name] || "").trim();
  if (!value || value.startsWith("YOUR_") || value === "https://example.com/consulta.mp3") {
    console.error(`Falta configurar ${name} en .env`);
    process.exit(1);
  }
  return value;
}

function truthy(value: string | undefined): boolean {
  return ["1", "true", "yes", "y", "on"].includes((value || "").toLowerCase());
}

function assertEqual(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    console.error(`FAIL ${label}: esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
    process.exit(1);
  }
  console.log(`OK ${label}`);
}

async function requestJson(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: JsonValue | undefined,
  expected: number[],
): Promise<JsonValue> {
  const response = await fetch(url, {
    method,
    headers: body ? { ...headers, "Content-Type": "application/json" } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const ok = expected.includes(response.status);
  console.log(`${ok ? "OK" : "FAIL"} ${method} ${url} -> HTTP ${response.status}`);

  if (!ok) {
    console.error(text.slice(0, 1200));
    process.exit(1);
  }

  if (!text) return {};
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return { raw: text };
  }
}

loadEnv(resolve(root, ".env"));

const baseUrl = (process.env.BASE_URL || "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1").replace(/\/$/, "");
const supabaseAnonKey = requiredEnv("SUPABASE_ANON_KEY");
const enterpriseApiKey = requiredEnv("ENTERPRISE_API_KEY");
const audioUrl = requiredEnv("AUDIO_URL");
const returnOrigin = process.env.RETURN_ORIGIN || "http://localhost:3000";
const externalCaseId = process.env.EXTERNAL_CASE_ID || `docs-smoke-${Math.floor(Date.now() / 1000)}`;
const usageMonth = process.env.USAGE_MONTH || "1";
const usageYear = process.env.USAGE_YEAR || "2026";
const runProcessing = truthy(process.env.RUN_PROCESSING_ENDPOINTS || "true");
const runLegacy = truthy(process.env.RUN_LEGACY_ENDPOINTS || "true");
const runNegative = truthy(process.env.RUN_NEGATIVE_TESTS || "true");

const anonHeaders = {
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
};

const auth = await requestJson(
  "POST",
  `${baseUrl}/v1-auth-token`,
  { ...anonHeaders, "x-enterprise-key": enterpriseApiKey },
  undefined,
  [200],
);
const enterpriseJwt = String(auth.access_token);
const enterpriseHeaders = { ...anonHeaders, "x-enterprise-jwt": enterpriseJwt };

const session = await requestJson(
  "POST",
  `${baseUrl}/v1-recorder-sessions`,
  enterpriseHeaders,
  {
    return_origin: returnOrigin,
    external_case_id: externalCaseId,
    expires_in: 900,
    metadata: { source: "docs-smoke-test-typescript" },
  },
  [201],
);
assertEqual("return_origin asociado a la sesion", session.return_origin, returnOrigin);

if (runNegative) {
  await requestJson(
    "POST",
    `${baseUrl}/v1-recorder-sessions`,
    enterpriseHeaders,
    { return_origin: "not-a-valid-origin", external_case_id: `${externalCaseId}-invalid` },
    [400],
  );
} else {
  console.log("SKIP negative return_origin validation");
}

const recorderHeaders = {
  ...anonHeaders,
  "x-recorder-session-token": String(session.session_token),
};

await requestJson(
  "POST",
  `${baseUrl}/v1-cases`,
  enterpriseHeaders,
  { external_case_id: externalCaseId, audio_url: audioUrl },
  [200, 201],
);
await requestJson("GET", `${baseUrl}/v1-cases/${externalCaseId}`, enterpriseHeaders, undefined, [200]);
await requestJson("GET", `${baseUrl}/v1-cases/${externalCaseId}`, recorderHeaders, undefined, [200]);

if (runProcessing) {
  await requestJson(
    "POST",
    `${baseUrl}/v1-cases/${externalCaseId}/process`,
    enterpriseHeaders,
    { batch_size: 5 },
    [200, 202, 409],
  );
} else {
  console.log("SKIP POST /v1-cases/{external_case_id}/process");
}

if (runLegacy) {
  await requestJson(
    "POST",
    `${baseUrl}/v1-transcribe-case/${externalCaseId}`,
    enterpriseHeaders,
    { language: "es", model: "whisper-1" },
    [200, 202, 403, 409, 429, 502],
  );
  await requestJson(
    "POST",
    `${baseUrl}/v1-summarize-case/${externalCaseId}`,
    enterpriseHeaders,
    { language: "es", specialty: "base" },
    [200, 202, 409, 429],
  );
} else {
  console.log("SKIP POST /v1-transcribe-case/{external_case_id}");
  console.log("SKIP POST /v1-summarize-case/{external_case_id}");
}

await requestJson(
  "GET",
  `${baseUrl}/v1-usage?${new URLSearchParams({ month: usageMonth, year: usageYear })}`,
  enterpriseHeaders,
  undefined,
  [200],
);
await requestJson("GET", `${baseUrl}/v1-cases/${externalCaseId}/outputs`, enterpriseHeaders, undefined, [200, 404]);

console.log(`Smoke test completo para external_case_id=${externalCaseId}`);
