'use client';

import { motion } from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Sun,
  Shield,
  Moon,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const routineSteps = {
  morning: [
    { name: "Cleanser", why: "Remove overnight oil buildup", time: "1 min" },
    { name: "Toner", why: "Balance pH and prep for absorption", time: "30 sec" },
    { name: "Serum", why: "Deliver active ingredients deep into skin", time: "1 min" },
    { name: "Moisturizer", why: "Lock in hydration for the day ahead", time: "1 min" },
    { name: "Sunscreen", why: "Shield against UV damage — non-negotiable", time: "1 min" },
  ],
  evening: [
    { name: "Cleanser", why: "Remove makeup, sunscreen, and pollution", time: "2 min" },
    { name: "Exfoliant", why: "Clear dead cells (2-3x per week only)", time: "1 min" },
    { name: "Serum", why: "Repair-focused actives like retinol or niacinamide", time: "1 min" },
    { name: "Eye cream", why: "The thinnest skin on your face needs extra care", time: "30 sec" },
    { name: "Night cream", why: "Richer moisture to support overnight repair", time: "1 min" },
  ],
};

const faqs = [
  {
    question: "Why is skincare important?",
    answer: "Your skin is your body's largest organ and first line of defense against pollution, bacteria, and UV radiation. A consistent routine keeps the barrier strong, prevents common concerns like acne and premature aging, and helps you look and feel your best.",
  },
  {
    question: "When should I start a skincare routine?",
    answer: "It's never too early or too late. Basic cleansing, moisturizing, and sun protection can start in your teens. As you age, targeted treatments address specific concerns. The best time to start is today.",
  },
  {
    question: "How long until I see results?",
    answer: "Hydration and comfort improve within days. Acne reduction and dark spot fading typically take 4-6 weeks as your skin cells renew. Anti-aging results may take 2-3 months. Consistency is everything.",
  },
  {
    question: "Do I need expensive products?",
    answer: "No. Effective skincare is about the right ingredients for your skin type, not brand names. A simple routine with quality basics often outperforms complex, expensive regimens.",
  },
  {
    question: "What's the minimum routine I need?",
    answer: "Three steps: Cleanser (morning and night), Moisturizer, and Sunscreen (morning). This covers the fundamentals — clean, hydrated, protected skin.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const AboutSkincare = () => {
  return (
    <>
      {/* Hero — editorial split */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#e8efeb]" />
        <div className="relative container mx-auto px-4 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left — text */}
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p
                className="text-sm uppercase tracking-[0.25em] text-primary font-medium mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                The GlowGuide Edit
              </motion.p>

              <motion.h1
                className="font-heading text-5xl md:text-7xl lg:text-[5rem] font-bold leading-[0.95] tracking-tight mb-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Your skin is
                <br />
                talking.{" "}
                 <span className="text-primary">Are you</span>
                <br />
                 <span className="text-primary">listening</span>?
              </motion.h1>

              <motion.div
                className="max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Skincare isn&apos;t vanity. It&apos;s the daily practice of understanding what your skin
                  needs and responding with intention. The right routine doesn&apos;t just change how you
                  look — it changes how your skin functions.
                </p>
              </motion.div>
            </motion.div>

            {/* Right — hero image */}
            <motion.div
              className="block md:col-span-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl md:aspect-[3/4]">
                <img
                  src="/images/about/hero-skin.jpg"
                  alt="Close-up of healthy, glowing skin in natural light"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The science — pull quote */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
            <motion.div
              className="md:col-span-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={0}
            >
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-medium mb-4">
                The foundation
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-6">
                Skin is your body&apos;s largest organ.
                <br />Most people treat it like an afterthought.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your skin weighs about 3.6 kg and spans roughly 1.7 square meters. It regulates
                temperature, synthesizes vitamin D, and acts as the first barrier against infection.
                When it works well, you don&apos;t notice it. When it doesn&apos;t, everything feels off.
              </p>
            </motion.div>

            <motion.div
              className="md:col-span-7"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: "1.7m²", label: "Total skin area — roughly the size of a single bed sheet", accent: "from-primary/20 to-primary/5" },
                  { number: "3.6kg", label: "Average weight — heavier than most laptops", accent: "from-secondary/20 to-secondary/5" },
                  { number: "300M", label: "Skin cells in your body, replacing themselves every 2-3 weeks", accent: "from-emerald-500/20 to-emerald-500/5" },
                  { number: "500+", label: "Sweat glands per square centimeter working to cool you down", accent: "from-amber-500/20 to-amber-500/5" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="group relative p-5 md:p-6 rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden"
                    variants={fadeUp}
                    custom={i + 1}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative">
                       <p className="font-heading text-4xl md:text-5xl font-bold text-primary mb-3 tracking-tight">
                        {stat.number}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Texture break */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img
          src="/images/about/ingredient-texture.jpg"
          alt="Natural skincare ingredients — aloe vera gel texture in soft light"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/40" />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <div className="text-center px-8">
            <p className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-foreground/90 leading-tight max-w-3xl drop-shadow-sm">
              Your skin does the work. <br className="hidden md:block" />
              <span className="text-gradient">Skincare just gives it the tools.</span>
            </p>
          </div>
        </motion.div>
      </section>

      {/* Why it matters — editorial list */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-medium mb-4">
              Beyond the mirror
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-6">
              Why skincare matters
            </h2>
            <p className="text-muted-foreground text-lg">
              Caring for your skin isn&apos;t about looking younger. It&apos;s about keeping your body&apos;s
              largest organ functioning at its best — today and decades from now.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-5">
            {[
              {
                icon: Shield,
                title: "Strengthens your protective barrier",
                desc: "A healthy skin barrier keeps bacteria, pollution, and irritants out while locking moisture in. When it's compromised, everything from breakouts to sensitivity gets worse.",
                    border: "border-primary/20",
              },
              {
                icon: Droplets,
                title: "Maintains hydration from within",
                desc: "Dehydrated skin doesn't just feel tight — it's more prone to fine lines, dullness, and irritation. Proper skincare helps your skin hold onto the water it needs.",
                    border: "border-sky-500/20",
              },
              {
                icon: Sun,
                title: "Prevents cumulative sun damage",
                desc: "UV damage is the #1 cause of premature aging. Daily sunscreen prevents dark spots, wrinkles, and significantly reduces skin cancer risk. It's the single most impactful step.",
                    border: "border-amber-500/20",
              },
              {
                icon: Sparkles,
                title: "Supports natural cell renewal",
                desc: "Your skin replaces itself every 2-3 weeks. Consistent care — cleansing, exfoliating, nourishing — supports this cycle so fresh, healthy cells reach the surface faster.",
                    border: "border-emerald-500/20",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                 className={`group flex gap-5 rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover md:gap-8 md:p-8 ${item.border}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Routine — morning & evening */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-medium mb-4">
              Your daily ritual
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-6">
              Morning protect. Evening repair.
            </h2>
            <p className="text-muted-foreground text-lg">
              Your skin&apos;s needs shift with the clock. A good routine mirrors that rhythm —
              shielding during the day, restoring at night.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Morning */}
            <motion.div
              className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-soft group hover:shadow-hover transition-all duration-300"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={0}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="/images/about/morning-routin.png"
                  alt="Morning skincare products arranged in soft golden light"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="px-6 py-5 border-b border-border/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Sun className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">Morning</h3>
                  <p className="text-xs text-muted-foreground">Protect &amp; prep</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full">
                  ~5 min
                </span>
              </div>
              <div className="p-6 space-y-4">
                {routineSteps.morning.map((step, i) => (
                  <motion.div
                    key={step.name}
                    className="flex items-start gap-4 group/step"
                    variants={fadeUp}
                    custom={i + 1}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-soft group-hover/step:scale-110 group-hover/step:shadow-primary transition-all duration-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-sm group-hover/step:text-primary transition-colors duration-200">{step.name}</p>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{step.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.why}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Evening */}
            <motion.div
              className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-soft group hover:shadow-hover transition-all duration-300"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={1}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="/images/about/evening-routine.png"
                  alt="Rich cleansing balm texture in warm evening light"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="px-6 py-5 border-b border-border/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">Evening</h3>
                  <p className="text-xs text-muted-foreground">Cleanse &amp; repair</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full">
                  ~6 min
                </span>
              </div>
              <div className="p-6 space-y-4">
                {routineSteps.evening.map((step, i) => (
                  <motion.div
                    key={step.name}
                    className="flex items-start gap-4 group/step"
                    variants={fadeUp}
                    custom={i + 2}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-soft group-hover/step:scale-110 group-hover/step:shadow-primary transition-all duration-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-sm group-hover/step:text-primary transition-colors duration-200">{step.name}</p>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{step.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.why}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.p
            className="text-center text-sm text-muted-foreground mt-8 max-w-lg mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={4}
          >
            Not sure which products suit your skin? Our{" "}
            <Link href="/analysis" className="text-primary underline underline-offset-2 hover:text-primary-hover transition-colors">
              Skin Analysis
            </Link>{" "}
            identifies your skin type and recommends a personalized routine.
          </motion.p>
        </div>
      </section>

      {/* FAQ — image split */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border/60 shadow-card bg-card">
            {/* Left — image */}
            <motion.div
              className="relative min-h-[300px] md:min-h-0 group overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="/images/about/faq-hands.jpg"
                alt="Hands gently holding a skincare product in soft natural light"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/90 font-medium mb-1">
                  Common questions
                </p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-primary-foreground">
                  Things you might be wondering
                </h2>
              </div>
            </motion.div>

            {/* Right — accordion */}
            <motion.div
              className="p-6 md:p-8 lg:p-10 bg-primary/[0.04]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={0}
            >
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="bg-card border border-primary/15 rounded-xl px-5 shadow-soft"
                  >
                    <AccordionTrigger className="text-left font-heading font-semibold text-[15px] text-primary hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA — editorial close */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-secondary/5 blur-3xl" />
        {/* Decorative botanical accent */}
        <div className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.03]">
          <div className="w-full h-full rounded-full border-[3px] border-primary" />
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-[2px] border-primary" />
          <div className="absolute top-20 left-20 w-20 h-20 rounded-full bg-primary/10" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-medium mb-6">
              Your next step
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-6">
              Ready to understand <br className="hidden md:block" />
              <span className="text-primary">your skin?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Take our AI-powered skin analysis to get personalized recommendations
              tailored to your unique skin profile.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/analysis">
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground h-12 px-8 rounded-xl shadow-primary hover:shadow-lg transition-all duration-300 text-base gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Skin Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/skin-types">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                >
                  Explore Skin Types
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutSkincare;
