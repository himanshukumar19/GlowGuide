import re
from typing import Dict, Iterable, List

from schemas import QuizScores


def probability_dict(results: Iterable[dict]) -> Dict[str, float]:
    return {str(item["label"]): float(item["score"]) for item in results}


def average_probabilities(probability_sets: List[Dict[str, float]]) -> Dict[str, float]:
    labels = {label for probabilities in probability_sets for label in probabilities}
    count = len(probability_sets)
    return {label: sum(probabilities.get(label, 0.0) for probabilities in probability_sets) / count for label in labels}


def _find_probability(probabilities: Dict[str, float], keyword: str) -> float:
    return sum(value for label, value in probabilities.items() if keyword in label.lower())


def acne_label_values(labels: List[str]) -> Dict[str, float]:
    """Order numeric/severity labels, then fall back to their stable label order."""
    severity_words = ("clear", "none", "no acne", "mild", "moderate", "very severe", "severe", "extreme", "cystic")

    def sort_key(label: str):
        lower = label.lower()
        number = re.search(r"-?\d+(?:\.\d+)?", lower)
        if number:
            return (0, float(number.group()))
        for index, word in enumerate(severity_words):
            if word in lower:
                return (1, index)
        return (2, lower)

    ordered = sorted(labels, key=sort_key)
    if len(ordered) == 1:
        return {ordered[0]: 50.0}
    step = 90.0 / (len(ordered) - 1)
    return {label: 10.0 + index * step for index, label in enumerate(ordered)}


def acne_score(probabilities: Dict[str, float]) -> float:
    values = acne_label_values(list(probabilities))
    return sum(probabilities[label] * values[label] for label in probabilities)


def fuse_scores(quiz: QuizScores, skin_sets: List[Dict[str, float]], acne_sets: List[Dict[str, float]]) -> dict:
    skin_probabilities = average_probabilities(skin_sets)
    acne_probabilities = average_probabilities(acne_sets)
    oily = _find_probability(skin_probabilities, "oily")
    normal = _find_probability(skin_probabilities, "normal")
    dry = _find_probability(skin_probabilities, "dry")
    image_oiliness = oily * 100 + normal * 50 + dry * 0
    image_acne = acne_score(acne_probabilities)
    final_sebum = quiz.sebum_level * 0.6 + image_oiliness * 0.4
    final_acne = quiz.acne_frequency * 0.5 + image_acne * 0.5
    top_probabilities = [max(probabilities.values()) for probabilities in skin_sets + acne_sets]
    disagreement = abs(quiz.sebum_level - image_oiliness) > 30
    confidence = 1.0 - (0.3 if disagreement else 0.0) - (0.1 if any(value < 0.5 for value in top_probabilities) else 0.0)
    final_scores = {
        "sebum_level": final_sebum,
        "hydration_level": quiz.hydration_level,
        "acne_frequency": final_acne,
        "pore_size": quiz.pore_size,
        "sensitivity_score": quiz.sensitivity_score,
        "roughness_score": quiz.roughness_score,
        "tightness_score": quiz.tightness_score,
    }
    return {
        "final_scores": final_scores,
        "confidence": max(0.0, confidence),
        "disagreement": disagreement,
        "raw_debug": {
            "quiz_oiliness": quiz.sebum_level,
            "image_oiliness": image_oiliness,
            "quiz_acne": quiz.acne_frequency,
            "image_acne": image_acne,
            "skin_type_probabilities": skin_probabilities,
            "acne_probabilities": acne_probabilities,
        },
    }


def predict_skin_type(scores: Dict[str, float]) -> str:
    sebum = scores["sebum_level"]
    hydration = scores["hydration_level"]
    acne = scores["acne_frequency"]
    pore = scores["pore_size"]
    sensitivity = scores["sensitivity_score"]
    roughness = scores["roughness_score"]
    tightness = scores["tightness_score"]

    if sensitivity >= 60:
        return "sensitive"

    oily_score = 0.0
    dry_score = 0.0
    if sebum >= 65:
        oily_score += 3
    elif sebum >= 55:
        oily_score += 1.5
    elif sebum <= 30:
        dry_score += 3
    elif sebum <= 45:
        dry_score += 1.5
    if hydration <= 36:
        dry_score += 3
    elif hydration <= 45:
        dry_score += 1.5
    if acne >= 70:
        oily_score += 2
    elif acne >= 55:
        oily_score += 1
    if pore >= 68:
        oily_score += 2
    elif pore >= 55:
        oily_score += 1
    if roughness <= 35:
        dry_score += 2
    elif roughness <= 45:
        dry_score += 1
    if tightness >= 70:
        dry_score += 3
    elif tightness >= 50:
        dry_score += 1.5

    if oily_score >= 2.5 and dry_score >= 2.5:
        return "combination"
    if oily_score >= 3:
        return "oily"
    if dry_score >= 3:
        return "dry"
    if oily_score > dry_score:
        return "oily"
    if dry_score > oily_score:
        return "dry"
    return "normal"
