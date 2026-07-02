import { api } from "./client";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  description: string;
}

interface VerifyResponse {
  success: boolean;
  subscriptionExpiresAt: string;
}

export const subscriptionApi = {
  createOrder: () =>
    api.post<CreateOrderResponse>("/api/subscriptions/create-order"),

  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post<VerifyResponse>("/api/subscriptions/verify", data),
};
