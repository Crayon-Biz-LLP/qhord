"use client";

import React, { useState } from "react";
import {
  CreditCard, TrendingUp, Zap, ArrowRight, Sparkles, Check, X,
  Calendar, Clock, Target, Mail, Database, Activity, BarChart3,
  Shield, Globe, Bot, Cpu, Crown, ChevronRight, ExternalLink,
  Coins, ArrowUpRight, ArrowDownRight, Settings, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ───────── DATA LAYER ───────── */
const USAGE_STATS = [
  { label: "Credits Used", value: "5,153", limit: "8,000", trend: "+12%", trendUp: true, icon: Zap, color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500", barPercent: "64%" },
  { label: "Emails Sent", value: "12,340", limit: "25,000", trend: "+4%", trendUp: true, icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500", barPercent: "49%" },
  { label: "Enrichments", value: "892", limit: "2,000", trend: "+24%", trendUp: true, icon: Database, color: "text-purple-600", bg: "bg-purple-50", barColor: "bg-purple-500", barPercent: "45%" },
  { label: "Active Campaigns", value: "5", limit: "10", trend: "+2", trendUp: true, icon: Target, color: "text-orange-600", bg: "bg-orange-50", barColor: "bg-orange-500", barPercent: "50%" },
];

const CREDIT_BREAKDOWN = [
  { label: "Email sequences", credits: "2,168", percent: 42, color: "bg-blue-500" },
  { label: "Lead enrichment", credits: "1,390", percent: 27, color: "bg-emerald-500" },
  { label: "AI operations", credits: "930", percent: 18, color: "bg-amber-500" },
  { label: "Data sync", credits: "665", percent: 13, color: "bg-purple-500" },
];

const TOOL_SUBSCRIPTIONS = [
  { name: "Apollo", plan: "Professional", price: "$79", billing: "Monthly", nextBilling: "Apr 1, 2026", active: true, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Clay", plan: "Explorer", price: "$49", billing: "Monthly", nextBilling: "Apr 1, 2026", active: true, icon: Database, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Smartlead", plan: "Pro", price: "$39", billing: "Monthly", nextBilling: "Apr 1, 2026", active: true, icon: Mail, color: "text-orange-600", bg: "bg-orange-50" },
  { name: "HeyReach", plan: null, price: "$59/mo", billing: null, nextBilling: null, active: false, icon: Globe, color: "text-rose-500", bg: "bg-rose-50" },
];

/* ───────── COMPONENT ───────── */
export const Billing = () => {
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white relative font-sans scrollbar-hide">

      {/* ═══════════ TOP HEADER ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pt-10 pb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-[28px] font-black text-[#1a1510] tracking-tight">Billing & Usage</h1>
            <p className="text-[13px] text-[#1a1510]/35 font-medium">Track spending, forecast usage, and optimize efficiency</p>
          </div>
          <button className="flex items-center gap-2.5 px-6 h-11 bg-[#1a1510] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:-translate-y-0.5 shadow-lg shadow-[#1a1510]/10 transition-all">
            <CreditCard size={15} /> View Plans
          </button>
        </div>
      </section>

      {/* ═══════════ CURRENT PLAN CARD ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-8">
        <div className="bg-[#fafbfc] border border-[#e5e7eb] rounded-2xl p-7 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Sparkles size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <h2 className="text-[20px] font-black text-[#1a1510] tracking-tight">Growth Plan</h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Current</span>
              </div>
              <p className="text-[12px] text-[#1a1510]/35 font-medium">
                $349/month • 8,000 credits included • Next billing <strong className="text-[#1a1510]/60">Apr 1, 2026</strong>
              </p>
            </div>
          </div>
          <button className="px-7 h-11 bg-white border border-[#e5e7eb] rounded-xl text-[11px] font-black text-[#1a1510] uppercase tracking-widest hover:bg-[#1a1510] hover:text-white hover:border-[#1a1510] transition-all shadow-sm">
            Upgrade
          </button>
        </div>
      </section>

      {/* ═══════════ KEY METRICS ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-10">
        <div className="grid grid-cols-3 gap-5">
          {/* Credit Forecast */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Clock size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#1a1510]/70">Credit Forecast</p>
                <p className="text-[10px] text-[#1a1510]/30 font-medium">Based on current burn rate</p>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[42px] font-black text-[#1a1510] tracking-tighter leading-none">10</span>
                <span className="text-[14px] font-bold text-[#1a1510]/30">days remaining</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <ArrowDownRight size={13} className="text-amber-500" />
                <span className="text-[11px] font-bold text-amber-600">Next top-up advised Mar 28</span>
              </div>
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Shield size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#1a1510]/70">Efficiency Score</p>
                <p className="text-[10px] text-[#1a1510]/30 font-medium">Credit to outcome ratio</p>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[42px] font-black text-[#1a1510] tracking-tighter leading-none">87</span>
                <span className="text-[18px] font-bold text-[#1a1510]/20">/ 100</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-600 mt-2">Top 15% of teams on your plan</p>
            </div>
          </div>

          {/* Value Generated */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#1a1510]/70">Value Generated</p>
                <p className="text-[10px] text-[#1a1510]/30 font-medium">This billing period</p>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[42px] font-black text-[#1a1510] tracking-tighter leading-none">$127K</span>
                <span className="text-[14px] font-bold text-[#1a1510]/30">pipeline</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <ArrowUpRight size={13} className="text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-600">+14% vs last period</span>
                </div>
              </div>
              <p className="text-[10px] text-[#1a1510]/25 font-medium mt-0.5">$24.60 pipeline per credit spent</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ USAGE OVERVIEW ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-10">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-[20px] font-black text-[#1a1510] tracking-tight">Usage Overview</h2>
          <p className="text-[12px] text-[#1a1510]/30 font-medium">Current billing period</p>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {USAGE_STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={15} className={stat.color} />
                  </div>
                  <span className="text-[12px] font-bold text-[#1a1510]/60">{stat.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUpRight size={12} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-600">{stat.trend}</span>
                </div>
              </div>
              <div>
                <span className="text-[32px] font-black text-[#1a1510] tracking-tighter leading-none">{stat.value}</span>
                <span className="text-[13px] font-bold text-[#1a1510]/20 ml-1">/ {stat.limit}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stat.barPercent }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${stat.barColor} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ CREDIT BREAKDOWN ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-10">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-[20px] font-black text-[#1a1510] tracking-tight">Credit Breakdown</h2>
          <p className="text-[12px] text-[#1a1510]/30 font-medium">Where your credits are being spent</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-7 space-y-6">
          {/* Stacked Bar */}
          <div className="w-full h-5 bg-[#f0f1f3] rounded-full overflow-hidden flex">
            {CREDIT_BREAKDOWN.map((seg, i) => (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: `${seg.percent}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                className={`h-full ${seg.color} ${i === 0 ? "rounded-l-full" : ""} ${i === CREDIT_BREAKDOWN.length - 1 ? "rounded-r-full" : ""}`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-4 gap-4">
            {CREDIT_BREAKDOWN.map((seg, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${seg.color}`} />
                <div>
                  <p className="text-[12px] font-bold text-[#1a1510]/70">{seg.label}</p>
                  <p className="text-[11px] text-[#1a1510]/30 font-medium">{seg.credits} credits ({seg.percent}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BUY ADDITIONAL CREDITS ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-10">
        <button
          onClick={() => setShowBuyCredits(true)}
          className="w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-2xl p-6 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <Coins size={20} />
            </div>
            <h3 className="text-[16px] font-black text-[#1a1510] tracking-tight">Buy Additional Credits</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#1a1510]/30 font-medium">Top up your credits anytime</span>
            <ChevronRight size={18} className="text-[#1a1510]/20 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </section>

      {/* ═══════════ TOOL SUBSCRIPTIONS ═══════════ */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-8 pb-24">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-[20px] font-black text-[#1a1510] tracking-tight">Tool Subscriptions</h2>
          <p className="text-[12px] text-[#1a1510]/30 font-medium">Manage your connected tool billing</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {TOOL_SUBSCRIPTIONS.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-5 hover:shadow-md transition-shadow"
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${tool.bg} rounded-2xl flex items-center justify-center ${tool.color}`}>
                    <tool.icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-[16px] font-black text-[#1a1510] tracking-tight">{tool.name}</h4>
                      {tool.active ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Active</span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-gray-50 text-[#1a1510]/30 text-[9px] font-black uppercase tracking-widest rounded-full border border-gray-100">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
                {tool.plan && (
                  <span className="text-[12px] font-black text-[#1a1510]/60 bg-[#f7f8f9] px-3 py-1.5 rounded-lg">{tool.plan}</span>
                )}
              </div>

              {/* Tool Details */}
              {tool.active ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20 mb-1">Plan</p>
                    <p className="text-[13px] font-bold text-[#1a1510]/60">{tool.billing}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20 mb-1">Price</p>
                    <p className="text-[13px] font-black text-[#1a1510]">{tool.price}<span className="text-[#1a1510]/30 font-bold">/mo</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20 mb-1">Next Billing</p>
                    <p className="text-[13px] font-bold text-[#1a1510]/60">{tool.nextBilling}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#1a1510]/40 font-medium">Starting at</span>
                  <span className="text-[14px] font-black text-[#1a1510]">{tool.price}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-1">
                {tool.active ? (
                  <>
                    <button className="px-5 h-10 bg-[#f7f8f9] border border-[#e5e7eb] rounded-xl text-[10px] font-black text-[#1a1510] uppercase tracking-widest hover:bg-[#1a1510] hover:text-white hover:border-[#1a1510] transition-all">
                      Manage
                    </button>
                    <button className="px-5 h-10 bg-[#f7f8f9] border border-[#e5e7eb] rounded-xl text-[10px] font-black text-[#1a1510] uppercase tracking-widest hover:bg-[#1a1510] hover:text-white hover:border-[#1a1510] transition-all">
                      Upgrade
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => showToast(`${tool.name} subscription started!`)}
                    className="px-6 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </motion.div>
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
