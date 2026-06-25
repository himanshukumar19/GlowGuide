import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => Promise<boolean>;
  toggleSubscriptionTier: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem("glowguide-customer");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (found) {
          setCustomer(found.customer);
          localStorage.setItem("glowguide-customer", JSON.stringify(found.customer));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
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
        setCustomer(newCustomer);
        localStorage.setItem("glowguide-customer", JSON.stringify(newCustomer));
        resolve(true);
      }, 800);
    });
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("glowguide-customer");
  };

  const updateProfile = async (updates: Partial<Customer>): Promise<boolean> => {
    if (!customer) return false;
    const updated = { ...customer, ...updates };
    setCustomer(updated);
    localStorage.setItem("glowguide-customer", JSON.stringify(updated));
    return true;
  };

  const toggleSubscriptionTier = () => {
    if (!customer) return;
    const updatedTier = customer.subscriptionTier === "free" ? "paid" : "free";
    const updated: Customer = {
      ...customer,
      subscriptionTier: updatedTier,
      subscriptionEndsAt: updatedTier === "paid" 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        : undefined
    };
    setCustomer(updated);
    localStorage.setItem("glowguide-customer", JSON.stringify(updated));
  };

  const isAuthenticated = customer !== null;

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        toggleSubscriptionTier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
