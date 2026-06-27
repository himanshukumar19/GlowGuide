import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2, KeyRound } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Login = () => {
  const { login, customer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve redirect target location, default to /dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (customer) {
      navigate(from, { replace: true });
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
    
    const success = await login(email, password);
    setLoading(false);
    
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError("Invalid email or password. Try using one of the demo credentials below.");
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-gg-sm bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    {error}
                  </div>
                )}
                
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                      Password
                    </Label>
                  </div>
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
                  className="w-full bg-primary hover:bg-primary-hover active:scale-95 transition-all duration-300 py-6 rounded-gg-sm text-primary-foreground shadow-primary font-semibold text-sm mt-2 flex items-center justify-center"
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

              {/* Demo Credentials */}
              <div className="mt-8 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <span>Demo Accounts (Click to Autofill)</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoFill("customer@glowguide.com", "password123")}
                    className="flex justify-between items-center text-left text-xs bg-muted/40 hover:bg-muted border border-border p-2.5 rounded-gg-sm transition-all hover:translate-x-1"
                    disabled={loading}
                  >
                    <div>
                      <span className="font-semibold text-foreground block">Free Tier Customer</span>
                      <span className="text-muted-foreground block text-[10px]">customer@glowguide.com</span>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleDemoFill("pro@glowguide.com", "password123")}
                    className="flex justify-between items-center text-left text-xs bg-muted/40 hover:bg-muted border border-border p-2.5 rounded-gg-sm transition-all hover:translate-x-1"
                    disabled={loading}
                  >
                    <div>
                      <span className="font-semibold text-foreground block">Paid Tier Customer</span>
                      <span className="text-muted-foreground block text-[10px]">pro@glowguide.com</span>
                    </div>
                    <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full uppercase">Paid</span>
                  </button>
                </div>
              </div>
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
