"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   DollarSign, Users, Activity, Plus, RefreshCw, ChevronRight,
   Settings, Bell, Bot, Box, Search, ShieldCheck, Zap, TrendingUp,
   LayoutDashboard, Terminal, Target, Mail, BarChart3, Clock,
   CheckCircle, MoreHorizontal, MoreVertical, Layers, ArrowRight,
   Sparkles, Filter, LayoutPanelLeft, LineChart, PieChart, X, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";

interface DealItem {
   id: string;
   name: string;
   contact: string;
   amount: string;
   health: number;
   stage: string;
   auto: boolean;
   avatar: string;
}

const STAGE_CONFIGS = [
   { key: "New Lead", title: "New Lead", color: "bg-[#1a1510]/10" },
   { key: "Engaged", title: "Engaged", color: "bg-blue-500" },
   { key: "Meeting", title: "Meeting", color: "bg-brand-gold" },
   { key: "Proposal", title: "Proposal", color: "bg-[#1a1510]" },
   { key: "Closed", title: "Closed", color: "bg-emerald-500" }
];

export default function PipelinePage() {
   const router = useRouter();
   const { selectedClient } = useClient();
   const [deals, setDeals] = useState<DealItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   
   // Create Deal Modal States
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [newName, setNewName] = useState("");
   const [newContact, setNewContact] = useState("");
   const [newAmount, setNewAmount] = useState("$25K");
   const [newStage, setNewStage] = useState("New Lead");
   const [newHealth, setNewHealth] = useState(80);
   const [newAuto, setNewAuto] = useState(true);
   const [creating, setCreating] = useState(false);

   const fetchDeals = async () => {
      if (!selectedClient) {
         setDeals([]);
         setLoading(false);
         return;
      }
      setLoading(true);
      try {
         const res = await api.get(`/deals?clientId=${selectedClient.id}`);
         if (res.data.success) {
            setDeals(res.data.deals || []);
         }
      } catch (err) {
         console.error("Failed to load deals:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDeals();
   }, [selectedClient]);

   const handleCreateDeal = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !newName || !newContact) return;
      setCreating(true);
      try {
         const res = await api.post("/deals", {
            name: newName,
            contact: newContact,
            amount: newAmount,
            stage: newStage,
            health: newHealth,
            auto: newAuto,
            clientId: selectedClient.id,
            avatar: newContact.charAt(0).toUpperCase()
         });
         if (res.data.success) {
            setDeals(prev => [res.data.deal, ...prev]);
            setIsCreateOpen(false);
            setNewName("");
            setNewContact("");
            setNewAmount("$25K");
            setNewStage("New Lead");
            setNewHealth(80);
            setNewAuto(true);
         }
      } catch (err) {
         console.error("Failed to create deal:", err);
      } finally {
         setCreating(false);
      }
   };

   const handleUpdateStage = async (dealId: string, targetStage: string) => {
      try {
         const res = await api.put(`/deals/${dealId}`, { stage: targetStage });
         if (res.data.success) {
            setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: targetStage } : d));
         }
      } catch (err) {
         console.error("Failed to update deal stage:", err);
      }
   };

   const parseAmount = (amt: string): number => {
      const clean = amt.replace(/[^0-9.]/g, "");
      let val = parseFloat(clean) || 0;
      if (amt.toLowerCase().includes("k")) val *= 1000;
      if (amt.toLowerCase().includes("m")) val *= 1000000;
      return val;
   };

   const formatAmount = (num: number): string => {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
      return `$${num}`;
   };

   // Dynamically calculated KPIs
   const kpis = useMemo(() => {
      let total = 0;
      let weighted = 0;
      let wins = 0;
      let aiCount = 0;
      
      deals.forEach(d => {
         const val = parseAmount(d.amount);
         total += val;
         weighted += val * (d.health / 100);
         if (d.stage === "Closed") wins++;
         if (d.auto) aiCount++;
      });

      const winRate = deals.length ? Math.round((wins / deals.length) * 100) : 0;
      const aiPercent = deals.length ? Math.round((aiCount / deals.length) * 100) : 0;
      const avg = deals.length ? Math.round(total / deals.length) : 0;

      return [
         { label: "TOTAL PIPELINE", value: formatAmount(total), icon: DollarSign, change: "Active Value", color: "text-brand-gold", bg: "bg-brand-gold/10" },
         { label: "WEIGHTED VALUE", value: formatAmount(weighted), icon: LineChart, change: "Prob Adjusted", color: "text-blue-500", bg: "bg-blue-50" },
         { label: "WIN RATE", value: `${winRate}%`, icon: TrendingUp, change: `${wins} Closed Deals`, color: "text-emerald-500", bg: "bg-emerald-50" },
         { label: "AI GENERATED", value: `${aiPercent}%`, icon: Zap, change: `${aiCount} Automated Ops`, color: "text-purple-500", bg: "bg-purple-50" },
         { label: "AVG DEAL", value: formatAmount(avg), icon: PieChart, change: "Per Opportunity", color: "text-[#1a1510]", bg: "bg-[#1a1510]/5" },
      ];
   }, [deals]);

   const filteredDeals = useMemo(() => {
      return deals.filter(d => 
         d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.contact.toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [deals, searchQuery]);

   const pipelineStages = useMemo(() => {
      return STAGE_CONFIGS.map(cfg => {
         const stageDeals = filteredDeals.filter(d => d.stage === cfg.key);
         const sumValue = stageDeals.reduce((sum, d) => sum + parseAmount(d.amount), 0);
         return {
            ...cfg,
            count: stageDeals.length,
            value: formatAmount(sumValue),
            deals: stageDeals
         };
      });
   }, [filteredDeals]);

   return (
      <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                     <BarChart3 size={18} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Pipeline</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                        {selectedClient ? `${selectedClient.name} Deal Sync` : "Real-time GTM deal sync"}
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
               <button 
                  onClick={() => setIsCreateOpen(true)}
                  disabled={!selectedClient}
                  className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2 disabled:opacity-55"
               >
                  <Plus size={14} /> <span className="hidden xs:inline">New Deal</span><span className="xs:hidden">New</span>
               </button>
               <button
                  onClick={() => router.push('/dashboard')}
                  className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto scrollbar-hide pb-32">
            {!selectedClient ? (
               <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Activity size={48} className="text-[#1a1510]/10 mb-4" />
                  <p className="text-sm font-bold text-[#1a1510]/40">Please establish/select a Client from the sidebar first.</p>
               </div>
            ) : loading ? (
               <div className="flex items-center justify-center py-24">
                  <Loader2 className="animate-spin text-brand-gold" size={32} />
               </div>
            ) : (
               <>
                  {/* 2. Metric Ribbon */}
                  <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
                     {kpis.map((kpi, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           className={`bg-white p-4 lg:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-[#1a1510]/5 flex flex-col justify-between h-28 lg:h-32 group transition-all shadow-sm hover:shadow-md ${i > 3 ? 'hidden lg:flex' : 'flex'}`}
                        >
                           <div className="flex justify-between items-start">
                              <span className="text-[8px] lg:text-[9px] font-black text-[#1a1510]/30 tracking-widest uppercase truncate">{kpi.label}</span>
                              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color} shadow-sm shrink-0`}>
                                 <kpi.icon size={12} />
                              </div>
                           </div>

                           <div className="mt-1 lg:mt-2">
                              <h3 className="text-lg lg:text-2xl font-black text-[#1a1510] tracking-tighter leading-none">{kpi.value}</h3>
                              <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-wider text-emerald-500 mt-1 truncate">
                                 {kpi.change}
                              </p>
                           </div>
                        </motion.div>
                     ))}
                  </section>

                  {/* 3. Search & Filter Bar */}
                  <section className="flex flex-col sm:flex-row items-center gap-3 w-full bg-white p-2 rounded-[1.5rem] sm:rounded-3xl border border-[#1a1510]/5 shadow-sm">
                     <div className="flex-1 relative group w-full">
                        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Search deals by name or contact..."
                           className="w-full h-10 sm:h-11 pl-12 pr-4 rounded-2xl bg-transparent text-[#1a1510] focus:outline-none transition-all text-xs font-medium"
                        />
                     </div>
                     <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button onClick={fetchDeals} className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
                           <RefreshCw size={14} /> Refresh
                        </button>
                     </div>
                  </section>

                  {/* 4. Strategic Pipeline Board */}
                  <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full pb-32">
                     {pipelineStages.map((stage, i) => (
                        <div key={stage.key} className="flex flex-col gap-4">
                           {/* Lane Header */}
                           <div className="space-y-3 px-1">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <h4 className="text-[10px] font-black text-[#1a1510] tracking-widest uppercase">{stage.title}</h4>
                                    <span className="px-1.5 py-0.5 rounded bg-[#1a1510]/5 text-[8px] font-black text-[#1a1510]/30">{stage.count}</span>
                                 </div>
                                 <span className="text-[10px] font-black text-[#1a1510] tracking-tighter">{stage.value}</span>
                              </div>
                              <div className="h-1 w-full bg-[#1a1510]/5 rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`h-full ${stage.color} opacity-60 rounded-full`}
                                 />
                              </div>
                           </div>

                           {/* Deal Cards */}
                           <div className="space-y-4">
                              {stage.deals.map((deal) => (
                                 <motion.div
                                    key={deal.id}
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-5 rounded-[1.5rem] border border-[#1a1510]/5 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
                                 >
                                    <div className="absolute top-2 right-2 p-1 px-1.5 rounded bg-brand-gold/10 text-brand-gold text-[7px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                       {deal.health}% Prob
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                       <div className="w-8 h-8 rounded-xl bg-[#1a1510] text-brand-gold flex items-center justify-center font-black text-[12px] shrink-0">
                                          {deal.avatar || "D"}
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <h5 className="text-[12px] font-black text-[#1a1510] truncate">{deal.name}</h5>
                                          <div className="flex items-center gap-1.5">
                                             <span className="text-[8px] font-bold text-[#1a1510]/20 uppercase truncate">{deal.contact}</span>
                                             {deal.auto && <Zap size={8} className="text-brand-gold fill-brand-gold" />}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Action stage change menu */}
                                    <div className="mb-3">
                                       <select
                                          value={deal.stage}
                                          onChange={(e) => handleUpdateStage(deal.id, e.target.value)}
                                          className="w-full text-[9px] font-black uppercase tracking-wider bg-[#f7f8f9] border-none rounded-lg p-1.5 text-[#1a1510]/50 focus:text-[#1a1510] outline-none font-bold"
                                       >
                                          {STAGE_CONFIGS.map(sc => (
                                             <option key={sc.key} value={sc.key}>{sc.title}</option>
                                          ))}
                                       </select>
                                    </div>

                                    <div className="flex items-end justify-between pt-3 border-t border-[#1a1510]/5">
                                       <div>
                                          <p className="text-[7px] font-black text-[#1a1510]/20 uppercase tracking-widest">Value</p>
                                          <p className="text-lg font-black text-[#1a1510] tracking-tighter leading-none">{deal.amount}</p>
                                       </div>
                                       <div className="text-right">
                                          <div className="flex items-center gap-1 justify-end">
                                             <div className={`w-1 h-1 rounded-full ${deal.health > 80 ? 'bg-emerald-500' : 'bg-brand-gold'}`} />
                                             <span className="text-[10px] font-black text-[#1a1510]">{deal.health}%</span>
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                              ))}

                              <button 
                                 onClick={() => {
                                    setNewStage(stage.key);
                                    setIsCreateOpen(true);
                                 }}
                                 className="w-full h-12 border-2 border-dashed border-[#1a1510]/5 rounded-2xl bg-white/40 text-[8px] font-black uppercase tracking-widest text-[#1a1510]/10 hover:border-brand-gold/30 hover:text-brand-gold transition-all flex items-center justify-center gap-2 group"
                              >
                                 <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add
                              </button>
                           </div>
                        </div>
                     ))}
                  </section>
               </>
            )}
         </main>

         {/* Create Deal Modal */}
         <AnimatePresence>
            {isCreateOpen && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[500px] h-fit bg-white rounded-[2rem] shadow-2xl z-[201] p-6 sm:p-8">
                     <form onSubmit={handleCreateDeal} className="space-y-6">
                        <div className="flex justify-between items-center">
                           <h2 className="text-xl font-black text-[#1a1510]">Add Deal Opportunity</h2>
                           <button type="button" onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-[#f7f8f9] rounded-xl"><X size={18} /></button>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Opportunity / Deal Name</label>
                              <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. GrowthCo Expansion" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Primary Contact Name</label>
                              <input required type="text" value={newContact} onChange={(e) => setNewContact(e.target.value)} placeholder="e.g. Alex Kim" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Deal Amount</label>
                                 <input required type="text" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. $18.5K" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Pipeline Stage</label>
                                 <select value={newStage} onChange={(e) => setNewStage(e.target.value)} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold">
                                    {STAGE_CONFIGS.map(sc => (
                                       <option key={sc.key} value={sc.key}>{sc.title}</option>
                                    ))}
                                 </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Win Probability (%)</label>
                                 <input type="number" min="0" max="100" value={newHealth} onChange={(e) => setNewHealth(parseInt(e.target.value, 10))} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-2 flex flex-col justify-end pb-3">
                                 <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1a1510]">
                                    <input type="checkbox" checked={newAuto} onChange={(e) => setNewAuto(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold w-4 h-4" />
                                    AI Autonomous Sync
                                 </label>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#1a1510]/5">
                           <button type="button" onClick={() => setIsCreateOpen(false)} className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase">Cancel</button>
                           <button type="submit" disabled={creating} className="flex-1 h-12 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2">
                              {creating ? <Loader2 className="animate-spin" size={14} /> : "Save Deal"}
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
