"use client";

import { Clock } from "lucide-react";
import { AgePageLayout, type AgePageData } from "@/components/marketing/AgePageLayout";

const data: AgePageData = {
  hero: {
    eyebrow: "Adult Skincare",
    eyebrowIcon: Clock,
    title: <>Skincare for <span className="text-primary">Adults</span></>,
    subtitle: "Age-appropriate skincare for every decade. Learn how to adapt your routine as your skin evolves through your 20s, 30s, 40s, and beyond.",
  },
  sections: [
    {
      title: "Skincare by Decade",
      subtitle: "Your skin's needs evolve — here's how to adapt",
      type: "routine",
      routine: [
        { step: 1, name: "20s — Prevention", frequency: "The foundation decade", description: "SPF 30+ daily, Vitamin C, Niacinamide, Hyaluronic Acid. Focus on prevention.", tips: "Establish a consistent routine. Prevention is easier than correction." },
        { step: 2, name: "30s — Early Anti-Aging", frequency: "Proactive care", description: "Add retinol gradually. Peptides, AHA/BHA, and antioxidants become essential.", tips: "Start retinol slowly. Consider professional treatments." },
        { step: 3, name: "40s — Active Anti-Aging", frequency: "Intensive care", description: "Retinoids, Vitamin C, Ceramides, Growth Factors. Focus on hydration and repair.", tips: "Prioritize barrier repair. Consult a dermatologist for stubborn concerns." },
        { step: 4, name: "50s+ — Mature Skin", frequency: "Gentle nourishment", description: "Rich moisturizers, Peptides, Antioxidants, Gentle retinoids. Prioritize comfort.", tips: "Gentle products over aggressive treatments. Hydration is everything." },
      ],
      ctaLabel: "Find your decade's routine",
    },
    {
      title: "Morning & Evening",
      subtitle: "The essential adult routine",
      type: "routine",
      routine: [
        { step: 1, name: "Gentle Cleanser", frequency: "AM", description: "Remove overnight buildup without stripping.", tips: "Look for pH-balanced formulas." },
        { step: 2, name: "Antioxidant Serum", frequency: "AM", description: "Protect from environmental damage all day.", tips: "Vitamin C is the gold standard." },
        { step: 3, name: "Moisturizer + SPF", frequency: "AM", description: "Hydrate and protect. SPF 30+ is non-negotiable.", tips: "Reapply sunscreen every 2 hours outdoors." },
        { step: 4, name: "Double Cleanse", frequency: "PM", description: "Oil cleanser removes makeup and sunscreen, followed by water cleanser.", tips: "The foundation of nighttime repair." },
        { step: 5, name: "Treatment Serum", frequency: "PM", description: "Address specific concerns: retinol for aging, niacinamide for texture.", tips: "Alternate actives on different nights." },
        { step: 6, name: "Night Cream", frequency: "PM", description: "Repair and nourish overnight while skin regenerates.", tips: "Apply to slightly damp skin for better absorption." },
      ],
      ctaLabel: "Find your decade's routine",
    },
    {
      title: "Pro Tips",
      subtitle: "Maximizing your routine",
      type: "tips",
      tips: {
        eyebrow: "Pro Tips",
        title: "Maximizing Your Routine",
        description: "Get the most out of your skincare investment with these expert habits.",
        items: [
          "Apply products to damp skin for better absorption",
          "Wait 60 seconds between layers for optimal penetration",
          "Use upward motions to prevent pulling skin down",
          "Don't forget your neck and décolletage",
          "Invest in quality basics over trendy products",
          "Be patient — results take 4–12 weeks",
        ],
        badges: ["Damp skin absorbs more", "Wait between layers", "Don't forget your neck", "Results take 4–12 weeks"],
      },
      ctaLabel: "Find your decade's routine",
    },
  ],
};

const AdultsPage = () => <AgePageLayout data={data} />;
export default AdultsPage;
