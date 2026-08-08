'use client';

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X, ArrowRight, ShieldCheck, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { subscriptionApi } from "@/api/subscription.api";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) return resolve();
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

const Pricing = () => {
  const { customer, isAuthenticated, refreshCustomer } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in first to subscribe.", {
        action: {
          label: "Login",
          onClick: () => router.push("/login")
        }
      });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      await loadRazorpayScript();

      const order = await subscriptionApi.createOrder();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "GlowGuide",
        description: order.description,
        order_id: order.orderId,
        prefill: {
          name: customer?.displayName || "",
          email: customer?.email || "",
        },
        theme: { color: "#6366f1" },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            await subscriptionApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await refreshCustomer();
            toast.success("Successfully upgraded to Premium!");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, customer, refreshCustomer]);

  const isPro = customer?.subscriptionTier === "PAID";

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
    <div className="min-h-[80vh] bg-[#f7f9f8]">
      <section className="border-b border-border bg-[#e8efeb]">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 md:pb-20 md:pt-24 lg:px-12">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-primary">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"><Sparkles className="h-4 w-4" /></span>
                GlowGuide membership
              </div>
              <h1 className="max-w-2xl font-heading text-5xl font-bold leading-[0.98] tracking-[-0.045em] md:text-7xl">
                More context.<br /><span className="text-primary">Better decisions.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-foreground/70 md:text-lg">
                Start with the essentials for free. Upgrade when you want a longer view of your skin and more room to ask questions.
              </p>
            </div>
            <div className="border-t border-primary/30 pt-4 md:max-w-sm md:justify-self-end">
              <p className="text-sm leading-6 text-foreground/70">Both plans include access to Skin Analysis, product education, and your personalized Dashboard.</p>
              <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-primary"><LockKeyhole className="h-4 w-4" /> Secure checkout powered by Razorpay</div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col rounded-3xl border border-border bg-white p-7 shadow-soft md:p-9">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="font-heading text-2xl font-bold">Glow Starter</h2><p className="mt-1 text-sm text-muted-foreground">Your essential skin toolkit</p></div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">Free</span>
            </div>
            <div className="mt-8 flex items-baseline"><span className="font-heading text-5xl font-bold tracking-tight">$0</span><span className="ml-2 text-sm text-muted-foreground">/ month</span></div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">A clear starting point for understanding your skin and building consistent habits.</p>
            <ul className="mt-8 flex-1 space-y-4 border-t border-border pt-7">
              {freeFeatures.map((feat) => <li key={feat.text} className="flex items-start gap-3 text-sm"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${feat.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40"}`}>{feat.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}</span><span className={feat.included ? "font-medium text-foreground" : "text-muted-foreground"}>{feat.text}</span></li>)}
            </ul>
            <Button onClick={() => !isAuthenticated ? router.push("/login") : router.push("/dashboard")} variant="outline" className="mt-8 h-12 w-full rounded-xl border-border font-semibold hover:bg-muted">{!isAuthenticated ? "Get started free" : "Go to Dashboard"}</Button>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-primary bg-white p-7 shadow-primary md:p-9">
            <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-2xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"><Sparkles className="h-3 w-3" /> Recommended</div>
            <div className="flex items-start justify-between gap-4 pr-24"><div><h2 className="font-heading text-2xl font-bold">Glow Premium</h2><p className="mt-1 text-sm text-muted-foreground">The complete skin context</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Pro</span></div>
            <div className="mt-8 flex items-baseline"><span className="font-heading text-5xl font-bold tracking-tight">$9.99</span><span className="ml-2 text-sm text-muted-foreground">/ month</span></div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">For customers who want to track progress over time and get more from their AI skincare companion.</p>
            <ul className="mt-8 flex-1 space-y-4 border-t border-primary/15 pt-7">
              {proFeatures.map((feat) => <li key={feat.text} className="flex items-start gap-3 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Check className="h-3 w-3" /></span><span className="font-medium text-foreground">{feat.text}</span></li>)}
            </ul>
            <Button onClick={handleSubscribe} disabled={isLoading || isPro} className="mt-8 h-12 w-full rounded-xl bg-primary font-semibold text-white shadow-primary hover:bg-primary-hover disabled:opacity-70">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : isPro ? <><ShieldCheck className="mr-2 h-4 w-4" /> Premium active</> : <>Continue to Premium <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 border-y border-border py-7 text-center sm:grid-cols-3 sm:text-left">
          <div><p className="font-heading text-lg font-bold">Know your skin</p><p className="mt-1 text-sm text-muted-foreground">Your analysis, routine, and history in one place.</p></div>
          <div><p className="font-heading text-lg font-bold">No pressure</p><p className="mt-1 text-sm text-muted-foreground">Start free and upgrade only when it feels useful.</p></div>
          <div><p className="font-heading text-lg font-bold">Built for progress</p><p className="mt-1 text-sm text-muted-foreground">More context helps you spot what is actually working.</p></div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
