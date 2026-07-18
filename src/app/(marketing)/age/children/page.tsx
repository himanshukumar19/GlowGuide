"use client";

import { Baby, Shield, Droplets, Sun, Heart } from "lucide-react";
import { AgePageLayout, type AgePageData } from "@/components/marketing/AgePageLayout";

const data: AgePageData = {
  hero: {
    eyebrow: "Children's Skincare",
    eyebrowIcon: Baby,
    title: <>Skincare for <span className="text-primary">Children</span></>,
    subtitle: "Gentle care for delicate skin. Learn how to protect and nurture your child's skin from infancy through pre-teen years.",
  },
  sections: [
    {
      title: "Skin Facts",
      subtitle: "How children's skin differs from adults",
      type: "challenges",
      challenges: [
        { challenge: "Thinner Skin", description: "Children's skin is 20–30% thinner, making it more sensitive and susceptible to irritation.", icon: Shield, solution: "Use fragrance-free, hypoallergenic products." },
        { challenge: "Higher Water Content", description: "More hydrated naturally, but loses moisture faster. Gentle moisturizers help maintain balance.", icon: Droplets, solution: "Apply moisturizer immediately after bathing." },
        { challenge: "Less Melanin", description: "Less natural sun protection means children need extra UV defense.", icon: Sun, solution: "Mineral sunscreen (SPF 30+) daily, protective clothing." },
        { challenge: "Delicate Barrier", description: "The skin barrier is still developing. Gentle products are essential.", icon: Heart, solution: "Short lukewarm baths. Avoid harsh soaps." },
      ],
      ctaLabel: "Get personalized recommendations",
    },
    {
      title: "Age-Based Routines",
      subtitle: "Skincare guidance for every stage of childhood",
      type: "routine",
      routine: [
        { step: 1, name: "Infants (0–2)", frequency: "Gentle basics", description: "Lukewarm baths, fragrance-free products, moisturizer after bath, mineral sunscreen (6+ months).", tips: "Common concerns: diaper rash, cradle cap, eczema, dry patches." },
        { step: 2, name: "Toddlers (3–5)", frequency: "Daily care", description: "Gentle cleanser, daily moisturizer, SPF 30+ for outdoor play. Keep baths short.", tips: "Common concerns: eczema flare-ups, sunburn, dry skin, minor rashes." },
        { step: 3, name: "Young Children (6–9)", frequency: "Building habits", description: "Simple cleanser, lightweight moisturizer, sunscreen before school. Teach face hygiene.", tips: "Common concerns: sun exposure, dry patches, chapped lips." },
        { step: 4, name: "Pre-Teens (10–12)", frequency: "Early routine", description: "Simple 2-step (cleanse + moisturize), oil-free sunscreen, gentle exfoliation if needed.", tips: "Common concerns: early acne, oily T-zone, blackheads, sun damage." },
      ],
      ctaLabel: "Get personalized recommendations",
    },
    {
      title: "Essential Tips",
      subtitle: "Protecting young skin",
      type: "tips",
      tips: {
        eyebrow: "Essential Tips",
        title: "Protecting Young Skin",
        description: "Simple habits that make a big difference for children's skin health.",
        items: [
          "Always use sunscreen with SPF 30+ outdoors",
          "Choose fragrance-free, hypoallergenic products",
          "Keep baths short (10–15 minutes) and lukewarm",
          "Apply moisturizer immediately after bathing",
          "Dress in soft, breathable fabrics like cotton",
          "Teach gentle skincare habits early",
        ],
        badges: ["SPF 30+ daily", "Fragrance-free only", "Short lukewarm baths", "Moisturize after bathing"],
      },
      ctaLabel: "Get personalized recommendations",
    },
  ],
};

const ChildrenPage = () => <AgePageLayout data={data} />;
export default ChildrenPage;
