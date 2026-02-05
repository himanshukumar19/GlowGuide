export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    points: number;
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
    question: "How does your skin feel a few hours after washing?",
    options: [
      { text: "Comfortable, neither dry nor oily", points: 1 },
      { text: "Shiny and greasy all over", points: 2 },
      { text: "Oily in T-zone, normal/dry elsewhere", points: 3 },
      { text: "Tight, dry, or flaky", points: 4 },
      { text: "Red, itchy, or irritated", points: 5 },
    ],
  },
  {
    id: 2,
    question: "How often do you experience breakouts?",
    options: [
      { text: "Rarely or never", points: 1 },
      { text: "Often, especially in oily areas", points: 2 },
      { text: "Sometimes in T-zone only", points: 3 },
      { text: "Rarely, but skin feels rough", points: 4 },
      { text: "Sometimes, with redness and irritation", points: 5 },
    ],
  },
  {
    id: 3,
    question: "How does your skin react to new products or weather changes?",
    options: [
      { text: "Adapts well, no issues", points: 1 },
      { text: "Gets more oily or breaks out", points: 2 },
      { text: "T-zone gets oilier, cheeks may get dry", points: 3 },
      { text: "Gets drier, may peel or flake", points: 4 },
      { text: "Gets red, burns, or itches easily", points: 5 },
    ],
  },
  {
    id: 4,
    question: "How large are your pores?",
    options: [
      { text: "Small and barely visible", points: 1 },
      { text: "Large and visible all over", points: 2 },
      { text: "Large on nose/forehead, small elsewhere", points: 3 },
      { text: "Very small, skin looks tight", points: 4 },
      { text: "Varies, often with redness around them", points: 5 },
    ],
  },
  {
    id: 5,
    question: "How does your skin feel at the end of the day?",
    options: [
      { text: "Still comfortable and balanced", points: 1 },
      { text: "Very shiny and oily", points: 2 },
      { text: "Oily T-zone, rest is fine or dry", points: 3 },
      { text: "Tight, dry, needs moisture", points: 4 },
      { text: "Irritated, sensitive, or uncomfortable", points: 5 },
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

export const getSkinTypeFromScore = (score: number): string => {
  if (score >= 5 && score <= 7) return "normal";
  if (score >= 8 && score <= 10) return "oily";
  if (score >= 11 && score <= 13) return "combination";
  if (score >= 14 && score <= 17) return "dry";
  if (score >= 18 && score <= 25) return "sensitive";
  return "normal";
};
