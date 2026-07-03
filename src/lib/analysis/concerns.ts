import type { DetectedConcern, SkinType } from "@/lib/schemas/analysis";

interface ConcernInput {
  quizAnswers: Record<string, number>;
  keywords: string[];
  skinType: SkinType;
}

interface ConcernRule {
  name: string;
  description: string;
  score: (input: ConcernInput) => number;
}

function scale(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function hasKeyword(keywords: string[], ...needles: string[]): boolean {
  return needles.some((needle) =>
    keywords.some((k) => k.toLowerCase().includes(needle.toLowerCase()))
  );
}

const CONCERN_RULES: ConcernRule[] = [
  {
    name: "Acne",
    description: "Frequency and severity of breakouts including pimples, blackheads, and whiteheads.",
    score: ({ quizAnswers, keywords }) => {
      const base = scale(quizAnswers.acne_frequency ?? 0, 0, 100);
      const keywordBoost = hasKeyword(keywords, "acne", "pimple", "breakout", "blackhead", "whitehead", "clogged")
        ? 15
        : 0;
      return Math.min(100, base + keywordBoost);
    },
  },
  {
    name: "Oiliness",
    description: "Excess sebum production leading to shine and greasy texture.",
    score: ({ quizAnswers, keywords }) => {
      const base = scale(quizAnswers.sebum_level ?? 50, 0, 100);
      const keywordBoost = hasKeyword(keywords, "oily", "greasy", "shiny", "glossy") ? 15 : 0;
      return Math.min(100, base + keywordBoost);
    },
  },
  {
    name: "Dryness",
    description: "Lack of hydration causing tightness, flakiness, or rough patches.",
    score: ({ quizAnswers, keywords }) => {
      const hydration = quizAnswers.hydration_level ?? 50;
      const tightness = quizAnswers.tightness_score ?? 50;
      const base = (scale(100 - hydration, 0, 100) + scale(tightness, 0, 100)) / 2;
      const keywordBoost = hasKeyword(
        keywords,
        "dry",
        "flaky",
        "dehydrated",
        "tight",
        "peeling",
        "cracked"
      )
        ? 15
        : 0;
      return Math.min(100, base + keywordBoost);
    },
  },
  {
    name: "Sensitivity",
    description: "Reactivity, redness, stinging, or irritation in response to products or environment.",
    score: ({ quizAnswers, keywords }) => {
      const base = scale(quizAnswers.sensitivity_score ?? 0, 0, 100);
      const keywordBoost = hasKeyword(
        keywords,
        "red",
        "sensitive",
        "rosacea",
        "irritated",
        "stinging",
        "burning",
        "reactive",
        "itchy"
      )
        ? 15
        : 0;
      return Math.min(100, base + keywordBoost);
    },
  },
  {
    name: "Uneven Texture",
    description: "Rough, bumpy skin texture, visible pores, and uneven surface.",
    score: ({ quizAnswers, keywords }) => {
      const base = scale(quizAnswers.roughness_score ?? 0, 0, 100);
      const keywordBoost = hasKeyword(
        keywords,
        "rough",
        "bumpy",
        "uneven texture",
        "scar",
        "pores"
      )
        ? 15
        : 0;
      return Math.min(100, base + keywordBoost);
    },
  },
  {
    name: "Pigmentation",
    description: "Dark spots, sun damage, melasma, or uneven skin tone.",
    score: ({ quizAnswers, keywords }) => {
      const base = scale(quizAnswers.roughness_score ?? 0, 20, 80) * 0.4;
      const keywordBoost = hasKeyword(
        keywords,
        "dark spot",
        "hyperpigmentation",
        "melasma",
        "discoloration",
        "sun spot",
        "age spot",
        "uneven tone",
        "photodamage",
        "pigmentation"
      )
        ? 35
        : 0;
      return Math.min(100, base + keywordBoost);
    },
  },
  {
    name: "Aging",
    description: "Fine lines, wrinkles, loss of elasticity, and sagging.",
    score: ({ quizAnswers, keywords }) => {
      const hydration = quizAnswers.hydration_level ?? 50;
      const base = scale(100 - hydration, 20, 100) * 0.5;
      const keywordBoost = hasKeyword(
        keywords,
        "wrinkle",
        "fine line",
        "aging",
        "sagging",
        "elasticity"
      )
        ? 35
        : 0;
      return Math.min(100, base + keywordBoost);
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
    severity: rule.score(input),
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
