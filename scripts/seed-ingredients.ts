import { db } from "@/lib/firebase-admin";

const ALL_INGREDIENTS = [
  {
    name: "Centella Asiatica (Cica)",
    description: "A botanical herb known for its exceptional wound healing and anti-inflammatory properties.",
    benefits: ["Calms redness and inflammation", "Repairs skin barrier", "Stimulates collagen synthesis"],
    sideEffects: ["Extremely rare contact dermatitis"],
    suitableSkinTypes: ["Sensitive", "Dry", "Combination", "Normal"],
    category: "Soothing Agent",
    safetyRating: "safe",
  },
  {
    name: "Ceramides",
    description: "Lipids that make up over 50% of the skin barrier, essential for moisture retention.",
    benefits: ["Restores skin moisture barrier", "Prevents transepidermal water loss", "Smoothes skin texture"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Dry", "Sensitive", "Normal", "Combination", "Oily"],
    category: "Barrier Restorer",
    safetyRating: "safe",
  },
  {
    name: "Glycolic Acid",
    description: "The smallest alpha hydroxy acid molecule that penetrates deeply to dissolve dead skin cells.",
    benefits: ["Brightens dull skin tone", "Fades hyperpigmentation", "Smooths fine lines"],
    sideEffects: ["Mild stinging", "Increased sun sensitivity", "Redness if overused"],
    suitableSkinTypes: ["Normal", "Dry", "Combination"],
    category: "Chemical Exfoliant (AHA)",
    safetyRating: "moderate",
  },
  {
    name: "Hyaluronic Acid",
    description: "A powerful moisture-binding ingredient capable of holding up to 1000 times its weight in water.",
    benefits: ["Intense surface hydration", "Reduces dehydration lines", "Plumps skin surface"],
    sideEffects: ["Can dry out skin if applied in dry climates without a locking moisturizer"],
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Oily", "Sensitive"],
    category: "Humectant",
    safetyRating: "safe",
  },
  {
    name: "Niacinamide (Vitamin B3)",
    description: "A water-soluble vitamin that works to refine pores, even skin tone, and strengthen the barrier.",
    benefits: ["Regulates excess sebum", "Reduces hyperpigmentation", "Minimizes visible pores"],
    sideEffects: ["Mild flushing at high concentrations (>10%)"],
    suitableSkinTypes: ["Oily", "Combination", "Normal", "Dry", "Sensitive"],
    category: "Multitasker",
    safetyRating: "safe",
  },
  {
    name: "Retinol (Vitamin A)",
    description: "A gold-standard active that speeds up skin cell renewal and boosts collagen production.",
    benefits: ["Speeds up cell turnover", "Fades wrinkles", "Clears congested pores"],
    sideEffects: ["Dryness and flaking", "Sun sensitivity", "Redness and irritation"],
    suitableSkinTypes: ["Normal", "Dry", "Combination", "Oily"],
    category: "Anti-Aging Active",
    safetyRating: "caution",
  },
  {
    name: "Salicylic Acid (BHA)",
    description: "An oil-soluble exfoliant that penetrates deep into pores to dissolve sebum and debris.",
    benefits: ["Clears deep clogged pores", "Exfoliates interior pore walls", "Reduces acne breakouts"],
    sideEffects: ["Mild dryness", "Slight irritation on compromised skin"],
    suitableSkinTypes: ["Oily", "Combination"],
    category: "Acne Treatment",
    safetyRating: "moderate",
  },
  {
    name: "Vitamin C (L-Ascorbic Acid)",
    description: "A potent antioxidant that neutralizes free radicals and brightens skin tone.",
    benefits: ["Neutralizes free radical damage", "Fades sun spots", "Enhances natural radiance"],
    sideEffects: ["Tingling sensation", "Can oxidize easily if exposed to light"],
    suitableSkinTypes: ["Normal", "Dry", "Combination", "Oily"],
    category: "Antioxidant",
    safetyRating: "moderate",
  },
  // ——— new foundational ingredients ———
  {
    name: "Lactic Acid",
    description: "A gentle alpha hydroxy acid derived from milk that exfoliates the skin surface while also hydrating.",
    benefits: ["Gently exfoliates dead skin cells", "Improves skin texture and tone", "Boosts hydration levels"],
    sideEffects: ["Mild tingling", "Sun sensitivity"],
    suitableSkinTypes: ["Dry", "Sensitive", "Normal", "Combination"],
    category: "Chemical Exfoliant (AHA)",
    safetyRating: "moderate",
  },
  {
    name: "Peptides",
    description: "Short chains of amino acids that signal skin cells to produce more collagen and elastin.",
    benefits: ["Boosts collagen production", "Firms and tightens skin", "Reduces fine lines and wrinkles"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["All skin types"],
    category: "Anti-Aging Active",
    safetyRating: "safe",
  },
  {
    name: "Squalane",
    description: "A lightweight, non-comedogenic oil that mimics skin's natural sebum for weightless moisture.",
    benefits: ["Deeply moisturizes without clogging pores", "Balances oil production", "Strengthens skin barrier"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Dry", "Oily", "Combination", "Sensitive", "Normal"],
    category: "Emollient",
    safetyRating: "safe",
  },
  {
    name: "Glycerin",
    description: "A naturally occurring humectant that draws moisture from the air into the skin for lasting hydration.",
    benefits: ["Attracts and locks in moisture", "Softens and smoothes skin", "Strengthens skin barrier function"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Dry", "Normal", "Oily", "Combination", "Sensitive"],
    category: "Humectant",
    safetyRating: "safe",
  },
  {
    name: "Panthenol (Pro-Vitamin B5)",
    description: "A deeply hydrating and soothing B-vitamin that attracts moisture and calms irritated skin.",
    benefits: ["Deeply hydrates and plumps skin", "Soothes redness and irritation", "Accelerates wound healing"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Sensitive", "Dry", "Normal", "Combination"],
    category: "Soothing Agent",
    safetyRating: "safe",
  },
  {
    name: "Azelaic Acid",
    description: "A naturally occurring dicarboxylic acid that brightens skin, fights acne, and calms redness.",
    benefits: ["Fades post-acne marks and hyperpigmentation", "Kills acne-causing bacteria", "Calms rosacea-related redness"],
    sideEffects: ["Mild itching or stinging on first use"],
    suitableSkinTypes: ["Oily", "Combination", "Sensitive", "Normal"],
    category: "Brightening / Anti-Acne",
    safetyRating: "safe",
  },
  {
    name: "Bakuchiol",
    description: "A plant-derived alternative to retinol that delivers comparable anti-aging benefits without irritation.",
    benefits: ["Smooths fine lines and wrinkles", "Evens skin tone and texture", "Gentle enough for sensitive skin"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Sensitive", "Dry", "Normal", "Combination", "Oily"],
    category: "Retinol Alternative",
    safetyRating: "safe",
  },
  {
    name: "Zinc PCA",
    description: "A zinc salt that regulates sebum production and provides antimicrobial benefits for acne-prone skin.",
    benefits: ["Controls excess oil production", "Reduces acne breakouts", "Calms inflammation"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Oily", "Combination", "Acne-prone"],
    category: "Oil Control",
    safetyRating: "safe",
  },
  {
    name: "Alpha Arbutin",
    description: "A stable, gentle skin-brightening agent that inhibits melanin production to fade dark spots.",
    benefits: ["Fades hyperpigmentation and dark spots", "Evens out skin tone", "Gentler alternative to hydroquinone"],
    sideEffects: ["None reported at standard concentrations"],
    suitableSkinTypes: ["Hyperpigmented", "Dry", "Normal", "Combination", "Sensitive"],
    category: "Brightening Agent",
    safetyRating: "safe",
  },
  {
    name: "Green Tea Extract",
    description: "A polyphenol-rich botanical extract that provides potent antioxidant and anti-inflammatory protection.",
    benefits: ["Neutralizes environmental free radicals", "Reduces redness and puffiness", "Protects against UV-induced damage"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Sensitive", "Oily", "Combination", "Normal"],
    category: "Antioxidant",
    safetyRating: "safe",
  },
  {
    name: "Kojic Acid",
    description: "A byproduct of rice fermentation that effectively inhibits melanin production to lighten dark spots.",
    benefits: ["Lightens sun spots and melasma", "Evens overall skin tone", "Provides antioxidant protection"],
    sideEffects: ["Mild irritation on sensitive skin", "Sun sensitivity"],
    suitableSkinTypes: ["Normal", "Dry", "Combination"],
    category: "Brightening Agent",
    safetyRating: "moderate",
  },
  {
    name: "Benzoyl Peroxide",
    description: "A potent antibacterial agent that kills acne-causing bacteria deep within pores and reduces inflammation.",
    benefits: ["Kills P. acnes bacteria on contact", "Dries up active breakouts quickly", "Prevents new acne from forming"],
    sideEffects: ["Dryness and peeling", "Mild stinging or redness", "Can bleach fabrics"],
    suitableSkinTypes: ["Oily", "Acne-prone"],
    category: "Acne Treatment",
    safetyRating: "caution",
  },
];

async function seed() {
  const existingSnapshot = await db.collection("ingredients").get();
  const existingNames = new Set(existingSnapshot.docs.map((doc) => doc.data().name));

  const toAdd = ALL_INGREDIENTS.filter((ing) => !existingNames.has(ing.name));

  if (toAdd.length === 0) {
    console.log("✅ All ingredients already exist. Nothing to seed.");
    return;
  }

  console.log(`🌱 Seeding ${toAdd.length} new ingredient(s) to Firestore...\n`);

  for (const ingredient of toAdd) {
    const ref = db.collection("ingredients").doc();
    const now = new Date().toISOString();
    await ref.set({ ...ingredient, id: ref.id, createdAt: now, updatedAt: now });
    console.log(`  ✓ ${ingredient.name}`);
  }

  console.log(`\n✅ Done! Added ${toAdd.length} ingredient(s). Total: ${existingSnapshot.size + toAdd.length}.`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
