export interface Subscription {
  customerId: string;
  tier: 'FREE' | 'PAID';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  planId: string;
  startedAt?: string | null;
  expiresAt?: string | null;
  renewedAt?: string | null;
  cancelledAt?: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}
