import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const CONCERNS = ["Acne", "Hyperpigmentation", "Aging", "Dryness", "Sensitivity", "Dark Circles", "Uneven Texture"];

const CompleteProfile = () => {
  const { customer, updateCustomer } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(customer?.displayName || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [skinType, setSkinType] = useState(customer?.skinProfile?.skinType || "");
  const [concerns, setConcerns] = useState<string[]>(customer?.skinProfile?.concerns || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer?.profileCompleted) {
      navigate("/dashboard", { replace: true });
    }
  }, [customer, navigate]);

  const toggleConcern = (concern: string) => {
    setConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCustomer({
      displayName: displayName || customer?.displayName || "",
      phone,
      skinProfile: { skinType, concerns },
      profileCompleted: true,
    });
    setSaving(false);
    navigate("/dashboard", { replace: true });
  };

  const handleSkip = () => {
    navigate("/dashboard", { replace: true });
  };

  if (!customer) return null;

  return (
    <Layout>
      <div className="min-h-[85vh] py-16 flex items-center justify-center gradient-hero">
        <div className="container mx-auto px-4 flex justify-center">
          <Card className="w-full max-w-lg border border-border shadow-card bg-card rounded-gg-lg overflow-hidden animate-scale-in">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-soft">
                <Sparkles className="h-8 w-8 text-primary-foreground animate-float" />
              </div>
              <CardTitle className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Help us personalize your experience
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-gg-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Phone Number
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-gg-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Skin Type
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {SKIN_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSkinType(type)}
                      className={`p-2.5 rounded-gg-sm text-xs font-medium border transition-all ${
                        skinType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Skin Concerns (select all that apply)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map((concern) => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        concerns.includes(concern)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-border py-6 rounded-gg-sm text-foreground font-semibold text-sm"
                  onClick={handleSkip}
                  disabled={saving}
                >
                  Skip for now
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary-hover py-6 rounded-gg-sm text-primary-foreground font-semibold text-sm flex items-center justify-center"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
