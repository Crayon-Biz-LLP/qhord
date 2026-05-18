"use client";

import React, { useState, useEffect } from "react";
import {
  Zap, Crown, Building2, Check, LayoutDashboard, Search, Bell, Ghost, Sparkles, Rocket,
  TrendingUp, TrendingDown, Layers, Activity, CreditCard, ChevronRight, BarChart3, Target,
  RefreshCw, Smartphone, Monitor, Globe, Plus, AlertCircle, Info, MoveRight, ArrowUpRight, X,
  Smartphone as UpiIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCredits } from "@/contexts/CreditContext";
import { toast } from "sonner";

// Placeholder for GoldToggle since it's in Settings.tsx but we might want it here
const GoldToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`w-10 h-5 rounded-full relative transition-colors duration-200 outline-none ${
      enabled ? "bg-[#1a1510]" : "bg-[#1a1510]/10"
    }`}
  >
    <div
      className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-transform duration-200 ${
        enabled ? "translate-x-5 bg-[#b99b7b]" : "bg-white"
      }`}
    />
  </button>
);

export default function BillingPage() {
  const router = useRouter();
  const { userCredits, topUpCredits } = useCredits();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [checkoutItem, setCheckoutItem] = useState({ name: "Pro Upgrade", price: "799.00" });

  const plans = [
    {
      id: "starter",
      name: "Starter",
      tagline: "For individuals starting outbound",
      price: "149",
      credits: "2,500 credits/mo",
      features: ["Unified dashboard", "Basic campaign builder", "AI suggestions only", "Basic enrichment"],
      button_text: "Start Free Trial"
    },
    {
      id: "growth",
      name: "Growth",
      tagline: "For teams scaling outbound with AI",
      price: "349",
      credits: "8,000 credits/mo",
      features: ["Multi-channel campaigns", "Advanced workflows", "Full AI Operator", "Clay, Smartlead, HeyReach"],
      button_text: "Current Plan",
      isCurrent: true
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "High-scale AI-driven outbound",
      price: "799",
      credits: "20,000 credits/mo",
      features: ["Unlimited campaigns", "Autonomous AI mode", "Campaign DNA", "Predictive forecasting"],
      button_text: "Upgrade to Pro"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Complex GTM at scale",
      price: "Custom",
      credits: "Custom credits",
      features: ["Custom credits", "Dedicated infrastructure", "Custom integrations", "SLA-based support"],
      button_text: "Contact Sales"
    }
  ];

  const usageStats = [
    { label: "Credits Used", current: 2000 - userCredits, max: 2000, growth: "+0%", color: "#b99b7b" },
    { label: "Emails Sent", current: 12340, max: 25000, growth: "+8%", color: "#1a1510" },
    { label: "Enrichments", current: 892, max: 2000, growth: "+24%", color: "#b99b7b" },
    { label: "Active Campaigns", current: 5, max: 10, growth: "+2", color: "#1a1510" }
  ];

  const toolSubscriptions = [
    { name: "Apollo", plan: "Professional", price: "79", next: "Apr 1, 2026", status: "Active", icon: "🚀" },
    { name: "Clay", plan: "Explorer", price: "49", next: "Apr 1, 2026", status: "Active", icon: "🧱" },
    { name: "Smartlead", plan: "Pro", price: "39", next: "Apr 1, 2026", status: "Active", icon: "📧" },
    { name: "HeyReach", plan: "Inactive", price: "59", next: "-", status: "Inactive", icon: "🤝" }
  ];

  const handleUpgrade = (name: string, price: string) => {
    setCheckoutItem({ name, price });
    setShowCheckout(true);
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      // For demo purposes, we'll calculate added credits based on price
      // $1 = 100 credits
      const priceVal = parseFloat(checkoutItem.price);
      await topUpCredits(priceVal);
      setShowCheckout(false);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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
                <span className="text-[13px] font-bold text-[#1a1510]">${checkoutItem.price}/mo</span>
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
                      <RefreshCw size={16} className="animate-spin" />
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
         <div className="flex items-center gap-3 bg-[#fafbfc] border border-[#1a1510]/5 p-1 rounded-xl">
            <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white text-[#1a1510] rounded-lg shadow-sm border border-[#1a1510]/5 transition-all">Overview</button>
            <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40 hover:text-[#1a1510] transition-all">Invoices</button>
         </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
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
                     {plan.id === 'starter' && <Zap size={22} />}
                     {plan.id === 'growth' && <Rocket size={22} />}
                     {plan.id === 'pro' && <Crown size={22} />}
                     {plan.id === 'enterprise' && <Building2 size={22} />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1a1510] uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[11px] font-medium text-[#1a1510]/40 mt-1 min-h-[32px] leading-relaxed">{plan.tagline}</p>
                  
                  <div className="mt-6 mb-6">
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tighter text-[#1a1510]">{plan.price === 'Custom' ? 'Custom' : `$${plan.price}`}</span>
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
                     onClick={() => !plan.isCurrent && handleUpgrade(plan.name + " Upgrade", plan.price)}
                     className={`w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        plan.isCurrent 
                        ? 'bg-[#fafbfc] border border-[#1a1510]/5 text-[#1a1510]/30 cursor-default' 
                        : plan.id === 'pro' 
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
          <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-7 flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b99b7b]/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex items-center gap-6 relative">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#1a1510] text-[#b99b7b] flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <Rocket size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold uppercase tracking-tight">Growth Plan</h3>
                  <div className="px-3 py-1 bg-[#b99b7b]/10 text-[#b99b7b] text-[9px] font-black rounded-full uppercase tracking-widest">Active</div>
                </div>
                <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">
                  $349/month • 8,000 credits included • Next billing: Apr 1, 2026
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1510]/40 hover:text-[#b99b7b] transition-all relative">
              Manage Subscription <ChevronRight size={14} />
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Credit Forecast", val: "10", sub: "days remaining", note: "You'll run out around Mar 29", icon: <TrendingDown className="text-orange-400" /> },
              { label: "Efficiency Score", val: "87", sub: "/ 100", note: "Top 15% of teams on your plan", icon: <Activity className="text-[#b99b7b]" /> },
              { label: "Value Generated", val: "$127K", sub: "pipeline", note: "+34% vs last period", icon: <BarChart3 className="text-[#1a1510]" /> }
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
                  <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    {m.label === "Credit Forecast" && <AlertCircle size={10} className="text-orange-400" />}
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
              {usageStats.map((stat: any, i: number) => (
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
                        animate={{ width: `${(stat.current / stat.max) * 100}%` }}
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

          {/* Credit Breakdown */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Credit Breakdown</h2>
              <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Where your credits are being spent</p>
            </div>
            <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
              <div className="h-4 w-full flex rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-[#1a1510] transition-all" style={{ width: '41%' }} />
                <div className="h-full bg-[#b99b7b] transition-all" style={{ width: '27%' }} />
                <div className="h-full bg-orange-400 transition-all" style={{ width: '18%' }} />
                <div className="h-full bg-[#22c55e] transition-all" style={{ width: '14%' }} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: "Email sequences", val: "3,100 credits (41%)", color: "bg-[#1a1510]" },
                  { label: "Lead enrichment", val: "1,400 credits (27%)", color: "bg-[#b99b7b]" },
                  { label: "AI operations", val: "950 credits (18%)", color: "bg-orange-400" },
                  { label: "Data sync", val: "703 credits (14%)", color: "bg-[#22c55e]" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${item.color}`} />
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#1a1510] uppercase tracking-tight">{item.label}</p>
                      <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                onClick={() => handleUpgrade("Additional Credits", "49.00")}
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
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40 hover:text-[#1a1510] transition-all">
                <Plus size={14} /> Add New Tool
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {toolSubscriptions.map((tool: any, i: number) => (
                <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-7 space-y-6 shadow-sm hover:shadow-lg transition-all group">
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
                       <p className="text-[9px] font-bold text-[#1a1510]/20 uppercase tracking-widest mt-0.5">Next: {tool.next}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex-1 h-10 border border-[#1a1510]/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#1a1510]/40 hover:bg-[#fafbfc] hover:text-[#1a1510] transition-all">Manage</button>
                    {tool.status === 'Active' ? (
                      <button 
                        onClick={() => handleUpgrade(tool.name + " Upgrade", (parseInt(tool.price) + 50).toString())}
                        className="flex-1 h-10 bg-[#fafbfc] border border-[#1a1510]/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#1a1510] hover:border-[#b99b7b]/20 transition-all"
                      >
                        Upgrade
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpgrade(tool.name + " Subscription", tool.price)}
                        className="flex-1 h-10 bg-[#1a1510] text-[#b99b7b] rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
