import json
import gc
import logging
import os
import secrets
import time
import threading
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from io import BytesIO
from typing import Dict, Optional
from urllib.parse import urlparse

import cv2
import numpy as np
import onnxruntime
import requests as http_requests
from fastapi import BackgroundTasks, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError

from fusion import fuse_scores, predict_skin_type
from schemas import AnalyzeResponse, QuizScores


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("glowguide.ml_service")

SKIN_MODEL = "dima806/skin_types_image_detection"
ACNE_MODEL = "imfarzanansari/skintelligent-acne"
MODEL_ROOT = os.path.join(os.path.dirname(__file__), "models")
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MIN_IMAGE_DIMENSION = 480
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
FACE_REQUIRED_FIELDS = {"front", "left_profile", "right_profile"}
PROFILE_FIELDS = {"left_profile", "right_profile"}
MAGIC_BYTES = {
    "image/jpeg": lambda data: data.startswith(b"\xff\xd8\xff"),
    "image/png": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
    "image/webp": lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
}

CALLBACK_RETRY_COUNT = 3
CALLBACK_RETRY_DELAY_SECONDS = 2
BACKGROUND_TASK_TIMEOUT_SECONDS = 90

ml_service_secret: Optional[str] = None
skin_model_path: str = ""
acne_model_path: str = ""
skin_preprocessing: dict = {}
acne_preprocessing: dict = {}
skin_labels: list[str] = []
acne_labels: list[str] = []


@asynccontextmanager
async def lifespan(_: FastAPI):
    global ml_service_secret, skin_model_path, acne_model_path
    global skin_preprocessing, acne_preprocessing, skin_labels, acne_labels

    ml_service_secret = os.getenv("ML_SERVICE_SECRET")
    if not ml_service_secret:
        raise RuntimeError("ML_SERVICE_SECRET must be set before starting the ML service")

    skin_model_path, skin_preprocessing, skin_labels = load_model_metadata("skin_type", SKIN_MODEL)
    acne_model_path, acne_preprocessing, acne_labels = load_model_metadata("acne_severity", ACNE_MODEL)
    logger.info("Skin type model loaded with labels: %s", skin_labels)
    logger.info("Acne severity model loaded with labels: %s", acne_labels)
    logger.info("GlowGuide ML Service started")
    yield
    logger.info("GlowGuide ML Service stopped")


app = FastAPI(
    title="GlowGuide ML Service",
    description="Fuses quiz scores with pretrained image classifiers for skin analysis",
    version="3.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to specific domains in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok", "service": "GlowGuide ML Service", "version": "3.1.0"}


def load_model_metadata(name: str, model_id: str):
    model_dir = os.path.join(MODEL_ROOT, name)
    with open(os.path.join(model_dir, "config.json"), encoding="utf-8") as handle:
        config = json.load(handle)
    with open(os.path.join(model_dir, "preprocessing.json"), encoding="utf-8") as handle:
        preprocessing = json.load(handle)
    labels = [str(config["id2label"][str(index)]) for index in range(len(config["id2label"]))]
    return os.path.join(model_dir, "model.onnx"), preprocessing, labels


def bad_request(message: str) -> HTTPException:
    return HTTPException(status_code=400, detail=message)


LOOPBACK_HOSTS = {"localhost", "127.0.0.1", "::1", "0.0.0.0"}
METADATA_HOSTS = {"169.254.169.254", "169.254.170.2", "metadata.google.internal", "metadata"}


def _validate_callback_url(callback_url: str) -> None:
    """Reject callback URLs that could be abused as an SSRF vector."""
    try:
        parsed = urlparse(callback_url)
    except ValueError as exc:
        raise bad_request("callback_url is not a valid URL") from exc

    if parsed.scheme not in ("http", "https"):
        raise bad_request("callback_url must use http or https")

    host = (parsed.hostname or "").lower().rstrip(".")
    if not host:
        raise bad_request("callback_url must include a host")

    if host in LOOPBACK_HOSTS:
        raise bad_request("callback_url must not point to a loopback address")

    if host in METADATA_HOSTS or host.endswith(".internal") and host != "host.docker.internal":
        raise bad_request("callback_url must not point to a metadata or internal address")

    if host.startswith("127."):
        raise bad_request("callback_url must not point to a loopback address")


async def validate_image(
    upload: Optional[UploadFile],
    field_name: str,
    require_face: bool,
) -> Image.Image:
    if upload is None:
        raise bad_request(f"Missing image field: {field_name}")

    content_type = (upload.content_type or "").lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise bad_request(f"Invalid image format for {field_name}; use jpg, jpeg, png, or webp")

    data = await upload.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise bad_request(f"Image {field_name} exceeds the 8MB size limit")
    if not MAGIC_BYTES[content_type](data):
        raise bad_request(f"Invalid image format for {field_name}; content does not match its MIME type")

    try:
        image = Image.open(BytesIO(data))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        logger.info("Image validation failed for %s: %s", field_name, exc)
        raise bad_request(f"Invalid image format for {field_name}") from exc

    if image.width < MIN_IMAGE_DIMENSION or image.height < MIN_IMAGE_DIMENSION:
        raise bad_request(f"Image {field_name} must be at least 480x480 pixels")

    if require_face:
        grayscale = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2GRAY)
        frontal_cascade = cv2.CascadeClassifier(
            os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        )
        profile_cascade = cv2.CascadeClassifier(
            os.path.join(cv2.data.haarcascades, "haarcascade_profileface.xml")
        )

        def detect(cascade: cv2.CascadeClassifier, source: np.ndarray):
            return cascade.detectMultiScale(source, scaleFactor=1.05, minNeighbors=3, minSize=(60, 60))

        if field_name in PROFILE_FIELDS:
            # ProfileFace is the primary detector for the 40–50° profile shots.
            faces = detect(profile_cascade, grayscale)
            if len(faces) == 0:
                faces = detect(profile_cascade, cv2.flip(grayscale, 1))
            # Keep the frontal cascade as a tolerant fallback for intermediate angles.
            if len(faces) == 0:
                faces = detect(frontal_cascade, grayscale)
        else:
            faces = detect(frontal_cascade, grayscale)

        if len(faces) == 0:
            raise bad_request(f"No face detected in {field_name}")
    return image.convert("RGB")


def run_classifier(session: onnxruntime.InferenceSession, image: Image.Image, preprocessing: dict, labels: list[str]) -> Dict[str, float]:
    size = preprocessing["input_size"]
    image_array = np.asarray(
        image.resize((size["width"], size["height"]), Image.Resampling.BILINEAR),
        dtype=np.float32,
    ) / 255.0
    image_array = (image_array - np.asarray(preprocessing["mean"], dtype=np.float32)) / np.asarray(
        preprocessing["std"], dtype=np.float32
    )
    input_array = np.transpose(image_array, (2, 0, 1))[None, ...]
    input_name = session.get_inputs()[0].name
    input_type = session.get_inputs()[0].type
    input_array = input_array.astype(np.float16 if input_type == "tensor(float16)" else np.float32)
    logits = np.asarray(session.run(None, {input_name: input_array})[0], dtype=np.float32)[0]
    probabilities = np.exp(logits - np.max(logits))
    probabilities /= probabilities.sum()
    return {label: float(probability) for label, probability in zip(labels, probabilities)}


def _post_callback(callback_url: str, payload: dict, secret: str, analysis_id: str) -> None:
    """POST the result to callback_url with retry logic."""
    for attempt in range(1, CALLBACK_RETRY_COUNT + 1):
        try:
            resp = http_requests.post(
                callback_url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Internal-Secret": secret,
                },
                timeout=15,
            )
            if resp.ok:
                logger.info(
                    "[%s] Callback POST succeeded on attempt %d (status %d)",
                    analysis_id, attempt, resp.status_code,
                )
                return
            else:
                logger.warning(
                    "[%s] Callback POST attempt %d/%d returned non-2xx status %d: %s",
                    analysis_id, attempt, CALLBACK_RETRY_COUNT,
                    resp.status_code, resp.text[:200],
                )
        except Exception as exc:
            logger.warning(
                "[%s] Callback POST attempt %d/%d failed with error: %s",
                analysis_id, attempt, CALLBACK_RETRY_COUNT, exc,
            )

        if attempt < CALLBACK_RETRY_COUNT:
            time.sleep(CALLBACK_RETRY_DELAY_SECONDS)

    logger.error(
        "[%s] All %d callback POST attempts to %s failed — result is lost for this analysis",
        analysis_id, CALLBACK_RETRY_COUNT, callback_url,
    )


def _run_inference_and_callback(
    images: Dict[str, Image.Image],
    quiz: QuizScores,
    user_notes: Optional[str],
    analysis_id: str,
    callback_url: str,
    secret: str,
) -> None:
    """Background task: run model inference + fusion, then POST result to callback_url."""
    task_start = time.monotonic()

    # Use a timer thread for timeout observability (warning only, not a hard kill)
    timeout_fired = threading.Event()

    def _timeout_warning():
        timeout_fired.set()
        logger.warning(
            "[%s] Background task has been running for over %ds — possible hang",
            analysis_id, BACKGROUND_TASK_TIMEOUT_SECONDS,
        )

    timer = threading.Timer(BACKGROUND_TASK_TIMEOUT_SECONDS, _timeout_warning)
    timer.daemon = True
    timer.start()

    try:
        skin_started = time.perf_counter()
        skin_session = onnxruntime.InferenceSession(skin_model_path, providers=["CPUExecutionProvider"])
        try:
            skin_results = [
                run_classifier(skin_session, images[name], skin_preprocessing, skin_labels)
                for name in ("front", "left_profile", "right_profile")
            ]
        finally:
            logger.info("Skin type model load+inference took %.3fs", time.perf_counter() - skin_started)
            del skin_session
            gc.collect()

        acne_started = time.perf_counter()
        acne_session = onnxruntime.InferenceSession(acne_model_path, providers=["CPUExecutionProvider"])
        try:
            acne_results = [
                run_classifier(acne_session, images[name], acne_preprocessing, acne_labels)
                for name in ("forehead_closeup", "left_cheek_closeup", "right_cheek_closeup")
            ]
        finally:
            logger.info("Acne severity model load+inference took %.3fs", time.perf_counter() - acne_started)
            del acne_session
            gc.collect()

        fused = fuse_scores(quiz, skin_results, acne_results)
        skin_type = predict_skin_type(fused["final_scores"])

        response = AnalyzeResponse(
            analysis_id=analysis_id,
            skin_type=skin_type,
            sensitive=fused["final_scores"]["sensitivity_score"] >= 60,
            confidence=fused["confidence"],
            disagreement=fused["disagreement"],
            final_scores=fused["final_scores"],
            raw_debug=fused["raw_debug"],
            user_notes=user_notes,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        elapsed = time.monotonic() - task_start
        logger.info(
            "[%s] Inference completed in %.3fs: skin_type=%s confidence=%.3f",
            analysis_id, elapsed, skin_type, response.confidence,
        )

        _post_callback(callback_url, response.model_dump(), secret, analysis_id)

    except Exception:
        elapsed = time.monotonic() - task_start
        logger.exception("[%s] Background inference task failed after %.3fs", analysis_id, elapsed)
    finally:
        timer.cancel()


@app.post("/analyze", status_code=202)
async def analyze(
    background_tasks: BackgroundTasks,
    front: Optional[UploadFile] = File(default=None),
    left_profile: Optional[UploadFile] = File(default=None),
    right_profile: Optional[UploadFile] = File(default=None),
    forehead_closeup: Optional[UploadFile] = File(default=None),
    left_cheek_closeup: Optional[UploadFile] = File(default=None),
    right_cheek_closeup: Optional[UploadFile] = File(default=None),
    quiz_scores: str = Form(...),
    user_notes: Optional[str] = Form(default=None),
    analysis_id: str = Form(...),
    callback_url: str = Form(...),
    x_internal_secret: Optional[str] = Header(default=None, alias="X-Internal-Secret"),
):
    # ---------- synchronous validation (fail fast, before 202) ----------
    logger.info("[%s] Analyze request received", analysis_id)

    if not secrets.compare_digest(x_internal_secret or "", ml_service_secret or ""):
        logger.error("[%s] Analyze request rejected: unauthorized", analysis_id)
        raise HTTPException(status_code=401, detail="Unauthorized")

    if user_notes is not None and len(user_notes) > 500:
        raise bad_request("user_notes must be 500 characters or fewer")

    _validate_callback_url(callback_url)

    try:
        parsed_quiz = json.loads(quiz_scores)
        quiz = QuizScores.model_validate(parsed_quiz)
    except json.JSONDecodeError as exc:
        logger.error("[%s] Analyze request rejected: malformed quiz_scores JSON", analysis_id)
        raise bad_request("Malformed quiz_scores JSON") from exc
    except Exception as exc:
        logger.error("[%s] Analyze request rejected: invalid quiz_scores: %s", analysis_id, exc)
        raise bad_request(f"Invalid quiz_scores: {exc}") from exc

    uploads = {
        "front": front,
        "left_profile": left_profile,
        "right_profile": right_profile,
        "forehead_closeup": forehead_closeup,
        "left_cheek_closeup": left_cheek_closeup,
        "right_cheek_closeup": right_cheek_closeup,
    }
    images: Dict[str, Image.Image] = {}
    for field_name, upload in uploads.items():
        images[field_name] = await validate_image(
            upload,
            field_name,
            require_face=field_name in FACE_REQUIRED_FIELDS,
        )

    # ---------- validation passed — schedule background inference ----------
    background_tasks.add_task(
        _run_inference_and_callback,
        images=images,
        quiz=quiz,
        user_notes=user_notes,
        analysis_id=analysis_id,
        callback_url=callback_url,
        secret=ml_service_secret,
    )

    logger.info("[%s] Validation passed, inference scheduled in background", analysis_id)
    return JSONResponse(
        status_code=202,
        content={"status": "processing", "analysis_id": analysis_id},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7860)
