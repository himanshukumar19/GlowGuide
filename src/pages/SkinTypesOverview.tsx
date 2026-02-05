import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Sun,
  Moon,
  Droplets,
  Shield,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const skinTypes = [
  {
    type: "Oily",
    emoji: "💧",
    path: "/skin-types/oily",
    description: "Excess sebum production with shine and visible pores",
    characteristics: ["Shiny appearance", "Large pores", "Prone to acne"],
    color: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    type: "Dry",
    emoji: "🏜️",
    path: "/skin-types/dry",
    description: "Lacks moisture, may feel tight or flaky",
    characteristics: ["Tight feeling", "Flaky patches", "Dull complexion"],
    color: "from-amber-50 to-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    type: "Combination",
    emoji: "⚖️",
    path: "/skin-types/combination",
    description: "Oily T-zone with normal or dry cheeks",
    characteristics: ["Oily T-zone", "Dry cheeks", "Mixed concerns"],
    color: "from-green-50 to-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    type: "Sensitive",
    emoji: "🌸",
    path: "/skin-types/sensitive",
    description: "Reacts easily to products and environment",
    characteristics: ["Easily irritated", "Prone to redness", "Reactive"],
    color: "from-pink-50 to-pink-100",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    type: "Normal",
    emoji: "✨",
    path: "/skin-types/normal",
    description: "Well-balanced with minimal issues",
    characteristics: ["Balanced moisture", "Small pores", "Even texture"],
    color: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
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

const SkinTypesOverview = () => {
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
              <Droplets className="h-4 w-4" />
              Understanding Your Skin
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Know Your <span className="text-gradient">Skin Type</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Identifying your skin type is the foundation of an effective skincare routine. 
              Learn about each type and find the perfect products for your unique needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-card gradient-card">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">Not sure about your skin type?</h3>
                  <p className="text-muted-foreground text-sm">Take our quick quiz to find out!</p>
                </div>
              </div>
              <Link to="/quiz">
                <Button className="gradient-primary border-0 text-primary-foreground">
                  Take the Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skin Types Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {skinTypes.map((skin, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={skin.path}>
                  <Card className="border-0 shadow-card hover-lift h-full overflow-hidden group">
                    <CardContent className={`p-0`}>
                      <div className={`p-6 bg-gradient-to-br ${skin.color}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-4xl">{skin.emoji}</span>
                          <h2 className="font-heading text-2xl font-bold">{skin.type} Skin</h2>
                        </div>
                        <p className="text-muted-foreground mb-4">{skin.description}</p>
                        <ul className="space-y-2">
                          {skin.characteristics.map((char, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`h-4 w-4 ${skin.iconColor}`} />
                              <span>{char}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 flex items-center justify-between border-t border-border">
                        <span className="text-sm font-medium text-primary">Learn more</span>
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-bold mb-4">Quick Comparison</h2>
              <p className="text-muted-foreground">At-a-glance differences between skin types</p>
            </div>

            <Card className="border-0 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-heading font-semibold">Skin Type</th>
                      <th className="text-left p-4 font-heading font-semibold">Pore Size</th>
                      <th className="text-left p-4 font-heading font-semibold">Main Concern</th>
                      <th className="text-left p-4 font-heading font-semibold">Key Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">💧 Oily</td>
                      <td className="p-4 text-sm">Large, visible</td>
                      <td className="p-4 text-sm">Shine, acne</td>
                      <td className="p-4 text-sm">Oil-free, BHA</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="p-4 font-medium">🏜️ Dry</td>
                      <td className="p-4 text-sm">Very small</td>
                      <td className="p-4 text-sm">Flakiness, tightness</td>
                      <td className="p-4 text-sm">Rich creams, oils</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">⚖️ Combination</td>
                      <td className="p-4 text-sm">Varies by zone</td>
                      <td className="p-4 text-sm">Balance</td>
                      <td className="p-4 text-sm">Zone treatments</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="p-4 font-medium">🌸 Sensitive</td>
                      <td className="p-4 text-sm">Small</td>
                      <td className="p-4 text-sm">Irritation, redness</td>
                      <td className="p-4 text-sm">Gentle, fragrance-free</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">✨ Normal</td>
                      <td className="p-4 text-sm">Small, even</td>
                      <td className="p-4 text-sm">Maintenance</td>
                      <td className="p-4 text-sm">Balanced care</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* General Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-bold mb-6">
                Universal Skincare Tips
              </h2>
              <p className="text-muted-foreground mb-6">
                Regardless of your skin type, these fundamental practices will help 
                maintain healthy, glowing skin.
              </p>
              <ul className="space-y-4">
                {[
                  "Always wear SPF 30+ sunscreen daily",
                  "Stay hydrated - drink plenty of water",
                  "Remove makeup before bed",
                  "Be consistent with your routine",
                  "Patch test new products",
                  "Don't touch your face unnecessarily",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Sun className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">Morning</h3>
                  <p className="text-xs text-muted-foreground">Cleanse, treat, protect</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Moon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">Night</h3>
                  <p className="text-xs text-muted-foreground">Cleanse, repair, nourish</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">Protect</h3>
                  <p className="text-xs text-muted-foreground">SPF is non-negotiable</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-pink-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">Learn</h3>
                  <p className="text-xs text-muted-foreground">Know your ingredients</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SkinTypesOverview;
