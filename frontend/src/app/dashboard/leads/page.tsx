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
import { useRouter } from "next/navigation";

export default function LeadsPage() {
   const router = useRouter();
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

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                     <Users size={18} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Leads</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                        Master node hub • Active
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
               <div className="flex items-center gap-2">
                  <button className="h-10 px-4 sm:px-6 rounded-xl bg-white border border-[#1a1510]/5 text-[#1a1510] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#f7f8f9] transition-all whitespace-nowrap hidden md:flex">
                     <Download size={14} /> <span className="hidden lg:inline">Export</span>
                  </button>
                  <button className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:translate-y-[-1px] transition-all whitespace-nowrap">
                     <Sparkles size={14} /> <span className="hidden lg:inline">AI Researcher</span><span className="lg:hidden">AI</span>
                  </button>
                  <div className="w-[1px] h-6 bg-[#1a1510]/10 mx-1 hidden sm:block" />
                  <button
                     onClick={() => router.push('/dashboard')}
                     className="h-10 px-4 sm:px-6 rounded-xl bg-white border border-[#1a1510]/5 text-[#1a1510]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-[#1a1510] transition-all group"
                  >
                     <LayoutDashboard size={14} className="group-hover:text-brand-gold transition-colors" /> <span className="hidden sm:inline">Back</span>
                  </button>
               </div>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-10 overflow-y-auto scrollbar-hide pb-32">

            {/* 2. Metric Ribbon */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
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
                     className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-[#1a1510]/5 flex flex-col justify-between h-32 sm:h-36 lg:h-40 group transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                  >
                     <div className="flex justify-between items-start z-10">
                        <span className="text-[8px] sm:text-[9px] font-black text-[#1a1510]/30 tracking-widest uppercase truncate">{stat.label}</span>
                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                           <stat.icon size={16} />
                        </div>
                     </div>
                     <div className="mt-2 z-10">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1510] tracking-tighter leading-none">{stat.value}</h3>
                        <div className="h-4 flex items-end gap-[2px] mt-4 opacity-10 group-hover:opacity-30 transition-opacity">
                           {stat.spark.map((val, idx) => (
                              <div key={idx} className="flex-1 bg-brand-gold rounded-full" style={{ height: `${val}%` }} />
                           ))}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </section>

            {/* 3. Strategic Filter & Search Hub */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-[#1a1510]/5 shadow-sm p-4 sm:p-2 flex flex-col md:flex-row items-center justify-between gap-4 md:pr-8">
               <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
                  {["All Leads", "High ICP", "New Source", "In Outreach"].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`h-10 sm:h-12 px-6 sm:px-8 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === tab
                           ? "bg-[#1a1510] text-brand-gold shadow-2xl scale-100"
                           : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-end">
                  <div className="relative group flex-1 md:flex-none">
                     <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                     <input
                        type="text"
                        placeholder="Lead search..."
                        className="h-10 sm:h-12 w-full md:w-48 lg:w-64 pl-14 pr-6 rounded-full bg-[#f7f8f9] border border-transparent text-xs font-medium focus:bg-white focus:outline-none transition-all shadow-inner"
                     />
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1a1510] hover:text-brand-gold transition-all shrink-0">
                     <Filter size={18} /> <span className="hidden sm:inline">Filters</span>
                     <span className="w-5 h-5 rounded-full bg-[#1a1510] text-brand-gold flex items-center justify-center text-[9px] font-black">2</span>
                  </button>
               </div>
            </div>

            {/* 4. Lead Orchestration Table Area */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-[#1a1510]/5 shadow-sm overflow-hidden relative">
               <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                     <thead>
                        <tr className="border-b border-[#1a1510]/[0.03] bg-[#fcfcfc]/50">
                           <th className="p-6 sm:p-8 w-[60px]"><input type="checkbox" className="w-5 h-5 rounded-lg border-[#1a1510]/10 text-brand-gold cursor-pointer" /></th>
                           <th className="py-6 sm:py-8 px-4 text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20">Identity</th>
                           <th className="py-6 sm:py-8 px-4 text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20 text-center">ICP</th>
                           <th className="py-6 sm:py-8 px-4 text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20">Source</th>
                           <th className="py-6 sm:py-8 px-4 text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20">Status</th>
                           <th className="py-6 sm:py-8 px-6 text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20 text-right">Actions</th>
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
                              <td className="p-6 sm:p-8"><input type="checkbox" className="w-5 h-5 rounded-lg border-[#1a1510]/10 text-brand-gold cursor-pointer" /></td>
                              <td className="py-6 px-4">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-[10px] font-black shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                       {lead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="truncate">
                                       <h4 className="text-xs sm:text-[14px] font-black text-[#1a1510] leading-tight truncate">{lead.name}</h4>
                                       <p className="text-[10px] font-bold text-[#1a1510]/30 mt-0.5 truncate">{lead.persona} @{lead.company}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-6 px-4 text-center">
                                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${lead.icp === 'High' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <Star size={10} className={lead.icp === 'High' ? 'fill-emerald-600' : ''} />
                                    {lead.icp}
                                 </div>
                              </td>
                              <td className="py-6 px-4">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest">
                                    <Database size={12} /> {lead.source}
                                 </div>
                              </td>
                              <td className="py-6 px-4">
                                 <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${lead.status === 'Replied' ? 'bg-[#1a1510] text-brand-gold' : 'bg-[#f7f8f9] text-[#1a1510]/40'}`}>
                                    {lead.status}
                                 </span>
                              </td>
                              <td className="py-6 px-6 text-right">
                                 <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                    <button className="w-8 h-8 rounded-lg bg-white border border-[#1a1510]/10 text-brand-gold flex items-center justify-center hover:bg-brand-gold hover:text-white transition-all"><Mail size={14} /></button>
                                    <button className="w-8 h-8 rounded-lg bg-[#1a1510] text-brand-gold flex items-center justify-center hover:scale-110 transition-transform"><Plus size={14} /></button>
                                 </div>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="p-6 sm:p-8 bg-[#fcfcfc] border-t border-[#1a1510]/[0.03] flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20">Showing 5 of 2.4k node units</span>
                  <div className="flex items-center gap-1">
                     <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-[#1a1510]/5 transition-all text-[#1a1510]/20 flex items-center justify-center"><ChevronRight size={16} className="rotate-180" /></button>
                     <div className="h-8 px-3 rounded-lg bg-[#1a1510] text-brand-gold flex items-center text-[10px] font-black">1</div>
                     <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-[#1a1510]/5 transition-all text-[#1a1510]/20 flex items-center justify-center"><ChevronRight size={16} /></button>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
