import { z } from "zod";

export const customerSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  photoURL: z.string().nullable().optional(),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "ADMIN"]),
  subscriptionTier: z.enum(["FREE", "PAID"]),
  subscriptionStatus: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).nullable().optional(),
  subscriptionExpiresAt: z.string().nullable().optional(),
  subscriptionStartedAt: z.string().nullable().optional(),
  subscriptionCancelledAt: z.string().nullable().optional(),
  subscriptionPlanId: z.string().nullable().optional(),
  analysisCount: z.number().int().min(0),
  skinProfile: z.object({
    skinType: z.string().optional(),
    concerns: z.array(z.string()).optional(),
  }).nullable().optional(),
  profileCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;

export interface SkinProfile {
  skinType?: string;
  concerns?: string[];
}
