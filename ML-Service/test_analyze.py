"""Manual smoke test. Put six real face images in sample_images/ before running."""

import json
import os
from pathlib import Path

import requests


BASE_URL = "http://localhost:7860/analyze"
IMAGE_FIELDS = (
    "front",
    "left_profile",
    "right_profile",
    "forehead_closeup",
    "left_cheek_closeup",
    "right_cheek_closeup",
)


def main() -> None:
    secret = os.getenv("ML_SERVICE_SECRET")
    if not secret:
        raise SystemExit("Set ML_SERVICE_SECRET to the local service secret before running this script")
    sample_dir = Path(__file__).parent / "sample_images"
    files = {}
    handles = []
    try:
        for field in IMAGE_FIELDS:
            path = sample_dir / f"{field}.jpg"
            if not path.exists():
                raise SystemExit(f"Add a 480x480+ face image at {path}")
            handle = path.open("rb")
            handles.append(handle)
            files[field] = (path.name, handle, "image/jpeg")
        response = requests.post(
            BASE_URL,
            headers={"X-Internal-Secret": secret},
            files=files,
            data={
                "quiz_scores": json.dumps({
                    "sebum_level": 65,
                    "hydration_level": 50,
                    "acne_frequency": 45,
                    "pore_size": 55,
                    "sensitivity_score": 30,
                    "roughness_score": 40,
                    "tightness_score": 30,
                }),
                "user_notes": "Manual local smoke test",
            },
            timeout=180,
        )
        print(response.status_code)
        print(response.text)
    finally:
        for handle in handles:
            handle.close()


if __name__ == "__main__":
    main()
