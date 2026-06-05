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
import { Loader } from "../../../components/ui/Loader";
import { DealsIcon } from "../../../components/ui/icons/DealsIcon";

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
         <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                     <DealsIcon size={16} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Deals</h2>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">
                        {selectedClient ? `${selectedClient.name} · deal sync` : "Real-time deal sync"}
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2.5">
               <button
                  onClick={() => setIsCreateOpen(true)}
                  disabled={!selectedClient}
                  className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors disabled:opacity-50"
               >
                  <Plus size={15} /> <span className="hidden xs:inline">New Deal</span><span className="xs:hidden">New</span>
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
            {!selectedClient ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
                  <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-4"><Activity size={26} /></div>
                  <p className="text-[15px] font-semibold text-[#1a1510]">Select a client first</p>
                  <p className="text-[13px] text-[#1a1510]/40 mt-1">Choose a client from the sidebar to view their pipeline.</p>
               </div>
            ) : loading ? (
               <div className="flex items-center justify-center py-24">
                  <Loader size={36} />
               </div>
            ) : (
               <>
                  {/* 2. Metric Ribbon */}
                  <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                     {kpis.map((kpi, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0, y: 12 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           className={`group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200 ${i > 3 ? 'hidden lg:block' : ''}`}
                        >
                           <div className="mb-5">
                              <span className="text-[10px] font-semibold text-[#1a1510]/40 tracking-wider uppercase leading-tight">{kpi.label}</span>
                           </div>
                           <h3 className="text-[2.25rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{kpi.value}</h3>
                           <div className="mt-4 pt-3 border-t border-[#1a1510]/[0.06]">
                              <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">{kpi.change}</p>
                           </div>
                        </motion.div>
                     ))}
                  </section>

                  {/* 3. Search & Filter Bar */}
                  <section className="flex flex-col sm:flex-row items-center gap-2.5 w-full bg-white p-3 rounded-2xl border border-[#1a1510]/[0.07]">
                     <div className="flex-1 relative group w-full">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Search deals by name or contact…"
                           className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] text-[#1a1510] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
                        />
                     </div>
                     <button onClick={fetchDeals} className="btn-shine w-full sm:w-auto h-10 px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold transition-colors hover:bg-[#2a2118] flex items-center justify-center gap-2 shrink-0">
                        <RefreshCw size={14} /> Refresh
                     </button>
                  </section>

                  {/* 4. Pipeline Board */}
                  <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 w-full pb-32">
                     {pipelineStages.map((stage, i) => (
                        <div key={stage.key} className="flex flex-col gap-3">
                           {/* Lane Header */}
                           <div className="space-y-2.5 px-1">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <h4 className="text-[11px] font-semibold text-[#1a1510] tracking-wider uppercase">{stage.title}</h4>
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#1a1510]/5 text-[10px] font-medium text-[#1a1510]/40">{stage.count}</span>
                                 </div>
                                 <span className="text-[12px] font-semibold text-[#1a1510] tabular-nums">{stage.value}</span>
                              </div>
                              <div className="h-1 w-full bg-[#1a1510]/[0.06] rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`h-full ${stage.color} opacity-70 rounded-full`}
                                 />
                              </div>
                           </div>

                           {/* Deal Cards */}
                           <div className="space-y-3">
                              {stage.deals.map((deal) => (
                                 <motion.div
                                    key={deal.id}
                                    whileHover={{ y: -2 }}
                                    className="bg-white p-4 rounded-xl border border-[#1a1510]/[0.07] shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] transition-all relative group"
                                 >
                                    <div className="flex items-center gap-3 mb-3.5">
                                       <div className="w-9 h-9 rounded-lg bg-[#1a1510] text-brand-gold flex items-center justify-center font-semibold text-[12px] shrink-0">
                                          {deal.avatar || "D"}
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <h5 className="text-[13px] font-semibold text-[#1a1510] truncate">{deal.name}</h5>
                                          <div className="flex items-center gap-1.5">
                                             <span className="text-[11px] font-medium text-[#1a1510]/40 truncate">{deal.contact}</span>
                                             {deal.auto && <Zap size={10} className="text-brand-gold fill-brand-gold shrink-0" />}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Action stage change menu */}
                                    <select
                                       value={deal.stage}
                                       onChange={(e) => handleUpdateStage(deal.id, e.target.value)}
                                       className="w-full text-[11px] font-medium bg-[#f7f8f9] border border-[#1a1510]/[0.06] rounded-lg px-2.5 py-1.5 text-[#1a1510]/60 focus:text-[#1a1510] outline-none mb-3 cursor-pointer"
                                    >
                                       {STAGE_CONFIGS.map(sc => (
                                          <option key={sc.key} value={sc.key}>{sc.title}</option>
                                       ))}
                                    </select>

                                    <div className="flex items-end justify-between pt-3 border-t border-[#1a1510]/[0.06]">
                                       <div>
                                          <p className="text-[10px] font-medium text-[#1a1510]/35 uppercase tracking-wider">Value</p>
                                          <p className="text-lg font-bold text-[#1a1510] tracking-tight tabular-nums leading-none mt-0.5">{deal.amount}</p>
                                       </div>
                                       <div className="flex items-center gap-1.5">
                                          <div className={`w-1.5 h-1.5 rounded-full ${deal.health > 80 ? 'bg-emerald-500' : 'bg-brand-gold'}`} />
                                          <span className="text-[12px] font-semibold text-[#1a1510] tabular-nums">{deal.health}%</span>
                                       </div>
                                    </div>
                                 </motion.div>
                              ))}

                              <button
                                 onClick={() => {
                                    setNewStage(stage.key);
                                    setIsCreateOpen(true);
                                 }}
                                 className="w-full h-11 border border-dashed border-[#1a1510]/12 rounded-xl text-[11px] font-medium uppercase tracking-wider text-[#1a1510]/30 hover:border-brand-gold/40 hover:text-brand-gold hover:bg-white transition-all flex items-center justify-center gap-2 group"
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-[#1a1510]/40 backdrop-blur-sm z-[200]" />
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[480px] h-fit bg-white rounded-2xl shadow-2xl border border-[#1a1510]/[0.06] z-[201] p-6 sm:p-7">
                     <form onSubmit={handleCreateDeal} className="space-y-5">
                        <div className="flex justify-between items-center">
                           <h2 className="text-lg font-bold text-[#1a1510]">Add Deal</h2>
                           <button type="button" onClick={() => setIsCreateOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"><X size={18} /></button>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-1.5">
                              <label className="text-[12px] font-semibold text-[#1a1510]/60">Deal name</label>
                              <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. GrowthCo Expansion" className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 text-[13px] transition-all placeholder:text-[#1a1510]/30" />
                           </div>

                           <div className="space-y-1.5">
                              <label className="text-[12px] font-semibold text-[#1a1510]/60">Primary contact</label>
                              <input required type="text" value={newContact} onChange={(e) => setNewContact(e.target.value)} placeholder="e.g. Alex Kim" className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 text-[13px] transition-all placeholder:text-[#1a1510]/30" />
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-semibold text-[#1a1510]/60">Amount</label>
                                 <input required type="text" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. $18.5K" className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 text-[13px] transition-all placeholder:text-[#1a1510]/30" />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-semibold text-[#1a1510]/60">Stage</label>
                                 <select value={newStage} onChange={(e) => setNewStage(e.target.value)} className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none text-[13px] cursor-pointer">
                                    {STAGE_CONFIGS.map(sc => (
                                       <option key={sc.key} value={sc.key}>{sc.title}</option>
                                    ))}
                                 </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3 items-end">
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-semibold text-[#1a1510]/60">Win probability (%)</label>
                                 <input type="number" min="0" max="100" value={newHealth} onChange={(e) => setNewHealth(parseInt(e.target.value, 10))} className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 text-[13px] transition-all" />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#1a1510] h-11">
                                 <input type="checkbox" checked={newAuto} onChange={(e) => setNewAuto(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold w-4 h-4" />
                                 AI autonomous sync
                              </label>
                           </div>
                        </div>

                        <div className="flex gap-2.5 pt-4 border-t border-[#1a1510]/[0.07]">
                           <button type="button" onClick={() => setIsCreateOpen(false)} className="h-11 px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">Cancel</button>
                           <button type="submit" disabled={creating} className="btn-shine flex-1 h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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
