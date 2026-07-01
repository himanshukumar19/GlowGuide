import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { customer, isLoading, initialized } = useAuth();
  const location = useLocation();

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

  if (!customer) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && customer.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
