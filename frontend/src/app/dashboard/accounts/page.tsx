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
import { Loader } from "../../../components/ui/Loader";
import { AccountNodesIcon } from "../../../components/ui/icons/AccountNodesIcon";

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
      <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-3 truncate">
          <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
            <AccountNodesIcon size={16} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase truncate">Accounts</h2>
            <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">
               {clients.length} registered client{clients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
            >
              <Plus size={15} /> <span className="hidden xs:inline">New Account</span>
            </button>
          )}
          <button
            onClick={() => isCreating ? setIsCreating(false) : router.push('/dashboard')}
            className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors shrink-0"
          >
            {isCreating ? <X size={15} /> : <LayoutDashboard size={15} />}
            <span className="hidden sm:inline">{isCreating ? "Cancel" : "Back"}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

          <AnimatePresence mode="wait">
            {!isCreating ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200">
                       <span className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider truncate">{kpi.label}</span>
                       <h4 className="text-[2rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none mt-4">{kpi.value}</h4>
                       <p className="text-[11px] font-medium text-[#1a1510]/40 mt-2 truncate">{kpi.change}</p>
                    </div>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative group">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                   <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search accounts by name or industry…"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
                   />
                </div>

                {/* Account Cards */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader size={36} />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-20">
                    <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-4"><Globe size={26} /></div>
                    <p className="text-[15px] font-semibold text-[#1a1510]">No accounts yet</p>
                    <p className="text-[13px] text-[#1a1510]/40 mt-1">Create your first client account to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-32">
                    {filteredClients.map((account) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 group shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:border-[#1a1510]/15 transition-all"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 truncate">
                             <div className="w-12 h-12 rounded-xl bg-[#1a1510] text-brand-gold flex items-center justify-center shrink-0">
                                <Building2 size={22} />
                             </div>
                             <div className="truncate">
                                <h3 className="text-[17px] font-bold text-[#1a1510] tracking-tight truncate">{account.name}</h3>
                                <span className="text-[12px] font-medium text-[#1a1510]/40 truncate">
                                   {account.industry || "General"} · {account.account_owner || "Sarah M."}
                                </span>
                             </div>
                          </div>
                          <div className="text-right shrink-0">
                             <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {account.status || "Active"}
                             </span>
                             <p className="text-[11px] font-medium text-[#1a1510]/35 mt-1">{account.region || "North America"}</p>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#1a1510]/[0.06] flex justify-between items-center">
                          <p className="text-[12px] font-medium text-[#1a1510]/40">
                             Priority: <span className="text-[#1a1510] font-semibold">{account.priority}</span>
                          </p>
                          <button
                             onClick={() => {
                               localStorage.setItem("selected_client_id", account.id);
                               window.location.href = "/dashboard";
                             }}
                             className="text-[12px] font-semibold text-brand-gold flex items-center gap-1 hover:gap-2 transition-all"
                          >
                             Set Active <ChevronRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Plus Card */}
                    <button
                      onClick={() => setIsCreating(true)}
                      className="border border-dashed border-[#1a1510]/12 rounded-2xl p-12 flex flex-col items-center justify-center text-center group hover:border-brand-gold/40 hover:bg-white transition-all min-h-[148px]"
                    >
                      <div className="w-11 h-11 bg-[#1a1510] rounded-xl flex items-center justify-center text-brand-gold mb-3 group-hover:scale-105 transition-transform">
                        <Plus size={22} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#1a1510]/40 group-hover:text-[#1a1510]/60 transition-colors">Add new account</span>
                    </button>
                  </div>
                )}

              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsCreating(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f7f8f9] text-[#1a1510]/50 hover:text-[#1a1510] transition-colors"><ArrowLeft size={18} /></button>
                  <h3 className="text-xl font-bold tracking-tight text-[#1a1510]">New Account</h3>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-32">
                   <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 sm:p-7 space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[12px] font-semibold text-[#1a1510]/60">Account name *</label>
                         <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nike Enterprise" className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all text-[13px] placeholder:text-[#1a1510]/30" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#1a1510]/60">Industry</label>
                            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] outline-none cursor-pointer text-[13px]">
                              <option value="Technology">Technology</option>
                              <option value="SaaS">SaaS</option>
                              <option value="Fintech">Fintech</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Retail">Retail</option>
                              <option value="Agency">Agency</option>
                            </select>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#1a1510]/60">Region</label>
                            <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] outline-none cursor-pointer text-[13px]">
                              <option value="North America">North America</option>
                              <option value="EMEA">EMEA</option>
                              <option value="APAC">APAC</option>
                              <option value="LATAM">LATAM</option>
                            </select>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#1a1510]/60">Account owner</label>
                            <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all text-[13px]" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#1a1510]/60">Website</label>
                            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. nike.com" className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all text-[13px] placeholder:text-[#1a1510]/30" />
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 sm:p-7 space-y-4">
                      <h4 className="text-[12px] font-semibold text-[#1a1510]/50 uppercase tracking-wider">Inherited tools</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                         {TOOLS.map((tool, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#fafafa] border border-[#1a1510]/[0.05]">
                               <div className="flex items-center gap-2.5">
                                  <tool.icon size={15} className="text-[#1a1510]/50" />
                                  <span className="text-[13px] font-medium text-[#1a1510]">{tool.name}</span>
                               </div>
                               <div className="w-8 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-1"><div className="w-3 h-3 bg-white rounded-full" /></div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="lg:col-span-2 flex justify-end gap-2.5 pt-2">
                      <button type="button" onClick={() => setIsCreating(false)} className="px-6 h-11 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">Cancel</button>
                      <button type="submit" disabled={saving} className="btn-shine px-8 h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                         {saving ? <Loader2 className="animate-spin" size={14} /> : "Save Account"}
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
