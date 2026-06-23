export type SkinType = 'normal' | 'oily' | 'combination' | 'dry' | 'sensitive';

// Each option maps directly to a numeric value matching the CSV feature range
// These values are sent to the ML backend as a feature vector
export interface QuizOption {
  label: string;     // Main option text shown to user
  sublabel: string;  // Descriptive hint below the label
  value: number;     // Numeric value matching CSV column range (sent to ML model)
}

export interface QuizQuestion {
  id: string;                                   // Matches the CSV feature column name
  question: string;
  emoji: string;                                // Visual icon for the question
  importance: 'critical' | 'high' | 'medium';  // Controls UI badge display
  helpText?: string;                            // Optional tip shown below the question
  options: QuizOption[];
}

// User answers stored as feature_name → numeric value (ready to send to ML service)
export type QuizAnswers = Record<string, number>;

export interface QuizResult {
  skinType: string;
  description: string;
  characteristics: string[];
  recommendedProducts: string[];
  morningRoutine: string[];
  nightRoutine: string[];
}

// 6 questions ordered by ML feature importance
// id matches the CSV column name — used as the feature key sent to the ML backend
export const quizQuestions: QuizQuestion[] = [
  {
    id: 'sebum_level',
    question: 'How oily is your skin throughout the day?',
    emoji: '✨',
    importance: 'critical',
    helpText: 'This is our most important question — take a moment to think!',
    options: [
      { label: 'Extremely Dry',   sublabel: 'Feels tight, flaky and uncomfortable all day', value: 10 },
      { label: 'Very Dry',        sublabel: 'Often tight, always needs moisture',            value: 25 },
      { label: 'Slightly Dry',    sublabel: 'Occasionally tight in certain areas',           value: 40 },
      { label: 'Balanced',        sublabel: 'Comfortable, neither oily nor dry',             value: 50 },
      { label: 'Slightly Oily',   sublabel: 'T-zone gets shiny by afternoon',                value: 65 },
      { label: 'Very Oily',       sublabel: 'Face is shiny within 2–3 hours of washing',    value: 80 },
      { label: 'Extremely Oily',  sublabel: 'Constantly greasy with visible oil shine',     value: 95 },
    ],
  },
  {
    id: 'hydration_level',
    question: 'How hydrated does your skin feel?',
    emoji: '💧',
    importance: 'critical',
    helpText: 'Oil ≠ moisture! Oily skin can still be dehydrated.',
    options: [
      { label: 'Severely Dehydrated', sublabel: 'Cracked, peeling, very uncomfortable',       value: 10 },
      { label: 'Very Dehydrated',     sublabel: 'Tight, flaky, rough texture',                value: 23 },
      { label: 'Dehydrated',          sublabel: 'Tight after washing, needs constant moisture',value: 36 },
      { label: 'Normal',              sublabel: 'Generally comfortable throughout the day',   value: 50 },
      { label: 'Well Hydrated',       sublabel: 'Soft, plump and comfortable',                value: 64 },
      { label: 'Very Hydrated',       sublabel: 'Always feels moisturized and supple',        value: 77 },
      { label: 'Extremely Hydrated',  sublabel: 'Perfectly plump, never feels dry',           value: 90 },
    ],
  },
  {
    id: 'acne_frequency',
    question: 'How often do you experience breakouts?',
    emoji: '🔬',
    importance: 'high',
    options: [
      { label: 'Never',      sublabel: 'Clear skin, virtually no breakouts',      value: 10 },
      { label: 'Rarely',     sublabel: '1–2 times per year',                      value: 30 },
      { label: 'Sometimes',  sublabel: 'Monthly or around hormonal cycle',        value: 50 },
      { label: 'Often',      sublabel: 'Weekly breakouts',                        value: 70 },
      { label: 'Constantly', sublabel: 'Always have active breakouts',            value: 90 },
    ],
  },
  {
    id: 'pore_size',
    question: 'How visible are your pores?',
    emoji: '🔍',
    importance: 'high',
    options: [
      { label: 'Invisible',    sublabel: 'Cannot see them at all',                value: 15 },
      { label: 'Very Small',   sublabel: 'Barely visible even up close',          value: 32 },
      { label: 'Noticeable',   sublabel: 'Visible mainly on the T-zone',          value: 50 },
      { label: 'Large',        sublabel: 'Clearly visible across the face',       value: 68 },
      { label: 'Very Large',   sublabel: 'Prominent, enlarged pores everywhere',  value: 85 },
    ],
  },
  {
    id: 'sensitivity_score',
    question: 'How does your skin react to new products?',
    emoji: '🌡️',
    importance: 'medium',
    options: [
      { label: 'Not Sensitive',        sublabel: 'Rarely reacts, tolerates almost everything', value: 15 },
      { label: 'Slightly Sensitive',   sublabel: 'Occasional mild reactions',                  value: 32 },
      { label: 'Sensitive',            sublabel: 'Reacts to certain products',                 value: 50 },
      { label: 'Very Sensitive',       sublabel: 'Frequent redness and irritation',            value: 68 },
      { label: 'Extremely Sensitive',  sublabel: 'Reacts to almost everything',                value: 85 },
    ],
  },
  {
    id: 'roughness_score',
    question: 'How would you describe your skin texture?',
    emoji: '✋',
    importance: 'medium',
    options: [
      { label: 'Very Rough',  sublabel: 'Bumpy, uneven, lots of visible texture', value: 20 },
      { label: 'Rough',       sublabel: 'Some bumps and unevenness',              value: 35 },
      { label: 'Normal',      sublabel: 'Generally smooth with minor texture',    value: 50 },
      { label: 'Smooth',      sublabel: 'Soft and even to the touch',             value: 70 },
      { label: 'Very Smooth', sublabel: 'Silky, almost flawless texture',         value: 90 },
    ],
  },
  {
    id: 'tightness_score',
    question: 'How tight or comfortable does your skin feel after washing?',
    emoji: '🫧',
    importance: 'medium',
    helpText: 'Judge right after washing — before applying any product.',
    options: [
      { label: 'Extremely Tight',  sublabel: 'Feels like it could crack, very uncomfortable', value: 90 },
      { label: 'Very Tight',       sublabel: 'Noticeably pulls and feels stiff',              value: 70 },
      { label: 'Slightly Tight',   sublabel: 'A little tight but bearable',                  value: 50 },
      { label: 'Comfortable',      sublabel: 'Feels normal and relaxed',                     value: 30 },
      { label: 'No Tightness',     sublabel: 'No tightness at all, feels soft immediately',  value: 10 },
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

// Local skin type prediction from feature values
// This runs in the browser until the ML backend is connected (Phase 1 backend)
// Once backend is ready, the frontend will POST these values to /api/skin-analysis instead
export const getSkinTypeFromAnswers = (answers: QuizAnswers): SkinType => {
  const sebum       = answers['sebum_level']      ?? 50;
  const hydration   = answers['hydration_level']  ?? 50;
  const acne        = answers['acne_frequency']    ?? 50;
  const pore        = answers['pore_size']         ?? 50;
  const sensitivity = answers['sensitivity_score'] ?? 50;
  const roughness   = answers['roughness_score']   ?? 50;
  const tightness   = answers['tightness_score']   ?? 30;

  // Sensitive skin — highest priority check
  if (sensitivity >= 60) return 'sensitive';

  // Build oily and dry scores from feature values
  let oilyScore = 0;
  let dryScore  = 0;

  // sebum_level: high = oily, low = dry
  if (sebum >= 65) oilyScore += 3;
  else if (sebum >= 55) oilyScore += 1.5;
  else if (sebum <= 30) dryScore += 3;
  else if (sebum <= 45) dryScore += 1.5;

  // hydration_level: low = dry signal
  if (hydration <= 36) dryScore += 3;
  else if (hydration <= 45) dryScore += 1.5;

  // acne_frequency: high = oily signal
  if (acne >= 70) oilyScore += 2;
  else if (acne >= 55) oilyScore += 1;

  // pore_size: large = oily signal
  if (pore >= 68) oilyScore += 2;
  else if (pore >= 55) oilyScore += 1;

  // roughness_score: low (rough) = dry signal
  if (roughness <= 35) dryScore += 2;
  else if (roughness <= 45) dryScore += 1;

  // tightness_score: high tightness = strong dry signal
  if (tightness >= 70) dryScore += 3;
  else if (tightness >= 50) dryScore += 1.5;

  // Combination: both oily and dry signals are strong
  if (oilyScore >= 2.5 && dryScore >= 2.5) return 'combination';
  if (oilyScore >= 3) return 'oily';
  if (dryScore >= 3) return 'dry';
  if (oilyScore > dryScore) return 'oily';
  if (dryScore > oilyScore) return 'dry';

  return 'normal';
};
