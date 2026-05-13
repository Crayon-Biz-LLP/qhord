"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   DollarSign, Users, Activity, Plus, RefreshCw, ChevronRight,
   Settings, Bell, Bot, Box, Search, ShieldCheck, Zap, TrendingUp,
   LayoutDashboard, Terminal, Target, Mail, BarChart3, Clock,
   CheckCircle, MoreHorizontal, MoreVertical, Layers, ArrowRight,
   Sparkles, Filter, LayoutPanelLeft, LineChart, PieChart
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Mock Data ---
const PIPELINE_STAGES = [
   {
      id: 1,
      title: "New Lead",
      value: "$142K",
      count: 4,
      color: "bg-[#1a1510]/10",
      deals: [
         { id: 101, name: "GrowthCo Expansion", contact: "Alex Kim", amount: "$18.5K", health: 92, auto: true, avatar: "A" },
         { id: 102, name: "VentureX Pilot", contact: "Chris Lee", amount: "$39K", health: 85, auto: true, avatar: "C" },
         { id: 103, name: "Series B Round", contact: "Sarah M.", amount: "$85K", health: 65, auto: false, avatar: "S" }
      ]
   },
   {
      id: 2,
      title: "Engaged",
      value: "$86K",
      count: 2,
      color: "bg-blue-500",
      deals: [
         { id: 201, name: "DataFlow Enterprise", contact: "James Wilson", amount: "$32K", health: 78, auto: true, avatar: "J" },
         { id: 202, name: "NextGen SaaS", contact: "Nina Patel", amount: "$54K", health: 94, auto: true, avatar: "N" }
      ]
   },
   {
      id: 3,
      title: "Meeting",
      value: "$125K",
      count: 2,
      color: "bg-brand-gold",
      deals: [
         { id: 301, name: "TechCorp Global", contact: "Sarah Chen", amount: "$45K", health: 88, auto: true, avatar: "S" },
         { id: 302, name: "Mercedes EMEA", contact: "Mike T.", amount: "$80K", health: 91, auto: true, avatar: "M" }
      ]
   },
   {
      id: 4,
      title: "Proposal",
      value: "$280K",
      count: 1,
      color: "bg-[#1a1510]",
      deals: [
         { id: 401, name: "CloudBase Pro", contact: "Maria Garcia", amount: "$280K", health: 92, auto: false, avatar: "M" }
      ]
   },
   {
      id: 5,
      title: "Closed",
      value: "$67K",
      count: 1,
      color: "bg-emerald-500",
      deals: [
         { id: 501, name: "ScaleUp Suite", contact: "Lisa Park", amount: "$67K", health: 98, auto: true, avatar: "L" }
      ]
   }
];

const PIPELINE_KPIS = [
   { label: "TOTAL PIPELINE", value: "$700K", icon: DollarSign, change: "+$42K mo", color: "text-brand-gold", bg: "bg-brand-gold/10", sparkline: [40, 50, 45, 60, 55, 70, 65, 80] },
   { label: "WEIGHTED VALUE", value: "$482K", icon: LineChart, change: "Optimal", color: "text-blue-500", bg: "bg-blue-50", sparkline: [30, 35, 32, 40, 38, 45, 42, 50] },
   { label: "WIN RATE", value: "32%", icon: TrendingUp, change: "+4.2% Growth", color: "text-emerald-500", bg: "bg-emerald-50", sparkline: [20, 25, 22, 30, 28, 35, 32, 40] },
   { label: "AI GENERATED", value: "74%", icon: Zap, change: "62 Ops Unlocked", color: "text-purple-500", bg: "bg-purple-50", sparkline: [50, 60, 55, 75, 70, 85, 80, 95] },
   { label: "AVG DEAL", value: "$42.5K", icon: PieChart, change: "+$2K vs last mo", color: "text-[#1a1510]", bg: "bg-[#1a1510]/5", sparkline: [40, 55, 48, 65, 58, 75, 68, 85] },
];

export default function PipelinePage() {
   const router = useRouter();

   return (
      <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                     <BarChart3 size={18} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-sm font-bold tracking-tight text-[#1a1510] uppercase truncate">Pipeline</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                        Real-time GTM deal sync
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
               <button className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-bold uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2">
                  <Plus size={14} /> <span className="hidden xs:inline">New Deal</span><span className="xs:hidden">New</span>
               </button>
               <button
                  onClick={() => router.push('/dashboard')}
                  className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto scrollbar-hide pb-32">

            {/* 2. Metric Ribbon */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
               {PIPELINE_KPIS.map((kpi, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className={`bg-white p-4 lg:p-5 rounded-xl border border-[#1a1510]/5 flex flex-col justify-between h-24 lg:h-28 group transition-all shadow-sm hover:shadow-md ${i > 3 ? 'hidden lg:flex' : 'flex'}`}
                  >
                     <div className="flex justify-between items-start">
                        <span className="text-[8px] lg:text-[9px] font-bold text-[#1a1510]/30 tracking-widest uppercase truncate">{kpi.label}</span>
                        <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color} shadow-sm shrink-0`}>
                           <kpi.icon size={12} />
                        </div>
                     </div>

                     <div className="mt-1 lg:mt-2">
                        <h3 className="text-lg lg:text-2xl font-bold text-[#1a1510] tracking-tighter leading-none">{kpi.value}</h3>
                        <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-wider text-emerald-500 mt-1 truncate">
                           {kpi.change}
                        </p>
                     </div>
                  </motion.div>
               ))}
            </section>

            {/* 3. Search & Filter Bar */}
            <section className="flex flex-col sm:flex-row items-center gap-3 w-full bg-white p-2 rounded-xl border border-[#1a1510]/5 shadow-sm">
               <div className="flex-1 relative group w-full">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     placeholder="Search deals..."
                     className="w-full h-10 sm:h-11 pl-12 pr-4 rounded-2xl bg-transparent text-[#1a1510] focus:outline-none transition-all text-xs font-medium"
                  />
               </div>
               <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-white border border-[#1a1510]/5 text-[9px] font-bold uppercase tracking-widest text-[#1a1510] hover:bg-[#f7f8f9] transition-all flex items-center justify-center gap-2">
                     <Filter size={14} /> Filter
                  </button>
                  <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
                     <RefreshCw size={14} /> Sync
                  </button>
               </div>
            </section>

            {/* 4. Strategic Pipeline Board */}
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full pb-32">
               {PIPELINE_STAGES.map((stage, i) => (
                  <div key={stage.id} className="flex flex-col gap-4">
                     {/* Lane Header */}
                     <div className="space-y-3 px-1">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <h4 className="text-[10px] font-bold text-[#1a1510] tracking-widest uppercase">{stage.title}</h4>
                              <span className="px-1.5 py-0.5 rounded bg-[#1a1510]/5 text-[8px] font-bold text-[#1a1510]/30">{stage.count}</span>
                           </div>
                           <span className="text-[10px] font-bold text-[#1a1510] tracking-tighter">{stage.value}</span>
                        </div>
                        <div className="h-1 w-full bg-[#1a1510]/5 rounded-full overflow-hidden">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ delay: i * 0.1 }}
                              className={`h-full ${stage.color} opacity-60 rounded-full`}
                           />
                        </div>
                     </div>

                     {/* Deal Cards */}
                     <div className="space-y-4">
                        {stage.deals.map((deal) => (
                           <motion.div
                              key={deal.id}
                              whileHover={{ y: -4 }}
                              className="bg-white p-4 rounded-xl border border-[#1a1510]/5 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
                           >
                              <div className="absolute top-2 right-2 p-1 px-1.5 rounded bg-brand-gold/10 text-brand-gold text-[7px] font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                 {deal.health}% Prob
                              </div>

                              <div className="flex items-center gap-3 mb-4">
                                 <div className="w-8 h-8 rounded-xl bg-[#1a1510] text-brand-gold flex items-center justify-center font-semibold text-[12px] shrink-0">
                                    {deal.avatar}
                                 </div>
                                 <div className="min-w-0">
                                    <h5 className="text-[12px] font-bold text-[#1a1510] truncate">{deal.name}</h5>
                                    <div className="flex items-center gap-1.5">
                                       <span className="text-[8px] font-bold text-[#1a1510]/20 uppercase truncate">{deal.contact}</span>
                                       {deal.auto && <Zap size={8} className="text-brand-gold fill-brand-gold" />}
                                    </div>
                                 </div>
                              </div>

                              <div className="flex items-end justify-between pt-3 border-t border-[#1a1510]/5">
                                 <div>
                                    <p className="text-[7px] font-bold text-[#1a1510]/20 uppercase tracking-widest">Value</p>
                                    <p className="text-lg font-bold text-[#1a1510] tracking-tighter leading-none">{deal.amount}</p>
                                 </div>
                                 <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                       <div className={`w-1 h-1 rounded-full ${deal.health > 80 ? 'bg-emerald-500' : 'bg-brand-gold'}`} />
                                       <span className="text-[10px] font-bold text-[#1a1510]">{deal.health}%</span>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        ))}

                        <button className="w-full h-12 border-2 border-dashed border-[#1a1510]/5 rounded-2xl bg-white/40 text-[8px] font-bold uppercase tracking-widest text-[#1a1510]/10 hover:border-brand-gold/30 hover:text-brand-gold transition-all flex items-center justify-center gap-2 group">
                           <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add
                        </button>
                     </div>
                  </div>
               ))}
            </section>
         </main>
      </div>
   );
}
