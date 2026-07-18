"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const glossaryTerms = [
  { term: "AHAs", full: "Alpha Hydroxy Acids", definition: "Water-soluble acids from fruits and milk that exfoliate the skin's surface. Glycolic and lactic acid are common. Best for dry and sun-damaged skin.", category: "Exfoliants" },
  { term: "Antioxidants", full: null, definition: "Molecules that protect skin from free radical damage caused by UV rays and pollution. Common ones: Vitamin C, Vitamin E, niacinamide.", category: "Ingredients" },
  { term: "BHAs", full: "Beta Hydroxy Acids", definition: "Oil-soluble acids that penetrate pores to exfoliate from within. Salicylic acid is the most common BHA. Best for oily and acne-prone skin.", category: "Exfoliants" },
  { term: "Ceramides", full: null, definition: "Lipids naturally found in skin that form a protective barrier. They help retain moisture and protect against environmental damage.", category: "Ingredients" },
  { term: "Collagen", full: null, definition: "A protein that provides structure and elasticity to skin. Production decreases with age, leading to wrinkles and sagging.", category: "Skin Structure" },
  { term: "Comedogenic", full: null, definition: "Describes ingredients that tend to clog pores and cause acne. Non-comedogenic products are formulated to avoid pore blockage.", category: "Terminology" },
  { term: "Double Cleansing", full: null, definition: "A two-step method: oil-based cleanser to remove makeup and sunscreen, followed by water-based cleanser for deep cleaning.", category: "Techniques" },
  { term: "Elastin", full: null, definition: "A protein that allows skin to stretch and bounce back. Works with collagen to maintain skin's youthful appearance.", category: "Skin Structure" },
  { term: "Emollient", full: null, definition: "An ingredient that softens and smooths skin by filling gaps between skin cells. Examples: shea butter, jojoba oil.", category: "Ingredients" },
  { term: "Free Radicals", full: null, definition: "Unstable molecules that damage skin cells and accelerate aging. Caused by UV, pollution, and stress. Antioxidants neutralize them.", category: "Science" },
  { term: "Hyaluronic Acid", full: null, definition: "A powerful humectant that holds up to 1000× its weight in water. Provides deep hydration and plumps skin.", category: "Ingredients" },
  { term: "Humectant", full: null, definition: "An ingredient that attracts water from the environment to hydrate the skin surface. Examples: hyaluronic acid, glycerin.", category: "Ingredients" },
  { term: "Hyperpigmentation", full: null, definition: "Darkening of skin from excess melanin production. Can result from sun exposure, inflammation, or hormonal changes.", category: "Conditions" },
  { term: "Keratosis Pilaris", full: null, definition: "A common condition causing small, rough bumps on arms, thighs, and cheeks. Caused by keratin buildup in hair follicles.", category: "Conditions" },
  { term: "Moisture Barrier", full: null, definition: "The outermost skin layer that protects against water loss and environmental damage. Also called the skin barrier or acid mantle.", category: "Skin Structure" },
  { term: "Niacinamide", full: null, definition: "Vitamin B3. Brightens skin, minimizes pores, reduces inflammation, and strengthens the skin barrier. Suitable for all skin types.", category: "Ingredients" },
  { term: "Occlusive", full: null, definition: "An ingredient that creates a physical barrier on skin to prevent water loss. Examples: petroleum jelly, dimethicone.", category: "Ingredients" },
  { term: "pH Balance", full: null, definition: "Healthy skin pH is 4.5–5.5. Skincare products should be pH-balanced to maintain skin health and barrier function.", category: "Science" },
  { term: "Peptides", full: null, definition: "Short amino acid chains that signal skin to produce more collagen. Different peptides target wrinkles, firmness, or hydration.", category: "Ingredients" },
  { term: "Photoaging", full: null, definition: "Premature aging from repeated sun exposure. Includes wrinkles, dark spots, loss of elasticity, and rough texture.", category: "Conditions" },
  { term: "Retinoids", full: null, definition: "Vitamin A derivatives that increase cell turnover, boost collagen, and reduce acne. Available OTC to prescription strengths.", category: "Ingredients" },
  { term: "Sebum", full: null, definition: "Natural oil from sebaceous glands. Protects and moisturizes, but excess sebum leads to oily skin and acne.", category: "Skin Structure" },
  { term: "SPF", full: "Sun Protection Factor", definition: "A measure of UVB protection. SPF 30 blocks 97% of UVB rays. Higher SPFs offer marginally more protection.", category: "Terminology" },
  { term: "TEWL", full: "Transepidermal Water Loss", definition: "Water passing from deeper skin layers through the epidermis, evaporating from the surface. A healthy barrier minimizes TEWL.", category: "Science" },
];

const categories = [...new Set(glossaryTerms.map((t) => t.category))].sort();

const GlossaryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) || (t.full && t.full.toLowerCase().includes(q));
      return matchesSearch && (selectedCategory ? t.category === selectedCategory : true);
    });
  }, [searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof filteredTerms> = {};
    filteredTerms.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      (groups[letter] ??= []).push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTerms]);

  const allLetters = useMemo(() => [...new Set(glossaryTerms.map((t) => t.term[0].toUpperCase()))].sort(), []);
  const activeLetters = useMemo(() => new Set(groupedTerms.map(([l]) => l)), [groupedTerms]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[56rem] px-4 sm:px-6 lg:px-8">
        {/* Hero — compact lexicon intro */}
        <section className="pb-10 pt-20 md:pt-28">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Skincare Glossary</span>
            <h1 className="mt-3 font-heading text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-4xl">
              Know your <span className="text-primary">ingredients</span>
            </h1>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              24 terms every skincare buyer should understand. From AHAs to TEWL — the science behind what you put on your skin.
            </p>
          </motion.div>
        </section>

        {/* Sticky search + category filter */}
        <div className="sticky top-16 z-20 -mx-4 bg-background/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms or definitions..."
              className="w-full rounded-gg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === null ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Alphabet jump nav */}
        <div className="flex flex-wrap gap-1 py-3">
          {allLetters.map((letter) => {
            const isActive = activeLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => { document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={`flex h-8 w-8 items-center justify-center rounded-gg-sm text-xs font-bold transition-colors ${
                  isActive ? "bg-primary text-white hover:bg-primary-hover" : "bg-muted text-muted-foreground/30 cursor-default"
                }`}
                disabled={!isActive}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="mb-8 h-px bg-border" />

        {/* Terms — dictionary layout */}
        <section className="pb-12">
          {filteredTerms.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base font-medium text-muted-foreground">No terms found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear filters.</p>
              <button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }} className="mt-4 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-hover">Clear filters</button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedTerms.map(([letter, terms]) => (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                  <div className="mb-4 flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-gg-sm bg-muted font-heading text-xl font-bold text-primary">{letter}</span>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>
                  <motion.div
                    className="space-y-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
                  >
                    {terms.map((t) => (
                      <motion.div
                        key={t.term}
                        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                        className="group rounded-gg border border-border bg-card p-4 transition-shadow hover:shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              {t.term}
                              {t.full && <span className="ml-1.5 text-xs font-normal text-muted-foreground">({t.full})</span>}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.definition}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.category}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-border" />

        {/* Inline CTA */}
        <section className="py-12 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground">Not sure which ingredients you need?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Our skin analysis matches your concerns to the right ingredients.</p>
          <Link href="/analysis" className="mt-5 inline-block">
            <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
              Take the skin analysis <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default GlossaryPage;
