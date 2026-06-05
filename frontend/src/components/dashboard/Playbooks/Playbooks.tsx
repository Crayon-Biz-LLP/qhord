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

         {/* 1. Header & Commands */}
         <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                     <Bookmark size={17} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Playbooks</h2>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Proven GTM workflows</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
               <div className="relative group hidden md:block">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search playbooks…"
                     className="h-10 w-48 lg:w-64 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
                  />
               </div>
               <button className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors">
                  <Plus size={15} /> <span className="hidden sm:inline">Create</span>
               </button>
               <button
                  onClick={onBackToDashboard}
                  className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
               >
                  <LayoutDashboard size={15} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide">

            {/* 2. Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { label: "Active Playbooks", val: "2" },
                  { label: "Avg Performance", val: "85%" },
                  { label: "Total Imports", val: "12.4K" },
                  { label: "Top Confidence", val: "94%" },
               ].map((stat, i) => (
                  <div key={i} className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200">
                     <p className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3">{stat.label}</p>
                     <h4 className="text-[2rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{stat.val}</h4>
                  </div>
               ))}
            </div>

            {/* 3. Tabs + Categories */}
            <div className="space-y-4">
               <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#1a1510]/[0.07] w-fit overflow-x-auto scrollbar-hide max-w-full">
                  {TABS.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`h-9 px-4 sm:px-5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                           ? "bg-[#1a1510] text-white"
                           : "text-[#1a1510]/35 hover:text-[#1a1510]/60"
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="flex flex-wrap items-center gap-1.5">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`h-8 px-4 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all ${activeCategory === cat
                           ? "bg-[#1a1510] text-white"
                           : "bg-white border border-[#1a1510]/[0.07] text-[#1a1510]/45 hover:text-[#1a1510] hover:border-[#1a1510]/15"
                           }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            {/* 4. Playbook Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
               <AnimatePresence mode="popLayout">
                  {filteredPlaybooks.map((pb, idx) => (
                     <motion.div
                        key={pb.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 flex flex-col group shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:border-[#1a1510]/15 transition-all"
                     >
                        <div className="flex-1 space-y-4">
                           {/* Title & Difficulty */}
                           <div className="flex justify-between items-start gap-3">
                              <h3 className="text-[17px] font-bold text-[#1a1510] tracking-tight leading-snug">{pb.name}</h3>
                              <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide ${pb.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-600" :
                                 pb.difficulty === "Intermediate" ? "bg-amber-50 text-amber-600" :
                                    "bg-red-50 text-red-600"
                                 }`}>
                                 {pb.difficulty}
                              </span>
                           </div>

                           {/* Description */}
                           <p className="text-[13px] text-[#1a1510]/45 leading-relaxed line-clamp-2">
                              {pb.description}
                           </p>

                           {/* Metadata: Creator & Tools */}
                           <div className="flex items-center justify-between pt-3 border-t border-[#1a1510]/[0.06]">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-md bg-[#1a1510] flex items-center justify-center text-brand-gold text-[9px] font-semibold">
                                    CT
                                 </div>
                                 <span className="text-[11px] font-medium text-[#1a1510]/40">{pb.creator}</span>
                              </div>
                              <div className="flex items-center -space-x-1.5">
                                 {pb.tools.map((Icon, i) => (
                                    <div key={i} className="w-7 h-7 rounded-md bg-[#f7f8f9] border border-[#1a1510]/[0.07] flex items-center justify-center text-[#1a1510]/45">
                                       <Icon size={13} />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Metric Grid (4 col) */}
                           <div className="grid grid-cols-4 gap-2">
                              {[
                                 { label: "Rating", val: pb.rating },
                                 { label: "Imports", val: pb.imports },
                                 { label: "Conf.", val: `${pb.confidence}%` },
                                 { label: "Deploy", val: pb.deployTime.split(" ")[0] + "m" }
                              ].map((item, i) => (
                                 <div key={i} className="bg-[#fafafa] rounded-lg p-2.5 border border-[#1a1510]/[0.05] text-center">
                                    <p className="text-[13px] font-semibold text-[#1a1510] leading-none tabular-nums whitespace-nowrap">{item.val}</p>
                                    <p className="text-[9px] font-medium text-[#1a1510]/35 uppercase tracking-wide mt-1.5">{item.label}</p>
                                 </div>
                              ))}
                           </div>

                           {/* Reply Rate + Credits */}
                           <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                 <BarChart3 size={13} />
                                 <span>{pb.replyRate} reply rate</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[#1a1510]/50">
                                 <CreditCard size={12} />
                                 <span>~{pb.credits} credits</span>
                              </div>
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5 mt-5">
                           <button
                              onClick={() => setSelectedPlaybook(pb)}
                              className="btn-shine btn-shine-dark flex-1 h-11 rounded-none border border-[#1a1510]/10 text-[#1a1510] text-xs font-semibold hover:bg-[#1a1510]/[0.02] transition-colors flex items-center justify-center gap-2"
                           >
                              <Zap size={14} /> Inspect
                           </button>
                           <button
                              onClick={() => handleOpenImport(pb)}
                              className="btn-shine flex-[1.4] h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2"
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
