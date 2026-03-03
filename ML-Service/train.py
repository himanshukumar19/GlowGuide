import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

DATA_PATH    = "data/ultimate_skin_type_dataset.csv"
MODEL_PATH   = "model/model.pkl"
ENCODER_PATH = "model/label_encoder.pkl"

# All 24 features from the CSV — model trained on complete dataset
# 7 of these are collected directly from quiz, rest are derived in main.py
FEATURES = [
    "sebum_level",             # Q1 - Oil production (quiz)
    "hydration_level",         # Q2 - Hydration level (quiz)
    "ph_level",                # derived from hydration + sebum
    "skin_temperature",        # derived from sensitivity
    "pore_size",               # Q4 - Pore size (quiz)
    "oil_shine",               # derived from sebum_level
    "wrinkle_score",           # baseline (no quiz question)
    "roughness_score",         # Q6 - Skin texture (quiz)
    "elasticity_score",        # derived from hydration
    "sensitivity_score",       # Q5 - Sensitivity (quiz)
    "redness_level",           # derived from sensitivity
    "itchiness_score",         # derived from sensitivity + tightness
    "pigmentation_level",      # baseline / NLP adjusted
    "dark_spot_score",         # baseline / NLP adjusted
    "uneven_tone_score",       # derived from roughness
    "acne_frequency",          # Q3 - Acne frequency (quiz)
    "blackhead_score",         # derived from sebum + pore_size
    "whitehead_score",         # derived from acne + sebum
    "tightness_score",         # Q7 - Skin tightness (quiz)
    "flakiness_score",         # derived from tightness + hydration
    "sun_exposure_hours",      # baseline
    "pollution_exposure_index", # baseline
    "water_intake_liters",     # derived from hydration
    "sleep_hours",             # baseline
]


def train():
    # ── Part 3: Load data ────────────────────────────────────────────────────
    print("📂 Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    print(f"   Rows loaded: {len(df)}")

    # Check all required feature columns exist in the CSV
    missing = [f for f in FEATURES if f not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in CSV: {missing}")

    X = df[FEATURES]       # input: 7 feature columns (one per quiz question)
    y = df["skin_type"]    # output: skin type label (Oily, Dry, Normal, etc.)

    # ── Part 4: Encode + Split + Train ───────────────────────────────────────
    # LabelEncoder converts string labels to numbers (model only understands numbers)
    # Example: Combination→0, Dry→1, Normal→2, Oily→3, Sensitive→4
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    print(f"   Skin types found: {list(le.classes_)}")

    # Split into 80% training and 20% testing
    # stratify ensures each skin type is proportionally represented in both splits
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"   Train: {len(X_train)} rows | Test: {len(X_test)} rows")

    print("\n🤖 Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=200,  # 200 decision trees — majority vote gives the final prediction
        random_state=42,   # fixed seed for reproducible results
        n_jobs=-1,         # use all CPU cores for faster training
    )
    model.fit(X_train, y_train)

    # ── Part 5: Evaluate + Save ──────────────────────────────────────────────
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Create model/ folder if it doesn't exist, then save both files
    os.makedirs("model", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)
    print(f"\n💾 Model saved   → {MODEL_PATH}")
    print(f"💾 Encoder saved → {ENCODER_PATH}")


if __name__ == "__main__":
    train()