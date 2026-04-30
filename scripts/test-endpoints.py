#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def load_env(path):
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def required_env(name):
    value = os.environ.get(name, "").strip()
    if not value or value.startswith("YOUR_") or value == "https://example.com/consulta.mp3":
        raise SystemExit(f"Falta configurar {name} en .env")
    return value


def truthy(value):
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def assert_equal(label, actual, expected):
    if actual != expected:
        raise SystemExit(f"FAIL {label}: esperado {expected!r}, recibido {actual!r}")
    print(f"OK {label}")


def request_json(method, url, headers=None, body=None, expected=(200,)):
    data = None
    request_headers = dict(headers or {})
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        request_headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=data, headers=request_headers, method=method)
    response_body = ""
    status = None
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            status = response.status
            response_body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        status = error.code
        response_body = error.read().decode("utf-8")

    ok = status in expected
    print(f"{'OK' if ok else 'FAIL'} {method} {url} -> HTTP {status}")
    if not ok:
        print(response_body[:1200])
        raise SystemExit(1)

    if not response_body:
        return {}
    try:
        return json.loads(response_body)
    except json.JSONDecodeError:
        return {"raw": response_body}


def validate_audio_url(audio_url):
    request = urllib.request.Request(audio_url, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            content_type = response.headers.get("Content-Type", "")
            print(f"OK AUDIO_URL -> HTTP {response.status}, Content-Type: {content_type}")
    except urllib.error.HTTPError as error:
        raise SystemExit(f"FAIL AUDIO_URL -> HTTP {error.code}")

    if not content_type.startswith("audio/"):
        raise SystemExit(f"FAIL AUDIO_URL debe responder Content-Type audio/*, recibido: {content_type}")


def main():
    load_env(ROOT / ".env")

    base_url = os.environ.get("BASE_URL", "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1").rstrip("/")
    supabase_anon_key = required_env("SUPABASE_ANON_KEY")
    enterprise_api_key = required_env("ENTERPRISE_API_KEY")
    audio_url = required_env("AUDIO_URL")
    return_origin = os.environ.get("RETURN_ORIGIN", "http://localhost:3000")
    external_case_id = os.environ.get("EXTERNAL_CASE_ID") or f"docs-smoke-{int(time.time())}"
    usage_month = os.environ.get("USAGE_MONTH", "1")
    usage_year = os.environ.get("USAGE_YEAR", "2026")
    run_processing = truthy(os.environ.get("RUN_PROCESSING_ENDPOINTS", "true"))
    run_legacy = truthy(os.environ.get("RUN_LEGACY_ENDPOINTS", "true"))
    run_negative = truthy(os.environ.get("RUN_NEGATIVE_TESTS", "true"))
    validate_audio_url(audio_url)

    anon_headers = {
        "apikey": supabase_anon_key,
        "Authorization": f"Bearer {supabase_anon_key}",
    }

    auth = request_json(
        "POST",
        f"{base_url}/v1-auth-token",
        headers={**anon_headers, "x-enterprise-key": enterprise_api_key},
        expected=(200,),
    )
    enterprise_jwt = auth["access_token"]
    enterprise_headers = {**anon_headers, "x-enterprise-jwt": enterprise_jwt}

    session = request_json(
        "POST",
        f"{base_url}/v1-recorder-sessions",
        headers=enterprise_headers,
        body={
            "return_origin": return_origin,
            "external_case_id": external_case_id,
            "expires_in": 900,
            "metadata": {"source": "docs-smoke-test-python"},
        },
        expected=(201,),
    )
    assert_equal("return_origin asociado a la sesion", session.get("return_origin"), return_origin)

    if run_negative:
        request_json(
            "POST",
            f"{base_url}/v1-recorder-sessions",
            headers=enterprise_headers,
            body={"return_origin": "not-a-valid-origin", "external_case_id": f"{external_case_id}-invalid"},
            expected=(400,),
        )
    else:
        print("SKIP negative return_origin validation")

    recorder_headers = {**anon_headers, "x-recorder-session-token": session["session_token"]}

    request_json(
        "POST",
        f"{base_url}/v1-cases",
        headers=enterprise_headers,
        body={"external_case_id": external_case_id, "audio_url": audio_url},
        expected=(200, 201),
    )
    request_json("GET", f"{base_url}/v1-cases/{external_case_id}", headers=enterprise_headers, expected=(200,))
    request_json("GET", f"{base_url}/v1-cases/{external_case_id}", headers=recorder_headers, expected=(200,))

    if run_processing:
        request_json(
            "POST",
            f"{base_url}/v1-cases/{external_case_id}/process",
            headers=enterprise_headers,
            body={"batch_size": 5},
            expected=(200, 202, 409),
        )
    else:
        print("SKIP POST /v1-cases/{external_case_id}/process")

    if run_legacy:
        request_json(
            "POST",
            f"{base_url}/v1-transcribe-case/{external_case_id}",
            headers=enterprise_headers,
            body={"language": "es", "model": "whisper-1"},
            expected=(200, 202, 403, 409, 429, 502),
        )
        request_json(
            "POST",
            f"{base_url}/v1-summarize-case/{external_case_id}",
            headers=enterprise_headers,
            body={"language": "es", "specialty": "base"},
            expected=(200, 202, 409, 429),
        )
    else:
        print("SKIP POST /v1-transcribe-case/{external_case_id}")
        print("SKIP POST /v1-summarize-case/{external_case_id}")

    request_json(
        "GET",
        f"{base_url}/v1-usage?{urllib.parse.urlencode({'month': usage_month, 'year': usage_year})}",
        headers=enterprise_headers,
        expected=(200,),
    )
    request_json(
        "GET",
        f"{base_url}/v1-cases/{external_case_id}/outputs",
        headers=enterprise_headers,
        expected=(200, 404),
    )

    print(f"Smoke test de endpoints completo para external_case_id={external_case_id}")
    print("Nota: este test no espera ni valida la finalizacion del procesamiento clinico asincronico.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nInterrumpido")
