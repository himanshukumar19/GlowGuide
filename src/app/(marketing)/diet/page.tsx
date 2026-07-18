"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Apple, Droplets, CheckCircle, Leaf, Fish, AlertCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const skinFriendlyFoods = [
  { category: "Antioxidant-Rich", icon: Leaf, foods: [
    { name: "Blueberries", benefit: "Fight free radicals, prevent premature aging" },
    { name: "Dark Chocolate", benefit: "Flavonoids improve blood flow and hydration" },
    { name: "Green Tea", benefit: "Polyphenols protect against sun damage" },
    { name: "Spinach", benefit: "Vitamins A, C, E for skin repair" },
  ]},
  { category: "Healthy Fats", icon: Fish, foods: [
    { name: "Avocado", benefit: "Essential fatty acids for supple skin" },
    { name: "Salmon", benefit: "Omega-3s reduce inflammation" },
    { name: "Walnuts", benefit: "Zinc and omega-3 for skin barrier" },
    { name: "Olive Oil", benefit: "Monounsaturated fats for moisture" },
  ]},
  { category: "Hydrating", icon: Droplets, foods: [
    { name: "Cucumber", benefit: "96% water for deep hydration from within" },
    { name: "Watermelon", benefit: "Lycopene + hydration boost" },
    { name: "Oranges", benefit: "Vitamin C for collagen production" },
    { name: "Celery", benefit: "Vitamins and minerals for clear skin" },
  ]},
];

const vitamins = [
  { name: "Vitamin A", role: "Cell turnover and repair", sources: "Sweet potatoes, carrots, leafy greens", deficiency: "Dry, flaky skin" },
  { name: "Vitamin C", role: "Collagen synthesis and brightening", sources: "Citrus fruits, bell peppers, strawberries", deficiency: "Slow healing, dull skin" },
  { name: "Vitamin E", role: "Antioxidant protection", sources: "Almonds, sunflower seeds, avocado", deficiency: "Increased sun sensitivity" },
  { name: "Vitamin D", role: "Skin cell growth and repair", sources: "Fatty fish, fortified milk, sunlight", deficiency: "Dry, irritated skin" },
  { name: "Zinc", role: "Oil regulation and wound healing", sources: "Oysters, beef, pumpkin seeds", deficiency: "Acne, slow healing" },
  { name: "Omega-3", role: "Inflammation reduction", sources: "Salmon, walnuts, flaxseeds", deficiency: "Dry, inflamed skin" },
];

const foodsToLimit = [
  "Refined sugars — cause glycation and breakouts",
  "Dairy — may trigger acne in some people",
  "Processed foods — high in inflammatory oils",
  "Excessive alcohol — dehydrates skin",
  "High-glycemic foods — spike blood sugar",
  "Fried foods — increase oil production",
];

const DietPage = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-[72rem] px-4 sm:px-6 lg:px-8">
      {/* Hero — single bold statement, nutrition-as-care */}
      <section className="pb-16 pt-20 md:pb-20 md:pt-28">
        <motion.div
          className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Diet &amp; Nutrition</span>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
              Your skin eats{" "}
              <span className="text-primary">what you eat</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              No cream can outwork a bad diet. The right foods reduce inflammation,
              boost collagen, and give your skin the building blocks it needs to glow.
            </p>
            <Link href="/analysis" className="mt-6 inline-block">
              <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
                Take the skin analysis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Quick stats block — density in hero */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { stat: "64%", label: "Water content of human skin", icon: Droplets },
              { stat: "6", label: "Key nutrients your skin depends on", icon: Apple },
              { stat: "3", label: "Food categories that directly benefit skin", icon: Leaf },
              { stat: "6", label: "Common foods worth limiting", icon: AlertCircle },
            ].map((item, i) => (
              <div key={i} className="rounded-gg-lg border border-border/60 bg-card p-4 transition-shadow hover:shadow-soft">
                <item.icon className="mb-2 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                <p className="font-heading text-xl font-bold text-foreground">{item.stat}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* Food categories — three column, tighter cards */}
      <section className="pb-14 md:pb-18">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Food Groups</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">What to put on your plate</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {skinFriendlyFoods.map((category, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-gg-lg border border-border bg-card p-5 transition-shadow hover:shadow-soft"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-gg-sm bg-muted text-primary">
                  <category.icon className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{category.category}</h3>
              </div>
              <ul className="space-y-3">
                {category.foods.map((food, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{food.name}</span>
                      <p className="text-xs text-muted-foreground">{food.benefit}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* Vitamins + Foods to Limit — side by side */}
      <section className="pb-14 md:pb-18">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          {/* Vitamins */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Nutrients</span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Six nutrients your skin craves</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {vitamins.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-gg border border-border bg-card p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">{v.name}</h3>
                  <p className="mt-1 text-xs font-medium text-primary">{v.role}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                      <span className="text-xs text-muted-foreground">{v.sources}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                      <span className="text-xs text-destructive">{v.deficiency}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Foods to Limit + Pillars */}
          <div className="space-y-7">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">Watch out</span>
              <h3 className="mt-2 font-heading text-lg font-bold text-foreground">Foods to limit</h3>
              <p className="mt-1 text-xs text-muted-foreground">Some foods trigger inflammation. Be mindful — not elimination.</p>
              <ul className="mt-4 space-y-2.5">
                {foodsToLimit.map((food, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                    <span className="text-sm text-muted-foreground">{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Daily habits</span>
              <h3 className="mt-2 font-heading text-lg font-bold text-foreground">The four pillars</h3>
              <div className="mt-4 space-y-3">
                {[
                  { title: "Hydrate", desc: "8+ glasses of water daily. Skin is 64% water.", icon: Droplets },
                  { title: "Whole foods", desc: "Minimize processing. Fresh over packaged.", icon: Apple },
                  { title: "Plant-forward", desc: "Antioxidant-rich fruits and vegetables.", icon: Leaf },
                  { title: "Balance", desc: "No single food is magic. Consistency matters.", icon: Heart },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-gg border border-border bg-card p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-gg-sm bg-muted text-primary">
                      <item.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-10 h-px bg-border" />

      {/* CTA — clean, minimal, part of page flow */}
      <section className="pb-16 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="font-heading text-xl font-bold text-foreground">Want diet tips tailored to your skin type?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Our analysis recommends foods and nutrients based on your specific concerns.</p>
          <Link href="/analysis" className="mt-5 inline-block">
            <Button className="gap-2 rounded-full bg-primary px-6 py-5 text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover hover:shadow-primary">
              Take the skin analysis <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  </div>
);

export default DietPage;
