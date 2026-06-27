import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import heroBg from "@/assets/hero-background.png";
import skinOily from "@/assets/skin-oily.png";
import skinDry from "@/assets/skin-dry.png";
import skinCombination from "@/assets/skin-combination.png";
import skinSensitive from "@/assets/skin-sensitive.png";
import skinNormal from "@/assets/skin-normal.png";
import skincareProducts from "@/assets/skincare-products.png";
import skincareLifestyle from "@/assets/skincare-lifestyle.png";
import skinAnalysisTech from "@/assets/skin-analysis-tech.png";

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

const skinTypes = [
  { type: "Oily", image: skinOily },
  { type: "Dry", image: skinDry },
  { type: "Combination", image: skinCombination },
  { type: "Sensitive", image: skinSensitive },
  { type: "Normal", image: skinNormal },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Index = () => {

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-primary/[0.03] animate-gradient-shift" />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        
        {/* Decorative floating botanical leaves */}
        <motion.div
          className="absolute top-24 left-[5%] text-primary/[0.07] pointer-events-none select-none"
          animate={{ y: [0, -14, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="h-16 w-16" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-[8%] text-primary/[0.05] pointer-events-none select-none"
          animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <Leaf className="h-12 w-12" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-[15%] text-primary/[0.04] pointer-events-none select-none"
          animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <Leaf className="h-8 w-8" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold shadow-soft border border-primary/10 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  Your Complete Skincare Guide
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mt-8 mb-6 leading-[1.08] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Discover Your Path to{" "}
                <span className="text-gradient">Healthy, Glowing Skin</span>
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/analysis">
                  <Button size="lg" className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground shadow-primary rounded-gg-sm transition-all text-base px-8 border-0 w-full sm:w-auto group">
                    Start Skin Analysis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-base px-8 backdrop-blur-sm w-full sm:w-auto">
                    Learn About Skincare
                  </Button>
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
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-success/30 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-primary border-2 border-background flex items-center justify-center text-xs text-primary-foreground font-bold">
                    +
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Trusted by 10K+ Customers</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1.5">4.9/5</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Hero Image */}
            <motion.div
              className="flex-1 w-full max-w-xl lg:max-w-none"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <div className="relative">
                {/* Pulsing glow behind image */}
                <motion.div
                  className="absolute -inset-12 bg-gradient-to-tr from-primary/20 via-success/20 to-transparent rounded-[5rem] blur-3xl"
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
                </div>

                {/* Floating stat badge */}
                <motion.div
                  className="absolute -bottom-3 -left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-elevated px-4 py-3 flex items-center gap-3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">94%</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Satisfaction Rate</p>
                  </div>
                </motion.div>
              </div>
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
          <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Hero bottom separator */}
      <div className="relative h-16 -mt-16 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full">
          <path d="M0 64H1440V32C1440 32 1200 0 720 32C240 64 0 32 0 32V64Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-0 shadow-card hover-lift gradient-card h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
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
      <section className="py-20">
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
            >
              <div className="rounded-2xl overflow-hidden shadow-card">
                <img
                  src={skincareProducts}
                  alt="GlowGuide Skincare Products"
                  className="w-full h-full object-cover"
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
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border border-border/50 shadow-soft hover-lift h-full">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Know Your Skin Type
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understanding your skin type is the first step to building an effective skincare routine. 
              Explore our comprehensive guides for each type.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {skinTypes.map((skin, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={`/skin-types/${skin.type.toLowerCase()}`}>
                  <Card className="border-0 shadow-card hover-lift cursor-pointer overflow-hidden group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={skin.image}
                        alt={skin.type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                        <h3 className="font-heading font-semibold text-white text-lg">{skin.type}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/skin-types">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Explore All Skin Types
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quiz CTA Section */}
      <section className="py-20">
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
            >
              <div className="rounded-2xl overflow-hidden shadow-elevated border border-white/10">
                <img
                  src={skinAnalysisTech}
                  alt="Skin Analysis App"
                  className="w-full h-auto object-cover"
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
              <Sparkles className="h-10 w-10 text-primary-foreground/80 mb-6 mx-auto lg:mx-0" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Discover Your Skin Type
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-md">
                Take our quick 5-question quiz to identify your skin type and get personalized 
                routine recommendations tailored just for you.
              </p>
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                {["Quick & Easy", "Personalized Results", "Expert Recommendations"].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {item}
                  </span>
                ))}
              </div>
              <Link to="/analysis">
                <Button size="lg" className="bg-white hover:bg-white/90 text-primary active:scale-95 text-base px-8 rounded-gg-sm border-0 shadow-primary">
                  Start the Quiz Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Skincare Matters */}
      <section className="py-20 bg-muted/30">
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
              <ul className="space-y-4">
                {[
                  "Protects against environmental damage and pollutants",
                  "Prevents premature aging and maintains elasticity",
                  "Boosts self-confidence and mental wellbeing",
                  "Addresses specific concerns like acne, dryness, and sensitivity",
                  "Supports skin's natural healing and renewal process",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="inline-block mt-8">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl overflow-hidden shadow-card">
                <img
                  src={skincareLifestyle}
                  alt="Skincare routine"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
