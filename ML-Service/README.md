# GlowGuide ML Service

This is the image-and-quiz fusion service for GlowGuide Skin Analysis. It uses two Hugging Face image classifiers and is deployed as a Docker SDK Space on Hugging Face Spaces. The Docker build downloads both models into an image layer, so inference does not download models at runtime.

## Local Run

From this directory:

```bash
export ML_SERVICE_SECRET="a-local-secret"
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7860
```

The first local startup downloads the models unless they are already cached. Add six real face images to `sample_images/` using these names:

```text
front.jpg
left_profile.jpg
right_profile.jpg
forehead_closeup.jpg
left_cheek_closeup.jpg
right_cheek_closeup.jpg
```

Each image must be a JPG, PNG, or WebP, at least 480x480, no larger than 8MB, and contain a detectable face. Export the same secret for the service and test script, then run:

```bash
export ML_SERVICE_SECRET="a-local-secret"
python test_analyze.py
```

The test script and sample images are ignored by Git. Placeholder drawings will not pass face detection; use photographs or other genuine face images.

## API

`POST /analyze` requires the `X-Internal-Secret` header and a `multipart/form-data` body. The six image fields are required:

```text
front
left_profile
right_profile
forehead_closeup
left_cheek_closeup
right_cheek_closeup
```

The `quiz_scores` field is a JSON string containing seven numbers from 0 to 100:

```json
{
  "sebum_level": 65,
  "hydration_level": 50,
  "acne_frequency": 45,
  "pore_size": 55,
  "sensitivity_score": 30,
  "roughness_score": 40,
  "tightness_score": 30
}
```

`user_notes` is optional and is returned unchanged. It is limited to 500 characters and is not processed by this service.

Successful responses have this shape:

```json
{
  "skin_type": "combination",
  "sensitive": false,
  "confidence": 0.9,
  "disagreement": false,
  "final_scores": {
    "sebum_level": 61.2,
    "hydration_level": 50,
    "acne_frequency": 47.5,
    "pore_size": 55,
    "sensitivity_score": 30,
    "roughness_score": 40,
    "tightness_score": 30
  },
  "raw_debug": {
    "quiz_oiliness": 65,
    "image_oiliness": 55.5,
    "quiz_acne": 45,
    "image_acne": 50,
    "skin_type_probabilities": {"oily": 0.5, "normal": 0.3, "dry": 0.2},
    "acne_probabilities": {"mild": 0.7, "severe": 0.3}
  },
  "user_notes": null,
  "timestamp": "2026-08-01T00:00:00+00:00"
}
```

Validation failures return `400` with a field-specific message. Missing or invalid secrets return `401 Unauthorized`. Model failures return `500`.

## Hugging Face Spaces Deployment

1. Sign in to Hugging Face and choose **New Space**.
2. Choose a Space name, select **Docker** as the SDK, and choose **Public** visibility.
3. Create the Space. On its page, open **Settings**, add `ML_SERVICE_SECRET` under **Secrets** (not Variables), and set a strong random value.
4. Keep the Space git URL from the **Files** or **Settings** page. It will look like `https://huggingface.co/spaces/<account>/<space>.git`.
5. From the GlowGuide repository, verify the branch and add the Space as a separate remote:

```bash
git remote add hf-ml https://huggingface.co/spaces/<account>/<space>.git
```

6. Push only the `ML-Service` directory contents. The safest monorepo deployment method is a temporary subtree branch:

```bash
git subtree split --prefix ML-Service -b hf-ml-deploy
git push hf-ml hf-ml-deploy:main
git branch -D hf-ml-deploy
```

The Space receives `Dockerfile` at its repository root, which is required by the Docker SDK. Hugging Face then builds the image, downloads both models during the build, and starts Uvicorn on port `7860`.

7. After the Space finishes building, copy its public URL into the Next.js `ML_SERVICE_URL` environment variable. The Next.js backend must send the same secret value in the `X-Internal-Secret` header. Set `ML_SERVICE_SECRET` to that same value in Vercel later. Do not expose it as a `NEXT_PUBLIC_` variable.

8. For future deployments, commit the intended ML-Service changes in the main repository and repeat the subtree split/push commands. If the `hf-ml` remote already exists, do not add it again.

The free CPU Space can sleep between requests. The first request after sleep can take roughly 20–30 seconds while the container starts.
