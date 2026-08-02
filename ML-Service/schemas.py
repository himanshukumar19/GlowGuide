from typing import Dict, Optional

from pydantic import BaseModel, Field


class QuizScores(BaseModel):
    sebum_level: float = Field(..., ge=0, le=100)
    hydration_level: float = Field(..., ge=0, le=100)
    acne_frequency: float = Field(..., ge=0, le=100)
    pore_size: float = Field(..., ge=0, le=100)
    sensitivity_score: float = Field(..., ge=0, le=100)
    roughness_score: float = Field(..., ge=0, le=100)
    tightness_score: float = Field(..., ge=0, le=100)


class FinalScores(BaseModel):
    sebum_level: float
    hydration_level: float
    acne_frequency: float
    pore_size: float
    sensitivity_score: float
    roughness_score: float
    tightness_score: float


class RawDebug(BaseModel):
    quiz_oiliness: float
    image_oiliness: float
    quiz_acne: float
    image_acne: float
    skin_type_probabilities: Dict[str, float]
    acne_probabilities: Dict[str, float]


class AnalyzeResponse(BaseModel):
    analysis_id: str
    skin_type: str
    sensitive: bool
    confidence: float
    disagreement: bool
    final_scores: FinalScores
    raw_debug: RawDebug
    user_notes: Optional[str]
    timestamp: str
