import type { DetectedConcern, SkinType } from "@/lib/schemas/analysis";

interface ConcernInput {
  quizAnswers: Record<string, number>;
  keywords: Record<string, number>;
  skinType: SkinType;
}

interface ConcernRule {
  name: string;
  description: string;
  keywordBoost: number;
  score: (input: ConcernInput) => number;
}

function scale(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function containsWholeWord(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(text);
}

export const CONCERN_KEYWORD_MAP: Record<string, string[]> = {
  Acne: ["acne", "breakout", "breakouts", "pimple", "pimples", "zit", "zits", "blackhead", "blackheads", "whitehead", "whiteheads"],
  Oiliness: ["oily", "oiliness", "greasy", "shiny", "shine"],
  Dryness: ["dry", "dryness", "flaky", "flaking", "tight", "tightness", "dehydrated", "dehydration"],
  Sensitivity: ["sensitive", "sensitivity", "redness", "red", "irritated", "irritation", "reactive", "burning", "stinging"],
  "Uneven Texture": ["rough", "texture", "bumpy", "uneven"],
  Pigmentation: ["dark spots", "spots", "pigmentation", "hyperpigmentation", "discoloration", "uneven tone"],
  Aging: ["wrinkle", "wrinkles", "fine line", "fine lines", "aging", "sagging", "elasticity"],
};

const NEGATION_TRIGGERS = [
  "not", "isn't", "is not", "aren't", "are not", "doesn't", "does not",
  "don't", "do not", "didn't", "did not", "never", "no", "without", "n't",
];

const INTENSITY_MULTIPLIERS: { phrases: string[]; multiplier: number }[] = [
  { phrases: ["extremely", "very", "really", "severely"], multiplier: 1.5 },
  { phrases: ["noticeably", "quite"], multiplier: 1.2 },
  { phrases: ["slightly", "a little", "mildly", "somewhat"], multiplier: 0.6 },
  { phrases: ["barely", "hardly"], multiplier: 0.3 },
];

function getClauseIntensity(clause: string): number {
  const matches = INTENSITY_MULTIPLIERS.flatMap(({ phrases, multiplier }) =>
    phrases.some((phrase) => containsWholeWord(clause, phrase)) ? [multiplier] : []
  );
  if (matches.length === 0) return 1;

  const boostingMatches = matches.filter((multiplier) => multiplier > 1);
  if (boostingMatches.length > 0) return Math.max(...boostingMatches);

  return Math.min(...matches);
}

export function extractConcernKeywords(text: string | null | undefined): Record<string, number> {
  if (!text) return {};
  const lowerText = text.toLowerCase();
  const matched: Record<string, number> = {};
  const clauses = lowerText.split(/[.!?,]|\s+\b(?:but|however|although|though)\b\s+/i);

  for (const [concernName, keywords] of Object.entries(CONCERN_KEYWORD_MAP)) {
    const intensities = clauses.flatMap((clause) => {
      const hasKeywordMatch = keywords.some((keyword) => containsWholeWord(clause, keyword));
      const hasNegation = NEGATION_TRIGGERS.some((trigger) => containsWholeWord(clause, trigger));
      return hasKeywordMatch && !hasNegation ? [getClauseIntensity(clause)] : [];
    });

    if (intensities.length > 0) {
      matched[concernName] = Math.max(...intensities);
    }
  }

  return matched;
}

const CONCERN_RULES: ConcernRule[] = [
  {
    name: "Acne",
    description: "Frequency and severity of breakouts including pimples, blackheads, and whiteheads.",
    keywordBoost: 15,
    score: ({ quizAnswers }) => {
      const base = scale(quizAnswers.acne_frequency ?? 0, 0, 100);
      return base;
    },
  },
  {
    name: "Oiliness",
    description: "Excess sebum production leading to shine and greasy texture.",
    keywordBoost: 15,
    score: ({ quizAnswers }) => {
      const base = scale(quizAnswers.sebum_level ?? 50, 0, 100);
      return base;
    },
  },
  {
    name: "Dryness",
    description: "Lack of hydration causing tightness, flakiness, or rough patches.",
    keywordBoost: 15,
    score: ({ quizAnswers }) => {
      const hydration = quizAnswers.hydration_level ?? 50;
      const tightness = quizAnswers.tightness_score ?? 50;
      const base = (scale(100 - hydration, 0, 100) + scale(tightness, 0, 100)) / 2;
      return base;
    },
  },
  {
    name: "Sensitivity",
    description: "Reactivity, redness, stinging, or irritation in response to products or environment.",
    keywordBoost: 15,
    score: ({ quizAnswers }) => {
      const base = scale(quizAnswers.sensitivity_score ?? 0, 0, 100);
      return base;
    },
  },
  {
    name: "Uneven Texture",
    description: "Rough, bumpy skin texture, visible pores, and uneven surface.",
    keywordBoost: 15,
    score: ({ quizAnswers }) => {
      const base = scale(quizAnswers.roughness_score ?? 0, 0, 100);
      return base;
    },
  },
  {
    name: "Pigmentation",
    description: "Dark spots, sun damage, melasma, or uneven skin tone.",
    keywordBoost: 35,
    score: ({ quizAnswers }) => {
      const base = scale(quizAnswers.roughness_score ?? 0, 20, 80) * 0.4;
      return base;
    },
  },
  {
    name: "Aging",
    description: "Fine lines, wrinkles, loss of elasticity, and sagging.",
    keywordBoost: 35,
    score: ({ quizAnswers }) => {
      const hydration = quizAnswers.hydration_level ?? 50;
      const base = scale(100 - hydration, 20, 100) * 0.5;
      return base;
    },
  },
];

const SKIN_TYPE_CONCERNS: Record<SkinType, string[]> = {
  oily: ["Oiliness", "Acne", "Uneven Texture"],
  dry: ["Dryness", "Aging", "Sensitivity"],
  combination: ["Oiliness", "Dryness", "Uneven Texture"],
  sensitive: ["Sensitivity", "Dryness", "Pigmentation"],
  normal: ["Aging", "Uneven Texture"],
};

export function deriveConcerns(input: ConcernInput): DetectedConcern[] {
  const scored = CONCERN_RULES.map((rule) => ({
    name: rule.name,
    description: rule.description,
    severity: Math.min(
      100,
      rule.score(input) +
        (input.keywords[rule.name] !== undefined
          ? Math.round(rule.keywordBoost * input.keywords[rule.name])
          : 0)
    ),
  }))
    .filter((c) => c.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  // Prioritize concerns that are typical for the detected skin type, but keep all meaningful ones
  const prioritizedForSkinType = new Set(SKIN_TYPE_CONCERNS[input.skinType]);

  const sorted = scored.sort((a, b) => {
    const aPrio = prioritizedForSkinType.has(a.name) ? 1 : 0;
    const bPrio = prioritizedForSkinType.has(b.name) ? 1 : 0;
    if (aPrio !== bPrio) return bPrio - aPrio;
    return b.severity - a.severity;
  });

  // Keep top concerns, min 1 max 5, drop anything below mild severity (20)
  const meaningful = sorted.filter((c) => c.severity >= 20);
  const top = meaningful.length > 0 ? meaningful.slice(0, 5) : [sorted[0]].filter(Boolean);

  return top.map((c) => ({
    name: c.name,
    description: c.description,
    severity: Math.round(c.severity),
    confidence: Math.round(Math.min(1, 0.5 + c.severity / 200) * 100) / 100,
  }));
}
