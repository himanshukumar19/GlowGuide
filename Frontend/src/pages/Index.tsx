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
import { useTheme } from "@/store/useThemeStore";
import heroPink from "@/assets/hero-pink.jpg";
import heroTeal from "@/assets/hero-teal.jpg";

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
  { type: "Oily", emoji: "💧", color: "from-blue-100 to-blue-200" },
  { type: "Dry", emoji: "🏜️", color: "from-amber-100 to-amber-200" },
  { type: "Combination", emoji: "⚖️", color: "from-green-100 to-green-200" },
  { type: "Sensitive", emoji: "🌸", color: "from-pink-100 to-pink-200" },
  { type: "Normal", emoji: "✨", color: "from-purple-100 to-purple-200" },
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
  const { theme } = useTheme();
  const heroImage = theme === "pink" ? heroPink : heroTeal;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
        {/* Multi-layer background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
          
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          {/* Hero image overlay */}
          <motion.img
            key={theme}
            src={heroImage}
            alt=""
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          {/* Animated wavy decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Wave layer 1 - deep */}
            <motion.svg 
              viewBox="0 0 1440 800" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <path d="M0 300C240 200 480 400 720 300C960 200 1200 400 1440 300V0H0V300Z" fill="url(#heroWave1)" fillOpacity="0.2" />
              <path d="M0 450C240 350 480 550 720 450C960 350 1200 550 1440 450V0H0V450Z" fill="url(#heroWave2)" fillOpacity="0.12" />
              <path d="M0 600C240 500 480 700 720 600C960 500 1200 700 1440 600V0H0V600Z" fill="url(#heroWave3)" fillOpacity="0.06" />
              <defs>
                <linearGradient id="heroWave1" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#355245" />
                  <stop offset="0.5" stopColor="#75BFA2" />
                  <stop offset="1" stopColor="#355245" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="heroWave2" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#75BFA2" stopOpacity="0.8" />
                  <stop offset="0.5" stopColor="#355245" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#9BD9BF" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="heroWave3" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9BD9BF" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#75BFA2" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>
          
          {/* Radial glow behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          
          {/* Soft gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-8 shadow-soft border border-primary/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Your Complete Skincare Guide
              </span>
            </motion.div>

            <motion.h1
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Discover Your Path to{" "}
              <span className="text-gradient">Healthy, Glowing Skin</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Expert skincare education for every skin type, age, and concern. 
              Build personalized routines backed by science and dermatologist insights.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link to="/analysis">
                <Button size="lg" className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground shadow-primary rounded-gg-sm transition-all text-base px-8 border-0">
                  Start Skin Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-base px-8 backdrop-blur-sm">
                  Learn About Skincare
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating decorative elements */}
      </section>

      {/* Hero bottom separator */}
      <div className="relative h-24 -mt-24 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full">
          <path d="M0 96H1440V48C1440 48 1200 0 720 48C240 96 0 48 0 48V96Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
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
            className="max-w-3xl mx-auto text-center mb-16"
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

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border border-border/50 shadow-soft hover-lift h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
                    <CardContent className={`p-6 text-center bg-gradient-to-br ${skin.color} group-hover:scale-105 transition-transform`}>
                      <span className="text-4xl mb-3 block">{skin.emoji}</span>
                      <h3 className="font-heading font-semibold text-foreground">{skin.type}</h3>
                    </CardContent>
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
          <motion.div
            className="max-w-4xl mx-auto rounded-3xl gradient-primary p-8 md:p-12 shadow-card relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-6 text-primary-foreground" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Discover Your Skin Type
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                Take our quick 5-question quiz to identify your skin type and get personalized 
                routine recommendations tailored just for you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {["Quick & Easy", "Personalized Results", "Expert Recommendations"].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {item}
                  </span>
                ))}
              </div>
              <Link to="/analysis">
                <Button size="lg" className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground text-base px-8 shadow-primary rounded-gg-sm border-0">
                  Start the Quiz Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
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
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                { num: "5+", label: "Skin Types Covered" },
                { num: "4", label: "Age Groups" },
                { num: "10+", label: "Step Routines" },
                { num: "50+", label: "Skincare Tips" },
              ].map((stat, i) => (
                <Card key={i} className="border-0 shadow-card">
                  <CardContent className="p-6 text-center">
                    <span className="font-heading text-4xl font-bold text-gradient">{stat.num}</span>
                    <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
