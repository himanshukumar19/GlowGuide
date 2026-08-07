import { generateRoutine } from "@/lib/analysis/routine";
import type {
  DetectedConcern,
  RoutineRecommendation,
  RoutineStep,
  SkinType,
  UserProfile,
} from "@/lib/schemas/analysis";
import type { Product } from "@/lib/schemas/product";

export const CONCERN_TAG_MAP: Record<string, string[]> = {
  "Acne": ["acne", "acne marks", "blackheads", "breakouts", "clogged pores", "post-acne repair", "whiteheads"],
  "Oiliness": ["excess oil", "shine", "clogged pores"],
  "Dryness": ["barrier damage", "dehydration", "dryness", "gentle moisturizing", "moisturizing"],
  "Sensitivity": ["damaged skin barrier", "irritation", "redness", "sensitive skin", "sensitivity", "weakened skin barrier"],
  "Uneven Texture": ["dullness", "enlarged pores", "rough texture", "smooth skin", "texture", "uneven skin texture", "uneven texture"],
  "Pigmentation": ["dark spots", "hyperpigmentation", "loss of radiance", "pigmentation", "uneven skin tone", "uneven tone"],
  "Aging": ["aging", "early signs of aging", "fine lines", "loss of elasticity", "loss of firmness", "skin rejuvenation", "wrinkles"],
};

export const PRODUCT_TYPE_MAP: Record<string, { subcategories: string[]; keywords: string[] }> = {
  "Cleanser": { subcategories: ["cleanser"], keywords: [] },
  "Moisturizer": { subcategories: ["moisturizer"], keywords: [] },
  "Sunscreen": { subcategories: ["sunscreen"], keywords: [] },
  "Clay Mask": { subcategories: ["mask"], keywords: [] },
  "Mattifying Primer / Toner": { subcategories: ["toner"], keywords: [] },
  "Spot Treatment": { subcategories: ["serum", "toner"], keywords: ["salicylic", "benzoyl peroxide"] },
  "Exfoliant": { subcategories: ["toner", "serum", "mask"], keywords: ["aha", "bha", "glycolic", "salicylic"] },
  "Exfoliant / Tone Corrector": { subcategories: ["toner", "serum"], keywords: ["vitamin c", "niacinamide"] },
  "Antioxidant Serum": { subcategories: ["serum"], keywords: ["vitamin c"] },
  "Retinoid": { subcategories: ["serum"], keywords: ["retinol"] },
  "Brightening Serum": { subcategories: ["serum"], keywords: ["vitamin c", "niacinamide"] },
  "Hydrating Serum": { subcategories: ["serum"], keywords: ["hyaluronic acid"] },
  "Soothing Serum": { subcategories: ["serum"], keywords: ["centella", "azelaic acid"] },
  "Facial Oil / Sleeping Mask": { subcategories: ["mask"], keywords: ["facial oil", "sleeping mask"] },
  "Barrier Repair": { subcategories: ["moisturizer"], keywords: ["ceramide", "peptide"] },
};

export const PREGNANCY_EXCLUDED_KEYWORDS = ["retinol", "retinoid", "tretinoin", "hydroquinone"];

export const BUDGET_RANGES: Record<string, { min: number; max: number }> = {
  "Under ₹500": { min: 0, max: 500 },
  "₹500-1500": { min: 500, max: 1500 },
  "₹1500-3000": { min: 1500, max: 3000 },
};

function searchableProductText(product: Product): string {
  return `${product.ingredients.join(" ")} ${product.name}`.toLowerCase();
}

function matchStep(
  step: RoutineStep,
  concerns: { name: string }[],
  userProfile: UserProfile,
  allProducts: Product[],
  skinType: SkinType
): RoutineStep {
  const mapping = PRODUCT_TYPE_MAP[step.productType];
  if (!mapping) {
    console.warn(`[productMatching] Unknown product type "${step.productType}"`);
    return { ...step, suggestedProducts: [] };
  }

  const keywordMatches = new Map<string, boolean>();
  const excludedCategories = userProfile.age_range === "Teen (13-19)"
    ? ["senior"]
    : ["20s", "30s", "40s"].includes(userProfile.age_range ?? "")
      ? ["children", "senior"]
      : userProfile.age_range === "50+"
        ? ["children"]
        : [];
  let candidates = allProducts.filter((product) => {
    const text = searchableProductText(product);
    const matchesKeyword = mapping.keywords.length === 0 || mapping.keywords.some((keyword) => text.includes(keyword));
    if (matchesKeyword) keywordMatches.set(product.id, mapping.keywords.length > 0);
    return product.stockCount > 0 && mapping.subcategories.includes(product.subcategory ?? "") && matchesKeyword &&
      !excludedCategories.includes(product.category);
  });

  if (userProfile.pregnant_or_breastfeeding === true) {
    candidates = candidates.filter((product) =>
      !PREGNANCY_EXCLUDED_KEYWORDS.some((keyword) => searchableProductText(product).includes(keyword))
    );
  }

  const allergies = (userProfile.allergies ?? "").split(",").map((term) => term.trim().toLowerCase()).filter(Boolean);
  if (allergies.length > 0) {
    candidates = candidates.filter((product) => {
      const ingredients = product.ingredients.join(" ").toLowerCase();
      return !allergies.some((term) => ingredients.includes(term));
    });
  }

  const beforeSkinType = candidates;
  candidates = candidates.filter((product) =>
    product.skinTypes.some((type) => type.trim().toLowerCase() === skinType.toLowerCase())
  );
  if (candidates.length === 0) {
    console.warn(`[productMatching] Relaxing skin-type filter for step "${step.productType}" — no candidates tagged for skin type "${skinType}"`);
    candidates = beforeSkinType;
  }

  if (userProfile.fragrance_preference === "Fragrance-free only") {
    const beforeFragrance = candidates;
    candidates = candidates.filter((product) => (product.badges ?? []).some((badge) => badge.toLowerCase() === "fragrance-free"));
    if (candidates.length === 0) {
      console.warn(`[productMatching] Relaxing fragrance filter for step "${step.productType}" — no fragrance-free candidates`);
      candidates = beforeFragrance;
    }
  }

  const budget = userProfile.budget_range ? BUDGET_RANGES[userProfile.budget_range] : undefined;
  if (budget) {
    const beforeBudget = candidates;
    candidates = candidates.filter((product) => product.price >= budget.min && product.price <= budget.max);
    if (candidates.length === 0) {
      console.warn(`[productMatching] Relaxing budget filter for step "${step.productType}" — no candidates in range`);
      candidates = beforeBudget;
    }
  }

  if (candidates.length === 0) {
    console.warn(`[productMatching] No candidates found for step "${step.productType}" after all filters`);
    return { ...step, suggestedProducts: [] };
  }

  const validConcernNames = new Set(concerns.map((concern) => concern.name));
  const concernTags = step.concernContext && validConcernNames.has(step.concernContext)
    ? CONCERN_TAG_MAP[step.concernContext] ?? []
    : [];
  const ranked = candidates
    .map((product) => {
      const productConcerns = new Set(product.concerns.map((concern) => concern.toLowerCase()));
      const concernScore = concernTags.filter((tag) => productConcerns.has(tag)).length;
      return {
        product,
        score: concernScore + (keywordMatches.get(product.id) ? 2 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);

  return { ...step, suggestedProducts: ranked.slice(0, 2).map(({ product }) => product.id) };
}

export function matchProductsToRoutine(
  routine: { morning: RoutineStep[]; night: RoutineStep[] },
  concerns: { name: string }[],
  userProfile: UserProfile,
  allProducts: Product[],
  skinType: SkinType
): { morning: RoutineStep[]; night: RoutineStep[] } {
  return {
    morning: routine.morning.map((step) => matchStep(step, concerns, userProfile, allProducts, skinType)),
    night: routine.night.map((step) => matchStep(step, concerns, userProfile, allProducts, skinType)),
  };
}

export async function matchRoutineWithProducts(
  routine: RoutineRecommendation,
  concerns: { name: string }[],
  userProfile: UserProfile,
  skinType: SkinType
): Promise<RoutineRecommendation> {
  const { getAllProducts } = await import("@/lib/models/product");
  return matchProductsToRoutine(
    routine as { morning: RoutineStep[]; night: RoutineStep[] },
    concerns,
    userProfile,
    await getAllProducts(),
    skinType
  ) as RoutineRecommendation;
}

export async function buildRoutineWithProducts(
  context: { skinType: SkinType; concerns: DetectedConcern[] },
  userProfile: UserProfile
): Promise<RoutineRecommendation> {
  return matchRoutineWithProducts(
    generateRoutine(context),
    context.concerns as { name: string }[],
    userProfile,
    context.skinType
  );
}
