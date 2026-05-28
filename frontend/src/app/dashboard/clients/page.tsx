"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Users, Plus, Search, Building2, ChevronRight, MoreVertical,
   Trash2, Edit3, CheckCircle2, Shield, Bot, LayoutDashboard,
   Box, Terminal, Activity, Sparkles, Filter, Link2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";

export default function ClientsPage() {
   const router = useRouter();
   const { clients, createClient, selectedClient, setSelectedClient } = useClient();
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [formData, setFormData] = useState({
      name: "",
      region: "",
      account_owner: "",
      industry: "",
      status: "Active",
      website: "",
      priority: "Medium",
      description: ""
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

   const filteredClients = clients.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const handleCreateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         await createClient(formData);
         setIsCreateModalOpen(false);
         setFormData({
            name: "",
            region: "",
            account_owner: "",
            industry: "",
            status: "Active",
            website: "",
            priority: "Medium",
            description: ""
         });
      } catch (err) {
         console.error("Create client error", err);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                  <Users size={18} />
               </div>
               <div>
                  <h2 className="text-sm font-bold tracking-tight text-[#1a1510] uppercase truncate">Clients</h2>
                  <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                     Manage your operational projects
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="relative group hidden sm:block">
                  <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     placeholder="Search clients..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="h-10 w-72 pl-14 pr-6 rounded-[1.5rem] bg-[#f7f8f9] border border-[#1a1510]/5 text-xs font-medium focus:outline-none transition-all shadow-inner placeholder:text-[#1a1510]/20"
                  />
               </div>

               <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl hover:translate-y-[-1px] transition-all"
               >
                  <Plus size={16} /> New Client
               </button>
            </div>
         </nav>

         {/* Scrollable Content */}
         <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto scrollbar-hide pb-32">

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-5 rounded-[2rem] border border-[#1a1510]/5 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
                     <Users size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest leading-none mb-1.5">Total Clients</p>
                     <h3 className="text-2xl font-bold text-[#1a1510] leading-none">{clients.length}</h3>
                  </div>
               </div>
               {/* Add more summary cards if needed */}
            </div>

            {/* Clients List */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase text-[#1a1510]/30 tracking-widest">Active Client Registry</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#1a1510]/40">
                     <Filter size={12} /> Filtered: {filteredClients.length}
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredClients.map((client, idx) => (
                     <motion.div
                        key={client.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-white rounded-[2rem] border p-6 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden h-[210px] ${selectedClient?.id === client.id
                           ? "border-brand-gold/30 shadow-lg shadow-brand-gold/5"
                           : "border-[#1a1510]/5"
                           }`}
                     >
                        <div className="space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-5">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${selectedClient?.id === client.id
                                    ? "bg-brand-gold text-[#1a1510] border-transparent"
                                    : "bg-[#f7f8f9] text-brand-gold border-[#1a1510]/5"
                                    }`}>
                                    <Building2 size={24} />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <h4 className="text-xl font-bold text-[#1a1510] tracking-tight">{client.name}</h4>
                                       {selectedClient?.id === client.id && (
                                          <span className="bg-emerald-50 text-emerald-500 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-100/50">Active Hub</span>
                                       )}
                                    </div>
                                    <p className="text-[11px] font-medium text-[#1a1510]/30 line-clamp-1 italic">
                                       {client.description || "No project coordinates established yet."}
                                    </p>
                                 </div>
                              </div>
                              <button className="p-2 text-[#1a1510]/10 hover:text-[#1a1510] transition-colors rounded-lg hover:bg-[#f7f8f9]">
                                 <MoreVertical size={18} />
                              </button>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-[#1a1510]/5 mt-auto">
                           <div className="flex items-center gap-4">
                              <div className="flex -space-x-2">
                                 {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#f7f8f9] flex items-center justify-center overflow-hidden grayscale">
                                       <div className="w-full h-full bg-brand-gold/20" />
                                    </div>
                                 ))}
                              </div>
                              <span className="text-[9px] font-bold text-[#1a1510]/20 uppercase tracking-widest tracking-tighter">Authorized Ops</span>
                           </div>

                           {selectedClient?.id === client.id ? (
                              <button
                                 onClick={() => router.push('/dashboard')}
                                 className="h-10 px-6 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100/50"
                              >
                                 Open Hub <Sparkles size={12} />
                              </button>
                           ) : (
                              <button
                                 onClick={() => setSelectedClient(client)}
                                 className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-y-[-1px] transition-all shadow-xl"
                              >
                                 Activate Node
                              </button>
                           )}
                        </div>
                     </motion.div>
                  ))}

                  {/* Add Placeholder for Empty State */}
                  {filteredClients.length === 0 && (
                     <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-[#1a1510]/5">
                        <div className="w-16 h-16 bg-[#f7f8f9] text-[#1a1510]/10 rounded-full flex items-center justify-center mb-6">
                           <Search size={32} />
                        </div>
                        <h3 className="text-base font-bold text-[#1a1510] uppercase tracking-widest">No matching nodes found</h3>
                        <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-[0.2em] mt-2">Adjust intel search or establish new connection</p>
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
                     onClick={() => setIsCreateModalOpen(false)}
                     className="absolute inset-0 bg-[#1a1510]/40 backdrop-blur-md"
                  />
                  <motion.div
                     initial={{ scale: 0.9, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 20 }}
                     className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-white overflow-hidden p-6 sm:p-10"
                  >
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-brand-gold rounded-xl text-[#1a1510]">
                                    <Plus size={18} />
                                 </div>
                                 <h2 className="text-xl font-bold tracking-tight text-[#1a1510] uppercase">Establish New Client</h2>
                              </div>
                              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#1a1510]/30 hover:text-[#1a1510] transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                           </div>
                           <p className="text-[10px] font-semibold text-[#1a1510]/30 uppercase tracking-widest leading-relaxed">
                              Define your new operational project namespace. All tool protocols will be scoped to this client.
                           </p>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-6">
                           <div className="space-y-5">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Client Name</label>
                                 <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter Name"
                                    className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/20"
                                 />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Region</label>
                                    <div className="relative">
                                       <select
                                          value={formData.region}
                                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                          className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all appearance-none"
                                       >
                                          <option value="">Select...</option>
                                          <option value="NAMER">NAMER</option>
                                          <option value="EMEA">EMEA</option>
                                          <option value="APAC">APAC</option>
                                       </select>
                                       <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1510]/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Account Owner</label>
                                    <div className="relative">
                                       <select
                                          value={formData.account_owner}
                                          onChange={(e) => setFormData({ ...formData, account_owner: e.target.value })}
                                          className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all appearance-none"
                                       >
                                          <option value="">Select...</option>
                                          <option value="Sarah Mitchell">Sarah Mitchell</option>
                                          <option value="Alex Chen">Alex Chen</option>
                                          <option value="Marcus Johnson">Marcus Johnson</option>
                                       </select>
                                       <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1510]/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Industry</label>
                                    <input
                                       type="text"
                                       value={formData.industry}
                                       onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                       placeholder="e.g. Automotive"
                                       className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/20"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Status</label>
                                    <div className="relative">
                                       <select
                                          value={formData.status}
                                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                          className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all appearance-none"
                                       >
                                          <option value="Active">Active</option>
                                          <option value="Inactive">Inactive</option>
                                       </select>
                                       <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1510]/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Website</label>
                                    <input
                                       type="url"
                                       value={formData.website}
                                       onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                       placeholder="https://..."
                                       className="w-full h-11 px-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/20"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Priority</label>
                                    <div className="relative">
                                       <select
                                          value={formData.priority}
                                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                          className="w-full h-11 pl-10 pr-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all appearance-none"
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

                              <div className="space-y-2 relative">
                                 <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest px-1">Brief Note</label>
                                 <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What is this account about?"
                                    rows={3}
                                    className="w-full p-5 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/20 resize-none"
                                 />
                                 <div className="absolute bottom-3 right-3 text-[#1a1510]/20 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="2" y1="2" y2="22"/><path d="M10.41 14 13.59 10.83"/><path d="M14.47 8.59 14.5 8.56a2 2 0 0 1 2.83 0l1.41 1.41a2.83 2.83 0 0 1 0 4l-4.24 4.24a2 2 0 0 1-2.83 0"/></svg>
                                 </div>
                              </div>
                           </div>

                           <div className="flex justify-end gap-4 pt-4">
                              <button
                                 type="button"
                                 onClick={() => setIsCreateModalOpen(false)}
                                 className="px-6 h-11 font-bold text-[10px] uppercase tracking-widest text-[#1a1510]/60 hover:text-[#1a1510] hover:bg-[#1a1510]/5 rounded-xl transition-all"
                              >
                                 Cancel
                              </button>
                              <button
                                 type="submit"
                                 disabled={isSubmitting || !formData.name}
                                 className="px-6 h-11 bg-[#1a1510] text-brand-gold rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                              >
                                 Establish Registry Link
                              </button>
                           </div>
                        </form>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
