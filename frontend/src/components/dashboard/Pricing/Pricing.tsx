"use client";

import React, { useState } from "react";
import {
  Zap, Sparkles, Crown, Building2, Check, Minus, ArrowRight,
  Coins, Users, Mail, Target, Bot, ShieldCheck, Globe, Database,
  Key, Settings, Headphones, ChevronDown, X, Star, Rocket,
  TrendingUp, Shield, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ───────── DATA LAYER ───────── */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individuals starting outbound",
    icon: Zap,
    monthlyPrice: 149,
    annualPrice: 119,
    credits: "2,500",
    popular: false,
    cta: "Start Free Trial",
    ctaStyle: "outline" as const,
    gradient: "from-slate-50 to-gray-50",
    accentColor: "text-slate-500",
    accentBg: "bg-slate-50",
    platform: [
      "Unified dashboard",
      "Basic campaign builder (email + LinkedIn)",
      "Personal notes & tasks",
    ],
    ai: [
      "AI suggestions only",
      "Manual approval required",
    ],
    integrations: [
      "Basic enrichment",
      "Limited workflow templates",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For teams scaling outbound with AI",
    icon: Rocket,
    monthlyPrice: 349,
    annualPrice: 279,
    credits: "8,000",
    popular: true,
    cta: "Upgrade to Growth",
    ctaStyle: "primary" as const,
    gradient: "from-blue-50 to-indigo-50",
    accentColor: "text-blue-600",
    accentBg: "bg-blue-50",
    platform: [
      "Multi-channel campaigns",
      "Advanced workflows",
      "Campaign health + risk detection",
    ],
    ai: [
      "Full AI Operator (suggest + approve)",
      "AI sequence optimization",
      "Lead intelligence + research",
    ],
    integrations: [
      "Clay, Smartlead, HeyReach, Zapier",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "High-scale AI-driven outbound",
    icon: Crown,
    monthlyPrice: 799,
    annualPrice: 639,
    credits: "20,000",
    popular: false,
    cta: "Upgrade to Pro",
    ctaStyle: "outline" as const,
    gradient: "from-amber-50 to-orange-50",
    accentColor: "text-amber-600",
    accentBg: "bg-amber-50",
    platform: [
      "Unlimited campaigns",
      "Team collaboration + permissions",
      "Priority processing",
    ],
    ai: [
      "Autonomous AI mode",
      "Campaign DNA (pattern learning)",
      "Predictive forecasting",
    ],
    integrations: [
      "Advanced orchestration",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Complex GTM at scale",
    icon: Building2,
    monthlyPrice: null,
    annualPrice: null,
    credits: "Custom",
    popular: false,
    cta: "Contact Sales",
    ctaStyle: "outline" as const,
    gradient: "from-purple-50 to-violet-50",
    accentColor: "text-purple-600",
    accentBg: "bg-purple-50",
    platform: [
      "Custom or unlimited credits",
      "Dedicated infrastructure + SLAs",
      "Advanced governance",
    ],
    ai: [] as string[],
    integrations: [
      "Custom integrations",
      "Dedicated onboarding",
    ],
  },
];

const CREDIT_STATS = [
  { icon: Users, credits: "100", result: "50 enriched leads", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Mail, credits: "500", result: "1,000 personalized emails", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Target, credits: "1000", result: "Full outbound campaign", color: "text-purple-500", bg: "bg-purple-50" },
];

const COMPARISON_FEATURES = [
  { feature: "Credits / month", starter: "2,500", growth: "8,000", pro: "20,000", enterprise: "Custom" },
  { feature: "Users", starter: "1–2", growth: "Up to 10", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Campaigns", starter: "3", growth: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI Operator", starter: "Suggestions only", growth: "Suggest + approve", pro: "Auto-execute safe", enterprise: "Full autonomous" },
  { feature: "Multi-channel sequences", starter: null, growth: true, pro: true, enterprise: true },
  { feature: "Campaign DNA", starter: null, growth: null, pro: true, enterprise: true },
  { feature: "Forecasting", starter: null, growth: null, pro: true, enterprise: true },
  { feature: "Workflow Automation", starter: "Basic", growth: "Advanced", pro: "Advanced", enterprise: "Custom" },
  { feature: "Permissions & Roles", starter: null, growth: null, pro: true, enterprise: true },
  { feature: "SSO", starter: null, growth: null, pro: null, enterprise: true },
  { feature: "API Access", starter: null, growth: null, pro: null, enterprise: true },
  { feature: "Support", starter: "Standard", growth: "Priority", pro: "Priority", enterprise: "SLA-based" },
];

/* ───────── COMPONENT ───────── */
export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderCellValue = (val: string | boolean | null) => {
    if (val === true) return (
      <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
        <Check size={14} className="text-emerald-500" strokeWidth={3} />
      </div>
    );
    if (val === null) return <Minus size={14} className="text-[#1a1510]/10" />;
    return <span className="text-[13px] font-bold text-[#1a1510]/70">{val}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white relative font-sans scrollbar-hide">

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative z-10 pt-20 pb-16 text-center max-w-6xl mx-auto px-8">
        {/* Soft gradient orbs for visual depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-50/60 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          {/* Chip */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
              <Star size={12} fill="currentColor" /> Transparent pricing
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[48px] font-black text-[#1a1510] tracking-[-0.03em] leading-[1.05]"
          >
            Run your GTM with AI —<br /> not manual effort
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] text-[#1a1510]/35 font-medium max-w-md mx-auto"
          >
            Credits power real actions. Insights are always free.
          </motion.p>

          {/* Monthly / Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-2"
          >
            <div className="relative bg-[#f0f1f3] rounded-full p-1 flex items-center gap-0.5">
              <div
                className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-2px)] bg-white rounded-full shadow-md transition-transform duration-300 ease-out"
                style={{ transform: isAnnual ? "translateX(100%)" : "translateX(0)" }}
              />
              <button
                onClick={() => setIsAnnual(false)}
                className={`relative z-10 px-7 py-3 rounded-full text-[12px] font-bold transition-colors duration-300 ${
                  !isAnnual ? "text-[#1a1510]" : "text-[#1a1510]/40"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative z-10 px-7 py-3 rounded-full text-[12px] font-bold transition-colors duration-300 ${
                  isAnnual ? "text-[#1a1510]" : "text-[#1a1510]/40"
                }`}
              >
                Annual
              </button>
            </div>
            <AnimatePresence>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                  className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest rounded-full border border-emerald-100"
                >
                  Save 20%
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Credits Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6 space-y-5"
          >
            <div className="flex items-center justify-center gap-2.5 text-[14px] font-black text-[#1a1510]">
              <div className="w-7 h-7 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <Coins size={14} className="text-brand-gold" />
              </div>
              <span>1 credit = real GTM work executed</span>
            </div>
            <div className="flex justify-center gap-3">
              {CREDIT_STATS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 bg-[#fafbfc] border border-[#1a1510]/5 rounded-full hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center`}>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <span className="text-[12px] font-bold text-[#1a1510]/50">
                    <strong className="text-[#1a1510] font-black">{s.credits}</strong> credits = {s.result}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PRICING CARDS ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.6 }}
                className={`relative bg-white rounded-3xl flex flex-col transition-all duration-300 group ${
                  plan.popular
                    ? "border-2 border-blue-500 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/20"
                    : "border border-[#e5e7eb] hover:border-[#d1d5db] shadow-sm hover:shadow-lg"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-5 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-blue-600/30 flex items-center gap-1.5">
                      <Star size={10} fill="white" /> Most Popular
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-7 pb-0 flex-1 flex flex-col">
                  {/* Icon + Plan Name Row */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${plan.accentBg} flex items-center justify-center ${plan.accentColor} shrink-0`}>
                      <plan.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-[20px] font-black text-[#1a1510] tracking-tight leading-none">{plan.name}</h3>
                      <p className="text-[11px] text-[#1a1510]/35 font-medium">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="mb-6">
                    {price ? (
                      <div className="flex items-baseline gap-1.5">
                        <motion.span
                          key={price}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[40px] font-black text-[#1a1510] tracking-tighter leading-none"
                        >
                          ${price}
                        </motion.span>
                        <span className="text-[13px] font-bold text-[#1a1510]/25">/mo</span>
                      </div>
                    ) : (
                      <span className="text-[40px] font-black text-[#1a1510] tracking-tighter leading-none">Custom</span>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Sparkles size={13} className="text-brand-gold" />
                      <span className="text-[12px] font-bold text-[#1a1510]/35">{plan.credits} credits/mo</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[#1a1510]/5 mb-6" />

                  {/* Feature Groups */}
                  <div className="flex-1 space-y-5 mb-7">
                    {plan.platform.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/20 mb-3">PLATFORM</p>
                        <ul className="space-y-2.5">
                          {plan.platform.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center mt-0.5 shrink-0">
                                <Check size={11} className="text-emerald-500" strokeWidth={3} />
                              </div>
                              <span className="text-[13px] font-medium text-[#1a1510]/65 leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.ai.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/20 mb-3">AI</p>
                        <ul className="space-y-2.5">
                          {plan.ai.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center mt-0.5 shrink-0">
                                <Check size={11} className="text-emerald-500" strokeWidth={3} />
                              </div>
                              <span className="text-[13px] font-medium text-[#1a1510]/65 leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.integrations.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/20 mb-3">
                          {plan.id === 'enterprise' ? 'SUPPORT' : 'INTEGRATIONS'}
                        </p>
                        <ul className="space-y-2.5">
                          {plan.integrations.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center mt-0.5 shrink-0">
                                <Check size={11} className="text-emerald-500" strokeWidth={3} />
                              </div>
                              <span className="text-[13px] font-medium text-[#1a1510]/65 leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button - pinned to bottom */}
                <div className="p-7 pt-0">
                  <button
                    onClick={() => showToast(`${plan.name} plan selected! Redirecting...`)}
                    className={`w-full h-[52px] rounded-xl text-[12px] font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all duration-200 ${
                      plan.ctaStyle === "primary"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                        : "bg-[#f7f8f9] border border-[#e5e7eb] text-[#1a1510] hover:bg-[#1a1510] hover:text-white hover:border-[#1a1510]"
                    }`}
                  >
                    {plan.cta} <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ NEED MORE CREDITS? ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-20">
        <div className="bg-gradient-to-r from-[#fafbfc] to-[#f5f6f8] border border-[#e5e7eb] rounded-2xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <Coins size={24} />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[#1a1510] tracking-tight mb-0.5">Need more credits?</h3>
              <p className="text-[13px] text-[#1a1510]/40 font-medium">Buy additional credits anytime — volume discounts available</p>
            </div>
          </div>
          <button
            onClick={() => setShowBuyCredits(true)}
            className="flex items-center gap-2.5 px-7 h-12 bg-[#1a1510] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:-translate-y-0.5 shadow-lg shadow-[#1a1510]/10 transition-all"
          >
            <Coins size={16} /> Buy Credits
          </button>
        </div>
      </section>

      {/* ═══════════ FEATURE COMPARISON TABLE ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-[26px] font-black text-[#1a1510] tracking-tight">Feature Comparison</h2>
          <p className="text-[12px] font-medium text-[#1a1510]/30">Compare all plans side by side</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-[#fafbfc] border-b border-[#e5e7eb]">
            <div className="grid grid-cols-5">
              <div className="px-7 py-5 text-[11px] font-black text-[#1a1510]/30 uppercase tracking-[0.15em] flex items-center">Feature</div>
              <div className="px-4 py-5 text-center text-[13px] font-bold text-[#1a1510]/70">Starter</div>
              <div className="px-4 py-5 text-center bg-blue-50/50 border-x border-blue-100/50">
                <span className="text-[13px] font-bold text-[#1a1510]">Growth</span>
                <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full align-middle">Popular</span>
              </div>
              <div className="px-4 py-5 text-center text-[13px] font-bold text-[#1a1510]/70">Pro</div>
              <div className="px-4 py-5 text-center text-[13px] font-bold text-[#1a1510]/70">Enterprise</div>
            </div>
          </div>

          {/* Rows */}
          {COMPARISON_FEATURES.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-5 border-b border-[#f0f1f3] last:border-b-0 group hover:bg-blue-50/20 transition-colors`}
            >
              <div className="px-7 py-4 text-[13px] font-semibold text-[#1a1510]/55 flex items-center">{row.feature}</div>
              <div className={`px-4 py-4 flex justify-center items-center ${i % 2 !== 0 ? "bg-[#fafbfc]/50" : ""}`}>{renderCellValue(row.starter)}</div>
              <div className={`px-4 py-4 flex justify-center items-center bg-blue-50/20 border-x border-blue-50 font-bold`}>{renderCellValue(row.growth)}</div>
              <div className={`px-4 py-4 flex justify-center items-center ${i % 2 !== 0 ? "bg-[#fafbfc]/50" : ""}`}>{renderCellValue(row.pro)}</div>
              <div className={`px-4 py-4 flex justify-center items-center ${i % 2 !== 0 ? "bg-[#fafbfc]/50" : ""}`}>{renderCellValue(row.enterprise)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ BUY CREDITS MODAL ═══════════ */}
      <AnimatePresence>
        {showBuyCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setShowBuyCredits(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-[480px] bg-white border border-[#e5e7eb] rounded-3xl p-8 shadow-2xl space-y-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowBuyCredits(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f0f1f3] transition-all"
              >
                <X size={16} />
              </button>

              <div className="space-y-1.5">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-4">
                  <Coins size={24} />
                </div>
                <h3 className="text-[22px] font-black text-[#1a1510] tracking-tight">Buy Credits</h3>
                <p className="text-[13px] text-[#1a1510]/40 font-medium">Top up your account with additional GTM credits</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { amount: "1,000", price: "$49", discount: null },
                  { amount: "5,000", price: "$199", discount: "Save 19%" },
                  { amount: "15,000", price: "$499", discount: "Save 32%" },
                  { amount: "50,000", price: "$1,299", discount: "Save 47%" },
                ].map((tier, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      showToast(`${tier.amount} credits purchased for ${tier.price}!`);
                      setShowBuyCredits(false);
                    }}
                    className="w-full flex items-center justify-between px-5 py-4 bg-[#fafbfc] hover:bg-brand-gold/5 border border-[#e5e7eb] hover:border-brand-gold/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                        <Sparkles size={16} className="text-brand-gold" />
                      </div>
                      <span className="text-[14px] font-black text-[#1a1510]">{tier.amount} credits</span>
                      {tier.discount && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                          {tier.discount}
                        </span>
                      )}
                    </div>
                    <span className="text-[15px] font-black text-[#1a1510] group-hover:text-brand-gold transition-colors">{tier.price}</span>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[#1a1510]/20 text-center font-medium pt-2">
                Credits never expire. Volume discounts applied automatically.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ TOAST NOTIFICATION ═══════════ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[60] px-7 py-4 bg-[#1a1510] text-white rounded-2xl shadow-2xl shadow-[#1a1510]/20 flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={14} className="text-emerald-400" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
