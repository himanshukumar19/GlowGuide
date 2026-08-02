"""Compare the original float32 Hugging Face models with deployed INT8 ONNX models.

Usage:
    python compare_accuracy.py [IMAGE_FOLDER]

If IMAGE_FOLDER is missing or empty, 12 deterministic augmented images are
generated from the available sample face image. These fixtures vary lighting,
contrast, rotation, crop, and color balance, but they are not a substitute for
a real validation set. More diverse test images, including different faces,
angles, skin tones, and lighting conditions, produce a more reliable comparison.
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import onnxruntime
from PIL import Image, ImageEnhance, ImageOps
from transformers import pipeline


ROOT = Path(__file__).parent
DEFAULT_IMAGE_DIR = ROOT / "test_images"
DEFAULT_OUTPUT = ROOT / "accuracy_comparison_results.json"
SKIN_MODEL_ID = "dima806/skin_types_image_detection"
ACNE_MODEL_ID = "imfarzanansari/skintelligent-acne"
MODEL_CONFIG = {
    "skin_type": {"model_id": SKIN_MODEL_ID},
    "acne_severity": {"model_id": ACNE_MODEL_ID},
}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def generate_test_images(image_dir: Path) -> None:
    image_dir.mkdir(parents=True, exist_ok=True)
    if list_images(image_dir):
        return

    source_dir = ROOT / "sample_images"
    source_paths = list_images(source_dir)
    if not source_paths:
        raise SystemExit(
            f"No test images found in {image_dir} and no source face images found in {source_dir}"
        )

    source = Image.open(source_paths[0]).convert("RGB")
    variants = [
        ("baseline", lambda image: image),
        ("bright", lambda image: ImageEnhance.Brightness(image).enhance(1.25)),
        ("dim", lambda image: ImageEnhance.Brightness(image).enhance(0.72)),
        ("contrast", lambda image: ImageEnhance.Contrast(image).enhance(1.35)),
        ("low_contrast", lambda image: ImageEnhance.Contrast(image).enhance(0.72)),
        ("warm", lambda image: ImageEnhance.Color(image).enhance(1.35)),
        ("desaturated", lambda image: ImageEnhance.Color(image).enhance(0.55)),
        ("sharp", lambda image: ImageEnhance.Sharpness(image).enhance(1.8)),
        ("soft", lambda image: ImageEnhance.Sharpness(image).enhance(0.45)),
        ("rotate_left", lambda image: image.rotate(7, resample=Image.Resampling.BICUBIC, expand=False)),
        ("rotate_right", lambda image: image.rotate(-7, resample=Image.Resampling.BICUBIC, expand=False)),
        ("crop", lambda image: ImageOps.fit(image, (image.width, image.height), centering=(0.42, 0.5))),
    ]
    for name, transform in variants:
        transformed = transform(source)
        transformed.save(image_dir / f"sample_{name}.jpg", quality=95)
    print(f"Generated {len(variants)} augmented images in {image_dir}")


def list_images(directory: Path) -> list[Path]:
    if not directory.exists():
        return []
    return sorted(path for path in directory.iterdir() if path.suffix.lower() in IMAGE_EXTENSIONS)


def load_metadata(model_dir: Path) -> tuple[onnxruntime.InferenceSession, dict, list[str]]:
    with (model_dir / "config.json").open(encoding="utf-8") as handle:
        config = json.load(handle)
    with (model_dir / "preprocessing.json").open(encoding="utf-8") as handle:
        preprocessing = json.load(handle)
    labels = [str(config["id2label"][str(index)]) for index in range(len(config["id2label"]))]
    session = onnxruntime.InferenceSession(
        str(model_dir / "model.onnx"),
        providers=["CPUExecutionProvider"],
    )
    return session, preprocessing, labels


def softmax(logits: np.ndarray) -> np.ndarray:
    values = logits.astype(np.float32).reshape(-1)
    probabilities = np.exp(values - np.max(values))
    return probabilities / probabilities.sum()


def onnx_probabilities(
    session: onnxruntime.InferenceSession,
    image: Image.Image,
    preprocessing: dict,
    labels: list[str],
) -> dict[str, float]:
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
    logits = session.run(None, {input_name: input_array})[0][0]
    probabilities = softmax(logits)
    return {label: float(probability) for label, probability in zip(labels, probabilities)}


def pipeline_probabilities(classifier: Any, image: Image.Image) -> dict[str, float]:
    return {str(item["label"]): float(item["score"]) for item in classifier(image, top_k=None)}


def confidence(probabilities: dict[str, float]) -> float:
    return max(probabilities.values())


def compare_model(
    name: str,
    image_paths: list[Path],
    original_classifier: Any,
    onnx_session: onnxruntime.InferenceSession,
    preprocessing: dict,
    labels: list[str],
) -> tuple[list[dict], dict]:
    records = []
    absolute_deltas: list[tuple[float, str, str]] = []
    mismatches = 0

    for image_path in image_paths:
        image = Image.open(image_path).convert("RGB")
        original = pipeline_probabilities(original_classifier, image)
        quantized = onnx_probabilities(onnx_session, image, preprocessing, labels)
        all_labels = list(dict.fromkeys([*original, *quantized]))
        deltas = {
            label: quantized.get(label, 0.0) - original.get(label, 0.0)
            for label in all_labels
        }
        original_label = max(original, key=original.get)
        quantized_label = max(quantized, key=quantized.get)
        mismatch = original_label != quantized_label
        mismatches += int(mismatch)
        for label, delta in deltas.items():
            absolute_deltas.append((abs(delta), image_path.name, label))

        warning = " [WARNING: LABEL MISMATCH]" if mismatch else ""
        print(f"\n{name} | {image_path.name}{warning}")
        print(f"  label: float32={original_label} | int8={quantized_label}")
        print(f"  confidence: float32={confidence(original):.8f} | int8={confidence(quantized):.8f} | delta={confidence(quantized) - confidence(original):+.8f}")
        print("  probabilities:")
        for label in all_labels:
            print(f"    {label}: float32={original.get(label, 0.0):.8f} | int8={quantized.get(label, 0.0):.8f} | delta={deltas[label]:+.8f}")

        records.append({
            "image": image_path.name,
            "float32": {"label": original_label, "probabilities": original, "confidence": confidence(original)},
            "int8": {"label": quantized_label, "probabilities": quantized, "confidence": confidence(quantized)},
            "probability_deltas": deltas,
            "label_mismatch": mismatch,
        })

    average_delta = sum(delta for delta, _, _ in absolute_deltas) / len(absolute_deltas)
    maximum_delta = max(absolute_deltas)
    summary = {
        "total_images": len(image_paths),
        "label_mismatches": mismatches,
        "mismatch_percentage": mismatches / len(image_paths) * 100,
        "average_absolute_probability_delta": average_delta,
        "maximum_absolute_probability_delta": maximum_delta[0],
        "maximum_delta_image": maximum_delta[1],
        "maximum_delta_class": maximum_delta[2],
        "verdict": "PASS" if mismatches == 0 and average_delta < 0.05 else "WARN",
    }
    return records, summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image_folder", nargs="?", type=Path, default=DEFAULT_IMAGE_DIR)
    parser.add_argument("--onnx-dir", type=Path, default=ROOT / "models")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    generate_test_images(args.image_folder)
    image_paths = list_images(args.image_folder)
    if len(image_paths) < 10:
        raise SystemExit(f"At least 10 test images are required; found {len(image_paths)}")

    original_classifiers = {
        name: pipeline("image-classification", model=details["model_id"], device=-1)
        for name, details in MODEL_CONFIG.items()
    }
    onnx_models = {
        name: load_metadata(args.onnx_dir / name)
        for name in MODEL_CONFIG
    }

    results = {}
    summaries = {}
    for name in MODEL_CONFIG:
        records, summary = compare_model(
            name,
            image_paths,
            original_classifiers[name],
            onnx_models[name][0],
            onnx_models[name][1],
            onnx_models[name][2],
        )
        results[name] = records
        summaries[name] = summary

    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "test_image_folder": str(args.image_folder),
        "model_versions": {
            "skin_type": {"original": SKIN_MODEL_ID, "quantized": "dynamic_int8_arm64"},
            "acne_severity": {"original": ACNE_MODEL_ID, "quantized": "dynamic_int8_arm64"},
        },
        "quantization": "dynamic INT8 via ORTQuantizer AutoQuantizationConfig.arm64",
        "results": results,
        "summary": summaries,
    }
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print("\n=== SUMMARY ===")
    for name, summary in summaries.items():
        print(f"{name}:")
        print(f"  images tested: {summary['total_images']}")
        print(f"  label mismatches: {summary['label_mismatches']} ({summary['mismatch_percentage']:.2f}%)")
        print(f"  average absolute probability delta: {summary['average_absolute_probability_delta']:.8f}")
        print(f"  maximum absolute probability delta: {summary['maximum_absolute_probability_delta']:.8f} ({summary['maximum_delta_image']} / {summary['maximum_delta_class']})")
        print(f"  verdict: {summary['verdict']}")
        if summary["verdict"] == "PASS":
            print("  explanation: no labels changed and the average probability shift is below 0.05.")
        else:
            print("  explanation: quantization changed labels or shifted probabilities beyond the 0.05 reliability threshold; validate on a more diverse labeled set before production.")
    print(f"\nSaved full results to {args.output}")


if __name__ == "__main__":
    main()
