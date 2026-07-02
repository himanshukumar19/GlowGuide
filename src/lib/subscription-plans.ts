import type { SubscriptionPlan } from "@/lib/schemas/plan";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Glow Starter",
    description: "Essential tools to identify skin traits",
    tier: "FREE",
    price: 0,
    currency: "INR",
    durationMonths: 0,
    features: [
      "Skin type classification",
      "Detailed concerns analysis",
      "Analysis history (last 3 items)",
      "AI Chatbot (10 daily queries)",
    ],
    isRecommended: false,
    active: true,
  },
  {
    id: "premium_monthly",
    name: "Glow Premium Monthly",
    description: "12-month metrics and maximum query volume",
    tier: "PAID",
    price: 49900,
    currency: "INR",
    durationMonths: 1,
    features: [
      "Full analysis history (12 months)",
      "Unlimited AI chatbot queries",
      "Extra 5% discount on checkout",
    ],
    isRecommended: true,
    active: true,
  },
];

export const DEFAULT_PAID_PLAN = SUBSCRIPTION_PLANS[1]!;
