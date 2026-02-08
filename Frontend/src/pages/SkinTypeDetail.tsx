import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ShoppingBag, Sparkles, Sun, Moon, Droplets, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/shop/ProductCard';
import { products } from '@/data/products';

interface SkinTypeData {
  type: string;
  emoji: string;
  tagline: string;
  description: string;
  characteristics: string[];
  causes: string[];
  benefits: string[];
  challenges: string[];
  morningRoutine: Array<{ step: string; description: string; products: string[] }>;
  nightRoutine: Array<{ step: string; description: string; products: string[] }>;
  ingredients: {
    beneficial: Array<{ name: string; benefit: string }>;
    avoid: Array<{ name: string; reason: string }>;
  };
  lifestyle: string[];
  myths: Array<{ myth: string; truth: string }>;
  tips: string[];
  color: string;
  gradient: string;
}

const skinTypeData: Record<string, SkinTypeData> = {
  oily: {
    type: 'Oily',
    emoji: '💧',
    tagline: 'Excess sebum production with shine and visible pores',
    description: 'Oily skin is characterized by overactive sebaceous glands that produce excess sebum (oil). While it can be challenging to manage, oily skin has the advantage of aging more slowly due to its natural moisture retention and protective lipid barrier.',
    characteristics: [
      'Shiny or greasy appearance, especially in T-zone',
      'Enlarged, visible pores',
      'Prone to blackheads, whiteheads, and acne',
      'Makeup tends to slide off or break down',
      'Skin looks thicker and more resilient',
    ],
    causes: [
      'Genetics and hormones (especially androgens)',
      'Hot and humid weather conditions',
      'Stress and lack of sleep',
      'Over-washing or harsh products that strip skin',
      'Hormonal changes (puberty, menstruation, pregnancy)',
    ],
    benefits: [
      'Ages more slowly with fewer wrinkles',
      'Natural moisture barrier protection',
      'Better protection against environmental damage',
      'More resilient to external factors',
    ],
    challenges: [
      'Frequent breakouts and acne',
      'Makeup application difficulties',
      'Managing shine throughout the day',
      'Finding the right product balance',
    ],
    morningRoutine: [
      {
        step: 'Cleanser',
        description: 'Use a gentle foaming or gel cleanser to remove excess oil without stripping skin',
        products: ['Salicylic acid cleanser', 'Glycolic acid face wash', 'Gel cleanser'],
      },
      {
        step: 'Toner',
        description: 'Apply an oil-controlling toner to balance pH and minimize pores',
        products: ['Witch hazel toner', 'Niacinamide toner', 'Tea tree toner'],
      },
      {
        step: 'Serum',
        description: 'Use a lightweight serum with oil-controlling ingredients',
        products: ['Niacinamide serum', 'Vitamin C serum', 'Salicylic acid serum'],
      },
      {
        step: 'Moisturizer',
        description: 'Apply an oil-free, non-comedogenic moisturizer',
        products: ['Gel moisturizer', 'Water-based moisturizer', 'Oil-free lotion'],
      },
      {
        step: 'Sunscreen',
        description: 'Use a mattifying, oil-free SPF 30+ sunscreen',
        products: ['Gel sunscreen', 'Mattifying sunscreen', 'Mineral powder SPF'],
      },
    ],
    nightRoutine: [
      {
        step: 'Double Cleanse',
        description: 'Remove makeup with micellar water, then cleanse with gel cleanser',
        products: ['Micellar water', 'Oil-free makeup remover', 'Gel cleanser'],
      },
      {
        step: 'Exfoliate',
        description: 'Use chemical exfoliants 2-3 times per week',
        products: ['Salicylic acid', 'Glycolic acid', 'AHA/BHA toner'],
      },
      {
        step: 'Treatment',
        description: 'Apply targeted treatments for concerns',
        products: ['Retinol', 'Benzoyl peroxide', 'Spot treatment'],
      },
      {
        step: 'Night Moisturizer',
        description: 'Use a slightly richer (but still oil-free) night cream',
        products: ['Lightweight night cream', 'Gel-cream moisturizer'],
      },
    ],
    ingredients: {
      beneficial: [
        { name: 'Niacinamide', benefit: 'Regulates sebum production and minimizes pores' },
        { name: 'Salicylic Acid', benefit: 'Exfoliates and unclogs pores' },
        { name: 'Hyaluronic Acid', benefit: 'Hydrates without adding oil' },
        { name: 'Tea Tree Oil', benefit: 'Natural antibacterial properties' },
        { name: 'Zinc', benefit: 'Controls oil and reduces inflammation' },
        { name: 'Clay', benefit: 'Absorbs excess oil and purifies pores' },
      ],
      avoid: [
        { name: 'Heavy Oils', reason: 'Can clog pores and increase shine' },
        { name: 'Alcohol', reason: 'Over-dries skin, causing rebound oil production' },
        { name: 'Coconut Oil', reason: 'Highly comedogenic, clogs pores' },
        { name: 'Petroleum-based Products', reason: 'Creates occlusive barrier, traps oil' },
      ],
    },
    lifestyle: [
      'Drink plenty of water to flush toxins',
      'Eat a balanced diet low in processed foods and sugar',
      'Manage stress through meditation or exercise',
      'Get 7-9 hours of quality sleep',
      'Avoid touching your face throughout the day',
      'Change pillowcases regularly',
      'Use oil-blotting papers instead of over-washing',
    ],
    myths: [
      {
        myth: 'Oily skin doesn\'t need moisturizer',
        truth: 'Oily skin still needs hydration. Skipping moisturizer can cause your skin to produce even more oil to compensate.',
      },
      {
        myth: 'Washing your face more will reduce oil',
        truth: 'Over-washing strips natural oils, triggering more oil production. Cleanse twice daily max.',
      },
      {
        myth: 'Sun exposure dries out oily skin',
        truth: 'Sun damage can worsen oil production and cause premature aging. Always wear sunscreen.',
      },
    ],
    tips: [
      'Use blotting papers instead of powder to manage shine',
      'Keep a mattifying primer in your makeup routine',
      'Avoid hot water when washing - use lukewarm instead',
      'Don\'t skip moisturizer, choose oil-free formulas',
      'Consider seeing a dermatologist if acne is severe',
    ],
    color: 'from-blue-50 to-blue-100',
    gradient: 'from-blue-500 to-cyan-500',
  },
  dry: {
    type: 'Dry',
    emoji: '🏜️',
    tagline: 'Lacks moisture, may feel tight or flaky',
    description: 'Dry skin lacks sufficient moisture and natural oils, leading to a tight, sometimes uncomfortable feeling. It can be caused by genetics, environmental factors, or skin barrier damage. With proper care, dry skin can become smooth, supple, and comfortable.',
    characteristics: [
      'Tight, uncomfortable feeling after cleansing',
      'Visible flakes or rough patches',
      'Dull, lackluster complexion',
      'Fine lines more noticeable',
      'Skin may feel itchy or irritated',
    ],
    causes: [
      'Low humidity and cold weather',
      'Hot showers and harsh soaps',
      'Genetic predisposition',
      'Aging (decreased oil production)',
      'Medical conditions (eczema, psoriasis)',
      'Harsh skincare products',
    ],
    benefits: [
      'Rarely deals with breakouts or acne',
      'Smaller, less visible pores',
      'Makeup applies smoothly',
      'Responds well to rich moisturizers',
    ],
    challenges: [
      'Constant need for moisturization',
      'Sensitivity to weather changes',
      'Premature fine lines',
      'Skin barrier easily compromised',
    ],
    morningRoutine: [
      {
        step: 'Gentle Cleanser',
        description: 'Use a creamy, hydrating cleanser or just rinse with water',
        products: ['Cream cleanser', 'Milk cleanser', 'Oil cleanser'],
      },
      {
        step: 'Hydrating Toner',
        description: 'Apply essence or hydrating toner to prep skin',
        products: ['Hyaluronic acid toner', 'Rose water', 'Glycerin toner'],
      },
      {
        step: 'Serum',
        description: 'Layer hydrating and nourishing serums',
        products: ['Hyaluronic acid serum', 'Vitamin E serum', 'Peptide serum'],
      },
      {
        step: 'Eye Cream',
        description: 'Apply rich eye cream to delicate under-eye area',
        products: ['Ceramide eye cream', 'Peptide eye cream'],
      },
      {
        step: 'Moisturizer',
        description: 'Use a rich, emollient moisturizer',
        products: ['Cream moisturizer', 'Ceramide cream', 'Shea butter cream'],
      },
      {
        step: 'Sunscreen',
        description: 'Apply moisturizing SPF 30+ sunscreen',
        products: ['Cream sunscreen', 'Hydrating SPF', 'Mineral moisturizing SPF'],
      },
    ],
    nightRoutine: [
      {
        step: 'Oil Cleanse',
        description: 'Remove makeup with nourishing cleansing oil or balm',
        products: ['Cleansing balm', 'Cleansing oil', 'Micellar oil'],
      },
      {
        step: 'Gentle Cleanser',
        description: 'Follow with cream cleanser if needed',
        products: ['Cream cleanser', 'Milk cleanser'],
      },
      {
        step: 'Hydrating Essence',
        description: 'Layer multiple hydrating products',
        products: ['Hydrating essence', 'Facial oil', 'Hyaluronic acid'],
      },
      {
        step: 'Treatment',
        description: 'Apply targeted treatments',
        products: ['Retinol', 'Peptide serum', 'Ceramide treatment'],
      },
      {
        step: 'Night Cream',
        description: 'Apply thick, nourishing night cream',
        products: ['Rich night cream', 'Sleeping mask', 'Face oil'],
      },
      {
        step: 'Optional: Face Oil',
        description: 'Seal everything in with facial oil',
        products: ['Rosehip oil', 'Argan oil', 'Squalane oil'],
      },
    ],
    ingredients: {
      beneficial: [
        { name: 'Hyaluronic Acid', benefit: 'Attracts and retains moisture' },
        { name: 'Ceramides', benefit: 'Repairs and strengthens skin barrier' },
        { name: 'Glycerin', benefit: 'Humectant that draws water to skin' },
        { name: 'Shea Butter', benefit: 'Rich emollient that nourishes' },
        { name: 'Squalane', benefit: 'Mimics skin\'s natural oils' },
        { name: 'Peptides', benefit: 'Supports collagen and repairs' },
      ],
      avoid: [
        { name: 'Alcohol Denat', reason: 'Extremely drying and irritating' },
        { name: 'Fragrances', reason: 'Can irritate sensitive dry skin' },
        { name: 'Harsh Sulfates', reason: 'Strip natural oils from skin' },
        { name: 'Physical Exfoliants', reason: 'Can damage compromised barrier' },
      ],
    },
    lifestyle: [
      'Use a humidifier in dry environments',
      'Drink 8+ glasses of water daily',
      'Limit hot showers to 10 minutes',
      'Pat skin dry instead of rubbing',
      'Wear SPF even in winter',
      'Eat omega-3 rich foods (salmon, walnuts)',
      'Avoid harsh soaps and detergents',
    ],
    myths: [
      {
        myth: 'Dry skin doesn\'t need sunscreen',
        truth: 'All skin types need SPF. Sun exposure further damages the skin barrier.',
      },
      {
        myth: 'Drinking more water cures dry skin',
        truth: 'While hydration helps, topical moisturizers are essential to lock in moisture.',
      },
      {
        myth: 'Oils make your skin oily',
        truth: 'Facial oils actually help repair the skin barrier and prevent moisture loss.',
      },
    ],
    tips: [
      'Apply moisturizer to damp skin for better absorption',
      'Layer products from thinnest to thickest',
      'Keep a facial mist handy for quick hydration',
      'Avoid very hot water on your face',
      'Consider a overnight sleeping mask weekly',
    ],
    color: 'from-amber-50 to-amber-100',
    gradient: 'from-amber-500 to-orange-500',
  },
  combination: {
    type: 'Combination',
    emoji: '⚖️',
    tagline: 'Oily T-zone with normal or dry cheeks',
    description: 'Combination skin features two or more skin types on different areas of the face. Typically, the T-zone (forehead, nose, chin) is oily while cheeks and other areas are normal or dry. This skin type requires balanced care targeting different zones appropriately.',
    characteristics: [
      'Oily forehead, nose, and chin (T-zone)',
      'Normal to dry cheeks and jaw',
      'Larger pores in T-zone',
      'Occasional breakouts in oily areas',
      'Different concerns in different zones',
    ],
    causes: [
      'Genetics (most common cause)',
      'Variable sebaceous gland activity',
      'Hormonal fluctuations',
      'Seasonal changes',
      'Using wrong products for your skin',
    ],
    benefits: [
      'Versatility in product choices',
      'Not as prone to issues as fully oily skin',
      'Can adapt routine seasonally',
      'Generally well-balanced overall',
    ],
    challenges: [
      'Finding one-size-fits-all products',
      'Managing two different skin types',
      'Balancing oiliness and dryness',
      'Needs customized approach',
    ],
    morningRoutine: [
      {
        step: 'Gentle Cleanser',
        description: 'Use a balanced gel or foam cleanser',
        products: ['Gentle gel cleanser', 'Balanced foam cleanser'],
      },
      {
        step: 'Toner',
        description: 'Apply balancing toner all over',
        products: ['Balancing toner', 'Witch hazel', 'Rose water'],
      },
      {
        step: 'Serum (Zone Targeted)',
        description: 'Niacinamide for T-zone, hydrating serum for cheeks',
        products: ['Niacinamide serum', 'Hyaluronic acid', 'Multi-action serum'],
      },
      {
        step: 'Moisturizer (Multi-masking)',
        description: 'Lighter gel for T-zone, richer cream for cheeks',
        products: ['Gel-cream hybrid', 'Lightweight moisturizer', 'Zone-specific creams'],
      },
      {
        step: 'Sunscreen',
        description: 'Use a lightweight, non-comedogenic SPF',
        products: ['Gel sunscreen', 'Lightweight SPF', 'Mineral sunscreen'],
      },
    ],
    nightRoutine: [
      {
        step: 'Cleanse',
        description: 'Double cleanse if wearing makeup',
        products: ['Micellar water', 'Balanced cleanser'],
      },
      {
        step: 'Exfoliate',
        description: 'Use chemical exfoliant on T-zone 2-3x/week',
        products: ['BHA for T-zone', 'Gentle AHA for cheeks'],
      },
      {
        step: 'Treatment',
        description: 'Spot treat oily zones, nourish dry areas',
        products: ['Retinol', 'Targeted treatments'],
      },
      {
        step: 'Night Moisturizer',
        description: 'Apply appropriate moisturizer to each zone',
        products: ['Balanced night cream', 'Multi-zone formula'],
      },
    ],
    ingredients: {
      beneficial: [
        { name: 'Niacinamide', benefit: 'Balances oil production' },
        { name: 'Hyaluronic Acid', benefit: 'Hydrates without oil' },
        { name: 'Salicylic Acid', benefit: 'Controls oil in T-zone' },
        { name: 'Peptides', benefit: 'Nourishes dry areas' },
        { name: 'Green Tea Extract', benefit: 'Balances and soothes' },
      ],
      avoid: [
        { name: 'Heavy Oils', reason: 'Too rich for oily zones' },
        { name: 'Harsh Sulfates', reason: 'Over-dry your dry areas' },
        { name: 'Strong Alcohol', reason: 'Disrupts balance' },
      ],
    },
    lifestyle: [
      'Adjust routine seasonally',
      'Pay attention to hormonal changes',
      'Stay hydrated',
      'Use different products for different zones',
      'Keep blotting papers handy for T-zone',
    ],
    myths: [
      {
        myth: 'You need completely different routines',
        truth: 'Many products work for combination skin. Focus on balance and zone-specific treatments only when needed.',
      },
      {
        myth: 'Combination skin is permanent',
        truth: 'Your skin type can change with age, seasons, and hormones. Stay adaptable.',
      },
    ],
    tips: [
      'Master the art of "multi-masking" - different masks for different zones',
      'Consider gel-cream hybrid moisturizers',
      'Don\'t over-treat oily areas',
      'Adjust routine with seasons',
      'Listen to what each zone needs',
    ],
    color: 'from-green-50 to-green-100',
    gradient: 'from-green-500 to-teal-500',
  },
  sensitive: {
    type: 'Sensitive',
    emoji: '🌸',
    tagline: 'Reacts easily to products and environment',
    description: 'Sensitive skin is easily irritated by environmental factors, products, or ingredients. It may be a genetic trait or result from a compromised skin barrier. This skin type requires gentle, fragrance-free products and a minimal, consistent routine.',
    characteristics: [
      'Redness, flushing, or rosacea',
      'Stinging or burning sensations',
      'Itchy, tight, or uncomfortable feeling',
      'Reacts to products, weather, or stress',
      'Visible blood vessels or capillaries',
    ],
    causes: [
      'Compromised skin barrier',
      'Genetic predisposition',
      'Conditions like rosacea or eczema',
      'Environmental triggers (sun, wind, pollution)',
      'Harsh products or over-exfoliation',
    ],
    benefits: [
      'Forces you to use gentler, better products',
      'Makes you more aware of ingredients',
      'Usually clear of acne (when not reactive)',
      'Responds well to proper care',
    ],
    challenges: [
      'Limited product options',
      'Frequent reactions to new products',
      'Visible redness and irritation',
      'Need to patch test everything',
    ],
    morningRoutine: [
      {
        step: 'Gentle Cleanser',
        description: 'Use ultra-gentle, fragrance-free cleanser or just water',
        products: ['Gentle milk cleanser', 'Micellar water', 'Cream cleanser'],
      },
      {
        step: 'Soothing Toner',
        description: 'Apply calming, alcohol-free toner',
        products: ['Centella toner', 'Thermal water', 'Chamomile toner'],
      },
      {
        step: 'Calming Serum',
        description: 'Use minimal, soothing serum',
        products: ['Centella serum', 'Azelaic acid', 'Niacinamide (low %)'],
      },
      {
        step: 'Barrier Repair',
        description: 'Apply ceramide-rich moisturizer',
        products: ['Ceramide moisturizer', 'Barrier cream', 'Gentle lotion'],
      },
      {
        step: 'Mineral Sunscreen',
        description: 'Use gentle, physical SPF 30+',
        products: ['Zinc oxide sunscreen', 'Mineral SPF', 'Sensitive formula'],
      },
    ],
    nightRoutine: [
      {
        step: 'Gentle Cleanse',
        description: 'Use minimal cleanser or micellar water',
        products: ['Micellar water', 'Gentle cleanser'],
      },
      {
        step: 'Calming Treatment',
        description: 'Apply soothing essence or serum',
        products: ['Centella essence', 'Calming serum'],
      },
      {
        step: 'Repair Cream',
        description: 'Use rich, barrier-repairing night cream',
        products: ['Ceramide night cream', 'Gentle repair cream'],
      },
      {
        step: 'Optional: Occlusive',
        description: 'Seal with gentle occlusive if very dry',
        products: ['Gentle face oil', 'Ceramide ointment'],
      },
    ],
    ingredients: {
      beneficial: [
        { name: 'Centella Asiatica', benefit: 'Calms inflammation and repairs' },
        { name: 'Ceramides', benefit: 'Strengthens barrier function' },
        { name: 'Colloidal Oatmeal', benefit: 'Soothes irritation' },
        { name: 'Azelaic Acid', benefit: 'Gentle anti-inflammatory' },
        { name: 'Niacinamide (low %)', benefit: 'Calms (at 2-5% concentration)' },
        { name: 'Allantoin', benefit: 'Soothes and heals' },
      ],
      avoid: [
        { name: 'Fragrances', reason: 'Common irritants and allergens' },
        { name: 'Essential Oils', reason: 'Can trigger reactions' },
        { name: 'Alcohol Denat', reason: 'Drying and irritating' },
        { name: 'Strong Acids', reason: 'Too harsh for sensitive skin' },
        { name: 'Physical Scrubs', reason: 'Cause micro-tears' },
      ],
    },
    lifestyle: [
      'Always patch test new products',
      'Avoid extreme temperatures',
      'Protect face from wind and cold',
      'Manage stress levels',
      'Identify and avoid your triggers',
      'Keep a skincare diary',
      'Use gentle, fragrance-free laundry detergent',
    ],
    myths: [
      {
        myth: 'Sensitive skin can\'t use active ingredients',
        truth: 'You can use actives, but choose gentle formulas and introduce slowly (azelaic acid, low % niacinamide).',
      },
      {
        myth: 'Natural products are always safe',
        truth: 'Natural doesn\'t mean safe. Essential oils and plant extracts can be highly irritating.',
      },
      {
        myth: 'You\'ll outgrow sensitive skin',
        truth: 'Some people improve with proper care, but many remain sensitive. The goal is management.',
      },
    ],
    tips: [
      'Less is more - keep routine minimal',
      'Patch test for 48 hours before full use',
      'Look for "fragrance-free" not "unscented"',
      'Avoid physical exfoliation',
      'Consider seeing a dermatologist for persistent issues',
    ],
    color: 'from-pink-50 to-pink-100',
    gradient: 'from-pink-500 to-rose-500',
  },
  normal: {
    type: 'Normal',
    emoji: '✨',
    tagline: 'Well-balanced with minimal issues',
    description: 'Normal skin is well-balanced with minimal issues - not too oily, not too dry, with small pores and few imperfections. While this is the ideal skin type, it still requires proper care and maintenance to keep it healthy and prevent future concerns.',
    characteristics: [
      'Balanced moisture and oil production',
      'Small, barely visible pores',
      'Even skin tone and texture',
      'Rare breakouts or sensitivity',
      'Radiant, healthy appearance',
    ],
    causes: [
      'Genetic blessing',
      'Good skincare habits',
      'Healthy lifestyle',
      'Balanced hormones',
      'Proper skin barrier function',
    ],
    benefits: [
      'Most products work well',
      'Minimal skin concerns',
      'Makeup applies beautifully',
      'Resilient to changes',
      'Ages well with proper care',
    ],
    challenges: [
      'May take skin for granted',
      'Can become complacent',
      'Still needs sun protection',
      'Can change with age/seasons',
    ],
    morningRoutine: [
      {
        step: 'Gentle Cleanser',
        description: 'Use balanced gel or cream cleanser',
        products: ['Gentle gel cleanser', 'Cream cleanser', 'Balanced wash'],
      },
      {
        step: 'Toner',
        description: 'Apply hydrating or brightening toner',
        products: ['Hydrating toner', 'Vitamin C toner', 'Rose water'],
      },
      {
        step: 'Serum',
        description: 'Choose based on goals (brightening, anti-aging)',
        products: ['Vitamin C serum', 'Hyaluronic acid', 'Antioxidant serum'],
      },
      {
        step: 'Eye Cream',
        description: 'Apply preventative eye cream',
        products: ['Peptide eye cream', 'Brightening eye cream'],
      },
      {
        step: 'Moisturizer',
        description: 'Use lightweight, balanced moisturizer',
        products: ['Gel-cream', 'Balanced lotion', 'Lightweight cream'],
      },
      {
        step: 'Sunscreen',
        description: 'Apply broad-spectrum SPF 30+ daily',
        products: ['Lightweight SPF', 'Moisturizing sunscreen'],
      },
    ],
    nightRoutine: [
      {
        step: 'Double Cleanse',
        description: 'Remove makeup, then cleanse',
        products: ['Cleansing oil/balm', 'Gentle cleanser'],
      },
      {
        step: 'Exfoliate',
        description: 'Use gentle chemical exfoliant 2-3x/week',
        products: ['AHA/BHA toner', 'Gentle exfoliant'],
      },
      {
        step: 'Treatment Serum',
        description: 'Apply targeted treatment',
        products: ['Retinol', 'Peptides', 'Niacinamide'],
      },
      {
        step: 'Eye Cream',
        description: 'Apply richer night eye cream',
        products: ['Retinol eye cream', 'Peptide eye treatment'],
      },
      {
        step: 'Night Cream',
        description: 'Use nourishing night moisturizer',
        products: ['Night cream', 'Sleeping mask'],
      },
    ],
    ingredients: {
      beneficial: [
        { name: 'Vitamin C', benefit: 'Brightens and protects' },
        { name: 'Retinol', benefit: 'Anti-aging prevention' },
        { name: 'Hyaluronic Acid', benefit: 'Maintains hydration' },
        { name: 'Niacinamide', benefit: 'Overall skin health' },
        { name: 'Peptides', benefit: 'Supports collagen' },
        { name: 'Antioxidants', benefit: 'Prevents damage' },
      ],
      avoid: [
        { name: 'Harsh Sulfates', reason: 'Can disrupt balance' },
        { name: 'Over-exfoliation', reason: 'Unnecessary irritation' },
      ],
    },
    lifestyle: [
      'Maintain consistent routine',
      'Stay hydrated',
      'Eat balanced, nutritious diet',
      'Get adequate sleep',
      'Manage stress',
      'Exercise regularly',
      'Never skip sunscreen',
    ],
    myths: [
      {
        myth: 'Normal skin doesn\'t need much care',
        truth: 'Prevention is key! Proper care now prevents future issues and maintains your skin\'s health.',
      },
      {
        myth: 'You can use any product',
        truth: 'While you have more flexibility, quality ingredients still matter for long-term health.',
      },
      {
        myth: 'Normal skin won\'t change',
        truth: 'Skin type can shift with age, hormones, climate, and lifestyle. Stay attentive.',
      },
    ],
    tips: [
      'Focus on prevention - use sunscreen daily',
      'Start anti-aging products early (mid-20s)',
      'Don\'t take your skin for granted',
      'Adjust routine with seasons',
      'Maintain healthy lifestyle habits',
    ],
    color: 'from-purple-50 to-purple-100',
    gradient: 'from-purple-500 to-indigo-500',
  },
};

const SkinTypeDetail = () => {
  const { type } = useParams();
  const skinType = type?.toLowerCase();

  if (!skinType || !skinTypeData[skinType]) {
    return <Navigate to="/skin-types" replace />;
  }

  const data = skinTypeData[skinType];
  
  const validSkinTypes = ['oily', 'dry', 'combination', 'sensitive', 'normal'] as const;
  const recommendedProducts = products.filter((p) =>
    validSkinTypes.includes(skinType as typeof validSkinTypes[number]) && 
    p.skinTypes.includes(skinType as typeof validSkinTypes[number])
  ).slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className={`py-16 bg-gradient-to-br ${data.color}`}>
        <div className="container mx-auto px-4">
          <Link to="/skin-types" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to All Skin Types
          </Link>
          
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{data.emoji}</span>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold">
                  {data.type} Skin
                </h1>
                <p className="text-xl text-muted-foreground mt-2">{data.tagline}</p>
              </div>
            </div>
            <p className="text-lg mt-4">{data.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4">
            <Link to="/quiz">
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>
            <Link to={`/shop?skinType=${skinType}`}>
              <Button className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Shop Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Characteristics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl font-bold mb-6">Key Characteristics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Signs & Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.characteristics.map((char, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Common Causes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Benefits & Challenges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl font-bold mb-6">The Good & The Challenging</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700">✓ Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-700">! Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Skincare Routines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl font-bold mb-6">Recommended Routines</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Morning Routine */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-orange-600" />
                  Morning Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.morningRoutine.map((step, i) => (
                    <div key={i} className="border-l-2 border-orange-300 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{i + 1}</Badge>
                        <h4 className="font-semibold">{step.step}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {step.products.map((product, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Night Routine */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-600" />
                  Night Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.nightRoutine.map((step, i) => (
                    <div key={i} className="border-l-2 border-indigo-300 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{i + 1}</Badge>
                        <h4 className="font-semibold">{step.step}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {step.products.map((product, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Ingredients */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl font-bold mb-6">Ingredient Guide</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Beneficial Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {data.ingredients.beneficial.map((ing, i) => (
                    <div key={i}>
                      <h4 className="font-semibold text-green-700">{ing.name}</h4>
                      <p className="text-sm text-muted-foreground">{ing.benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Ingredients to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {data.ingredients.avoid.map((ing, i) => (
                    <div key={i}>
                      <h4 className="font-semibold text-red-700">{ing.name}</h4>
                      <p className="text-sm text-muted-foreground">{ing.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Lifestyle Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl font-bold mb-6">Lifestyle & Care Tips</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {data.lifestyle.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Myths Debunked */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8"
        >
          <h2 className="font-heading text-3xl font-bold mb-6">Myths Debunked</h2>
          <div className="space-y-6">
            {data.myths.map((item, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 rounded-full p-2 shrink-0">
                      <span className="text-red-600 font-bold text-sm">✗</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-700 mb-2">Myth: {item.myth}</p>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-2 shrink-0">
                          <span className="text-green-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-green-700">Truth:</span> {item.truth}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Pro Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className={`border-0 bg-gradient-to-br ${data.gradient} text-white`}>
            <CardContent className="pt-6">
              <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Pro Tips for {data.type} Skin
              </h2>
              <ul className="space-y-2">
                {data.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-3xl font-bold">Recommended Products</h2>
              <Link to={`/shop?skinType=${skinType}`}>
                <Button variant="outline" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="gradient-primary rounded-3xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Build Your Perfect Routine?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Explore our curated selection of products perfect for {data.type.toLowerCase()} skin
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={`/shop?skinType=${skinType}`}>
              <Button size="lg" variant="secondary" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Shop {data.type} Skin Products
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <BookOpen className="h-5 w-5" />
                Learn More About Skincare
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default SkinTypeDetail;
