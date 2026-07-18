"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export interface AgeGroup {
  age: string;
  name: string;
  focus: string;
  concerns: string[];
  keyIngredients: string[];
  tip: string;
}

export interface RoutineStep {
  step: number;
  name: string;
  description: string;
  tips: string;
  frequency?: string;
}

export interface AgePageData {
  hero: {
    eyebrow: string;
    eyebrowIcon: LucideIcon;
    title: ReactNode;
    subtitle: string;
  };
  sections: {
    title: string;
    subtitle: string;
    type: "challenges" | "routine" | "tips";
    challenges?: {
      challenge: string;
      description: string;
      icon: LucideIcon;
      solution: string;
    }[];
    routine?: RoutineStep[];
    tips?: { eyebrow: string; title: string; description: string; items: string[]; badges: string[] };
    ctaLabel: string;
    bg?: "default" | "muted";
  }[];
}

export function AgePageLayout({ data }: { data: AgePageData }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[72rem] px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="pb-16 pt-20 md:pb-20 md:pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <data.hero.eyebrowIcon className="h-3.5 w-3.5" />
              {data.hero.eyebrow}
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
              {data.hero.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{data.hero.subtitle}</p>
          </motion.div>
        </section>

        {data.sections.map((section, si) => (
          <div key={si}>
            <div className="mb-10 h-px bg-border" />

            <div className="pb-14 md:pb-18">
              <div className="mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{section.title}</span>
                <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{section.subtitle}</h2>
              </div>

              {section.type === "challenges" && section.challenges && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.challenges.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-gg-lg border border-border bg-card p-5 transition-shadow hover:shadow-soft"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-gg-sm bg-muted text-primary">
                          <item.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{item.challenge}</h3>
                      </div>
                      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                      <div className="flex items-start gap-2 border-t border-border pt-3">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-xs font-medium text-foreground/80">{item.solution}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {section.type === "routine" && section.routine && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.routine.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-gg-lg border border-border bg-card p-4 transition-shadow hover:shadow-soft"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{step.step}</div>
                        {step.frequency && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">{step.frequency}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{step.name}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                      <p className="mt-2 text-[11px] font-medium text-primary">{step.tips}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {section.type === "tips" && section.tips && (
                <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{section.tips.eyebrow}</span>
                    <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{section.tips.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{section.tips.description}</p>
                    <ul className="mt-6 space-y-3">
                      {section.tips.items.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-center gap-4">
                    <div className="flex flex-wrap gap-2">
                      {section.tips.badges.map((badge, i) => (
                        <span key={i} className="rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground">{badge}</span>
                      ))}
                    </div>
                    <Link href="/analysis" className="mt-2">
                      <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
                        {section.ctaLabel} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
