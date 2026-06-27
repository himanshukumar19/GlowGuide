import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  subscriptionTier: "free" | "paid";
  subscriptionEndsAt?: string;
  createdAt: string;
}

const MOCK_USERS = [
  {
    email: "customer@glowguide.com",
    password: "password123",
    customer: {
      id: "cust-01",
      email: "customer@glowguide.com",
      name: "Jane Doe",
      phone: "+1 (555) 123-4567",
      subscriptionTier: "free" as const,
      createdAt: new Date().toISOString(),
    }
  },
  {
    email: "pro@glowguide.com",
    password: "password123",
    customer: {
      id: "cust-02",
      email: "pro@glowguide.com",
      name: "Alice Vance",
      phone: "+1 (555) 987-6543",
      subscriptionTier: "paid" as const,
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    }
  },
  {
    email: "admin@glowguide.com",
    password: "adminpassword",
    customer: {
      id: "admin-01",
      email: "admin@glowguide.com",
      name: "Admin Staff",
      subscriptionTier: "paid" as const,
      createdAt: new Date().toISOString(),
    }
  }
];

interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => Promise<boolean>;
  toggleSubscriptionTier: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const found = MOCK_USERS.find(
              (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );
            if (found) {
              set({ customer: found.customer, isAuthenticated: true });
              resolve(true);
            } else {
              resolve(false);
            }
          }, 800);
        });
      },
      signup: async (name, email, phone, password) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newCustomer: Customer = {
              id: `cust-${Math.random().toString(36).substr(2, 9)}`,
              email,
              name,
              phone: phone || undefined,
              subscriptionTier: "free",
              createdAt: new Date().toISOString(),
            };
            set({ customer: newCustomer, isAuthenticated: true });
            resolve(true);
          }, 800);
        });
      },
      logout: () => {
        set({ customer: null, isAuthenticated: false });
      },
      updateProfile: async (updates) => {
        const { customer } = get();
        if (!customer) return false;
        const updated = { ...customer, ...updates };
        set({ customer: updated });
        return true;
      },
      toggleSubscriptionTier: () => {
        const { customer } = get();
        if (!customer) return;
        const updatedTier = customer.subscriptionTier === "free" ? "paid" : "free";
        const updated: Customer = {
          ...customer,
          subscriptionTier: updatedTier,
          subscriptionEndsAt: updatedTier === "paid" 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
            : undefined
        };
        set({ customer: updated });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "glowguide-customer-store",
      partialize: (state) => ({ customer: state.customer, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useAuth = useAuthStore;
