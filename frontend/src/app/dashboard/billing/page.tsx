"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Zap, Crown, Building2, Check, LayoutDashboard, Search, Bell, Ghost, Sparkles, Rocket,
  TrendingUp, TrendingDown, Layers, Activity, CreditCard, ChevronRight, BarChart3, Target,
  RefreshCw, Smartphone, Monitor, Globe, Plus, AlertCircle, Info, MoveRight, ArrowUpRight, X,
  Smartphone as UpiIcon, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";

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

export default function BillingPage() {
  const router = useRouter();
  
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [checkoutItem, setCheckoutItem] = useState({ name: "Pro Upgrade", price: "799.00", isTopUp: false });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // 1. Fetch plans
      const plansRes = await api.get("/plans");
      const loadedPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
      
      // 2. Fetch subscription status
      const statusRes = await api.get("/subscription/status");
      const subInfo = statusRes.data?.subscription || null;
      setSubscription(subInfo);

      // 3. Fetch usage stats
      const statsRes = await api.get("/subscription/usage-stats");
      setUsageStats(statsRes.data?.stats || null);

      const mappedPlans: PlanItem[] = loadedPlans.map((p: any) => {
        const isCurrent = subInfo?.plan?.name?.toLowerCase() === p.name?.toLowerCase();
        return {
          id: p.id,
          name: p.name,
          tagline: p.tagline || "",
          price: p.price || "0",
          credits: `${p.credits || "0"} credits/mo`,
          features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]"),
          is_custom: p.is_custom || false,
          button_text: isCurrent ? "Current Plan" : p.button_text || "Upgrade",
          isCurrent
        };
      });
      setPlans(mappedPlans);
    } catch (err) {
      console.error("Failed to load billing / subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleUpgrade = (name: string, price: string, isTopUp = false) => {
    setCheckoutItem({ name, price, isTopUp });
    setShowCheckout(true);
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      if (checkoutItem.isTopUp) {
        // Top up credits
        // Map price to credits: $49.00 -> 5000 credits
        const amount = checkoutItem.price === "49.00" ? 5000 : 10000;
        const res = await api.post("/subscription/top-up", { amount });
        if (res.data.success) {
          showToast(`Successfully purchased ${amount} credits!`);
          await loadBillingData();
        }
      } else {
        // Upgrade plan
        const planName = checkoutItem.name.split(" ")[0].toLowerCase(); // e.g. "pro"
        const res = await api.post("/subscription/upgrade", { plan: planName });
        if (res.data.success) {
          showToast(`Successfully upgraded to ${checkoutItem.name}!`);
          await loadBillingData();
        }
      }
      setShowCheckout(false);
    } catch (error) {
      console.error("Transaction failure:", error);
      showToast("Payment failed. Please verify API configuration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const dynamicUsageStats = useMemo(() => {
    const totalCredits = subscription?.credits?.total_credits || 2000;
    const remainingCredits = subscription?.credits?.remaining_credits ?? 2000;
    const usedCredits = subscription?.credits?.used_credits ?? 0;
    const campaignsCount = usageStats?.campaigns_run ?? 0;

    return [
      { label: "Credits Used", current: usedCredits, max: totalCredits, growth: "+0%", color: "#b99b7b" },
      { label: "Remaining Balance", current: remainingCredits, max: totalCredits, growth: "Active", color: "#1a1510" },
      { label: "AI executions", current: usedCredits * 2, max: totalCredits * 2, growth: "+12%", color: "#b99b7b" },
      { label: "Active Campaigns", current: campaignsCount, max: 10, growth: `+${campaignsCount}`, color: "#1a1510" }
    ];
  }, [subscription, usageStats]);

  const toolSubscriptions = [
    { name: "Apollo", plan: "Professional", price: "79", next: "Apr 1, 2026", status: "Active", icon: "🚀" },
    { name: "Clay", plan: "Explorer", price: "49", next: "Apr 1, 2026", status: "Active", icon: "🧱" },
    { name: "Smartlead", plan: "Pro", price: "39", next: "Apr 1, 2026", status: "Active", icon: "📧" },
    { name: "HeyReach", plan: "Inactive", price: "59", next: "-", status: "Inactive", icon: "🤝" }
  ];

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
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-[#1a1510]/5"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-[#b99b7b] rounded-xl shadow-lg">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1a1510] uppercase tracking-[0.2em]">Checkout</h3>
                    <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">Complete your purchase for {checkoutItem.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-[#fafbfc] rounded-full transition-colors text-[#1a1510]/20 hover:text-[#1a1510]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-[#fafbfc] border border-[#1a1510]/5 rounded-2xl p-5 flex items-center justify-between shadow-inner">
                <span className="text-[13px] font-bold text-[#1a1510]">{checkoutItem.name}</span>
                <span className="text-[13px] font-bold text-[#1a1510]">${checkoutItem.price}</span>
              </div>

              <div className="flex p-1 bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-white text-[#1a1510] shadow-sm border border-[#1a1510]/5' : 'text-[#1a1510]/30 hover:text-[#1a1510]'}`}
                >
                  Card
                </button>
                <button 
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${paymentMethod === 'upi' ? 'bg-white text-[#1a1510] shadow-sm border border-[#1a1510]/5' : 'text-[#1a1510]/30 hover:text-[#1a1510]'}`}
                >
                  UPI
                </button>
              </div>

              <div className="space-y-5">
                {paymentMethod === 'card' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4242 4242 4242 4242"
                        className="w-full h-12 bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-[#b99b7b]/30 transition-all placeholder:text-[#1a1510]/20 shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Expiry</label>
                        <input 
                          type="text" 
                          placeholder="MM / YY"
                          className="w-full h-12 bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-[#b99b7b]/30 transition-all placeholder:text-[#1a1510]/20 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">CVC</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          className="w-full h-12 bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-[#b99b7b]/30 transition-all placeholder:text-[#1a1510]/20 shadow-sm"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">UPI ID</label>
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
                    <p className="text-[9px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-1">Pay using Google Pay, PhonePe, or Paytm</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#1a1510]/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1a1510] uppercase tracking-tight">Total</span>
                  <span className="text-[18px] font-black text-[#1a1510] tracking-tighter">${checkoutItem.price}</span>
                </div>
                <button 
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className={`w-full h-12 bg-[#1a1510] text-[#b99b7b] rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-brand-gold" />
                      Processing...
                    </>
                  ) : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafbfc] text-[#1a1510] font-sans selection:bg-[#b99b7b]/30">
      <CheckoutModal />
      
      {/* Header */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
         <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#1a1510] text-[#b99b7b] rounded-2xl shadow-lg shrink-0">
               <CreditCard size={20} />
            </div>
            <div className="hidden sm:block">
               <h2 className="text-[12px] font-black tracking-[0.2em] text-[#1a1510] uppercase">Billing & Usage</h2>
               <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">
                  Track spending, forecast usage, and optimize efficiency
               </p>
            </div>
         </div>
         <div className="flex items-center gap-3">
           <button 
             onClick={() => router.push('/dashboard')}
             className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
           >
             <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
           </button>
         </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-brand-gold" size={32} />
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 space-y-12">
            
            {/* Plans Section */}
            <div className="space-y-8">
              <div className="space-y-1">
                 <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Plans</h2>
                 <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest leading-relaxed">Choose the plan that fits your GTM motion</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan: any) => (
                  <div 
                    key={plan.id} 
                    className={`relative bg-white rounded-[2rem] p-7 flex flex-col border transition-all hover:shadow-xl hover:shadow-black/5 ${plan.isCurrent ? 'border-[#b99b7b] shadow-lg shadow-[#b99b7b]/10' : 'border-[#1a1510]/5 shadow-sm'}`}
                  >
                    {plan.isCurrent && (
                      <div className="absolute top-6 right-6 bg-[#b99b7b] text-[#1a1510] px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest">
                         Current
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-2xl bg-[#1a1510] text-[#b99b7b] flex items-center justify-center mb-6 shadow-inner">
                       {plan.name.toLowerCase().includes('starter') && <Zap size={22} />}
                       {plan.name.toLowerCase().includes('growth') && <Rocket size={22} />}
                       {plan.name.toLowerCase().includes('pro') && <Crown size={22} />}
                       {!['starter', 'growth', 'pro'].some(x => plan.name.toLowerCase().includes(x)) && <Building2 size={22} />}
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#1a1510] uppercase tracking-tight">{plan.name}</h3>
                    <p className="text-[11px] font-medium text-[#1a1510]/40 mt-1 min-h-[32px] leading-relaxed">{plan.tagline}</p>
                    
                    <div className="mt-6 mb-6">
                       <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tighter text-[#1a1510]">{plan.price === 'Custom' ? 'Custom' : `${plan.price}`}</span>
                          {plan.price !== 'Custom' && <span className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">/mo</span>}
                       </div>
                       <div className="flex items-center gap-2 mt-3 text-[#b99b7b]">
                         <Sparkles size={14} />
                         <span className="text-[10px] font-bold uppercase tracking-wider">{plan.credits}</span>
                       </div>
                    </div>

                    <div className="h-px w-full bg-[#1a1510]/5 my-2" />

                    <ul className="flex-1 space-y-4 py-5">
                      {plan.features.map((feature: string, i: number) => (
                         <li key={i} className="flex items-start gap-3">
                            <Check size={14} className="text-[#b99b7b] shrink-0 mt-0.5" strokeWidth={3} />
                            <span className="text-[11px] font-bold text-[#1a1510]/70 uppercase tracking-tight leading-relaxed">{feature}</span>
                         </li>
                      ))}
                    </ul>

                    <button 
                       disabled={plan.isCurrent}
                       onClick={() => handleUpgrade(plan.name + " Upgrade", plan.price.replace("$", ""))}
                       className={`w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          plan.isCurrent 
                          ? 'bg-[#fafbfc] border border-[#1a1510]/5 text-[#1a1510]/30 cursor-default' 
                          : plan.name.toLowerCase().includes('pro') 
                            ? 'bg-[#1a1510] text-[#b99b7b] shadow-lg shadow-black/20 hover:-translate-y-0.5' 
                            : 'border border-[#1a1510]/10 text-[#1a1510] hover:bg-[#fafbfc]'
                       }`}
                    >
                       {plan.button_text}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Plan Banner */}
            {subscription && (
              <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-7 flex items-center justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#b99b7b]/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="flex items-center gap-6 relative">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#1a1510] text-[#b99b7b] flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                    <Rocket size={32} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold uppercase tracking-tight">{subscription.plan?.name} Plan</h3>
                      <div className="px-3 py-1 bg-[#b99b7b]/10 text-[#b99b7b] text-[9px] font-black rounded-full uppercase tracking-widest">Active</div>
                    </div>
                    <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">
                       {subscription.plan?.price === 0 ? "Free Trial" : `$${subscription.plan?.price}/month`} • {subscription.credits?.remaining_credits} credits remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Credit Balance", val: subscription?.credits?.remaining_credits ?? 2000, sub: "credits remaining", note: "Replenishes monthly", icon: <TrendingUp className="text-[#b99b7b]" /> },
                { label: "Total Usage", val: subscription?.credits?.used_credits ?? 0, sub: "credits consumed", note: "Accumulated credit usage", icon: <Activity className="text-[#1a1510]" /> },
                { label: "Efficiency Score", val: "87", sub: "/ 100", note: "Top 15% of outbound engines", icon: <BarChart3 className="text-[#1a1510]" /> }
              ].map((m, i) => (
                <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-7 space-y-4 shadow-sm hover:-translate-y-1 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-[0.2em]">{m.label}</span>
                    {m.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tighter">{m.val}</span>
                      <span className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{m.sub}</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-1 flex items-center gap-1.5 font-sans">
                      {m.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Usage Overview */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Usage Overview</h2>
                <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Current billing period</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dynamicUsageStats.map((stat: any, i: number) => (
                  <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-7 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-[10px] font-bold text-[#b99b7b] flex items-center gap-1">
                        <ArrowUpRight size={12} /> {stat.growth}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold tracking-tight">{stat.current.toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-[#1a1510]/20">of {stat.max.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#fafbfc] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (stat.current / (stat.max || 1)) * 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Credits Banner */}
            <div className="bg-[#1a1510] rounded-[2rem] p-7 flex items-center justify-between shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[#b99b7b]/5 pointer-events-none" />
               <div className="flex items-center gap-4 relative">
                  <div className="p-3 bg-[#b99b7b]/10 text-[#b99b7b] rounded-2xl rotate-12">
                     <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="space-y-0.5">
                     <h3 className="text-[13px] font-bold text-white uppercase tracking-widest">Buy Additional Credits</h3>
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Top up your credits anytime to maintain outbound velocity</p>
                  </div>
               </div>
               <button 
                  onClick={() => handleUpgrade("Additional Credits Pack", "49.00", true)}
                  className="px-6 h-10 bg-[#b99b7b] text-[#1a1510] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:-translate-y-0.5 transition-all relative"
               >
                  Buy Credits
               </button>
            </div>

            {/* Tool Subscriptions */}
            <div className="space-y-6 pb-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Tool Subscriptions</h2>
                  <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Manage your connected stack billing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {toolSubscriptions.map((tool: any, i: number) => (
                  <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-7 space-y-6 shadow-sm group hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl grayscale group-hover:grayscale-0 transition-all">{tool.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-bold">{tool.name}</h4>
                            <span className={`px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-widest ${tool.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-[#1a1510]/5 text-[#1a1510]/40'}`}>
                              {tool.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">{tool.plan} Plan</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[14px] font-bold text-[#1a1510]">${tool.price}<span className="text-[10px] text-[#1a1510]/30">/mo</span></p>
                         <p className="text-[9px] font-bold text-[#1a1510]/20 uppercase tracking-widest mt-0.5">Next billing: {tool.next}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-8 bg-[#1a1510] text-white p-4 rounded-xl shadow-2xl z-50 text-xs font-bold border border-white/10">
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
