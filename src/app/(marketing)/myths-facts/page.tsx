"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const mythsAndFacts = [
  { myth: "You don't need sunscreen on cloudy days", fact: "Up to 80% of UV rays penetrate clouds. Sunscreen is essential every day, regardless of weather.", category: "Sun Protection" },
  { myth: "Oily skin doesn't need moisturizer", fact: "All skin types need hydration. Skipping moisturizer can increase oil production as skin compensates.", category: "Moisturizing" },
  { myth: "Natural ingredients are always safer", fact: "Natural doesn't mean safe. Poison ivy is natural. Some synthetic ingredients are gentler and more effective.", category: "Ingredients" },
  { myth: "You should feel a tingling for products to work", fact: "Tingling often indicates irritation, not effectiveness. Good skincare should feel comfortable.", category: "Product Feel" },
  { myth: "Pores open and close with steam", fact: "Pores don't have muscles. Steam can soften debris, but pores don't actually open or close.", category: "Pores" },
  { myth: "Acne is caused by dirty skin", fact: "Acne is caused by hormones, bacteria, and clogged pores. Over-washing can worsen breakouts.", category: "Acne" },
  { myth: "Expensive products work better", fact: "Price doesn't determine effectiveness. Many affordable products contain the same active ingredients.", category: "Products" },
  { myth: "You should exfoliate daily", fact: "Over-exfoliation damages the barrier. 1–3 times per week is sufficient for most skin types.", category: "Exfoliation" },
  { myth: "Dark circles are only from lack of sleep", fact: "Dark circles can be genetic, from allergies, sun exposure, or aging — not just fatigue.", category: "Eye Area" },
  { myth: "Drinking water hydrates your skin", fact: "Topical moisturizers are more effective for skin hydration than drinking water alone.", category: "Hydration" },
  { myth: "You can shrink your pores permanently", fact: "Pore size is genetic. You can minimize appearance with proper care, not change actual size.", category: "Pores" },
  { myth: "SPF in makeup is enough protection", fact: "You'd need 7× the normal amount of foundation. Always use dedicated sunscreen underneath.", category: "Sun Protection" },
];

const evaluationTips = [
  "Check for scientific studies and peer-reviewed research",
  "Be skeptical of 'miracle' claims or instant results",
  "Look for consensus among dermatologists",
  "Consider the source — who benefits from this claim?",
  "If it sounds too good to be true, it probably is",
  "Consult a dermatologist for personalized advice",
];

const MythsFactsPage = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-[72rem] px-4 sm:px-6 lg:px-8">
      {/* Hero — the Myth/Fact system IS the thesis */}
      <section className="pb-16 pt-20 md:pb-20 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">Myths vs Facts</span>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Stop believing{" "}
            <span className="text-secondary line-through decoration-secondary/30 decoration-4">skincare myths</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Half of what you read about skincare is wrong. Here are the facts behind the
            most persistent misconceptions — backed by dermatology, not trends.
          </p>
        </motion.div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* Myth/Fact cards — the signature layout */}
      <section className="pb-14 md:pb-18">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">12 claims</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Debunked</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {mythsAndFacts.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-gg-lg border border-border bg-card transition-shadow hover:shadow-soft"
            >
              <div className="flex items-center justify-between border-b border-destructive/10 bg-destructive/[0.03] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-destructive">Myth</span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{item.category}</span>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-sm font-medium leading-relaxed text-foreground">{item.myth}</p>
              </div>
              <div className="border-t border-primary/10 bg-primary/[0.02] px-5 py-3.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Fact</span>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.fact}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* How to spot + CTA */}
      <section className="pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Think critically</span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">How to spot a skincare myth</h2>
            <p className="mt-2 text-sm text-muted-foreground">Before you believe a claim, run it through this checklist.</p>
            <ol className="mt-6 space-y-3">
              {evaluationTips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-gg border border-border bg-card p-3.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary">{i + 1}</span>
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-heading text-xl font-bold text-foreground">Want science-backed guidance?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Our analysis is built on dermatological research, not skincare trends.</p>
            <Link href="/analysis" className="mt-5">
              <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
                Get science-backed recommendations <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default MythsFactsPage;
