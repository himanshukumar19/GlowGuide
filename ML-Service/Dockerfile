FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
# Exporting requires PyTorch, but it must never leak into the runtime stage.
# Use the CPU index as the primary index so pip cannot select the CUDA build.
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple \
    torch==2.7.1
RUN pip install --no-cache-dir -r requirements.txt

COPY convert_models.py ./
RUN python convert_models.py

FROM python:3.11-slim

WORKDIR /app
COPY requirements-runtime.txt .
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    onnxruntime \
    pillow \
    numpy \
    'opencv-python-headless>=4.10,<5' \
    python-multipart

COPY --from=builder /app/models ./models
COPY main.py fusion.py schemas.py ./

EXPOSE 7860
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
