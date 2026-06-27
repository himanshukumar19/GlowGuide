import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, ShieldCheck, Sun, Moon, Sparkles, ShoppingBag, RotateCcw, Heart } from "lucide-react";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { useWishlist } from "@/store/useWishlistStore";
import { useCart } from "@/store/useCartStore";
import { toast } from "sonner";

interface AnalysisResultsProps {
  skinType: string;
  confidence: number;
  probabilities: Record<string, number>;
  concernsDetected: string[];
  onRestart: () => void;
  answers: Record<string, number>;
}

const SKIN_TYPE_DESCRIPTIONS: Record<string, { title: string; desc: string; color: string; bg: string }> = {
  oily: {
    title: "Oily Skin",
    desc: "Your skin has active sebaceous glands producing excess sebum, leading to shine and enlarged pores, especially in the T-zone.",
    color: "text-primary",
    bg: "bg-primary/10"
  },
  dry: {
    title: "Dry Skin",
    desc: "Your skin barrier lacks lipids and moisture, causing tightness, flaking, and occasional sensitivity or rough patches.",
    color: "text-amber-700",
    bg: "bg-amber-100"
  },
  combination: {
    title: "Combination Skin",
    desc: "You experience dual skin conditions: an oily T-zone (forehead, nose, chin) with dry or normal cheeks and jawline.",
    color: "text-emerald-700",
    bg: "bg-emerald-100"
  },
  sensitive: {
    title: "Sensitive Skin",
    desc: "Your skin barrier is highly reactive, frequently experiencing redness, burning, itching, or inflammation to active ingredients.",
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  normal: {
    title: "Normal Skin",
    desc: "Your skin is perfectly balanced in moisture and sebum production. It displays minimal visible pores, fine lines, or flaking.",
    color: "text-primary",
    bg: "bg-primary/10"
  }
};

const ROUTINES: Record<string, { morning: string[]; night: string[] }> = {
  oily: {
    morning: ["Salicylic Acid Foaming Cleanser", "Niacinamide Pore Refiner", "Lightweight Hyaluronic Gel-Moisturizer", "Broad-Spectrum Matte SPF 50+"],
    night: ["Oil Cleanser (Double Cleanse)", "Salicylic Acid Cleanser", "Clay Mask / BHA Serum (2x week)", "Soothing Hydration Gel"]
  },
  dry: {
    morning: ["Gentle Milky/Cream Cleanser", "Hyaluronic Acid Hydrating Toner", "Ceramide Cream Moisturizer", "Dewy Glow SPF 50+"],
    night: ["Gentle Cleanser", "Peptide Revitalizing Serum", "Deep Moisture Ceramide Cream", "Facial Barrier Oil (Locked layer)"]
  },
  combination: {
    morning: ["Balanced Foaming Cleanser", "Witch Hazel / Hyaluronic Toner", "Lightweight Hydrating Lotion", "Fluid Sunscreen SPF 50+"],
    night: ["Gentle Cleanser", "Niacinamide Balancing Serum", "Ceramide Hydrating Cream", "Targeted Spot Exfoliator (1-2x week)"]
  },
  sensitive: {
    morning: ["Sulfate-Free Calming Cleanser", "Centella Asiatica (Cica) Toner", "Panthenol Barrier Cream", "Mineral Mild SPF 50+"],
    night: ["Sulfate-Free Cleanser", "Cica Recovery Ampoule", "Squalane Calming cream", "Ceramide Soothing balm"]
  },
  normal: {
    morning: ["Gentle Foaming Cleanser", "Vitamin C Brightening Serum", "Daily Hydrating Cream", "Moisturizing SPF 30+"],
    night: ["Gentle Cleanser", "Retinol Serum (Gentle cell-turnover)", "Barrier Protection Cream", "Hydrating Sheet Mask (Weekly)"]
  }
};

export const AnalysisResults = ({
  skinType,
  confidence,
  probabilities,
  concernsDetected,
  onRestart,
  answers
}: AnalysisResultsProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formattedType = skinType.toLowerCase().trim();
  const typeConfig = SKIN_TYPE_DESCRIPTIONS[formattedType] || SKIN_TYPE_DESCRIPTIONS.normal;
  const routine = ROUTINES[formattedType] || ROUTINES.normal;

  // 1. Calculate a dynamic skin health score based on quiz answers
  // Sebum close to 50, hydration close to 90, sensitivity low, tightness low = higher score
  const sebum = answers.sebum_level ?? 50;
  const hydration = answers.hydration_level ?? 50;
  const sensitivity = answers.sensitivity_score ?? answers.sensitivity_level ?? 30;
  const tightness = answers.tightness_score ?? 30;

  const sebumPenalty = Math.abs(50 - sebum); // penalty up to 45
  const hydrationPenalty = Math.max(0, 90 - hydration); // penalty up to 80
  const sensitivityPenalty = Math.max(0, sensitivity - 20); // penalty up to 65
  const tightnessPenalty = Math.max(0, tightness - 20); // penalty up to 70

  const rawScore = 100 - (sebumPenalty * 0.4 + hydrationPenalty * 0.3 + sensitivityPenalty * 0.3 + tightnessPenalty * 0.3);
  const healthScore = Math.max(15, Math.round(Math.min(98, rawScore)));

  // Health Score Semantic color mapping:
  // 90-100: Success Green (#7EC8A0)
  // 60-89: Pale Mint (#A8D5BA)
  // 40-59: Warning Amber (#F5B041)
  // 0-39: Destructive Red (#E57373)
  const getScoreColor = (score: number) => {
    if (score >= 90) return "#7EC8A0";
    if (score >= 60) return "#A8D5BA";
    if (score >= 40) return "#F5B041";
    return "#E57373";
  };

  const scoreColor = getScoreColor(healthScore);

  // 2. Load and filter matching product recommendations from live dataset
  const recommendedProducts = products
    .filter((p) => p.skinTypes.some((t) => t.toLowerCase() === formattedType))
    .slice(0, 3); // show top 3 recommendations

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Result Header */}
      <div className="text-center">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Analysis Diagnostic Completed
        </span>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mt-1">
          Your Skincare Diagnostic Report
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Our Random Forest Classifier and NLP pipeline evaluated your inputs to compile your skin properties.
        </p>
      </div>

      {/* Grid of Metrics */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Skin Health Score Widget */}
        <Card className="border border-border shadow-soft bg-card rounded-gg-lg flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Skin Health Score
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-muted/30"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke={scoreColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * healthScore) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-foreground">{healthScore}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">Scale 0-100</span>
            </div>
          </div>

          <div className="mt-4">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white uppercase tracking-wider"
              style={{ backgroundColor: scoreColor }}
            >
              {healthScore >= 90 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs Care"}
            </span>
          </div>
        </Card>

        {/* Diagnosis overview */}
        <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <Badge className={`${typeConfig.bg} ${typeConfig.color} font-bold text-xs uppercase tracking-wider py-1 px-3 border-0`}>
                Diagnosis: {typeConfig.title}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <span>Model Confidence:</span>
                <span className="text-foreground font-bold">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
            
            <p className="text-foreground/90 text-sm leading-relaxed mb-4">
              {typeConfig.desc}
            </p>

            {/* Detected Concerns */}
            {concernsDetected && concernsDetected.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Detected Concern Markers (via NLP)
                </span>
                <div className="flex flex-wrap gap-2">
                  {concernsDetected.map((concern) => (
                    <Badge
                      key={concern}
                      variant="outline"
                      className="border-secondary/30 bg-secondary/5 text-secondary font-bold text-[10px] uppercase py-0.5 px-2.5 rounded-full"
                    >
                      ⚠️ {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Detected Concern Markers (via NLP)
                </span>
                <span className="text-xs text-muted-foreground italic block">
                  No active blemishes or concerns detected in text notes.
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 mt-5 pt-3.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Sebum:</span> {sebum}%
            </div>
            <div>
              <span className="font-semibold text-foreground">Hydration:</span> {hydration}%
            </div>
            <div>
              <span className="font-semibold text-foreground">Sensitivity:</span> {sensitivity}%
            </div>
            <div>
              <span className="font-semibold text-foreground">Tightness:</span> {tightness}%
            </div>
          </div>
        </Card>
      </div>

      {/* Routine Timeline */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Morning */}
        <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sun className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Morning Routine Timeline
            </h3>
          </div>
          <ol className="space-y-4">
            {routine.morning.map((step, i) => (
              <li key={i} className="flex items-start gap-3.5 text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground block">{step.split(" (")[0]}</span>
                  {step.includes(" (") && (
                    <span className="text-xs text-muted-foreground block">{step.substring(step.indexOf(" (") + 2, step.length - 1)}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* Night */}
        <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Moon className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Night Routine Timeline
            </h3>
          </div>
          <ol className="space-y-4">
            {routine.night.map((step, i) => (
              <li key={i} className="flex items-start gap-3.5 text-sm">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground block">{step.split(" (")[0]}</span>
                  {step.includes(" (") && (
                    <span className="text-xs text-muted-foreground block">{step.substring(step.indexOf(" (") + 2, step.length - 1)}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Product Recommendations */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-xl font-bold text-foreground">
            Personalized Product Matches
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recommendedProducts.map((product) => {
            const isFav = isInWishlist(product.id);
            return (
              <Card
                key={product.id}
                className="border border-border shadow-soft bg-card rounded-gg hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden border-b border-border/40 group">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Button
                    onClick={() => toggleWishlist(product)}
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-soft opacity-90 hover:opacity-100"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? "text-destructive fill-destructive" : "text-foreground"}`} />
                  </Button>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                      {product.brand}
                    </span>
                    <Link to={`/product/${product.id}`} className="hover:underline">
                      <h4 className="font-heading text-base font-bold text-foreground line-clamp-2">
                        {product.name}
                      </h4>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-semibold text-foreground">${product.price.toFixed(2)}</span>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      size="sm"
                      className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs py-1.5 px-3 rounded-gg-sm"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex gap-4 justify-center max-w-4xl mx-auto pt-6 border-t border-border/40">
        <Button onClick={onRestart} variant="outline" className="border-border">
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Skin Diagnosis
        </Button>
        <Link to="/dashboard">
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 shadow-primary rounded-gg-sm">
            Save & Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
