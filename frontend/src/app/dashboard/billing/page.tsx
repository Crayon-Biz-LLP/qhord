"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Zap, Crown, Building2, Check, LayoutDashboard, Sparkles, Rocket,
  TrendingUp, Activity, CreditCard, BarChart3,
  ArrowUpRight, X, Smartphone as UpiIcon, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";

// Initialised once at module level — never recreated on re-renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "13px",
      color: "#1a1510",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
      fontWeight: "500",
      "::placeholder": { color: "rgba(26,21,16,0.2)" },
      iconColor: "#b99b7b",
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
  hidePostalCode: true,
};

// ── Stripe card form (must live inside <Elements>) ────────────────────────────
interface StripeCardFormProps {
  checkoutItem: { name: string; price: string; isTopUp: boolean };
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
  refreshData: () => Promise<void>;
}

function StripeCardForm({ checkoutItem, onSuccess, onError, onClose, refreshData }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const credits = checkoutItem.price === "49.00" ? 5000 : 10000;

      // 1. Backend creates a PaymentIntent and returns the client secret
      const { data: piData } = await api.post("/subscription/create-payment-intent", { credits });

      // 2. Stripe.js confirms the card charge in the browser
      const cardElement = elements.getElement(CardElement)!;
      const { error, paymentIntent } = await stripe.confirmCardPayment(piData.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) throw new Error(error.message || "Card payment failed");

      if (paymentIntent?.status === "succeeded") {
        // 3. Backend verifies the PaymentIntent and credits the account
        await api.post("/subscription/confirm-top-up", {
          paymentIntentId: paymentIntent.id,
          credits,
        });
        onSuccess(`Successfully purchased ${credits.toLocaleString()} credits!`);
        await refreshData();
        onClose();
      }
    } catch (err: any) {
      onError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">
          Card Details
        </label>
        <div className="w-full min-h-[48px] bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl px-4 py-[14px] shadow-sm focus-within:border-[#b99b7b]/30 transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-[9px] font-medium text-[#1a1510]/25 uppercase tracking-widest">
          Secured by Stripe — we never store your card details
        </p>
      </div>

      <div className="pt-4 border-t border-[#1a1510]/[0.07] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[#1a1510]">Total</span>
          <span className="text-[20px] font-bold text-[#1a1510] tracking-tight tabular-nums">
            ${checkoutItem.price}
          </span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={processing || !stripe}
          className={`btn-shine w-full h-12 bg-[#1a1510] text-white rounded-none text-sm font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 ${
            processing || !stripe ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {processing ? (
            <>
              <Loader2 size={16} className="animate-spin text-brand-gold" />
              Processing…
            </>
          ) : (
            "Confirm Purchase"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  price: string;
  credits: string;
  features: string[];
  is_custom: boolean;
  button_text: string;
  isCurrent?: boolean;
}

interface CheckoutItem {
  name: string;
  price: string;
  isTopUp: boolean;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem>({
    name: "Pro Upgrade",
    price: "299.00",
    isTopUp: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [plansRes, statusRes, statsRes] = await Promise.all([
        api.get("/plans"),
        api.get("/subscription/status"),
        api.get("/subscription/usage-stats"),
      ]);

      const loadedPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
      const subInfo = statusRes.data?.subscription || null;
      setSubscription(subInfo);
      setUsageStats(statsRes.data?.stats || null);

      const mappedPlans: PlanItem[] = loadedPlans.map((p: any) => {
        const isCurrent =
          subInfo?.plan?.name?.toLowerCase() === p.name?.toLowerCase();
        return {
          id: p.id,
          name: p.name,
          tagline: p.tagline || "",
          price: p.price || "0",
          credits: `${p.credits || "0"} credits/mo`,
          features: Array.isArray(p.features)
            ? p.features
            : JSON.parse(p.features || "[]"),
          is_custom: p.is_custom || false,
          button_text: isCurrent ? "Current Plan" : p.button_text || "Upgrade",
          isCurrent,
        };
      });
      setPlans(mappedPlans);
    } catch (err) {
      console.error("Failed to load billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle return from Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const sessionId = params.get("session_id");

    if (status === "success" && sessionId) {
      showToast("Plan upgraded successfully! Your credits will be applied shortly.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "cancelled") {
      showToast("Checkout was cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }

    loadBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = (name: string, price: string, isTopUp = false) => {
    setPaymentMethod("card");
    setCheckoutItem({ name, price, isTopUp });
    setShowCheckout(true);
  };

  // For plan upgrades: redirect to Stripe Checkout
  const handlePlanUpgrade = async () => {
    setIsProcessing(true);
    try {
      const planKey = checkoutItem.name.split(" ")[0].toLowerCase();
      const { data } = await api.post("/subscription/create-checkout-session", {
        plan: planKey,
      });
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to start checkout. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const dynamicUsageStats = useMemo(() => {
    const totalCredits = subscription?.credits?.total_credits || 2000;
    const remainingCredits = subscription?.credits?.remaining_credits ?? 2000;
    const usedCredits = subscription?.credits?.used_credits ?? 0;
    const campaignsCount = usageStats?.campaigns_run ?? 0;
    return [
      { label: "Credits Used",      current: usedCredits,       max: totalCredits,     growth: "+0%",             color: "#b99b7b" },
      { label: "Remaining Balance", current: remainingCredits,  max: totalCredits,     growth: "Active",          color: "#1a1510" },
      { label: "AI Executions",     current: usedCredits * 2,   max: totalCredits * 2, growth: "+12%",            color: "#b99b7b" },
      { label: "Active Campaigns",  current: campaignsCount,    max: 10,               growth: `+${campaignsCount}`, color: "#1a1510" },
    ];
  }, [subscription, usageStats]);

  const toolSubscriptions = [
    { name: "Apollo",     plan: "Professional", price: "79", next: "Apr 1, 2026", status: "Active",   icon: "🚀" },
    { name: "Clay",       plan: "Explorer",     price: "49", next: "Apr 1, 2026", status: "Active",   icon: "🧱" },
    { name: "Smartlead",  plan: "Pro",          price: "39", next: "Apr 1, 2026", status: "Active",   icon: "📧" },
    { name: "HeyReach",   plan: "Inactive",     price: "59", next: "-",           status: "Inactive", icon: "🤝" },
  ];

  // ── Checkout Modal ───────────────────────────────────────────────────────────
  const CheckoutModal = () => (
    <AnimatePresence>
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckout(false)}
            className="absolute inset-0 bg-[#1a1510]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-[#1a1510]/[0.06]"
          >
            <div className="p-6 sm:p-7 space-y-6">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg flex items-center justify-center">
                    <CreditCard size={17} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1510]">Checkout</h3>
                    <p className="text-[12px] text-[#1a1510]/40">{checkoutItem.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order summary */}
              <div className="bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl p-4 flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#1a1510]">
                  {checkoutItem.name}
                </span>
                <span className="text-[14px] font-semibold text-[#1a1510] tabular-nums">
                  ${checkoutItem.price}
                  {!checkoutItem.isTopUp && (
                    <span className="text-[11px] font-normal text-[#1a1510]/35">/mo</span>
                  )}
                </span>
              </div>

              {/* Payment method tabs — only for credit top-ups */}
              {checkoutItem.isTopUp && (
                <div className="flex gap-1 p-1 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl">
                  {(["card", "upi"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex-1 h-9 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all ${
                        paymentMethod === m
                          ? "bg-white text-[#1a1510] shadow-sm"
                          : "text-[#1a1510]/35 hover:text-[#1a1510]/60"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Payment form ── */}
              {!checkoutItem.isTopUp ? (

                /* Plan upgrade → Stripe Checkout redirect */
                <div className="space-y-5">
                  <div className="bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl p-4">
                    <p className="text-[12px] text-[#1a1510]/50 text-center leading-relaxed">
                      You'll be redirected to Stripe's secure checkout to complete
                      your subscription setup.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#1a1510]/[0.07] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#1a1510]">Total</span>
                      <div>
                        <span className="text-[20px] font-bold text-[#1a1510] tracking-tight tabular-nums">
                          ${checkoutItem.price}
                        </span>
                        <span className="text-[12px] font-medium text-[#1a1510]/35">/mo</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePlanUpgrade}
                      disabled={isProcessing}
                      className={`btn-shine w-full h-12 bg-[#1a1510] text-white rounded-none text-sm font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 ${
                        isProcessing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-brand-gold" />
                          Redirecting…
                        </>
                      ) : (
                        "Proceed to Stripe →"
                      )}
                    </button>
                  </div>
                </div>

              ) : paymentMethod === "card" ? (

                /* Credit top-up with card — Stripe Elements */
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    checkoutItem={checkoutItem}
                    onSuccess={(msg) => showToast(msg)}
                    onError={(msg) => showToast(msg)}
                    onClose={() => setShowCheckout(false)}
                    refreshData={loadBillingData}
                  />
                </Elements>

              ) : (

                /* UPI — coming soon */
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">
                      UPI ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="username@bank"
                        className="w-full h-12 bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl pl-4 pr-12 text-[13px] font-medium outline-none focus:border-[#b99b7b]/30 transition-all placeholder:text-[#1a1510]/20 shadow-sm"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20">
                        <UpiIcon size={16} />
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-[#1a1510]/30 uppercase tracking-widest">
                      Google Pay · PhonePe · Paytm
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#1a1510]/[0.07] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#1a1510]">Total</span>
                      <span className="text-[20px] font-bold text-[#1a1510] tracking-tight tabular-nums">
                        ${checkoutItem.price}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        showToast("UPI payments coming soon. Please use card for now.")
                      }
                      className="btn-shine w-full h-12 bg-[#1a1510] text-white rounded-none text-sm font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2"
                    >
                      Confirm Purchase
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafbfc] text-[#1a1510] font-sans selection:bg-[#b99b7b]/30">
      <CheckoutModal />

      {/* Header */}
      <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg flex items-center justify-center shrink-0">
            <CreditCard size={17} />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">
              Billing &amp; Usage
            </h2>
            <p className="text-[11px] font-medium text-[#1a1510]/40">
              Track spending and usage
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#f7f8f9]">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size={36} />
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-8">

            {/* Plans */}
            <div className="space-y-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1510] tracking-tight">
                  Plans
                </h2>
                <p className="text-[13px] text-[#1a1510]/45 mt-0.5">
                  Choose the plan that fits your go-to-market motion.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl p-6 flex flex-col border transition-all hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] ${
                      plan.isCurrent
                        ? "border-[#b99b7b]/50"
                        : "border-[#1a1510]/[0.07]"
                    }`}
                  >
                    {plan.isCurrent && (
                      <div className="absolute top-5 right-5 bg-[#b99b7b]/15 text-[#9a7d5c] px-2.5 py-1 text-[10px] font-medium rounded-md uppercase tracking-wide">
                        Current
                      </div>
                    )}
                    <div className="w-11 h-11 rounded-xl bg-[#1a1510] text-[#b99b7b] flex items-center justify-center mb-5">
                      {plan.name.toLowerCase().includes("starter") && <Zap size={20} />}
                      {plan.name.toLowerCase().includes("growth")  && <Rocket size={20} />}
                      {plan.name.toLowerCase().includes("pro")     && <Crown size={20} />}
                      {!["starter", "growth", "pro"].some((x) =>
                        plan.name.toLowerCase().includes(x)
                      ) && <Building2 size={20} />}
                    </div>
                    <h3 className="text-[17px] font-bold text-[#1a1510] tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-[12px] text-[#1a1510]/45 mt-1 min-h-[32px] leading-relaxed">
                      {plan.tagline}
                    </p>
                    <div className="mt-5 mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[2rem] font-bold tracking-tight text-[#1a1510] tabular-nums">
                          {plan.price === "Custom" ? "Custom" : `${plan.price}`}
                        </span>
                        {plan.price !== "Custom" && (
                          <span className="text-[12px] font-medium text-[#1a1510]/35">/mo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5 text-[#9a7d5c]">
                        <Sparkles size={13} />
                        <span className="text-[11px] font-medium">{plan.credits}</span>
                      </div>
                    </div>
                    <div className="h-px w-full bg-[#1a1510]/[0.06]" />
                    <ul className="flex-1 space-y-2.5 py-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check
                            size={14}
                            className="text-emerald-500 shrink-0 mt-0.5"
                            strokeWidth={2.5}
                          />
                          <span className="text-[12px] text-[#1a1510]/65 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={plan.isCurrent}
                      onClick={() =>
                        handleUpgrade(
                          plan.name + " Upgrade",
                          plan.price.replace("$", "")
                        )
                      }
                      className={`w-full h-11 rounded-none text-xs font-semibold transition-colors ${
                        plan.isCurrent
                          ? "bg-[#fafafa] border border-[#1a1510]/[0.07] text-[#1a1510]/35 cursor-default"
                          : plan.name.toLowerCase().includes("pro")
                          ? "btn-shine bg-[#1a1510] text-white hover:bg-[#2a2118]"
                          : "btn-shine btn-shine-dark border border-[#1a1510]/10 text-[#1a1510] hover:bg-[#1a1510]/[0.02]"
                      }`}
                    >
                      {plan.button_text}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current plan banner */}
            {subscription && (
              <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 flex items-center justify-between shadow-[0_1px_2px_rgba(26,21,16,0.04)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1a1510] text-[#b99b7b] flex items-center justify-center">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[17px] font-bold text-[#1a1510] tracking-tight">
                        {subscription.plan?.name} Plan
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-medium uppercase tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <p className="text-[13px] text-[#1a1510]/45 mt-1">
                      {subscription.plan?.price === 0
                        ? "Free trial"
                        : `$${subscription.plan?.price}/month`}{" "}
                      · {subscription.credits?.remaining_credits} credits remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Credit Balance",
                  val: subscription?.credits?.remaining_credits ?? 2000,
                  sub: "credits remaining",
                  note: "Replenishes monthly",
                  icon: TrendingUp,
                },
                {
                  label: "Total Usage",
                  val: subscription?.credits?.used_credits ?? 0,
                  sub: "credits consumed",
                  note: "Accumulated credit usage",
                  icon: Activity,
                },
                {
                  label: "Efficiency Score",
                  val: "87",
                  sub: "/ 100",
                  note: "Top 15% of outbound engines",
                  icon: BarChart3,
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider">
                      {m.label}
                    </span>
                    <m.icon
                      size={17}
                      strokeWidth={1.75}
                      className="text-[#1a1510]/25 group-hover:text-[#1a1510]/50 transition-colors"
                    />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[2rem] font-bold tracking-tight tabular-nums text-[#1a1510]">
                      {m.val}
                    </span>
                    <span className="text-[12px] font-medium text-[#1a1510]/35">{m.sub}</span>
                  </div>
                  <p className="text-[12px] font-medium text-[#1a1510]/40 mt-2">{m.note}</p>
                </div>
              ))}
            </div>

            {/* Usage overview */}
            <div className="space-y-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1510] tracking-tight">
                  Usage Overview
                </h2>
                <p className="text-[13px] text-[#1a1510]/45 mt-0.5">
                  Current billing period.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dynamicUsageStats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <span className="text-[11px] font-medium text-[#9a7d5c] flex items-center gap-0.5">
                        <ArrowUpRight size={12} />
                        {stat.growth}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[1.5rem] font-bold tracking-tight tabular-nums text-[#1a1510]">
                          {stat.current.toLocaleString()}
                        </span>
                        <span className="text-[12px] font-medium text-[#1a1510]/35">
                          of {stat.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#f7f8f9] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, (stat.current / (stat.max || 1)) * 100)}%`,
                          }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy credits banner */}
            <div className="bg-gradient-to-br from-[#1a1510] via-[#241d15] to-[#1a1510] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute -top-16 -right-10 w-56 h-56 bg-brand-gold/15 rounded-full blur-[90px]" />
              <div className="flex items-center gap-4 relative">
                <div className="w-11 h-11 bg-white/5 border border-white/10 text-[#b99b7b] rounded-xl flex items-center justify-center">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">
                    Buy additional credits
                  </h3>
                  <p className="text-[13px] text-white/45 mt-0.5">
                    Top up anytime to keep your campaigns running.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleUpgrade("Additional Credits Pack", "49.00", true)
                }
                className="btn-shine px-6 h-10 bg-[#b99b7b] text-[#1a1510] rounded-none text-xs font-semibold hover:bg-[#a98b6c] transition-colors relative shrink-0"
              >
                Buy Credits
              </button>
            </div>

            {/* Tool subscriptions */}
            <div className="space-y-4 pb-10">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1510] tracking-tight">
                  Tool Subscriptions
                </h2>
                <p className="text-[13px] text-[#1a1510]/45 mt-0.5">
                  Manage your connected stack billing.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toolSubscriptions.map((tool, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 group shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f7f8f9] flex items-center justify-center text-lg">
                          {tool.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-semibold text-[#1a1510]">
                              {tool.name}
                            </h4>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-medium rounded-md uppercase tracking-wide ${
                                tool.status === "Active"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-[#f7f8f9] text-[#1a1510]/40"
                              }`}
                            >
                              {tool.status}
                            </span>
                          </div>
                          <p className="text-[12px] font-medium text-[#1a1510]/40 mt-0.5">
                            {tool.plan} Plan
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-semibold text-[#1a1510] tabular-nums">
                          ${tool.price}
                          <span className="text-[11px] font-medium text-[#1a1510]/35">/mo</span>
                        </p>
                        <p className="text-[11px] font-medium text-[#1a1510]/35 mt-0.5">
                          Next: {tool.next}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-8 bg-[#1a1510] text-white p-4 rounded-xl shadow-2xl z-50 text-xs font-bold border border-white/10 max-w-xs"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
