import { motion } from "framer-motion";
import {
  Shield,
  Droplets,
  Sun,
  Heart,
  Leaf,
  Star,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Layout from "@/components/layout/Layout";

const benefits = [
  {
    icon: Shield,
    title: "Strengthens Protective Barrier",
    description: "Skincare helps maintain and repair your skin's natural barrier, protecting against bacteria, pollution, and environmental stressors.",
  },
  {
    icon: Droplets,
    title: "Maintains Hydration",
    description: "Proper skincare keeps your skin hydrated, preventing dryness, flakiness, and premature aging while maintaining a healthy glow.",
  },
  {
    icon: Sun,
    title: "Protects Against Sun Damage",
    description: "Daily sunscreen use prevents harmful UV rays from causing dark spots, wrinkles, and increasing skin cancer risk.",
  },
  {
    icon: Heart,
    title: "Boosts Self-Confidence",
    description: "Clear, healthy skin improves how you feel about yourself, boosting confidence in social and professional situations.",
  },
  {
    icon: Leaf,
    title: "Prevents Skin Problems",
    description: "Consistent care helps prevent and manage acne, dryness, sensitivity, and other common skin concerns.",
  },
  {
    icon: Star,
    title: "Improves Overall Appearance",
    description: "Regular skincare results in smoother texture, even tone, and a natural radiance that enhances your appearance.",
  },
];

const detailedBenefits = [
  {
    category: "Health Benefits",
    items: [
      "Removes dirt and bacteria that can cause infections",
      "Prevents clogged pores and breakouts",
      "Supports healthy cell renewal and repair",
      "Reduces inflammation and irritation",
      "Helps skin function as an effective protective barrier",
    ],
  },
  {
    category: "Appearance Benefits",
    items: [
      "Keeps skin smooth, soft, and supple",
      "Evens out skin tone and reduces dark spots",
      "Minimizes the appearance of fine lines and wrinkles",
      "Provides a natural, healthy glow",
      "Reduces redness and blotchiness",
    ],
  },
  {
    category: "Prevention Benefits",
    items: [
      "Protects against premature aging from sun exposure",
      "Prevents dryness, roughness, and flaking",
      "Reduces risk of skin conditions like eczema flare-ups",
      "Helps avoid irritation from environmental factors",
      "Minimizes long-term damage from pollutants",
    ],
  },
];

const skincareBasics = [
  {
    step: 1,
    title: "Cleansing",
    description: "Washing your face to remove dirt, oil, makeup, and impurities. Do this morning and night.",
    tip: "Use lukewarm water and a cleanser suited to your skin type.",
  },
  {
    step: 2,
    title: "Toning",
    description: "Balancing your skin's pH and preparing it to absorb other products. Optional but beneficial.",
    tip: "Pat gently onto skin, don't rub.",
  },
  {
    step: 3,
    title: "Treating",
    description: "Applying serums or treatments for specific concerns like acne, dark spots, or wrinkles.",
    tip: "Apply thinner products before thicker ones.",
  },
  {
    step: 4,
    title: "Moisturizing",
    description: "Hydrating and sealing in moisture to keep skin soft and prevent water loss.",
    tip: "Everyone needs moisturizer, even oily skin types.",
  },
  {
    step: 5,
    title: "Protecting",
    description: "Applying sunscreen (SPF 30+) every morning to shield skin from UV damage.",
    tip: "Reapply every 2 hours when outdoors.",
  },
];

const faqs = [
  {
    question: "Why is skincare important?",
    answer: "Skincare is essential because your skin is your body's largest organ and first line of defense against the environment. A good routine keeps it healthy, prevents problems like acne and premature aging, and helps you look and feel your best.",
  },
  {
    question: "When should I start a skincare routine?",
    answer: "It's never too early or too late! Basic skincare (cleansing, moisturizing, sun protection) can start in childhood. As you age, you can add treatments for specific concerns. The best time to start is now.",
  },
  {
    question: "How long until I see results?",
    answer: "Basic improvements (hydration, comfort) can be seen within days. Significant changes (acne reduction, fading dark spots) typically take 4-6 weeks as skin cells renew. Anti-aging results may take 2-3 months. Consistency is key!",
  },
  {
    question: "Do I need expensive products?",
    answer: "No! Effective skincare doesn't have to be expensive. Focus on finding the right ingredients for your skin type rather than brand names. Simple routines with quality basics often work better than complex expensive regimens.",
  },
  {
    question: "What's the minimum routine I need?",
    answer: "The absolute basics are: 1) Cleanser (morning and night), 2) Moisturizer, and 3) Sunscreen (morning). This simple 3-step routine covers the fundamentals of clean, hydrated, protected skin.",
  },
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

const AboutSkincare = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Info className="h-4 w-4" />
              Education
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              What is <span className="text-gradient">Skincare</span>?
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Skincare is the practice of taking care of your skin to keep it healthy, clean, and protected. 
              It involves using products and following habits that help maintain the skin's natural balance, 
              such as cleansing to remove dirt and oil, moisturizing to prevent dryness, and protecting 
              the skin from sun damage with sunscreen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Why Skincare Matters
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your skin does more than just look good—it's your body's protective shield. 
              Caring for it properly has benefits that go beyond appearance.
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
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                      <benefit.icon className="h-7 w-7 text-primary-foreground" />
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

      {/* Detailed Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-bold mb-4">Benefits Breakdown</h2>
            <p className="text-muted-foreground">A deeper look at how skincare improves your life</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {detailedBenefits.map((category, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-0 shadow-card h-full">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-semibold mb-4 text-gradient">
                      {category.category}
                    </h3>
                    <ul className="space-y-3">
                      {category.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Basic Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              The Basic Steps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete skincare routine doesn't have to be complicated. Here are the fundamental steps.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {skincareBasics.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative pl-16 pb-12 last:pb-0"
              >
                {/* Connector line */}
                {index < skincareBasics.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Step number */}
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-soft">
                  <span className="text-primary-foreground font-bold">{step.step}</span>
                </div>

                <Card className="border-0 shadow-card hover-lift">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground mb-3">{step.description}</p>
                    <div className="flex items-start gap-2 text-sm bg-primary/5 rounded-lg p-3">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Tip:</strong> {step.tip}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold mb-4">Common Questions</h2>
              <p className="text-muted-foreground">Answers to frequently asked skincare questions</p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border rounded-xl px-6 shadow-soft"
                >
                  <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center rounded-3xl gradient-primary p-8 md:p-12 shadow-card relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                Take our skin type quiz to get personalized recommendations for your unique skin.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/quiz">
                  <Button size="lg" variant="secondary" className="shadow-soft">
                    Take the Skin Quiz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/skin-types">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                    Explore Skin Types
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutSkincare;
