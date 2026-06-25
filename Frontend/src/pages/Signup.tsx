import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Signup = () => {
  const { signup, customer } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (customer) {
      navigate("/dashboard", { replace: true });
    }
  }, [customer, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);
    
    const success = await signup(name, email, phone, password);
    setLoading(false);
    
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Registration failed. Please try again with valid information.");
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
                Join GlowGuide
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Create a free account to begin your skincare journey
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
                  <Label htmlFor="name" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="rounded-gg-sm border-border focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 py-2.5 transition-all text-sm"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="rounded-gg-sm border-border focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 py-2.5 transition-all text-sm"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="rounded-gg-sm border-border focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 py-2.5 transition-all text-sm"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Password *
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
                  className="w-full bg-primary hover:bg-primary-hover active:scale-95 transition-all duration-300 py-6 rounded-gg-sm text-primary-foreground shadow-primary font-semibold text-sm mt-2 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="px-8 pb-8 pt-2 flex justify-center text-sm border-t border-border/40 mt-4 bg-muted/10">
              <span className="text-muted-foreground mr-1.5">Already have an account?</span>
              <Link to="/login" className="text-primary hover:underline font-semibold hover:text-primary-hover">
                Sign In
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
