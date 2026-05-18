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
   const [newClientName, setNewClientName] = useState("");
   const [newClientDesc, setNewClientDesc] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);

   const filteredClients = clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const handleCreateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         await createClient(newClientName, newClientDesc);
         setIsCreateModalOpen(false);
         setNewClientName("");
         setNewClientDesc("");
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
                  <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Clients</h2>
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
                  className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:translate-y-[-1px] transition-all"
               >
                  <Plus size={16} /> New Client
               </button>
            </div>
         </nav>

         {/* Scrollable Content */}
         <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto scrollbar-hide pb-32">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm flex items-center gap-6">
                  <div className="w-14 h-14 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
                     <Users size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-widest leading-none mb-1.5">Total Clients</p>
                     <h3 className="text-2xl font-black text-[#1a1510] leading-none">{clients.length}</h3>
                  </div>
               </div>
               {/* Add more summary cards if needed */}
            </div>

            {/* Clients List */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase text-[#1a1510]/30 tracking-widest">Active Client Registry</h3>
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
                        className={`bg-white rounded-[2.5rem] border p-8 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden h-[240px] ${
                           selectedClient?.id === client.id 
                           ? "border-brand-gold/30 shadow-lg shadow-brand-gold/5" 
                           : "border-[#1a1510]/5"
                        }`}
                     >
                        <div className="space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-5">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                                    selectedClient?.id === client.id 
                                    ? "bg-brand-gold text-[#1a1510] border-transparent" 
                                    : "bg-[#f7f8f9] text-brand-gold border-[#1a1510]/5"
                                 }`}>
                                    <Building2 size={24} />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <h4 className="text-xl font-black text-[#1a1510] tracking-tight">{client.name}</h4>
                                       {selectedClient?.id === client.id && (
                                          <span className="bg-emerald-50 text-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100/50">Active Hub</span>
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
                                 {[1,2,3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#f7f8f9] flex items-center justify-center overflow-hidden grayscale">
                                       <div className="w-full h-full bg-brand-gold/20" />
                                    </div>
                                 ))}
                              </div>
                              <span className="text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest tracking-tighter">Authorized Ops</span>
                           </div>
                           
                           {selectedClient?.id === client.id ? (
                              <button 
                                 onClick={() => router.push('/dashboard')}
                                 className="h-10 px-6 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100/50"
                              >
                                 Open Hub <Sparkles size={12} />
                              </button>
                           ) : (
                              <button 
                                 onClick={() => setSelectedClient(client)}
                                 className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-y-[-1px] transition-all shadow-xl"
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
                        <h3 className="text-base font-black text-[#1a1510] uppercase tracking-widest">No matching nodes found</h3>
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
                     className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden p-8 sm:p-12"
                  >
                     <div className="space-y-10">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-brand-gold rounded-xl text-[#1a1510]">
                                 <Plus size={20} />
                              </div>
                              <h2 className="text-2xl font-black tracking-tight text-[#1a1510] uppercase">Establish New Node</h2>
                           </div>
                           <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">
                              Define your new operational project namespace. All tool protocols will be scoped to this client.
                           </p>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-6">
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest px-1">Client Name</label>
                                 <input 
                                    required
                                    type="text" 
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    placeholder="Acme Strategic Vault" 
                                    className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent text-sm font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/10"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest px-1">Descriptor</label>
                                 <input 
                                    type="text" 
                                    value={newClientDesc}
                                    onChange={(e) => setNewClientDesc(e.target.value)}
                                    placeholder="Short intel description..." 
                                    className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent text-sm font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/10"
                                 />
                              </div>
                           </div>

                           <button 
                              disabled={isSubmitting || !newClientName}
                              className="w-full h-14 bg-[#1a1510] text-brand-gold rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                           >
                              Establish Registry Link
                           </button>
                        </form>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
