"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, ShieldCheck, Zap, Cpu, Activity, Clock, Search, Target, Mail, 
  MessageSquare, LayoutDashboard, Terminal, Settings2, RotateCcw, 
  Database, Plus, ChevronRight, CheckCircle, AlertTriangle, XCircle, 
  Globe, Play, Pause, RefreshCw, Layers, TrendingUp, BarChart3, Users, Sparkles,
  ArrowUpRight, ArrowDownRight, Filter, Download, MoreHorizontal, MousePointer2,
  Lock, ZapOff, History, LayoutPanelLeft, LineChart, Calendar, DollarSign
} from "lucide-react";

// --- Campaigns View Data ---
const CAMPAIGNS_DATA = {
  kpis: [
    { label: "ACTIVE", value: "8", change: "+2 this month", trend: "up", sparkline: [40, 50, 45, 60, 55, 70, 65, 80] },
    { label: "REPLY RT", value: "12.4%", change: "+1.2% skew", trend: "up", sparkline: [30, 35, 32, 40, 38, 45, 42, 50] },
    { label: "MEETINGS", value: "42", change: "+18 today", trend: "up", sparkline: [20, 25, 22, 30, 28, 35, 32, 40] },
    { label: "PIPELINE", value: "$1.4M", change: "+$210k week", trend: "up", sparkline: [10, 15, 12, 18, 16, 22, 18, 25] },
    { label: "BUDGET", value: "$12K", change: "82% utilized", trend: "neutral", sparkline: [50, 60, 55, 75, 70, 85, 80, 95] },
    { label: "LTV PROJ", value: "$4.2M", change: "Healthy", trend: "up", sparkline: [80, 70, 75, 60, 65, 50, 55, 40] },
    { label: "BOUNCE RT", value: "0.8%", change: "Optimal", trend: "neutral", sparkline: [90, 92, 91, 95, 94, 98, 97, 98] },
    { label: "RECOVERY", value: "$85K", change: "Tactical", trend: "up", sparkline: [5, 15, 10, 25, 20, 35, 30, 42] },
  ],
  aiOperator: {
    status: "Active",
    mode: "Manual", // Manual, Assisted, Autopilot
    budgetSaved: "$14,250",
    leadsRecovered: "1,204",
    optimizations: 12,
    riskAlerts: 2,
  },
  priorities: [
    { id: 1, type: "CRITICAL", entity: "Enterprise SaaS", title: "Approve 122 manual replies", impact: "Leads waiting > 4h — $120K at risk", color: "text-red-500", bg: "bg-red-50" },
    { id: 2, type: "STALLED", entity: "Nike EU", title: "Domain warm-up completed", impact: "Ready to launch — potential +$45K week", color: "text-[#D4AF37]", bg: "bg-brand-gold/5" },
    { id: 3, type: "OPPORTUNITY", entity: "Fintech B", title: "Clone high-perf campaign", impact: "Current 15% reply rate — scaling possible", color: "text-emerald-500", bg: "bg-emerald-50" },
  ],
  recommendations: [
    { entity: "Stripe US", title: "Shift budget to Stripe US", impact: "CPC 22% lower than benchmark", benefit: "+$12K pipeline", icon: Zap },
    { entity: "Samsung", title: "Update subject line A/B", impact: "Current open rate below 35%", benefit: "Expected +8% opens", icon: Mail },
  ],
  campaignTable: [
    { name: "Cold Outbound — VP Sales", status: "Active", health: "92%", tools: ["Apollo", "Clay"], replies: 24, mtgs: 6, pipeline: "$185K" },
    { name: "LinkedIn Nurture — Engineering", status: "Active", health: "78%", tools: ["HeyReach"], replies: 12, mtgs: 2, pipeline: "$45K" },
    { name: "Launch Campaign — Email", status: "Active", health: "84%", tools: ["Smartlead", "Clay"], replies: 18, mtgs: 4, pipeline: "$120K" },
    { name: "EU Expansion — Multi-channel", status: "Paused", health: "65%", tools: ["Apollo", "Smartlead"], replies: 8, mtgs: 1, pipeline: "$32K" },
    { name: "AI Startup Founders", status: "Pending", health: "—", tools: ["Apollo"], replies: 0, mtgs: 0, pipeline: "—" },
    { name: "Retail Series D — Multi-touch", status: "Active", health: "89%", tools: ["Clay", "HeyReach"], replies: 32, mtgs: 8, pipeline: "$210K" },
  ]
};

interface CampaignsProps {
  onBackToDashboard: () => void;
}

export const Campaigns = ({ onBackToDashboard }: CampaignsProps) => {
  const [operatorMode, setOperatorMode] = useState<"Manual" | "Assisted" | "Autopilot">("Assisted");

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#D4AF37]/30">
      {/* 1. Header Navigation */}
      <header className="h-16 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <motion.div 
               whileHover={{ rotate: 180 }}
               className="p-2 bg-[#1a1510] text-brand-gold rounded-lg shadow-lg"
            >
              <Target size={18} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-[#1a1510] uppercase">Campaign Management</h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase tracking-widest border border-brand-gold/10">
                  Total Reach 4.2M
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-widest">Tactical Outreach Orchestration</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToDashboard}
            className="h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
          >
            <LayoutDashboard size={14} /> Back to Hub
          </button>
          <button className="h-10 px-6 rounded-xl bg-brand-gold text-[#1a1510] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl hover:translate-y-[-1px] transition-all">
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        
        {/* 2. Metric Header (The Ribbon) */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CAMPAIGNS_DATA.kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-2xl border border-[#1a1510]/5 flex flex-col justify-between h-32 group transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black text-[#1a1510]/30 tracking-[0.2em] uppercase">{kpi.label}</span>
                <div className={`p-1 rounded-md ${kpi.trend === 'up' ? 'text-emerald-500 bg-emerald-50' : 'text-[#1a1510]/20 bg-[#f7f8f9]'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : <Activity size={10} />}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-black text-[#1a1510] tracking-tighter mb-0.5">{kpi.value}</h3>
                <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-500">
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
            { icon: Play, label: "Resume All" },
            { icon: Pause, label: "Pause All" },
            { icon: Filter, label: "Filter View" },
            { icon: Download, label: "Export Data" },
            { icon: Settings2, label: "Bulk Adjust" },
            { icon: RotateCcw, label: "Sync CRM" },
            { icon: Sparkles, label: "Auto-Optimize" },
          ].map((action, i) => (
            <button 
              key={i} 
              className="h-10 px-4 rounded-xl border border-[#1a1510]/5 bg-white text-[9px] font-black uppercase tracking-[0.15em] text-[#1a1510]/50 hover:text-[#1a1510] hover:border-brand-gold/30 hover:shadow-sm transition-all flex items-center gap-3"
            >
              <action.icon size={14} className="text-[#1a1510]/30" />
              {action.label}
            </button>
          ))}
        </section>

        {/* 4. The AI Operator Hero Section (Campaign Focus) */}
        <section className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-[3rem] border border-[#1a1510]/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-brand-gold/20 rounded-full blur-2xl group-hover:bg-brand-gold/30 animate-pulse" />
                  <div className="w-20 h-20 rounded-3xl bg-[#1a1510] border border-brand-gold/20 flex items-center justify-center text-brand-gold relative z-10">
                    <Bot size={40} className="group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                
                <div className="space-y-1.5 text-center md:text-left">
                   <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                    <h2 className="text-3xl font-black text-[#1a1510] tracking-tighter">Campaign Operator</h2>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest border border-brand-gold/10">
                      8 ACTIVE NODES
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#1a1510]/40 max-w-sm leading-relaxed uppercase tracking-widest leading-loose">
                    Optimizing budget distribution and subject lines across <span className="text-brand-gold font-black">24 active playbooks.</span>
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
                { label: "Budget Efficiently", value: CAMPAIGNS_DATA.aiOperator.budgetSaved, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Leads Recovered", value: CAMPAIGNS_DATA.aiOperator.leadsRecovered, icon: Users, color: "text-brand-gold", bg: "bg-brand-gold/5" },
                { label: "Optimizations Executed", value: CAMPAIGNS_DATA.aiOperator.optimizations, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Risk Alerts", value: CAMPAIGNS_DATA.aiOperator.riskAlerts, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
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
                    {i < 2 && <span className="text-[10px] font-black text-emerald-500">↑ 8%</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 5. Tactical Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Campaign Priorities (4 Cols) */}
          <section className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#1a1510] text-brand-gold rounded-lg"><Target size={16} /></div>
                  <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Priority Actions</h3>
               </div>
               <span className="text-[10px] font-bold text-[#1a1510]/20 uppercase">Global Queue</span>
            </div>

            <div className="space-y-4">
              {CAMPAIGNS_DATA.priorities.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-3xl bg-white border border-[#1a1510]/5 group hover:border-brand-gold/30 transition-all shadow-sm relative overflow-hidden"
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
                 <div className="relative z-10">
                    <h5 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <LineChart size={14} /> Performance Forecast
                    </h5>
                    <p className="text-4xl font-black tracking-tighter mb-1">+$112K</p>
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-8">Potential Q3 Pipeline Lift</p>
                    <button className="w-full py-4 rounded-2xl bg-brand-gold text-[#1a1510] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-brand-gold/20 transition-all">
                       Initialize Growth Model
                    </button>
                 </div>
              </div>
            </div>
          </section>

          {/* Center: Optimization Feed (4 Cols) */}
          <section className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#1a1510] text-brand-gold rounded-lg"><Zap size={16} /></div>
                  <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Optimizations</h3>
               </div>
               <button className="text-[9px] font-black text-brand-gold uppercase hover:underline">Apply All</button>
            </div>

            <div className="space-y-4">
              {CAMPAIGNS_DATA.recommendations.map((rec, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white border border-[#1a1510]/5 transition-all group">
                   <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/40 group-hover:bg-[#1a1510] group-hover:text-brand-gold transition-all">
                         <rec.icon size={18} />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black text-[#1a1510] mb-1">{rec.title}</h4>
                            <span className="text-[9px] font-bold text-[#1a1510]/20 uppercase">{rec.entity}</span>
                         </div>
                         <p className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-wider">{rec.impact}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{rec.benefit}</span>
                      <button className="h-8 px-4 rounded-xl bg-[#1a1510] text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-[#1a1510] transition-colors">Approve</button>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right: Risk & Analytics (4 Cols) */}
          <section className="lg:col-span-4 space-y-8">
             <div className="bg-white p-7 rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-[#f7f8f9] text-[#1a1510]/40 rounded-lg"><BarChart3 size={16} /></div>
                   <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Health per Vector</h3>
                </div>
                <div className="space-y-6">
                   {[
                      { label: "Email Warm-up", progress: 98, color: "bg-emerald-500" },
                      { label: "LinkedIn Velocity", progress: 45, color: "bg-brand-gold" },
                      { label: "Payload Delivery", progress: 88, color: "bg-[#1a1510]" },
                   ].map((item, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-[#1a1510]/60 uppercase tracking-widest">{item.label}</span>
                            <span className="text-[10px] font-black text-[#1a1510]">{item.progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-[#f7f8f9] rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${item.progress}%` }}
                               transition={{ duration: 1 }}
                               className={`h-full ${item.color} rounded-full`}
                            />
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-white p-7 rounded-[2.5rem] border border-red-500/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                   <AlertTriangle size={18} className="text-red-500" />
                   <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Vector Alerts</h3>
                </div>
                <div className="space-y-3">
                   {[
                      { label: "High Bounce Node", val: "Campaign: SaaS Q4", lvl: "High" },
                   ].map((risk, i) => (
                      <div key={i} className="p-4 bg-red-50 rounded-2xl border border-red-500/10">
                         <p className="text-[10px] font-black text-red-600 uppercase">{risk.label}</p>
                         <p className="text-[9px] font-bold text-red-500/60 uppercase">{risk.val}</p>
                      </div>
                   ))}
                </div>
             </div>
          </section>
        </div>

        {/* 6. Campaign Operating Status Table */}
        <section className="space-y-6 pb-24">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-[#f7f8f9] text-[#1a1510]/40 rounded-lg"><LayoutPanelLeft size={16} /></div>
                 <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Campaign Repository</h3>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex bg-[#f7f8f9] p-1 rounded-xl border border-[#1a1510]/5">
                    <button className="px-4 py-1.5 rounded-lg bg-white text-[9px] font-black text-[#1a1510] uppercase shadow-sm">Active</button>
                    <button className="px-4 py-1.5 rounded-lg text-[9px] font-black text-[#1a1510]/30 uppercase">Paused</button>
                 </div>
                 <button className="p-2.5 bg-white rounded-xl border border-[#1a1510]/5 text-[#1a1510]/30 shadow-sm"><Filter size={14} /></button>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full whitespace-nowrap">
                    <thead className="bg-[#fcfcfc] border-b border-[#1a1510]/5 text-left">
                       <tr>
                          <th className="py-5 px-8 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Campaign Name</th>
                          <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Status</th>
                          <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Health</th>
                          <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Stack</th>
                          <th className="py-5 px-8 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-right">Metrics</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1510]/5">
                       {CAMPAIGNS_DATA.campaignTable.map((row, i) => (
                          <tr key={i} className="hover:bg-[#f7f8f9] transition-colors group cursor-pointer">
                             <td className="py-6 px-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold group-hover:bg-[#1a1510] transition-all">
                                      <Target size={16} />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-[#1a1510] group-hover:text-brand-gold transition-colors">{row.name}</p>
                                      <p className="text-[10px] font-bold text-[#1a1510]/20 uppercase">Tactical Outreach</p>
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
                                   <div className="w-16 h-1.5 bg-[#f7f8f9] rounded-full overflow-hidden">
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
           </div>
        </section>

      </main>
    </div>
  );
};
