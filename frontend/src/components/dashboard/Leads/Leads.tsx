"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
   Users, UserPlus, Filter, Search, MoreHorizontal, Download,
   ChevronRight, Database, Zap, ShieldCheck, Mail, Target,
   LayoutDashboard, Terminal, MessageSquare, BarChart3, Clock,
   CheckCircle, Plus, Sparkles, Bot, Box, MoreVertical, Star,
   Smartphone, MapPin, Briefcase, Globe, ExternalLink, RefreshCw, Bell
} from "lucide-react";

interface LeadsProps {
   onBackToDashboard: () => void;
}

export const Leads = ({ onBackToDashboard }: LeadsProps) => {
   const [activeFilter, setActiveFilter] = useState("All Leads");

   const leads = [
      {
         name: "Sarah Chen",
         company: "Stripe",
         persona: "VP of Sales",
         location: "San Francisco, CA",
         icp: "High",
         source: "Apollo",
         status: "Replied",
         time: "2h ago"
      },
      {
         name: "Marcus Johnson",
         company: "Figma",
         persona: "Head of Growth",
         location: "New York, NY",
         icp: "High",
         source: "LinkedIn",
         status: "In Progress",
         time: "5h ago"
      },
      {
         name: "David Kim",
         company: "Linear",
         persona: "CTO",
         location: "Seoul, KR",
         icp: "Medium",
         source: "Manual",
         status: "Not Started",
         time: "1d ago"
      },
      {
         name: "Lisa Wang",
         company: "Vercel",
         persona: "Director of Marketing",
         location: "London, UK",
         icp: "High",
         source: "Clay",
         status: "Enriched",
         time: "Yesterday"
      },
      {
         name: "James Park",
         company: "Datadog",
         persona: "Sales Ops Lead",
         location: "Austin, TX",
         icp: "Low",
         source: "Apollo",
         status: "Not Started",
         time: "2d ago"
      },
   ];

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Consolidated Header - UNIFIED ACTION SUITE */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg">
                     <Users size={18} />
                  </div>
                  <div>
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase whitespace-nowrap">Leads</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                        Master node hub • Active
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <button className="h-10 px-6 rounded-xl bg-white border border-[#1a1510]/5 text-[#1a1510] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#f7f8f9] transition-all">
                     <Download size={14} /> Export Performance
                  </button>
                  <button className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:translate-y-[-1px] transition-all">
                     <Sparkles size={14} /> AI Researcher
                  </button>
                  <div className="w-[1px] h-6 bg-[#1a1510]/10 mx-2" />
                  <button
                     onClick={onBackToDashboard}
                     className="h-10 px-6 rounded-xl bg-white border border-[#1a1510]/5 text-[#1a1510]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:text-[#1a1510] transition-all group"
                  >
                     <LayoutDashboard size={16} className="group-hover:text-brand-gold transition-colors" /> Back to Hub
                  </button>
               </div>
            </div>
         </nav>

         <main className="flex-1 p-6 lg:p-10 space-y-10 overflow-y-auto scrollbar-hide">


            {/* 3. Metric Ribbon - PREMIUM DATA NODES */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
               {[
                  { label: "TOTAL AUDIENCE", value: "2,481", icon: Users, color: "text-[#1a1510]", bg: "bg-[#1a1510]/5", spark: [30, 45, 38, 55, 48, 65, 58, 75] },
                  { label: "ICP MATCH RATE", value: "84.2%", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", spark: [70, 75, 72, 80, 78, 85, 82, 90] },
                  { label: "READY TO SEND", value: "142", icon: Zap, color: "text-brand-gold", bg: "bg-brand-gold/5", spark: [20, 35, 28, 45, 38, 55, 48, 65] },
                  { label: "WEEKLY GROWTH", value: "+132", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50", spark: [40, 55, 48, 65, 58, 75, 68, 85] },
               ].map((stat, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.05 }}
                     className="bg-white p-6 rounded-[2.5rem] border border-[#1a1510]/5 flex flex-col justify-between h-36 lg:h-40 group transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                  >
                     <div className="flex justify-between items-start z-10">
                        <span className="text-[9px] font-black text-[#1a1510]/30 tracking-[0.2em] uppercase">{stat.label}</span>
                        <div className={`p-2 lg:p-2.5 rounded-2xl ${stat.bg} ${stat.color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                           <stat.icon size={16} />
                        </div>
                     </div>
                     <div className="mt-2 z-10">
                        <h3 className="text-3xl lg:text-4xl font-black text-[#1a1510] tracking-tighter leading-none">{stat.value}</h3>
                        <div className="h-6 flex items-end gap-[2px] mt-4 opacity-10 group-hover:opacity-30 transition-opacity">
                           {stat.spark.map((val, idx) => (
                              <div key={idx} className="flex-1 bg-brand-gold rounded-full" style={{ height: `${val}%` }} />
                           ))}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </section>

            {/* 4. Strategic Filter & Search Hub */}
            <div className="bg-white rounded-[3rem] border border-[#1a1510]/5 shadow-xl p-2 flex items-center justify-between pr-8">
               <div className="flex items-center gap-1.5">
                  {["All Leads", "High ICP", "New Source", "In Outreach", "Replied"].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`h-12 px-8 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === tab
                           ? "bg-[#1a1510] text-brand-gold shadow-2xl scale-100"
                           : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f7f8f9] lg:px-6"
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-6">
                  <div className="relative group hidden lg:block">
                     <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                     <input
                        type="text"
                        placeholder="Intelligent lead search..."
                        className="h-12 w-64 pl-14 pr-6 rounded-[2rem] bg-[#f7f8f9] border border-[#1a1510]/5 text-xs font-medium focus:outline-none transition-all shadow-inner"
                     />
                  </div>
                  <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#1a1510] hover:text-brand-gold transition-all">
                     <Filter size={18} /> Filters
                     <span className="w-5 h-5 rounded-full bg-[#1a1510] text-brand-gold flex items-center justify-center text-[9px] font-black">2</span>
                  </button>
               </div>
            </div>

            {/* 5. Lead Orchestration Table Area */}
            <div className="bg-white rounded-[3rem] border border-[#1a1510]/5 shadow-2xl overflow-hidden relative">
               <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-[#1a1510]/[0.03] bg-[#fcfcfc]/50">
                           <th className="p-8 w-[60px]"><input type="checkbox" className="w-5 h-5 rounded-lg border-[#1a1510]/10 text-brand-gold focus:ring-brand-gold/20 cursor-pointer" /></th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Identity & Persona</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30 text-center">ICP Score</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Source Node</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">GTM Pipeline</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/30">Last Sync</th>
                           <th className="p-8"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#1a1510]/[0.03]">
                        {leads.map((lead, i) => (
                           <motion.tr
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group hover:bg-[#f7f8f9]/30 transition-all cursor-default"
                           >
                              <td className="p-8"><input type="checkbox" className="w-5 h-5 rounded-lg border-[#1a1510]/10 text-brand-gold focus:ring-brand-gold/20 cursor-pointer" /></td>
                              <td className="p-8">
                                 <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-[12px] font-black border-2 border-brand-gold/10 shadow-xl group-hover:scale-110 transition-transform">
                                       {lead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex flex-col">
                                       <h4 className="text-[15px] font-black text-[#1a1510] leading-tight flex items-center gap-3">
                                          {lead.name}
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                       </h4>
                                       <p className="text-[12px] font-bold text-[#1a1510]/40 flex items-center gap-2 mt-1">
                                          {lead.persona} <span className="text-[#1a1510]/10">•</span> <span className="text-brand-gold italic">@{lead.company}</span>
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-8">
                                 <div className="flex justify-center">
                                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit flex items-center gap-2.5 shadow-sm border ${lead.icp === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                       lead.icp === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                          'bg-[#1a1510]/5 text-[#1a1510]/40 border-transparent'
                                       }`}>
                                       <Star size={12} className={lead.icp === 'High' ? 'fill-emerald-600' : ''} />
                                       {lead.icp} Profile
                                    </div>
                                 </div>
                              </td>
                              <td className="p-8">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center justify-center">
                                       {lead.source === 'Apollo' ? <Database size={14} className="text-[#1a1510]/40" /> :
                                          lead.source === 'LinkedIn' ? <Globe size={14} className="text-blue-500" /> :
                                             <Box size={14} className="text-[#1a1510]/40" />}
                                    </div>
                                    <span className="text-[12px] font-black text-[#1a1510]/60 uppercase tracking-wider">{lead.source}</span>
                                 </div>
                              </td>
                              <td className="p-8">
                                 <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit shadow-md border ${lead.status === 'Replied' ? 'bg-[#1a1510] text-brand-gold border-[#1a1510]' :
                                    lead.status === 'In Progress' ? 'bg-brand-gold text-[#1a1510] border-brand-gold' :
                                       'bg-[#f7f8f9] text-[#1a1510]/30 border-transparent'
                                    }`}>
                                    {lead.status}
                                 </div>
                              </td>
                              <td className="p-8 text-[11px] font-black text-[#1a1510]/20 uppercase tracking-widest">{lead.time}</td>
                              <td className="p-8 text-right opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                 <div className="flex items-center gap-2 justify-end">
                                    <button className="w-10 h-10 rounded-xl bg-white border border-[#1a1510]/5 text-brand-gold shadow-lg flex items-center justify-center hover:bg-brand-gold hover:text-[#1a1510] transition-colors"><Mail size={18} /></button>
                                    <button className="w-10 h-10 rounded-xl bg-[#1a1510] text-brand-gold shadow-lg flex items-center justify-center hover:scale-110 transition-transform"><Plus size={18} /></button>
                                 </div>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="p-8 bg-[#fcfcfc] border-t border-[#1a1510]/[0.03] flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#1a1510]/20">Node 01-05 of 2,481 Leads Synchronized</span>
                  <div className="flex items-center gap-2">
                     <button className="w-10 h-10 rounded-xl hover:bg-white border border-transparent hover:border-[#1a1510]/5 transition-all text-[#1a1510]/20 hover:text-[#1a1510] flex items-center justify-center"><ChevronRight size={20} className="rotate-180" /></button>
                     <div className="h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold flex items-center text-[11px] font-black shadow-lg">1</div>
                     <button className="w-10 h-10 rounded-xl hover:bg-white border border-transparent hover:border-[#1a1510]/5 transition-all text-[#1a1510]/20 hover:text-[#1a1510] flex items-center justify-center"><ChevronRight size={20} /></button>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};
