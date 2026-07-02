"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { customer, isLoading, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized || isLoading) return;

    if (!customer) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    if (requireAdmin && customer.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [initialized, isLoading, customer, requireAdmin, router, pathname]);

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!customer || (requireAdmin && customer.role !== "ADMIN")) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
