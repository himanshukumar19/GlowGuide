import { z } from "zod";

export const planSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  tier: z.enum(["FREE", "PAID"]),
  price: z.number().int().min(0),
  currency: z.string().length(3),
  durationMonths: z.number().int().min(0),
  features: z.array(z.string()),
  isRecommended: z.boolean(),
  active: z.boolean(),
});

export type SubscriptionPlan = z.infer<typeof planSchema>;
