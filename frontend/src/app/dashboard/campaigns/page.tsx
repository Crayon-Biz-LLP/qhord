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
import { useRouter } from "next/navigation";

// --- Mock Data ---
const CAMPAIGNS_DATA = {
  kpis: [
    { label: "ACTIVE", value: "8", change: "+2 this mo", sparkline: [40, 50, 45, 60, 55, 70, 65, 80] },
    { label: "REPLY RT", value: "12.4%", change: "+1.2% skew", sparkline: [30, 35, 32, 40, 38, 45, 42, 50] },
    { label: "MEETINGS", value: "42", change: "+18 today", sparkline: [20, 25, 22, 30, 28, 35, 32, 40] },
    { label: "PIPELINE", value: "$1.4M", change: "+$210k week", sparkline: [10, 15, 12, 18, 16, 22, 18, 25] },
  ],
  priorities: [
    { id: 1, type: "CRITICAL", entity: "Enterprise SaaS", title: "Approve 122 manual replies", impact: "Waiting > 4h — $120K at risk", color: "text-red-500", bg: "bg-red-50" },
    { id: 2, type: "STALLED", entity: "Nike EU", title: "Domain warm-up completed", impact: "Ready to launch — potential +$45K", color: "text-[#D4AF37]", bg: "bg-brand-gold/5" },
  ],
  campaignTable: [
    { name: "Cold Outbound", status: "Active", health: "92%", tools: ["A", "C"], replies: 24, mtgs: 6, pipeline: "$185K" },
    { name: "LinkedIn Nurture", status: "Active", health: "78%", tools: ["H"], replies: 12, mtgs: 2, pipeline: "$45K" },
    { name: "EU Expansion", status: "Paused", health: "65%", tools: ["A", "S"], replies: 8, mtgs: 1, pipeline: "$32K" },
  ]
};

export default function CampaignsPage() {
  const router = useRouter();
  const [operatorMode, setOperatorMode] = useState<"Manual" | "Assisted" | "Autopilot">("Assisted");

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#D4AF37]/30">
      
      {/* 1. Header Navigation */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
            <Target size={18} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Campaigns</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
               Tactical Orchestration
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
          <button className="h-10 px-4 sm:px-6 rounded-xl bg-brand-gold text-[#1a1510] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:translate-y-[-1px] transition-all">
             <Plus size={14} /> <span className="hidden xs:inline">New</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
           
           {/* KPI Ribbon */}
           <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto scrollbar-hide pb-2">
              {CAMPAIGNS_DATA.kpis.map((kpi, i) => (
                 <div key={i} className="bg-white p-5 rounded-3xl border border-[#1a1510]/5 flex flex-col justify-between h-36 min-w-[150px] md:min-w-0 flex-1 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                       <span className="text-[8px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">{kpi.label}</span>
                       <Activity size={12} className="text-[#1a1510]/10 group-hover:text-brand-gold transition-colors" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black">{kpi.value}</h4>
                       <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{kpi.change}</span>
                    </div>
                    <div className="h-4 flex items-end gap-[2px] opacity-20 group-hover:opacity-100 transition-opacity">
                       {kpi.sparkline.map((v, idx) => (
                          <div key={idx} className="flex-1 bg-brand-gold rounded-full" style={{ height: `${v}%` }} />
                       ))}
                    </div>
                 </div>
              ))}
           </div>

           {/* AI Operator Hero */}
           <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-sm">
              <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center shadow-lg shrink-0">
                       <Bot size={32} />
                    </div>
                    <div className="text-center sm:text-left">
                       <h3 className="text-2xl font-black tracking-tight">Campaign Operator</h3>
                       <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-1">8 active nodes • Autopilot Assisted</p>
                    </div>
                 </div>
                 <div className="flex bg-[#f7f8f9] p-1.5 rounded-2xl border border-[#1a1510]/5 shrink-0">
                    {["Manual", "Assisted", "Autopilot"].map((m) => (
                       <button key={m} onClick={() => setOperatorMode(m as any)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${operatorMode === m ? 'bg-white text-[#1a1510] shadow-sm' : 'text-[#1a1510]/30'}`}>{m}</button>
                    ))}
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#1a1510]/5 divide-x divide-[#1a1510]/5 bg-[#fcfcfc]">
                 {[
                    { l: "Budget Saved", v: "$14k", c: "text-emerald-500" },
                    { l: "Leads Recov.", v: "1.2k", c: "text-brand-gold" },
                    { l: "Optimized", v: "12", c: "text-blue-500" },
                    { l: "Risk Alerts", v: "2", c: "text-red-500" },
                 ].map((s, i) => (
                    <div key={i} className="p-6 text-center hover:bg-white transition-all">
                       <p className="text-[8px] font-black uppercase text-[#1a1510]/20 tracking-widest mb-1">{s.l}</p>
                       <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* Tactical Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Priorities */}
              <div className="lg:col-span-4 space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-[#1a1510]/20 tracking-widest px-2">Priority Queue</h4>
                 {CAMPAIGNS_DATA.priorities.map((p, i) => (
                    <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold opacity-10 group-hover:opacity-100" />
                       <div className="flex justify-between mb-2">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded ${p.bg} ${p.color} uppercase tracking-widest`}>{p.type}</span>
                          <span className="text-[9px] font-black text-[#1a1510]/10 uppercase">{p.entity}</span>
                       </div>
                       <h5 className="text-sm font-black mb-1">{p.title}</h5>
                       <p className="text-[9px] font-bold text-[#1a1510]/40 uppercase tracking-widest">{p.impact}</p>
                    </div>
                 ))}
              </div>

              {/* Table */}
              <div className="lg:col-span-8 bg-white border border-[#1a1510]/5 rounded-[2.5rem] shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                       <thead className="bg-[#fcfcfc] border-b border-[#1a1510]/5">
                          <tr>
                             <th className="p-6 text-left text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Campaign</th>
                             <th className="p-6 text-center text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Status</th>
                             <th className="p-6 text-center text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Health</th>
                             <th className="p-6 text-right text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Pipeline</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[#1a1510]/5">
                          {CAMPAIGNS_DATA.campaignTable.map((r, i) => (
                             <tr key={i} className="hover:bg-[#f7f8f9] group transition-all">
                                <td className="p-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/20 group-hover:bg-[#1a1510] group-hover:text-brand-gold transition-all">
                                         <Target size={16} />
                                      </div>
                                      <div>
                                         <p className="text-xs font-black truncate">{r.name}</p>
                                         <p className="text-[8px] font-bold text-[#1a1510]/20 uppercase">Nodes: {r.tools.join(", ")}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-6 text-center">
                                   <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'} uppercase tracking-widest`}>{r.status}</span>
                                </td>
                                <td className="p-6 text-center font-black text-xs">{r.health}</td>
                                <td className="p-6 text-right font-black text-xs">{r.pipeline}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

           </div>
        </div>
      </main>
    </div>
  );
}
