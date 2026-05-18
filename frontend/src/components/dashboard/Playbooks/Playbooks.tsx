"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, Plus, LayoutDashboard, Star, Download, Clock, ShieldCheck,
   BarChart3, Users, Zap, ExternalLink, Filter, ChevronRight,
   Layers, Database, Cpu, Mail, Target, MessageSquare, Bot,
   CreditCard, Sparkles, MoreVertical, Bookmark, CheckCircle2
} from "lucide-react";
import { PlaybookInspect } from "./PlaybookInspect";
import { PlaybookImportModal } from "./PlaybookImportModal";

interface PlaybooksProps {
   onBackToDashboard: () => void;
}

export interface PlaybookItem {
   id: string;
   name: string;
   difficulty: "Beginner" | "Intermediate" | "Advanced";
   description: string;
   creator: string;
   tools: any[];
   rating: number;
   imports: string;
   confidence: number;
   deployTime: string;
   credits: number;
   category: string;
   replyRate: string;
}

const CATEGORIES = ["All", "SaaS", "Fintech", "Agency", "E-Commerce", "B2B", "Enterprise", "LinkedIn", "PLG"];
const TABS = ["Browse", "Recommended", "Active", "My Playbooks"];

const PLAYBOOKS_DATA: PlaybookItem[] = [
   {
      id: "saas-sdr",
      name: "SaaS SDR Playbook",
      difficulty: "Intermediate",
      description: "Complete outbound motion for SaaS companies targeting mid market. Includes ICP enrichment, multi-channel sequences, and automated follow-ups.",
      creator: "Control Tower Team",
      tools: [Target, Database, Layers, Zap],
      rating: 4.8,
      imports: "2.3K",
      confidence: 82,
      deployTime: "15 minutes",
      credits: 40,
      category: "SaaS",
      replyRate: "8-12%"
   },
   {
      id: "fintech-outreach",
      name: "Fintech Outreach System",
      difficulty: "Advanced",
      description: "Targeted outreach for fintech decision makers with compliance-safe messaging and high-deliverability focus.",
      creator: "Control Tower Team",
      tools: [ShieldCheck, Database, Layers, Zap],
      rating: 4.6,
      imports: "1.9K",
      confidence: 75,
      deployTime: "25 minutes",
      credits: 25,
      category: "Fintech",
      replyRate: "6-10%"
   },
   {
      id: "agency-cold-email",
      name: "Agency Cold Email Engine",
      difficulty: "Beginner",
      description: "High volume email outreach system for agencies. Optimized for scale with inbox rotation and warm-up.",
      creator: "Control Tower Team",
      tools: [Users, Zap, Layers],
      rating: 4.9,
      imports: "3.1K",
      confidence: 88,
      deployTime: "10 minutes",
      credits: 15,
      category: "Agency",
      replyRate: "10-13%"
   },
   {
      id: "enterprise-abm",
      name: "Enterprise ABM Play",
      difficulty: "Advanced",
      description: "Account-based motion targeting enterprise logos. LinkedIn-first with personalized email follow-up.",
      creator: "Control Tower Team",
      tools: [BarChart3, Database, MessageSquare, Layers],
      rating: 4.7,
      imports: "1.6K",
      confidence: 78,
      deployTime: "30 minutes",
      credits: 25,
      category: "Enterprise",
      replyRate: "6-10%"
   },
   {
      id: "linkedin-first",
      name: "LinkedIn-First Outreach",
      difficulty: "Beginner",
      description: "LinkedIn-native prospecting with automated connection requests and personalized message sequences.",
      creator: "Control Tower Team",
      tools: [MessageSquare, MessageSquare, Database],
      rating: 4.5,
      imports: "2.8K",
      confidence: 85,
      deployTime: "8 minutes",
      credits: 15,
      category: "LinkedIn",
      replyRate: "15-25%"
   },
   {
      id: "plg-outbound",
      name: "Product-Led Growth Outbound",
      difficulty: "Intermediate",
      description: "Target trial users and freemium accounts with intent signals. Convert PLG users to enterprise deals.",
      creator: "Control Tower Team",
      tools: [Zap, Database, Layers, Target],
      rating: 4.4,
      imports: "0.9K",
      confidence: 72,
      deployTime: "20 minutes",
      credits: 20,
      category: "PLG",
      replyRate: "12-18%"
   }
];

export const Playbooks = ({ onBackToDashboard }: PlaybooksProps) => {
   const [activeTab, setActiveTab] = useState("Browse");
   const [activeCategory, setActiveCategory] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookItem | null>(null);
   const [importPlaybook, setImportPlaybook] = useState<PlaybookItem | null>(null);
   const [isImportModalOpen, setIsImportModalOpen] = useState(false);

   const handleOpenImport = (pb: PlaybookItem) => {
      setImportPlaybook(pb);
      setIsImportModalOpen(true);
   };

   const filteredPlaybooks = useMemo(() => {
      return PLAYBOOKS_DATA.filter(pb => {
         const matchesCategory = activeCategory === "All" || pb.category === activeCategory;
         const matchesSearch = pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pb.description.toLowerCase().includes(searchQuery.toLowerCase());
         return matchesCategory && matchesSearch;
      });
   }, [activeCategory, searchQuery]);

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] selection:bg-brand-gold/30 font-sans relative">

         {/* 1. Header & Commands - LIGHT UNIFIED */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg">
                     <Bookmark size={18} />
                  </div>
                  <div>
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase whitespace-nowrap">Playbooks</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/20 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                        Proven  — browse, customize & deploy in minutes.
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
                     placeholder="Intel search playbooks..."
                     className="h-10 w-72 pl-14 pr-6 rounded-[1.5rem] bg-[#f7f8f9] border border-[#1a1510]/5 text-xs font-medium focus:outline-none transition-all shadow-inner placeholder:text-[#1a1510]/20"
                  />
               </div>

               <div className="flex items-center gap-3">
                  <button className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:translate-y-[-1px] transition-all">
                     <Plus size={14} strokeWidth={3} /> Create Playbook
                  </button>
                  <button
                     onClick={onBackToDashboard}
                     className="h-10 px-6 rounded-xl bg-white border border-[#1a1510]/5 text-[#1a1510]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:text-[#1a1510] transition-all group"
                  >
                     <LayoutDashboard size={14} className="group-hover:text-brand-gold transition-colors" /> Back to Hub
                  </button>
               </div>
            </div>
         </nav>

         <main className="flex-1 p-6 lg:p-10 space-y-10 overflow-y-auto scrollbar-hide">

            {/* 2. Hero Section & Stats */}
            <div className="space-y-8">
               {/* Metric Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { label: "Active Playbooks", val: "2", icon: Bookmark },
                     { label: "Avg Performance", val: "85%", icon: BarChart3 },
                     { label: "Total Imports", val: "12.4K", icon: Download },
                     { label: "Top Confidence", val: "94%", icon: ShieldCheck },
                  ].map((stat, i) => (
                     <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 flex items-center gap-5 hover:border-brand-gold/20 shadow-sm transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                           <stat.icon size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-[#1a1510]/20 uppercase tracking-widest mb-1">{stat.label}</p>
                           <h4 className="text-2xl font-black text-[#1a1510] tracking-tight">{stat.val}</h4>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* 3. Navigation Tier System */}
            <div className="space-y-6">
               <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#1a1510]/5 w-fit shadow-sm">
                  {TABS.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                           ? "bg-[#1a1510] text-brand-gold shadow-lg"
                           : "text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 p-1 bg-white rounded-full border border-[#1a1510]/5 shadow-sm">
                     {CATEGORIES.map((cat) => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`h-9 px-6 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                              ? "bg-[#1a1510] text-brand-gold"
                              : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                              }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* 4. Playbook Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
               <AnimatePresence mode="popLayout">
                  {filteredPlaybooks.map((pb, idx) => (
                     <motion.div
                        key={pb.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                        className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-8 flex flex-col group hover:border-brand-gold/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden h-full"
                     >
                        <div className="flex-1 space-y-6 relative z-10">
                           {/* Title & Difficulty */}
                           <div className="flex justify-between items-start gap-4">
                              <h3 className="text-xl font-black text-[#1a1510] tracking-tight leading-[1.1]">{pb.name}</h3>
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${pb.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                                 pb.difficulty === "Intermediate" ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20" :
                                    "bg-red-50 text-red-500 border-red-100"
                                 }`}>
                                 {pb.difficulty}
                              </span>
                           </div>

                           {/* Description */}
                           <p className="text-[12px] font-medium text-[#1a1510]/40 leading-relaxed line-clamp-3 italic font-serif">
                              {pb.description}
                           </p>

                           {/* Metadata: Creator & Tools */}
                           <div className="flex items-center justify-between pt-4 border-t border-[#1a1510]/5">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-[#1a1510] flex items-center justify-center text-brand-gold text-[8px] font-black">
                                    CT
                                 </div>
                                 <span className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{pb.creator}</span>
                              </div>
                              <div className="flex items-center -space-x-2">
                                 {pb.tools.map((Icon, i) => (
                                    <div key={i} className="w-8 h-8 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510]/40 hover:text-brand-gold hover:border-brand-gold/30 hover:z-20 transition-all cursor-pointer">
                                       <Icon size={14} />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Metric Grid (4 col) */}
                           <div className="grid grid-cols-4 gap-2 pt-2">
                              {[
                                 { label: "Rating", val: pb.rating, icon: Star, color: "text-brand-gold" },
                                 { label: "Imports", val: pb.imports, icon: Download, color: "text-[#1a1510]" },
                                 { label: "Confidence", val: `${pb.confidence}%`, icon: ShieldCheck, color: "text-emerald-500" },
                                 { label: "Deploy", val: pb.deployTime.split(" ")[0], icon: Clock, color: "text-[#1a1510]" }
                              ].map((item, i) => (
                                 <div key={i} className="bg-[#f7f8f9] rounded-2xl p-3 border border-[#1a1510]/5 text-center">
                                    <item.icon size={12} className={`mx-auto mb-1.5 ${item.color}`} />
                                    <p className="text-[11px] font-black text-[#1a1510] leading-none whitespace-nowrap">{item.val}</p>
                                    <p className="text-[7px] font-bold text-[#1a1510]/20 uppercase tracking-widest mt-1">{item.label}</p>
                                 </div>
                              ))}
                           </div>

                           {/* Reply Rate Metric */}
                           <div className="flex items-center justify-between text-[10px] font-bold text-[#1a1510]/30 px-2 pt-2">
                              <div className="flex items-center gap-2">
                                 <BarChart3 size={12} className="text-emerald-500" />
                                 <span className="uppercase tracking-[0.1em] font-black">{pb.replyRate} reply rate</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-[#f7f8f9] px-2 py-1 rounded-lg border border-[#1a1510]/5">
                                 <CreditCard size={10} className="text-brand-gold" />
                                 <span className="text-[#1a1510] font-black truncate max-w-[50px]">~{pb.credits} credits</span>
                              </div>
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-8 relative z-10">
                           <button
                              onClick={() => setSelectedPlaybook(pb)}
                              className="flex-1 h-12 rounded-2xl border border-[#1a1510]/10 text-[#1a1510] text-[10px] font-black uppercase tracking-widest hover:bg-[#f7f8f9] transition-all flex items-center justify-center gap-2"
                           >
                              <Zap size={14} className="text-brand-gold" /> Inspect
                           </button>
                           <button 
                              onClick={() => handleOpenImport(pb)}
                              className="flex-[1.5] h-12 rounded-2xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
                           >
                              <Sparkles size={14} /> Copy & Customize
                           </button>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </main>

         <PlaybookInspect 
            playbook={selectedPlaybook} 
            onClose={() => setSelectedPlaybook(null)} 
            onImport={(pb) => {
               setSelectedPlaybook(null);
               handleOpenImport(pb);
            }}
         />

         <PlaybookImportModal 
            playbook={importPlaybook}
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
         />
      </div>
   );
};
