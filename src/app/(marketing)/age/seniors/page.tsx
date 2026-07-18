"use client";

import { Flower2, Shield, Droplets, Sun, Heart } from "lucide-react";
import { AgePageLayout, type AgePageData } from "@/components/marketing/AgePageLayout";

const data: AgePageData = {
  hero: {
    eyebrow: "Senior Skincare",
    eyebrowIcon: Flower2,
    title: <>Skincare for <span className="text-primary">Seniors</span></>,
    subtitle: "Gentle, effective care for mature skin. Learn how to nurture and protect aging skin with comfort-focused routines.",
  },
  sections: [
    {
      title: "Skin Changes",
      subtitle: "Understanding how skin ages and how to care for it gently",
      type: "challenges",
      challenges: [
        { challenge: "Thinner Skin", description: "Skin loses collagen and elastin, becoming more fragile and prone to damage.", icon: Shield, solution: "Use gentle, nourishing products. Avoid harsh actives." },
        { challenge: "Increased Dryness", description: "Oil production decreases significantly, leading to chronic dryness.", icon: Droplets, solution: "Rich moisturizers with ceramides and hyaluronic acid." },
        { challenge: "Slower Healing", description: "Wounds and irritations take longer to heal. Skin is more reactive.", icon: Heart, solution: "Barrier-repairing ingredients. Avoid irritating products." },
        { challenge: "Age Spots", description: "Years of sun exposure manifest as hyperpigmentation and uneven tone.", icon: Sun, solution: "Gentle brightening agents. Consistent sun protection." },
      ],
      ctaLabel: "Get gentle recommendations",
    },
    {
      title: "Gentle Routine",
      subtitle: "Comfort-focused steps for mature skin",
      type: "routine",
      routine: [
        { step: 1, name: "Cream Cleanser", frequency: "AM + PM", description: "Non-foaming, hydrating cleanser that won't strip natural oils.", tips: "Avoid hot water. Lukewarm is best for mature skin." },
        { step: 2, name: "Hydrating Toner", frequency: "AM + PM", description: "Alcohol-free toner to prep skin and add a moisture layer.", tips: "Pat gently into skin. Don't rub." },
        { step: 3, name: "Nourishing Serum", frequency: "AM + PM", description: "Look for peptides, growth factors, and antioxidants.", tips: "Apply to slightly damp skin for better absorption." },
        { step: 4, name: "Rich Moisturizer", frequency: "AM + PM", description: "Cream-based formulas with ceramides, shea butter, and hyaluronic acid.", tips: "Apply while skin is still damp to lock in moisture." },
        { step: 5, name: "Mineral Sunscreen", frequency: "Every AM", description: "Gentle, physical sunscreen with zinc oxide or titanium dioxide.", tips: "Reapply every 2 hours when outdoors." },
      ],
      ctaLabel: "Get gentle recommendations",
    },
    {
      title: "Gentle Care",
      subtitle: "Special considerations for mature skin",
      type: "tips",
      tips: {
        eyebrow: "Gentle Care",
        title: "Caring for Mature Skin",
        description: "Special considerations for senior skincare — comfort and hydration first.",
        items: [
          "Use fragrance-free, hypoallergenic products",
          "Avoid hot water — use lukewarm for cleansing",
          "Pat skin dry gently — never rub",
          "Apply moisturizer immediately after bathing",
          "Use a humidifier in dry environments",
          "Stay hydrated with plenty of water",
        ],
        badges: ["Fragrance-free only", "Lukewarm water", "Pat dry, don't rub", "Moisturize immediately"],
      },
      ctaLabel: "Get gentle recommendations",
    },
  ],
};

const SeniorsPage = () => <AgePageLayout data={data} />;
export default SeniorsPage;
