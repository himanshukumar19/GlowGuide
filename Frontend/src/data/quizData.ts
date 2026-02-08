export type SkinType = 'normal' | 'oily' | 'combination' | 'dry' | 'sensitive';

// Each answer contributes weighted scores to multiple skin types
// This is how real dermatological assessments work
type SkinScores = Partial<Record<SkinType, number>>;

export interface QuizQuestion {
  id: number;
  question: string;
  weight: number; // How important this question is (1-3)
  options: {
    text: string;
    scores: SkinScores; // Weighted contribution to each skin type
  }[];
}

export interface QuizResult {
  skinType: string;
  description: string;
  characteristics: string[];
  recommendedProducts: string[];
  morningRoutine: string[];
  nightRoutine: string[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How does your skin feel a few hours after washing your face?",
    weight: 3, // Very important diagnostic question
    options: [
      { text: "Comfortable, neither dry nor oily", scores: { normal: 3 } },
      { text: "Shiny and greasy all over", scores: { oily: 3 } },
      { text: "Oily in the T-zone, normal or dry on cheeks", scores: { combination: 3, oily: 1, dry: 1 } },
      { text: "Tight, dry, or flaky", scores: { dry: 3 } },
      { text: "Red, itchy, or irritated", scores: { sensitive: 3, dry: 1 } },
    ],
  },
  {
    id: 2,
    question: "How often do you experience breakouts or acne?",
    weight: 2,
    options: [
      { text: "Rarely or never", scores: { normal: 2, dry: 1 } },
      { text: "Frequently, especially in oily areas", scores: { oily: 3 } },
      { text: "Occasionally, mostly in the T-zone", scores: { combination: 2, oily: 1 } },
      { text: "Rarely, but skin feels rough or flaky", scores: { dry: 2 } },
      { text: "Sometimes, often with redness and irritation", scores: { sensitive: 2, oily: 1 } },
    ],
  },
  {
    id: 3,
    question: "How does your skin react to new skincare products?",
    weight: 3, // Key indicator for sensitive skin
    options: [
      { text: "Adapts well, no noticeable reaction", scores: { normal: 3 } },
      { text: "Gets more oily or causes breakouts", scores: { oily: 2 } },
      { text: "Some areas react differently than others", scores: { combination: 2, sensitive: 1 } },
      { text: "Feels even drier or starts peeling", scores: { dry: 2, sensitive: 1 } },
      { text: "Burns, stings, or turns red easily", scores: { sensitive: 3 } },
    ],
  },
  {
    id: 4,
    question: "How would you describe your pores?",
    weight: 2, // Strong indicator for oily vs dry
    options: [
      { text: "Small and barely noticeable", scores: { normal: 2 } },
      { text: "Large and visible across most of my face", scores: { oily: 3 } },
      { text: "Larger on nose and forehead, smaller on cheeks", scores: { combination: 3 } },
      { text: "Very small or almost invisible, skin looks tight", scores: { dry: 2, normal: 1 } },
      { text: "Varies, often with redness around them", scores: { sensitive: 2, combination: 1 } },
    ],
  },
  {
    id: 5,
    question: "How does your skin feel at the end of the day?",
    weight: 3,
    options: [
      { text: "Still comfortable and balanced", scores: { normal: 3 } },
      { text: "Very shiny and greasy", scores: { oily: 3 } },
      { text: "Oily T-zone but cheeks feel normal or dry", scores: { combination: 3 } },
      { text: "Tight, rough, and in need of moisture", scores: { dry: 3 } },
      { text: "Irritated, uncomfortable, or inflamed", scores: { sensitive: 3 } },
    ],
  },
  {
    id: 6,
    question: "How does your skin react to sun exposure?",
    weight: 2,
    options: [
      { text: "Tans gradually with minimal issues", scores: { normal: 2 } },
      { text: "Gets oilier and may break out", scores: { oily: 2 } },
      { text: "T-zone gets oilier, cheeks may feel dry", scores: { combination: 2, dry: 1 } },
      { text: "Burns easily and feels even drier", scores: { dry: 2, sensitive: 1 } },
      { text: "Burns quickly, gets red, and stays irritated", scores: { sensitive: 3 } },
    ],
  },
  {
    id: 7,
    question: "What does your skin look like when you wake up in the morning?",
    weight: 2,
    options: [
      { text: "Fresh and balanced, looks healthy", scores: { normal: 2 } },
      { text: "Oily and shiny, especially on the forehead", scores: { oily: 2, combination: 1 } },
      { text: "Oily nose and forehead, cheeks look normal", scores: { combination: 3 } },
      { text: "Dry, dull, or with visible flakes", scores: { dry: 3 } },
      { text: "Puffy, red, or with visible irritation", scores: { sensitive: 2 } },
    ],
  },
  {
    id: 8,
    question: "How does your skin respond to weather changes (cold, hot, humid)?",
    weight: 2,
    options: [
      { text: "Stays mostly the same regardless of weather", scores: { normal: 3 } },
      { text: "Gets much oilier in hot or humid weather", scores: { oily: 2, combination: 1 } },
      { text: "T-zone gets oilier in summer, cheeks dry in winter", scores: { combination: 3 } },
      { text: "Gets very dry and flaky in cold or dry weather", scores: { dry: 2 } },
      { text: "Reacts strongly — redness, itching, or flare-ups", scores: { sensitive: 3 } },
    ],
  },
  {
    id: 9,
    question: "How would you describe your skin's texture when you touch it?",
    weight: 2,
    options: [
      { text: "Smooth and soft", scores: { normal: 2 } },
      { text: "Thick and slightly bumpy, especially where oily", scores: { oily: 2 } },
      { text: "Smooth in some areas, rough or bumpy in others", scores: { combination: 2, dry: 1 } },
      { text: "Rough, flaky, or papery", scores: { dry: 3 } },
      { text: "Thin, delicate, and easily irritated", scores: { sensitive: 3, dry: 1 } },
    ],
  },
  {
    id: 10,
    question: "When you apply moisturizer, how does your skin react?",
    weight: 2,
    options: [
      { text: "Absorbs well and feels comfortable", scores: { normal: 2 } },
      { text: "Feels heavy or greasy, may cause breakouts", scores: { oily: 3 } },
      { text: "Some areas absorb it well, others feel greasy", scores: { combination: 3 } },
      { text: "Soaks it up quickly and still feels dry", scores: { dry: 3 } },
      { text: "May sting, tingle, or cause redness", scores: { sensitive: 3 } },
    ],
  },
];

export const skinTypeResults: Record<string, QuizResult> = {
  normal: {
    skinType: "Normal Skin",
    description: "Your skin is well-balanced with good moisture levels and minimal issues. It's neither too oily nor too dry.",
    characteristics: [
      "Smooth texture with minimal pores",
      "Even skin tone",
      "Rarely experiences breakouts",
      "Comfortable and balanced",
      "Good elasticity",
    ],
    recommendedProducts: [
      "Gentle foaming cleanser",
      "Hydrating toner",
      "Lightweight moisturizer",
      "Broad-spectrum SPF 30+",
      "Vitamin C serum (optional)",
    ],
    morningRoutine: [
      "Gentle cleanser",
      "Hydrating toner",
      "Lightweight moisturizer",
      "Sunscreen SPF 30+",
    ],
    nightRoutine: [
      "Gentle cleanser",
      "Toner",
      "Serum (optional)",
      "Night moisturizer",
    ],
  },
  oily: {
    skinType: "Oily Skin",
    description: "Your skin produces excess sebum, leading to shine and potential breakouts. Focus on oil control without over-drying.",
    characteristics: [
      "Shiny or greasy appearance",
      "Enlarged, visible pores",
      "Prone to acne and blackheads",
      "Makeup may slide off easily",
      "Thicker skin texture",
    ],
    recommendedProducts: [
      "Gel or foam cleanser with salicylic acid",
      "Oil-free, lightweight moisturizer",
      "Niacinamide serum",
      "Clay masks (weekly)",
      "Mattifying sunscreen",
    ],
    morningRoutine: [
      "Gel cleanser",
      "Alcohol-free toner",
      "Niacinamide serum",
      "Oil-free moisturizer",
      "Mattifying sunscreen",
    ],
    nightRoutine: [
      "Double cleanse (oil + gel cleanser)",
      "BHA/Salicylic acid treatment",
      "Lightweight moisturizer",
    ],
  },
  combination: {
    skinType: "Combination Skin",
    description: "Your skin has both oily and dry areas, typically an oily T-zone with normal or dry cheeks. Balance is key.",
    characteristics: [
      "Oily forehead, nose, and chin (T-zone)",
      "Normal to dry cheeks",
      "Visible pores in T-zone",
      "May experience both dryness and breakouts",
      "Skin needs vary by zone",
    ],
    recommendedProducts: [
      "Gentle gel or foam cleanser",
      "Balancing toner",
      "Lightweight moisturizer for whole face",
      "Targeted treatments for each zone",
      "Hydrating sunscreen",
    ],
    morningRoutine: [
      "Gentle cleanser",
      "Balancing toner",
      "Serum (Vitamin C or Niacinamide)",
      "Moisturizer",
      "Sunscreen",
    ],
    nightRoutine: [
      "Double cleanse",
      "Toner",
      "Treatment (BHA for T-zone if needed)",
      "Moisturizer (richer on dry areas)",
    ],
  },
  dry: {
    skinType: "Dry Skin",
    description: "Your skin lacks moisture and may feel tight or flaky. Focus on hydration and nourishment.",
    characteristics: [
      "Tight, rough, or flaky texture",
      "Nearly invisible pores",
      "Dull complexion",
      "May show fine lines more easily",
      "Can feel uncomfortable or itchy",
    ],
    recommendedProducts: [
      "Cream or milk cleanser",
      "Hydrating toner with hyaluronic acid",
      "Rich moisturizer with ceramides",
      "Facial oil (optional)",
      "Hydrating sunscreen",
    ],
    morningRoutine: [
      "Gentle cream cleanser",
      "Hydrating toner",
      "Hyaluronic acid serum",
      "Rich moisturizer",
      "Sunscreen SPF 30+",
    ],
    nightRoutine: [
      "Oil-based cleanser",
      "Hydrating toner",
      "Nourishing serum",
      "Night cream or sleeping mask",
      "Facial oil (optional)",
    ],
  },
  sensitive: {
    skinType: "Sensitive Skin",
    description: "Your skin reacts easily to products and environmental factors. Gentle care and minimal ingredients are essential.",
    characteristics: [
      "Easily irritated or inflamed",
      "Prone to redness",
      "May sting or burn with products",
      "Reactive to weather changes",
      "May have conditions like rosacea or eczema",
    ],
    recommendedProducts: [
      "Fragrance-free, gentle cleanser",
      "Soothing toner (chamomile, aloe)",
      "Hypoallergenic moisturizer",
      "Mineral sunscreen",
      "Avoid harsh actives",
    ],
    morningRoutine: [
      "Gentle, fragrance-free cleanser",
      "Soothing toner",
      "Calming serum (centella, niacinamide)",
      "Gentle moisturizer",
      "Mineral sunscreen SPF 30+",
    ],
    nightRoutine: [
      "Micellar water or gentle cleanser",
      "Soothing toner",
      "Repair serum or cream",
      "Rich, barrier-supporting moisturizer",
    ],
  },
};

// Selected answer stores the scores from each chosen option
export type SelectedAnswer = SkinScores;

export const getSkinTypeFromAnswers = (answers: SelectedAnswer[]): SkinType => {
  // Accumulate weighted scores across all answers
  const totalScores: Record<SkinType, number> = {
    normal: 0,
    oily: 0,
    combination: 0,
    dry: 0,
    sensitive: 0,
  };

  answers.forEach((answerScores) => {
    (Object.keys(answerScores) as SkinType[]).forEach((type) => {
      totalScores[type] += answerScores[type] || 0;
    });
  });

  // Smart combination detection:
  // If both oily and dry have significant scores, the user likely has combination skin
  const oilyScore = totalScores.oily;
  const dryScore = totalScores.dry;
  const combinationScore = totalScores.combination;
  const totalAllScores = Object.values(totalScores).reduce((a, b) => a + b, 0);

  // If oily and dry are both strong (each > 20% of total), boost combination
  if (totalAllScores > 0) {
    const oilyPercent = oilyScore / totalAllScores;
    const dryPercent = dryScore / totalAllScores;
    if (oilyPercent > 0.2 && dryPercent > 0.2) {
      totalScores.combination += (oilyScore + dryScore) * 0.4;
    }
  }

  // Find the skin type with the highest total score
  let maxScore = 0;
  let result: SkinType = 'normal';

  (Object.keys(totalScores) as SkinType[]).forEach((type) => {
    if (totalScores[type] > maxScore) {
      maxScore = totalScores[type];
      result = type;
    }
  });

  return result;
};
