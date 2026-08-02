# GlowGuide — Skin Analysis Feature: Architecture Reference

This document is the single source of truth for the skin-analysis feature build. Attach this to any OpenCode prompt related to this feature so context doesn't need to be re-explained each time.

---

## 1. High-Level Flow

```
User → Quiz (13 questions) + Optional Photos (6 images, live capture or gallery upload)
     → Single combined POST /api/skin-analysis (Next.js API route)
        → Forwards images + quiz scores to ML-Service (/analyze, HF Space)
           → ML-Service runs 2 pretrained HF models + fuses with quiz scores
           → Returns fused skin_type, sensitive, acne data, disagreement flag
        → Next.js route uploads images to Cloudinary
        → Next.js route saves full result to Firestore "analyses" collection
        → Next.js route computes concerns (existing concerns.ts, now fed fused scores)
        → Product retrieval: query own Firestore "products" catalog, score/filter
        → LLM (Gemini Flash primary) generates routine using ONLY retrieved products
           (schema-enum-constrained, validated against catalog before returning)
     → Final result shown on dashboard (skin type, concerns, routine, progress vs previous)
```

Re-analysis is user-triggered anytime (button), not automatic. Chatbot (existing RAG system) stays fully separate — does not read skin profile.

---

## 2. Phase Breakdown

| Phase | Scope | Status |
|---|---|---|
| 1a | ML-Service backend rebuild (models, fusion, Docker, HF Space deploy) | Prompt written, pending execution |
| 1b | Next.js `route.ts` update — accept images, forward to ML-Service, new fallback | Not started |
| 2a | Quiz UI — add 6 new "About You" questions | Not started |
| 2b | Camera/Upload UI — live capture + MediaPipe angle detection, gallery upload, validation, consent | Not started |
| 3 | Product retrieval — scoped query + scoring against Firestore "products" | Not started |
| 4 | LLM recommendation generation — replaces `generateRoutine()` internals | Not started |
| 5/6 | Orchestration + Firestore/Cloudinary storage, comparison/delta logic | Not started |

---

## 3. Model Details (Phase 1)

**Skin type classifier:** `dima806/skin_types_image_detection` (HF, ViT-based) — outputs oily/dry/normal probabilities.

**Acne severity classifier:** `imfarzanansari/skintelligent-acne` (HF, ViT-based) — outputs severity-class probabilities. Exact label strings to be confirmed at runtime (logged on startup).

Both are single-image-in, probability-list-out. No batching. Called 3x each per analysis (6 images total, 3 per model).

**Combination and Sensitive skin types are NOT determined by images** — combination comes from quiz oilyScore/dryScore comparison (existing logic), sensitive comes from quiz `sensitivity_score >= 60` only. Images only inform the oily/dry/normal axis and acne severity.

---

## 4. Fusion Logic (quiz + image → final scores)

```python
image_oiliness_score = (oily_prob * 100) + (normal_prob * 50) + (dry_prob * 0)
final_sebum_level = (quiz.sebum_level * 0.6) + (image_oiliness_score * 0.4)
final_acne_frequency = (quiz.acne_frequency * 0.5) + (image_acne_score * 0.5)
# hydration_level, pore_size, sensitivity_score, roughness_score, tightness_score: quiz-only, unchanged

disagreement = abs(quiz.sebum_level - image_oiliness_score) > 30
confidence = 1.0 - (0.3 if disagreement else 0) - (0.1 if any model's top prob < 0.5 else 0)
```

Skin type / sensitive / combination determination reuses the **existing** `getSkinTypeFromAnswers()` weighted-scoring logic from `src/data/quizData.ts`, just fed `final_sebum_level` instead of raw quiz-only sebum.

---

## 5. Removed / Deprecated

- **RandomForest classifier** (`ML-Service/train.py`, `model.pkl`, `label_encoder.pkl`, `data/ultimate_skin_type_dataset.csv`) — fully removed, replaced by image+quiz fusion above.
- **NLP keyword-adjustment logic** (`NLP_KEYWORD_MAP`, `apply_nlp_adjustments()`) — dropped entirely. `user_notes` free text now passes raw to the LLM (Phase 4) instead of adjusting feature scores.
- **17 RandomForest-only derived features** (ph_level, skin_temperature, wrinkle_score, elasticity_score, sun_exposure_hours, pollution_exposure_index, water_intake_liters, sleep_hours, etc.) — removed, nothing downstream consumes them.

## 6. Kept Unchanged

- **7 core quiz questions** (`src/data/quizData.ts`) — sebum_level, hydration_level, acne_frequency, pore_size, sensitivity_score, roughness_score, tightness_score. Not modified.
- **`concerns.ts`** 7-concern scoring system (Acne, Oiliness, Dryness, Sensitivity, Uneven Texture, Pigmentation, Aging) — kept as-is, now fed fused scores instead of quiz-only scores as input.
- **`analysisResultSchema` / `analysisSourceEnum`** (`src/lib/schemas/analysis.ts`) — kept, extended (see Section 8). `source` enum stays `"ml-service" | "fallback"`, no new value needed.
- **`routineRecommendationSchema`** shape (`{ morning: RoutineStep[], night: RoutineStep[] }`) — kept unchanged. Only how it's populated changes (LLM+retrieval instead of static rules), so dashboard UI needs zero changes.

---

## 7. New Quiz Questions (Phase 2a) — "About You" section

Added as a **separate section** after the existing 7 physiology questions, with its own progress indicator. Age + pregnancy are non-skippable; others are skippable.

| Question | Options | Purpose |
|---|---|---|
| Age range | Teen(13-19) / 20s / 30s / 40s / 50+ | Unlocks `senior` category products |
| Gender | Male / Female / Prefer not to say | Unlocks `suitableFor` matching |
| Pregnant or breastfeeding? | Yes / No / Prefer not to say | **Safety-critical** — hard-excludes retinol/vitamin-A products |
| Fragrance preference | Fragrance-free only / No preference | Hard filter on `fragrance-free` badge |
| Budget range | Under ₹500 / ₹500-1500 / ₹1500-3000 / No preference | Hard filter on `price` field |
| Allergies/ingredients to avoid | Free text, optional | Passed to LLM as hard exclusion list |

Currently the app collects **zero demographic data** anywhere — these are fully new fields, need new TypeScript types + Zod schema additions.

---

## 8. Firestore Schema (extends existing, doesn't replace)

Existing `analysisSchema` (`src/lib/schemas/analysis.ts`) already has the right shape. Extend it:

```typescript
// Existing fields kept as-is: id, customerId, quizAnswers, skinNotes, photoUrls, result, source, createdAt

// ADD to analysisSchema:
userProfile: {
  age_range: string;
  gender: string | null;
  pregnant_or_breastfeeding: boolean | null;
  fragrance_preference: string;
  budget_range: string | null;
  allergies: string | null;
}

// ADD to analysisResultSchema (currently: skinType, concerns, healthScore, confidence, probabilities, routine):
sensitive: boolean;
disagreement: boolean;
rawScores: {
  quiz_oiliness: number; image_oiliness: number; final_oiliness: number;
  quiz_acne: number; image_acne: number; final_acne: number;
}
```

**Storage strategy (hybrid):**
- **Firestore `analyses` documents:** full history kept forever (cheap, ~KB per doc). Existing `listAnalysesByCustomer()`, `countAnalysesByCustomer()` already support this.
- **Cloudinary images:** only current + previous analysis's photos kept. When a 3rd+ analysis completes, oldest photo set is deleted from Cloudinary; that old Firestore doc's `photoUrls` becomes empty, but the doc (scores/result) stays.
- **"Current" = latest by `createdAt`**, no special flag needed — just `orderBy createdAt desc limit 1` (or `limit 2` for current+previous comparison).
- Cloudinary folder convention: `glowguide/analyses/{analysisId}/{photoIndex}` (matches existing `glowguide/products/{id}/...` pattern). Upload is server-side only (existing `uploadImageBuffer` in `src/lib/cloudinary.ts`, currently hardcoded to products — needs generalizing to accept a folder param).
- `customer.skinProfile.{skinType, concerns}` kept as a lightweight denormalized copy of the latest result (other components may already read from here).

---

## 9. Concern Vocabulary Mapping (analysis concerns → product tags)

Product catalog uses free-text `concerns` tags (48 unique across 32 products); analysis pipeline uses 7 fixed PascalCase names. No mapping existed before — this is new:

| Analysis Concern | Product tags it matches |
|---|---|
| Acne | acne, breakouts, blackheads, whiteheads, clogged pores, acne marks, post-acne repair |
| Oiliness | excess oil, shine |
| Dryness | dryness, dehydration, dry lips, chapped lips, moisturizing, gentle moisturizing |
| Sensitivity | sensitivity, sensitive skin, redness, irritation, gentle cleansing, weakened skin barrier, damaged skin barrier, barrier damage |
| Uneven Texture | uneven texture, rough texture, texture, uneven skin texture, smooth skin, enlarged pores |
| Pigmentation | dullness, dark spots, uneven skin tone, uneven tone, pigmentation, hyperpigmentation, loss of radiance |
| Aging | aging, fine lines, wrinkles, loss of firmness, loss of elasticity, early signs of aging, skin rejuvenation |

Not mapped (functional tags, ignored in concern-scoring): sun protection, hair removal, daily cleansing, complete baby care, travel convenience.

---

## 10. Product Retrieval Logic (Phase 3)

```python
for product in all_products (32 total, fetched once, filtered in-memory):
    if product.category not in ["men-women", "korean"]: skip  # exclude children/senior/laser-devices by default (no demographic data to match yet)
    if product.stockCount == 0: skip
    if user.pregnant and product has retinol/vitamin-A tags: HARD EXCLUDE
    if user.fragrance_preference == "fragrance-free only" and "fragrance-free" not in product.badges: skip
    if user.budget_range set and product.price outside range: skip

    score = 0
    if user.skin_type in product.skinTypes: score += 3
    if user.sensitive and "sensitive" in product.skinTypes: score += 2
    for concern in user.detected_concerns (severity >= 20):
        mapped_tags = CONCERN_MAP[concern.name]  # Section 9 table
        if any(tag in product.concerns for tag in mapped_tags):
            score += (concern.severity / 20)

group by subcategory, take top 1-2 per subcategory (ensures full routine coverage, not all one type)
```

`suitableFor` (men/women/teens/adults/seniors/children) currently **unusable** — no demographic data collected until Phase 2a ships. Once age/gender exist, this can be added as another filter.

---

## 11. LLM Recommendation (Phase 4)

- **Primary model:** Gemini 2.5 Flash (cheap, large context, reliable structured JSON, generous free tier — good fit for routine-generation batch calls)
- **Fallback chain:** Groq (Llama 3.3 70B, for live chat) → Gemini Flash (routine gen) → OpenRouter (safety net) — existing pattern, just re-prioritized by task
- **Constraint mechanism:** retrieval scoped to only GlowGuide's own catalog (Section 10) + system prompt explicitly restricting to `PRODUCT_LIST` + **schema-enum-constrained** `product_id` field (structurally impossible to hallucinate) + post-generation validation against DB before rendering to user
- **Safety constraints passed to system prompt:** pregnancy status (exclude retinol), allergies (hard exclusion list)
- **Output populates existing `routineRecommendationSchema`** — same shape dashboard already renders, so no frontend changes needed. This becomes the single, sole routine shown (replaces the old rule-based `generateRoutine()` internals, not the schema).
- **Progress/comparison:** when a previous analysis exists, delta is computed per metric (`stable`/`improved`/`worsened`, threshold ±8), passed into the LLM prompt so the routine can reference progress explicitly.

---

## 12. Image Capture Spec (Phase 2b)

6 images required: front (straight), left_profile (~45°), right_profile (~45°), forehead_closeup, left_cheek_closeup, right_cheek_closeup.

- **Live capture:** MediaPipe Face Mesh (browser-side, `@mediapipe/tasks-vision`) for real-time yaw-angle detection + live guidance overlay per shot type.
- **Gallery upload:** same validation applied post-upload (not live) — face-detect, angle, blur/brightness. On failure: retake (re-pick from gallery) or switch to live capture, user's choice.
- **Limits:** max 8MB/image, min 480×480px, jpg/png/webp only. Enforced both client-side (UX) and server-side (safety net, in ML-Service).
- **Also required:** consent screen before first capture, non-medical disclaimer, cold-start loading message ("waking up the analyzer, ~30 sec" — HF free tier sleeps after inactivity).

---

## 13. Security

- ML-Service `/analyze` endpoint protected by shared-secret header (`X-Internal-Secret`, compared via `secrets.compare_digest`), env var `ML_SERVICE_SECRET` set as a Secret in both HF Space settings and Vercel env vars. Public HF Space URL is discoverable but unusable without the secret.
- Actual user-facing auth (Firebase Auth) enforced at the Next.js `route.ts` layer, before it ever calls ML-Service.

---

## 14. Deployment

- **Platform:** Render (free tier, 512MB RAM) — switched from the original HF Spaces plan because HF Spaces now requires a PRO subscription for Docker SDK. Render's free tier requires no credit card and was confirmed sufficient after memory optimization (see below).
- **Live URL:** `https://glowguide-ml-service.onrender.com` — deployed and verified working (Phase 1a complete).
- **Memory optimization journey:** initial float32 image was 2.83GB with 952MB peak RAM (too large for 512MB free tier). Applied ONNX conversion + float16, then sequential model loading, then INT8 quantization on both models — final result: 909MB image, 242MB peak RAM, well under the 512MB target. Accuracy verified stable throughout via `compare_accuracy.py` (0 label mismatches, small probability deltas).
- **Repo structure:** monorepo — `ML-Service/` is a subfolder of the main GlowGuide repo. Render is configured with Root Directory `ML-Service`, connects directly to the GitHub repo (private), auto-deploys on push to `main`.
- **Setup:** completed manually via Render's dashboard (New Web Service → connect GitHub → configure → add `ML_SERVICE_SECRET` env var → deploy).
- **Health check:** `GET /` endpoint added (no auth required) for Render's health checks and quick manual verification — returns `{"status": "ok", "service": "GlowGuide ML Service", "version": "3.0.0"}`.

---

## 15. Testing

- Phase 1: `ML-Service/test_analyze.py` — sends sample images + quiz scores to a local instance, prints response. Gitignored (test script + any sample images), not shipped in the Docker image.
- No automated CI/CD testing scoped yet — manual verification per phase.

---

## 16. Existing Codebase Reference Facts

**Tech stack:** Next.js ^14.2.15 (App Router), React ^18.3.1, TypeScript ^5.8.3, Tailwind CSS ^3.4.17, shadcn/ui (Radix primitives), Zustand + TanStack Query for state, Firebase Auth.

**Existing `src/app/api/skin-analysis/route.ts` behavior (Phase 1b modifies this, doesn't replace from scratch):**
- `ML_SERVICE_URL` env var (defaults to `http://localhost:8000`, will need updating to the new HF Space URL + port 7860)
- `FORCE_FALLBACK` env var — if `"true"`, skips ML service entirely, goes straight to local fallback
- Calls ML service via `axios.post(`${ML_SERVICE_URL}/predict`, payload, { timeout: 25000 })` — endpoint path changes to `/analyze`, payload changes from JSON-only to multipart (images added), and this axios call needs the new `X-Internal-Secret` header added
- **Fallback logic:** if ML service is down (5xx, timeout, connection error), a local `fallbackClassify()` function computes skin type from quiz answers only, with a hardcoded 0.85 confidence. This needs rewriting to use quiz-only fusion logic (no images) as the degraded path, consistent with the new fusion design — no longer RandomForest-flavored.
- Currently the POST handler hardcodes `photoUrls: []` (line 203) — this is the exact insertion point for the new Cloudinary upload step.

**Existing Cloudinary setup (`src/lib/cloudinary.ts`):**
- Package: `cloudinary` v2.10.0 (Node.js server-side SDK)
- Existing functions: `uploadImageBuffer(buffer, productId)`, `uploadImageFile(filePath, productId)`, `deleteImage(productId)` — all currently **hardcoded to the products folder path** (`glowguide/products/{productId}/...`), need generalizing to accept a folder/resource-type param for the new `glowguide/analyses/{analysisId}/{photoIndex}` convention
- Env vars already set in `.env.local`: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (server-only) — no new Cloudinary credentials needed
- Upload is 100% server-side only (no client-side Cloudinary upload anywhere in the codebase) — client sends FormData to a Next.js API route, which converts to Buffer and calls the SDK server-side. Follow this same pattern for skin-analysis photos.
- Uploads use `overwrite: true` and `resource_type: "image"` directly via the SDK, no upload preset in use despite one being defined in env vars.

---

## 17. Additional Requirements — Nothing Deferred (full scope, timeline is flexible)

Since there's no hard deadline, all of the following are in scope, not cut for a later pass:

**Frontend:**
- Retake/preview step before final submit (per photo)
- Gallery upload fallback alongside live capture (Section 12)
- Consent screen + non-medical disclaimer before first capture
- Cold-start loading state ("waking up the analyzer, ~30 sec")
- Disagreement transparency UI (when quiz vs image disagree, show it honestly rather than hiding it)
- History/trend view on dashboard (enabled naturally by full Firestore history per Section 8)
- Real-time MediaPipe angle-degree detection + live guidance overlay (not simplified/skipped)

**Backend:**
- **Async job pattern:** `/analyze` (or the Next.js orchestration route) returns a job ID immediately; frontend polls a `/status/{job_id}` endpoint rather than blocking on one long synchronous request — needed because 6 images × 2 models + LLM call can take a while, especially with HF cold starts
- Auth-gated endpoint (Firebase Auth required on the Next.js route before it ever calls ML-Service)
- Rate limiting (cap re-analysis frequency per user, e.g. once per day, to protect free-tier compute)
- Basic logging/monitoring of disagreement rates and confidence scores over time (feedback loop, since the fusion system is untested in production)
- Input validation limits (file size, format) enforced server-side as a safety net, not just client-side

---

## 18. Post-Deployment Monitoring & Correction Process

**Why we can't fully validate accuracy pre-launch:** Real-world accuracy validation requires real user photos across diverse skin tones, lighting, ages, and angles — this data doesn't exist until the feature is actually live. Pre-launch testing (Section on accuracy comparison below) used augmented variations of a small sample set, which confirms basic quantization safety (no crashes, no wild prediction shifts) but is NOT a substitute for real-world validation.

**Accuracy comparison tooling (already built):** `ML-Service/compare_accuracy.py` compares the original float32 HuggingFace models against the deployed quantized ONNX models across a batch of test images, producing a PASS/WARN verdict with label-mismatch rates and probability deltas. Results are saved to `ML-Service/accuracy_comparison_results.json` (committed to repo as a permanent record, includes timestamp + model version for tracking over time).

**Pre-launch result (for reference):** 12 augmented images (lighting/rotation/crop/color variations of a limited base set), 0 label mismatches for both models, average probability delta ~0.01, verdict PASS. Known limitation: lacks real diversity (skin tones, real angles, real lighting conditions).

**Future task — re-validate with real data:** Once the feature is live and a reasonable number of real (anonymized, user-consented) analysis photos have been collected, re-run `compare_accuracy.py` against a sample of real user images to get genuine production-confidence accuracy numbers. This should be repeated periodically, not just once.

**How production issues get caught:**
- Disagreement-rate and confidence-score logging (Section 17, backend requirements) surfaces unusual patterns over time — e.g. if disagreement between quiz and image spikes for a subset of users, that's an early signal something may be off (lighting conditions, a specific demographic the model handles poorly, etc.)
- User-facing disagreement transparency (Section 17, frontend requirements) means users see when quiz/image disagree, which can surface complaints/feedback tied to specific accuracy issues

**How to correct an issue if one is found post-deployment (deployment is not a one-way door):**
1. Diagnose: re-run `compare_accuracy.py` with the problematic real photos to confirm and quantify the issue
2. Fix options, roughly in order of effort: (a) adjust fusion weights (Section 4) if the issue is about over/under-trusting image vs quiz, (b) revert the affected model from int8 back to float16 or float32 if quantization is the root cause, (c) swap in a different pretrained model if the current one has a fundamental blind spot, (d) collect more diverse training/comparison data and re-quantize
3. Rebuild the Docker image with the fix
4. Redeploy to Render — this replaces the live version, typically with no downtime (Render rolls out the new deployment)
5. Rollback option: the previous working Docker image/deployment can be redeployed immediately if a fix introduces a new regression — always verify a fix with `compare_accuracy.py` and the existing test suite before considering the incident closed

This is a normal, expected part of running any ML system in production — launch with reasonable pre-launch validation, monitor in production, iterate as real data reveals edge cases. It is not a sign the initial launch was premature.

---

## 19. Open Items / Future (explicitly deferred, not forgotten)

- Exact acne-model label strings — confirmed at runtime via startup logs, may need a small follow-up mapping fix.
- `HealthTrendCharts.tsx` bug: reads concern names lowercase (`"acne"`) while everything else uses PascalCase (`"Acne"`) — pre-existing bug, unrelated to this feature, fix whenever convenient.
- Age/gender-based `suitableFor` product matching — infra supports it once Phase 2a data exists, not wired into retrieval until then.