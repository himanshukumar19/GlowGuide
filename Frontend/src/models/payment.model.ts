export interface Payment {
  id: string;
  customerId: string;
  type: 'SUBSCRIPTION' | 'ORDER';
  subscriptionId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  description?: string;
  createdAt: string;
  updatedAt: string;
}
