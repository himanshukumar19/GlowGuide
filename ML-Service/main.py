import os
import re
import joblib
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Constants ─────────────────────────────────────────────────────────────────

MODEL_PATH   = "model/model.pkl"
ENCODER_PATH = "model/label_encoder.pkl"

# All 24 features in the exact order used during training (must match train.py)
ALL_FEATURES = [
    "sebum_level",              # 0–100   | quiz Q1
    "hydration_level",          # 0–100   | quiz Q2
    "ph_level",                 # 4.0–7.5 | derived from sebum + hydration
    "skin_temperature",         # 30–36.5 | derived from sensitivity
    "pore_size",                # 0–100   | quiz Q4
    "oil_shine",                # 0–10    | derived from sebum
    "wrinkle_score",            # 0–10    | derived from hydration
    "roughness_score",          # 0–100   | quiz Q6
    "elasticity_score",         # 20–100  | derived from hydration + tightness
    "sensitivity_score",        # 0–100   | quiz Q5
    "redness_level",            # 0–10    | derived from sensitivity
    "itchiness_score",          # 0–10    | derived from sensitivity + tightness
    "pigmentation_level",       # 0–10    | baseline 3.0, NLP adjustable
    "dark_spot_score",          # 0–10    | baseline 2.5, NLP adjustable
    "uneven_tone_score",        # 0–10    | derived from roughness
    "acne_frequency",           # 0–100   | quiz Q3
    "blackhead_score",          # 0–10    | derived from sebum + pore_size
    "whitehead_score",          # 0–10    | derived from acne + sebum
    "tightness_score",          # 0–100   | quiz Q7
    "flakiness_score",          # 0–10    | derived from tightness + hydration
    "sun_exposure_hours",       # 0–10    | baseline 4.0, NLP adjustable
    "pollution_exposure_index",  # 0–100  | baseline 50.0, NLP adjustable
    "water_intake_liters",      # 0.5–5.0 | derived from hydration
    "sleep_hours",              # 3–9     | baseline 7.0, NLP adjustable
]

# Valid range for each feature — used to clamp values after derivation/NLP
FEATURE_BOUNDS: Dict[str, Tuple[float, float]] = {
    "sebum_level":              (0,    100),
    "hydration_level":          (0,    100),
    "ph_level":                 (4.0,  7.5),
    "skin_temperature":         (30.0, 36.5),
    "pore_size":                (0,    100),
    "oil_shine":                (0,    10),
    "wrinkle_score":            (0,    10),
    "roughness_score":          (0,    100),
    "elasticity_score":         (20,   100),
    "sensitivity_score":        (0,    100),
    "redness_level":            (0,    10),
    "itchiness_score":          (0,    10),
    "pigmentation_level":       (0,    10),
    "dark_spot_score":          (0,    10),
    "uneven_tone_score":        (0,    10),
    "acne_frequency":           (0,    100),
    "blackhead_score":          (0,    10),
    "whitehead_score":          (0,    10),
    "tightness_score":          (0,    100),
    "flakiness_score":          (0,    10),
    "sun_exposure_hours":       (0,    10),
    "pollution_exposure_index":  (0,   100),
    "water_intake_liters":      (0.5,  5.0),
    "sleep_hours":              (3,    9),
}


def clamp(value: float, feature: str) -> float:
    """Clamp value to that feature's valid dataset range."""
    lo, hi = FEATURE_BOUNDS[feature]
    return max(lo, min(hi, value))


# ── NLP Keyword Map ───────────────────────────────────────────────────────────
# Each keyword maps to (feature_name, adjustment) in that feature's own scale.
# Adjustments are intentionally small — they nudge, not override, quiz answers.

NLP_KEYWORD_MAP: Dict[str, List[Tuple[str, float]]] = {

    # ── Wrinkles / Aging ─────────────────────────────────────────────────────
    "wrinkle":           [("wrinkle_score", +3.0), ("elasticity_score", -15)],
    "wrinkles":          [("wrinkle_score", +3.0), ("elasticity_score", -15)],
    "fine lines":        [("wrinkle_score", +2.5), ("elasticity_score", -10)],
    "crow's feet":       [("wrinkle_score", +3.0)],
    "aging":             [("wrinkle_score", +2.0), ("elasticity_score", -10)],
    "sagging":           [("elasticity_score", -20)],
    "loose skin":        [("elasticity_score", -15)],

    # ── Dark Spots / Pigmentation ─────────────────────────────────────────────
    "dark spots":        [("dark_spot_score", +3.0), ("pigmentation_level", +2.5), ("uneven_tone_score", +2.5)],
    "dark spot":         [("dark_spot_score", +3.0), ("pigmentation_level", +2.5)],
    "hyperpigmentation": [("pigmentation_level", +3.5), ("dark_spot_score", +2.5), ("uneven_tone_score", +3.0)],
    "melasma":           [("pigmentation_level", +3.5), ("dark_spot_score", +3.0)],
    "discoloration":     [("pigmentation_level", +2.5), ("uneven_tone_score", +2.5)],
    "uneven tone":       [("uneven_tone_score", +3.0), ("pigmentation_level", +2.0)],
    "sun spots":         [("dark_spot_score", +3.0), ("pigmentation_level", +2.0), ("sun_exposure_hours", +1.5)],
    "age spots":         [("dark_spot_score", +3.0), ("pigmentation_level", +2.0)],

    # ── Redness / Sensitivity ─────────────────────────────────────────────────
    "redness":           [("redness_level", +3.0), ("sensitivity_score", +15)],
    "red":               [("redness_level", +2.5), ("sensitivity_score", +10)],
    "rosacea":           [("redness_level", +4.0), ("sensitivity_score", +25)],
    "flushing":          [("redness_level", +2.5), ("sensitivity_score", +15)],
    "irritated":         [("redness_level", +2.0), ("sensitivity_score", +20)],
    "stinging":          [("sensitivity_score", +25), ("redness_level", +2.0)],
    "burning":           [("sensitivity_score", +25), ("redness_level", +2.5)],
    "reactive":          [("sensitivity_score", +20)],

    # ── Dryness / Flaking ─────────────────────────────────────────────────────
    "flaky":             [("flakiness_score", +4.0), ("hydration_level", -20)],
    "flaking":           [("flakiness_score", +4.0), ("hydration_level", -20)],
    "peeling":           [("flakiness_score", +3.5), ("hydration_level", -15)],
    "dry patches":       [("flakiness_score", +3.5), ("hydration_level", -20)],
    "cracked":           [("flakiness_score", +4.0), ("hydration_level", -30)],
    "dehydrated":        [("hydration_level", -25)],
    "tight skin":        [("tightness_score", +20), ("hydration_level", -15)],

    # ── Acne / Breakouts ──────────────────────────────────────────────────────
    "breakout":          [("acne_frequency", +20), ("blackhead_score", +2.0)],
    "breakouts":         [("acne_frequency", +20), ("blackhead_score", +2.0)],
    "acne":              [("acne_frequency", +25), ("blackhead_score", +2.5), ("whitehead_score", +2.0)],
    "pimple":            [("acne_frequency", +15)],
    "pimples":           [("acne_frequency", +20)],
    "blackhead":         [("blackhead_score", +3.5), ("pore_size", +15)],
    "blackheads":        [("blackhead_score", +3.5), ("pore_size", +15)],
    "whitehead":         [("whitehead_score", +3.5)],
    "whiteheads":        [("whitehead_score", +3.5)],
    "clogged pores":     [("blackhead_score", +2.0), ("whitehead_score", +2.0), ("pore_size", +10)],

    # ── Oiliness ──────────────────────────────────────────────────────────────
    "oily":              [("sebum_level", +20), ("oil_shine", +2.0)],
    "greasy":            [("sebum_level", +25), ("oil_shine", +2.5)],
    "shiny":             [("sebum_level", +20), ("oil_shine", +2.0)],
    "glossy":            [("sebum_level", +15), ("oil_shine", +1.5)],

    # ── Itching ───────────────────────────────────────────────────────────────
    "itchy":             [("itchiness_score", +3.0), ("sensitivity_score", +15)],
    "itching":           [("itchiness_score", +3.0), ("sensitivity_score", +15)],

    # ── Texture / Scars ───────────────────────────────────────────────────────
    "rough":             [("roughness_score", +20), ("uneven_tone_score", +2.0)],
    "bumpy":             [("roughness_score", +20)],
    "uneven texture":    [("roughness_score", +15), ("uneven_tone_score", +2.0)],
    "scar":              [("uneven_tone_score", +2.5), ("roughness_score", +15)],
    "scars":             [("uneven_tone_score", +2.5), ("roughness_score", +15)],
    "acne scars":        [("uneven_tone_score", +3.0), ("roughness_score", +20)],

    # ── Large Pores ───────────────────────────────────────────────────────────
    "large pores":       [("pore_size", +25)],
    "enlarged pores":    [("pore_size", +30)],
    "visible pores":     [("pore_size", +20)],

    # ── Sun / Pollution ───────────────────────────────────────────────────────
    "sun damage":        [("sun_exposure_hours", +3.0), ("dark_spot_score", +2.0)],
    "sun damaged":       [("sun_exposure_hours", +3.0), ("dark_spot_score", +2.0)],
    "photodamage":       [("sun_exposure_hours", +4.0), ("dark_spot_score", +2.5)],
    "pollution":         [("pollution_exposure_index", +20)],
    "city skin":         [("pollution_exposure_index", +15)],

    # ── Lifestyle ─────────────────────────────────────────────────────────────
    "no sleep":          [("sleep_hours", -2.0)],
    "stressed":          [("sensitivity_score", +10), ("acne_frequency", +10)],
    "stress":            [("sensitivity_score", +10), ("acne_frequency", +10)],
    "drink water":       [("water_intake_liters", +1.0)],
    "not drinking":      [("water_intake_liters", -1.0), ("hydration_level", -10)],
}


# ── Feature Derivation: 7 quiz answers → all 24 features ─────────────────────

def derive_all_features(quiz: Dict[str, float]) -> Dict[str, float]:
    """
    Takes 7 quiz answers (0-100 scale each) and returns a complete
    dict of all 24 features using dermatological correlations.
    """
    s  = quiz["sebum_level"]        # oil production
    h  = quiz["hydration_level"]    # hydration
    a  = quiz["acne_frequency"]     # breakout frequency
    p  = quiz["pore_size"]          # pore size
    sn = quiz["sensitivity_score"]  # sensitivity
    r  = quiz["roughness_score"]    # skin texture
    t  = quiz["tightness_score"]    # tightness / dryness feel

    f: Dict[str, float] = {}

    # 7 quiz features — direct copy
    f["sebum_level"]       = s
    f["hydration_level"]   = h
    f["acne_frequency"]    = a
    f["pore_size"]         = p
    f["sensitivity_score"] = sn
    f["roughness_score"]   = r
    f["tightness_score"]   = t

    # ph_level (4.0–7.5): oily → more acidic (low pH), dry → more alkaline (high pH)
    f["ph_level"] = round(clamp(4.0 + 3.5 * (200 - s - h) / 200, "ph_level"), 2)

    # skin_temperature (30–36.5°C): sensitive skin runs slightly warmer
    f["skin_temperature"] = round(clamp(33.0 + (sn / 100) * 3.5, "skin_temperature"), 2)

    # oil_shine (0–10): direct rescale of sebum from 0-100 → 0-10
    f["oil_shine"] = round(clamp(s / 10, "oil_shine"), 2)

    # wrinkle_score (0–10): lower hydration → slightly more fine lines
    f["wrinkle_score"] = round(clamp(3.0 - (h - 50) / 50 * 1.5, "wrinkle_score"), 2)

    # elasticity_score (20–100): good hydration + not tight → elastic skin
    f["elasticity_score"] = round(clamp(20 + (h * 0.6 + (100 - t) * 0.4) * 0.8, "elasticity_score"), 2)

    # redness_level (0–10): sensitive skin → prone to redness
    f["redness_level"] = round(clamp(sn / 10, "redness_level"), 2)

    # itchiness_score (0–10): sensitive + tight/dry skin → itchy
    f["itchiness_score"] = round(clamp((sn * 0.5 + t * 0.5) / 10, "itchiness_score"), 2)

    # pigmentation_level (0–10): baseline — NLP text can raise this
    f["pigmentation_level"] = 3.0

    # dark_spot_score (0–10): baseline — NLP text can raise this
    f["dark_spot_score"] = 2.5

    # uneven_tone_score (0–10): rough texture → uneven skin tone
    f["uneven_tone_score"] = round(clamp(r / 10, "uneven_tone_score"), 2)

    # blackhead_score (0–10): high sebum + large pores → blackheads
    f["blackhead_score"] = round(clamp((s * 0.6 + p * 0.4) / 10, "blackhead_score"), 2)

    # whitehead_score (0–10): high acne frequency + sebum → whiteheads
    f["whitehead_score"] = round(clamp((a * 0.6 + s * 0.4) / 10, "whitehead_score"), 2)

    # flakiness_score (0–10): tight + dehydrated → flaky skin
    f["flakiness_score"] = round(clamp((t * 0.5 + (100 - h) * 0.5) / 10, "flakiness_score"), 2)

    # sun_exposure_hours (0–10): baseline 4h/day — NLP adjustable
    f["sun_exposure_hours"] = 4.0

    # pollution_exposure_index (0–100): baseline 50 — NLP adjustable
    f["pollution_exposure_index"] = 50.0

    # water_intake_liters (0.5–5.0): more hydrated → likely drinks more water
    f["water_intake_liters"] = round(clamp(0.5 + (h / 100) * 4.5, "water_intake_liters"), 2)

    # sleep_hours (3–9): baseline 7h — NLP adjustable
    f["sleep_hours"] = 7.0

    return f


# ── NLP Processor ─────────────────────────────────────────────────────────────

def apply_nlp_adjustments(
    features: Dict[str, float], text: str
) -> Tuple[Dict[str, float], List[str]]:
    """
    Scans free text for skin-concern keywords.
    Adjusts relevant feature values and returns updated features + matched keywords.
    """
    text_lower = text.lower().strip()
    matched: List[str] = []

    for keyword, adjustments in NLP_KEYWORD_MAP.items():
        # Word-boundary match to avoid partial hits (e.g. "red" inside "already")
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            matched.append(keyword)
            for feat, delta in adjustments:
                if feat in features:
                    features[feat] = clamp(features[feat] + delta, feat)

    return features, matched


# ── Load Model ────────────────────────────────────────────────────────────────

if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
    raise RuntimeError(
        f"Model files not found.\n"
        f"Run `python train.py` first to generate:\n"
        f"  {MODEL_PATH}\n  {ENCODER_PATH}"
    )

model   = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

print(f"✅ Model loaded — skin types: {list(encoder.classes_)}")
print(f"   Total features: {len(ALL_FEATURES)} | Quiz features: 7 | Derived: 17")

# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="GlowGuide ML Service",
    description="7 quiz answers → 24 features (derived) → RandomForest → skin type prediction",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to specific domains in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────────────────────

class QuizAnswers(BaseModel):
    """7 core features collected directly from the quiz (all 0–100 scale)."""
    sebum_level:       float = Field(..., ge=0, le=100, description="Oil production level")
    hydration_level:   float = Field(..., ge=0, le=100, description="Skin hydration")
    acne_frequency:    float = Field(..., ge=0, le=100, description="Breakout frequency")
    pore_size:         float = Field(..., ge=0, le=100, description="Visible pore size")
    sensitivity_score: float = Field(..., ge=0, le=100, description="Skin sensitivity")
    roughness_score:   float = Field(..., ge=0, le=100, description="Skin texture roughness")
    tightness_score:   float = Field(..., ge=0, le=100, description="Skin tightness / dryness feel")


class PredictRequest(BaseModel):
    quiz_answers: QuizAnswers
    # Optional free text — if provided, NLP adjusts feature values before prediction
    skin_notes: Optional[str] = Field(default=None, max_length=500)


class PredictResponse(BaseModel):
    skin_type:         str
    confidence:        float             # top class probability
    probabilities:     Dict[str, float]  # all skin types with their probabilities
    skin_notes:        Optional[str]     # echoed back from request
    concerns_detected: List[str]         # keywords found in skin_notes
    features_total:    int               # always 24 — all features sent to the model
    timestamp:         str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    """Service health check — confirms model is loaded and ready."""
    return {
        "status": "ok",
        "service": "GlowGuide ML Service",
        "version": "2.0.0",
        "skin_types": list(encoder.classes_),
        "total_features": len(ALL_FEATURES),
        "quiz_features": 7,
        "derived_features": 17,
        "nlp_keywords": len(NLP_KEYWORD_MAP),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(body: PredictRequest):
    """
    Prediction pipeline:
      Step 1 — Take 7 quiz answers
      Step 2 — Derive 17 remaining features using dermatological correlations
      Step 3 — If skin_notes provided, adjust features via NLP keyword matching
      Step 4 — Feed all 24 features into RandomForest → return prediction
    """
    # Step 1 + 2: Build complete 24-feature dict from 7 quiz answers
    features = derive_all_features(body.quiz_answers.dict())

    # Step 3: NLP adjustments — only runs if user wrote something
    matched_keywords: List[str] = []
    if body.skin_notes and body.skin_notes.strip():
        features, matched_keywords = apply_nlp_adjustments(features, body.skin_notes)

    # Step 4: Build ordered numpy array and run model prediction
    X = np.array([[features[feat] for feat in ALL_FEATURES]])

    try:
        proba = model.predict_proba(X)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    probabilities = {
        label: round(float(prob), 4)
        for label, prob in zip(encoder.classes_, proba)
    }

    top_skin_type  = max(probabilities, key=probabilities.get)
    top_confidence = probabilities[top_skin_type]

    return PredictResponse(
        skin_type=top_skin_type,
        confidence=top_confidence,
        probabilities=probabilities,
        skin_notes=body.skin_notes,
        concerns_detected=matched_keywords,
        features_total=len(ALL_FEATURES),   # always 24
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
