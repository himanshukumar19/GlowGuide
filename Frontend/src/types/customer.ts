export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  subscriptionTier: 'free' | 'paid';
  subscriptionEndsAt?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  tier: 'free' | 'paid';
  features: string[];
  isRecommended?: boolean;
}
