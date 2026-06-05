"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
   Users, UserPlus, Filter, Search, Download,
   ChevronRight, Database, Zap, ShieldCheck, Mail,
   LayoutDashboard, Plus, Sparkles, Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader } from "@/components/ui/Loader";
import { LeadSourceIcon } from "@/components/ui/icons/LeadSourceIcon";

interface Lead {
   id: string;
   email: string;
   first_name: string;
   last_name: string;
   title: string;
   company_name: string;
   domain: string;
   linkedin_url: string;
   industry: string;
   source: string;
   status: string;
   enriched: boolean;
   created_at: string;
}

export default function LeadsPage() {
   const router = useRouter();
   const [activeFilter, setActiveFilter] = useState("All Leads");
   const [leads, setLeads] = useState<Lead[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      api.get("/leads").then((res) => {
         setLeads(res.data.leads || []);
      }).catch(console.error).finally(() => setLoading(false));
   }, []);

   const filteredLeads = activeFilter === "All Leads" ? leads : leads;

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                     <LeadSourceIcon size={16} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Leads</h2>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">All collected leads</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2.5">
               <button className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none bg-white border border-[#1a1510]/10 text-[#1a1510] text-xs font-semibold items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors whitespace-nowrap hidden md:flex">
                  <Download size={15} /> <span className="hidden lg:inline">Export</span>
               </button>
               <button className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors whitespace-nowrap">
                  <Sparkles size={15} /> <span className="hidden lg:inline">AI Researcher</span><span className="lg:hidden">AI</span>
               </button>
               <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none bg-white border border-[#1a1510]/10 text-[#1a1510] text-xs font-semibold flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
               >
                  <LayoutDashboard size={15} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide pb-32">

            {/* 2. Metric Ribbon */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
               {[
                  { label: "Total Audience", value: String(leads.length), icon: Users },
                  { label: "Sourced from Hunter", value: String(leads.filter(l => l.source === 'hunter').length), icon: ShieldCheck },
                  { label: "Enriched", value: String(leads.filter(l => l.enriched).length), icon: Zap },
                  { label: "Recently Added", value: leads.length > 0 ? "+" + leads.filter(l => Date.now() - new Date(l.created_at).getTime() < 86400000).length : "0", icon: UserPlus },
               ].map((stat, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.06 }}
                     className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                     <div className="flex items-center justify-between mb-5">
                        <span className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider truncate">{stat.label}</span>
                        <stat.icon size={18} strokeWidth={1.75} className="text-[#1a1510]/25 group-hover:text-[#1a1510]/50 transition-colors shrink-0" />
                     </div>
                     <h3 className="text-[2.5rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{stat.value}</h3>
                  </motion.div>
               ))}
            </section>

            {/* 3. Filter & Search */}
            <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-3 flex flex-col md:flex-row items-center justify-between gap-3">
               <div className="flex items-center gap-1 p-1 bg-[#f7f8f9] rounded-xl overflow-x-auto w-full md:w-auto scrollbar-hide">
                  {["All Leads", "High ICP", "New Source", "In Outreach"].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`px-5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${activeFilter === tab
                           ? "bg-white text-[#1a1510] shadow-sm"
                           : "text-[#1a1510]/35 hover:text-[#1a1510]/60"
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <div className="relative group flex-1 md:flex-none">
                     <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                     <input
                        type="text"
                        placeholder="Search leads…"
                        className="h-10 w-full md:w-56 lg:w-64 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
                     />
                  </div>
                  <button className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-xs font-semibold text-[#1a1510]/60 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2 shrink-0">
                     <Filter size={15} /> <span className="hidden sm:inline">Filters</span>
                     <span className="w-5 h-5 rounded-md bg-[#1a1510] text-white flex items-center justify-center text-[10px] font-semibold">2</span>
                  </button>
               </div>
            </div>

            {/* 4. Leads Table */}
            <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-hidden">
               <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                     <thead>
                        <tr className="border-b border-[#1a1510]/[0.07] bg-[#fafafa]">
                           <th className="py-4 px-6 w-[56px]"><input type="checkbox" className="w-4 h-4 rounded border-[#1a1510]/15 text-brand-gold cursor-pointer" /></th>
                           <th className="py-4 px-4 text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/35">Identity</th>
                           <th className="py-4 px-4 text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/35 text-center">ICP</th>
                           <th className="py-4 px-4 text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/35">Source</th>
                           <th className="py-4 px-4 text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/35">Status</th>
                           <th className="py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/35 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#1a1510]/[0.06]">
                  {loading ? (
                     <tr><td colSpan={6}><div className="flex items-center justify-center py-16"><Loader size={36} /></div></td></tr>
                  ) : filteredLeads.length === 0 ? (
                     <tr><td colSpan={6}>
                        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                           <div className="w-12 h-12 rounded-xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-3"><Users size={22} /></div>
                           <p className="text-[15px] font-semibold text-[#1a1510]">No leads yet</p>
                           <p className="text-[13px] text-[#1a1510]/40 mt-1">Run a pipeline to start collecting leads.</p>
                        </div>
                     </td></tr>
                  ) : filteredLeads.map((lead, i) => (
                     <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group hover:bg-[#fafafa] transition-colors cursor-default"
                     >
                        <td className="py-4 px-6"><input type="checkbox" className="w-4 h-4 rounded border-[#1a1510]/15 text-brand-gold cursor-pointer" /></td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-[11px] font-semibold shrink-0">
                                 {lead.first_name?.[0]}{lead.last_name?.[0]}
                              </div>
                              <div className="truncate">
                                 <h4 className="text-[13px] font-semibold text-[#1a1510] leading-tight truncate">{lead.first_name} {lead.last_name}</h4>
                                 <p className="text-[12px] font-medium text-[#1a1510]/45 mt-0.5 truncate">{lead.title || '—'} @ {lead.company_name || lead.domain}</p>
                                 <p className="text-[11px] text-[#1a1510]/30 mt-0.5 truncate">{lead.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-600">
                              <Star size={11} className="fill-emerald-600" />
                              {lead.industry ? lead.industry.slice(0, 10) : 'B2B'}
                           </div>
                        </td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a1510]/50">
                              <Database size={13} /> {lead.source}
                           </div>
                        </td>
                        <td className="py-4 px-4">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${lead.status === 'Replied' ? 'bg-[#1a1510] text-brand-gold' : 'bg-[#f7f8f9] text-[#1a1510]/50'}`}>
                              {lead.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-8 h-8 rounded-lg bg-white border border-[#1a1510]/10 text-[#1a1510]/50 flex items-center justify-center hover:text-brand-gold hover:border-brand-gold/30 transition-colors"><Mail size={14} /></button>
                              <button className="w-8 h-8 rounded-lg bg-[#1a1510] text-brand-gold flex items-center justify-center hover:bg-[#2a2118] transition-colors"><Plus size={14} /></button>
                           </div>
                        </td>
                     </motion.tr>
                  ))}
                     </tbody>
                  </table>
               </div>

               <div className="p-4 px-6 bg-[#fafafa] border-t border-[#1a1510]/[0.07] flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#1a1510]/40">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-1">
                     <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-[#1a1510]/[0.07] transition-all text-[#1a1510]/30 flex items-center justify-center"><ChevronRight size={16} className="rotate-180" /></button>
                     <div className="h-8 px-3 rounded-lg bg-[#1a1510] text-brand-gold flex items-center text-[12px] font-semibold">1</div>
                     <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-[#1a1510]/[0.07] transition-all text-[#1a1510]/30 flex items-center justify-center"><ChevronRight size={16} /></button>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
