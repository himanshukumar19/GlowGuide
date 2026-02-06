import { Product, Review } from '@/types/product';

// Product images - using placeholder for now, replace with actual imports
const placeholderImage = '/placeholder.svg';

export const products: Product[] = [
  // Category 1: Skincare for Men and Women
  {
    id: 'plix-guava-cleanser',
    name: 'Plix Guava Glow Juicy Cleanser',
    brand: 'Plix',
    category: 'men-women',
    subcategory: 'cleanser',
    price: 449,
    originalPrice: 599,
    discount: 25,
    rating: 4.5,
    reviewCount: 1247,
    image: placeholderImage,
    shortDescription: '100% vegan, non-comedogenic, sulphate-free cleanser for glowing skin',
    description: 'The Plix Guava Glow Juicy Cleanser is a 100% vegan, non-comedogenic, and sulphate-free formula designed to brighten and hydrate skin. It features 3% Vitamin C, Pro Vitamin B5, and Guava Extracts to remove impurities, reduce dark spots, soothe redness, and promote a glowing complexion. Gentle enough for daily use, this refreshing cleanser leaves your skin feeling clean, soft, and radiant without stripping natural oils.',
    keyBenefits: [
      'Brightens and evens skin tone',
      'Removes impurities and makeup',
      'Reduces dark spots',
      'Soothes redness and irritation',
      'Hydrates while cleansing',
      'Non-comedogenic (won\'t clog pores)'
    ],
    ingredients: ['3% Vitamin C', 'Pro Vitamin B5', 'Guava Extract', 'Natural Cleansers'],
    howToUse: 'Wet face, apply a small amount, massage gently in circular motions, rinse with lukewarm water. Use morning and night.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['men', 'women', 'teens', 'adults'],
    concerns: ['Dullness', 'dark spots', 'uneven tone', 'redness'],
    volume: '100ml',
    inStock: true,
    stockCount: 156,
    badges: ['vegan', 'cruelty-free', 'dermatologist-tested'],
    whereToBuy: {
      official: 'https://www.plixlife.com/product/guava-juicy-cleanser-facewash/530',
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'mamaearth-brightening-kit',
    name: 'Mamaearth Skin Brightening Kit',
    brand: 'Mamaearth',
    category: 'men-women',
    subcategory: 'kit',
    price: 699,
    originalPrice: 999,
    discount: 30,
    rating: 4.3,
    reviewCount: 2845,
    image: placeholderImage,
    shortDescription: 'Complete brightening kit with Vitamin C, Turmeric & Saffron',
    description: 'Mamaearth offers a comprehensive skin brightening kit using powerful ingredients like Vitamin C, Turmeric, and Saffron. Many users report enhanced radiance and even skin tone. The kit includes cleanser, face wash, serum, and moisturizer formulated to work synergistically for best results.',
    keyBenefits: [
      'Enhances skin radiance',
      'Evens skin tone',
      'Reduces dullness',
      'Natural ingredients',
      'Complete routine in one kit',
      'Suitable for daily use'
    ],
    ingredients: ['Vitamin C', 'Turmeric Extract', 'Saffron', 'Niacinamide'],
    howToUse: 'Follow 4-step routine: Cleanse → Apply Serum → Moisturize → Protect (AM). Use consistently for 4-6 weeks for best results.',
    skinTypes: ['oily', 'dry', 'combination', 'normal'],
    suitableFor: ['men', 'women', 'adults'],
    concerns: ['Dullness', 'uneven tone', 'pigmentation'],
    volume: 'Kit (4 products)',
    inStock: true,
    stockCount: 89,
    badges: ['natural', 'dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#',
      flipkart: '#'
    }
  },
  {
    id: 'ordinary-glycolic-toner',
    name: 'The Ordinary Glycolic Acid 7% Exfoliating Toner',
    brand: 'The Ordinary',
    category: 'men-women',
    subcategory: 'toner',
    price: 850,
    rating: 4.7,
    reviewCount: 3921,
    image: placeholderImage,
    shortDescription: 'Powerful AHA toner for texture, tone, and radiance',
    description: 'The Ordinary Glycolic Acid 7% Exfoliating Toner provides seven key benefits including improved skin texture, increased radiance, and even skin tone. It effectively exfoliates dead skin cells, reduces the appearance of fine lines, and can be used to manage body acne or rough skin on elbows/knees.',
    keyBenefits: [
      'Improves skin texture',
      'Increases radiance and glow',
      'Evens skin tone',
      'Exfoliates dead skin cells',
      'Reduces fine lines appearance',
      'Can be used on body',
      'Scalp care benefits'
    ],
    ingredients: ['7% Glycolic Acid', 'Amino Acids', 'Aloe Vera', 'Ginseng', 'Tasmanian Pepperberry'],
    howToUse: 'Apply to cleansed skin using cotton pad, avoiding eye area. Use PM only, 1-2 times per week initially. ALWAYS follow with sunscreen next morning.',
    skinTypes: ['oily', 'combination', 'normal'],
    suitableFor: ['men', 'women', 'adults'],
    concerns: ['Texture', 'dullness', 'fine lines', 'uneven tone'],
    volume: '240ml',
    inStock: true,
    stockCount: 234,
    badges: ['cruelty-free', 'vegan'],
    whereToBuy: {
      official: 'https://theordinary.com/en-ke/glycolic-acid-7-exfoliating-toner-100418.html',
      nykaa: '#'
    }
  },
  {
    id: 'dotkey-sunscreen',
    name: 'Dot & Key Pomegranate Multi-Peptide Sunscreen SPF 30',
    brand: 'Dot & Key',
    category: 'men-women',
    subcategory: 'sunscreen',
    price: 595,
    originalPrice: 695,
    discount: 14,
    rating: 4.4,
    reviewCount: 1654,
    image: placeholderImage,
    shortDescription: 'Broad-spectrum SPF with anti-aging peptides and 48-hour moisture',
    description: 'Dot & Key\'s specialized SPF 30 sunscreen features Pomegranate and Multi-Peptide formula providing broad-spectrum UV protection, 48-hour moisture retention, and anti-aging benefits. It helps reduce fine lines and boost collagen production while protecting from sun damage.',
    keyBenefits: [
      'Broad-spectrum UVA/UVB protection (SPF 30)',
      '48-hour moisture retention',
      'Reduces fine lines',
      'Boosts collagen production',
      'Lightweight, non-greasy',
      'No white cast',
      'Anti-aging peptides'
    ],
    ingredients: ['Pomegranate Extract', 'Multi-Peptide Complex', 'SPF Filters', 'Hyaluronic Acid'],
    howToUse: 'Apply generously as last step of AM routine. Reapply every 2-3 hours when outdoors. Apply 15 minutes before sun exposure.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['men', 'women', 'adults'],
    concerns: ['Sun protection', 'aging', 'dryness'],
    volume: '50g',
    inStock: true,
    stockCount: 178,
    badges: ['dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#',
      flipkart: '#'
    }
  },
  {
    id: 'hydrating-serum',
    name: 'Advanced Hydration Booster Serum',
    brand: 'SkinEssence',
    category: 'men-women',
    subcategory: 'serum',
    price: 799,
    originalPrice: 1199,
    discount: 33,
    rating: 4.6,
    reviewCount: 987,
    image: placeholderImage,
    shortDescription: 'Lightweight, fast-absorbing serum with high-concentration actives',
    description: 'A serum is a lightweight, fast-absorbing skincare product formulated with a high concentration of active ingredients designed to penetrate deeply into the skin to address specific concerns like dehydration, dullness, aging, or acne.',
    keyBenefits: [
      'Deep hydration',
      'Fast absorption',
      'Addresses dehydration',
      'Brightens dull skin',
      'Anti-aging properties',
      'Lightweight formula',
      'Penetrates deep into skin layers'
    ],
    ingredients: ['Hyaluronic Acid', 'Vitamin C', 'Niacinamide', 'Peptides'],
    howToUse: 'Apply 2-3 drops to cleansed face, gently pat until absorbed. Follow with moisturizer. Use AM and PM.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['men', 'women', 'adults'],
    concerns: ['Dehydration', 'dullness', 'aging', 'fine lines'],
    volume: '30ml',
    inStock: true,
    stockCount: 145,
    badges: ['dermatologist-tested', 'cruelty-free'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'cerave-moisturizer',
    name: 'CeraVe Sensitive Skin Moisturizer',
    brand: 'CeraVe',
    category: 'men-women',
    subcategory: 'moisturizer',
    price: 1250,
    rating: 4.8,
    reviewCount: 4532,
    image: placeholderImage,
    shortDescription: 'Dermatologist-developed moisturizer for sensitive skin',
    description: 'Defends against 5 signs of skin sensitivity including weakened skin barrier, irritation, roughness, tightness, and dryness. This fragrance-free, non-comedogenic formula is specially designed for sensitive skin.',
    keyBenefits: [
      'Strengthens skin barrier',
      'Reduces irritation',
      'Soothes roughness',
      'Relieves tightness',
      'Deep hydration',
      'Fragrance-free',
      'Won\'t clog pores'
    ],
    ingredients: ['Ceramides', 'Hyaluronic Acid', 'Niacinamide', 'MVE Technology'],
    howToUse: 'Apply to face and body after cleansing. Can be used AM and PM. Gentle enough for daily use.',
    skinTypes: ['sensitive', 'dry', 'normal'],
    suitableFor: ['men', 'women', 'teens', 'adults'],
    concerns: ['Sensitivity', 'dryness', 'irritation', 'barrier damage'],
    volume: '177ml',
    inStock: true,
    stockCount: 267,
    badges: ['dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },

  // Category 2: Korean Skincare
  {
    id: 'glamveda-korean-kit',
    name: 'Glamveda Korean 7 Step Winter Skincare Kit',
    brand: 'Glamveda',
    category: 'korean',
    subcategory: 'kit',
    price: 1499,
    originalPrice: 2999,
    discount: 50,
    rating: 4.5,
    reviewCount: 756,
    image: placeholderImage,
    shortDescription: 'Complete K-beauty routine with Rice & Ceramide for glass skin',
    description: 'Glamveda Korean 7 Step Winter Skincare Kit for Women featuring Rice & Ceramide Routine. This comprehensive gift box includes Face Wash, Toner, Moisturizer, Serum, Mask, Sunscreen, and Under Eye Cream. Leaves skin feeling soft, radiant and fresh.',
    keyBenefits: [
      'Complete 7-step K-beauty routine',
      'Achieves glass skin effect',
      'Deep hydration',
      'Skin brightening',
      'Anti-aging benefits',
      'Strengthens skin barrier',
      'Winter-appropriate formula'
    ],
    ingredients: ['Rice Extract', 'Ceramide Complex', 'Hyaluronic Acid', 'Vitamin C', 'Vitamin B', 'Niacinamide'],
    howToUse: 'Follow 7-step routine: Cleanser → Toner → Serum → Eye Cream → Moisturizer → Mask (2-3x/week) → Sunscreen (AM only)',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['women', 'teens', 'adults'],
    concerns: ['Dullness', 'dryness', 'aging', 'uneven texture'],
    volume: 'Complete Kit (7 products)',
    inStock: true,
    stockCount: 67,
    badges: ['korean-formula', 'bestseller'],
    whereToBuy: {
      amazon: '#',
      flipkart: '#',
      nykaa: '#'
    }
  },

  // Category 3: Skincare for Children
  {
    id: 'mamaearth-baby-cleanser',
    name: 'Mamaearth Natural Baby Cleanser with Aloe Vera',
    brand: 'Mamaearth',
    category: 'children',
    subcategory: 'cleanser',
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.7,
    reviewCount: 2134,
    image: placeholderImage,
    shortDescription: 'Tear-free, gentle cleanser with natural ingredients for baby\'s delicate skin',
    description: 'Natural cleanser with Aloe Vera Extract that moisturizes and nourishes baby\'s delicate scalp and skin. Features a tear-free formula that is gentle yet efficient with a 5.6 pH level, best suited for baby skin.',
    keyBenefits: [
      'Tear-free formula',
      'pH balanced (5.6)',
      'Moisturizes delicate skin',
      'Natural ingredients',
      'Gentle cleansing',
      'Nourishes scalp',
      'Coconut-based cleansers'
    ],
    ingredients: ['Aloe Vera Extract', 'Coconut-Based Cleansers', 'Jojoba Oil'],
    howToUse: 'Apply small amount to wet skin/scalp, lather gently, rinse thoroughly. Safe for daily use.',
    skinTypes: ['sensitive'],
    suitableFor: ['children'],
    concerns: ['Gentle cleansing', 'moisturizing'],
    volume: '200ml',
    inStock: true,
    stockCount: 456,
    badges: ['natural', 'dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'mamaearth-milky-cream',
    name: 'Mamaearth Milky Soft Face Cream for Babies',
    brand: 'Mamaearth',
    category: 'children',
    subcategory: 'moisturizer',
    price: 349,
    originalPrice: 449,
    discount: 22,
    rating: 4.6,
    reviewCount: 1876,
    image: placeholderImage,
    shortDescription: 'Dermatologically tested face cream with natural butters and milk protein',
    description: 'Mamaearth Milky Soft Face Cream is dermatologically tested and free from sulfates, parabens, mineral oils, PEGs, and phthalates. Made with natural butters and oils plus milk protein.',
    keyBenefits: [
      'Dermatologically tested',
      'Natural ingredients',
      'No harsh chemicals',
      'Milk protein enriched',
      'pH balanced',
      'Gentle moisturization',
      'Safe for baby\'s face'
    ],
    ingredients: ['Natural Butters', 'Milk Protein', 'Natural Oils'],
    howToUse: 'Apply small amount to baby\'s clean face, massage gently. Use after bath and before bedtime.',
    skinTypes: ['sensitive'],
    suitableFor: ['children'],
    concerns: ['Dryness', 'gentle moisturizing'],
    volume: '60g',
    inStock: true,
    stockCount: 234,
    badges: ['dermatologist-tested', 'natural'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'mamaearth-baby-sunscreen',
    name: 'Mamaearth Mineral-Based Baby Sunscreen SPF 50+',
    brand: 'Mamaearth',
    category: 'children',
    subcategory: 'sunscreen',
    price: 449,
    originalPrice: 599,
    discount: 25,
    rating: 4.5,
    reviewCount: 1543,
    image: placeholderImage,
    shortDescription: 'Safe mineral sunscreen with Zinc Oxide for delicate baby skin',
    description: 'Mamaearth child sunscreen offers safe, mineral-based (Zinc Oxide) protection against UVA/UVB rays with SPF 50+. Specially designed for delicate skin.',
    keyBenefits: [
      'Mineral-based (Zinc Oxide)',
      'Broad-spectrum protection',
      'SPF 50+',
      'Safe for babies',
      'Water-resistant',
      'No harsh chemicals',
      'Designed for delicate skin'
    ],
    ingredients: ['Zinc Oxide', 'Vitamin E', 'Calendula Extract', 'Shea Butter'],
    howToUse: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours and after swimming.',
    skinTypes: ['sensitive'],
    suitableFor: ['children'],
    concerns: ['Sun protection', 'sensitive skin'],
    volume: '100ml',
    inStock: true,
    stockCount: 189,
    badges: ['natural', 'dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'mother-sparsh-lip-balm',
    name: 'Mother Sparsh Milky Soft Baby Lip Balm',
    brand: 'Mother Sparsh',
    category: 'children',
    subcategory: 'lip-care',
    price: 199,
    originalPrice: 249,
    discount: 20,
    rating: 4.4,
    reviewCount: 892,
    image: placeholderImage,
    shortDescription: 'Natural, petroleum-free lip balm for baby\'s chapped lips',
    description: 'Mother Sparsh Milky Soft Baby Lip Balm (for ages 2+) is a natural, non-sticky, petroleum-free, and paraben-free formula designed to intensely moisturize and soothe dry, chapped lips.',
    keyBenefits: [
      'Petroleum-free',
      'Paraben-free',
      'Non-sticky formula',
      'Intense moisturization',
      'All-day hydration',
      'Natural ingredients',
      'Safe for sensitive lips'
    ],
    ingredients: ['Milk Protein', 'Coconut Oil', 'Shea Butter', 'Vitamin E'],
    howToUse: 'Apply to lips as needed throughout the day. Safe for frequent use.',
    skinTypes: ['sensitive', 'normal'],
    suitableFor: ['children'],
    concerns: ['Dry lips', 'chapped lips'],
    volume: '4.5g',
    inStock: true,
    stockCount: 345,
    badges: ['natural'],
    whereToBuy: {
      amazon: '#',
      flipkart: '#'
    }
  },
  {
    id: 'baby-care-kit',
    name: 'Complete Baby Skincare Starter Kit',
    brand: 'Little Angels',
    category: 'children',
    subcategory: 'kit',
    price: 799,
    originalPrice: 1199,
    discount: 33,
    rating: 4.6,
    reviewCount: 654,
    image: placeholderImage,
    shortDescription: 'Complete gentle care kit for newborns and babies',
    description: 'Comprehensive baby skincare kit with all essentials for daily care. Includes gentle cleanser, moisturizer, diaper cream, and massage oil. All products are dermatologist-tested, hypoallergenic, and free from harmful chemicals.',
    keyBenefits: [
      'Complete care kit',
      'All essentials included',
      'Dermatologist-tested',
      'Hypoallergenic',
      'Chemical-free',
      'Perfect for newborns',
      'Travel-friendly sizes'
    ],
    ingredients: ['Natural extracts', 'Milk proteins', 'Plant oils'],
    howToUse: 'Follow daily routine using each product as directed.',
    skinTypes: ['sensitive'],
    suitableFor: ['children'],
    concerns: ['Complete baby care'],
    volume: 'Kit (4 products)',
    inStock: true,
    stockCount: 123,
    badges: ['dermatologist-tested', 'natural'],
    whereToBuy: {
      amazon: '#',
      flipkart: '#'
    }
  },

  // Category 4: Skincare for Seniors
  {
    id: 'simple-face-wash',
    name: 'Simple Kind to Skin Refreshing Facial Wash',
    brand: 'Simple',
    category: 'senior',
    subcategory: 'cleanser',
    price: 375,
    originalPrice: 450,
    discount: 17,
    rating: 4.6,
    reviewCount: 3245,
    image: placeholderImage,
    shortDescription: 'Gentle yet effective cleansing for mature sensitive skin',
    description: 'Simple face washes offer gentle yet effective cleansing, removing dirt, makeup, and oil without stripping skin. Features hydrating ingredients (Vitamin E, Pro-Vitamin B5) and is free from harsh chemicals.',
    keyBenefits: [
      'Gentle yet effective',
      'Removes dirt, makeup, oil',
      'Doesn\'t strip natural oils',
      'Contains Vitamin E & B5',
      'No harsh chemicals',
      'Maintains pH balance',
      'Perfect for mature skin'
    ],
    ingredients: ['Vitamin E', 'Pro-Vitamin B5', 'Bisabolol', 'No Soap'],
    howToUse: 'Wet face, apply to hands and work into lather, massage onto face, rinse thoroughly. Use AM and PM.',
    skinTypes: ['sensitive', 'dry', 'normal'],
    suitableFor: ['seniors', 'adults'],
    concerns: ['Gentle cleansing', 'sensitivity', 'dryness'],
    volume: '150ml',
    inStock: true,
    stockCount: 298,
    badges: ['dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'retinol-serum',
    name: 'Advanced Anti-Aging Retinol Serum',
    brand: 'AgeLess Pro',
    category: 'senior',
    subcategory: 'serum',
    price: 1299,
    originalPrice: 1899,
    discount: 32,
    rating: 4.7,
    reviewCount: 1876,
    image: placeholderImage,
    shortDescription: 'Concentrated retinol, vitamin C, and hyaluronic acid for mature skin',
    description: 'Anti-aging serums designed for mature skin deliver concentrated ingredients like retinol, vitamin C, and hyaluronic acid to boost collagen, reduce wrinkles, and increase hydration.',
    keyBenefits: [
      'Boosts collagen production',
      'Reduces wrinkles and fine lines',
      'Increases hydration',
      'Improves skin firmness',
      'Fades age spots',
      'Concentrated actives',
      'Suitable for mature skin'
    ],
    ingredients: ['Retinol', 'Vitamin C', 'Hyaluronic Acid', 'Peptides', 'Niacinamide'],
    howToUse: 'Apply 2-3 drops to clean face at night. Start 2-3x/week, increase gradually. ALWAYS use sunscreen in AM.',
    skinTypes: ['dry', 'normal'],
    suitableFor: ['seniors', 'adults'],
    concerns: ['Wrinkles', 'fine lines', 'loss of firmness', 'aging'],
    volume: '30ml',
    inStock: true,
    stockCount: 167,
    badges: ['dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#'
    }
  },
  {
    id: 'cetaphil-moisturizer',
    name: 'Cetaphil Moisturizing Cream for Dry, Sensitive Skin',
    brand: 'Cetaphil',
    category: 'senior',
    subcategory: 'moisturizer',
    price: 899,
    originalPrice: 1099,
    discount: 18,
    rating: 4.8,
    reviewCount: 5432,
    image: placeholderImage,
    shortDescription: '48-hour hydration for mature, dry skin',
    description: 'A single application of Cetaphil Moisturizing Cream can provide long-lasting hydration and prevent moisture loss for up to 48 hours. It significantly improves your skin\'s moisture barrier within three days and restores it in just one week.',
    keyBenefits: [
      '48-hour hydration',
      'Prevents moisture loss',
      'Improves barrier in 3 days',
      'Restores barrier in 1 week',
      'Clinically proven',
      'Suitable for sensitive skin',
      'Non-greasy formula'
    ],
    ingredients: ['Glycerin', 'Petrolatum', 'Sweet Almond Oil', 'Vitamin E'],
    howToUse: 'Apply generously to face and body after cleansing. Use AM and PM. Best applied to slightly damp skin.',
    skinTypes: ['dry', 'sensitive'],
    suitableFor: ['seniors', 'adults'],
    concerns: ['Dryness', 'sensitive skin', 'barrier damage'],
    volume: '250g',
    inStock: true,
    stockCount: 412,
    badges: ['dermatologist-tested', 'bestseller'],
    whereToBuy: {
      amazon: '#',
      nykaa: '#',
      flipkart: '#'
    }
  },
  {
    id: 'vitamin-c-sunscreen',
    name: 'Vitamin C & Turmeric Brightening Sunscreen SPF 50',
    brand: 'GlowGuard',
    category: 'senior',
    subcategory: 'sunscreen',
    price: 649,
    originalPrice: 799,
    discount: 19,
    rating: 4.5,
    reviewCount: 987,
    image: placeholderImage,
    shortDescription: 'Brightening sunscreen with anti-aging benefits',
    description: 'Crafted with Vitamin C, this sunscreen brightens skin and shields it from UVA & UVB rays. Infused with the goodness of Turmeric, it heals damaged skin caused by sun exposure and revives your skin\'s natural glow.',
    keyBenefits: [
      'SPF 50 broad-spectrum',
      'Brightens skin with Vitamin C',
      'Heals sun damage',
      'Contains Turmeric',
      'Revives natural glow',
      'Anti-aging protection',
      'Lightweight formula'
    ],
    ingredients: ['Vitamin C', 'Turmeric Extract', 'SPF Filters', 'Niacinamide'],
    howToUse: 'Apply generously 15 minutes before sun exposure. Reapply every 2-3 hours.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['seniors', 'adults'],
    concerns: ['Sun protection', 'aging', 'dullness'],
    volume: '50g',
    inStock: true,
    stockCount: 223,
    badges: ['dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      flipkart: '#'
    }
  },

  // Category 5: Laser Hair Removal Devices
  {
    id: 'silksmooth-pro',
    name: 'SilkSmooth Pro Laser Hair Removal Device',
    brand: 'SilkSmooth',
    category: 'laser-devices',
    subcategory: 'device',
    price: 18999,
    originalPrice: 24999,
    discount: 24,
    rating: 4.6,
    reviewCount: 1234,
    image: placeholderImage,
    shortDescription: 'Professional-grade at-home IPL device for long-term hair reduction',
    description: 'Professional-quality IPL (Intense Pulsed Light) device for safe, effective at-home hair removal. FDA-approved technology provides long-lasting hair reduction on face, arms, legs, underarms, and bikini area.',
    keyBenefits: [
      'Long-term hair reduction',
      'FDA-approved technology',
      'Safe for home use',
      '5 intensity levels',
      'Suitable for multiple body areas',
      'Painless treatment',
      'Cost-effective vs salon'
    ],
    ingredients: ['300,000 flashes', 'Skin tone sensor', 'Safety lock', 'Rechargeable'],
    howToUse: 'Shave area first, select intensity, flash device over skin. Use 1-2x/week for first 4-8 weeks, then monthly.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['women', 'men', 'adults'],
    concerns: ['Hair removal', 'smooth skin'],
    volume: 'Handheld device',
    inStock: true,
    stockCount: 45,
    badges: ['bestseller', 'dermatologist-tested'],
    whereToBuy: {
      amazon: '#',
      official: '#'
    }
  },
  {
    id: 'travelglow-mini',
    name: 'TravelGlow Mini IPL Device',
    brand: 'TravelGlow',
    category: 'laser-devices',
    subcategory: 'device',
    price: 12499,
    originalPrice: 15999,
    discount: 22,
    rating: 4.4,
    reviewCount: 678,
    image: placeholderImage,
    shortDescription: 'Compact, travel-friendly IPL for on-the-go hair removal',
    description: 'Compact and portable IPL device perfect for travel and touch-ups. Despite its small size, delivers professional results with advanced IPL technology. Cordless design with long battery life.',
    keyBenefits: [
      'Compact & portable',
      'Cordless operation',
      'Professional results',
      'Travel-friendly',
      'Beginner-friendly',
      'Quick treatments',
      'Rechargeable battery'
    ],
    ingredients: ['150,000 flashes', '3 intensity levels', 'USB charging', 'Travel case included'],
    howToUse: 'Charge fully, select level, treat desired areas. Use 1x/week initially.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['women', 'men', 'adults'],
    concerns: ['Hair removal', 'travel convenience'],
    volume: 'Mini handheld',
    inStock: true,
    stockCount: 89,
    badges: ['new'],
    whereToBuy: {
      amazon: '#',
      flipkart: '#'
    }
  },
  {
    id: 'beautytech-4in1',
    name: 'BeautyTech 4-in-1 IPL & Skincare Device',
    brand: 'BeautyTech',
    category: 'laser-devices',
    subcategory: 'device',
    price: 22999,
    originalPrice: 29999,
    discount: 23,
    rating: 4.7,
    reviewCount: 456,
    image: placeholderImage,
    shortDescription: 'IPL hair removal plus skin rejuvenation in one device',
    description: 'Multi-functional device combining IPL hair removal with skin rejuvenation treatments. Features dedicated modes for hair removal, acne treatment, skin tightening, and pigmentation reduction.',
    keyBenefits: [
      '4-in-1 functionality',
      'Hair removal',
      'Skin rejuvenation',
      'Acne treatment',
      'Skin tightening',
      'Multiple intensity levels',
      'Smart skin sensor'
    ],
    ingredients: ['400,000 flashes', '4 treatment modes', 'Smart sensor', 'Safety goggles included'],
    howToUse: 'Select mode based on treatment goal, adjust intensity, treat area. Follow specific protocol for each mode.',
    skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    suitableFor: ['women', 'men', 'adults'],
    concerns: ['Hair removal', 'skin rejuvenation', 'acne', 'aging'],
    volume: 'Professional handheld',
    inStock: true,
    stockCount: 34,
    badges: ['dermatologist-tested', 'new'],
    whereToBuy: {
      amazon: '#',
      official: '#'
    }
  }
];

// Generate sample reviews for products
export const generateReviews = (productId: string): Review[] => {
  const reviewTemplates = [
    { userName: 'Priya S.', rating: 5, title: 'Amazing product!', text: 'Been using this for 2 weeks and already seeing great results. Highly recommend!' },
    { userName: 'Rahul M.', rating: 4, title: 'Good quality', text: 'Works well for my skin type. Fast delivery too.' },
    { userName: 'Sneha K.', rating: 5, title: 'Best purchase ever', text: 'My skin has never looked better. Will definitely repurchase.' },
    { userName: 'Amit P.', rating: 3, title: 'Decent product', text: 'Takes time to show results but overall satisfied.' },
    { userName: 'Neha G.', rating: 5, title: 'Love it!', text: 'Gentle on sensitive skin and smells amazing.' },
    { userName: 'Vikram R.', rating: 4, title: 'Worth the price', text: 'A bit expensive but the quality justifies it.' },
    { userName: 'Anjali D.', rating: 5, title: 'Game changer', text: 'This has completely transformed my skincare routine.' },
    { userName: 'Karan S.', rating: 4, title: 'Effective', text: 'Noticed improvement in skin texture within a week.' },
  ];

  return reviewTemplates.map((template, index) => ({
    id: `${productId}-review-${index}`,
    userName: template.userName,
    rating: template.rating,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    reviewTitle: template.title,
    reviewText: template.text,
    verified: Math.random() > 0.3,
    helpful: Math.floor(Math.random() * 50)
  }));
};

// Promo codes
export const promoCodes = [
  { code: 'FIRST10', discount: 10, minOrder: 0, description: '10% off on first order' },
  { code: 'GLOW20', discount: 20, minOrder: 1500, description: '20% off on orders above ₹1500' },
  { code: 'SKIN15', discount: 15, minOrder: 0, description: '15% off sitewide' },
  { code: 'FREESHIP', discount: 0, minOrder: 500, description: 'Free shipping on orders above ₹500', freeShipping: true },
  { code: 'SUMMER25', discount: 25, minOrder: 2000, description: '25% off on orders above ₹2000' }
];

// Get products by category
export const getProductsByCategory = (category: Product['category']) => 
  products.filter(p => p.category === category);

// Get featured products
export const getFeaturedProducts = () => 
  products.filter(p => p.badges?.includes('bestseller') || (p.discount && p.discount >= 25));

// Get product by ID
export const getProductById = (id: string) => 
  products.find(p => p.id === id);

// Get related products
export const getRelatedProducts = (product: Product, limit = 4) => 
  products
    .filter(p => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory))
    .slice(0, limit);

// Get all brands
export const getAllBrands = () => 
  [...new Set(products.map(p => p.brand))];

// Category labels
export const categoryLabels: Record<Product['category'], string> = {
  'men-women': 'Men & Women',
  'korean': 'Korean Skincare',
  'children': 'For Children',
  'senior': 'For Seniors',
  'laser-devices': 'Laser Devices'
};
