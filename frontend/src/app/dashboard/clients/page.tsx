"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Users, Plus, Search, Building2, ChevronRight, MoreVertical,
   Trash2, Edit3, CheckCircle2, Shield, Bot, LayoutDashboard,
   Box, Terminal, Activity, Sparkles, Filter, Link2, Check, ChevronLeft, ArrowRight,
   Mail, Phone, Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";

export default function ClientsPage() {
   const router = useRouter();
   const { clients, createClient, selectedClient, setSelectedClient } = useClient();
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [step, setStep] = useState(1);
   const [formData, setFormData] = useState({
      name: "",
      region: "",
      account_owner: "",
      industry: "",
      status: "Active",
      website: "",
      priority: "Medium",
      description: "",
      icp_summary: "",
      strategy_notes: "",
      channels: ["Email"] as string[],
      connected_tools: [] as string[],
      approval_mode: "Approval required",
      max_daily_sends: 150,
      require_crm_approval: true
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

   const filteredClients = clients.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.icp_summary?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const resetForm = () => {
      setFormData({
         name: "",
         region: "",
         account_owner: "",
         industry: "",
         status: "Active",
         website: "",
         priority: "Medium",
         description: "",
         icp_summary: "",
         strategy_notes: "",
         channels: ["Email"],
         connected_tools: [],
         approval_mode: "Approval required",
         max_daily_sends: 150,
         require_crm_approval: true
      });
      setStep(1);
   };

   const handleCreateClient = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setIsSubmitting(true);
      try {
         await createClient(formData);
         setIsCreateModalOpen(false);
         resetForm();
      } catch (err) {
         console.error("Create client error", err);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                  <Users size={17} />
               </div>
               <div>
                  <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Clients</h2>
                  <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Manage your operational projects</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group hidden sm:block">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     placeholder="Search clients…"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="h-10 w-64 pl-11 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
                  />
               </div>

               <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-shine h-10 px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
               >
                  <Plus size={15} /> New Client
               </button>
            </div>
         </nav>

         {/* Scrollable Content */}
         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide pb-32">

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-[#1a1510]/[0.07] shadow-[0_1px_2px_rgba(26,21,16,0.04)] flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f7f8f9] text-[#1a1510]/40 rounded-xl flex items-center justify-center">
                     <Users size={22} />
                  </div>
                  <div>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wider leading-none mb-2">Total Clients</p>
                     <h3 className="text-3xl font-bold text-[#1a1510] leading-none tabular-nums">{clients.length}</h3>
                  </div>
               </div>
            </div>

            {/* Clients List */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[13px] font-semibold text-[#1a1510] tracking-tight">Active Client Registry</h3>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#1a1510]/40">
                     <Filter size={13} /> Filtered: {filteredClients.length}
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredClients.map((client, idx) => (
                     <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-white rounded-2xl border p-5 flex flex-col justify-between group transition-all relative overflow-hidden h-[200px] shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] ${selectedClient?.id === client.id
                           ? "border-brand-gold/40"
                           : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                           }`}
                     >
                        <div>
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedClient?.id === client.id
                                    ? "bg-brand-gold text-[#1a1510]"
                                    : "bg-[#f7f8f9] text-[#1a1510]/40"
                                    }`}>
                                    <Building2 size={22} />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <h4 className="text-lg font-bold text-[#1a1510] tracking-tight">{client.name}</h4>
                                       {selectedClient?.id === client.id && (
                                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md">Active</span>
                                       )}
                                    </div>
                                    <p className="text-[12px] font-medium text-[#1a1510]/40 line-clamp-1">
                                       {client.description || "No project details yet."}
                                    </p>
                                 </div>
                              </div>
                              <button className="p-2 text-[#1a1510]/20 hover:text-[#1a1510] transition-colors rounded-lg hover:bg-[#f7f8f9]">
                                 <MoreVertical size={18} />
                              </button>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-[#1a1510]/[0.06] mt-auto">
                           <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                 {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#f7f8f9] flex items-center justify-center overflow-hidden">
                                       <div className="w-full h-full bg-[#1a1510]/10" />
                                    </div>
                                 ))}
                              </div>
                              <span className="text-[10px] font-medium text-[#1a1510]/35 uppercase tracking-wider">Authorized Ops</span>
                           </div>

                           {selectedClient?.id === client.id ? (
                              <button
                                 onClick={() => router.push('/dashboard')}
                                 className="btn-shine btn-shine-dark h-10 px-5 rounded-none bg-emerald-50 text-emerald-600 text-[11px] font-semibold flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                              >
                                 Open Hub <Sparkles size={13} />
                              </button>
                           ) : (
                              <button
                                 onClick={() => setSelectedClient(client)}
                                 className="btn-shine h-10 px-5 rounded-none bg-[#1a1510] text-white text-[11px] font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
                              >
                                 Activate
                              </button>
                           )}
                        </div>
                     </motion.div>
                  ))}

                  {/* Empty State */}
                  {filteredClients.length === 0 && (
                     <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-[#1a1510]/15">
                        <div className="w-14 h-14 bg-[#f7f8f9] text-[#1a1510]/25 rounded-xl flex items-center justify-center mb-4">
                           <Search size={26} />
                        </div>
                        <h3 className="text-[15px] font-semibold text-[#1a1510]">No matching clients found</h3>
                        <p className="text-[13px] text-[#1a1510]/40 mt-1">Adjust your search or add a new client.</p>
                     </div>
                  )}
               </div>
            </div>
         </main>

         {/* Create Client Modal */}
         <AnimatePresence>
            {isCreateModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                     className="absolute inset-0 bg-[#1a1510]/40 backdrop-blur-md"
                  />
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0, y: 16 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.95, opacity: 0, y: 16 }}
                     className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#1a1510]/[0.06] overflow-hidden p-5 sm:p-6"
                  >
                     <div className="space-y-4">
                        {/* Header */}
                        <div className="space-y-2.5">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 bg-[#1a1510] rounded-lg text-brand-gold flex items-center justify-center">
                                    <Plus size={18} />
                                 </div>
                                 <h2 className="text-lg font-bold tracking-tight text-[#1a1510]">New Client</h2>
                              </div>
                              <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                           </div>
                           <p className="text-[13px] text-[#1a1510]/45 leading-relaxed">
                              A client is a persistent workspace for tools, campaigns, ownership, and guardrails — not just a CRM record.
                           </p>
                        </div>

                        {/* Stepper */}
                        <div className="grid grid-cols-4 gap-1 p-1 bg-[#f7f8f9] rounded-xl border border-[#1a1510]/[0.07]">
                           {[
                              { id: 1, label: "Identity", icon: Users },
                              { id: 2, label: "ICP & Strategy", icon: Sparkles },
                              { id: 3, label: "Connected Stack", icon: Link2 },
                              { id: 4, label: "Guardrails", icon: Shield }
                           ].map((s) => {
                              const Icon = s.icon;
                              const isCompleted = step > s.id;
                              const isActive = step === s.id;
                              return (
                                 <div
                                    key={s.id}
                                    onClick={() => {
                                       if (isCompleted || s.id < step) {
                                          setStep(s.id);
                                       }
                                    }}
                                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all select-none cursor-pointer ${
                                       isActive
                                          ? "bg-white text-[#1a1510] shadow-sm"
                                          : isCompleted
                                          ? "text-emerald-600"
                                          : "text-[#1a1510]/35 hover:text-[#1a1510]/60"
                                    }`}
                                 >
                                    {isCompleted ? (
                                       <Check size={13} className="text-emerald-500 shrink-0 stroke-[2.5px]" />
                                    ) : (
                                       <Icon size={13} className={`shrink-0 ${isActive ? "text-brand-gold" : "text-[#1a1510]/35"}`} />
                                    )}
                                    <span className="hidden sm:inline">{s.label}</span>
                                 </div>
                              );
                           })}
                        </div>

                        {/* Wizard Content */}
                        <div className="min-h-[200px] py-2">
                           {step === 1 && (
                              <motion.div
                                 initial={{ opacity: 0, x: 10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className="space-y-3"
                              >
                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Account name *</label>
                                       <input
                                          required
                                          type="text"
                                          value={formData.name}
                                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                          placeholder="e.g. Mercedes-Benz"
                                          className="w-full h-10 px-4 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all placeholder:text-[#1a1510]/30"
                                       />
                                    </div>

                                    <div className="space-y-2">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Website</label>
                                       <input
                                          type="text"
                                          value={formData.website}
                                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                          placeholder="mercedes.com"
                                          className="w-full h-10 px-4 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all placeholder:text-[#1a1510]/30"
                                       />
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Region</label>
                                       <div className="relative">
                                          <select
                                             value={formData.region}
                                             onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                             className="w-full h-10 px-4 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all appearance-none"
                                          >
                                             <option value="">Select region...</option>
                                             <option value="North America">North America</option>
                                             <option value="EMEA">EMEA</option>
                                             <option value="APAC">APAC</option>
                                             <option value="South America">South America</option>
                                          </select>
                                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1510]/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                       </div>
                                    </div>

                                    <div className="space-y-2">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Industry</label>
                                       <input
                                          type="text"
                                          value={formData.industry}
                                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                          placeholder="Automotive"
                                          className="w-full h-10 px-4 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all placeholder:text-[#1a1510]/30"
                                       />
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Account owner</label>
                                       <div className="relative">
                                          <select
                                             value={formData.account_owner}
                                             onChange={(e) => setFormData({ ...formData, account_owner: e.target.value })}
                                             className="w-full h-10 px-4 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all appearance-none"
                                          >
                                             <option value="">Assign owner...</option>
                                             <option value="Sarah Mitchell">Sarah Mitchell</option>
                                             <option value="Alex Chen">Alex Chen</option>
                                             <option value="Marcus Johnson">Marcus Johnson</option>
                                          </select>
                                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1510]/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                       </div>
                                    </div>

                                    <div className="space-y-2">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Priority</label>
                                       <div className="relative">
                                          <select
                                             value={formData.priority}
                                             onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                             className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all appearance-none"
                                          >
                                             <option value="High">High</option>
                                             <option value="Medium">Medium</option>
                                             <option value="Low">Low</option>
                                          </select>
                                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${formData.priority === 'High' ? 'bg-red-500' : formData.priority === 'Medium' ? 'bg-[#ffcc00]' : 'bg-emerald-500'}`} />
                                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1510]/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                       </div>
                                    </div>
                                 </div>
                              </motion.div>
                           )}

                           {step === 2 && (
                              <motion.div
                                 initial={{ opacity: 0, x: 10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className="space-y-5"
                              >
                                 <div className="space-y-2">
                                    <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">ICP / segment summary *</label>
                                    <textarea
                                       required
                                       value={formData.icp_summary}
                                       onChange={(e) => setFormData({ ...formData, icp_summary: e.target.value })}
                                       placeholder="Fleet managers and procurement leaders at automotive suppliers in DACH with 500+ employees."
                                       rows={3}
                                       className="w-full p-4 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/20 resize-none"
                                    />
                                    <p className="text-[9px] font-semibold text-[#1a1510]/30 uppercase tracking-wider px-1">
                                       Used by AI to draft messaging and shape audience filters.
                                    </p>
                                 </div>

                                 <div className="space-y-2">
                                    <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Account strategy / brand notes</label>
                                    <textarea
                                       value={formData.strategy_notes}
                                       onChange={(e) => setFormData({ ...formData, strategy_notes: e.target.value })}
                                       placeholder="Position as innovation partner. Lead with TCO and lifecycle. Avoid pricing in cold email."
                                       rows={3}
                                       className="w-full p-4 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/20 resize-none"
                                    />
                                 </div>
                              </motion.div>
                           )}

                           {step === 3 && (
                              <motion.div
                                 initial={{ opacity: 0, x: 10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className="space-y-5"
                              >
                                 <div className="space-y-3">
                                    <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Default channels</label>
                                    <div className="flex gap-2.5">
                                       {["Email", "LinkedIn", "Calls"].map((channel) => {
                                          const isSelected = formData.channels.includes(channel);
                                          return (
                                             <button
                                                key={channel}
                                                type="button"
                                                onClick={() => {
                                                   setFormData(prev => {
                                                      const exists = prev.channels.includes(channel);
                                                      const updated = exists
                                                         ? prev.channels.filter(c => c !== channel)
                                                         : [...prev.channels, channel];
                                                      return { ...prev, channels: updated };
                                                   });
                                                }}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                                   isSelected
                                                      ? "bg-[#1a1510] text-white border-transparent"
                                                      : "bg-[#f7f8f9] border-[#1a1510]/5 text-[#1a1510]/60 hover:border-[#1a1510]/15"
                                                }`}
                                             >
                                                {isSelected && <Check size={12} className="stroke-[3px]" />}
                                                {channel}
                                             </button>
                                          );
                                       })}
                                    </div>
                                 </div>

                                 <div className="space-y-3">
                                    <div>
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Connected tools</label>
                                       <p className="text-[10px] font-semibold text-[#1a1510]/30 uppercase tracking-widest px-1 mt-0.5">
                                          Pick which apps power this account. You can change this later.
                                       </p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[190px] overflow-y-auto pr-1">
                                       {[
                                          { id: "Apollo", name: "Apollo", category: "Prospecting" },
                                          { id: "Clay", name: "Clay", category: "Enrichment" },
                                          { id: "Smartlead", name: "Smartlead", category: "Email" },
                                          { id: "HeyReach", name: "HeyReach", category: "LinkedIn" },
                                          { id: "Gmail", name: "Gmail", category: "Email" },
                                          { id: "Outlook", name: "Outlook", category: "Email" },
                                          { id: "HubSpot", name: "HubSpot", category: "CRM" },
                                          { id: "Salesforce", name: "Salesforce", category: "CRM" },
                                          { id: "Calendly", name: "Calendly", category: "Scheduling" }
                                       ].map((tool) => {
                                          const isSelected = formData.connected_tools.includes(tool.id);
                                          return (
                                             <div
                                                key={tool.id}
                                                onClick={() => {
                                                   setFormData(prev => {
                                                      const exists = prev.connected_tools.includes(tool.id);
                                                      const updated = exists
                                                         ? prev.connected_tools.filter(t => t !== tool.id)
                                                         : [...prev.connected_tools, tool.id];
                                                      return { ...prev, connected_tools: updated };
                                                   });
                                                }}
                                                className={`cursor-pointer p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between select-none ${
                                                   isSelected
                                                      ? "bg-brand-gold/5 border-brand-gold/50 shadow-sm"
                                                      : "bg-[#f7f8f9] border-[#1a1510]/5 hover:border-[#1a1510]/15"
                                                }`}
                                             >
                                                <div className="flex items-center justify-between mb-2">
                                                   <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                                      isSelected ? "bg-[#1a1510] border-transparent text-white" : "border-[#1a1510]/20 bg-white"
                                                   }`}>
                                                      {isSelected && <Check size={10} className="stroke-[3.5px]" />}
                                                   </div>
                                                </div>
                                                <div>
                                                   <h5 className="text-[11px] font-bold text-[#1a1510] leading-none mb-0.5">{tool.name}</h5>
                                                   <p className="text-[8px] text-[#1a1510]/40 font-bold uppercase tracking-wider">{tool.category}</p>
                                                </div>
                                             </div>
                                          );
                                       })}
                                    </div>
                                 </div>
                              </motion.div>
                           )}

                           {step === 4 && (
                              <motion.div
                                 initial={{ opacity: 0, x: 10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className="space-y-4"
                              >
                                 <div className="space-y-2">
                                    <div>
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Approval mode</label>
                                       <p className="text-[10px] font-semibold text-[#1a1510]/30 uppercase tracking-widest px-1 mt-0.5">
                                          How much autonomy does Qhord have for this account?
                                       </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                       {[
                                          { id: "Suggest only", title: "Suggest only", desc: "Qhord only suggests fixes. You execute everything." },
                                          { id: "Approval required", title: "Approval required", desc: "Qhord proposes actions. You approve before execution." },
                                          { id: "Auto with guardrails", title: "Auto with guardrails", desc: "Qhord acts automatically within deliverability + volume guardrails." },
                                          { id: "Fully autonomous", title: "Fully autonomous", desc: "Qhord runs the account end-to-end with full audit trail." }
                                       ].map((mode) => {
                                          const isSelected = formData.approval_mode === mode.id;
                                          return (
                                             <div
                                                key={mode.id}
                                                onClick={() => setFormData({ ...formData, approval_mode: mode.id })}
                                                className={`cursor-pointer p-3 rounded-xl border flex items-start gap-2.5 transition-all select-none ${
                                                   isSelected
                                                      ? "bg-brand-gold/5 border-brand-gold/50 shadow-sm"
                                                      : "bg-[#f7f8f9] border-[#1a1510]/5 hover:border-[#1a1510]/15"
                                                }`}
                                             >
                                                <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                                   isSelected ? "border-[#1a1510] bg-[#1a1510] text-white" : "border-[#1a1510]/20 bg-white"
                                                }`}>
                                                   {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <div>
                                                   <h5 className="text-[10px] font-bold text-[#1a1510] leading-none mb-1">{mode.title}</h5>
                                                   <p className="text-[9px] text-[#1a1510]/40 font-semibold leading-tight">{mode.desc}</p>
                                                </div>
                                             </div>
                                          );
                                       })}
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60 px-0.5">Max daily sends per Inbox</label>
                                       <input
                                          type="number"
                                          value={formData.max_daily_sends}
                                          onChange={(e) => setFormData({ ...formData, max_daily_sends: Number(e.target.value) })}
                                          placeholder="150"
                                          className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all"
                                       />
                                    </div>

                                    <div className="flex flex-col justify-end">
                                       <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/5 h-11">
                                          <div>
                                             <h5 className="text-[10px] font-bold text-[#1a1510] leading-none">Require approval for CRM writes</h5>
                                          </div>
                                          <button
                                             type="button"
                                             onClick={() => setFormData({ ...formData, require_crm_approval: !formData.require_crm_approval })}
                                             className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                formData.require_crm_approval ? 'bg-[#1a1510]' : 'bg-[#1a1510]/15'
                                             }`}
                                          >
                                             <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                   formData.require_crm_approval ? 'translate-x-4' : 'translate-x-0'
                                                }`}
                                             />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </motion.div>
                           )}
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#1a1510]/[0.07]">
                           <div className="text-[12px] font-medium text-[#1a1510]/40">
                              Step {step} of 4
                           </div>

                           <div className="flex gap-2.5">
                              {step > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => setStep(prev => prev - 1)}
                                    className="px-5 h-11 border border-[#1a1510]/10 rounded-none font-semibold text-xs text-[#1a1510]/60 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors flex items-center gap-2"
                                 >
                                    <ChevronLeft size={15} /> Back
                                 </button>
                              )}

                              {step < 4 ? (
                                 <button
                                    type="button"
                                    disabled={step === 1 ? !formData.name : step === 2 ? !formData.icp_summary : false}
                                    onClick={() => setStep(prev => prev + 1)}
                                    className="btn-shine px-6 h-11 bg-[#1a1510] text-white rounded-none font-semibold text-xs hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                 >
                                    Continue <ArrowRight size={15} />
                                 </button>
                              ) : (
                                 <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleCreateClient()}
                                    className="btn-shine px-6 h-11 bg-[#1a1510] text-white rounded-none font-semibold text-xs hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                 >
                                    {isSubmitting ? "Creating…" : "Create Client"} <Check size={15} className="stroke-[2.5px]" />
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
