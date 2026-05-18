"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, Plus, LayoutDashboard, Star, Download, Clock, ShieldCheck,
   BarChart3, Users, Zap, ExternalLink, Filter, ChevronRight,
   Layers, Database, Cpu, Mail, Target, MessageSquare, Bot,
   CreditCard, Sparkles, MoreVertical, Bookmark, CheckCircle2,
   Linkedin, X, ArrowLeft, ChevronDown, XCircle, Rocket
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Types ---
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

// --- Mock Data ---
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
];

// --- Sub-components (Simplified for single-file integration) ---

const PlaybookInspect = ({ playbook, onClose, onImport }: { playbook: PlaybookItem | null, onClose: () => void, onImport: (pb: PlaybookItem) => void }) => {
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  if (!playbook) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-[101] overflow-y-auto">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border bg-brand-gold/10 text-brand-gold border-brand-gold/20">{playbook.difficulty}</span>
            <button onClick={onClose} className="p-2 hover:bg-[#f7f8f9] rounded-xl"><X size={20} /></button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a1510] tracking-tighter">{playbook.name}</h2>
          <p className="text-sm text-[#1a1510]/60 italic">{playbook.description}</p>
          
          <div className="flex gap-4 border-b border-[#1a1510]/5">
            {["Overview", "Steps"].map(tab => (
              <button key={tab} onClick={() => setActiveSubTab(tab)} className={`pb-3 text-[10px] font-black uppercase tracking-widest relative ${activeSubTab === tab ? "text-[#1a1510]" : "text-[#1a1510]/30"}`}>
                {tab}
                {activeSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />}
              </button>
            ))}
          </div>

          <div className="space-y-6 pb-24">
             {activeSubTab === "Overview" ? (
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#f7f8f9] rounded-2xl text-center">
                       <p className="text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest">Confidence</p>
                       <p className="text-xl font-black text-[#1a1510]">{playbook.confidence}%</p>
                    </div>
                    <div className="p-4 bg-[#f7f8f9] rounded-2xl text-center">
                       <p className="text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest">Reply Rate</p>
                       <p className="text-xl font-black text-emerald-500">{playbook.replyRate}</p>
                    </div>
                 </div>
                 <section className="space-y-3">
                    <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-widest">Strategy</h5>
                    {["Target SaaS Founders", "Enrich with Clay", "Multi-channel Outreach"].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-[#1a1510]">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" /> {s}
                      </div>
                    ))}
                 </section>
               </div>
             ) : (
               <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 bg-white border border-[#1a1510]/5 rounded-2xl flex gap-4">
                       <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-black">{i}</div>
                       <div>
                          <p className="text-[12px] font-black text-[#1a1510]">Automation Step {i}</p>
                          <p className="text-[10px] text-[#1a1510]/40">Configured via primary toolset</p>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-[#1a1510]/5">
            <button onClick={() => onImport(playbook)} className="w-full h-14 bg-[#1a1510] text-brand-gold rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
              <Sparkles size={16} /> Use This Playbook
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const PlaybookImportModal = ({ playbook, isOpen, onClose }: { playbook: PlaybookItem | null, isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  if (!playbook || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[600px] h-fit bg-white rounded-[2rem] shadow-2xl z-[201] overflow-hidden p-6 sm:p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-[#1a1510]">Import {playbook.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#f7f8f9] rounded-xl"><X size={18} /></button>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-blue-500" : "bg-[#f7f8f9]"}`} />
            ))}
          </div>

          <div className="space-y-6 py-4">
             {step === 1 ? (
               <div className="space-y-4">
                 <p className="text-sm font-bold text-[#1a1510]/60">Checking workspace compatibility...</p>
                 <div className="space-y-3">
                   {["Apollo", "Clay", "Smartlead"].map(t => (
                     <div key={t} className="flex items-center justify-between p-4 bg-[#f7f8f9] rounded-2xl">
                       <span className="text-xs font-black text-[#1a1510]">{t}</span>
                       <CheckCircle2 size={16} className="text-emerald-500" />
                     </div>
                   ))}
                 </div>
               </div>
             ) : step === 2 ? (
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Campaign Name</label>
                    <input type="text" defaultValue={playbook.name} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Primary Goal</label>
                    <select className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none">
                      <option>Book Meetings</option>
                      <option>Drive Trials</option>
                    </select>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center py-8 space-y-4 text-center">
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                   <Rocket size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-[#1a1510]">Deploy Ready</h3>
                 <p className="text-sm text-[#1a1510]/40">Your playbook is configured and ready to scale.</p>
               </div>
             )}
          </div>

          <div className="flex gap-3 pt-4">
             {step > 1 && <button onClick={() => setStep(step - 1)} className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase">Back</button>}
             <button onClick={() => step < 3 ? setStep(step + 1) : onClose()} className="flex-1 h-12 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">
               {step === 3 ? "Launch Playbook" : "Next Step"}
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function PlaybooksPage() {
   const router = useRouter();
   const [activeTab, setActiveTab] = useState("Browse");
   const [activeCategory, setActiveCategory] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookItem | null>(null);
   const [importPlaybook, setImportPlaybook] = useState<PlaybookItem | null>(null);

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

         {/* Header */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                     <Bookmark size={18} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Playbooks</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/20 uppercase tracking-widest mt-0.5 truncate">
                        Proven GTM workflows
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
               <div className="relative group hidden md:block">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search playbooks..."
                     className="h-10 w-48 lg:w-64 pl-12 pr-4 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-medium focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
               </div>

               <button className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:translate-y-[-1px] transition-all whitespace-nowrap">
                  <Plus size={14} strokeWidth={3} /> <span className="hidden sm:inline">Create</span>
               </button>
               <button
                  onClick={() => router.push('/dashboard')}
                  className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8 overflow-y-auto scrollbar-hide pb-32">

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
               {[
                  { label: "Active", val: "2", icon: Bookmark },
                  { label: "Performance", val: "85%", icon: BarChart3 },
                  { label: "Imports", val: "12K+", icon: Download },
                  { label: "Confidence", val: "94%", icon: ShieldCheck },
               ].map((stat, i) => (
                  <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex items-center gap-4 group hover:shadow-lg transition-all">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center justify-center text-brand-gold shrink-0">
                        <stat.icon size={18} />
                     </div>
                     <div className="truncate">
                        <p className="text-[8px] sm:text-[10px] font-bold text-[#1a1510]/20 uppercase tracking-widest truncate">{stat.label}</p>
                        <h4 className="text-lg sm:text-2xl font-black text-[#1a1510] tracking-tight">{stat.val}</h4>
                     </div>
                  </div>
               ))}
            </div>

            {/* Tabs & Categories */}
            <div className="space-y-6">
               <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#1a1510]/5 w-fit shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                  {TABS.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`h-9 px-4 sm:px-6 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                           ? "bg-[#1a1510] text-brand-gold shadow-lg"
                           : "text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`h-8 px-4 sm:px-5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                           ? "bg-[#1a1510] text-brand-gold shadow-md"
                           : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-white"
                           }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            {/* Playbook Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-32">
               {filteredPlaybooks.map((pb, idx) => (
                  <motion.div
                     key={pb.id}
                     whileHover={{ y: -4 }}
                     className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#1a1510]/5 p-6 sm:p-8 flex flex-col group hover:shadow-xl transition-all relative overflow-hidden h-full"
                  >
                     <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                           <h3 className="text-lg sm:text-xl font-black text-[#1a1510] tracking-tight leading-tight truncate">{pb.name}</h3>
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${pb.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"}`}>
                              {pb.difficulty}
                           </span>
                        </div>

                        <p className="text-xs font-medium text-[#1a1510]/40 leading-relaxed line-clamp-3">
                           {pb.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-[#1a1510]/5">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#1a1510] flex items-center justify-center text-brand-gold text-[8px] font-black">CT</div>
                              <span className="text-[9px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{pb.creator}</span>
                           </div>
                           <div className="flex items-center -space-x-1.5">
                              {pb.tools.map((Icon, i) => (
                                 <div key={i} className="w-7 h-7 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510]/40 shadow-sm">
                                    <Icon size={12} />
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                           <div className="bg-[#f7f8f9]/50 rounded-xl p-3 border border-[#1a1510]/5 text-center">
                              <p className="text-[10px] font-black text-[#1a1510] leading-none mb-1">{pb.replyRate}</p>
                              <p className="text-[7px] font-bold text-[#1a1510]/20 uppercase tracking-widest">Reply Rate</p>
                           </div>
                           <div className="bg-[#f7f8f9]/50 rounded-xl p-3 border border-[#1a1510]/5 text-center">
                              <p className="text-[10px] font-black text-[#1a1510] leading-none mb-1">{pb.confidence}%</p>
                              <p className="text-[7px] font-bold text-[#1a1510]/20 uppercase tracking-widest">Confidence</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3 mt-8">
                        <button
                           onClick={() => setSelectedPlaybook(pb)}
                           className="flex-1 h-11 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[9px] font-black uppercase tracking-widest hover:bg-[#f7f8f9] transition-all flex items-center justify-center gap-2"
                        >
                           Inspect
                        </button>
                        <button 
                           onClick={() => setImportPlaybook(pb)}
                           className="flex-[1.5] h-11 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-black uppercase tracking-widest shadow-lg hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
                        >
                           Use
                        </button>
                     </div>
                  </motion.div>
               ))}
            </div>
         </main>

         <PlaybookInspect 
            playbook={selectedPlaybook} 
            onClose={() => setSelectedPlaybook(null)} 
            onImport={(pb) => {
               setSelectedPlaybook(null);
               setImportPlaybook(pb);
            }}
         />

         <PlaybookImportModal 
            playbook={importPlaybook}
            isOpen={!!importPlaybook}
            onClose={() => setImportPlaybook(null)}
         />
      </div>
   );
}
