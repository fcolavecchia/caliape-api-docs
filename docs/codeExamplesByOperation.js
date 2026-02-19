window.codeExamplesByOperation = {
  "post /v1-auth-token": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-auth-token" \\
  -H "x-enterprise-key: YOUR_ENTERPRISE_API_KEY" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\n\nresponse = requests.post(\n    f"{base_url}/v1-auth-token",\n    headers={\n        "x-enterprise-key": "YOUR_ENTERPRISE_API_KEY",\n        "apikey": "YOUR_SUPABASE_ANON_KEY",\n    },\n    timeout=30,\n)\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\n\nconst response = await fetch(baseUrl + "/v1-auth-token", {\n  method: "POST",\n  headers: {\n    "x-enterprise-key": "YOUR_ENTERPRISE_API_KEY",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n  },\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
  "post /v1-cases": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -F "external_case_id=CASE-123" \\
  -F "audio=@./consulta.mp3"`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\n\nwith open("consulta.mp3", "rb") as audio_file:\n    response = requests.post(\n        f"{base_url}/v1-cases",\n        headers={\n            "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n            "apikey": "YOUR_SUPABASE_ANON_KEY",\n            "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",\n        },\n        files={"audio": audio_file},\n        data={"external_case_id": "CASE-123"},\n        timeout=60,\n    )\n\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\n\nconst formData = new FormData();\nformData.append("external_case_id", "CASE-123");\nformData.append("audio", new Blob([audioBuffer], { type: "audio/mpeg" }), "consulta.mp3");\n\nconst response = await fetch(baseUrl + "/v1-cases", {\n  method: "POST",\n  headers: {\n    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",\n  },\n  body: formData,\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
  "get /v1-cases/{external_case_id}": {
    curl: `curl "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases/CASE-123" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\nexternal_case_id = "CASE-123"\n\nresponse = requests.get(\n    f"{base_url}/v1-cases/{external_case_id}",\n    headers={\n        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n        "apikey": "YOUR_SUPABASE_ANON_KEY",\n        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",\n    },\n    timeout=30,\n)\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\nconst externalCaseId = "CASE-123";\n\nconst response = await fetch(baseUrl + "/v1-cases/" + externalCaseId, {\n  headers: {\n    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",\n  },\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
  "get /v1-cases/{external_case_id}/outputs": {
    curl: `curl "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-cases/CASE-123/outputs" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\nexternal_case_id = "CASE-123"\n\nresponse = requests.get(\n    f"{base_url}/v1-cases/{external_case_id}/outputs",\n    headers={\n        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n        "apikey": "YOUR_SUPABASE_ANON_KEY",\n        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",\n    },\n    timeout=30,\n)\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\nconst externalCaseId = "CASE-123";\n\nconst response = await fetch(baseUrl + "/v1-cases/" + externalCaseId + "/outputs", {\n  headers: {\n    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",\n  },\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
  "post /v1-transcribe-case/{external_case_id}": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-transcribe-case/CASE-123" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"language":"es","model":"whisper-1"}'`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\nexternal_case_id = "CASE-123"\n\nresponse = requests.post(\n    f"{base_url}/v1-transcribe-case/{external_case_id}",\n    headers={\n        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n        "apikey": "YOUR_SUPABASE_ANON_KEY",\n        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",\n    },\n    json={"language": "es", "model": "whisper-1"},\n    timeout=60,\n)\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\nconst externalCaseId = "CASE-123";\n\nconst response = await fetch(baseUrl + "/v1-transcribe-case/" + externalCaseId, {\n  method: "POST",\n  headers: {\n    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ language: "es", model: "whisper-1" }),\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
  "post /v1-summarize-case/{external_case_id}": {
    curl: `curl -X POST "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-summarize-case/CASE-123" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"language":"es","specialty":"base"}'`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\nexternal_case_id = "CASE-123"\n\nresponse = requests.post(\n    f"{base_url}/v1-summarize-case/{external_case_id}",\n    headers={\n        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n        "apikey": "YOUR_SUPABASE_ANON_KEY",\n        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",\n    },\n    json={"language": "es", "specialty": "base"},\n    timeout=60,\n)\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\nconst externalCaseId = "CASE-123";\n\nconst response = await fetch(baseUrl + "/v1-summarize-case/" + externalCaseId, {\n  method: "POST",\n  headers: {\n    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ language: "es", specialty: "base" }),\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
  "get /v1-usage": {
    curl: `curl "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1/v1-usage?month=1&year=2026" \\
  -H "x-enterprise-jwt: YOUR_ENTERPRISE_JWT" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"`,
    python: `import requests\n\nbase_url = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1"\n\nresponse = requests.get(\n    f"{base_url}/v1-usage",\n    params={"month": 1, "year": 2026},\n    headers={\n        "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n        "apikey": "YOUR_SUPABASE_ANON_KEY",\n        "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",\n    },\n    timeout=30,\n)\nresponse.raise_for_status()\nprint(response.json())`,
    typescript: `const baseUrl = "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1";\n\nconst params = new URLSearchParams({ month: "1", year: "2026" });\nconst response = await fetch(baseUrl + "/v1-usage?" + params.toString(), {\n  headers: {\n    "x-enterprise-jwt": "YOUR_ENTERPRISE_JWT",\n    apikey: "YOUR_SUPABASE_ANON_KEY",\n    Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",\n  },\n});\n\nif (!response.ok) throw new Error(await response.text());\nconsole.log(await response.json());`,
  },
};
