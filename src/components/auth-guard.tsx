"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface GuardProps {
  children: ReactNode;
}

function AuthLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground font-medium animate-pulse">
        Verifying session...
      </p>
    </div>
  );
}

export function CustomerGuard({ children }: GuardProps) {
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

    if (customer.role !== "CUSTOMER") {
      router.replace("/admin");
    }
  }, [initialized, isLoading, customer, router, pathname]);

  if (!initialized || isLoading) return <AuthLoader />;

  if (!customer || customer.role !== "CUSTOMER") return <AuthLoader />;

  return <>{children}</>;
}

export function AdminGuard({ children }: GuardProps) {
  const { customer, isLoading, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!initialized || isLoading) return;
    if (isLoginPage) return;

    if (!customer) {
      router.replace("/admin/login");
      return;
    }

    if (customer.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [initialized, isLoading, customer, router, isLoginPage]);

  if (!initialized || isLoading) return <AuthLoader />;

  if (isLoginPage) return <>{children}</>;

  if (!customer || customer.role !== "ADMIN") return <AuthLoader />;

  return <>{children}</>;
}

export default CustomerGuard;
