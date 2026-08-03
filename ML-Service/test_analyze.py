"""Manual smoke test for the async /analyze endpoint.

Put six real face images in sample_images/ before running.

This script:
1. Starts a tiny local HTTP server to receive the callback
2. Sends a request to /analyze and expects 202 Accepted immediately
3. Waits for the callback POST to arrive with the full result
4. Prints both the 202 response (with timing) and the callback payload
"""

import json
import os
import sys
import time
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from threading import Thread

import requests


ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:7860")
ANALYZE_URL = f"{ML_SERVICE_URL}/analyze"
CALLBACK_PORT = int(os.getenv("CALLBACK_PORT", "9999"))
IMAGE_FIELDS = (
    "front",
    "left_profile",
    "right_profile",
    "forehead_closeup",
    "left_cheek_closeup",
    "right_cheek_closeup",
)
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")
CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


# ---------- tiny callback receiver ----------

callback_payload = {}
callback_received = False


class CallbackHandler(BaseHTTPRequestHandler):
    """Receives the background task callback and stores the payload."""

    def do_POST(self):
        global callback_payload, callback_received
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        callback_payload = json.loads(body)
        callback_received = True

        secret = self.headers.get("X-Internal-Secret", "")
        print(f"\n✅  Callback received! (X-Internal-Secret present: {bool(secret)})")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"ok": true}')

    def log_message(self, format, *args):
        """Suppress default request logging — we print our own."""
        pass


def start_callback_server() -> HTTPServer:
    server = HTTPServer(("0.0.0.0", CALLBACK_PORT), CallbackHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


# ---------- main test ----------

def main() -> None:
    secret = os.getenv("ML_SERVICE_SECRET")
    if not secret:
        raise SystemExit("Set ML_SERVICE_SECRET to the local service secret before running this script")

    sample_dir = Path(__file__).parent / "sample_images"
    analysis_id = f"test-{uuid.uuid4().hex[:8]}"

    # Determine callback URL — when running against Docker, use host.docker.internal
    # so the container can reach this script's callback server.
    callback_host = os.getenv("CALLBACK_HOST", "host.docker.internal")
    callback_url = f"http://{callback_host}:{CALLBACK_PORT}/ml-callback"

    print(f"Analysis ID:  {analysis_id}")
    print(f"Callback URL: {callback_url}")
    print(f"Analyze URL:  {ANALYZE_URL}")
    print()

    # Start local callback server
    server = start_callback_server()
    print(f"🔊  Callback server listening on port {CALLBACK_PORT}")

    files = {}
    handles = []
    try:
        # Case-insensitive lookup so front.JPG etc. work on case-sensitive filesystems
        available = {p.name.lower(): p for p in sample_dir.iterdir() if p.is_file()}
        for field in IMAGE_FIELDS:
            path = next(
                (available[f"{field}{ext}"] for ext in IMAGE_EXTENSIONS if f"{field}{ext}" in available),
                None,
            )
            if path is None:
                raise SystemExit(
                    f"Add a face image at {sample_dir}/{field}.[jpg|jpeg|png|webp]"
                )
            handle = path.open("rb")
            handles.append(handle)
            files[field] = (path.name, handle, CONTENT_TYPES[path.suffix.lower()])

        # Send the analyze request and measure response time
        start = time.perf_counter()
        response = requests.post(
            ANALYZE_URL,
            headers={"X-Internal-Secret": secret},
            files=files,
            data={
                "quiz_scores": json.dumps({
                    "sebum_level": 30,
                    "hydration_level": 30,
                    "acne_frequency": 20,
                    "pore_size": 30,
                    "sensitivity_score": 25,
                    "roughness_score": 60,
                    "tightness_score": 70,
                }),
                "user_notes": "Dry skin smoke test",
                "analysis_id": analysis_id,
                "callback_url": callback_url,
            },
            timeout=30,
        )
        elapsed = time.perf_counter() - start

        print(f"\n--- Immediate Response ({elapsed:.3f}s) ---")
        print(f"Status: {response.status_code}")
        print(f"Body:   {response.text}")

        if response.status_code != 202:
            raise SystemExit(f"Expected 202, got {response.status_code}")

        body = response.json()
        assert body["status"] == "processing", f"Expected status='processing', got {body}"
        assert body["analysis_id"] == analysis_id
        print(f"\n✅  Got 202 Accepted in {elapsed:.3f}s (target: <1s)")

        # Wait for the background callback
        print("\n⏳  Waiting for callback (up to 120s)...")
        waited = 0
        while not callback_received and waited < 120:
            time.sleep(1)
            waited += 1

        if not callback_received:
            print("❌  Callback was NOT received within 120 seconds")
            sys.exit(1)

        print("\n--- Callback Payload ---")
        print(json.dumps(callback_payload, indent=2))

        # Basic assertions on callback payload shape
        assert callback_payload.get("analysis_id") == analysis_id
        assert "skin_type" in callback_payload
        assert "confidence" in callback_payload
        assert "final_scores" in callback_payload
        assert "raw_debug" in callback_payload
        assert "timestamp" in callback_payload
        print("\n✅  Callback payload shape validated!")

    finally:
        for handle in handles:
            handle.close()
        server.shutdown()


if __name__ == "__main__":
    main()
