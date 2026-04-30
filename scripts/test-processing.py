#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TERMINAL_STATUSES = {"ready", "partial_ready", "failed"}
COMPLETED_OUTPUT_STATUSES = {"completed"}


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


def request_json(method, url, headers=None, body=None, expected=(200,)):
    request_headers = dict(headers or {})
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        request_headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=data, headers=request_headers, method=method)
    response_body = ""
    status = None
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
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


def assert_outputs_shape(outputs):
    if not isinstance(outputs, dict):
        raise SystemExit("FAIL outputs no es un objeto JSON")
    if not {"transcription", "summary", "patient_instructions"}.issubset(outputs.keys()):
        raise SystemExit("FAIL outputs no contiene transcription, summary y patient_instructions")
    if not outputs.get("transcription") and not outputs.get("summary") and not outputs.get("patient_instructions"):
        raise SystemExit("FAIL outputs no contiene ningun resultado usable")
    print("OK outputs con estructura minima")


def output_status(outputs_status, name):
    output = outputs_status.get(name)
    if isinstance(output, dict):
        return output.get("status")
    if isinstance(output, str):
        return output
    return None


def main():
    load_env(ROOT / ".env")

    base_url = os.environ.get("BASE_URL", "https://cjwyjqklzrufnbtnzxfa.supabase.co/functions/v1").rstrip("/")
    supabase_anon_key = required_env("SUPABASE_ANON_KEY")
    enterprise_api_key = required_env("ENTERPRISE_API_KEY")
    audio_url = required_env("AUDIO_URL")
    external_case_id = os.environ.get("PROCESSING_EXTERNAL_CASE_ID") or f"docs-processing-{int(time.time())}"
    timeout_seconds = int(os.environ.get("PROCESSING_TIMEOUT_SECONDS", "300"))
    poll_seconds = int(os.environ.get("PROCESSING_POLL_SECONDS", "10"))
    trigger_each_poll = truthy(os.environ.get("PROCESSING_TRIGGER_EACH_POLL", "false"))
    retrigger_on_transcript = truthy(os.environ.get("PROCESSING_RETRIGGER_ON_TRANSCRIPT", "true"))

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
    enterprise_headers = {**anon_headers, "x-enterprise-jwt": auth["access_token"]}

    request_json(
        "POST",
        f"{base_url}/v1-cases",
        headers=enterprise_headers,
        body={"external_case_id": external_case_id, "audio_url": audio_url},
        expected=(200, 201),
    )

    def trigger_processing():
        return request_json(
            "POST",
            f"{base_url}/v1-cases/{external_case_id}/process",
            headers=enterprise_headers,
            body={"batch_size": 5},
            expected=(200, 202, 409),
        )

    trigger_processing()

    deadline = time.monotonic() + timeout_seconds
    last_status = None
    case_status = {}
    transcript_retriggered = False
    while time.monotonic() < deadline:
        case_status = request_json(
            "GET",
            f"{base_url}/v1-cases/{external_case_id}",
            headers=enterprise_headers,
            expected=(200,),
        )
        last_status = case_status.get("status")
        outputs_status = case_status.get("outputs", {})
        jobs = case_status.get("jobs", {})
        print(
            "Estado:",
            last_status,
            "| outputs:",
            json.dumps(outputs_status, ensure_ascii=False),
            "| active_jobs:",
            jobs.get("active_count"),
            "| failed_jobs:",
            jobs.get("failed_count"),
        )

        if last_status in TERMINAL_STATUSES:
            break

        transcript_status = output_status(outputs_status, "transcript")
        if (
            retrigger_on_transcript
            and not transcript_retriggered
            and transcript_status in COMPLETED_OUTPUT_STATUSES
        ):
            print("Transcript terminado; relanzando process para summary/indications...")
            trigger_processing()
            transcript_retriggered = True

        if trigger_each_poll:
            print("Reintentando trigger de procesamiento para emular cron/worker...")
            trigger_processing()

        time.sleep(poll_seconds)

    if last_status not in TERMINAL_STATUSES:
        raise SystemExit(
            f"FAIL procesamiento no llego a estado terminal en {timeout_seconds}s "
            f"(ultimo status: {last_status}). Si no hay cron activo, el test relanza "
            "automaticamente cuando transcript queda completed; para reintentar en cada poll "
            "usa PROCESSING_TRIGGER_EACH_POLL=true."
        )

    if last_status == "failed":
        raise SystemExit(f"FAIL procesamiento termino en failed: {case_status.get('error_message')}")

    outputs = request_json(
        "GET",
        f"{base_url}/v1-cases/{external_case_id}/outputs",
        headers=enterprise_headers,
        expected=(200,),
    )
    assert_outputs_shape(outputs)
    print(f"Integration test de procesamiento completo para external_case_id={external_case_id}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nInterrumpido")
