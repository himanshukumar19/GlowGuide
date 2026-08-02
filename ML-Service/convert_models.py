"""Export the classifiers as dynamically quantized INT8 ONNX models."""

import json
import shutil
from pathlib import Path

from optimum.onnxruntime import ORTModelForImageClassification, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from transformers import AutoImageProcessor


ROOT = Path(__file__).parent
MODELS = {
    "skin_type": "dima806/skin_types_image_detection",
    "acne_severity": "imfarzanansari/skintelligent-acne",
}


def processor_config(processor: AutoImageProcessor) -> dict:
    size = processor.size
    if isinstance(size, int):
        height = width = size
    else:
        height = size.get("height", size.get("shortest_edge"))
        width = size.get("width", size.get("shortest_edge"))

    return {
        "input_size": {"height": int(height), "width": int(width)},
        "mean": [float(value) for value in processor.image_mean],
        "std": [float(value) for value in processor.image_std],
        "resample": str(processor.resample),
    }


def convert(name: str, model_id: str) -> None:
    output_dir = ROOT / "models" / name
    output_dir.mkdir(parents=True, exist_ok=True)

    processor = AutoImageProcessor.from_pretrained(model_id)
    model = ORTModelForImageClassification.from_pretrained(model_id, export=True)
    model.save_pretrained(output_dir)

    model_path = output_dir / "model.onnx"
    quantizer = ORTQuantizer.from_pretrained(model)
    quantized_dir = output_dir / "quantized"
    quantized_dir.mkdir(exist_ok=True)
    quantizer.quantize(
        save_dir=quantized_dir,
        quantization_config=AutoQuantizationConfig.arm64(
            is_static=False,
            per_channel=False,
        ),
    )
    quantized_path = quantized_dir / "model_quantized.onnx"
    quantized_path.replace(model_path)
    shutil.rmtree(quantized_dir)
    precision = "int8"

    (output_dir / "preprocessing.json").write_text(
        json.dumps(processor_config(processor), indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Saved {precision} ONNX model: {model_path}")


if __name__ == "__main__":
    for model_name, model_id in MODELS.items():
        convert(model_name, model_id)
