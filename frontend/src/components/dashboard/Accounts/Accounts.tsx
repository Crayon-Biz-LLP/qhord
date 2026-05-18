"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, MessageSquare, Calendar, DollarSign, Search, Plus,
  ArrowUpRight, LayoutDashboard, Globe, ChevronRight, Filter, MoreHorizontal
} from "lucide-react";
import { CreateAccount } from "./CreateAccount";

// --- Data ---
const accountsData = [
  {
    id: 1,
    name: "Nike",
    segment: "Company",
    owner: "Sarah M.",
    health: 92,
    leads: "847",
    replies: "36",
    meetings: "9",
    pipeline: "$280K",
    campaigns: { total: 2, active: 2 }
  },
  {
    id: 2,
    name: "Mercedes GLS Launch",
    segment: "Segment",
    owner: "Mike T.",
    health: 85,
    leads: "1,240",
    replies: "18",
    meetings: "4",
    pipeline: "$320K",
    campaigns: { total: 1, active: 1 }
  },
  {
    id: 3,
    name: "Samsung EU",
    segment: "Territory",
    owner: "Sarah M.",
    health: 65,
    leads: "520",
    replies: "8",
    meetings: "2",
    pipeline: "$95K",
    campaigns: { total: 1, active: 0 }
  },
  {
    id: 4,
    name: "Stargate",
    segment: "Company",
    owner: "Mike T.",
    health: 0,
    leads: "0",
    replies: "0",
    meetings: "0",
    pipeline: "$0K",
    campaigns: { total: 1, active: 0 }
  },
  {
    id: 5,
    name: "Zinco Ltd",
    segment: "Company",
    owner: "Lisa K.",
    health: 78,
    leads: "380",
    replies: "12",
    meetings: "3",
    pipeline: "$145K",
    campaigns: { total: 1, active: 1 }
  }
];

const kpis = [
  { label: "ACCOUNTS", value: "5", icon: Globe, sparkline: [40, 50, 45, 60, 55, 70, 65, 80], change: "+2 this mo", trend: 'up' },
  { label: "LEADS", value: "2,987", icon: Users, sparkline: [30, 35, 32, 40, 38, 45, 42, 50], change: "+12.4%", trend: 'up' },
  { label: "REPLIES", value: "74", icon: MessageSquare, sparkline: [20, 25, 22, 30, 28, 35, 32, 40], change: "Optimal", trend: 'up' },
  { label: "MEETINGS", value: "18", icon: Calendar, sparkline: [10, 15, 12, 18, 16, 22, 18, 25], change: "+3 today", trend: 'up' },
  { label: "PIPELINE", value: "$840K", icon: DollarSign, sparkline: [50, 60, 55, 75, 70, 85, 80, 95], change: "+$12K week", trend: 'up' },
];

// Reusable AccountCard Component
const AccountCard = ({ account }: { account: typeof accountsData[0] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-8 shadow-sm transition-all group overflow-hidden relative"
    >
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Building2 size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-[#1a1510] tracking-tight group-hover:text-brand-gold transition-colors">{account.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40 bg-[#f7f8f9] px-2.5 py-1 rounded-lg">
                {account.segment}
              </span>
              <span className="text-xs font-semibold text-[#1a1510]/30 italic opacity-60">Owner: {account.owner}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black tracking-tighter ${account.health > 80 ? 'text-emerald-500' : account.health > 0 ? 'text-brand-gold' : 'text-[#1a1510]/10'}`}>
            {account.health > 0 ? `${account.health}%` : '—'}
          </p>
          <p className="text-[10px] font-black text-[#1a1510]/10 uppercase tracking-widest leading-none">Health</p>
        </div>
      </div>

      {/* Health Bar */}
      <div className="h-1.5 w-full bg-[#f7f8f9] rounded-full overflow-hidden mb-10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${account.health}%` }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className={`h-full rounded-full ${account.health > 80 ? 'bg-emerald-500' : 'bg-brand-gold'}`}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Leads", value: account.leads },
          { label: "Replies", value: account.replies },
          { label: "Meetings", value: account.meetings },
          { label: "Pipeline", value: account.pipeline },
        ].map((metric, i) => (
          <div key={i} className="text-center">
            <p className="text-lg font-black text-[#1a1510] tracking-tight mb-0.5">{metric.value}</p>
            <p className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-widest">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Footer Details */}
      <div className="pt-6 border-t border-[#1a1510]/5 flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#1a1510]/20 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1510]/20"></span>
          {account.campaigns.total} campaign{account.campaigns.total !== 1 ? 's' : ''}
          {account.campaigns.active > 0 && <span className="text-emerald-500">• {account.campaigns.active} active</span>}
        </p>
        <button className="text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] flex items-center gap-2 group/btn hover:translate-x-1 transition-transform">
          View details <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export const Accounts = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <CreateAccount onBack={() => setIsCreating(false)} onSave={() => setIsCreating(false)} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

      {/* Refined Navigation Bar (Consolidated) */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase">Accounts</h2>
              <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                5 registered account nodes — Select to configure orchestrations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreating(true)}
            className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-3"
          >
            <Plus size={14} /> New Account
          </button>
          <button
            onClick={onBackToDashboard}
            className="h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
          >
            <LayoutDashboard size={14} /> Back to Hub
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">

        {/* Metric Header (Increased Width) */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[2rem] border border-[#1a1510]/5 flex flex-col justify-between h-36 group transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-[#1a1510]/30 tracking-[0.2em] uppercase">{kpi.label}</span>
                <div className={`p-2 rounded-xl bg-brand-gold/10 text-brand-gold shadow-sm group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-[#1a1510] tracking-tighter mb-0.5">{kpi.value}</h3>
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                  {kpi.change}
                </p>
              </div>

              {/* Sparkline */}
              <div className="h-6 flex items-end gap-[2px] mt-2 opacity-10 group-hover:opacity-100 transition-opacity">
                {kpi.sparkline.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-brand-gold rounded-full"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Streamlined Search (Reduced Height) */}
        <section className="relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
          <input
            type="text"
            placeholder="Search accounts intelligence..."
            className="w-full h-14 pl-14 pr-8 rounded-2xl bg-white border border-[#1a1510]/5 text-[#1a1510] placeholder:text-[#1a1510]/20 focus:border-brand-gold/30 outline-none transition-all shadow-sm focus:shadow-md text-sm font-medium"
          />
        </section>

        {/* Tactical 2-Column Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {accountsData.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}

          {/* Empty Discovery Card */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setIsCreating(true)}
            className="border-2 border-dashed border-[#1a1510]/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-brand-gold/40 transition-all bg-white/40"
          >
            <div className="w-16 h-16 bg-[#1a1510] rounded-2xl flex items-center justify-center text-brand-gold transition-all mb-6">
              <Plus size={32} />
            </div>
            <h4 className="text-xl font-black text-[#1a1510]/60 group-hover:text-[#1a1510] mb-2">Create New Account</h4>
            <p className="text-xs font-semibold text-[#1a1510]/20 uppercase tracking-widest max-w-xs transition-colors group-hover:text-[#1a1510]/40">
              Set up a new account and launch your first campaign
            </p>
          </motion.div>
        </section>

        <div className="h-24" />
      </main>
    </div>
  );
};
