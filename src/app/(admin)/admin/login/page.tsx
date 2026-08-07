'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/store/useAuthStore";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customerMismatch, setCustomerMismatch] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    setError("");
    setCustomerMismatch(false);
    setLoading(true);
    const result = await login(values.email, values.password, "admin");
    setLoading(false);

    if (result.success) {
      router.push("/admin");
    } else {
      if (result.error === "CUSTOMER_ON_ADMIN_LOGIN") {
        setCustomerMismatch(true);
        return;
      }
      setError(result.error || "Invalid credentials. Please try again.");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setCustomerMismatch(false);
    setGoogleLoading(true);
    const result = await loginWithGoogle("admin");
    setGoogleLoading(false);
    if (!result.success && result.error) {
      if (result.error === "CUSTOMER_ON_ADMIN_LOGIN") {
        setCustomerMismatch(true);
        return;
      }
      setError(result.error);
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-gg border bg-card shadow-card overflow-hidden">
          <div className="gradient-primary px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-foreground/20 mb-3">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary-foreground font-heading">
              GlowGuide
            </h1>
            <p className="text-sm text-primary-foreground/80 mt-1">Admin Panel</p>
          </div>

          <div className="p-6">
            {customerMismatch && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Administrator access required.</span>
                </div>
                <a href="/login" className="text-destructive underline font-semibold block ml-6">
                  Go to Customer Login →
                </a>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full border-border py-5 rounded-gg-sm text-foreground font-semibold text-sm flex items-center justify-center gap-2 mb-4"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground font-medium uppercase">or</span>
              <Separator className="flex-1" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@glowguide.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-semibold shadow-primary"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>


          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
