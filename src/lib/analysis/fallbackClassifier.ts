import type { AnalysisResult, UserProfile } from "@/lib/schemas/analysis";
import { deriveConcerns, extractConcernKeywords } from "@/lib/analysis/concerns";
import { calculateHealthScore } from "@/lib/analysis/health-score";
import { generateRoutine } from "@/lib/analysis/routine";
import type { SkinType } from "@/lib/schemas/analysis";

export const FALLBACK_CONFIDENCE = 0.85;

function normalizeAnswers(answers: Record<string, number>): Record<string, number> {
  return {
    sebum_level: Number(answers.sebum_level ?? 50),
    hydration_level: Number(answers.hydration_level ?? 50),
    acne_frequency: Number(answers.acne_frequency ?? 0),
    pore_size: Number(answers.pore_size ?? 50),
    sensitivity_score: Number(answers.sensitivity_score ?? 0),
    roughness_score: Number(answers.roughness_score ?? 0),
    tightness_score: Number(answers.tightness_score ?? 0),
  };
}

function classify(answers: Record<string, number>): SkinType {
  const sebum = answers.sebum_level ?? 50;
  const hydration = answers.hydration_level ?? 50;
  const acne = answers.acne_frequency ?? 50;
  const pore = answers.pore_size ?? 50;
  const sensitivity = answers.sensitivity_score ?? 50;
  const roughness = answers.roughness_score ?? 50;
  const tightness = answers.tightness_score ?? 30;

  if (sensitivity >= 60) return "sensitive";

  let oilyScore = 0;
  let dryScore = 0;

  if (sebum >= 65) oilyScore += 3;
  else if (sebum >= 55) oilyScore += 1.5;
  else if (sebum <= 30) dryScore += 3;
  else if (sebum <= 45) dryScore += 1.5;

  if (hydration <= 36) dryScore += 3;
  else if (hydration <= 45) dryScore += 1.5;

  if (acne >= 70) oilyScore += 2;
  else if (acne >= 55) oilyScore += 1;

  if (pore >= 68) oilyScore += 2;
  else if (pore >= 55) oilyScore += 1;

  if (roughness <= 35) dryScore += 2;
  else if (roughness <= 45) dryScore += 1;

  if (tightness >= 70) dryScore += 3;
  else if (tightness >= 50) dryScore += 1.5;

  if (oilyScore >= 2.5 && dryScore >= 2.5) return "combination";
  if (oilyScore >= 3) return "oily";
  if (dryScore >= 3) return "dry";
  if (oilyScore > dryScore) return "oily";
  if (dryScore > oilyScore) return "dry";
  return "normal";
}

/**
 * Builds the same quiz-only result used when the ML service request fails.
 * userProfile is accepted so recovery operates on the complete stored analysis
 * context; recommendation filtering can use it when the routine builder grows.
 */
export function buildQuizOnlyFallback(
  answers: Record<string, number>,
  _userProfile?: UserProfile,
  skinNotes?: string | null
): AnalysisResult {
  const normalizedAnswers = normalizeAnswers(answers);
  const skinType = classify(normalizedAnswers);
  const concerns = deriveConcerns({
    quizAnswers: normalizedAnswers,
    keywords: extractConcernKeywords(skinNotes),
    skinType,
  });
  const rawScores = {
    quiz_oiliness: normalizedAnswers.sebum_level,
    image_oiliness: 0,
    final_oiliness: normalizedAnswers.sebum_level,
    quiz_acne: normalizedAnswers.acne_frequency,
    image_acne: 0,
    final_acne: normalizedAnswers.acne_frequency,
  };

  return {
    skinType,
    concerns,
    healthScore: calculateHealthScore(concerns, FALLBACK_CONFIDENCE),
    confidence: FALLBACK_CONFIDENCE,
    probabilities: { [skinType]: FALLBACK_CONFIDENCE },
    routine: generateRoutine({ skinType, concerns }),
    sensitive: normalizedAnswers.sensitivity_score >= 60,
    disagreement: false,
    rawScores,
  };
}
