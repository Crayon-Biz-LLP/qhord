"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
   Search, LayoutDashboard, Filter, ChevronDown, SlidersHorizontal,
   BarChart3, PieChart, TrendingUp, TrendingDown,
   MoreHorizontal, Phone, Mail, Zap, Target, Briefcase, PhoneCall, Star,
   Users, Database, Calendar, Building2, User, Building, CheckSquare, Linkedin
} from "lucide-react";
import Link from "next/link";

interface AnalyticsProps {
   onBackToDashboard?: () => void;
}

export const Analytics = ({ onBackToDashboard }: AnalyticsProps) => {
   const [activeTab, setActiveTab] = useState("Salesforce"); // Changed default to Salesforce for testing

   const tabs = ["Overview", "Apollo", "Clay", "Smartlead", "HeyReach", "Salesforce"];

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] selection:bg-brand-gold/30 font-sans">
         <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide pb-32">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
               >
                  <h1 className="text-2xl font-black tracking-tight text-[#1a1510] mb-1">Analytics</h1>
                  <p className="text-xs font-medium text-[#1a1510]/50">Tool-level performance • Customizable dashboards • Full metric library</p>
               </motion.div>
               <div className="flex items-center gap-3">
                  <div className="h-9 px-4 rounded-lg bg-white border border-[#1a1510]/10 flex items-center justify-between gap-3 text-xs font-bold text-[#1a1510] shadow-sm cursor-pointer min-w-[120px]">
                     Last 30 days <ChevronDown size={14} className="text-[#1a1510]/40" />
                  </div>
                  <div className="h-9 px-4 rounded-lg bg-white border border-[#1a1510]/10 flex items-center justify-between gap-3 text-xs font-bold text-[#1a1510] shadow-sm cursor-pointer min-w-[140px]">
                     All Accounts <ChevronDown size={14} className="text-[#1a1510]/40" />
                  </div>
                  <button className="h-9 px-4 rounded-lg bg-white border border-[#1a1510]/10 flex items-center gap-2 text-xs font-bold text-[#1a1510] shadow-sm hover:border-brand-gold/50 transition-colors">
                     <Filter size={14} /> Custom View
                  </button>
                  <button className="h-9 px-4 rounded-lg bg-white border border-[#1a1510]/10 flex items-center gap-2 text-xs font-bold text-[#1a1510] shadow-sm hover:border-brand-gold/50 transition-colors">
                     <SlidersHorizontal size={14} /> Customize Dashboard
                  </button>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
               {tabs.map((tab, i) => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-bold transition-all ${
                        activeTab === tab
                           ? "bg-white border border-[#1a1510]/10 shadow-sm text-[#1a1510]"
                           : "text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-white/50"
                     }`}
                  >
                     {tab === "Overview" && <LayoutDashboard size={14} className={activeTab === tab ? "text-brand-gold" : ""} />}
                     {tab === "Apollo" && <Zap size={14} className={activeTab === tab ? "text-brand-gold" : ""} />}
                     {tab === "Clay" && <Target size={14} className={activeTab === tab ? "text-brand-gold" : ""} />}
                     {tab === "Smartlead" && <Mail size={14} className={activeTab === tab ? "text-brand-gold" : ""} />}
                     {tab === "HeyReach" && <Briefcase size={14} className={activeTab === tab ? "text-brand-gold" : ""} />}
                     {tab === "Salesforce" && <TrendingUp size={14} className={activeTab === tab ? "text-brand-gold" : ""} />}
                     {tab}
                  </button>
               ))}
            </div>

            {/* Dashboard Content for Overview */}
            {activeTab === "Overview" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
               >
                  {/* Pinned Metrics */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/40 flex items-center gap-2">
                           <Star size={12} className="text-brand-gold" /> YOUR DASHBOARD
                        </h2>
                        <span className="text-[10px] font-medium text-[#1a1510]/30 italic">8 pinned metrics</span>
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {[
                           { label: "# Calls connected", val: "342", trend: "+12%", up: true },
                           { label: "# Emails sent", val: "12,847", trend: "+18%", up: true },
                           { label: "# Emails replied", val: "892", trend: "+22%", up: true },
                           { label: "% Emails replied", val: "7.1%", trend: "", up: null },
                           { label: "# Accounts Touched", val: "1,247", trend: "+9%", up: true },
                           { label: "# Deals won", val: "42", trend: "+18%", up: true },
                           { label: "$ Deal pipeline generated", val: "$3.4M", trend: "", up: null },
                           { label: "# All meetings scheduled", val: "247", trend: "+22%", up: true },
                        ].map((m, i) => (
                           <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[88px] group hover:border-brand-gold/20 transition-all">
                              <span className="text-[9px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                              <div className="flex items-end justify-between">
                                 <span className="text-xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                 {m.trend && (
                                    <span className={`text-[9px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                       {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                       {m.trend}
                                    </span>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Conversion Funnel */}
                     <div className="lg:col-span-2 bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex flex-col">
                        <h3 className="text-sm font-bold text-[#1a1510] mb-6">Conversion Funnel</h3>
                        <div className="flex-1 flex flex-col justify-between gap-4">
                           {[
                              { label: "Leads Imported", val: "2,847", pct: 100, color: "bg-blue-600" },
                              { label: "Enriched", val: "2,412", pct: 85, color: "bg-blue-600", drop: "-15.5%" },
                              { label: "Sent to Outreach", val: "1,898", pct: 66, color: "bg-blue-600", drop: "-21.6%" },
                              { label: "Replied", val: "234", pct: 15, color: "bg-blue-600/20", drop: "-87.6%" },
                              { label: "Positive Replies", val: "156", pct: 10, color: "bg-blue-600/20", drop: "-33.3%", up: "+55.5%" },
                              { label: "Meetings Booked", val: "42", pct: 5, color: "bg-blue-600/20", drop: "-73.1%" },
                              { label: "Deals Created", val: "18", pct: 2, color: "bg-blue-600/20", drop: "-57.1%" },
                           ].map((stage, i) => (
                              <div key={i} className="flex flex-col gap-1.5">
                                 <div className="flex items-center justify-between text-[10px] font-bold">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[#1a1510]">{stage.label}</span>
                                       {stage.drop && !stage.up && <span className="text-red-500 flex items-center gap-0.5"><TrendingDown size={10} /> {stage.drop}</span>}
                                       {stage.up && <span className="text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> {stage.up}</span>}
                                    </div>
                                    <span className="text-[#1a1510]/50">{stage.val}</span>
                                 </div>
                                 <div className="w-full bg-[#f7f8f9] rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${stage.pct}%` }} />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Tool Usage */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex flex-col">
                        <h3 className="text-sm font-bold text-[#1a1510] mb-6">Tool Usage</h3>
                        <div className="flex-1 flex items-center justify-center">
                           <div className="relative w-48 h-48">
                              {/* Mock Donut Chart */}
                              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="20" strokeDasharray="100 151" className="drop-shadow-sm" />
                                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="60 191" strokeDashoffset="-100" className="drop-shadow-sm" />
                                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="20" strokeDasharray="40 211" strokeDashoffset="-160" className="drop-shadow-sm" />
                                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="20" strokeDasharray="51 200" strokeDashoffset="-200" className="drop-shadow-sm" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                                    <div className="text-center">
                                       <span className="block text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Total</span>
                                       <span className="block text-xl font-black text-[#1a1510]">100%</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Channel Performance */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[#1a1510] mb-8">Channel Performance</h3>
                        <div className="relative h-40 ml-6 mb-6">
                           {/* Y-Axis */}
                           <div className="absolute -left-6 top-0 bottom-0 w-6 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                              <span>32</span><span>24</span><span>16</span><span>8</span><span>0</span>
                           </div>

                           {/* Chart Grid Area */}
                           <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                              <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                              <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                              <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           </div>

                           {/* Mock Lines */}
                           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                              <path d="M0,80 L33,60 L66,40 L100,20" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                              <path d="M0,90 L33,75 L66,55 L100,35" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                              <path d="M0,95 L33,85 L66,75 L100,65" fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                           </svg>

                           {/* X-Axis */}
                           <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                              <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
                           </div>
                        </div>
                     </div>

                     {/* Pipeline Growth */}
                     <div className="lg:col-span-2 bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[#1a1510] mb-8">Pipeline Growth ($k)</h3>
                        <div className="relative h-40 ml-8 mb-6">
                           {/* Y-Axis */}
                           <div className="absolute -left-8 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                              <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                           </div>

                           {/* Chart Grid Area */}
                           <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                              <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                              <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                              <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           </div>

                           {/* Mock Area Chart */}
                           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                              <path d="M0,90 L20,85 L40,70 L60,50 L80,30 L100,10 L100,100 L0,100 Z" fill="rgba(34, 197, 94, 0.1)" stroke="none" />
                              <path d="M0,90 L20,85 L40,70 L60,50 L80,30 L100,10" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                           </svg>

                           {/* X-Axis */}
                           <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                              <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Metric Library */}
                  <div className="space-y-4 pt-4">
                     <div className="flex items-center justify-between">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1a1510] flex items-center gap-2">
                           <Filter size={14} className="text-[#1a1510]/40" /> Full Metric Library <span className="bg-[#1a1510]/5 px-2 py-0.5 rounded-md text-[10px] ml-2">167</span>
                        </h2>
                        <div className="flex items-center gap-3">
                           <div className="relative group">
                              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/30 group-focus-within:text-brand-gold transition-colors" />
                              <input type="text" placeholder="Search metrics..." className="h-9 w-64 pl-9 pr-4 rounded-lg bg-white border border-[#1a1510]/10 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold/50 shadow-sm transition-all" />
                           </div>
                           <div className="h-9 px-4 rounded-lg bg-white border border-[#1a1510]/10 flex items-center justify-between gap-4 text-xs font-bold text-[#1a1510] shadow-sm cursor-pointer min-w-[160px]">
                              <div className="flex items-center gap-2">
                                 <PhoneCall size={14} className="text-[#1a1510]/50" /> Calls (16)
                              </div>
                              <ChevronDown size={14} className="text-[#1a1510]/40" />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                           { label: "# Calls logged", val: "1,247", trend: "+8%", up: true },
                           { label: "# Calls connected", val: "342", trend: "+12%", up: true },
                           { label: "# Calls completed", val: "298", trend: "+6%", up: true },
                           { label: "# Contacts called", val: "892", trend: "+4%", up: true },
                           { label: "# Accounts called", val: "156", trend: "+5%", up: true },
                           { label: "# Calls connected (Waterfall)", val: "298" },
                           { label: "% Calls connected", val: "27.4%", trend: "+2.1%", up: true },
                           { label: "# Calls connected - positive", val: "124" },
                           { label: "% Calls connected - positive", val: "36.3%" },
                           { label: "# Calls connected - neutral", val: "142" },
                           { label: "% Calls connected - neutral", val: "41.5%" },
                           { label: "# Calls connected - negative", val: "76" },
                           { label: "% Calls connected - negative", val: "22.2%" },
                           { label: "Avg. call duration", val: "4m 32s" },
                           { label: "# Calls scheduled", val: "-" },
                           { label: "# Calls with Disposition", val: "276" },
                        ].map((m, i) => (
                           <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all flex flex-col justify-between h-[100px]">
                              <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                              <div className="flex items-end justify-between mt-2">
                                 <span className="text-xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                 {m.trend && (
                                    <span className={`text-[9px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                       {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                       {m.trend}
                                    </span>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

               </motion.div>
            )}

            {/* Dashboard Content for Apollo */}
            {activeTab === "Apollo" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
               >
                  {/* Apollo Header Card */}
                  <div className="bg-[#f7f9fa] border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                           <Zap size={24} />
                        </div>
                        <div>
                           <h2 className="text-lg font-black tracking-tight text-[#1a1510]">Apollo Analytics</h2>
                           <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-0.5">Performance, usage & impact metrics</p>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-lg bg-white border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/60 shadow-sm">
                        Connected
                     </span>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: "# Emails sent", val: "12,847", trend: "+18%", up: true },
                        { label: "# Emails replied", val: "892", trend: "+22%", up: true },
                        { label: "# Emails opened", val: "4,231", trend: "+15%", up: true },
                        { label: "# Emails scheduled", val: "342", trend: "", up: null },
                     ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all flex flex-col justify-between h-[100px]">
                           <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                           <div className="flex items-end justify-between mt-2">
                              <span className="text-2xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                              {m.trend && (
                                 <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {m.trend}
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Activity Trend Chart */}
                  <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                     <h3 className="text-sm font-bold text-[#1a1510] mb-8">Activity Trend</h3>
                     <div className="relative h-64 ml-8 mb-6">
                        {/* Y-Axis */}
                        <div className="absolute -left-8 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                           <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                        </div>

                        {/* Chart Grid Area */}
                        <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                           <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                        </div>

                        {/* Mock Area Chart (Blue) */}
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20 L100,100 L0,100 Z" fill="rgba(59, 130, 246, 0.1)" stroke="none" />
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>

                        {/* X-Axis */}
                        <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                           <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                        </div>
                     </div>
                  </div>

                  {/* METRIC LIBRARY Accordions */}
                  <div className="space-y-4 pt-4">
                     <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1a1510]/40 mb-2">
                        METRIC LIBRARY
                     </h2>

                     {/* Emails Accordion (Expanded) */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-[#1a1510]/5 cursor-pointer bg-white hover:bg-[#f7f9fa] transition-colors">
                           <div className="flex items-center gap-3">
                              <Mail size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">Emails</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">41</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40 rotate-180" />
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                           {[
                              { label: "# Emails sent", val: "12,847", trend: "+18%", up: true },
                              { label: "# Emails replied", val: "892", trend: "+22%", up: true },
                              { label: "# Emails opened", val: "4,231", trend: "+15%", up: true },
                              { label: "# Emails scheduled", val: "342" },
                              
                              { label: "# Contacts emailed", val: "8,924" },
                              { label: "# Accounts enrolled", val: "1,247" },
                              { label: "# Emails delivered", val: "12,612" },
                              { label: "# Emails delivered (open tracked)", val: "11,890" },
                              
                              { label: "# Emails delivered (click tracked)", val: "10,234" },
                              { label: "% Emails delivered", val: "98.2%" },
                              { label: "# Emails bounced", val: "235" },
                              { label: "# Emails bounced (Waterfall enriched)", val: "142" },
                              
                              { label: "# Emails bounced (Waterfall validated)", val: "93" },
                              { label: "% Emails bounced", val: "1.8%" },
                              { label: "# Positive sentiment emails", val: "524" },
                              { label: "% Positive sentiment emails", val: "58.7%" },
                              
                              { label: "# Negative sentiment emails", val: "89" },
                              { label: "% Negative sentiment emails", val: "9.9%" },
                              { label: "# Emails opened (bots included)", val: "5,124" },
                              { label: "% Emails opened (tracking enabled)", val: "35.6%" },
                              
                              { label: "% Emails opened (bots tracked)", val: "43.1%" },
                              { label: "# Emails clicked", val: "1,234" },
                              { label: "# Emails clicked (bots included)", val: "1,489" },
                              { label: "% Emails clicked (tracked)", val: "12.1%" },
                              
                              { label: "% Emails clicked (bots tracked)", val: "14.5%" },
                              { label: "# Emails replied (Waterfall enriched)", val: "742" },
                              { label: "# Emails replied (Waterfall validated)", val: "648" },
                              { label: "% Emails replied", val: "7.1%" },
                              
                              { label: "# Emails interested", val: "342", trend: "+18%", up: true },
                              { label: "% Emails interested", val: "38.3%" },
                              { label: "# Emails unsubscribed", val: "47" },
                              { label: "% Emails unsubscribed", val: "0.4%" },
                              
                              { label: "# Contacts interested", val: "298" },
                              { label: "# Contacts opened", val: "3,124" },
                              { label: "# Contacts replied", val: "742" },
                              { label: "% Contacts opened", val: "35.0%" },
                              
                              { label: "% Contacts replied", val: "8.3%" },
                              { label: "% Contacts interested", val: "3.3%" },
                              { label: "# Emails spam blocked", val: "12" },
                              { label: "% Emails spam blocked", val: "0.09%" },
                              
                              { label: "Email deliverability score", val: "94/100" }
                           ].map((m, i) => (
                              <div key={i} className="flex flex-col gap-2 pb-4 border-b border-[#1a1510]/5">
                                 <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">{m.label}</span>
                                 <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                    {m.trend && (
                                       <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                          {m.trend}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Other Accordions (Collapsed) */}
                     {[
                        { label: "Accounts", icon: Target, count: "11" },
                        { label: "Contacts", icon: Users, count: "16" },
                        { label: "Meetings", icon: Calendar, count: "2" },
                        { label: "CRM Enrichments", icon: Database, count: "16" },
                     ].map((acc, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-brand-gold/20 transition-all">
                           <div className="flex items-center gap-3">
                              <acc.icon size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">{acc.label}</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">{acc.count}</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40" />
                        </div>
                     ))}
                  </div>

               </motion.div>
            )}

            {/* Dashboard Content for Clay */}
            {activeTab === "Clay" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
               >
                  {/* Clay Header Card */}
                  <div className="bg-[#f7f9fa] border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                           <Target size={24} />
                        </div>
                        <div>
                           <h2 className="text-lg font-black tracking-tight text-[#1a1510]">Clay Analytics</h2>
                           <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-0.5">Performance, usage & impact metrics</p>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-lg bg-white border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/60 shadow-sm">
                        Connected
                     </span>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: "# Accounts Touched", val: "1,247", trend: "+9%", up: true },
                        { label: "# Accounts", val: "3,892", trend: "", up: null },
                        { label: "$ Account total revenue", val: "$2.4M", trend: "", up: null },
                        { label: "$ Account average revenue", val: "$617", trend: "", up: null },
                     ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all flex flex-col justify-between h-[100px]">
                           <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                           <div className="flex items-end justify-between mt-2">
                              <span className="text-2xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                              {m.trend && (
                                 <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {m.trend}
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Activity Trend Chart */}
                  <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                     <h3 className="text-sm font-bold text-[#1a1510] mb-8">Activity Trend</h3>
                     <div className="relative h-64 ml-8 mb-6">
                        {/* Y-Axis */}
                        <div className="absolute -left-8 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                           <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                        </div>

                        {/* Chart Grid Area */}
                        <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                           <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                        </div>

                        {/* Mock Area Chart (Orange) */}
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20 L100,100 L0,100 Z" fill="rgba(249, 115, 22, 0.1)" stroke="none" />
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20" fill="none" stroke="#f97316" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>

                        {/* X-Axis */}
                        <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                           <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                        </div>
                     </div>
                  </div>

                  {/* METRIC LIBRARY Accordions */}
                  <div className="space-y-4 pt-4">
                     <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1a1510]/40 mb-2">
                        METRIC LIBRARY
                     </h2>

                     {/* Accounts Accordion (Expanded) */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-[#1a1510]/5 cursor-pointer bg-white hover:bg-[#f7f9fa] transition-colors">
                           <div className="flex items-center gap-3">
                              <Building2 size={16} className="text-orange-500" />
                              <span className="text-sm font-bold text-[#1a1510]">Accounts</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">11</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40 rotate-180" />
                        </div>
                        <div className="p-6 bg-[#f7f9fa] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {[
                              { label: "# Accounts Touched", val: "1,247", trend: "+9%", up: true },
                              { label: "# Accounts", val: "3,892" },
                              { label: "$ Account total revenue", val: "$2.4M" },
                              { label: "$ Account average revenue", val: "$617" },
                              
                              { label: "# CRM accounts", val: "3,124" },
                              { label: "# Accounts Changing Stage", val: "89" },
                              { label: "# Accounts emailed", val: "1,247" },
                              { label: "# Accounts called", val: "156" },
                              
                              { label: "# Accounts in Stage", val: "524" },
                              { label: "# Accounts Changing to Stage", val: "67" },
                              { label: "# Accounts Changing from Stage", val: "42" },
                           ].map((m, i) => (
                              <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                                 <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                                 <div className="flex items-end justify-between mt-2">
                                    <span className="text-xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                    {m.trend && (
                                       <span className={`text-[9px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                          {m.trend}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Other Accordions (Collapsed) */}
                     {[
                        { label: "Contacts", icon: Users, count: "16" },
                        { label: "Person", icon: User, count: "1" },
                        { label: "Company", icon: Building, count: "1" },
                        { label: "CRM Enrichments", icon: Database, count: "16" },
                     ].map((acc, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-brand-gold/20 transition-all">
                           <div className="flex items-center gap-3">
                              <acc.icon size={16} className="text-orange-500" />
                              <span className="text-sm font-bold text-[#1a1510]">{acc.label}</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">{acc.count}</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40" />
                        </div>
                     ))}
                  </div>

               </motion.div>
            )}

            {/* Dashboard Content for Smartlead */}
            {activeTab === "Smartlead" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
               >
                  {/* Smartlead Header Card */}
                  <div className="bg-[#f7f9fa] border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                           <Mail size={24} />
                        </div>
                        <div>
                           <h2 className="text-lg font-black tracking-tight text-[#1a1510]">Smartlead Analytics</h2>
                           <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-0.5">Performance, usage & impact metrics</p>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-lg bg-white border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/60 shadow-sm">
                        Connected
                     </span>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: "# Emails sent", val: "12,847", trend: "+18%", up: true },
                        { label: "# Emails replied", val: "892", trend: "+22%", up: true },
                        { label: "# Emails opened", val: "4,231", trend: "+15%", up: true },
                        { label: "# Emails scheduled", val: "342", trend: "", up: null },
                     ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all flex flex-col justify-between h-[100px]">
                           <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                           <div className="flex items-end justify-between mt-2">
                              <span className="text-2xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                              {m.trend && (
                                 <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {m.trend}
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Activity Trend Chart */}
                  <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                     <h3 className="text-sm font-bold text-[#1a1510] mb-8">Activity Trend</h3>
                     <div className="relative h-64 ml-8 mb-6">
                        {/* Y-Axis */}
                        <div className="absolute -left-8 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                           <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                        </div>

                        {/* Chart Grid Area */}
                        <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                           <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                        </div>

                        {/* Mock Area Chart (Green) */}
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20 L100,100 L0,100 Z" fill="rgba(34, 197, 94, 0.1)" stroke="none" />
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>

                        {/* X-Axis */}
                        <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                           <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                        </div>
                     </div>
                  </div>

                  {/* METRIC LIBRARY Accordions */}
                  <div className="space-y-4 pt-4">
                     <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1a1510]/40 mb-2">
                        METRIC LIBRARY
                     </h2>

                     {/* Emails Accordion (Expanded) */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-[#1a1510]/5 cursor-pointer bg-white hover:bg-[#f7f9fa] transition-colors">
                           <div className="flex items-center gap-3">
                              <Mail size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">Emails</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">41</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40 rotate-180" />
                        </div>
                        <div className="p-6 bg-[#f7f9fa] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {[
                              { label: "# Emails sent", val: "12,847", trend: "+18%", up: true },
                              { label: "# Emails replied", val: "892", trend: "+22%", up: true },
                              { label: "# Emails opened", val: "4,231", trend: "+15%", up: true },
                              { label: "# Emails scheduled", val: "342" },
                              
                              { label: "# Contacts emailed", val: "8,924" },
                              { label: "# Accounts enrolled", val: "1,247" },
                              { label: "# Emails delivered", val: "12,612" },
                              { label: "# Emails delivered (open tracked)", val: "11,890" },
                              
                              { label: "# Emails delivered (click tracked)", val: "10,234" },
                              { label: "% Emails delivered", val: "98.2%" },
                              { label: "# Emails bounced", val: "235" },
                              { label: "# Emails bounced (Waterfall enriched)", val: "142" },
                              
                              { label: "# Emails bounced (Waterfall validated)", val: "93" },
                              { label: "% Emails bounced", val: "1.8%" },
                              { label: "# Positive sentiment emails", val: "524" },
                              { label: "% Positive sentiment emails", val: "58.7%" },
                              
                              { label: "# Negative sentiment emails", val: "89" },
                              { label: "% Negative sentiment emails", val: "9.9%" },
                              { label: "# Emails opened (bots included)", val: "5,124" },
                              { label: "% Emails opened (tracking enabled)", val: "35.6%" },
                              
                              { label: "% Emails opened (bots tracked)", val: "43.1%" },
                              { label: "# Emails clicked", val: "1,234" },
                              { label: "# Emails clicked (bots included)", val: "1,489" },
                              { label: "% Emails clicked (tracked)", val: "12.1%" },
                              
                              { label: "% Emails clicked (bots tracked)", val: "14.5%" },
                              { label: "# Emails replied (Waterfall enriched)", val: "742" },
                              { label: "# Emails replied (Waterfall validated)", val: "648" },
                              { label: "% Emails replied", val: "7.1%" },
                              
                              { label: "# Emails interested", val: "342", trend: "+18%", up: true },
                              { label: "% Emails interested", val: "38.3%" },
                              { label: "# Emails unsubscribed", val: "47" },
                              { label: "% Emails unsubscribed", val: "0.4%" },
                              
                              { label: "# Contacts interested", val: "298" },
                              { label: "# Contacts opened", val: "3,124" },
                              { label: "# Contacts replied", val: "742" },
                              { label: "% Contacts opened", val: "35.0%" },
                              
                              { label: "% Contacts replied", val: "8.3%" },
                              { label: "% Contacts interested", val: "3.3%" },
                              { label: "# Emails spam blocked", val: "12" },
                              { label: "% Emails spam blocked", val: "0.09%" },
                              
                              { label: "Email deliverability score", val: "94/100" }
                           ].map((m, i) => (
                              <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                                 <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                                 <div className="flex items-end justify-between mt-2">
                                    <span className="text-xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                    {m.trend && (
                                       <span className={`text-[9px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                          {m.trend}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Other Accordions (Collapsed) */}
                     {[
                        { label: "Tasks", icon: CheckSquare, count: "13" },
                     ].map((acc, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-brand-gold/20 transition-all">
                           <div className="flex items-center gap-3">
                              <acc.icon size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">{acc.label}</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">{acc.count}</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40" />
                        </div>
                     ))}
                  </div>

               </motion.div>
            )}

            {/* Dashboard Content for HeyReach */}
            {activeTab === "HeyReach" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
               >
                  {/* HeyReach Header Card */}
                  <div className="bg-[#f7f9fa] border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                           <Linkedin size={24} />
                        </div>
                        <div>
                           <h2 className="text-lg font-black tracking-tight text-[#1a1510]">HeyReach Analytics</h2>
                           <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-0.5">Performance, usage & impact metrics</p>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-lg bg-white border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/60 shadow-sm">
                        Connected
                     </span>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: "# Tasks", val: "892", trend: "", up: null },
                        { label: "# Tasks scheduled", val: "247", trend: "", up: null },
                        { label: "# Tasks completed or archived", val: "645", trend: "", up: null },
                        { label: "# Tasks completed", val: "598", trend: "+12%", up: true },
                     ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all flex flex-col justify-between h-[100px]">
                           <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                           <div className="flex items-end justify-between mt-2">
                              <span className="text-2xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                              {m.trend && (
                                 <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {m.trend}
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Activity Trend Chart */}
                  <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                     <h3 className="text-sm font-bold text-[#1a1510] mb-8">Activity Trend</h3>
                     <div className="relative h-64 ml-8 mb-6">
                        {/* Y-Axis */}
                        <div className="absolute -left-8 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                           <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                        </div>

                        {/* Chart Grid Area */}
                        <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                           <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                        </div>

                        {/* Mock Area Chart (Purple) */}
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20 L100,100 L0,100 Z" fill="rgba(168, 85, 247, 0.1)" stroke="none" />
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20" fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>

                        {/* X-Axis */}
                        <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                           <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                        </div>
                     </div>
                  </div>

                  {/* METRIC LIBRARY Accordions */}
                  <div className="space-y-4 pt-4">
                     <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1a1510]/40 mb-2">
                        METRIC LIBRARY
                     </h2>

                     {/* Tasks Accordion (Expanded) */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-[#1a1510]/5 cursor-pointer bg-white hover:bg-[#f7f9fa] transition-colors">
                           <div className="flex items-center gap-3">
                              <CheckSquare size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">Tasks</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">13</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40 rotate-180" />
                        </div>
                        <div className="p-6 bg-[#f7f9fa] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {[
                              { label: "# Tasks", val: "892" },
                              { label: "# Tasks scheduled", val: "247" },
                              { label: "# Tasks completed or archived", val: "645" },
                              { label: "# Tasks completed", val: "598", trend: "+12%", up: true },
                              
                              { label: "% Tasks completed", val: "67.0%" },
                              { label: "# Tasks completed on time", val: "524" },
                              { label: "% Tasks completed on time", val: "87.6%" },
                              { label: "% Total tasks completed on time", val: "58.7%" },
                              
                              { label: "# Tasks archived", val: "47" },
                              { label: "% Tasks archived", val: "5.3%" },
                              { label: "# Overdue tasks", val: "34" },
                              { label: "# Unfinished overdue tasks", val: "21" },
                              
                              { label: "% Unfinished overdue tasks", val: "2.4%" }
                           ].map((m, i) => (
                              <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                                 <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                                 <div className="flex items-end justify-between mt-2">
                                    <span className="text-xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                    {m.trend && (
                                       <span className={`text-[9px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                          {m.trend}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Other Accordions (Collapsed) */}
                     {[
                        { label: "LinkedIn Tasks", icon: Linkedin, count: "0" },
                        { label: "Contacts", icon: Users, count: "16" },
                     ].map((acc, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-brand-gold/20 transition-all">
                           <div className="flex items-center gap-3">
                              <acc.icon size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">{acc.label}</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">{acc.count}</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40" />
                        </div>
                     ))}
                  </div>

               </motion.div>
            )}

            {/* Dashboard Content for Salesforce */}
            {activeTab === "Salesforce" && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
               >
                  {/* Salesforce Header Card */}
                  <div className="bg-[#f7f9fa] border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                           <Briefcase size={24} />
                        </div>
                        <div>
                           <h2 className="text-lg font-black tracking-tight text-[#1a1510]">Salesforce Analytics</h2>
                           <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-0.5">Performance, usage & impact metrics</p>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-lg bg-white border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/60 shadow-sm">
                        Connected
                     </span>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: "# Accounts Touched", val: "1,247", trend: "+9%", up: true },
                        { label: "# Accounts", val: "3,892", trend: "", up: null },
                        { label: "$ Account total revenue", val: "$2.4M", trend: "", up: null },
                        { label: "$ Account average revenue", val: "$617", trend: "", up: null },
                     ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all flex flex-col justify-between h-[100px]">
                           <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                           <div className="flex items-end justify-between mt-2">
                              <span className="text-2xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                              {m.trend && (
                                 <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {m.trend}
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Activity Trend Chart */}
                  <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
                     <h3 className="text-sm font-bold text-[#1a1510] mb-8">Activity Trend</h3>
                     <div className="relative h-64 ml-8 mb-6">
                        {/* Y-Axis */}
                        <div className="absolute -left-8 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-bold text-[#1a1510]/30 py-1">
                           <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                        </div>

                        {/* Chart Grid Area */}
                        <div className="absolute inset-0 border-l border-b border-[#1a1510]/10">
                           <div className="absolute top-[25%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[50%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                           <div className="absolute top-[75%] inset-x-0 border-t border-[#1a1510]/5 border-dashed" />
                        </div>

                        {/* Mock Area Chart (Blue) */}
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20 L100,100 L0,100 Z" fill="rgba(14, 165, 233, 0.1)" stroke="none" />
                           <path d="M0,90 L20,85 L40,75 L60,55 L80,40 L100,20" fill="none" stroke="#0ea5e9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>

                        {/* X-Axis */}
                        <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold text-[#1a1510]/30">
                           <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                        </div>
                     </div>
                  </div>

                  {/* METRIC LIBRARY Accordions */}
                  <div className="space-y-4 pt-4">
                     <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1a1510]/40 mb-2">
                        METRIC LIBRARY
                     </h2>

                     {/* Accounts Accordion (Expanded) */}
                     <div className="bg-white border border-[#1a1510]/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-[#1a1510]/5 cursor-pointer bg-white hover:bg-[#f7f9fa] transition-colors">
                           <div className="flex items-center gap-3">
                              <Building2 size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">Accounts</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">11</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40 rotate-180" />
                        </div>
                        <div className="p-6 bg-[#f7f9fa] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {[
                              { label: "# Accounts Touched", val: "1,247", trend: "+9%", up: true },
                              { label: "# Accounts", val: "3,892" },
                              { label: "$ Account total revenue", val: "$2.4M" },
                              { label: "$ Account average revenue", val: "$617" },
                              
                              { label: "# CRM accounts", val: "3,124" },
                              { label: "# Accounts Changing Stage", val: "89" },
                              { label: "# Accounts emailed", val: "1,247" },
                              { label: "# Accounts called", val: "156" },
                              
                              { label: "# Accounts in Stage", val: "524" },
                              { label: "# Accounts Changing to Stage", val: "67" },
                              { label: "# Accounts Changing from Stage", val: "42" },
                           ].map((m, i) => (
                              <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                                 <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{m.label}</span>
                                 <div className="flex items-end justify-between mt-2">
                                    <span className="text-xl font-black text-[#1a1510] tracking-tight">{m.val}</span>
                                    {m.trend && (
                                       <span className={`text-[9px] font-bold flex items-center gap-0.5 ${m.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                          {m.trend}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Other Accordions (Collapsed) */}
                     {[
                        { label: "Contacts", icon: Users, count: "16" },
                        { label: "Deals", icon: BarChart3, count: "14" },
                        { label: "CRM Enrichments", icon: Database, count: "16" },
                     ].map((acc, i) => (
                        <div key={i} className="bg-white border border-[#1a1510]/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-brand-gold/20 transition-all">
                           <div className="flex items-center gap-3">
                              <acc.icon size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#1a1510]">{acc.label}</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-bold text-[#1a1510]/60">{acc.count}</span>
                           </div>
                           <ChevronDown size={16} className="text-[#1a1510]/40" />
                        </div>
                     ))}
                  </div>

               </motion.div>
            )}
         </main>
      </div>
   );
};
