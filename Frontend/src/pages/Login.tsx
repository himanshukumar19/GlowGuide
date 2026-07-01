import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Login = () => {
  const { login, loginWithGoogle, customer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    if (customer) {
      const target = customer.profileCompleted ? from : "/complete-profile";
      navigate(target, { replace: true });
    }
  }, [customer, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Invalid email or password.");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] py-16 flex items-center justify-center gradient-hero">
        <div className="container mx-auto px-4 flex justify-center">
          <Card className="w-full max-w-md border border-border shadow-card bg-card rounded-gg-lg overflow-hidden animate-scale-in">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-soft">
                <Sparkles className="h-8 w-8 text-primary-foreground animate-float" />
              </div>
              <CardTitle className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Welcome to GlowGuide
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Enter your credentials to access personalized skin analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 py-4">
              {error && (
                <div className="mb-4 p-3.5 rounded-gg-sm bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full border-border py-6 rounded-gg-sm text-foreground font-semibold text-sm flex items-center justify-center gap-2"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground font-medium uppercase">or</span>
                <Separator className="flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="rounded-gg-sm border-border focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 py-2.5 transition-all text-sm"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-gg-sm border-border focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 py-2.5 transition-all text-sm"
                    disabled={loading}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover active:scale-95 transition-all duration-300 py-6 rounded-gg-sm text-primary-foreground shadow-primary font-semibold text-sm flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="px-8 pb-8 pt-2 flex justify-center text-sm border-t border-border/40 mt-4 bg-muted/10">
              <span className="text-muted-foreground mr-1.5">Don't have an account?</span>
              <Link to="/signup" className="text-primary hover:underline font-semibold hover:text-primary-hover">
                Sign Up
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
