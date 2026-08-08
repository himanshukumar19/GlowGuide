'use client';

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import {
  Sparkles,
  Shield,
  Droplets,
  Sun,
  Heart,
  Leaf,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllSkinTypes } from "@/data/skinTypes";
const heroBg = "/images/hero-background.png";
const skinOily = "/images/skin-oily.png";
const skinDry = "/images/skin-dry.png";
const skinCombination = "/images/skin-combination.png";
const skinSensitive = "/images/skin-sensitive.png";
const skinNormal = "/images/skin-normal.png";
const skincareProducts = "/images/skincare-products.png";
const skincareLifestyle = "/images/skincare-lifestyle.png";
const skinAnalysisTech = "/images/skin-analysis-tech.png";

const benefits = [
  {
    icon: Shield,
    title: "Protect Your Skin",
    description: "Shield your skin from sun damage, pollution, and environmental stressors.",
  },
  {
    icon: Droplets,
    title: "Stay Hydrated",
    description: "Maintain optimal moisture levels for soft, supple, and healthy skin.",
  },
  {
    icon: Sun,
    title: "Prevent Aging",
    description: "Reduce fine lines, wrinkles, and age spots with proper daily care.",
  },
  {
    icon: Heart,
    title: "Boost Confidence",
    description: "Feel great in your own skin with a clear, glowing complexion.",
  },
  {
    icon: Leaf,
    title: "Natural Balance",
    description: "Maintain your skin's natural pH and barrier for optimal health.",
  },
  {
    icon: Star,
    title: "Radiant Glow",
    description: "Achieve that coveted healthy glow through consistent skincare.",
  },
];

const features = [
  {
    icon: Users,
    title: "For All Ages",
    description: "Tailored routines for children, teens, adults, and seniors.",
  },
  {
    icon: BookOpen,
    title: "Expert Education",
    description: "Learn from dermatologist-backed information and guides.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Quiz",
    description: "Discover your skin type with our interactive assessment.",
  },
];

const skinTypes = getAllSkinTypes();

const skinTypeImages: Record<string, string> = {
  oily: skinOily,
  dry: skinDry,
  combination: skinCombination,
  sensitive: skinSensitive,
  normal: skinNormal,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.08, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" as const },
  },
};

const headingWords = ["Read", "your", "skin.", "Build", "your", "glow."];

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const staggerWords = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const Index = () => {

  return (
    <MotionConfig reducedMotion="user">
      <>
    {/* Hero Section */}
      <section className="relative min-h-screen py-24 lg:py-0 flex items-center overflow-hidden bg-background">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-primary/[0.03] animate-gradient-shift" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            {/* Left: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Heading — staggered word reveal */}
              <motion.h1
                className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.02] tracking-[-0.04em] max-w-xl"
                variants={staggerWords}
                initial="hidden"
                animate="visible"
              >
                {headingWords.map((word, i) => (
                  <motion.span
                    key={i}
                    className={`inline-block mr-[0.3em] last:mr-0 ${i >= 3 ? "text-[#36594a]" : ""}`}
                    variants={wordVariants}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Expert skincare education for every skin type, age, and concern. 
                Build personalized routines backed by science.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <Link href="/analysis">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary rounded-gg-sm transition-all text-base px-8 border-0 w-full sm:w-auto group cursor-pointer">
                      Start Skin Analysis
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/about">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-base px-8 backdrop-blur-sm w-full sm:w-auto cursor-pointer">
                      Learn About Skincare
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Trust indicator */}
              <motion.div
                className="flex items-center gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-success/30 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    >
                      {String.fromCharCode(65 + i)}
                    </motion.div>
                  ))}
                  <motion.div
                    className="w-9 h-9 rounded-full bg-primary border-2 border-background flex items-center justify-center text-xs text-primary-foreground font-bold"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    +
                  </motion.div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Trusted by 10K+ Customers</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, color: "#D1D5DB" }}
                        animate={{ scale: 1, color: "#FBBF24" }}
                        transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Star className="h-3 w-3 fill-current text-amber-400" />
                      </motion.div>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1.5">4.9/5</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Hero Image */}
            <motion.div
              className="flex-1 w-full max-w-xl lg:max-w-none relative"
               initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {/* Existing animated skincare accents */}
              <motion.div
                className="hidden sm:flex absolute -top-8 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 border-2 border-background items-center justify-center shadow-elevated z-10"
                animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                <Sun className="h-4 w-4 text-white" />
              </motion.div>

              <motion.div
                className="hidden sm:flex absolute bottom-12 -right-6 w-9 h-9 rounded-full bg-gradient-to-br from-sky-300 to-sky-400 border-2 border-background items-center justify-center shadow-elevated z-10"
                animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                <Droplets className="h-3.5 w-3.5 text-white" />
              </motion.div>

              <motion.div
                className="hidden sm:flex absolute -bottom-6 right-16 w-8 h-8 rounded-full bg-gradient-to-br from-violet-300 to-violet-400 border-2 border-background items-center justify-center shadow-elevated z-10"
                animate={{ y: [0, -7, 0], rotate: [0, 6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Shield className="h-3 w-3 text-white" />
              </motion.div>

              <motion.div
                className="hidden sm:flex absolute top-1/4 -left-5 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-400 border-2 border-background items-center justify-center shadow-elevated z-10"
                animate={{ y: [0, -9, 0], rotate: [0, -7, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Leaf className="h-2.5 w-2.5 text-white" />
              </motion.div>

              {/* Product-specific diagnostic signature */}
              <motion.div
                className="absolute -top-4 -right-2 lg:-top-6 lg:-right-6 z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary shadow-card backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                  </span>
                  Live skin map
                </div>
              </motion.div>

              <motion.div
                className="relative"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Pulsing glow behind image (sized responsively to prevent horizontal scroll) */}
                <motion.div
                  className="absolute -inset-6 lg:-inset-12 bg-gradient-to-tr from-primary/20 via-success/20 to-transparent rounded-[5rem] blur-3xl"
                  animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Gradient border/frame */}
                <div className="absolute -inset-[3px] rounded-[1.3rem] bg-gradient-to-br from-primary/40 via-success/30 to-primary/10" />
                
                {/* Image container */}
                <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src={heroBg}
                    alt="Glowing healthy skin"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute inset-4 rounded-xl border border-white/40" />
                    <div className="absolute left-4 right-4 top-1/2 h-px bg-secondary/90 shadow-[0_0_18px_rgba(133,68,56,0.9)] animate-scan-line" />
                    <div className="absolute left-7 top-7 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white drop-shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(197,138,127,1)]" />
                      Facial analysis ready
                    </div>
                    <div className="absolute bottom-7 right-7 rounded-md bg-foreground/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                      6-angle capture
                    </div>
                  </div>
                </div>

                {/* Floating stat badge - scaled and positioned cleanly on mobile */}
                <motion.div
                  className="absolute bottom-2 left-2 lg:-bottom-3 lg:-left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-elevated px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2 lg:gap-3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-bold text-foreground leading-tight">94%</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap leading-none mt-0.5">Satisfaction Rate</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Hero bottom separator */}
      <div className="relative h-16 -mt-16 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full">
          <path d="M0 64H1440V32C1440 32 1200 0 720 32C240 64 0 32 0 32V64Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Features Section */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              A clearer way to care for your skin.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Start with what your skin is telling you, then turn that insight into care you can actually follow.
            </p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}>
                <Card className="border-0 shadow-card gradient-card h-full">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </motion.div>
                    <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What is Skincare Section */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              What is Skincare?
            </h2>
            <p className="text-muted-foreground text-lg">
              Skincare is the practice of taking care of your skin to keep it healthy, clean, and protected. 
              It involves using products and following habits that help maintain the skin's natural balance.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 items-start">
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="rounded-2xl overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-hover">
                <img
                  src={skincareProducts}
                  alt="GlowGuide Skincare Products"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
                />
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-3 grid sm:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.slice(0, 4).map((benefit, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -6, borderColor: "hsl(var(--success))", boxShadow: "0 16px 40px rgba(45,106,79,0.12)" }}>
                  <Card className="border border-border/50 shadow-soft h-full transition-colors">
                    <CardContent className="p-5">
                      <motion.div
                        className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
                        whileHover={{ scale: 1.15, rotate: -8 }}
                      >
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </motion.div>
                      <h3 className="font-heading font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skin Types Preview */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E2DC] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#355245] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Start Here
            </span>
            <h2 className="font-heading text-3xl font-bold text-[#262626] md:text-4xl">
              Know Your Skin Type
            </h2>
            <p className="mt-3 max-w-2xl text-[#737373]">
              Understanding your skin type is the first step to building an effective skincare routine.
              Explore our comprehensive guides for each type.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4 md:grid-cols-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {skinTypes.map((skin, index) => {
              const Icon = skin.icon;
              return (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -6 }}>
                  <Link href={`/skin-types/${skin.slug}`}>
                    <Card className="group cursor-pointer overflow-hidden border-0 shadow-card transition-all duration-300 hover:shadow-lg">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={skinTypeImages[skin.slug]}
                          alt={skin.type}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top badge */}
                        <div className="absolute left-3 top-3">
                          <div
                            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
                            style={{ backgroundColor: skin.tokens.accent }}
                          >
                            <Icon className="h-3 w-3" strokeWidth={2} />
                            {skin.type}
                          </div>
                        </div>

                        {/* Bottom label */}
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <p className="text-sm font-medium text-white/90">
                            {skin.tagline}
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-white/80 transition-colors group-hover:text-white">
                            <span>Explore</span>
                            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/skin-types">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-[#355245] text-[#355245] transition-all duration-300 hover:bg-[#355245] hover:text-white"
              >
                Explore All Skin Types
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quiz CTA Section */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 shadow-card relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/[0.06] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/[0.04] translate-y-1/2 -translate-x-1/3" />

            {/* Left: Tech Mockup */}
            <motion.div
              className="relative z-10 order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="rounded-2xl overflow-hidden shadow-elevated border border-white/10 transition-shadow duration-300 hover:shadow-hover">
                <img
                  src={skinAnalysisTech}
                  alt="Skin Analysis App"
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
                />
              </div>
            </motion.div>

            {/* Right: CTA Content */}
            <motion.div
              className="relative z-10 order-1 lg:order-2 text-center lg:text-left"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="mb-6 w-fit mx-auto lg:mx-0"
              >
                <Sparkles className="h-10 w-10 text-primary-foreground/80" />
              </motion.div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Discover Your Skin Type
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-md">
                Take our quick 5-question quiz to identify your skin type and get personalized 
                routine recommendations tailored just for you.
              </p>
              <motion.div
                className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.45 }}
              >
                {["Quick & Easy", "Personalized Results", "Expert Recommendations"].map((item, i) => (
                  <motion.span key={i} variants={itemVariants} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {item}
                  </motion.span>
                ))}
              </motion.div>
              <Link href="/analysis">
                <motion.div
                  className="relative inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button size="lg" className="bg-white hover:bg-white/90 text-primary active:scale-95 text-base px-8 rounded-gg-sm border-0 shadow-primary relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      Start the Quiz Now
                      <ArrowRight className="h-5 w-5" />
                    </span>
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1 }}
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      }}
                    />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Skincare Matters */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Why Skincare Matters
              </h2>
              <p className="text-muted-foreground mb-6">
                Your skin is your body's largest organ and first line of defense. 
                A consistent skincare routine does more than just improve appearance—it 
                supports your overall health and wellbeing.
              </p>
              <motion.ul className="space-y-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                {[
                  "Protects against environmental damage and pollutants",
                  "Prevents premature aging and maintains elasticity",
                  "Boosts self-confidence and mental wellbeing",
                  "Addresses specific concerns like acne, dryness, and sensitivity",
                  "Supports skin's natural healing and renewal process",
                ].map((item, i) => (
                  <motion.li key={i} className="flex items-start gap-3" variants={itemVariants}>
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <Link href="/about" className="inline-block mt-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.div
                className="rounded-2xl overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-hover"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <img
                  src={skincareLifestyle}
                  alt="Skincare routine"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      </>
    </MotionConfig>
  );
};

export default Index;
