"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Star, Shield, RefreshCw, Mail, Zap, Crown, Gift } from "lucide-react";
import Script from "next/script";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type BillingCycle = "monthly" | "3month" | "annual";
type PlanName = "starter" | "creator";

// ─────────────────────────────────────────────
// Pricing Data
// Starter: ₹49, Creator: ₹99
// 3-month = 10% off (× 3 months)
// Annual  = 20% off (× 12 months)
// ─────────────────────────────────────────────
const PRICES: Record<PlanName, Record<BillingCycle, number>> = {
  starter: { monthly: 49,  "3month": 132, annual: 470 },
  creator: { monthly: 99,  "3month": 267, annual: 950 },
};

const MONTHLY_BASE: Record<PlanName, number> = {
  starter: 49,
  creator: 99,
};

// ─────────────────────────────────────────────
// Plan Definitions — no taglines
// ─────────────────────────────────────────────
const PLANS = [
  {
    name: "free" as const,
    label: "Free",
    icon: <Gift className="h-5 w-5" />,
    features: [
      { text: "6 credits",            included: true },
      { text: "12 websites",          included: true },
      { text: "2MB image upload",     included: true },
      { text: "Email support",        included: false },
      { text: "Live chat support",    included: false },
    ],
    isPaid: false,
    popular: false,
  },
  {
    name: "starter" as PlanName,
    label: "Starter",
    icon: <Zap className="h-5 w-5" />,
    features: [
      { text: "20 credits",           included: true },
      { text: "25 websites",           included: true },
      { text: "3GB image upload",      included: true },
      { text: "Email support",         included: true },
      { text: "Live chat support",     included: false },
    ],
    isPaid: true,
    popular: false,
  },
  {
    name: "creator" as PlanName,
    label: "Creator",
    icon: <Star className="h-5 w-5" />,
    features: [
      { text: "50 credits",           included: true },
      { text: "100 websites",          included: true },
      { text: "5GB image upload",       included: true },
      { text: "Priority email support", included: true },
      { text: "Live chat included",     included: true, highlight: true },
    ],
    isPaid: true,
    popular: true,
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getSavings(plan: PlanName, cycle: BillingCycle): number | null {
  if (cycle === "monthly") return null;
  const monthsCount = cycle === "3month" ? 3 : 12;
  const fullPrice = MONTHLY_BASE[plan] * monthsCount;
  return fullPrice - PRICES[plan][cycle];
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, handler: (resp: any) => void): void;
    };
  }
}


type Toast = {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

export default function DigitalGreetingPricingPage() {
  const router = useRouter();
  const [billing, setBilling]               = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan]       = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan]   = useState<string | null>(null);
  const [toasts, setToasts]                 = useState<Toast[]>([]);
  const [scriptLoaded, setScriptLoaded]     = useState(false);

  // ─── Toast helpers ───────────────────────────
  const addToast = (type: Toast["type"], title: string, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  // ─── Payment flow ────────────────────────────
  const choosePlan = async (planName: PlanName) => {
    if (!scriptLoaded || typeof window.Razorpay === "undefined") {
      addToast("error", "Not Ready", "Payment gateway is still loading. Please try again.");
      return;
    }
    setLoadingPlan(planName);
    try {
      // Step 1: Create order via Next.js API route
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, billingCycle: billing }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Failed to create order");
      }
      const order = await orderRes.json();

      // Step 2: Open Razorpay popup
      const options: Record<string, unknown> = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "MsgReplier",
        description: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan — ${billing}`,
        order_id: order.order_id,
        theme: { color: "#110f0f" },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
            addToast("info", "Payment Cancelled", "You closed the payment window.");
          },
        },
        // Step 3: Verify via Next.js API route (Only checks signature and marks verified)
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch("/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const result = await verifyRes.json();
            if (result.success) {
              setActivatedPlan(planName);
              addToast("success", "🎉 Plan Activated!",
                `Your ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan is now active! Redirecting to dashboard...`);
              // Redirect to dashboard after 2s so the server page re-fetches the updated plan
              setTimeout(() => router.push("/wishes/dashboard"), 2000);
            } else {
              throw new Error(result.error || "Verification failed");
            }
          } catch (verifyErr: unknown) {
            addToast("error", "Verification Failed",
              verifyErr instanceof Error ? verifyErr.message : "Please contact support.");
          } finally {
            setLoadingPlan(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: Record<string, Record<string, string>>) => {
        setLoadingPlan(null);
        addToast("error", "Payment Failed",
          resp.error?.description || "Payment unsuccessful. Please try again.");
      });
      rzp.open();
    } catch (err: unknown) {
      addToast("error", "Error", err instanceof Error ? err.message : "Something went wrong");
      setLoadingPlan(null);
    }
  };

  const handleFree = () =>
    addToast("success", "Welcome!", "You're on the Free plan — 6 credits and 12 websites, forever free.");

  const cycleLabel: Record<BillingCycle, string> = {
    monthly: "/month",
    "3month": "/3 months",
    annual: "/year",
  };

  return (
    <>
      {/* Razorpay checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      {/* Heading font override */}
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: 'Unbounded', sans-serif !important;
        }
      `}} />

      {/* ─── Toasts ──────────────────────────────────────────── */}
      <div className="fixed top-6 right-4 z-50 flex flex-col gap-3 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border rounded-2xl px-4 py-3 shadow-lg max-w-xs w-full flex items-start gap-3 ${
              toast.type === "success" ? "border-green-200" :
              toast.type === "error"   ? "border-red-200"   :
              "border-[#d4c3ab]"
            }`}
          >
            <span className="text-xl mt-0.5">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "💡"}
            </span>
            <div>
              <p className="font-bold text-sm text-[#110f0f]">{toast.title}</p>
              <p className="text-xs text-[#5d6c7b] leading-relaxed mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-[#f5eedf] text-[#110f0f]" style={{ fontFamily: '"Work Sans", sans-serif' }}>

        {/* ─── Header ───────────────────────────────────────────── */}
        <section className="pt-16 pb-12 px-4 border-b border-[#d4c3ab] text-center">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1.5 rounded-full w-fit mx-auto mb-6">
              <p className="text-sm font-medium text-[#110f0f]">Simple, Transparent Pricing</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] text-[#110f0f] mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-[#5d6c7b] leading-relaxed max-w-xl mx-auto">
              Start for free, upgrade when you&apos;re ready. No hidden fees, no surprises.
            </p>
          </div>
        </section>

        <section className="py-10 px-4">
          <div className="container mx-auto max-w-6xl">

            {/* ─── Billing Toggle ──────────────────────────────── */}
            <div className="flex justify-center mb-12">
              <div
                className="inline-flex bg-white border border-[#d4c3ab] rounded-full p-1.5 gap-1"
                role="group"
                aria-label="Billing cycle"
              >
                {(["monthly", "3month", "annual"] as BillingCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    id={`billing-${cycle}`}
                    onClick={() => setBilling(cycle)}
                    className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      billing === cycle
                        ? "bg-[#110f0f] text-white shadow-sm"
                        : "text-[#5d6c7b] hover:text-[#110f0f]"
                    }`}
                  >
                    {cycle === "monthly" && "Monthly"}
                    {cycle === "3month" && (
                      <span className="flex items-center gap-2">
                        3 Months
                        <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">10% OFF</span>
                      </span>
                    )}
                    {cycle === "annual" && (
                      <span className="flex items-center gap-2">
                        Annual
                        <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">20% OFF</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Pricing Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-4xl mx-auto">
              {PLANS.map((plan) => {
                const isActivated = activatedPlan === plan.name;
                const isLoading   = loadingPlan === plan.name;
                const savings     = plan.isPaid && plan.name !== "free"
                  ? getSavings(plan.name as PlanName, billing)
                  : null;

                return (
                  <div
                    key={plan.name}
                    className={`relative bg-white border rounded-[24px] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      plan.popular
                        ? "border-[#110f0f] shadow-[0_4px_24px_rgba(17,15,15,0.12)]"
                        : isActivated
                        ? "border-green-400 shadow-[0_4px_24px_rgba(16,185,129,0.15)]"
                        : "border-[#d4c3ab] hover:shadow-md"
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-[#110f0f] text-white text-[11px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5">
                          <Crown className="h-3 w-3" /> Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan icon + name */}
                    <div className="mb-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                        plan.popular
                          ? "bg-[#110f0f] text-white"
                          : "bg-[#f5eedf] border border-[#d4c3ab] text-[#110f0f]"
                      }`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-lg font-bold text-[#110f0f]">{plan.label}</h3>
                    </div>

                    {/* Price block */}
                    <div className="mb-5 min-h-[80px]">
                      {plan.isPaid && plan.name !== "free" ? (
                        <>
                          <div className="flex items-end gap-1 leading-none">
                            <span className="text-xl font-semibold text-[#5d6c7b] mt-1">₹</span>
                            <span className="text-4xl font-extrabold text-[#110f0f]">
                              {PRICES[plan.name as PlanName][billing]}
                            </span>
                          </div>
                          <span className="text-sm text-[#948678]">{cycleLabel[billing]}</span>
                          {/* Savings badge */}
                          <div className="mt-2 min-h-[24px]">
                            {savings !== null && savings > 0 ? (
                              <span className="inline-flex items-center bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                Save ₹{savings} vs monthly
                              </span>
                            ) : (
                              <span className="invisible inline-flex text-xs px-2.5 py-1">placeholder</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-end gap-1 leading-none">
                            <span className="text-4xl font-extrabold text-[#110f0f]">Free</span>
                          </div>
                          <span className="text-sm text-[#948678]">forever</span>
                          <div className="mt-2 min-h-[24px]">
                            <span className="invisible inline-flex text-xs px-2.5 py-1">placeholder</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#f1ebe0] mb-5" />

                    {/* Features */}
                    <ul className="flex flex-col gap-3 flex-1 mb-6" aria-label={`${plan.label} plan features`}>
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          {feat.included ? (
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${"highlight" in feat && feat.highlight
                                ? "bg-amber-100 text-amber-600"
                                : "bg-[#f5eedf] border border-[#d4c3ab] text-[#110f0f]"
                            }`}>
                              <Check className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 bg-[#fafafa] border border-[#ece8e0]">
                              <X className="h-3 w-3 text-[#c4b9a8]" />
                            </span>
                          )}
                          <span className={feat.included ? "text-[#374151]" : "text-[#9ca3af]"}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {plan.isPaid && plan.name !== "free" ? (
                      <button
                        id={`btn-${plan.name}`}
                        onClick={() => choosePlan(plan.name as PlanName)}
                        disabled={!!loadingPlan || isActivated}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          isActivated
                            ? "bg-green-50 border border-green-300 text-green-700 cursor-default"
                            : plan.popular
                            ? "bg-[#110f0f] text-white hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                            : "border border-[#110f0f] text-[#110f0f] hover:bg-[#110f0f] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isActivated ? (
                          <>✅ Plan Activated!</>
                        ) : isLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing…
                          </>
                        ) : (
                          `Choose ${plan.label}`
                        )}
                      </button>
                    ) : (
                      <button
                        id="btn-free"
                        onClick={handleFree}
                        className="w-full py-3 px-4 rounded-xl text-sm font-semibold border border-[#d4c3ab] text-[#5d6c7b] hover:bg-[#f5eedf] transition-all duration-200"
                      >
                        Get Started Free
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trust Strip */}
            <div className="mt-14 flex flex-wrap justify-center gap-8">
              {[
                { icon: <Shield className="h-4 w-4" />, label: "Secure payments via Razorpay" },
                { icon: <RefreshCw className="h-4 w-4" />, label: "Cancel anytime" },
                { icon: <Mail className="h-4 w-4" />, label: "24/7 email support" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#948678]">
                  <span className="text-[#110f0f]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 border-t border-[#d4c3ab] bg-[#eedfc6]/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f] w-fit mx-auto mb-4">
                Compare Plans
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#110f0f]">Everything at a glance</h2>
            </div>
            <div className="bg-white border border-[#d4c3ab] rounded-[24px] overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d4c3ab]">
                    <th className="text-left p-4 text-[#5d6c7b] font-semibold">Feature</th>
                    <th className="text-center p-4 text-[#110f0f] font-bold">Free</th>
                    <th className="text-center p-4 text-[#110f0f] font-bold">Starter</th>
                    <th className="text-center p-4 text-[#110f0f] font-bold bg-[#f5eedf]/60">Creator</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Monthly Price",    free: "₹0",  starter: "₹49", creator: "₹99" },
                    { feature: "Credits balance",  free: "6",   starter: "20",  creator: "50"  },
                    { feature: "Websites limit",   free: "12",  starter: "25",  creator: "100" },
                    { feature: "Image Upload",      free: "2MB", starter: "3GB", creator: "5GB" },
                    { feature: "Email Support",     free: false, starter: true,  creator: true  },
                    { feature: "Live Chat",         free: false, starter: false, creator: true  },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-[#d4c3ab] last:border-0 ${i % 2 === 0 ? "" : "bg-[#f5eedf]/20"}`}>
                      <td className="p-4 text-[#374151] font-medium">{row.feature}</td>
                      {(["free", "starter", "creator"] as const).map((col) => {
                        const val = row[col];
                        return (
                          <td key={col} className={`p-4 text-center ${col === "creator" ? "bg-[#f5eedf]/60" : ""}`}>
                            {typeof val === "boolean" ? (
                              val
                                ? <Check className="h-4 w-4 text-green-600 mx-auto" />
                                : <X className="h-4 w-4 text-[#c4b9a8] mx-auto" />
                            ) : (
                              <span className="font-semibold text-[#110f0f]">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

