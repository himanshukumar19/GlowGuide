import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { customer, isLoading } = useAuth();
  const location = useLocation();

  // Check localStorage as a backup to prevent asynchronous React state timing gaps
  const savedCustomer = localStorage.getItem("glowguide-customer");
  const hasSavedCustomer = !!savedCustomer;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!customer && !hasSavedCustomer) {
    // Redirect to login page and save the state of where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!customer || customer.email !== "admin@glowguide.com")) {
    // Basic admin check (based on mock emails or role)
    // Redirect to dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
