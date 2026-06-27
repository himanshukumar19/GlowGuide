export interface ChatResponse {
  keywords: string[];
  response: string;
}

export const CHATBOT_RESPONSES: ChatResponse[] = [
  // ── Products ──────────────────────────────────────────
  {
    keywords: ['ingredient', 'ingredients', 'what is in', 'contains', 'formula', 'made of'],
    response:
      'Our products use science-backed active ingredients like Vitamin C (brightening), Hyaluronic Acid (hydration), Niacinamide (pore control), Retinol (anti-aging), and Ceramides (barrier repair). Each product page lists a full ingredient breakdown so you can check for any sensitivities or preferences.',
  },
  {
    keywords: ['benefit', 'benefits', 'what does it do', 'good for', 'helps with'],
    response:
      'Each product targets specific concerns — brightening, hydration, anti-aging, sun protection, or soothing. Check the key benefits section on any product page for a quick overview, or browse by concern under the Shop to find exactly what your skin needs.',
  },
  {
    keywords: ['how to use', 'apply', 'usage', 'routine order', 'when to apply'],
    response:
      'As a general rule: start with the thinnest consistency and end with the thickest. A typical order is: Cleanser → Toner → Serum → Eye Cream → Moisturizer → Sunscreen (AM only). Every product page has a "How to Use" section with specific instructions.',
  },
  {
    keywords: ['recommend', 'recommendation', 'suggest', 'which product', 'best for me'],
    response:
      'For personalised recommendations, head to the Shop and filter by your skin type or concern. Even better — complete a Skin Analysis to get tailored product suggestions based on your unique skin profile and analysis history.',
  },

  // ── Skin Concerns ─────────────────────────────────────
  {
    keywords: ['acne', 'pimple', 'breakout', 'bump', 'whitehead', 'blackhead', 'cyst'],
    response:
      'Acne-prone skin benefits from non-comedogenic products with salicylic acid, niacinamide, or zinc. Avoid heavy oils and always double-cleanse in the evening. For persistent acne, our Skin Analysis can help identify underlying triggers.',
  },
  {
    keywords: ['dry', 'dryness', 'dehydrated', 'flaky', 'tight', 'rough'],
    response:
      'Dry skin needs humectants like Hyaluronic Acid and glycerin to draw in moisture, plus occlusives like ceramides and shea butter to lock it in. Apply moisturiser to slightly damp skin for better absorption, and avoid overly hot water when cleansing.',
  },
  {
    keywords: ['aging', 'anti-aging', 'wrinkle', 'fine line', 'crows feet', 'aging', 'mature'],
    response:
      'Target fine lines and loss of firmness with ingredients like Retinol (boosts collagen), Vitamin C (brightens + protects), and Peptides (supports skin structure). Sunscreen is the single most effective anti-aging step — use SPF 30+ daily, rain or shine.',
  },
  {
    keywords: ['hyperpigmentation', 'dark spot', 'pigmentation', 'melasma', 'brown spot', 'uneven tone', 'discoloration'],
    response:
      'Dark spots and uneven tone often respond well to Vitamin C, Niacinamide, Glycolic Acid, and Kojic Acid. Consistent use of broad-spectrum sunscreen is essential — UV exposure worsens pigmentation and slows down treatment progress.',
  },
  {
    keywords: ['sensitive', 'sensitivity', 'irritation', 'redness', 'burning', 'stinging', 'reaction'],
    response:
      'Sensitive skin should look for fragrance-free, alcohol-free formulas with soothing ingredients like Centella Asiatica, Panthenol, Aloe Vera, and Ceramides. Always patch-test new products on your inner arm for 48 hours before applying to your face.',
  },
  {
    keywords: ['dull', 'dullness', 'glow', 'radiance', 'lifeless', 'tired skin'],
    response:
      'Restore radiance with gentle exfoliation (AHAs like Glycolic or Lactic Acid) and brightening ingredients like Vitamin C and Niacinamide. Adequate sleep, hydration, and daily sunscreen also play a major role in maintaining a healthy glow.',
  },

  // ── Skin Types ────────────────────────────────────────
  {
    keywords: ['oily skin', 'oily', 'shiny', 'greasy', 'excess oil', 'large pores'],
    response:
      'Oily skin thrives with lightweight, gel-based moisturisers, salicylic acid cleansers, and niacinamide to regulate sebum. Don\'t skip moisturiser — dehydrated oily skin can overcompensate by producing even more oil.',
  },
  {
    keywords: ['dry skin type', 'dry skin', 'flaky skin', 'tight skin'],
    response:
      'Dry skin benefits from cream-based cleansers, rich moisturisers with ceramides and fatty acids, and hydrating serums with Hyaluronic Acid. Avoid sulphates and alcohol-based toners that can strip natural oils further.',
  },
  {
    keywords: ['combination skin', 't-zone', 'oily t-zone', 'dry cheeks'],
    response:
      'Combination skin responds well to a balanced routine — gentle foaming cleanser, lightweight hydration, and targeted treatments. You can use a richer moisturiser on dry areas and a lighter gel on the T-zone.',
  },
  {
    keywords: ['normal skin', 'balanced skin'],
    response:
      'Normal skin is well-balanced: not too oily, not too dry. Maintain it with a consistent routine of gentle cleansing, antioxidant protection (Vitamin C), hydration, and daily SPF. This helps delay signs of aging and keeps your skin resilient.',
  },

  // ── Routine Advice ────────────────────────────────────
  {
    keywords: ['morning routine', 'am routine', 'day routine', 'morning skincare'],
    response:
      'Your AM routine should be: Gentle Cleanser → Vitamin C Serum → Moisturiser → Sunscreen SPF 30+. Sunscreen is non-negotiable — it protects against UV damage, premature aging, and pigmentation. Reapply every 2-3 hours if you\'re outdoors.',
  },
  {
    keywords: ['night routine', 'pm routine', 'evening routine', 'night skincare', 'bedtime'],
    response:
      'Your PM routine is deeper: Double Cleanse (oil-based then water-based) → Toner (if used) → Treatment Serum (Retinol/AHA/BHA) → Eye Cream → Moisturiser → Face Oil (optional). Retinol and exfoliating acids should only be used at night, not in the AM.',
  },
  {
    keywords: ['product order', 'skincare order', 'layer', 'layering', 'which goes first'],
    response:
      'Layer from thinnest to thickest consistency: Cleanser → Toner → Essence → Serum → Eye Cream → Moisturiser → Sunscreen (AM) / Oil (PM). Wait 30-60 seconds between layers so each product can absorb properly.',
  },

  // ── App Features ──────────────────────────────────────
  {
    keywords: ['analysis', 'skin analysis', 'skin assessment', 'analyze my skin', 'photo analysis'],
    response:
      'Our Skin Analysis combines a short quiz with 5 live-captured facial photos analysed by a Vision AI model. You\'ll receive your skin type, detected concerns, confidence scores, and a Skin Health Score (0-100). Head to the Dashboard to start a new analysis.',
  },
  {
    keywords: ['dashboard', 'my dashboard', 'history', 'analysis history'],
    response:
      'Your Dashboard is your personal hub — it shows your latest analysis, Skin Health Score trend, analysis history timeline, My Routine section, and auto-tracked purchased products. Free-tier customers can see the last 3 analyses; paid subscribers get 12 months of history.',
  },
  {
    keywords: ['subscription', 'subscribe', 'paid', 'upgrade', 'premium', 'pro plan'],
    response:
      'A paid subscription extends your analysis history to 12 months, gives you unlimited chatbot queries (free tier: 10/day), and grants a 5% extra discount on all product purchases. You can upgrade from your Dashboard settings at any time.',
  },
  {
    keywords: ['chatbot', 'chat', 'query', 'question', 'help', 'how to use app'],
    response:
      'I\'m here to help with products, ingredients, routines, and app features. Free-tier customers get 10 queries per day, while paid subscribers enjoy unlimited conversations. Just type your question below and I\'ll find the best answer for you.',
  },
  {
    keywords: ['my routine', 'routine tracker', 'auto track', 'purchased products'],
    response:
      '"My Routine" in your Dashboard displays your recommended morning and night skincare steps based on your latest analysis. Products you purchase through the Shop are automatically tracked there, so you can see your full regimen in one place.',
  },
];

export const FALLBACK_RESPONSE =
  "I'm not sure I have the answer to that yet. Try asking about products, ingredients, skin concerns, routines, or app features like the Dashboard, Analysis, or Subscription. I'm still learning, so your question might help me improve!";
