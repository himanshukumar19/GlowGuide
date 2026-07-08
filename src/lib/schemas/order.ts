import { z } from "zod";

export const orderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const addressSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  type: z.enum(["home", "office"]),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  promoCode: z.string().optional(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().default(""),
  status: orderStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusEnum>;
export type Address = z.infer<typeof addressSchema>;
