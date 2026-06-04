"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, MessageSquare, Calendar, DollarSign, Search, Plus,
  ArrowUpRight, LayoutDashboard, Globe, ChevronRight, Filter, MoreHorizontal,
  ArrowLeft, Target, Trophy, Wrench, ChevronDown, MapPin, Tag, Info, Laptop,
  Cpu, Zap, Mail, Sparkles, X, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";

const TOOLS = [
  { name: "Apollo", icon: Globe, color: "text-blue-500" },
  { name: "Clay", icon: Sparkles, color: "text-brand-gold" },
  { name: "Smartlead", icon: Zap, color: "text-purple-500" },
];

export default function AccountsPage() {
  const router = useRouter();
  const { clients, loading, createClient, refreshClients } = useClient();
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [status, setStatus] = useState("Active");
  const [region, setRegion] = useState("North America");
  const [owner, setOwner] = useState("Sarah M.");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await createClient({
        name,
        industry,
        status,
        region,
        account_owner: owner,
        website,
        priority: "High"
      });
      setIsCreating(false);
      setName("");
      setWebsite("");
    } catch (err) {
      console.error("Failed to create client:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  const kpis = useMemo(() => {
    return [
      { label: "ACCOUNTS", value: clients.length, icon: Globe, change: "+2 this mo" },
      { label: "ACTIVE NODES", value: clients.filter(c => c.status === "Active").length, icon: Cpu, change: "Optimal" },
      { label: "INDUSTRIES", value: new Set(clients.map(c => c.industry).filter(Boolean)).size, icon: Building2, change: "Diversified" },
      { label: "REGIONS", value: new Set(clients.map(c => c.region).filter(Boolean)).size, icon: MapPin, change: "Global" },
      { label: "HIGH PRIORITY", value: clients.filter(c => c.priority === "High").length, icon: Target, change: "Attention" },
    ];
  }, [clients]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      
      {/* 1. Header Navigation */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3 truncate">
          <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
            <Globe size={18} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Accounts / Clients</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
               {clients.length} registered client nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2"
            >
              <Plus size={14} /> <span className="hidden xs:inline">New Account</span>
            </button>
          )}
          <button 
            onClick={() => isCreating ? setIsCreating(false) : router.push('/dashboard')}
            className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all shrink-0"
          >
            {isCreating ? <X size={14} /> : <LayoutDashboard size={14} />} 
            <span className="hidden sm:inline">{isCreating ? "Cancel" : "Back"}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12">
          
          <AnimatePresence mode="wait">
            {!isCreating ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                
                {/* Metrics */}
                <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-4 sm:p-5 rounded-3xl border border-[#1a1510]/5 flex flex-col justify-between h-32 sm:h-36 min-w-[140px] md:min-w-0 flex-1 hover:shadow-md transition-all">
                       <div className="flex justify-between items-start">
                          <span className="text-[7px] sm:text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest truncate">{kpi.label}</span>
                          <div className="p-1.5 rounded-lg bg-brand-gold/10 text-brand-gold shrink-0">
                             <kpi.icon size={14} />
                          </div>
                       </div>
                       <div>
                          <h4 className="text-xl sm:text-2xl font-black truncate">{kpi.value}</h4>
                          <p className="text-[7px] sm:text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1 truncate">{kpi.change}</p>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative group">
                   <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                   <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search account nodes by name or industry..."
                      className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-[#1a1510]/5 text-sm font-medium focus:outline-none transition-all shadow-sm"
                   />
                </div>

                {/* Account Cards */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-brand-gold" size={32} />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-20">
                    <Globe size={48} className="mx-auto text-[#1a1510]/10 mb-4" />
                    <p className="text-sm font-bold text-[#1a1510]/30">No account nodes registered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-32">
                    {filteredClients.map((account) => (
                      <motion.div 
                        key={account.id}
                        whileHover={{ y: -4 }}
                        className="bg-white border border-[#1a1510]/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm group hover:shadow-xl transition-all"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4 truncate">
                             <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center shrink-0 shadow-lg">
                                <Building2 size={24} />
                             </div>
                             <div className="truncate">
                                <h3 className="text-lg font-black truncate">{account.name}</h3>
                                <span className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest truncate">
                                   {account.industry || "General"} • {account.account_owner || "Sarah M."}
                                </span>
                             </div>
                          </div>
                          <div className="text-right shrink-0">
                             <p className="text-xs font-black text-brand-gold uppercase tracking-wider">{account.status || "Active"}</p>
                             <p className="text-[8px] font-black uppercase text-[#1a1510]/10 tracking-widest mt-1">{account.region || "North America"}</p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#1a1510]/5 flex justify-between items-center">
                          <p className="text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">
                             Priority: <span className="text-[#1a1510] font-bold">{account.priority}</span>
                          </p>
                          <button 
                             onClick={() => {
                               localStorage.setItem("selected_client_id", account.id);
                               window.location.href = "/dashboard";
                             }}
                             className="text-[9px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                          >
                             Set Active Client <ChevronRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Plus Card */}
                    <button 
                      onClick={() => setIsCreating(true)}
                      className="border-2 border-dashed border-[#1a1510]/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group hover:border-brand-gold/40 transition-all bg-white/40 min-h-[200px]"
                    >
                      <div className="w-14 h-14 bg-[#1a1510] rounded-2xl flex items-center justify-center text-brand-gold mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={28} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-[#1a1510]/20 group-hover:text-[#1a1510]/40 transition-colors">Setup New Client Node</span>
                    </button>
                  </div>
                )}

              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => setIsCreating(false)} className="p-2 rounded-xl hover:bg-[#f7f8f9] transition-colors"><ArrowLeft size={20} /></button>
                  <h3 className="text-xl font-black uppercase tracking-tight">New Account Node</h3>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
                   <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-sm">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Account / Client Name *</label>
                            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nike Enterprise" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent focus:bg-white focus:outline-none transition-all text-xs font-bold" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Industry / Segment</label>
                               <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent outline-none appearance-none cursor-pointer text-xs font-bold">
                                 <option value="Technology">Technology</option>
                                 <option value="SaaS">SaaS</option>
                                 <option value="Fintech">Fintech</option>
                                 <option value="Healthcare">Healthcare</option>
                                 <option value="Retail">Retail</option>
                                 <option value="Agency">Agency</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Region</label>
                               <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent outline-none appearance-none cursor-pointer text-xs font-bold">
                                 <option value="North America">North America</option>
                                 <option value="EMEA">EMEA</option>
                                 <option value="APAC">APAC</option>
                                 <option value="LATAM">LATAM</option>
                               </select>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Account Owner</label>
                               <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent focus:bg-white focus:outline-none transition-all text-xs font-bold" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Website URL</label>
                               <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. nike.com" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent focus:bg-white focus:outline-none transition-all text-xs font-bold" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20">Inherited Tools Config</h4>
                      <div className="grid grid-cols-2 gap-3">
                         {TOOLS.map((tool, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f7f8f9] border border-transparent">
                               <div className="flex items-center gap-3">
                                  <tool.icon size={14} className={tool.color} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{tool.name}</span>
                               </div>
                               <div className="w-8 h-4 bg-emerald-500 rounded-full flex items-center justify-end px-1"><div className="w-2.5 h-2.5 bg-white rounded-full" /></div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="lg:col-span-2 flex justify-end gap-3 pt-6">
                      <button type="button" onClick={() => setIsCreating(false)} className="px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40">Cancel</button>
                      <button type="submit" disabled={saving} className="px-10 h-12 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                         {saving ? <Loader2 className="animate-spin" size={14} /> : "Save Account Node"}
                      </button>
                   </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </main>
    </div>
  );
}
