"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Droplets, Layers, Clock, Heart, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const kbeautySteps = [
  { step: 1, name: "Oil Cleanser", description: "Melts away makeup and sunscreen without stripping your skin.", tip: "Apply to dry skin, massage in circles, rinse with lukewarm water.", phase: "Cleanse", icon: Droplets },
  { step: 2, name: "Water Cleanser", description: "Removes residue for a truly clean canvas.", tip: "Pick a pH-balanced formula — skin should feel soft, not tight.", phase: "Cleanse", icon: Droplets },
  { step: 3, name: "Exfoliator", description: "Dissolves dead skin cells for brighter, smoother skin.", tip: "Chemical exfoliants are gentler. Start once a week.", phase: "Prep", icon: Layers },
  { step: 4, name: "Toner", description: "Rebalances pH and preps skin to absorb what comes next.", tip: "Pat into skin with palms — don't wipe with cotton.", phase: "Prep", icon: Droplets },
  { step: 5, name: "Essence", description: "The heart of K-beauty — concentrated hydration.", tip: "Press into damp skin. This is where layering begins.", phase: "Treat", icon: Sparkles },
  { step: 6, name: "Serum / Ampoule", description: "Targeted treatment for your specific concerns.", tip: "One pump is enough. Let absorb 30 sec before next step.", phase: "Treat", icon: Star },
  { step: 7, name: "Sheet Mask", description: "A 15-minute infusion of active ingredients.", tip: "Use 1–3×/week. Pat in remaining essence, don't rinse.", phase: "Treat", icon: Heart },
  { step: 8, name: "Eye Cream", description: "The delicate under-eye needs its own gentle care.", tip: "Use your ring finger — it applies the least pressure.", phase: "Treat", icon: Sparkles },
  { step: 9, name: "Moisturizer", description: "Locks in every layer. The seal that keeps skin hydrated.", tip: "Gel for oily, cream for dry. Apply to damp skin.", phase: "Seal", icon: Droplets },
  { step: 10, name: "Sunscreen", description: "Non-negotiable. The single most effective anti-aging step.", tip: "Final morning step. Reapply every 2 hours outdoors.", phase: "Seal", icon: Star },
];

const phaseColors: Record<string, string> = {
  Cleanse: "border-l-primary bg-primary/[0.04]",
  Prep: "border-l-primary/70 bg-primary/[0.02]",
  Treat: "border-l-secondary bg-secondary/[0.04]",
  Seal: "border-l-secondary/70 bg-secondary/[0.02]",
};

const principles = [
  { title: "Hydration First", description: "Multiple lightweight layers of moisture, not one heavy cream.", icon: Droplets },
  { title: "Prevention Over Cure", description: "Daily sunscreen and consistent care stop problems before they start.", icon: Shield },
  { title: "Gentle Always", description: "No harsh scrubs, no stripping cleansers. Nourish, don't punish.", icon: Heart },
  { title: "Patience Pays", description: "Give a new routine at least a month. Skin renews every 28 days.", icon: Clock },
];

const ingredientsByConcern = [
  { concern: "Dullness & Dark Spots", accent: "bg-secondary/10 text-secondary", ingredients: [
    { name: "Rice Water", note: "Traditional brightener used for centuries" },
    { name: "Vitamin C", note: "Inhibits melanin production" },
    { name: "Niacinamide", note: "Evens tone, strengthens barrier" },
  ]},
  { concern: "Dryness & Dehydration", accent: "bg-primary/10 text-primary", ingredients: [
    { name: "Hyaluronic Acid", note: "Holds 1000× its weight in water" },
    { name: "Snail Mucin", note: "Deep hydration with healing properties" },
    { name: "Squalane", note: "Mimics skin's natural sebum" },
  ]},
  { concern: "Sensitivity & Redness", accent: "bg-success/15 text-primary", ingredients: [
    { name: "Centella Asiatica", note: "Soothes inflammation, repairs barrier" },
    { name: "Green Tea", note: "Anti-inflammatory antioxidant" },
    { name: "Madecassoside", note: "Calms irritation, promotes healing" },
  ]},
  { concern: "Aging & Fine Lines", accent: "bg-muted text-foreground", ingredients: [
    { name: "Ginseng", note: "Boosts collagen, improves elasticity" },
    { name: "Peptides", note: "Signal skin to produce more collagen" },
    { name: "Bakuchiol", note: "Gentle retinol alternative from plants" },
  ]},
];

const KoreanSkincarePage = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-[72rem] px-4 sm:px-6 lg:px-8">
      {/* Hero — bold statement, above the fold density */}
      <section className="pb-16 pt-20 md:pb-20 md:pt-28">
        <motion.div
          className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">K-Beauty Philosophy</span>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-[3.5rem]">
              Layer by layer,{" "}
              <span className="text-primary">glass skin</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Korean skincare isn&apos;t about more products — it&apos;s about the right ones,
              applied in the right order, with patience. Ten steps, one philosophy: nourish every layer.
            </p>
            <Link href="/analysis" className="mt-6 inline-block">
              <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
                Find your routine <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Principles — inline with hero, tight layout */}
          <div className="grid grid-cols-2 gap-3">
            {principles.map((p, i) => (
              <div
                key={i}
                className="rounded-gg-lg border border-border/60 bg-card p-4 transition-shadow hover:shadow-soft"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-gg-sm bg-muted text-primary">
                  <p.icon className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="mb-12 h-px bg-border" />

      {/* 10-Step Timeline — the signature element */}
      <section className="pb-16 md:pb-20">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">The Routine</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            The 10-step routine
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            You don&apos;t need all ten every day. Start with 1, 4, 9, and 10 — layer in the rest as your skin adjusts.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kbeautySteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-gg-lg border border-border bg-card p-4 border-l-[3px] transition-shadow hover:shadow-soft ${phaseColors[step.phase]}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{step.step}</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{step.phase}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <step.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{step.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                  <p className="mt-2 rounded-md bg-muted/60 px-2.5 py-1.5 text-[11px] leading-relaxed text-primary">{step.tip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mb-12 h-px bg-border" />

      {/* Ingredients by Concern — asymmetric grid */}
      <section className="pb-16 md:pb-20">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Ingredients</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What to look for
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            K-beauty draws from herbal wisdom and modern dermatology. Match your concern to the right ingredient.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {ingredientsByConcern.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-gg-lg border border-border bg-card p-5"
            >
              <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${group.accent}`}>{group.concern}</span>
              <div className="mt-4 space-y-3">
                {group.ingredients.map((ing, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{ing.name}</span>
                      <p className="text-xs text-muted-foreground">{ing.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mb-12 h-px bg-border" />

      {/* Getting Started — merged CTA, no separate footer */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Getting started</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
            You don&apos;t need all ten steps
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with four: cleanse, tone, moisturize, protect. Add one new step every two weeks.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Start simple", "Be consistent", "Patch test first", "Wait 2–3 weeks per product"].map((tip) => (
              <span key={tip} className="rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground">{tip}</span>
            ))}
          </div>
          <Link href="/analysis" className="mt-6 inline-block">
            <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
              Find your routine <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  </div>
);

export default KoreanSkincarePage;
