import type { DetectedConcern, SkinType } from "@/lib/schemas/analysis";

interface ConcernInput {
  quizAnswers: Record<string, number>;
  keywords: string[];
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

export const CONCERN_KEYWORD_MAP: Record<string, string[]> = {
  Acne: ["acne", "breakout", "breakouts", "pimple", "pimples", "zit", "zits", "blackhead", "blackheads", "whitehead", "whiteheads"],
  Oiliness: ["oily", "oiliness", "greasy", "shiny", "shine"],
  Dryness: ["dry", "dryness", "flaky", "flaking", "tight", "tightness", "dehydrated", "dehydration"],
  Sensitivity: ["sensitive", "sensitivity", "redness", "red", "irritated", "irritation", "reactive", "burning", "stinging"],
  "Uneven Texture": ["rough", "texture", "bumpy", "uneven"],
  Pigmentation: ["dark spots", "spots", "pigmentation", "hyperpigmentation", "discoloration", "uneven tone"],
  Aging: ["wrinkle", "wrinkles", "fine line", "fine lines", "aging", "sagging", "elasticity"],
};

export function extractConcernKeywords(text: string | null | undefined): string[] {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  for (const [concernName, keywords] of Object.entries(CONCERN_KEYWORD_MAP)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      matched.push(concernName);
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
      rule.score(input) + (input.keywords.includes(rule.name) ? rule.keywordBoost : 0)
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
