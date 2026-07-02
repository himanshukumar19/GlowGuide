'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Calendar, User, Phone, Zap, ArrowRight, LogOut, 
  CheckCircle, History, Settings, Flame, ShieldAlert, Award, 
  Lock, BookOpen, Clock, PlayCircle, Loader2, Sun, Moon
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_HISTORY } from "@/data/analysisHistory";
import { HealthTrendCharts } from "@/components/analysis/HealthTrendCharts";
import { AnalysisComparison } from "@/components/analysis/AnalysisComparison";
import { DashboardErrorBoundary } from "@/components/analysis/DashboardErrorBoundary";
import { products } from "@/data/products";

const Dashboard = () => {
  const { customer, logout, updateCustomer } = useAuth();
  const router = useRouter();

  // Settings states
  const [profileName, setProfileName] = useState(customer?.displayName || "");
  const [profilePhone, setProfilePhone] = useState(customer?.phone || "");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Sync profile values once customer loads asynchronously
  useEffect(() => {
    if (customer) {
      setProfileName(customer.displayName || "");
      setProfilePhone(customer.phone || "");
    }
  }, [customer]);

  // Filter history based on subscription tier
  const isPro = customer?.subscriptionTier === "PAID";
  
  // Free users only get last 3 analyses, Paid users get the full history
  const visibleHistory = isPro ? MOCK_HISTORY : MOCK_HISTORY.slice(-3);
  const latestAnalysis = visibleHistory[visibleHistory.length - 1];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await updateCustomer({ displayName: profileName, phone: profilePhone });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
    setSettingsLoading(false);
  };

  const handleSubscribeToggle = async () => {
    const newTier = customer?.subscriptionTier === "FREE" ? "PAID" : "FREE";
    await updateCustomer({ subscriptionTier: newTier });
    toast.success(
      `Subscription changed to ${newTier === "PAID" ? "Pro" : "Free"} tier.`
    );
  };

  // Score semantic colors
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-success text-success-foreground";
    if (score >= 60) return "bg-primary text-primary-foreground";
    if (score >= 40) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  // Mock auto-tracked products (e.g. purchased from app)
  const trackedProducts = [
    {
      product: products[0] || { name: "Simple Kind to Skin Hydrating Cleanser", brand: "Simple" },
      daysUsed: 18,
      lifespan: 60, // 60 days of usage
      status: "In Use"
    },
    {
      product: products[2] || { name: "Cetaphil Daily Moisturising Lotion", brand: "Cetaphil" },
      daysUsed: 35,
      lifespan: 90,
      status: "Running Low"
    }
  ];

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Loading dashboard data...
          </p>
        </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-background gradient-hero">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          
          {/* Pro Upgrade Nudge Banner */}
          {!isPro && (
            <Card className="border-2 border-warning bg-warning/5 shadow-soft rounded-gg overflow-hidden flex flex-col sm:flex-row items-center justify-between p-5 gap-4 animate-scale-in">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-heading text-base font-bold text-foreground">
                    Upgrade to Premium Access
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                    You are currently on the Free tier. Upgrade to unlock your full 12-month progress history, unlimited AI chatbot queries, and a 5% discount on all shop orders!
                  </p>
                </div>
              </div>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider py-5 px-6 rounded-gg-sm shadow-primary">
                  Go Pro Now
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </Card>
          )}

          {/* Profile Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                Skincare Diagnostic Center
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground">
                Welcome back, {customer?.displayName}
              </h1>
              <p className="text-muted-foreground text-xs">
                Your skin diagnostic report was last compiled on{" "}
                {latestAnalysis ? new Date(latestAnalysis.date).toLocaleDateString() : "N/A"}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isPro ? (
                <Badge className="bg-secondary text-secondary-foreground font-black text-[10px] uppercase tracking-wider py-1.5 px-3.5 border-0 rounded-full flex items-center gap-1">
                  <Award className="h-3 w-3 fill-secondary" />
                  Pro Premium Member
                </Badge>
              ) : (
                <Badge variant="outline" className="border-border text-muted-foreground font-black text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-full">
                  Free Account
                </Badge>
              )}

              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-xs font-semibold uppercase tracking-wider py-4"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Tab Navigation layout */}
          <Tabs defaultValue="overview" className="w-full space-y-6">
            <TabsList className="bg-muted/40 border border-border p-1 rounded-gg w-full grid grid-cols-4 md:max-w-xl">
              <TabsTrigger value="overview" className="rounded-gg-sm py-2 text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-gg-sm py-2 text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                History & Compare
              </TabsTrigger>
              <TabsTrigger value="routine" className="rounded-gg-sm py-2 text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Routine
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-gg-sm py-2 text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: OVERVIEW */}
            <TabsContent value="overview" className="space-y-6 animate-fade-in outline-none">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Health Score circle */}
                <Card className="border border-border shadow-soft bg-card rounded-gg-lg flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-4">
                    Latest Health Score
                  </span>
                  {latestAnalysis ? (
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-muted/30" strokeWidth="8" fill="none" />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#3B5D4E"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={351}
                          strokeDashoffset={351 - (351 * latestAnalysis.healthScore) / 100}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-foreground">{latestAnalysis.healthScore}</span>
                        <span className="text-[9px] uppercase font-semibold text-muted-foreground">Points</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No analysis score</p>
                  )}
                  <Link href="/analysis" className="mt-4 w-full">
                    <Button className="w-full text-xs font-semibold uppercase tracking-wider bg-primary hover:bg-primary-hover text-primary-foreground rounded-gg-sm">
                      New Diagnosis Scan
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </Card>

                {/* Skin Profile summary */}
                <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6 md:col-span-2 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                        Skin Diagnosis overview
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Model Confidence: {latestAnalysis ? Math.round(latestAnalysis.confidence * 100) : 0}%
                      </span>
                    </div>
                    {latestAnalysis ? (
                      <div className="space-y-2">
                        <h3 className="font-heading text-xl font-bold text-foreground capitalize">
                          {latestAnalysis.skinType} Skin
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your diagnostic history shows normal lipid balance and high moisture density. Continue using mild humectants to maintain hydration levels.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {latestAnalysis.concerns.map((c) => (
                            <Badge key={c.name} variant="secondary" className="bg-primary/5 text-primary border-0 rounded-full font-bold text-[9px] uppercase px-2.5 py-0.5">
                              {c.name.replace("_", " ")}: {c.severity}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Take the skin quiz to generate profile.</p>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-4 flex gap-4 text-xs font-medium text-muted-foreground mt-4">
                    <div>
                      Joined: <span className="text-foreground">{customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Today"}</span>
                    </div>
                    <div>
                      Total Scans: <span className="text-foreground">{visibleHistory.length}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Progress Charts (Recharts) */}
              {visibleHistory.length >= 2 ? (
                <DashboardErrorBoundary>
                  <HealthTrendCharts history={visibleHistory} />
                </DashboardErrorBoundary>
              ) : (
                <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-8 text-center">
                  <Flame className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                  <h3 className="font-heading text-base font-bold text-foreground mb-1">
                    Unlock Interactive Progress Graphs
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-4">
                    You need to complete at least 2 skin diagnoses before we can calculate health scores and tracking trends.
                  </p>
                  <Link href="/analysis">
                    <Button variant="outline" className="border-border rounded-gg-sm text-xs font-bold uppercase tracking-wider py-4">
                      Complete Step 2 Scan
                    </Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            {/* TAB CONTENT: HISTORY & COMPARISON */}
            <TabsContent value="history" className="space-y-6 animate-fade-in outline-none">
              {/* History Gating Alert Banner */}
              {!isPro && (
                <div className="p-3.5 bg-secondary/10 border border-secondary/20 rounded-gg-sm flex items-center justify-between text-xs text-secondary font-bold">
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Pro Gating Active: Displaying last 3 entries. 3 older analyses are hidden.
                  </span>
                  <Link href="/pricing" className="hover:underline">
                    Upgrade Now ➔
                  </Link>
                </div>
              )}

              {/* Analysis Comparison */}
              {visibleHistory.length >= 2 && (
                <DashboardErrorBoundary>
                  <AnalysisComparison history={visibleHistory} />
                </DashboardErrorBoundary>
              )}

              {/* Chronological Timeline List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Chronological Timeline History
                  </h3>
                </div>

                <div className="space-y-3">
                  {visibleHistory.map((item) => (
                    <Card key={item.id} className="border border-border shadow-soft bg-card rounded-gg p-5 hover:shadow-card transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreColor(item.healthScore)}`}>
                            {item.healthScore}
                          </div>
                          <div>
                            <span className="font-heading text-base font-bold text-foreground capitalize">
                              {item.skinType} Skin Diagnosis
                            </span>
                            <span className="text-[10px] text-muted-foreground block font-medium mt-0.5">
                              Analyzed: {new Date(item.date).toLocaleDateString()} — {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {item.concerns.map((c) => (
                            <Badge key={c.name} variant="outline" className="border-border text-[9px] font-bold uppercase rounded-full py-0.5 px-2">
                              {c.name.replace("_", " ")}: {c.severity}%
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-3.5 p-3 rounded-gg-sm bg-muted/30 border border-border/40 text-xs text-foreground/80 leading-relaxed italic">
                          "{item.notes}"
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT: RECOMMENDED ROUTINE */}
            <TabsContent value="routine" className="space-y-6 animate-fade-in outline-none">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Routine morning/night */}
                <div className="md:col-span-2 space-y-6">
                  {/* Morning */}
                  <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Sun className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        Morning Routine (Tracked)
                      </h3>
                    </div>
                    <ol className="space-y-3.5">
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          1
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">Cleanser</span>
                          <span className="text-muted-foreground block mt-0.5">Gentle foaming face wash (e.g. Simple cleanser)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          2
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">Active Treatment</span>
                          <span className="text-muted-foreground block mt-0.5">Hydrating Niacinamide or Vitamin C serum</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          3
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">Moisturizer</span>
                          <span className="text-muted-foreground block mt-0.5">Light moisturizing lotion (e.g. Cetaphil lotion)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          4
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">UV Protection</span>
                          <span className="text-muted-foreground block mt-0.5">Broad-spectrum mineral SPF 30+</span>
                        </div>
                      </li>
                    </ol>
                  </Card>

                  {/* Night */}
                  <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Moon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        Night Routine (Tracked)
                      </h3>
                    </div>
                    <ol className="space-y-3.5">
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          1
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">Double Cleanse</span>
                          <span className="text-muted-foreground block mt-0.5">Oil cleanser followed by foaming wash to clear pores</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          2
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">Hydration Layer</span>
                          <span className="text-muted-foreground block mt-0.5">Soothing toner containing Hyaluronic Acid or Cica</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          3
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">Barrier Cream</span>
                          <span className="text-muted-foreground block mt-0.5">Thicker Ceramide moisturizer to lock in moisture overnight</span>
                        </div>
                      </li>
                    </ol>
                  </Card>
                </div>

                {/* Auto-Tracked Products */}
                <div className="space-y-6">
                  <Card className="border border-border shadow-soft bg-card rounded-gg-lg p-6">
                    <h3 className="font-heading text-base font-bold text-foreground mb-4 border-b border-border/40 pb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Auto-Tracked Products
                    </h3>

                    <div className="space-y-5">
                      {trackedProducts.map((p, i) => {
                        const usagePercent = Math.round((p.daysUsed / p.lifespan) * 100);
                        return (
                          <div key={i} className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-foreground block truncate max-w-[150px]">
                                  {p.product.name}
                                </span>
                                <span className="text-muted-foreground text-[10px] block uppercase font-bold mt-0.5">
                                  {p.product.brand}
                                </span>
                              </div>
                              <Badge className={`${p.status === "In Use" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"} font-black text-[9px] uppercase rounded-full border-0`}>
                                {p.status}
                              </Badge>
                            </div>

                            <div className="pt-1.5 space-y-1">
                              <Progress value={usagePercent} className="h-1.5" />
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Day {p.daysUsed} of {p.lifespan} used</span>
                                <span>{usagePercent}% finished</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT: SETTINGS */}
            <TabsContent value="settings" className="space-y-6 animate-fade-in outline-none">
              <div className="grid md:grid-cols-3 gap-6 items-start">
                
                {/* Account edit form */}
                <Card className="border border-border shadow-soft bg-card rounded-gg-lg md:col-span-2">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Profile Configurations
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Update your user details and notification settings
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Full Name
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="rounded-gg-sm border-border text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="displayEmail" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Email Address
                        </Label>
                        <Input
                          id="displayEmail"
                          type="email"
                          value={customer?.email || ""}
                          className="rounded-gg-sm border-border text-sm bg-muted/40 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Email logins are locked to verify your JWT parameters securely.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="displayPhone" className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Phone Number
                        </Label>
                        <Input
                          id="displayPhone"
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="rounded-gg-sm border-border text-sm"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={settingsLoading}
                        className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-semibold text-xs uppercase tracking-wider py-5 px-6 rounded-gg-sm shadow-primary"
                      >
                        {settingsLoading ? "Saving Settings..." : "Update Settings"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Billing details */}
                <Card className="border border-border shadow-soft bg-card rounded-gg-lg">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Subscription Portal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Billing Plan Tier
                      </span>
                      <span className="text-base font-bold text-foreground capitalize block">
                        Glow {customer?.subscriptionTier === "PAID" ? "Premium" : "Starter"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Renews / Expire Date
                      </span>
                      <span className="text-xs text-foreground font-medium block">
                        {customer?.subscriptionExpiresAt 
                          ? new Date(customer.subscriptionExpiresAt).toLocaleDateString()
                          : "N/A (Free Account)"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/40 space-y-2">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Toggling subscription tier switches access parameters. This portal acts as a simulated checkout gateway.
                      </p>
                      <Button
                        onClick={handleSubscribeToggle}
                        variant={isPro ? "outline" : "default"}
                        className="w-full text-xs font-semibold uppercase tracking-wider py-4 rounded-gg-sm"
                      >
                        {isPro ? "Cancel Pro Level" : "Upgrade to Pro"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

          </Tabs>

        </div>
      </div>
  );
};

export default Dashboard;
