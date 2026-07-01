export interface SkinProfile {
  skinType?: string;
  concerns?: string[];
}

export interface Customer {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  subscriptionTier: 'FREE' | 'PAID';
  subscriptionExpiresAt?: string;
  analysisCount: number;
  skinProfile?: SkinProfile;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  tier: 'free' | 'paid';
  features: string[];
  isRecommended?: boolean;
}
