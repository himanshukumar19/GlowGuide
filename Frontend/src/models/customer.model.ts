export interface SkinProfile {
  skinType?: string;
  concerns?: string[];
}

export interface Customer {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  subscriptionTier: 'FREE' | 'PAID';
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | null;
  subscriptionExpiresAt?: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionCancelledAt?: string | null;
  subscriptionPlanId?: string | null;
  analysisCount: number;
  skinProfile?: SkinProfile | null;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: 'FREE' | 'PAID';
  price: number;
  currency: string;
  durationMonths: number;
  features: string[];
  isRecommended: boolean;
  active: boolean;
}
