import type { RoutineRecommendation, SkinType, DetectedConcern } from "@/lib/schemas/analysis";

interface RoutineContext {
  skinType: SkinType;
  concerns: DetectedConcern[];
}

const CLEANSER: Record<SkinType, string> = {
  oily: "Gel or foaming cleanser with salicylic acid to control oil and clear pores.",
  dry: "Creamy, hydrating cleanser with ceramides or hyaluronic acid.",
  combination: "Gentle gel cleanser that balances oily T-zone without drying cheeks.",
  sensitive: "Fragrance-free, ultra-gentle cleanser with soothing ingredients.",
  normal: "Mild, pH-balanced cleanser to maintain healthy barrier.",
};

const MOISTURIZER: Record<SkinType, string> = {
  oily: "Lightweight, oil-free gel moisturizer with niacinamide.",
  dry: "Rich cream moisturizer with ceramides, shea butter, or squalane.",
  combination: "Light lotion for day, slightly richer cream at night.",
  sensitive: "Barrier-repair moisturizer with centella or colloidal oatmeal.",
  normal: "Balanced moisturizer to maintain hydration and glow.",
};

const SUNSCREEN = "Broad-spectrum SPF 30+ sunscreen. Reapply every 2 hours outdoors.";

function concernSteps(concerns: DetectedConcern[]): {
  morning: { productType: string; description: string }[];
  night: { productType: string; description: string }[];
} {
  const morning: { productType: string; description: string }[] = [];
  const night: { productType: string; description: string }[] = [];

  const names = new Set(concerns.map((c) => c.name));

  if (names.has("Acne")) {
    morning.push({
      productType: "Spot Treatment",
      description: "Optional benzoyl peroxide or tea tree spot treatment on active breakouts.",
    });
    night.push({
      productType: "Exfoliant",
      description: "2% salicylic acid or BHA exfoliant 2–3 nights per week.",
    });
  }

  if (names.has("Aging")) {
    morning.push({
      productType: "Antioxidant Serum",
      description: "Vitamin C serum to brighten and protect against free radicals.",
    });
    night.push({
      productType: "Retinoid",
      description: "Introduce a gentle retinoid 2–3 nights per week to boost collagen.",
    });
  }

  if (names.has("Pigmentation")) {
    morning.push({
      productType: "Brightening Serum",
      description: "Vitamin C or niacinamide serum to fade dark spots over time.",
    });
    night.push({
      productType: "Exfoliant / Tone Corrector",
      description: "Gentle AHA or tranexamic acid treatment to even skin tone.",
    });
  }

  if (names.has("Dryness")) {
    morning.push({
      productType: "Hydrating Serum",
      description: "Hyaluronic acid serum on damp skin before moisturizer.",
    });
    night.push({
      productType: "Facial Oil / Sleeping Mask",
      description: "Seal in moisture with a lightweight facial oil or overnight hydrating mask.",
    });
  }

  if (names.has("Sensitivity")) {
    morning.push({
      productType: "Soothing Serum",
      description: "Centella asiatica or azelaic acid to calm redness.",
    });
    night.push({
      productType: "Barrier Repair",
      description: "Peptide or ceramide-rich treatment to strengthen skin barrier.",
    });
  }

  if (names.has("Oiliness")) {
    morning.push({
      productType: "Mattifying Primer / Toner",
      description: "Niacinamide toner or mattifying primer to control shine.",
    });
    night.push({
      productType: "Clay Mask",
      description: "Clay mask 1–2 times per week to absorb excess oil.",
    });
  }

  if (names.has("Uneven Texture")) {
    night.push({
      productType: "Exfoliant",
      description: "Gentle AHA/BHA exfoliant 2–3 nights per week to smooth texture.",
    });
  }

  return { morning, night };
}

export function generateRoutine(context: RoutineContext): RoutineRecommendation {
  const concern = concernSteps(context.concerns);

  const morning = [
    { productType: "Cleanser", description: CLEANSER[context.skinType] },
    ...concern.morning,
    { productType: "Moisturizer", description: MOISTURIZER[context.skinType] },
    { productType: "Sunscreen", description: SUNSCREEN },
  ];

  const night = [
    { productType: "Cleanser", description: CLEANSER[context.skinType] },
    ...concern.night,
    { productType: "Moisturizer", description: MOISTURIZER[context.skinType] },
  ];

  return { morning, night };
}
