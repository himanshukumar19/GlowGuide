import type { DetectedConcern } from "@/lib/schemas/analysis";

/**
 * Compute a composite skin health score from concern severities and model confidence.
 *
 * Formula (from domain docs):
 *   healthScore = 100 - (avgConcernSeverity × 0.6) - ((1 - confidence) × 40)
 *
 * Where:
 *   - avgConcernSeverity is 0–100
 *   - confidence is 0–1
 *   - result is clamped to 0–100
 */
export function calculateHealthScore(
  concerns: DetectedConcern[],
  confidence: number
): number {
  if (concerns.length === 0) {
    // No concerns detected → score driven mostly by confidence
    return Math.round(Math.max(0, Math.min(100, 100 - (1 - confidence) * 40)));
  }

  const avgSeverity =
    concerns.reduce((sum, c) => sum + c.severity, 0) / concerns.length;

  const score = 100 - avgSeverity * 0.6 - (1 - confidence) * 40;
  return Math.round(Math.max(0, Math.min(100, score)));
}
