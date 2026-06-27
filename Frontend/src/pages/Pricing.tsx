import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Pricing = () => {
  const { customer, isAuthenticated, toggleSubscriptionTier } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in first to subscribe.", {
        action: {
          label: "Login",
          onClick: () => navigate("/login")
        }
      });
      navigate("/login");
      return;
    }

    toggleSubscriptionTier();
    
    if (customer?.subscriptionTier === "free") {
      toast.success("Successfully upgraded to Pro Tier! Welcome aboard.");
    } else {
      toast.info("Subscription reverted to Free Tier for testing.");
    }
  };

  const isPro = customer?.subscriptionTier === "paid";

  const freeFeatures = [
    { text: "Skin type classification", included: true },
    { text: "Detailed concerns analysis", included: true },
    { text: "Analysis history (last 3 items)", included: true },
    { text: "AI Chatbot (10 daily queries)", included: true },
    { text: "Full analysis history (12 months)", included: false },
    { text: "Unlimited AI chatbot queries", included: false },
    { text: "Extra 5% discount on checkout", included: false },
  ];

  const proFeatures = [
    { text: "Skin type classification", included: true },
    { text: "Detailed concerns analysis", included: true },
    { text: "Analysis history (12 months)", included: true },
    { text: "Unlimited AI chatbot queries", included: true },
    { text: "Extra 5% discount on checkout", included: true },
    { text: "Dermatologist-curated routines", included: true },
    { text: "Priority access to ML model scaling", included: true },
  ];

  return (
    <Layout>
      <div className="min-h-[80vh] py-16 gradient-hero">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Select Your Skincare Journey
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Compare plans and choose the level of detailed skincare advice right for you.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="flex flex-col border border-border shadow-card bg-card rounded-gg-lg overflow-hidden transition-all hover:shadow-hover hover:-translate-y-1">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-heading text-2xl font-semibold text-foreground">
                  Glow Starter
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Essential tools to identify skin traits
                </CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">$0</span>
                  <span className="text-muted-foreground ml-1">/ month</span>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-2 flex-grow">
                <ul className="space-y-3.5">
                  {freeFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start text-sm">
                      {feat.included ? (
                        <Check className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feat.included ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0 mt-auto">
                <Button
                  onClick={() => !isAuthenticated ? navigate("/login") : navigate("/dashboard")}
                  variant="outline"
                  className="w-full py-6 border-border rounded-gg-sm text-foreground hover:bg-muted font-semibold transition-all"
                >
                  {!isAuthenticated ? "Get Started" : isPro ? "Downgrade (via active toggle)" : "Your Current Plan"}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-2 border-primary shadow-hover bg-card rounded-gg-lg overflow-hidden relative transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-1.5 rounded-bl-gg-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Recommended
              </div>

              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-heading text-2xl font-semibold text-foreground">
                  Glow Premium
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  12-month metrics and maximum query volume
                </CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">$9.99</span>
                  <span className="text-muted-foreground ml-1">/ month</span>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-2 flex-grow">
                <ul className="space-y-3.5">
                  {proFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground font-medium">
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0 mt-auto">
                <Button
                  onClick={handleSubscribe}
                  className="w-full py-6 bg-primary hover:bg-primary-hover active:scale-95 transition-all text-primary-foreground font-semibold shadow-primary rounded-gg-sm flex items-center justify-center"
                >
                  {isPro ? (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Active — Cancel subscription
                    </>
                  ) : (
                    <>
                      Subscribe to Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
