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

# 7 features — one per quiz question, ordered by ML feature importance
FEATURES = [
    "sebum_level",       # Q1 - Oil level (most important: 18.5% importance)
    "hydration_level",   # Q2 - Hydration level (second most important: 16.2%)
    "acne_frequency",    # Q3 - Breakout frequency (12.8% importance)
    "pore_size",         # Q4 - Pore visibility (9.5% importance)
    "sensitivity_score", # Q5 - Skin sensitivity / product reaction (7.3%)
    "roughness_score",   # Q6 - Skin texture smoothness (6.8% importance)
    "tightness_score",   # Q7 - Skin tightness / dryness feeling (strong dry indicator)
]