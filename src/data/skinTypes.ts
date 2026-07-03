import {
  Droplets,
  Sun,
  Layers,
  Heart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface SkinTypeStep {
  step: string;
  description: string;
  products: string[];
}

export interface SkinTypeIngredient {
  name: string;
  benefit?: string;
  reason?: string;
}

export interface SkinTypeMyth {
  myth: string;
  truth: string;
}

export interface SkinTypeConfig {
  slug: string;
  type: string;
  label: string;
  tagline: string;
  description: string;
  characteristics: string[];
  causes: string[];
  benefits: string[];
  challenges: string[];
  morningRoutine: SkinTypeStep[];
  nightRoutine: SkinTypeStep[];
  ingredients: {
    beneficial: SkinTypeIngredient[];
    avoid: SkinTypeIngredient[];
  };
  lifestyle: string[];
  myths: SkinTypeMyth[];
  tips: string[];
  icon: LucideIcon;
  tokens: {
    accent: string;
    accentLight: string;
    accentDark: string;
    accentForeground: string;
    wash: string;
    border: string;
    gradient: string;
  };
}

const sageBase = {
  accent: "#355245",
  accentLight: "#538670",
  accentDark: "#2A4136",
  accentForeground: "#FFFFFF",
  wash: "#F0F4F2",
  border: "#D8E2DC",
  gradient: "from-[#355245] to-[#538670]",
};

export const skinTypes: Record<string, SkinTypeConfig> = {
  oily: {
    slug: "oily",
    type: "Oily",
    label: "Oily Skin",
    tagline: "Balance excess shine without stripping your barrier",
    description:
      "Oily skin produces more sebum than average, often leading to a glossy T-zone, enlarged pores, and a tendency toward congestion. The goal isn't to dry it out — it's to regulate oil, keep pores clear, and protect the barrier so skin stops overcompensating.",
    characteristics: [
      "Shiny or greasy appearance, especially in T-zone",
      "Enlarged, visible pores",
      "Prone to blackheads, whiteheads, and acne",
      "Makeup tends to slide off or break down",
      "Skin looks thicker and more resilient",
    ],
    causes: [
      "Genetics and hormones (especially androgens)",
      "Hot and humid weather conditions",
      "Stress and lack of sleep",
      "Over-washing or harsh products that strip skin",
      "Hormonal changes (puberty, menstruation, pregnancy)",
    ],
    benefits: [
      "Ages more slowly with fewer fine lines",
      "Natural moisture barrier protection",
      "Better protection against environmental damage",
      "More resilient to external factors",
    ],
    challenges: [
      "Frequent breakouts and acne",
      "Makeup application difficulties",
      "Managing shine throughout the day",
      "Finding the right product balance",
    ],
    morningRoutine: [
      {
        step: "Cleanser",
        description:
          "Use a gentle foaming or gel cleanser to remove excess oil without stripping skin",
        products: ["Salicylic acid cleanser", "Glycolic acid face wash", "Gel cleanser"],
      },
      {
        step: "Toner",
        description:
          "Apply an oil-controlling toner to balance pH and minimize pores",
        products: ["Witch hazel toner", "Niacinamide toner", "Tea tree toner"],
      },
      {
        step: "Serum",
        description: "Use a lightweight serum with oil-controlling ingredients",
        products: ["Niacinamide serum", "Vitamin C serum", "Salicylic acid serum"],
      },
      {
        step: "Moisturizer",
        description: "Apply an oil-free, non-comedogenic moisturizer",
        products: ["Gel moisturizer", "Water-based moisturizer", "Oil-free lotion"],
      },
      {
        step: "Sunscreen",
        description: "Use a mattifying, oil-free SPF 30+ sunscreen",
        products: ["Gel sunscreen", "Mattifying sunscreen", "Mineral powder SPF"],
      },
    ],
    nightRoutine: [
      {
        step: "Double Cleanse",
        description: "Remove makeup with micellar water, then cleanse with gel cleanser",
        products: ["Micellar water", "Oil-free makeup remover", "Gel cleanser"],
      },
      {
        step: "Exfoliate",
        description: "Use chemical exfoliants 2-3 times per week",
        products: ["Salicylic acid", "Glycolic acid", "AHA/BHA toner"],
      },
      {
        step: "Treatment",
        description: "Apply targeted treatments for concerns",
        products: ["Retinol", "Benzoyl peroxide", "Spot treatment"],
      },
      {
        step: "Night Moisturizer",
        description: "Use a slightly richer (but still oil-free) night cream",
        products: ["Lightweight night cream", "Gel-cream moisturizer"],
      },
    ],
    ingredients: {
      beneficial: [
        { name: "Niacinamide", benefit: "Regulates sebum production and minimizes pores" },
        { name: "Salicylic Acid", benefit: "Exfoliates and unclogs pores" },
        { name: "Hyaluronic Acid", benefit: "Hydrates without adding oil" },
        { name: "Tea Tree Oil", benefit: "Natural antibacterial properties" },
        { name: "Zinc", benefit: "Controls oil and reduces inflammation" },
        { name: "Clay", benefit: "Absorbs excess oil and purifies pores" },
      ],
      avoid: [
        { name: "Heavy Oils", reason: "Can clog pores and increase shine" },
        { name: "Alcohol", reason: "Over-dries skin, causing rebound oil production" },
        { name: "Coconut Oil", reason: "Highly comedogenic, clogs pores" },
        { name: "Petroleum-based Products", reason: "Creates occlusive barrier, traps oil" },
      ],
    },
    lifestyle: [
      "Drink plenty of water to flush toxins",
      "Eat a balanced diet low in processed foods and sugar",
      "Manage stress through meditation or exercise",
      "Get 7-9 hours of quality sleep",
      "Avoid touching your face throughout the day",
      "Change pillowcases regularly",
      "Use oil-blotting papers instead of over-washing",
    ],
    myths: [
      {
        myth: "Oily skin doesn't need moisturizer",
        truth:
          "Oily skin still needs hydration. Skipping moisturizer can cause your skin to produce even more oil to compensate.",
      },
      {
        myth: "Washing your face more will reduce oil",
        truth:
          "Over-washing strips natural oils, triggering more oil production. Cleanse twice daily max.",
      },
      {
        myth: "Sun exposure dries out oily skin",
        truth:
          "Sun damage can worsen oil production and cause premature aging. Always wear sunscreen.",
      },
    ],
    tips: [
      "Use blotting papers instead of powder to manage shine",
      "Keep a mattifying primer in your makeup routine",
      "Avoid hot water when washing - use lukewarm instead",
      "Don't skip moisturizer, choose oil-free formulas",
      "Consider seeing a dermatologist if acne is severe",
    ],
    icon: Droplets,
    tokens: {
      accent: "#4A7C6F",
      accentLight: "#6BA99A",
      accentDark: "#3A6358",
      accentForeground: "#FFFFFF",
      wash: "#EEF5F3",
      border: "#D4E4DF",
      gradient: "from-[#4A7C6F] to-[#6BA99A]",
    },
  },
  dry: {
    slug: "dry",
    type: "Dry",
    label: "Dry Skin",
    tagline: "Restore comfort, softness, and lasting hydration",
    description:
      "Dry skin lacks sufficient moisture and natural oils, which can leave it feeling tight, flaky, or rough. The focus is on replenishing lipids, strengthening the barrier, and sealing in hydration so skin stays comfortable all day.",
    characteristics: [
      "Tight, uncomfortable feeling after cleansing",
      "Visible flakes or rough patches",
      "Dull, lackluster complexion",
      "Fine lines more noticeable",
      "Skin may feel itchy or irritated",
    ],
    causes: [
      "Low humidity and cold weather",
      "Hot showers and harsh soaps",
      "Genetic predisposition",
      "Aging (decreased oil production)",
      "Medical conditions (eczema, psoriasis)",
      "Harsh skincare products",
    ],
    benefits: [
      "Rarely deals with breakouts or acne",
      "Smaller, less visible pores",
      "Makeup applies smoothly",
      "Responds well to rich moisturizers",
    ],
    challenges: [
      "Constant need for moisturization",
      "Sensitivity to weather changes",
      "Premature fine lines",
      "Skin barrier easily compromised",
    ],
    morningRoutine: [
      {
        step: "Gentle Cleanser",
        description: "Use a creamy, hydrating cleanser or just rinse with water",
        products: ["Cream cleanser", "Milk cleanser", "Oil cleanser"],
      },
      {
        step: "Hydrating Toner",
        description: "Apply essence or hydrating toner to prep skin",
        products: ["Hyaluronic acid toner", "Rose water", "Glycerin toner"],
      },
      {
        step: "Serum",
        description: "Layer hydrating and nourishing serums",
        products: ["Hyaluronic acid serum", "Vitamin E serum", "Peptide serum"],
      },
      {
        step: "Eye Cream",
        description: "Apply rich eye cream to delicate under-eye area",
        products: ["Ceramide eye cream", "Peptide eye cream"],
      },
      {
        step: "Moisturizer",
        description: "Use a rich, emollient moisturizer",
        products: ["Cream moisturizer", "Ceramide cream", "Shea butter cream"],
      },
      {
        step: "Sunscreen",
        description: "Apply moisturizing SPF 30+ sunscreen",
        products: ["Cream sunscreen", "Hydrating SPF", "Mineral moisturizing SPF"],
      },
    ],
    nightRoutine: [
      {
        step: "Oil Cleanse",
        description: "Remove makeup with nourishing cleansing oil or balm",
        products: ["Cleansing balm", "Cleansing oil", "Micellar oil"],
      },
      {
        step: "Gentle Cleanser",
        description: "Follow with cream cleanser if needed",
        products: ["Cream cleanser", "Milk cleanser"],
      },
      {
        step: "Hydrating Essence",
        description: "Layer multiple hydrating products",
        products: ["Hydrating essence", "Facial oil", "Hyaluronic acid"],
      },
      {
        step: "Treatment",
        description: "Apply targeted treatments",
        products: ["Retinol", "Peptide serum", "Ceramide treatment"],
      },
      {
        step: "Night Cream",
        description: "Apply thick, nourishing night cream",
        products: ["Rich night cream", "Sleeping mask", "Face oil"],
      },
      {
        step: "Optional: Face Oil",
        description: "Seal everything in with facial oil",
        products: ["Rosehip oil", "Argan oil", "Squalane oil"],
      },
    ],
    ingredients: {
      beneficial: [
        { name: "Hyaluronic Acid", benefit: "Attracts and retains moisture" },
        { name: "Ceramides", benefit: "Repairs and strengthens skin barrier" },
        { name: "Glycerin", benefit: "Humectant that draws water to skin" },
        { name: "Shea Butter", benefit: "Rich emollient that nourishes" },
        { name: "Squalane", benefit: "Mimics skin's natural oils" },
        { name: "Peptides", benefit: "Supports collagen and repairs" },
      ],
      avoid: [
        { name: "Alcohol Denat", reason: "Extremely drying and irritating" },
        { name: "Fragrances", reason: "Can irritate sensitive dry skin" },
        { name: "Harsh Sulfates", reason: "Strip natural oils from skin" },
        { name: "Physical Exfoliants", reason: "Can damage compromised barrier" },
      ],
    },
    lifestyle: [
      "Use a humidifier in dry environments",
      "Drink 8+ glasses of water daily",
      "Limit hot showers to 10 minutes",
      "Pat skin dry instead of rubbing",
      "Wear SPF even in winter",
      "Eat omega-3 rich foods (salmon, walnuts)",
      "Avoid harsh soaps and detergents",
    ],
    myths: [
      {
        myth: "Dry skin doesn't need sunscreen",
        truth:
          "All skin types need SPF. Sun exposure further damages the skin barrier.",
      },
      {
        myth: "Drinking more water cures dry skin",
        truth:
          "While hydration helps, topical moisturizers are essential to lock in moisture.",
      },
      {
        myth: "Oils make your skin oily",
        truth:
          "Facial oils actually help repair the skin barrier and prevent moisture loss.",
      },
    ],
    tips: [
      "Apply moisturizer to damp skin for better absorption",
      "Layer products from thinnest to thickest",
      "Keep a facial mist handy for quick hydration",
      "Avoid very hot water on your face",
      "Consider a overnight sleeping mask weekly",
    ],
    icon: Sun,
    tokens: {
      accent: "#C8A48A",
      accentLight: "#D9BFA8",
      accentDark: "#A6856C",
      accentForeground: "#FFFFFF",
      wash: "#FAF6F2",
      border: "#E9DDD3",
      gradient: "from-[#C8A48A] to-[#D9BFA8]",
    },
  },
  combination: {
    slug: "combination",
    type: "Combination",
    label: "Combination Skin",
    tagline: "Balance the oily zones and nourish the dry ones",
    description:
      "Combination skin has two or more skin types at once — usually an oily T-zone alongside normal or dry cheeks. Care is about targeted, zone-specific treatment rather than one product for the whole face.",
    characteristics: [
      "Oily forehead, nose, and chin (T-zone)",
      "Normal to dry cheeks and jaw",
      "Larger pores in T-zone",
      "Occasional breakouts in oily areas",
      "Different concerns in different zones",
    ],
    causes: [
      "Genetics (most common cause)",
      "Variable sebaceous gland activity",
      "Hormonal fluctuations",
      "Seasonal changes",
      "Using wrong products for your skin",
    ],
    benefits: [
      "Versatility in product choices",
      "Not as prone to issues as fully oily skin",
      "Can adapt routine seasonally",
      "Generally well-balanced overall",
    ],
    challenges: [
      "Finding one-size-fits-all products",
      "Managing two different skin types",
      "Balancing oiliness and dryness",
      "Needs customized approach",
    ],
    morningRoutine: [
      {
        step: "Gentle Cleanser",
        description: "Use a balanced gel or foam cleanser",
        products: ["Gentle gel cleanser", "Balanced foam cleanser"],
      },
      {
        step: "Toner",
        description: "Apply balancing toner all over",
        products: ["Balancing toner", "Witch hazel", "Rose water"],
      },
      {
        step: "Serum (Zone Targeted)",
        description: "Niacinamide for T-zone, hydrating serum for cheeks",
        products: ["Niacinamide serum", "Hyaluronic acid", "Multi-action serum"],
      },
      {
        step: "Moisturizer (Multi-masking)",
        description: "Lighter gel for T-zone, richer cream for cheeks",
        products: ["Gel-cream hybrid", "Lightweight moisturizer", "Zone-specific creams"],
      },
      {
        step: "Sunscreen",
        description: "Use a lightweight, non-comedogenic SPF",
        products: ["Gel sunscreen", "Lightweight SPF", "Mineral sunscreen"],
      },
    ],
    nightRoutine: [
      {
        step: "Cleanse",
        description: "Double cleanse if wearing makeup",
        products: ["Micellar water", "Balanced cleanser"],
      },
      {
        step: "Exfoliate",
        description: "Use chemical exfoliant on T-zone 2-3x/week",
        products: ["BHA for T-zone", "Gentle AHA for cheeks"],
      },
      {
        step: "Treatment",
        description: "Spot treat oily zones, nourish dry areas",
        products: ["Retinol", "Targeted treatments"],
      },
      {
        step: "Night Moisturizer",
        description: "Apply appropriate moisturizer to each zone",
        products: ["Balanced night cream", "Multi-zone formula"],
      },
    ],
    ingredients: {
      beneficial: [
        { name: "Niacinamide", benefit: "Balances oil production" },
        { name: "Hyaluronic Acid", benefit: "Hydrates without oil" },
        { name: "Salicylic Acid", benefit: "Controls oil in T-zone" },
        { name: "Peptides", benefit: "Nourishes dry areas" },
        { name: "Green Tea Extract", benefit: "Balances and soothes" },
      ],
      avoid: [
        { name: "Heavy Oils", reason: "Too rich for oily zones" },
        { name: "Harsh Sulfates", reason: "Over-dry your dry areas" },
        { name: "Strong Alcohol", reason: "Disrupts balance" },
      ],
    },
    lifestyle: [
      "Adjust routine seasonally",
      "Pay attention to hormonal changes",
      "Stay hydrated",
      "Use different products for different zones",
      "Keep blotting papers handy for T-zone",
    ],
    myths: [
      {
        myth: "You need completely different routines",
        truth:
          "Many products work for combination skin. Focus on balance and zone-specific treatments only when needed.",
      },
      {
        myth: "Combination skin is permanent",
        truth:
          "Your skin type can change with age, seasons, and hormones. Stay adaptable.",
      },
    ],
    tips: [
      'Master the art of "multi-masking" - different masks for different zones',
      "Consider gel-cream hybrid moisturizers",
      "Don't over-treat oily areas",
      "Adjust routine with seasons",
      "Listen to what each zone needs",
    ],
    icon: Layers,
    tokens: {
      accent: "#7A9B76",
      accentLight: "#9BB896",
      accentDark: "#5E7A5A",
      accentForeground: "#FFFFFF",
      wash: "#F1F5F0",
      border: "#D7E3D5",
      gradient: "from-[#7A9B76] to-[#9BB896]",
    },
  },
  sensitive: {
    slug: "sensitive",
    type: "Sensitive",
    label: "Sensitive Skin",
    tagline: "Calm, strengthen, and protect your skin barrier",
    description:
      "Sensitive skin reacts easily to products, weather, or stress. It often signals a compromised barrier. The approach is minimalist: gentle formulas, fewer actives, and building resilience slowly over time.",
    characteristics: [
      "Redness, flushing, or rosacea",
      "Stinging or burning sensations",
      "Itchy, tight, or uncomfortable feeling",
      "Reacts to products, weather, or stress",
      "Visible blood vessels or capillaries",
    ],
    causes: [
      "Compromised skin barrier",
      "Genetic predisposition",
      "Conditions like rosacea or eczema",
      "Environmental triggers (sun, wind, pollution)",
      "Harsh products or over-exfoliation",
    ],
    benefits: [
      "Forces you to use gentler, better products",
      "Makes you more aware of ingredients",
      "Usually clear of acne (when not reactive)",
      "Responds well to proper care",
    ],
    challenges: [
      "Limited product options",
      "Frequent reactions to new products",
      "Visible redness and irritation",
      "Need to patch test everything",
    ],
    morningRoutine: [
      {
        step: "Gentle Cleanser",
        description: "Use ultra-gentle, fragrance-free cleanser or just water",
        products: ["Gentle milk cleanser", "Micellar water", "Cream cleanser"],
      },
      {
        step: "Soothing Toner",
        description: "Apply calming, alcohol-free toner",
        products: ["Centella toner", "Thermal water", "Chamomile toner"],
      },
      {
        step: "Calming Serum",
        description: "Use minimal, soothing serum",
        products: ["Centella serum", "Azelaic acid", "Niacinamide (low %)"],
      },
      {
        step: "Barrier Repair",
        description: "Apply ceramide-rich moisturizer",
        products: ["Ceramide moisturizer", "Barrier cream", "Gentle lotion"],
      },
      {
        step: "Mineral Sunscreen",
        description: "Use gentle, physical SPF 30+",
        products: ["Zinc oxide sunscreen", "Mineral SPF", "Sensitive formula"],
      },
    ],
    nightRoutine: [
      {
        step: "Gentle Cleanse",
        description: "Use minimal cleanser or micellar water",
        products: ["Micellar water", "Gentle cleanser"],
      },
      {
        step: "Calming Treatment",
        description: "Apply soothing essence or serum",
        products: ["Centella essence", "Calming serum"],
      },
      {
        step: "Repair Cream",
        description: "Use rich, barrier-repairing night cream",
        products: ["Ceramide night cream", "Gentle repair cream"],
      },
      {
        step: "Optional: Occlusive",
        description: "Seal with gentle occlusive if very dry",
        products: ["Gentle face oil", "Ceramide ointment"],
      },
    ],
    ingredients: {
      beneficial: [
        { name: "Centella Asiatica", benefit: "Calms inflammation and repairs" },
        { name: "Ceramides", benefit: "Strengthens barrier function" },
        { name: "Colloidal Oatmeal", benefit: "Soothes irritation" },
        { name: "Azelaic Acid", benefit: "Gentle anti-inflammatory" },
        { name: "Niacinamide (low %)", benefit: "Calms (at 2-5% concentration)" },
        { name: "Allantoin", benefit: "Soothes and heals" },
      ],
      avoid: [
        { name: "Fragrances", reason: "Common irritants and allergens" },
        { name: "Essential Oils", reason: "Can trigger reactions" },
        { name: "Alcohol Denat", reason: "Drying and irritating" },
        { name: "Strong Acids", reason: "Too harsh for sensitive skin" },
        { name: "Physical Scrubs", reason: "Cause micro-tears" },
      ],
    },
    lifestyle: [
      "Always patch test new products",
      "Avoid extreme temperatures",
      "Protect face from wind and cold",
      "Manage stress levels",
      "Identify and avoid your triggers",
      "Keep a skincare diary",
      "Use gentle, fragrance-free laundry detergent",
    ],
    myths: [
      {
        myth: "Sensitive skin can't use active ingredients",
        truth:
          "You can use actives, but choose gentle formulas and introduce slowly (azelaic acid, low % niacinamide).",
      },
      {
        myth: "Natural products are always safe",
        truth:
          "Natural doesn't mean safe. Essential oils and plant extracts can be highly irritating.",
      },
      {
        myth: "You'll outgrow sensitive skin",
        truth:
          "Some people improve with proper care, but many remain sensitive. The goal is management.",
      },
    ],
    tips: [
      "Less is more - keep routine minimal",
      "Patch test for 48 hours before full use",
      'Look for "fragrance-free" not "unscented"',
      "Avoid physical exfoliation",
      "Consider seeing a dermatologist for persistent issues",
    ],
    icon: Heart,
    tokens: {
      accent: "#C58A7F",
      accentLight: "#D6A399",
      accentDark: "#A36C62",
      accentForeground: "#FFFFFF",
      wash: "#FCF6F5",
      border: "#EDDCD7",
      gradient: "from-[#C58A7F] to-[#D6A399]",
    },
  },
  normal: {
    slug: "normal",
    type: "Normal",
    label: "Normal Skin",
    tagline: "Maintain balance and protect your healthy glow",
    description:
      "Normal skin is balanced, with neither excess oil nor dryness. Pores are small and concerns are minimal. The goal is maintenance: protect the barrier, prevent damage, and preserve what already works.",
    characteristics: [
      "Balanced moisture and oil production",
      "Small, barely visible pores",
      "Even skin tone and texture",
      "Rare breakouts or sensitivity",
      "Radiant, healthy appearance",
    ],
    causes: [
      "Genetic blessing",
      "Good skincare habits",
      "Healthy lifestyle",
      "Balanced hormones",
      "Proper skin barrier function",
    ],
    benefits: [
      "Most products work well",
      "Minimal skin concerns",
      "Makeup applies beautifully",
      "Resilient to changes",
      "Ages well with proper care",
    ],
    challenges: [
      "May take skin for granted",
      "Can become complacent",
      "Still needs sun protection",
      "Can change with age/seasons",
    ],
    morningRoutine: [
      {
        step: "Gentle Cleanser",
        description: "Use balanced gel or cream cleanser",
        products: ["Gentle gel cleanser", "Cream cleanser", "Balanced wash"],
      },
      {
        step: "Toner",
        description: "Apply hydrating or brightening toner",
        products: ["Hydrating toner", "Vitamin C toner", "Rose water"],
      },
      {
        step: "Serum",
        description: "Choose based on goals (brightening, anti-aging)",
        products: ["Vitamin C serum", "Hyaluronic acid", "Antioxidant serum"],
      },
      {
        step: "Eye Cream",
        description: "Apply preventative eye cream",
        products: ["Peptide eye cream", "Brightening eye cream"],
      },
      {
        step: "Moisturizer",
        description: "Use lightweight, balanced moisturizer",
        products: ["Gel-cream", "Balanced lotion", "Lightweight cream"],
      },
      {
        step: "Sunscreen",
        description: "Apply broad-spectrum SPF 30+ daily",
        products: ["Lightweight SPF", "Moisturizing sunscreen"],
      },
    ],
    nightRoutine: [
      {
        step: "Double Cleanse",
        description: "Remove makeup, then cleanse",
        products: ["Cleansing oil/balm", "Gentle cleanser"],
      },
      {
        step: "Exfoliate",
        description: "Use gentle chemical exfoliant 2-3x/week",
        products: ["AHA/BHA toner", "Gentle exfoliant"],
      },
      {
        step: "Treatment Serum",
        description: "Apply targeted treatment",
        products: ["Retinol", "Peptides", "Niacinamide"],
      },
      {
        step: "Eye Cream",
        description: "Apply richer night eye cream",
        products: ["Retinol eye cream", "Peptide eye treatment"],
      },
      {
        step: "Night Cream",
        description: "Use nourishing night moisturizer",
        products: ["Night cream", "Sleeping mask"],
      },
    ],
    ingredients: {
      beneficial: [
        { name: "Vitamin C", benefit: "Brightens and protects" },
        { name: "Retinol", benefit: "Anti-aging prevention" },
        { name: "Hyaluronic Acid", benefit: "Maintains hydration" },
        { name: "Niacinamide", benefit: "Overall skin health" },
        { name: "Peptides", benefit: "Supports collagen" },
        { name: "Antioxidants", benefit: "Prevents damage" },
      ],
      avoid: [
        { name: "Harsh Sulfates", reason: "Can disrupt balance" },
        { name: "Over-exfoliation", reason: "Unnecessary irritation" },
      ],
    },
    lifestyle: [
      "Maintain consistent routine",
      "Stay hydrated",
      "Eat balanced, nutritious diet",
      "Get adequate sleep",
      "Manage stress",
      "Exercise regularly",
      "Never skip sunscreen",
    ],
    myths: [
      {
        myth: "Normal skin doesn't need much care",
        truth:
          "Prevention is key! Proper care now prevents future issues and maintains your skin's health.",
      },
      {
        myth: "You can use any product",
        truth:
          "While you have more flexibility, quality ingredients still matter for long-term health.",
      },
      {
        myth: "Normal skin won't change",
        truth:
          "Skin type can shift with age, hormones, climate, and lifestyle. Stay attentive.",
      },
    ],
    tips: [
      "Focus on prevention - use sunscreen daily",
      "Start anti-aging products early (mid-20s)",
      "Don't take your skin for granted",
      "Adjust routine with seasons",
      "Maintain healthy lifestyle habits",
    ],
    icon: Sparkles,
    tokens: {
      accent: "#D4B896",
      accentLight: "#E5CEAD",
      accentDark: "#B89A78",
      accentForeground: "#2A241E",
      wash: "#FCF9F5",
      border: "#EFE5D7",
      gradient: "from-[#D4B896] to-[#E5CEAD]",
    },
  },
};

export const skinTypeSlugs = Object.keys(skinTypes);

export function getSkinType(slug: string): SkinTypeConfig | undefined {
  return skinTypes[slug.toLowerCase()];
}

export function getAllSkinTypes(): SkinTypeConfig[] {
  return Object.values(skinTypes);
}
