"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   DollarSign, Users, Activity, Plus, RefreshCw, ChevronRight,
   Settings, Bell, Bot, Box, Search, ShieldCheck, Zap, TrendingUp,
   LayoutDashboard, Terminal, Target, Mail, BarChart3, Clock,
   CheckCircle, MoreHorizontal, MoreVertical, Layers, ArrowRight,
   Sparkles, Filter, LayoutPanelLeft, LineChart, PieChart, Download
} from "lucide-react";
import { useCRM } from "../../../contexts/CRMContext";

interface PipelineProps {
   onBackToDashboard: () => void;
}

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

export const Pipeline = ({ onBackToDashboard }: PipelineProps) => {
   const { globalDeals } = useCRM();

   // Flatten pipeline stages to get static deals
   const staticDeals = PIPELINE_STAGES.flatMap(stage => 
      stage.deals.map(d => ({ ...d, stage: stage.title, stageId: stage.id }))
   );

   const allDeals = [...staticDeals, ...globalDeals.map(d => ({
      ...d, stage: "New Lead", stageId: 1
   }))];

   return (
      <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Consolidated Header */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg">
                     <BarChart3 size={18} />
                  </div>
                  <div>
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase">Pipeline</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                        Deals auto-generated from your GTM activity — Syncing in real-time
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <button className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-3">
                  <Plus size={14} /> New Deal
               </button>
               <button
                  onClick={onBackToDashboard}
                  className="h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> Back to Hub
               </button>
            </div>
         </nav>         <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto overflow-x-hidden">

            {/* 2. Metric Ribbon - HIGH DENSITY 5-COLUMN GRID */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
               {PIPELINE_KPIS.map((kpi, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="bg-white p-4 lg:p-5 rounded-[2rem] border border-[#1a1510]/5 flex flex-col justify-between h-28 lg:h-32 group transition-all shadow-sm hover:shadow-md"
                  >
                     <div className="flex justify-between items-start">
                        <span className="text-[8px] lg:text-[9px] font-black text-[#1a1510]/30 tracking-[0.2em] uppercase">{kpi.label}</span>
                        <div className={`p-1 lg:p-1.5 rounded-lg ${kpi.bg} ${kpi.color} shadow-sm`}>
                           <kpi.icon size={12} />
                        </div>
                     </div>

                     <div className="mt-1 lg:mt-2">
                        <h3 className="text-lg lg:text-2xl font-black text-[#1a1510] tracking-tighter leading-none">{kpi.value}</h3>
                        <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-wider text-emerald-500 mt-1">
                           {kpi.change}
                        </p>
                     </div>

                     {/* Minimal Sparkline Overlay */}
                     <div className="h-3 flex items-end gap-[2px] mt-1.5 opacity-10">
                        {kpi.sparkline.map((val, idx) => (
                           <div key={idx} className="flex-1 bg-brand-gold rounded-full" style={{ height: `${val}%` }} />
                        ))}
                     </div>
                  </motion.div>
               ))}
            </section>

            {/* 3. Search & Filter Bar - COMPACT */}
            <section className="flex items-center gap-3 w-full bg-white px-2 py-1.5 rounded-3xl border border-[#1a1510]/5 pr-3 shadow-sm">
               <div className="flex-1 relative group w-full">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     placeholder="Search intelligence across your 5-stage funnel..."
                     className="w-full h-11 pl-12 pr-4 rounded-2xl bg-transparent text-[#1a1510] focus:outline-none transition-all text-xs font-medium"
                  />
               </div>
               <div className="flex items-center gap-2 shrink-0">
                  <button className="h-10 px-5 rounded-xl bg-white border border-[#1a1510]/5 text-[9px] font-black uppercase tracking-widest text-[#1a1510] hover:bg-[#f7f8f9] transition-all flex items-center justify-center gap-2">
                     <Filter size={14} /> Filter
                  </button>
                  <button className="h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg scale-95 hover:scale-100">
                     <RefreshCw size={14} /> Sync
                  </button>
               </div>
            </section>

            {/* 4. Strategic Pipeline Board - LIST VIEW (APOLLO STYLE) */}
            <div className="bg-white rounded-[3rem] border border-[#1a1510]/5 shadow-sm overflow-hidden flex-1 mb-6 mr-6 ml-6">
               <div className="overflow-x-auto scrollbar-hide h-full">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-[#1a1510]/[0.03] bg-[#fcfcfc]/50">
                           <th className="p-6 w-[60px]"><input type="checkbox" className="w-5 h-5 rounded-lg border-[#1a1510]/10 text-brand-gold focus:ring-brand-gold/20 cursor-pointer" /></th>
                           <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Deal Name</th>
                           <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Contact</th>
                           <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Amount</th>
                           <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Stage</th>
                           <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30 text-center">Health</th>
                           <th className="p-6"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#1a1510]/5">
                        {allDeals.map((deal, i) => (
                           <motion.tr
                              key={deal.id + '-' + i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group hover:bg-[#f7f8f9]/50 transition-all cursor-pointer"
                           >
                              <td className="p-6"><input type="checkbox" className="w-5 h-5 rounded-lg border-[#1a1510]/10 text-brand-gold focus:ring-brand-gold/20 cursor-pointer" /></td>
                              <td className="p-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-[11px] font-black border border-brand-gold/10 shadow-md">
                                       {deal.avatar}
                                    </div>
                                    <h4 className="text-[13px] font-black text-[#1a1510]">{deal.name}</h4>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <div className="flex items-center gap-1">
                                    <span className="text-[11px] font-bold text-[#1a1510]/70">{deal.contact}</span>
                                    {deal.auto && <Zap size={10} className="text-brand-gold fill-brand-gold ml-1" />}
                                 </div>
                              </td>
                              <td className="p-6">
                                 <span className="text-[12px] font-black text-[#1a1510] tracking-tighter">{deal.amount}</span>
                              </td>
                              <td className="p-6">
                                 <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#1a1510]/5 text-[#1a1510]/70">
                                    {deal.stage}
                                 </span>
                              </td>
                              <td className="p-6">
                                 <div className="flex flex-col items-center gap-1.5">
                                    <div className="w-16 h-1.5 bg-[#f7f8f9] rounded-full overflow-hidden">
                                       <div 
                                          className={`h-full rounded-full ${deal.health > 80 ? 'bg-emerald-500' : 'bg-brand-gold'}`} 
                                          style={{ width: `${deal.health}%` }} 
                                       />
                                    </div>
                                    <span className="text-[9px] font-black text-[#1a1510]/60">{deal.health}%</span>
                                 </div>
                              </td>
                              <td className="p-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 hover:bg-[#1a1510]/5 rounded-xl transition-colors">
                                    <MoreHorizontal size={16} className="text-[#1a1510]/40 hover:text-[#1a1510]" />
                                 </button>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </main>
      </div>
   );
};
