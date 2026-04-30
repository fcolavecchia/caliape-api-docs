#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

BASE_URL="${BASE_URL:-https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1}"
BASE_URL="${BASE_URL%/}"
RETURN_ORIGIN="${RETURN_ORIGIN:-http://localhost:3000}"
EXTERNAL_CASE_ID="${EXTERNAL_CASE_ID:-docs-smoke-$(date +%s)}"
USAGE_MONTH="${USAGE_MONTH:-1}"
USAGE_YEAR="${USAGE_YEAR:-2026}"
RUN_PROCESSING_ENDPOINTS="${RUN_PROCESSING_ENDPOINTS:-true}"
RUN_LEGACY_ENDPOINTS="${RUN_LEGACY_ENDPOINTS:-true}"
RUN_NEGATIVE_TESTS="${RUN_NEGATIVE_TESTS:-true}"

require_env() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "${value}" || "${value}" == YOUR_* || "${value}" == "https://example.com/consulta.mp3" ]]; then
    echo "Falta configurar ${name} en .env" >&2
    exit 1
  fi
}

json_get() {
  python3 -c 'import json,sys; print(json.load(sys.stdin).get(sys.argv[1], ""))' "$1"
}

truthy() {
  case "$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')" in
    1|true|yes|y|on) return 0 ;;
    *) return 1 ;;
  esac
}

assert_equal() {
  local label="$1"
  local actual="$2"
  local expected="$3"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "FAIL ${label}: esperado '${expected}', recibido '${actual}'" >&2
    exit 1
  fi
  echo "OK ${label}" >&2
}

request_json() {
  local method="$1"
  local url="$2"
  local expected_csv="$3"
  local body="${4:-}"
  shift 4 || true

  local response status payload
  if [[ -n "${body}" ]]; then
    response="$(curl -sS -X "${method}" "${url}" "$@" -H "Content-Type: application/json" -d "${body}" -w $'\n%{http_code}')"
  else
    response="$(curl -sS -X "${method}" "${url}" "$@" -w $'\n%{http_code}')"
  fi
  status="$(printf '%s' "${response}" | tail -n 1)"
  payload="$(printf '%s' "${response}" | sed '$d')"

  if [[ ",${expected_csv}," == *",${status},"* ]]; then
    echo "OK ${method} ${url} -> HTTP ${status}" >&2
  else
    echo "FAIL ${method} ${url} -> HTTP ${status}" >&2
    printf '%s\n' "${payload}" >&2
    exit 1
  fi

  printf '%s' "${payload}"
}

validate_audio_url() {
  local headers status content_type
  headers="$(curl -sS -L -I "${AUDIO_URL}")"
  status="$(printf '%s\n' "${headers}" | awk 'toupper($0) ~ /^HTTP\// { code=$2 } END { print code }')"
  content_type="$(printf '%s\n' "${headers}" | awk 'BEGIN { IGNORECASE=1 } /^content-type:/ { value=$0; sub(/^[^:]+:[[:space:]]*/, "", value) } END { print value }' | tr -d '\r')"

  if [[ "${status}" != "200" ]]; then
    echo "FAIL AUDIO_URL -> HTTP ${status}" >&2
    exit 1
  fi
  echo "OK AUDIO_URL -> HTTP ${status}, Content-Type: ${content_type}" >&2

  if [[ "${content_type}" != audio/* ]]; then
    echo "FAIL AUDIO_URL debe responder Content-Type audio/*, recibido: ${content_type}" >&2
    exit 1
  fi
}

require_env SUPABASE_ANON_KEY
require_env ENTERPRISE_API_KEY
require_env AUDIO_URL
validate_audio_url

AUTH_RESPONSE="$(
  request_json POST "${BASE_URL}/v1-auth-token" "200" "" \
    -H "x-enterprise-key: ${ENTERPRISE_API_KEY}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"
)"
ENTERPRISE_JWT="$(printf '%s' "${AUTH_RESPONSE}" | tail -n 1 | json_get access_token)"

SESSION_RESPONSE="$(
  request_json POST "${BASE_URL}/v1-recorder-sessions" "201" \
    "{\"return_origin\":\"${RETURN_ORIGIN}\",\"external_case_id\":\"${EXTERNAL_CASE_ID}\",\"expires_in\":900,\"metadata\":{\"source\":\"docs-smoke-test-bash\"}}" \
    -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"
)"
SESSION_TOKEN="$(printf '%s' "${SESSION_RESPONSE}" | tail -n 1 | json_get session_token)"
SESSION_RETURN_ORIGIN="$(printf '%s' "${SESSION_RESPONSE}" | tail -n 1 | json_get return_origin)"
assert_equal "return_origin asociado a la sesion" "${SESSION_RETURN_ORIGIN}" "${RETURN_ORIGIN}"

if truthy "${RUN_NEGATIVE_TESTS}"; then
  request_json POST "${BASE_URL}/v1-recorder-sessions" "400" \
    "{\"return_origin\":\"not-a-valid-origin\",\"external_case_id\":\"${EXTERNAL_CASE_ID}-invalid\"}" \
    -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null
else
  echo "SKIP negative return_origin validation"
fi

request_json POST "${BASE_URL}/v1-cases" "200,201" \
  "{\"external_case_id\":\"${EXTERNAL_CASE_ID}\",\"audio_url\":\"${AUDIO_URL}\"}" \
  -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null

request_json GET "${BASE_URL}/v1-cases/${EXTERNAL_CASE_ID}" "200" "" \
  -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null

request_json GET "${BASE_URL}/v1-cases/${EXTERNAL_CASE_ID}" "200" "" \
  -H "x-recorder-session-token: ${SESSION_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null

if truthy "${RUN_PROCESSING_ENDPOINTS}"; then
  request_json POST "${BASE_URL}/v1-cases/${EXTERNAL_CASE_ID}/process" "200,202,409" '{"batch_size":5}' \
    -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null
else
  echo "SKIP POST /v1-cases/{external_case_id}/process"
fi

if truthy "${RUN_LEGACY_ENDPOINTS}"; then
  request_json POST "${BASE_URL}/v1-transcribe-case/${EXTERNAL_CASE_ID}" "200,202,403,409,429,502" '{"language":"es","model":"whisper-1"}' \
    -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null

  request_json POST "${BASE_URL}/v1-summarize-case/${EXTERNAL_CASE_ID}" "200,202,409,429" '{"language":"es","specialty":"base"}' \
    -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null
else
  echo "SKIP POST /v1-transcribe-case/{external_case_id}"
  echo "SKIP POST /v1-summarize-case/{external_case_id}"
fi

request_json GET "${BASE_URL}/v1-usage?month=${USAGE_MONTH}&year=${USAGE_YEAR}" "200" "" \
  -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null

request_json GET "${BASE_URL}/v1-cases/${EXTERNAL_CASE_ID}/outputs" "200,404" "" \
  -H "x-enterprise-jwt: ${ENTERPRISE_JWT}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null

echo "Smoke test de endpoints completo para external_case_id=${EXTERNAL_CASE_ID}"
echo "Nota: este test no espera ni valida la finalizacion del procesamiento clinico asincronico."
