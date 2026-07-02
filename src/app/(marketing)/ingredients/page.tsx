'use client';

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp, Info, HelpCircle } from "lucide-react";

interface Ingredient {
  name: string;
  category: string;
  description: string;
  benefits: string[];
  sideEffects: string[];
  suitableSkinTypes: string[];
}

const INGREDIENTS: Ingredient[] = [
  {
    name: "Centella Asiatica (Cica)",
    category: "Soothing Agent",
    description: "A botanical herb known for its exceptional wound healing and anti-inflammatory properties, perfect for barrier repair.",
    benefits: ["Calms redness and inflammation", "Repairs skin barrier", "Stimulates collagen synthesis"],
    sideEffects: ["Extremely rare contact dermatitis"],
    suitableSkinTypes: ["Sensitive", "Dry", "Combination", "Normal"]
  },
  {
    name: "Ceramides",
    category: "Barrier Restorer",
    description: "Lipids that make up over 50% of the skin barrier, essential for moisture retention and protection against stressors.",
    benefits: ["Restores skin moisture barrier", "Prevents transepidermal water loss", "Smoothes skin texture"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Dry", "Sensitive", "Normal", "Combination", "Oily"]
  },
  {
    name: "Glycolic Acid",
    category: "Chemical Exfoliant (AHA)",
    description: "The smallest alpha hydroxy acid molecule, which penetrates deeply to dissolve dead skin cells and promote cell turnover.",
    benefits: ["Brightens dull skin tone", "Fades hyperpigmentation", "Smooths fine lines and rough patches"],
    sideEffects: ["Mild stinging", "Increased sun sensitivity", "Redness if overused"],
    suitableSkinTypes: ["Normal", "Dry", "Combination"]
  },
  {
    name: "Hyaluronic Acid",
    category: "Humectant",
    description: "A powerful moisture-binding ingredient capable of holding up to 1000 times its weight in water, plumping skin instantly.",
    benefits: ["Intense surface hydration", "Reduces appearance of dehydration lines", "Plumps skin surface"],
    sideEffects: ["Can dry out skin if applied in dry climates without a locking moisturizer"],
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Oily", "Sensitive"]
  },
  {
    name: "Niacinamide (Vitamin B3)",
    category: "Multitasker",
    description: "A water-soluble vitamin that works with natural skin components to refine pores, even skin tone, and strengthen the barrier.",
    benefits: ["Regulates excess sebum production", "Reduces hyperpigmentation and redness", "Minimizes visible pore size"],
    sideEffects: ["Mild flushing or irritation at high concentrations (>10%)"],
    suitableSkinTypes: ["Oily", "Combination", "Normal", "Dry", "Sensitive"]
  },
  {
    name: "Retinol (Vitamin A)",
    category: "Anti-Aging Active",
    description: "A gold-standard active ingredient that speeds up skin cell renewal and boosts collagen production for smoother, younger skin.",
    benefits: ["Speeds up cell turnover", "Fades wrinkles and fine lines", "Clears congested pores"],
    sideEffects: ["Dryness and flaking (retinization)", "Sun sensitivity", "Redness and irritation"],
    suitableSkinTypes: ["Normal", "Dry", "Combination", "Oily"]
  },
  {
    name: "Salicylic Acid (BHA)",
    category: "Acne Treatment",
    description: "An oil-soluble exfoliant that penetrates deep into pores to dissolve sebum, dirt, and cellular debris, reducing blackheads.",
    benefits: ["Clears deep clogged pores", "Exfoliates interior pore walls", "Reduces acne breakouts"],
    sideEffects: ["Mild dryness or peeling", "Slight irritation on compromised skin"],
    suitableSkinTypes: ["Oily", "Combination"]
  },
  {
    name: "Vitamin C (L-Ascorbic Acid)",
    category: "Antioxidant",
    description: "A potent antioxidant that neutralizes free radicals, brightens skin tone, and stimulates collagen to prevent photoaging.",
    benefits: ["Neutralizes free radical damage", "Fades sun spots and acne scars", "Enhances natural radiance"],
    sideEffects: ["Tingling sensation on application", "Can oxidize easily if exposed to light/air"],
    suitableSkinTypes: ["Normal", "Dry", "Combination", "Oily"]
  }
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const IngredientsGlossary = () => {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredIngredients = useMemo(() => {
    return INGREDIENTS.filter((ing) => {
      const matchesSearch =
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.category.toLowerCase().includes(search.toLowerCase());
      const matchesLetter = selectedLetter
        ? ing.name.startsWith(selectedLetter)
        : true;
      return matchesSearch && matchesLetter;
    });
  }, [search, selectedLetter]);

  const clearFilters = () => {
    setSearch("");
    setSelectedLetter(null);
  };

  return (
    <div className="min-h-screen py-16 gradient-hero">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 text-foreground">
              Ingredients Glossary
            </h1>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Search and explore dermatologist-backed information about active skincare ingredients.
            </p>
          </div>

          {/* Search Controls */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ingredient name or category (e.g. BHA)..."
              className="pl-12 pr-4 py-6 rounded-gg border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-soft bg-card w-full"
            />
          </div>

          {/* Alphabet Filter */}
          <div className="flex flex-wrap gap-1 justify-center mb-10 bg-muted/40 border border-border p-2.5 rounded-gg-sm">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1.5 rounded-gg-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedLetter === null
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {ALPHABET.map((letter) => {
              const hasIngredients = INGREDIENTS.some((ing) => ing.name.startsWith(letter));
              return (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-8 h-8 rounded-gg-sm text-xs font-bold transition-all ${
                    selectedLetter === letter
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : hasIngredients
                      ? "text-foreground hover:bg-muted font-black"
                      : "text-muted-foreground/30 cursor-not-allowed"
                  }`}
                  disabled={!hasIngredients}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* List Section */}
          <div className="space-y-4">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ing, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <Card
                    key={ing.name}
                    className="border border-border shadow-soft bg-card rounded-gg hover:shadow-card transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => toggleExpand(index)}
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors select-none"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-secondary uppercase block">
                          {ing.category}
                        </span>
                        <h3 className="font-heading text-xl font-bold text-foreground">
                          {ing.name}
                        </h3>
                      </div>
                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-border/50 pt-4 bg-muted/5 animate-slide-up">
                        <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                          {ing.description}
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Benefits */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold tracking-wider text-foreground uppercase flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Key Benefits
                            </h4>
                            <ul className="space-y-1">
                              {ing.benefits.map((b, i) => (
                                <li key={i} className="text-xs text-foreground/95 flex items-start gap-1">
                                  <span className="text-primary font-bold">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Side Effects */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold tracking-wider text-foreground uppercase flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                              Potential Side Effects
                            </h4>
                            <ul className="space-y-1">
                              {ing.sideEffects.map((se, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <span className="text-destructive font-bold">•</span>
                                  <span>{se}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Suitable Skin Types */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold tracking-wider text-foreground uppercase flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Best Suited For
                            </h4>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {ing.suitableSkinTypes.map((st) => (
                                <Badge
                                  key={st}
                                  variant="secondary"
                                  className="text-[10px] bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors uppercase py-0.5 px-2.5 rounded-full"
                                >
                                  {st}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-gg">
                <Info className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                  No Ingredients Found
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We couldn't find anything matching your search.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary hover:underline hover:text-primary-hover uppercase tracking-wider"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default IngredientsGlossary;
