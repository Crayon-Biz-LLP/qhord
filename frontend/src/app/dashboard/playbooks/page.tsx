"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, Plus, LayoutDashboard, Star, Download, Clock, ShieldCheck,
   BarChart3, Users, Zap, ExternalLink, Filter, ChevronRight,
   Layers, Database, Cpu, Mail, Target, MessageSquare, Bot,
   CreditCard, Sparkles, MoreVertical, Bookmark, CheckCircle2,
   Linkedin, X, ArrowLeft, ChevronDown, XCircle, Rocket, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";

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

// --- Category to Icons Map ---
const mapCategoryToIcons = (category: string) => {
  switch (category.toLowerCase()) {
    case "saas":
      return [Target, Database, Layers, Zap];
    case "fintech":
      return [ShieldCheck, Database, Layers, Zap];
    case "agency":
      return [Users, Zap, Layers];
    default:
      return [Target, Zap];
  }
};

const CATEGORIES = ["All", "SaaS", "Fintech", "Agency", "E-Commerce", "B2B", "Enterprise", "LinkedIn", "PLG"];
const TABS = ["Browse", "Recommended", "Active", "My Playbooks"];


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
   
   const [playbooks, setPlaybooks] = useState<PlaybookItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [isCreateOpen, setIsCreateOpen] = useState(false);

   // Form states for creating a new playbook
   const [newName, setNewName] = useState("");
   const [newCategory, setNewCategory] = useState("SaaS");
   const [newDifficulty, setNewDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
   const [newDescription, setNewDescription] = useState("");
   const [newConfidence, setNewConfidence] = useState(80);
   const [newReplyRate, setNewReplyRate] = useState("8-12%");
   const [newDeployTime, setNewDeployTime] = useState("15 minutes");
   const [newCredits, setNewCredits] = useState(20);
   const [creating, setCreating] = useState(false);

   const fetchPlaybooks = async () => {
      setLoading(true);
      try {
         const res = await api.get("/playbooks");
         if (res.data.success && Array.isArray(res.data.playbooks)) {
            const mapped = res.data.playbooks.map((pb: any) => ({
               id: pb.id,
               name: pb.name,
               difficulty: pb.difficulty as any,
               description: pb.description,
               creator: pb.creator || "Control Tower Team",
               tools: mapCategoryToIcons(pb.category),
               rating: pb.rating || 4.5,
               imports: pb.imports || "0",
               confidence: pb.confidence || 80,
               deployTime: pb.deploy_time || "15 minutes",
               credits: pb.credits || 20,
               category: pb.category,
               replyRate: pb.reply_rate || "8-12%",
            }));
            setPlaybooks(mapped);
         }
      } catch (err) {
         console.error("Failed to load playbooks:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchPlaybooks();
   }, []);

   const handleCreatePlaybook = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName || !newDescription) return;
      setCreating(true);
      try {
         const res = await api.post("/playbooks", {
            name: newName,
            category: newCategory,
            difficulty: newDifficulty,
            description: newDescription,
            confidence: newConfidence,
            reply_rate: newReplyRate,
            deploy_time: newDeployTime,
            credits: newCredits
         });
         if (res.data.success) {
            const pb = res.data.playbook;
            const mapped: PlaybookItem = {
               id: pb.id,
               name: pb.name,
               difficulty: pb.difficulty as any,
               description: pb.description,
               creator: pb.creator || "Control Tower Team",
               tools: mapCategoryToIcons(pb.category),
               rating: pb.rating || 4.5,
               imports: pb.imports || "0",
               confidence: pb.confidence || 80,
               deployTime: pb.deploy_time || "15 minutes",
               credits: pb.credits || 20,
               category: pb.category,
               replyRate: pb.reply_rate || "8-12%",
            };
            setPlaybooks(prev => [...prev, mapped]);
            setIsCreateOpen(false);
            // Reset form
            setNewName("");
            setNewDescription("");
            setNewConfidence(80);
            setNewReplyRate("8-12%");
            setNewDeployTime("15 minutes");
            setNewCredits(20);
         }
      } catch (err) {
         console.error("Failed to create playbook:", err);
      } finally {
         setCreating(false);
      }
   };

   const filteredPlaybooks = useMemo(() => {
      return playbooks.filter(pb => {
         const matchesCategory = activeCategory === "All" || pb.category.toLowerCase() === activeCategory.toLowerCase();
         const matchesSearch = pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pb.description.toLowerCase().includes(searchQuery.toLowerCase());
         return matchesCategory && matchesSearch;
      });
   }, [playbooks, activeCategory, searchQuery]);

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] selection:bg-brand-gold/30 font-sans relative">

         {/* Header */}
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

               <button
                  onClick={() => setIsCreateOpen(true)}
                  className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors whitespace-nowrap"
               >
                  <Plus size={15} /> <span className="hidden sm:inline">Create</span>
               </button>
               <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
               >
                  <LayoutDashboard size={15} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide pb-32">

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { label: "Total Playbooks", val: playbooks.length },
                  { label: "Avg Performance", val: "85%" },
                  { label: "Total Imports", val: "12K+" },
                  { label: "Top Confidence", val: "94%" },
               ].map((stat, i) => (
                  <div key={i} className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200">
                     <p className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3 truncate">{stat.label}</p>
                     <h4 className="text-[2rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{stat.val}</h4>
                  </div>
               ))}
            </div>

            {/* Tabs & Categories */}
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
                        className={`h-8 px-4 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === cat
                           ? "bg-[#1a1510] text-white"
                           : "bg-white border border-[#1a1510]/[0.07] text-[#1a1510]/45 hover:text-[#1a1510] hover:border-[#1a1510]/15"
                           }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            {/* Playbook Grid */}
            {loading ? (
               <div className="flex items-center justify-center py-24">
                  <Loader size={36} />
               </div>
            ) : filteredPlaybooks.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-4"><Bookmark size={26} /></div>
                  <p className="text-[15px] font-semibold text-[#1a1510]">No playbooks found</p>
                  <p className="text-[13px] text-[#1a1510]/40 mt-1">Try a different category or create your own.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
                  {filteredPlaybooks.map((pb, idx) => (
                     <motion.div
                        key={pb.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 flex flex-col group shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:border-[#1a1510]/15 transition-all"
                     >
                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between items-start gap-3">
                              <h3 className="text-[17px] font-bold text-[#1a1510] tracking-tight leading-snug">{pb.name}</h3>
                              <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide ${pb.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-600" : pb.difficulty === "Intermediate" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                                 {pb.difficulty}
                              </span>
                           </div>

                           <p className="text-[13px] text-[#1a1510]/45 leading-relaxed line-clamp-2">
                              {pb.description}
                           </p>

                           <div className="flex items-center justify-between pt-3 border-t border-[#1a1510]/[0.06]">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-md bg-[#1a1510] flex items-center justify-center text-brand-gold text-[9px] font-semibold">CT</div>
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

                           <div className="grid grid-cols-2 gap-2">
                              <div className="bg-[#fafafa] rounded-lg p-3 border border-[#1a1510]/[0.05] text-center">
                                 <p className="text-[14px] font-semibold text-[#1a1510] leading-none tabular-nums">{pb.replyRate}</p>
                                 <p className="text-[9px] font-medium text-[#1a1510]/35 uppercase tracking-wide mt-1.5">Reply Rate</p>
                              </div>
                              <div className="bg-[#fafafa] rounded-lg p-3 border border-[#1a1510]/[0.05] text-center">
                                 <p className="text-[14px] font-semibold text-[#1a1510] leading-none tabular-nums">{pb.confidence}%</p>
                                 <p className="text-[9px] font-medium text-[#1a1510]/35 uppercase tracking-wide mt-1.5">Confidence</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-2.5 mt-5">
                           <button
                              onClick={() => setSelectedPlaybook(pb)}
                              className="btn-shine btn-shine-dark flex-1 h-11 rounded-none border border-[#1a1510]/10 text-[#1a1510] text-xs font-semibold hover:bg-[#1a1510]/[0.02] transition-colors flex items-center justify-center gap-2"
                           >
                              <Zap size={14} /> Inspect
                           </button>
                           <button
                              onClick={() => setImportPlaybook(pb)}
                              className="btn-shine flex-[1.4] h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2"
                           >
                              <Sparkles size={14} /> Use
                           </button>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}
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

         {/* Create Playbook Modal */}
         <AnimatePresence>
            {isCreateOpen && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[600px] h-fit max-h-[90vh] bg-white rounded-[2rem] shadow-2xl z-[201] overflow-y-auto p-6 sm:p-8">
                     <form onSubmit={handleCreatePlaybook} className="space-y-6">
                        <div className="flex justify-between items-center">
                           <h2 className="text-xl font-black text-[#1a1510]">Create Playbook Template</h2>
                           <button type="button" onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-[#f7f8f9] rounded-xl"><X size={18} /></button>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Playbook Name</label>
                              <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Enterprise SDR System" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Category</label>
                                 <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold">
                                    <option value="SaaS">SaaS</option>
                                    <option value="Fintech">Fintech</option>
                                    <option value="Agency">Agency</option>
                                    <option value="B2B">B2B</option>
                                    <option value="E-Commerce">E-Commerce</option>
                                    <option value="Enterprise">Enterprise</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="PLG">PLG</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Difficulty</label>
                                 <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value as any)} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Description</label>
                              <textarea required value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Provide details of the GTM steps and automation setup..." className="w-full min-h-[80px] p-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Confidence (%)</label>
                                 <input type="number" min="0" max="100" value={newConfidence} onChange={(e) => setNewConfidence(parseInt(e.target.value, 10))} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Reply Rate</label>
                                 <input type="text" value={newReplyRate} onChange={(e) => setNewReplyRate(e.target.value)} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Deploy Time</label>
                                 <input type="text" value={newDeployTime} onChange={(e) => setNewDeployTime(e.target.value)} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Credits Required</label>
                                 <input type="number" min="0" value={newCredits} onChange={(e) => setNewCredits(parseInt(e.target.value, 10))} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#1a1510]/5">
                           <button type="button" onClick={() => setIsCreateOpen(false)} className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase">Cancel</button>
                           <button type="submit" disabled={creating} className="flex-1 h-12 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2">
                              {creating ? <Loader2 className="animate-spin" size={14} /> : "Save Template"}
                           </button>
                        </div>
                     </form>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}

