"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, ShieldCheck, Zap, Cpu, Activity, Clock, Search, Target, Mail, 
  MessageSquare, LayoutDashboard, Terminal, Settings2, RotateCcw, 
  Database, Plus, ChevronRight, CheckCircle, AlertTriangle, XCircle, 
  Globe, Play, Pause, RefreshCw, Layers, TrendingUp, BarChart3, Users, Sparkles,
  ArrowUpRight, ArrowDownRight, Filter, Download, MoreHorizontal, MousePointer2,
  Lock, ZapOff, History, LayoutPanelLeft, LineChart
} from "lucide-react";

// --- Mock Data ---
const DASHBOARD_DATA = {
  kpis: [
    { label: "GTM HEALTH", value: "94%", change: "+2%", trend: "up", sparkline: [40, 50, 45, 60, 55, 70, 65, 80] },
    { label: "ACTIVE", value: "4", change: "4 running", trend: "neutral", sparkline: [30, 30, 30, 30, 30, 30, 30, 30] },
    { label: "REPLY RATE", value: "2.5%", change: "+1.2% vs last week", trend: "up", sparkline: [20, 25, 22, 30, 28, 35, 32, 40] },
    { label: "MEETINGS", value: "18", change: "+3 today", trend: "up", sparkline: [10, 15, 12, 18, 16, 22, 18, 25] },
    { label: "PIPELINE", value: "$840K", change: "+$28k this week", trend: "up", sparkline: [50, 60, 55, 75, 70, 85, 80, 95] },
    { label: "AT RISK", value: "$12K", change: "2 campaigns", trend: "down", sparkline: [80, 70, 75, 60, 65, 50, 55, 40] },
    { label: "DELIVERABILITY", value: "98.2%", change: "Healthy", trend: "neutral", sparkline: [90, 92, 91, 95, 94, 98, 97, 98] },
    { label: "UNLOCKED", value: "$42K", change: "Recoverable", trend: "up", sparkline: [5, 15, 10, 25, 20, 35, 30, 42] },
  ],
  aiOperator: {
    status: "Online",
    mode: "Assisted", // Manual, Assisted, Autopilot
    protectedRevenue: "$213,256",
    unlockedRevenue: "$42,500",
    safeActions: 5,
    risksAvoided: 3,
  },
  priorities: [
    { id: 1, type: "HIGH RISK", entity: "Nike", title: "Reply to 4 high-intent leads", impact: "$85K pipeline at risk if delayed", color: "text-red-500", bg: "bg-red-50" },
    { id: 2, type: "HIGH RISK", entity: "Samsung EU", title: "Fix deliverability issue", impact: "Bounce rate at 6.2% — above safe threshold", color: "text-red-500", bg: "bg-red-50" },
    { id: 3, type: "MEDIUM", entity: "Multiple", title: "Approve 132 lead re-enrichments", impact: "Stalled leads can be recovered with fresh data", color: "text-[#D4AF37]", bg: "bg-brand-gold/5" },
  ],
  recommendations: [
    { entity: "Samsung EU", title: "Pause Samsung EU for 4h", impact: "Bounce rate 4.2% above threshold", benefit: "Protects $185K pipeline", icon: Pause },
    { entity: "Nike", title: "Increase volume +15%", impact: "Reply rate 2.2% above benchmark", benefit: "+$28K estimated pipeline", icon: TrendingUp },
  ],
  liveActivity: [
    { icon: Search, entity: "Nike", text: "200 leads imported from Apollo", time: "2m ago" },
    { icon: Zap, entity: "Nike", text: "180 leads enriched in Clay", time: "8m ago" },
    { icon: Mail, entity: "Mercedes", text: "Email bounced — invalid domain", time: "35m ago", type: "error" },
  ],
  healthTable: [
    { name: "Cold Outbound — VP Sales", status: "Active", health: "92%", tools: ["Apollo", "Clay"], replies: 24, mtgs: 6, pipeline: "$185K" },
    { name: "LinkedIn Nurture — Engineering", status: "Active", health: "78%", tools: ["HeyReach"], replies: 12, mtgs: 2, pipeline: "$45K" },
    { name: "Launch Campaign — Email", status: "Active", health: "84%", tools: ["Smartlead", "Clay"], replies: 18, mtgs: 4, pipeline: "$120K" },
    { name: "EU Expansion — Multi-channel", status: "Paused", health: "65%", tools: ["Apollo", "Smartlead"], replies: 8, mtgs: 1, pipeline: "$32K" },
    { name: "AI Startup Founders", status: "Pending", health: "—", tools: ["Apollo"], replies: 0, mtgs: 0, pipeline: "—" },
  ]
};

interface CommandCenterProps {
  onBackToDashboard: () => void;
  onOpenAccounts: () => void;
}

export const CommandCenter = ({ onBackToDashboard, onOpenAccounts }: CommandCenterProps) => {
  const [operatorMode, setOperatorMode] = useState<"Manual" | "Assisted" | "Autopilot">("Assisted");

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#D4AF37]/30">
      {/* 1. Sub-Header Navigation */}
      <header className="h-16 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <motion.div 
               whileHover={{ rotate: 180 }}
               className="p-2 bg-[#1a1510] text-[#D4AF37] rounded-lg shadow-lg"
            >
              <Terminal size={18} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-[#1a1510] uppercase">Command Centre</h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Operating Room
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-widest">Real-time GTM system control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">

          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToDashboard}
              className="h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
            >
              <LayoutDashboard size={14} /> Back to Hub
            </button>
            <button className="h-10 px-6 rounded-xl bg-[#1a1510] text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl hover:translate-y-[-1px] transition-all">
              <Plus size={14} /> Quick Action
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        
        {/* 2. Metric Header (The Ribbon) */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {DASHBOARD_DATA.kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.4)" }}
              className="bg-white p-4 rounded-2xl border border-[#1a1510]/5 flex flex-col justify-between h-32 group transition-all shadow-sm hover:shadow-md cursor-default"
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black text-[#1a1510]/30 tracking-[0.2em] uppercase">{kpi.label}</span>
                <div className={`p-1 rounded-md ${kpi.trend === 'up' ? 'text-emerald-500 bg-emerald-50' : kpi.trend === 'down' ? 'text-red-500 bg-red-50' : 'text-[#1a1510]/20 bg-[#f7f8f9]'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : kpi.trend === 'down' ? <ArrowDownRight size={10} /> : <Activity size={10} />}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-black text-[#1a1510] tracking-tighter mb-0.5">{kpi.value}</h3>
                <p className={`text-[8px] font-bold uppercase tracking-wider ${kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-[#1a1510]/30'}`}>
                  {kpi.change}
                </p>
              </div>

              {/* Minimal Sparkline */}
              <div className="h-6 flex items-end gap-[2px] mt-2 opacity-20 group-hover:opacity-100 transition-opacity">
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

        {/* 3. Global Action Bar */}
        <section className="flex flex-wrap items-center gap-3 py-2 bg-[#f7f8f9]/50 p-4 rounded-3xl border border-[#1a1510]/5">
          {[
            { icon: Pause, label: "Pause All" },
            { icon: Play, label: "Resume All" },
            { icon: ArrowDownRight, label: "Reduce Volume" },
            { icon: ArrowUpRight, label: "Increase Volume" },
            { icon: RefreshCw, label: "Re-enrich" },
            { icon: Users, label: "Reassign Leads" },
            { icon: Sparkles, label: "Optimize" },
          ].map((action, i) => (
            <button 
              key={i} 
              className="h-10 px-4 rounded-xl border border-[#1a1510]/5 bg-white text-[9px] font-black uppercase tracking-[0.15em] text-[#1a1510]/50 hover:text-[#1a1510] hover:border-brand-gold/30 hover:shadow-sm transition-all flex items-center gap-3"
            >
              <action.icon size={14} className="text-[#1a1510]/30" />
              {action.label}
            </button>
          ))}
          <div className="flex-1" />
          <button 
            onClick={onOpenAccounts}
            className="h-10 px-8 rounded-xl bg-brand-gold text-[#1a1510] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:translate-y-[-1px] transition-all shadow-lg shadow-brand-gold/20"
          >
            <Lock size={14} />
            Open Accounts
          </button>
        </section>

        {/* 4. The AI Operator Hero Section */}
        <section className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-[3rem] border border-[#1a1510]/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-brand-gold/20 rounded-full blur-2xl group-hover:bg-brand-gold/30 transition-all duration-700 animate-pulse" />
                  <div className="w-20 h-20 rounded-3xl bg-[#1a1510] border border-brand-gold/20 flex items-center justify-center text-brand-gold relative z-10 shadow-2xl">
                    <Bot size={40} className="group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                    <h2 className="text-3xl font-black text-[#1a1510] tracking-tighter">AI Operator</h2>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SYSTEM NOMINAL
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#1a1510]/40 max-w-sm leading-relaxed uppercase tracking-widest leading-loose">
                    Monitoring system egress & deliverability layers — real-time optimization active across <span className="text-brand-gold font-black">4 active vectors.</span>
                  </p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="bg-[#f7f8f9] p-2 rounded-2xl border border-[#1a1510]/5 flex items-center gap-1 shrink-0">
                {(["Manual", "Assisted", "Autopilot"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOperatorMode(mode)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      operatorMode === mode 
                        ? "bg-white text-[#1a1510] shadow-md ring-1 ring-[#1a1510]/5" 
                        : "text-[#1a1510]/30 hover:text-[#1a1510]/50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Operator Stats Ribbon */}
            <div className="border-t border-[#1a1510]/5 bg-[#fcfcfc] grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1a1510]/5">
              {[
                { label: "Revenue Protected", value: DASHBOARD_DATA.aiOperator.protectedRevenue, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Revenue Unlocked", value: DASHBOARD_DATA.aiOperator.unlockedRevenue, icon: Sparkles, color: "text-brand-gold", bg: "bg-brand-gold/5" },
                { label: "Safe Actions Ready", value: DASHBOARD_DATA.aiOperator.safeActions, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Risks Avoided", value: DASHBOARD_DATA.aiOperator.risksAvoided, icon: Target, color: "text-red-600", bg: "bg-red-50" },
              ].map((stat, i) => (
                <div key={i} className="p-8 hover:bg-white transition-all group">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                      <stat.icon size={16} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1a1510] tracking-tighter">{stat.value}</span>
                    {i < 2 && <span className="text-[10px] font-black text-emerald-500">↑ 12%</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white border-t border-[#1a1510]/5 flex items-center justify-between px-10">
               <span className="text-[10px] font-bold text-[#1a1510]/20 uppercase tracking-[0.2em] italic">Manual mode active — recommendations shown below require approval</span>
               <button className="text-[10px] font-black text-brand-gold uppercase tracking-[0.15em] flex items-center gap-2 group hover:underline underline-offset-4">
                  View Logic History <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        </section>

        {/* 5. Split Body Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Priorities (4 Cols) */}
          <section className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#1a1510] text-[#D4AF37] rounded-lg"><Target size={16} /></div>
                  <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Top Priorities</h3>
               </div>
               <span className="text-[10px] font-bold text-[#1a1510]/20 uppercase">Global Queue</span>
            </div>

            <div className="space-y-4">
              {DASHBOARD_DATA.priorities.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-3xl bg-white border border-[#1a1510]/5 group hover:border-brand-gold/30 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-gold opacity-10 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded shadow-sm ${item.bg} ${item.color} uppercase tracking-widest`}>{item.type}</span>
                    <span className="text-[10px] font-black text-[#1a1510]/20 uppercase">{item.entity}</span>
                  </div>
                  <h4 className="text-sm font-black text-[#1a1510] mb-1 group-hover:text-brand-gold transition-colors">{item.title}</h4>
                  <p className="text-[10px] font-medium text-[#1a1510]/40 leading-relaxed uppercase tracking-widest">{item.impact}</p>
                </motion.div>
              ))}
              
              <div className="p-8 rounded-[2.5rem] bg-[#1a1510] text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={100} className="text-brand-gold" strokeWidth={1} />
                 </div>
                 <div className="relative z-10">
                    <h5 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <LineChart size={14} /> Recovery Forecast
                    </h5>
                    <p className="text-4xl font-black tracking-tighter mb-1">+$42.5K</p>
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-8">Potential monthly lift</p>
                    <button className="w-full py-4 rounded-2xl bg-brand-gold text-[#1a1510] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-brand-gold/20 transition-all">
                       Run Simulation
                    </button>
                 </div>
              </div>
            </div>
          </section>

          {/* Column 2: Recommendations (4 Cols) */}
          <section className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#1a1510] text-[#D4AF37] rounded-lg"><Zap size={16} /></div>
                  <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Smart Actions</h3>
               </div>
               <button className="text-[9px] font-black text-brand-gold uppercase hover:underline">Apply All</button>
            </div>

            <div className="space-y-4">
              {DASHBOARD_DATA.recommendations.map((rec, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white border border-[#1a1510]/5 hover:shadow-lg transition-all group">
                   <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/40 group-hover:bg-[#1a1510] group-hover:text-brand-gold transition-all">
                         <rec.icon size={18} />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black text-[#1a1510] leading-none mb-1">{rec.title}</h4>
                            <span className="text-[9px] font-bold text-[#1a1510]/20 uppercase">{rec.entity}</span>
                         </div>
                         <p className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-wider">{rec.impact}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5">
                      <div>
                         <span className="text-[8px] font-black text-[#1a1510]/30 uppercase block">Projected Benefit</span>
                         <span className="text-[10px] font-black text-emerald-600 uppercase">{rec.benefit}</span>
                      </div>
                      <button className="h-9 px-5 rounded-xl bg-[#1a1510] text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-[#1a1510] transition-colors">Apply</button>
                   </div>
                </div>
              ))}
              
              <div className="h-44 rounded-3xl border-2 border-dashed border-[#1a1510]/10 flex flex-col items-center justify-center text-center p-8 grayscale hover:grayscale-0 transition-all cursor-help">
                 <Sparkles size={32} className="text-brand-gold mb-3 opacity-20" />
                 <p className="text-[10px] font-black text-[#1a1510]/20 uppercase tracking-[0.2em]">Analyzing campaign performance for new optimization slots...</p>
              </div>
            </div>
          </section>

          {/* Column 3: Impact & Risks (4 Cols) */}
          <section className="lg:col-span-4 space-y-8">
             <div className="bg-white p-7 rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-[#f7f8f9] text-[#1a1510]/40 rounded-lg"><BarChart3 size={16} /></div>
                   <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Account Impact</h3>
                </div>
                
                <div className="space-y-6">
                   {[
                      { label: "Mercedes GLS Launch", progress: 85, color: "bg-brand-gold", info: "38% of monthly pipeline" },
                      { label: "Nike Global Grid", progress: 62, color: "bg-[#1a1510]", info: "22% of monthly pipeline" },
                      { label: "Stripe Unified", progress: 41, color: "bg-[#1a1510]/40", info: "11% of monthly pipeline" },
                   ].map((item, i) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-[#1a1510]/60 uppercase tracking-widest">{item.label}</span>
                            <span className="text-[10px] font-black text-[#1a1510]">{item.progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-[#f7f8f9] rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${item.progress}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className={`h-full ${item.color} rounded-full`}
                            />
                         </div>
                         <p className="text-[9px] font-bold text-[#1a1510]/20 uppercase italic">{item.info}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-white p-7 rounded-[2.5rem] border border-red-500/10 shadow-sm space-y-6 border-l-[6px] border-l-red-500/20">
                <div className="flex items-center gap-3">
                   <AlertTriangle size={18} className="text-red-500" />
                   <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Risk Zones</h3>
                </div>
                <div className="space-y-3">
                   {[
                      { label: "Low reply campaigns", val: "3 units", lvl: "High" },
                      { label: "Deliverability alert", val: "1 unit", lvl: "Med" },
                   ].map((risk, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#f7f8f9] rounded-2xl border border-[#1a1510]/5 hover:border-red-500/20 transition-all cursor-pointer">
                         <div>
                            <p className="text-[10px] font-black text-[#1a1510]/60 uppercase">{risk.label}</p>
                            <p className="text-[9px] font-bold text-[#1a1510]/20 uppercase">{risk.val}</p>
                         </div>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded shadow-sm ${risk.lvl === 'High' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'} uppercase`}>{risk.lvl}</span>
                      </div>
                   ))}
                </div>
                <button className="w-full mt-4 py-3 bg-red-500/5 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-colors">Resolve Anomalies</button>
             </div>
          </section>
        </div>

        {/* 6. Bottom Grid: Activity & Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-32">
           {/* Activity Log (4 Cols) */}
           <section className="xl:col-span-4 space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#f7f8f9] text-[#1a1510]/40 rounded-lg"><Activity size={16} /></div>
                    <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Live Orchestration</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-black text-[#1a1510]/20 uppercase">Streaming</span>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-8 relative overflow-hidden h-[500px] flex flex-col shadow-sm">
                 <div className="flex-1 overflow-y-auto pr-2 space-y-8 relative">
                    {/* Timeline bar */}
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-[#1a1510]/5" />
                    
                    {DASHBOARD_DATA.liveActivity.concat([
                       { icon: MousePointer2, entity: "Mercedes", text: "Link clicked: Calendly - Nina Patel", time: "1h ago" },
                       { icon: MessageSquare, entity: "Stripe", text: "Positive sentiment reply from CTIO", time: "2h ago", type: "success" },
                       { icon: RotateCcw, entity: "System", text: "Daily sync completed for 12,482 records", time: "3h ago" },
                       { icon: CheckCircle, entity: "Nike", text: "Campaign goal reached: 15 meetings", time: "4h ago", type: "success" },
                    ]).map((ev, i) => (
                       <div key={i} className="flex gap-6 relative group z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-md z-20 shrink-0 ${
                             ev.type === 'error' ? 'bg-red-500 text-white' : ev.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-[#1a1510] text-brand-gold'
                          }`}>
                             <ev.icon size={12} />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start mb-0.5">
                                <p className="text-[11px] font-black text-[#1a1510]/80 leading-tight">{ev.text}</p>
                                <span className="text-[8px] font-bold text-[#1a1510]/20 uppercase ml-4">{ev.time}</span>
                             </div>
                             <p className="text-[9px] font-black text-brand-gold uppercase tracking-widest">{ev.entity}</p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button className="mt-8 py-3 w-full border border-[#1a1510]/5 rounded-xl text-[9px] font-black uppercase text-[#1a1510]/30 hover:bg-[#f7f8f9] transition-all">Audit system logs</button>
              </div>
           </section>

           {/* Performance Table (8 Cols) */}
           <section className="xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#f7f8f9] text-[#1a1510]/40 rounded-lg"><LayoutPanelLeft size={16} /></div>
                    <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Campaign Health</h3>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex bg-[#f7f8f9] p-1 rounded-xl border border-[#1a1510]/5">
                       <button className="px-4 py-1.5 rounded-lg bg-white text-[9px] font-black text-[#1a1510] uppercase shadow-sm">Active</button>
                       <button className="px-4 py-1.5 rounded-lg text-[9px] font-black text-[#1a1510]/30 uppercase">Paused</button>
                    </div>
                    <button className="p-2.5 bg-white rounded-xl border border-[#1a1510]/5 text-[#1a1510]/30 hover:text-brand-gold transition-colors shadow-sm"><Filter size={14} /></button>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm overflow-hidden border-b-[8px] border-b-brand-gold/20">
                 <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                       <thead className="bg-[#fcfcfc] border-b border-[#1a1510]/5 text-left">
                          <tr>
                             <th className="py-5 px-8 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Campaign</th>
                             <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Status</th>
                             <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Health</th>
                             <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Protocol</th>
                             <th className="py-5 px-8 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-right">Pipeline</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[#1a1510]/5">
                          {DASHBOARD_DATA.healthTable.map((row, i) => (
                             <tr key={i} className="hover:bg-[#f7f8f9] transition-colors group cursor-pointer">
                                <td className="py-6 px-8">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold group-hover:bg-[#1a1510] transition-all">
                                         <Plus size={16} />
                                      </div>
                                      <div>
                                         <p className="text-xs font-black text-[#1a1510] group-hover:text-brand-gold transition-colors">{row.name}</p>
                                         <p className="text-[10px] font-bold text-[#1a1510]/20 uppercase">Global Scale</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-6 px-4 text-center">
                                   <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                      row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 
                                      row.status === 'Paused' ? 'bg-orange-500/10 text-orange-600' : 'bg-[#1a1510]/5 text-[#1a1510]/40'
                                   }`}>
                                      {row.status}
                                   </span>
                                </td>
                                <td className="py-6 px-4 text-center">
                                   <div className="flex flex-col items-center gap-1.5">
                                      <div className="w-16 h-1.5 bg-[#f7f8f9] rounded-full overflow-hidden shadow-inner">
                                         <div 
                                            className={`h-full rounded-full ${parseInt(row.health) > 80 ? 'bg-emerald-500' : 'bg-brand-gold'}`} 
                                            style={{ width: row.health === '—' ? '0%' : row.health }} 
                                         />
                                      </div>
                                      <span className="text-[9px] font-black text-[#1a1510]/60">{row.health}</span>
                                   </div>
                                </td>
                                <td className="py-6 px-4">
                                   <div className="flex items-center justify-center -space-x-1.5">
                                      {row.tools.map((t, ti) => (
                                         <div key={ti} className="w-6 h-6 rounded-full bg-white border border-[#1a1510]/10 flex items-center justify-center text-[7px] font-black text-[#1a1510]/30 z-10">
                                            {t[0]}
                                         </div>
                                      ))}
                                   </div>
                                </td>
                                <td className="py-6 px-8 text-right">
                                   <div className="flex flex-col items-end">
                                      <span className="text-xs font-black text-[#1a1510]">{row.pipeline}</span>
                                      <span className="text-[9px] font-bold text-[#1a1510]/20 uppercase">{row.replies} Replies • {row.mtgs} Mtgs</span>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-5 bg-[#fcfcfc] border-t border-[#1a1510]/5 flex items-center justify-between px-10">
                    <span className="text-[10px] font-black text-[#1a1510]/20 uppercase tracking-widest italic">Target node saturation at 84% optimal levels</span>
                    <button className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] flex items-center gap-3 group">
                       Launch Optimizer <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
           </section>
        </div>

      </main>
    </div>
  );
};
