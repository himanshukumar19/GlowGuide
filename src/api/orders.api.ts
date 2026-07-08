"use client";

import { api } from "./client";

interface CreateOrderPayload {
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  shippingAddress: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    type: "home" | "office";
  };
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode?: string;
}

interface CreateOrderResponse {
  orderId: string;
  appOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  orderId: string;
}

export const ordersApi = {
  createOrder: (data: CreateOrderPayload) =>
    api.post<CreateOrderResponse>("/api/orders/create-order", data),
  verifyPayment: (data: VerifyPaymentPayload) =>
    api.post<VerifyPaymentResponse>("/api/orders/verify", data),
};
