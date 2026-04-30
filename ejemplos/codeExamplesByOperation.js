window.codeExamplesByOperation = {
  "POST /v1-auth-token": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-auth-token" \\
  -H "x-enterprise-key: YOUR_ENTERPRISE_API_KEY" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"

response = requests.post(
    f"{base_url}/v1-auth-token",
    headers={
        "x-enterprise-key": "YOUR_ENTERPRISE_API_KEY",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    timeout=30,
)
response.raise_for_status()
tokens = response.json()
print(tokens["access_token"])
print(tokens["realtime_access_token"])`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";

const response = await fetch(baseUrl + "/v1-auth-token", {
  method: "POST",
  headers: {
    "x-enterprise-key": "YOUR_ENTERPRISE_API_KEY",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
  },
});

if (!response.ok) throw new Error(await response.text());
const tokens = await response.json();
console.log(tokens.access_token);
console.log(tokens.realtime_access_token);`,
  },
  "POST /v1-recorder-sessions": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-recorder-sessions" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"return_origin":"https://demo-hce.caliape.com","external_case_id":"CASE-123","expires_in":900,"metadata":{"patient_id":"PAT-456"}}'`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"

response = requests.post(
    f"{base_url}/v1-recorder-sessions",
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    json={
        "return_origin": "https://demo-hce.caliape.com",
        "external_case_id": "CASE-123",
        "expires_in": 900,
        "metadata": {"patient_id": "PAT-456"},
    },
    timeout=30,
)
response.raise_for_status()
session = response.json()
print(session["session_token"])
print(session.get("session_url"))`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";

const response = await fetch(baseUrl + "/v1-recorder-sessions", {
  method: "POST",
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    return_origin: "https://demo-hce.caliape.com",
    external_case_id: "CASE-123",
    expires_in: 900,
    metadata: { patient_id: "PAT-456" },
  }),
});

if (!response.ok) throw new Error(await response.text());
const session = await response.json();
console.log(session.session_token);
console.log(session.session_url);`,
  },
  "POST /v1-cases": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -F "external_case_id=CASE-123" \\
  -F "audio=@./consulta.mp3;type=audio/mpeg"`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"

with open("consulta.mp3", "rb") as audio_file:
    response = requests.post(
        f"{base_url}/v1-cases",
        headers={
            "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
            "apikey": "YOUR_SUPABASE_ANON_KEY",
            "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
        },
        files={"audio": ("consulta.mp3", audio_file, "audio/mpeg")},
        data={"external_case_id": "CASE-123"},
        timeout=60,
    )

response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";

const formData = new FormData();
formData.append("external_case_id", "CASE-123");
formData.append("audio", new Blob([audioBuffer], { type: "audio/mpeg" }), "consulta.mp3");

const response = await fetch(baseUrl + "/v1-cases", {
  method: "POST",
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
  },
  body: formData,
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
  "GET /v1-cases/{external_case_id}": {
    curl: `curl "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases/CASE-123" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"
external_case_id = "CASE-123"

response = requests.get(
    f"{base_url}/v1-cases/{external_case_id}",
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    timeout=30,
)
response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";
const externalCaseId = "CASE-123";

const response = await fetch(baseUrl + "/v1-cases/" + externalCaseId, {
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
  },
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
  "POST /v1-cases/{external_case_id}/process": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases/CASE-123/process" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"batch_size":5}'`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"
external_case_id = "CASE-123"

response = requests.post(
    f"{base_url}/v1-cases/{external_case_id}/process",
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    json={"batch_size": 5},
    timeout=60,
)
response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";
const externalCaseId = "CASE-123";

const response = await fetch(baseUrl + "/v1-cases/" + externalCaseId + "/process", {
  method: "POST",
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ batch_size: 5 }),
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
  "GET /v1-cases/{external_case_id}/outputs": {
    curl: `curl "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases/CASE-123/outputs" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"
external_case_id = "CASE-123"

response = requests.get(
    f"{base_url}/v1-cases/{external_case_id}/outputs",
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    timeout=30,
)
response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";
const externalCaseId = "CASE-123";

const response = await fetch(baseUrl + "/v1-cases/" + externalCaseId + "/outputs", {
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
  },
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
  "POST /v1-transcribe-case/{external_case_id}": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-transcribe-case/CASE-123" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"language":"es","model":"whisper-1"}'`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"
external_case_id = "CASE-123"

response = requests.post(
    f"{base_url}/v1-transcribe-case/{external_case_id}",
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    json={"language": "es", "model": "whisper-1"},
    timeout=60,
)
response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";
const externalCaseId = "CASE-123";

const response = await fetch(baseUrl + "/v1-transcribe-case/" + externalCaseId, {
  method: "POST",
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ language: "es", model: "whisper-1" }),
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
  "POST /v1-summarize-case/{external_case_id}": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-summarize-case/CASE-123" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"language":"es","specialty":"base"}'`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"
external_case_id = "CASE-123"

response = requests.post(
    f"{base_url}/v1-summarize-case/{external_case_id}",
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    json={"language": "es", "specialty": "base"},
    timeout=60,
)
response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";
const externalCaseId = "CASE-123";

const response = await fetch(baseUrl + "/v1-summarize-case/" + externalCaseId, {
  method: "POST",
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ language: "es", specialty: "base" }),
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
  "GET /v1-usage": {
    curl: `curl "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-usage?month=1&year=2026" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests

base_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"

response = requests.get(
    f"{base_url}/v1-usage",
    params={"month": 1, "year": 2026},
    headers={
        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    },
    timeout=30,
)
response.raise_for_status()
print(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";

const params = new URLSearchParams({ month: "1", year: "2026" });
const response = await fetch(baseUrl + "/v1-usage?" + params.toString(), {
  headers: {
    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",
    apikey: "YOUR_SUPABASE_ANON_KEY",
    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
  },
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`,
  },
};
