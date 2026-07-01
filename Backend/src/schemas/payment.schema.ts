import { z } from "zod";

export const paymentStatusEnum = z.enum(["PENDING", "CAPTURED", "FAILED", "REFUNDED"]);
export const paymentTypeEnum = z.enum(["SUBSCRIPTION", "ORDER"]);

export const paymentSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  type: paymentTypeEnum,
  subscriptionId: z.string().optional(),
  orderId: z.string().optional(),
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  status: paymentStatusEnum,
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;
export type PaymentType = z.infer<typeof paymentTypeEnum>;
