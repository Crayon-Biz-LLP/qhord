"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, Plus, LayoutDashboard, Star, Download, Clock, ShieldCheck,
   BarChart3, Users, Zap, ExternalLink, Filter, ChevronRight,
   Layers, Database, Cpu, Mail, Target, MessageSquare, Bot,
   CreditCard, Sparkles, MoreVertical, Bookmark, CheckCircle2,
   Workflow, GitBranch, GitMerge, Activity, RefreshCw, Settings,
   Moon, Sun, Wand2, ArrowRight, Bell
} from "lucide-react";

interface WorkflowsProps {
   onBackToDashboard: () => void;
}

export interface WorkflowItem {
   id: string;
   name: string;
   status: "active" | "paused" | "draft";
   metadata: string[];
   metrics: {
      replyRate: string;
      meetings: string;
      pipeline: string;
      aiScore: string;
   };
   recommendation?: string;
   aiActive?: boolean;
}

const WORKFLOWS_DATA: WorkflowItem[] = [
   {
      id: "wf-1",
      name: "Series B Fintech Outreach",
      status: "active",
      aiActive: true,
      metadata: ["New lead added", "VP Sales at Fintech, 50-500", "Multi channel outbound"],
      metrics: {
         replyRate: "24%",
         meetings: "8/mo",
         pipeline: "$120k",
         aiScore: "91%"
      },
      recommendation: "15 leads stalled — Resume outreach to recover pipeline"
   },
   {
      id: "wf-2",
      name: "Enterprise SaaS Q1",
      status: "active",
      aiActive: true,
      metadata: ["Campaign started", "CTO at SaaS, 200-2000", "Enterprise nurture"],
      metrics: {
         replyRate: "18%",
         meetings: "12/mo",
         pipeline: "$340k",
         aiScore: "87%"
      },
      recommendation: "Reply rate dropped 3% — Optimize subject lines"
   },
   {
      id: "wf-3",
      name: "Product-Led Growth Targets",
      status: "paused",
      aiActive: false,
      metadata: ["Lead enriched", "Head of Growth, PLG companies", "Email-first outbound"],
      metrics: {
         replyRate: "12%",
         meetings: "3/mo",
         pipeline: "$45k",
         aiScore: "68%"
      },
      recommendation: "High-performing pattern detected — Apply to 2 other workflows"
   },
   {
      id: "wf-4",
      name: "AI Startup Founders",
      status: "draft",
      aiActive: false,
      metadata: ["No reply after 3 days", "Founders at AI startups", "Founder-led outreach"],
      metrics: {
         replyRate: "~15%",
         meetings: "~3/mo",
         pipeline: "-",
         aiScore: "0%"
      }
   }
];

export const Workflows = ({ onBackToDashboard }: WorkflowsProps) => {
   const [searchQuery, setSearchQuery] = useState("");

   const filteredWorkflows = useMemo(() => {
      return WORKFLOWS_DATA.filter(wf =>
         wf.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [searchQuery]);

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] selection:bg-brand-gold/30 font-sans">

         {/* Top Header Navigation - Matches Dashboard Hub */}
         <header className="h-14 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <button 
                     onClick={onBackToDashboard}
                     className="p-1.5 bg-[#f7f8f9] rounded-lg text-[#1a1510] border border-[#1a1510]/5 hover:bg-white transition-colors group"
                  >
                     <Workflow size={16} className="group-hover:text-brand-gold transition-colors" />
                  </button>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1a1510] leading-none">Control Tower</span>
                     <span className="text-[8px] font-bold text-[#1a1510]/30 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <span className="w-1 h-1 rounded-full bg-brand-gold"></span>
                        Workflows / Active Node: Main
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-5">
               <div className="h-8 px-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center gap-4">
                  <span className="text-[9px] font-bold text-[#1a1510]/40 whitespace-nowrap">2,847 / 5,000 <span className="opacity-50">credits</span></span>
                  <div className="w-16 h-1 rounded-full bg-[#1a1510]/5 overflow-hidden">
                     <div className="w-[57%] h-full bg-brand-gold rounded-full"></div>
                  </div>
                  <button className="text-[9px] font-bold text-brand-gold border-l border-[#1a1510]/5 pl-3 hover:underline whitespace-nowrap">+ Buy</button>
               </div>
               
               <div className="relative group">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/30 group-focus-within:text-brand-gold transition-colors" />
                  <input type="text" placeholder="Search..." className="h-8 w-48 pl-9 pr-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/10 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold/20 transition-all" />
               </div>

               <div className="flex items-center gap-3 border-l border-[#1a1510]/10 pl-5">
                  <button className="p-1.5 text-[#1a1510]/40 hover:text-brand-gold relative transition-colors">
                     <Bell size={16} />
                     <span className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full border border-white"></span>
                  </button>
                  <button className="p-1.5 text-[#1a1510]/40 hover:text-brand-gold transition-colors"><Moon size={16} /></button>
                  <button className="h-8 px-4 rounded-full bg-[#1a1510] text-[#fdfbf7] text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:translate-y-[-0.5px] shadow-lg shadow-[#1a1510]/10">
                     <Plus size={12} /> New Workflow
                  </button>
               </div>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 scrollbar-hide pb-32">

            {/* Title Section */}
            <div className="flex items-end justify-between">
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
               >
                  <h1 className="text-xl font-extrabold tracking-tight text-[#1a1510] mb-1 leading-none">Workflows</h1>
                  <p className="text-xs font-medium text-[#1a1510]/40">GTM Engine — Your revenue automation is running at <span className="text-emerald-500 font-bold">94% health</span></p>
               </motion.div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     {[Database, Cpu, MessageSquare].map((Icon, i) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-[#1a1510]/5 transition-all hover:border-brand-gold/20">
                           <Icon size={10} className="text-brand-gold" />
                           <span className="text-[8px] font-bold text-[#1a1510]/40 uppercase tracking-widest">
                              {i === 0 ? 'Clay' : i === 1 ? 'Apollo' : 'HubSpot'}
                           </span>
                        </div>
                     ))}
                  </div>
                  <button className="h-9 px-4 rounded-lg bg-brand-gold text-[#1a1510] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-md shadow-brand-gold/10 hover:translate-y-[-1px] transition-all">
                     <Plus size={14} strokeWidth={2.5} /> Create Workflow
                  </button>
               </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { label: "Active Nodes", val: "12", color: "text-emerald-500", icon: Layers },
                  { label: "Meetings / month", val: "23", color: "text-blue-500", icon: MessageSquare },
                  { label: "Pipeline Gen", val: "$505k", color: "text-brand-gold", icon: Target },
                  { label: "Avg AI Score", val: "82%", color: "text-blue-500", icon: Bot },
               ].map((stat, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="bg-white border border-[#1a1510]/5 rounded-xl p-5 shadow-sm group hover:border-brand-gold/20 transition-all"
                  >
                     <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-8 h-8 rounded-lg bg-[#f7f8f9] flex items-center justify-center ${stat.color}`}>
                           <stat.icon size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-[#1a1510]/40 uppercase tracking-widest">{stat.label}</span>
                     </div>
                     <h3 className="text-2xl font-bold text-[#1a1510] tracking-tight">{stat.val}</h3>
                  </motion.div>
               ))}
            </div>

            {/* Account Context Bar - Refined */}
            <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-5 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                     <Database size={20} />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-[#1a1510] tracking-tight">Active Node Selection</h4>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">Filter workflows by client account context</p>
                  </div>
               </div>
               <div className="relative group">
                  <select className="appearance-none h-10 pl-5 pr-12 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/5 text-[10px] font-bold uppercase tracking-widest text-[#1a1510] focus:outline-none focus:ring-2 focus:ring-brand-gold/10 transition-all cursor-pointer min-w-[220px]">
                     <option>All Accounts (Global)</option>
                     <option>Stripe Enterprise</option>
                     <option>Airbnb Mid-Market</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1a1510]/30 pointer-events-none rotate-90" />
               </div>
            </div>

            {/* AI Generator Bar - Matches Dashboard Hub */}
            <div className="relative group">
               <div className="absolute inset-0 bg-brand-gold/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all" />
               <div className="relative bg-white border border-[#1a1510]/5 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold">
                     <Wand2 size={22} />
                  </div>
                  <input
                     type="text"
                     placeholder="Describe what you want to build..."
                     className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-[#1a1510]/20"
                  />
                  <button className="h-10 px-8 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-bold uppercase tracking-widest shadow-lg hover:translate-y-[-0.5px] transition-all">
                     Generate
                  </button>
               </div>
            </div>

            {/* Search and List */}
            <div className="space-y-6">
               <div className="relative group">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search workflow registry..."
                     className="h-12 w-full pl-16 pr-8 rounded-xl bg-white border border-[#1a1510]/5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/10 transition-all"
                  />
               </div>

               <div className="space-y-6">
                  {filteredWorkflows.map((wf, idx) => (
                     <motion.div
                        key={wf.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-2xl border border-[#1a1510]/5 overflow-hidden shadow-sm hover:border-brand-gold/20 transition-all group"
                     >
                        <div className="p-6 space-y-5">
                           {/* Header row */}
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                 {/* Custom Toggle Switch - Brand Gold */}
                                 <div className={`w-11 h-5.5 rounded-full p-0.5 cursor-pointer transition-all ${wf.status === 'active' ? 'bg-brand-gold shadow-md shadow-brand-gold/10' : 'bg-[#f7f8f9] border border-[#1a1510]/5'}`}>
                                    <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${wf.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-[#1a1510] tracking-tight">{wf.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${wf.status === 'active' ? 'bg-emerald-50 text-emerald-500' :
                                          wf.status === 'paused' ? 'bg-brand-gold/10 text-brand-gold' :
                                             'bg-[#f7f8f9] text-[#1a1510]/30'
                                       }`}>
                                       {wf.status}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 {wf.aiActive && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/10 text-brand-gold text-[9px] font-bold uppercase tracking-widest">
                                       <Bot size={12} /> AI Active
                                    </div>
                                 )}
                                 <button className="p-2 bg-[#f7f8f9] rounded-lg text-[#1a1510]/20 hover:text-brand-gold hover:bg-white border border-transparent hover:border-[#1a1510]/5 transition-all">
                                    <Settings size={16} />
                                 </button>
                              </div>
                           </div>

                           {/* Metadata row */}
                           <div className="flex items-center gap-5">
                              {wf.metadata.map((meta, i) => (
                                 <div key={i} className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-400' : i === 1 ? 'bg-brand-gold' : 'bg-emerald-400'}`} />
                                    <span className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{meta}</span>
                                 </div>
                              ))}
                           </div>

                           {/* Metrics grid */}
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                 { label: "Reply Rate", val: wf.metrics.replyRate, icon: Activity, color: "text-emerald-500" },
                                 { label: "Meetings", val: wf.metrics.meetings, icon: MessageSquare, color: "text-blue-500" },
                                 { label: "Pipeline", val: wf.metrics.pipeline, icon: Target, color: "text-brand-gold" },
                                 { label: "AI Score", val: wf.metrics.aiScore, icon: Bot, color: "text-blue-500" },
                              ].map((m, i) => (
                                 <div key={i} className="bg-[#fcfcfc] border border-[#1a1510]/5 rounded-xl p-3.5 flex items-center gap-3.5 transition-all hover:bg-white hover:shadow-sm">
                                    <div className={`w-9 h-9 rounded-lg bg-white border border-[#1a1510]/5 flex items-center justify-center ${m.color} shadow-sm`}>
                                       <m.icon size={16} />
                                    </div>
                                    <div>
                                       <h4 className="text-base font-bold text-[#1a1510] leading-none mb-1 tracking-tight">{m.val}</h4>
                                       <p className="text-[9px] font-bold text-[#1a1510]/20 uppercase tracking-widest">{m.label}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Recommendation bar */}
                        {wf.recommendation && (
                           <div className="px-6 py-3.5 bg-brand-gold/5 border-t border-brand-gold/10 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-gold shadow-sm">
                                    <Sparkles size={14} />
                                 </div>
                                 <div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold/50 block leading-none mb-1">AI Suggestion</span>
                                    <span className="text-[11px] font-medium text-[#1a1510]">{wf.recommendation}</span>
                                 </div>
                              </div>
                              <button className="h-8 px-4 rounded-lg bg-[#1a1510] text-brand-gold text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-y-[-0.5px] transition-all">
                                 Execute <ArrowRight size={12} />
                              </button>
                           </div>
                        )}
                     </motion.div>
                  ))}
               </div>
            </div>
         </main>
      </div>
   );
};
