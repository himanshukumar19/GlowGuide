"use client";

import { Zap, Droplets, Sun, Shield } from "lucide-react";
import { AgePageLayout, type AgePageData } from "@/components/marketing/AgePageLayout";

const data: AgePageData = {
  hero: {
    eyebrow: "Teen Skincare",
    eyebrowIcon: Zap,
    title: <>Skincare for <span className="text-primary">Teens</span></>,
    subtitle: "Navigate puberty skin changes with confidence. Learn effective routines to manage acne, oily skin, and build healthy habits for life.",
  },
  sections: [
    {
      title: "Common Challenges",
      subtitle: "Understanding puberty's effect on your skin",
      type: "challenges",
      challenges: [
        { challenge: "Hormonal Acne", description: "Puberty triggers increased sebum production, leading to breakouts.", icon: Zap, solution: "Use salicylic acid or benzoyl peroxide. Don't pick or pop pimples." },
        { challenge: "Oily Skin", description: "Hormonal changes increase oil production, especially in the T-zone.", icon: Droplets, solution: "Gel-based moisturizers and oil-free sunscreen." },
        { challenge: "Blackheads & Whiteheads", description: "Clogged pores are common. Regular gentle exfoliation prevents buildup.", icon: Shield, solution: "BHA exfoliants 2–3× weekly. Don't squeeze." },
        { challenge: "Sun Sensitivity", description: "Teens spend more time outdoors. Early sun protection prevents long-term damage.", icon: Sun, solution: "SPF 30+ daily, reapply every 2 hours outdoors." },
      ],
      ctaLabel: "Get personalized recommendations",
    },
    {
      title: "Essential Routine",
      subtitle: "Simple, effective steps for clear skin",
      type: "routine",
      routine: [
        { step: 1, name: "Gentle Cleanser", frequency: "Twice daily", description: "Mild, pH-balanced cleanser to remove excess oil without stripping skin.", tips: "Look for salicylic acid for acne-prone skin." },
        { step: 2, name: "Lightweight Moisturizer", frequency: "Twice daily", description: "Even oily skin needs hydration. Choose oil-free, gel-based formulas.", tips: "Don't skip — it helps balance oil production." },
        { step: 3, name: "Sunscreen", frequency: "Every morning", description: "Essential daily protection. Choose lightweight, non-greasy formulas.", tips: "Reapply if sweating or swimming." },
        { step: 4, name: "Spot Treatment", frequency: "As needed", description: "Target active breakouts with benzoyl peroxide or salicylic acid.", tips: "Apply only to blemishes, not the entire face." },
        { step: 5, name: "Weekly Exfoliation", frequency: "1–2× weekly", description: "Gentle chemical exfoliation removes dead skin cells and prevents clogged pores.", tips: "Start slowly. Increase frequency as tolerated." },
      ],
      ctaLabel: "Get personalized recommendations",
    },
    {
      title: "Lifestyle Tips",
      subtitle: "Healthy habits for teen skin",
      type: "tips",
      tips: {
        eyebrow: "Healthy Habits",
        title: "Lifestyle Tips for Teen Skin",
        description: "Skincare isn't just products — these habits make a big difference.",
        items: [
          "Change pillowcases 2–3 times per week",
          "Clean your phone screen regularly",
          "Avoid touching your face throughout the day",
          "Stay hydrated — drink plenty of water",
          "Get 8–10 hours of sleep nightly",
          "Manage stress with exercise and relaxation",
        ],
        badges: ["Cleanse twice daily", "Targeted acne care", "SPF every morning", "Consistency wins"],
      },
      ctaLabel: "Get personalized recommendations",
    },
  ],
};

const TeensPage = () => <AgePageLayout data={data} />;
export default TeensPage;
