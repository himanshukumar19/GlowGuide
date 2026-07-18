"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const commonMistakes = [
  { mistake: "Over-washing your face", why: "Strips natural oils, causing skin to overproduce sebum.", solution: "Wash twice daily with a gentle cleanser. Morning: water alone may suffice.", severity: "high" as const },
  { mistake: "Skipping sunscreen", why: "UV damage causes 80% of visible aging — wrinkles, spots, loss of elasticity.", solution: "Apply SPF 30+ every morning, even on cloudy days. Reapply every 2 hours.", severity: "high" as const },
  { mistake: "Using too many actives", why: "Combining actives can irritate and damage the moisture barrier.", solution: "Introduce one new product at a time. Alternate actives on different days.", severity: "high" as const },
  { mistake: "Not removing makeup before bed", why: "Leads to clogged pores, breakouts, and accelerated aging.", solution: "Double cleanse: oil cleanser first, then water-based cleanser.", severity: "high" as const },
  { mistake: "Popping pimples", why: "Pushes bacteria deeper, causes scarring and inflammation.", solution: "Use spot treatments. See a dermatologist for cystic acne.", severity: "high" as const },
  { mistake: "Exfoliating too often", why: "Damages skin barrier — redness, sensitivity, breakouts.", solution: "Limit to 1–3 times per week depending on your skin type.", severity: "high" as const },
  { mistake: "Using hot water on your face", why: "Strips natural oils, causes redness and broken capillaries.", solution: "Lukewarm for cleansing. Finish with cool water.", severity: "medium" as const },
  { mistake: "Touching your face frequently", why: "Transfers bacteria, oil, and dirt — breakouts.", solution: "Be mindful. Keep hands clean, avoid resting chin on hands.", severity: "medium" as const },
  { mistake: "Not patch testing new products", why: "Allergic reactions or irritation can occur.", solution: "Test behind ear or inner wrist. Wait 24–48 hours.", severity: "medium" as const },
  { mistake: "Using expired products", why: "Lose effectiveness and can harbor bacteria.", solution: "Check dates. Most products last 6–12 months after opening.", severity: "medium" as const },
  { mistake: "Not moisturizing oily skin", why: "Skin overcompensates with more oil.", solution: "Lightweight, oil-free, or gel moisturizers.", severity: "medium" as const },
  { mistake: "Ignoring your neck and chest", why: "These areas show aging too but are neglected.", solution: "Extend all skincare products down to neck and chest.", severity: "low" as const },
];

const severityConfig = {
  high: { bar: "border-l-destructive", bg: "bg-destructive/[0.03]" },
  medium: { bar: "border-l-warning", bg: "bg-warning/[0.03]" },
  low: { bar: "border-l-primary", bg: "bg-primary/[0.02]" },
};

const goodHabits = [
  "Keep your routine simple — 3–5 products is enough",
  "Be consistent — results take 4–6 weeks minimum",
  "Listen to your skin — adjust based on how it feels",
  "Invest in quality basics rather than trendy products",
  "Learn about the ingredients you use",
  "Consult professionals for persistent issues",
];

const MistakesPage = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-[72rem] px-4 sm:px-6 lg:px-8">
      {/* Hero — the count is the statement */}
      <section className="pb-16 pt-20 md:pb-20 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">Common Mistakes</span>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            <span className="text-secondary">Twelve</span> habits that hurt your skin
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Most skincare damage comes from what you do daily, not what you buy.
            Here are the most common mistakes — and exactly how to fix each one.
          </p>
        </motion.div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* Mistakes grid — the hero content */}
      <section className="pb-14 md:pb-18">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">What not to do</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Each mistake, fixed</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {commonMistakes.map((item, i) => {
            const config = severityConfig[item.severity];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-gg-lg border border-border bg-card p-5 border-l-[3px] transition-shadow hover:shadow-soft ${config.bar} ${config.bg}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-semibold text-foreground">{item.mistake}</h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.severity} impact</span>
                </div>
                <div className="mb-3 ml-6 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <p className="text-xs leading-relaxed text-muted-foreground">{item.why}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <p className="text-xs leading-relaxed text-foreground/80">{item.solution}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* Good habits + CTA */}
      <section className="pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Build good habits</span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">The foundation of healthy skin</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {goodHabits.map((habit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-gg border border-border bg-card p-3.5"
                >
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{habit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-heading text-xl font-bold text-foreground">Ready to fix your routine?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Our analysis identifies your skin type and builds a routine that works.</p>
            <Link href="/analysis" className="mt-5">
              <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
                Find your skin type <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default MistakesPage;
