"use client";

import React, { useState, useEffect } from "react";
import {
  Zap, Sparkles, Crown, Building2, Check, Minus, ArrowRight,
  Coins, Users, Mail, Target, Bot, ShieldCheck, Globe, Database,
  Key, Settings, Headphones, ChevronDown, X, Star, Rocket,
  TrendingUp, Shield, Cpu, LayoutDashboard, CreditCard, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";

interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  price: string;
  credits: string;
  features: string[];
  is_custom: boolean;
  button_text: string;
  icon: any;
  popular: boolean;
  ctaStyle: "primary" | "outline";
  accentColor: string;
  accentBg: string;
}

const mapPlanIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("starter")) return Zap;
  if (n.includes("growth")) return Rocket;
  if (n.includes("pro")) return Crown;
  return Sparkles;
};

const COMPARISON_FEATURES = [
  { feature: "Credits / month", starter: "2,500", growth: "8,000", pro: "20,000" },
  { feature: "Users", starter: "1–2", growth: "Up to 10", pro: "Unlimited" },
  { feature: "AI Operator", starter: "Suggest", growth: "Approve", pro: "Auto" },
  { feature: "Multi-channel", starter: null, growth: true, pro: true },
  { feature: "Forecasting", starter: null, growth: null, pro: true },
];

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/plans");
      // The API returns the sorted plans array directly
      if (Array.isArray(res.data)) {
        const mapped = res.data.map((p: any) => {
          const name = p.name || "";
          return {
            id: p.id,
            name: p.name,
            tagline: p.tagline || "",
            price: p.price || "$0",
            credits: p.credits || "0",
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]"),
            is_custom: p.is_custom || false,
            button_text: p.button_text || "Choose Plan",
            icon: mapPlanIcon(name),
            popular: name.toLowerCase() === "growth",
            ctaStyle: name.toLowerCase() === "growth" ? ("primary" as const) : ("outline" as const),
            accentColor: name.toLowerCase() === "starter" ? "text-slate-500" : name.toLowerCase() === "growth" ? "text-blue-600" : "text-amber-600",
            accentBg: name.toLowerCase() === "starter" ? "bg-slate-50" : name.toLowerCase() === "growth" ? "bg-blue-50" : "bg-amber-50"
          };
        });
        setPlans(mapped);
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPlan = async (plan: PlanItem) => {
    try {
      const level = plan.name.toLowerCase();
      const res = await api.post("/subscription/upgrade", { plan: level });
      if (res.data.success) {
        showToast(`Successfully upgraded to ${plan.name}! Transaction ID: ${res.data.transaction_id}`);
      } else {
        showToast(`Failed to upgrade to ${plan.name}`);
      }
    } catch (err) {
      console.error("Upgrade request error:", err);
      showToast("Upgrade failed. Please check backend integration.");
    }
  };

  const renderCellValue = (val: string | boolean | null) => {
    if (val === true) return <Check size={14} className="text-emerald-500" strokeWidth={3} />;
    if (val === null) return <Minus size={14} className="text-[#1a1510]/10" />;
    return <span className="text-[12px] font-bold text-[#1a1510]/70">{val}</span>;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white text-[#1a1510] font-sans selection:bg-brand-gold/30">
      
      {/* 1. Header Navigation */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Pricing</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
               Fuel your GTM Engine
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

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16">
          
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
              Scale Outbound with AI<br className="hidden sm:block" /> Precision
            </motion.h1>
            
            <div className="flex items-center justify-center gap-4">
              <div className="relative bg-[#f0f1f3] rounded-full p-1 flex items-center">
                <button onClick={() => setIsAnnual(false)} className={`relative z-10 px-5 sm:px-7 py-2 rounded-full text-[11px] font-bold transition-all ${!isAnnual ? "bg-white text-[#1a1510] shadow-sm" : "text-[#1a1510]/40"}`}>Monthly</button>
                <button onClick={() => setIsAnnual(true)} className={`relative z-10 px-5 sm:px-7 py-2 rounded-full text-[11px] font-bold transition-all ${isAnnual ? "bg-white text-[#1a1510] shadow-sm" : "text-[#1a1510]/40"}`}>Annual</button>
              </div>
              {isAnnual && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Save 20%</span>}
            </div>
          </div>

          {/* Pricing Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader size={36} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => {
                // Calculate annual discount price if price is numeric (e.g. $149)
                let displayPrice = plan.price;
                if (isAnnual && plan.price.startsWith("$")) {
                  const num = parseInt(plan.price.replace("$", ""), 10);
                  if (!isNaN(num)) {
                    displayPrice = `$${Math.round(num * 0.8)}`;
                  }
                }

                return (
                  <motion.div 
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative bg-white rounded-[2.5rem] p-6 lg:p-8 border-2 transition-all group ${plan.popular ? "border-blue-500 shadow-xl" : "border-[#1a1510]/5 hover:border-[#1a1510]/10"}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    )}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl ${plan.accentBg} flex items-center justify-center ${plan.accentColor}`}>
                          <plan.icon size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg lg:text-xl font-black tracking-tight">{plan.name}</h3>
                          <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest leading-none mt-1">{plan.tagline}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl lg:text-4xl font-black">{displayPrice}</span>
                          <span className="text-[12px] font-bold text-[#1a1510]/30">/mo</span>
                        </div>
                        <p className="text-[11px] font-bold text-[#1a1510]/30 italic">{plan.credits} credits included</p>
                      </div>

                      <div className="h-px bg-[#1a1510]/5" />

                      <ul className="space-y-3">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-[12px] font-medium text-[#1a1510]/70">
                            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.ctaStyle === 'primary' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-[#f7f8f9] text-[#1a1510] hover:bg-[#1a1510] hover:text-white'}`}
                      >
                        {plan.button_text}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Comparison Table */}
          <div className="space-y-6 hidden sm:block">
            <h2 className="text-xl font-black uppercase tracking-widest text-[#1a1510]/20 text-center">Detailed Comparison</h2>
            <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 bg-[#f7f8f9]/50 border-b border-[#1a1510]/5">
                  <div className="p-6 text-[10px] font-black uppercase tracking-widest text-[#1a1510]/30">Feature</div>
                  <div className="p-6 text-center text-[11px] font-black uppercase tracking-widest">Starter</div>
                  <div className="p-6 text-center text-[11px] font-black uppercase tracking-widest bg-blue-50/30">Growth</div>
                  <div className="p-6 text-center text-[11px] font-black uppercase tracking-widest">Pro</div>
                </div>
                {COMPARISON_FEATURES.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 border-b border-[#1a1510]/5 last:border-b-0 hover:bg-[#f7f8f9]/30 transition-colors">
                    <div className="p-5 px-6 text-[12px] font-bold text-[#1a1510]/50">{row.feature}</div>
                    <div className="p-5 flex justify-center">{renderCellValue(row.starter)}</div>
                    <div className="p-5 flex justify-center bg-blue-50/10 font-black">{renderCellValue(row.growth)}</div>
                    <div className="p-5 flex justify-center">{renderCellValue(row.pro)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>

      {/* Buy Credits CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-y-1/2 z-40 bg-[#1a1510] text-brand-gold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-brand-gold/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Coins size={16} />
          <span className="text-[11px] font-black uppercase tracking-widest">Need more power?</span>
        </div>
        <button onClick={() => showToast("Buy credits initiated")} className="bg-brand-gold text-[#1a1510] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Buy Credits</button>
      </div>

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
