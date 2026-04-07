"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Users, Search, Filter, Plus, Zap, ShieldCheck, Mail, Target,
   LayoutDashboard, Terminal, MessageSquare, BarChart3, Clock,
   CheckCircle, Sparkles, Bot, Box, MoreVertical, Star,
   Smartphone, MapPin, Briefcase, Globe, ExternalLink, RefreshCw,
   Database, Zap as ZapIcon, Shield, ChevronRight, Download, Settings,
   Cpu, Layout, Layers, Link as LinkIcon, UserPlus, Send
} from "lucide-react";

interface ToolsProps {
   onBackToDashboard: () => void;
}

interface ToolItem {
   id: string;
   name: string;
   category: string;
   description: string;
   isConnected: boolean;
   syncStat?: string;
   icon: any;
}

const CATEGORIES = [
   "All",
   "Prospecting & Data",
   "Enrichment",
   "Email Outreach",
   "LinkedIn",
   "Automation",
   "CRM"
];

const INITIAL_TOOLS: ToolItem[] = [
   { id: "apollo", name: "Apollo.io", category: "Prospecting & Data", description: "B2B database and sales engagement platform", isConnected: true, syncStat: "1,247 leads synced", icon: Database },
   { id: "zoominfo", name: "ZoomInfo", category: "Prospecting & Data", description: "B2B contact & company intelligence", isConnected: false, icon: Globe },
   { id: "cognism", name: "Cognism", category: "Prospecting & Data", description: "GDPR-compliant B2B prospecting data", isConnected: false, icon: Target },
   { id: "lusha", name: "Lusha", category: "Prospecting & Data", description: "Contact & company data enrichment", isConnected: false, icon: Smartphone },
   { id: "seamless", name: "Seamless.AI", category: "Prospecting & Data", description: "Real-time B2B lead search engine", isConnected: false, icon: Search },
   { id: "clay", name: "Clay", category: "Enrichment", description: "Data enrichment & buying signals orchestration", isConnected: true, syncStat: "892 records enriched", icon: Layers },
   { id: "clearbit", name: "Clearbit", category: "Enrichment", description: "Real-time B2B data enrichment", isConnected: false, icon: Cpu },
   { id: "pdl", name: "People Data Labs", category: "Enrichment", description: "Large-scale person & company data API", isConnected: false, icon: Users },
   { id: "smartlead", name: "Smartlead", category: "Email Outreach", description: "Email campaign scale automation", isConnected: true, syncStat: "2,341 emails sent", icon: Zap },
   { id: "instantly", name: "Instantly", category: "Email Outreach", description: "Cold email at scale with deliverability focus", isConnected: false, icon: Mail },
   { id: "lemlist", name: "Lemlist", category: "Email Outreach", description: "Personalized cold outreach platform", isConnected: false, icon: Send },
   { id: "outreach", name: "Outreach", category: "Email Outreach", description: "Enterprise sales engagement platform", isConnected: false, icon: ExternalLink },
   { id: "salesloft", name: "Salesloft", category: "Email Outreach", description: "Revenue workflow and outreach platform", isConnected: false, icon: BarChart3 },
   { id: "heyreach", name: "HeyReach", category: "LinkedIn", description: "LinkedIn outreach and multi-channel scale", isConnected: false, icon: MessageSquare },
   { id: "expandi", name: "Expandi", category: "LinkedIn", description: "Smart LinkedIn automation tool", isConnected: false, icon: Bot },
   { id: "waalaxy", name: "Waalaxy", category: "LinkedIn", description: "LinkedIn + Email multi-channel outreach", isConnected: false, icon: UserPlus },
   { id: "zapier", name: "Zapier", category: "Automation", description: "No-code workflow and app automation", isConnected: false, icon: ZapIcon },
   { id: "make", name: "Make", category: "Automation", description: "Visual workflow automation platform", isConnected: false, icon: Plus },
   { id: "hubspot", name: "HubSpot", category: "CRM", description: "CRM & marketing scale platform", isConnected: true, syncStat: "3,182 contacts synced", icon: Layout },
   { id: "salesforce", name: "Salesforce", category: "CRM", description: "Enterprise CRM and revenue cloud", isConnected: false, icon: Shield },
   { id: "pipedrive", name: "Pipedrive", category: "CRM", description: "Sales-first CRM for focused teams", isConnected: false, icon: Target },
];

export const Tools = ({ onBackToDashboard }: ToolsProps) => {
   const [activeCategory, setActiveCategory] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");

   const filteredTools = useMemo(() => {
      return INITIAL_TOOLS.filter(tool => {
         const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
         const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
         return matchesCategory && matchesSearch;
      });
   }, [activeCategory, searchQuery]);

   const connectedCount = INITIAL_TOOLS.filter(t => t.isConnected).length;

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Integrated Command Header - LIGHT UNIFIED */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg">
                     <Box size={18} />
                  </div>
                  <div>
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase whitespace-nowrap">Tools</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                        Connect your GTM stack to the Control Tower Core
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="relative group">
                  <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Intel search tools..."
                     className="h-10 w-72 pl-14 pr-6 rounded-[1.5rem] bg-[#f7f8f9] border border-[#1a1510]/5 text-xs font-medium focus:outline-none transition-all shadow-inner placeholder:text-[#1a1510]/20"
                  />
               </div>

               <div className="flex items-center gap-3">
                  <button
                     onClick={onBackToDashboard}
                     className="h-10 px-6 rounded-xl bg-white border border-[#1a1510]/5 text-[#1a1510]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:text-[#1a1510] transition-all group"
                  >
                     <LayoutDashboard size={14} className="group-hover:text-brand-gold transition-colors" /> Back to Hub
                  </button>
               </div>
            </div>
         </nav>

         <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto scrollbar-hide">

            {/* 2. Page Title & Category Rail */}
            <div className="space-y-6">
               <div className="flex items-end justify-between">
                  <div>
                  </div>
               </div>

               {/* Category horizontal rail */}
               <div className="flex items-center gap-1.5 p-1 bg-white rounded-[2rem] border border-[#1a1510]/5 w-fit shadow-sm overflow-x-auto scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`h-10 px-8 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                           ? "bg-[#1a1510] text-brand-gold shadow-xl"
                           : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                           }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            {/* 3. Holistic Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
               <AnimatePresence mode="popLayout">
                  {filteredTools.map((tool, idx) => (
                     <motion.div
                        key={tool.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.02, ease: [0.23, 1, 0.32, 1] }}
                        className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-8 flex flex-col justify-between h-[300px] group hover:border-brand-gold/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden"
                     >
                        <div className="space-y-6 relative z-10">
                           {/* Card Header */}
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold border border-[#1a1510]/5 group-hover:scale-110 transition-transform">
                                    <tool.icon size={20} />
                                 </div>
                                 <div>
                                    <h3 className="text-lg font-black text-[#1a1510] tracking-tight leading-none mb-1.5">{tool.name}</h3>
                                    <div className="flex items-center gap-2">
                                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${tool.category === 'Prospecting & Data' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                          tool.category === 'Enrichment' ? 'bg-purple-50 text-purple-500 border-purple-100' :
                                             tool.category === 'Email Outreach' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                'bg-[#1a1510]/5 text-[#1a1510]/40 border-transparent'
                                          }`}>
                                          {tool.category}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className={`text-[8px] font-black uppercase tracking-widest ${tool.isConnected ? 'text-emerald-500' : 'text-[#1a1510]/20'}`}>
                                    {tool.isConnected ? 'Connected' : 'Node Offline'}
                                 </span>
                                 <div className={`w-1.5 h-1.5 rounded-full ${tool.isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-[#1a1510]/10'}`} />
                              </div>
                           </div>

                           {/* Description */}
                           <p className="text-[12px] font-medium text-[#1a1510]/40 leading-relaxed font-serif italic line-clamp-2">
                              {tool.description}
                           </p>
                        </div>

                        {/* Action Node */}
                        <div className="mt-8 relative z-10">
                           {tool.isConnected ? (
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-[#1a1510]/20 px-2">
                                    <span>Flow Synchronization</span>
                                    <span className="text-brand-gold">{tool.syncStat}</span>
                                 </div>
                                 <div className="flex gap-2">
                                    <button className="flex-1 h-12 rounded-2xl border border-[#1a1510]/10 text-[#1a1510] text-[10px] font-black uppercase tracking-widest hover:bg-[#1a1510] hover:text-brand-gold transition-all">
                                       Manage
                                    </button>
                                    <button className="w-12 h-12 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510]/40 hover:text-[#1a1510] transition-colors">
                                       <ChevronRight size={18} />
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <button className="w-full h-12 rounded-2xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:translate-y-[-1px] transition-all">
                                 <LinkIcon size={14} /> Connect Now
                              </button>
                           )}
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>

         </main>
      </div>
   );
};
