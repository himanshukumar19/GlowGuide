import { z } from "zod";

export const subscriptionStatusEnum = z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]);

export const subscriptionSchema = z.object({
  customerId: z.string(),
  tier: z.enum(["FREE", "PAID"]),
  status: subscriptionStatusEnum,
  planId: z.string(),
  startedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  renewedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>;
