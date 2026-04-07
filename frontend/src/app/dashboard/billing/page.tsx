"use client";

import React, { useState } from "react";
import {
  CreditCard, TrendingUp, Zap, ArrowRight, Sparkles, Check, X,
  Calendar, Clock, Target, Mail, Database, Activity, BarChart3,
  Shield, Globe, Bot, Cpu, Crown, ChevronRight, ExternalLink,
  Coins, ArrowUpRight, ArrowDownRight, Settings, Users, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Mock Data ---
const USAGE_STATS = [
  { label: "Credits", value: "5,153", limit: "8,000", trend: "+12%", trendUp: true, icon: Zap, color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500", barPercent: "64%" },
  { label: "Emails", value: "12,340", limit: "25,000", trend: "+4%", trendUp: true, icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500", barPercent: "49%" },
  { label: "Enrich", value: "892", limit: "2,000", trend: "+24%", trendUp: true, icon: Database, color: "text-purple-600", bg: "bg-purple-50", barColor: "bg-purple-500", barPercent: "45%" },
];

const CREDIT_BREAKDOWN = [
  { label: "Sequences", credits: "2,168", percent: 42, color: "bg-blue-500" },
  { label: "Enrichment", credits: "1,390", percent: 27, color: "bg-emerald-500" },
  { label: "AI Ops", credits: "1,595", percent: 31, color: "bg-amber-500" },
];

export default function BillingPage() {
  const router = useRouter();
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      
      {/* 1. Header Navigation */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
            <DollarSign size={18} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Billing</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
               Manage usage & spending
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
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          
          {/* Active Plan Overview */}
          <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={24} />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h2 className="text-xl font-black tracking-tight">Growth Plan</h2>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Active</span>
                </div>
                <p className="text-[12px] font-medium text-[#1a1510]/30 mt-1">$349/mo • 8k credits • Next: April 1, 2026</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/dashboard/pricing')}
              className="px-8 h-12 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all"
            >
              Change Plan
            </button>
          </div>

          {/* Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#1a1510]/30">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Forecast</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">10</span>
                  <span className="text-[12px] font-bold text-[#1a1510]/30">days left</span>
                </div>
                <p className="text-[10px] font-bold text-amber-500 mt-2">Auto-refill advised soon</p>
              </div>
            </div>
            <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#1a1510]/30">
                <Shield size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">87</span>
                  <span className="text-[12px] font-bold text-[#1a1510]/30">/ 100</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-500 mt-2">Optimal resource usage</p>
              </div>
            </div>
            <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#1a1510]/30">
                <TrendingUp size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Value</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$127k</span>
                </div>
                <p className="text-[10px] font-bold text-[#1a1510]/30 mt-2">Generated Pipeline</p>
              </div>
            </div>
          </div>

          {/* Usage Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USAGE_STATS.map((stat, i) => (
              <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-6 space-y-6 group hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                   <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                      <stat.icon size={16} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-[#1a1510]/20 uppercase tracking-widest">{stat.label}</p>
                      <div className="flex items-center justify-end gap-1">
                         <span className="text-xl font-black">{stat.value}</span>
                         <span className="text-[10px] font-bold text-[#1a1510]/20">/ {stat.limit}</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="w-full h-1.5 bg-[#f7f8f9] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: stat.barPercent }} className={`h-full ${stat.barColor} rounded-full`} />
                   </div>
                   <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1a1510]/20">
                      <span>Usage Level</span>
                      <span className="text-brand-gold">{stat.trend}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spending Breakdown */}
          <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
             <div className="flex items-end justify-between">
                <h3 className="text-lg font-black tracking-tight uppercase">Spending Breakdown</h3>
                <span className="text-[10px] font-black text-[#1a1510]/20 uppercase tracking-widest">Current cycle</span>
             </div>
             <div className="w-full h-6 bg-[#f7f8f9] rounded-full overflow-hidden flex">
                {CREDIT_BREAKDOWN.map((seg, i) => (
                   <div key={i} style={{ width: `${seg.percent}%` }} className={`${seg.color} border-r border-white last:border-0`} title={seg.label} />
                ))}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CREDIT_BREAKDOWN.map((seg, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${seg.color}`} />
                      <div>
                         <p className="text-[11px] font-black uppercase tracking-tight">{seg.label}</p>
                         <p className="text-[10px] font-bold text-[#1a1510]/30">{seg.credits} cr • {seg.percent}%</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <button 
             onClick={() => setShowBuyCredits(true)}
             className="w-full h-16 bg-[#fafbfc] border border-dashed border-[#1a1510]/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40 flex items-center justify-center gap-3 hover:border-brand-gold hover:text-brand-gold hover:bg-white transition-all shadow-sm"
          >
             <Plus size={16} /> Top up additional credits
          </button>
        </div>
      </main>

      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 right-8 bg-[#1a1510] text-white p-4 rounded-xl shadow-2xl z-50 text-xs font-bold border border-white/10">
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Plus = ({ size, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DollarSign = ({ size, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);
