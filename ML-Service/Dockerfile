FROM python:3.11-slim AS trainer
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY train.py .
COPY data/ ./data/
RUN python train.py

FROM python:3.11-slim
WORKDIR /app
COPY --from=trainer /app/model/ ./model/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]