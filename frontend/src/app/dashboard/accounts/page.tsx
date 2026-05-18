"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, MessageSquare, Calendar, DollarSign, Search, Plus,
  ArrowUpRight, LayoutDashboard, Globe, ChevronRight, Filter, MoreHorizontal,
  ArrowLeft, Target, Trophy, Wrench, ChevronDown, MapPin, Tag, Info, Laptop,
  Cpu, Zap, Mail, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Mock Data ---
const accountsData = [
  {
    id: 1,
    name: "Nike",
    segment: "Company",
    owner: "Sarah M.",
    health: 92,
    leads: "847",
    replies: "36",
    meetings: "9",
    pipeline: "$280K",
    campaigns: { total: 2, active: 2 }
  },
  {
    id: 2,
    name: "Mercedes GLS",
    segment: "Segment",
    owner: "Mike T.",
    health: 85,
    leads: "1,240",
    replies: "18",
    meetings: "4",
    pipeline: "$320K",
    campaigns: { total: 1, active: 1 }
  },
  {
    id: 3,
    name: "Samsung EU",
    segment: "Territory",
    owner: "Sarah M.",
    health: 65,
    leads: "520",
    replies: "8",
    meetings: "2",
    pipeline: "$95K",
    campaigns: { total: 1, active: 0 }
  }
];

const kpis = [
  { label: "ACCOUNTS", value: "5", icon: Globe, sparkline: [40, 50, 45, 60, 55, 70, 65, 80], change: "+2 this mo" },
  { label: "LEADS", value: "2,987", icon: Users, sparkline: [30, 35, 32, 40, 38, 45, 42, 50], change: "+12.4%" },
  { label: "REPLIES", value: "74", icon: MessageSquare, sparkline: [20, 25, 22, 30, 28, 35, 32, 40], change: "Optimal" },
  { label: "MEETINGS", value: "18", icon: Calendar, sparkline: [10, 15, 12, 18, 16, 22, 18, 25], change: "+3 today" },
  { label: "PIPELINE", value: "$840K", icon: DollarSign, sparkline: [50, 60, 55, 75, 70, 85, 80, 95], change: "+$12K week" },
];

const TOOLS = [
  { name: "Apollo", icon: Globe, color: "text-blue-500" },
  { name: "Clay", icon: Sparkles, color: "text-brand-gold" },
  { name: "Smartlead", icon: Zap, color: "text-purple-500" },
  { name: "HubSpot", icon: DatabaseIcon, color: "text-orange-500" },
];

function DatabaseIcon(props: any) { return <Laptop {...props} /> }

// --- Sub-components ---

const CreateAccountView = ({ onBack, onSave }: { onBack: () => void; onSave: () => void }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-[#f7f8f9] transition-colors"><ArrowLeft size={20} /></button>
        <h3 className="text-xl font-black uppercase tracking-tight">New Account Node</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
         <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-sm">
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Account Name *</label>
                  <input type="text" placeholder="e.g. Nike Enterprise" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent focus:bg-white focus:outline-none transition-all" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Type</label>
                     <select className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent outline-none appearance-none cursor-pointer"><option>Company</option><option>Segment</option></select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-[#1a1510]/30 ml-1">Status</label>
                     <select className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-transparent outline-none appearance-none cursor-pointer"><option>Active</option><option>Draft</option></select>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20">Inherited Tools</h4>
            <div className="grid grid-cols-2 gap-3">
               {TOOLS.map((tool, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f7f8f9] border border-transparent">
                     <div className="flex items-center gap-3">
                        <tool.icon size={14} className={tool.color} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tool.name}</span>
                     </div>
                     <div className="w-8 h-4 bg-[#1a1510]/5 rounded-full" />
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-2 flex justify-end gap-3 pt-6">
            <button onClick={onBack} className="px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40">Cancel</button>
            <button onClick={onSave} className="px-10 h-10 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Save Account</button>
         </div>
      </div>
    </motion.div>
  );
};

export default function AccountsPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      
      {/* 1. Header Navigation */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3 truncate">
          <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
            <Globe size={18} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Accounts</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
               5 registered nodes
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
                      placeholder="Search account intelligence..." 
                      className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-[#1a1510]/5 text-sm font-medium focus:outline-none transition-all shadow-sm"
                   />
                </div>

                {/* Account Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-32">
                  {accountsData.map((account) => (
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
                              <span className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest truncate">{account.segment} • {account.owner}</span>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-2xl font-black text-emerald-500 leading-none">{account.health}%</p>
                           <p className="text-[8px] font-black uppercase text-[#1a1510]/10 tracking-widest mt-1">Health</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-6">
                         {[
                            { l: "Leads", v: account.leads },
                            { l: "Replies", v: account.replies },
                            { l: "Meets", v: account.meetings },
                            { l: "Pipe", v: account.pipeline },
                         ].map((m, i) => (
                            <div key={i} className="text-center">
                               <p className="text-[14px] font-black truncate">{m.v}</p>
                               <p className="text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest truncate">{m.l}</p>
                            </div>
                         ))}
                      </div>

                      <div className="pt-6 border-t border-[#1a1510]/5 flex justify-between items-center">
                        <p className="text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">
                           {account.campaigns.active} active campaigns
                        </p>
                        <button className="text-[9px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                           View Nodes <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Plus Card */}
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="border-2 border-dashed border-[#1a1510]/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group hover:border-brand-gold/40 transition-all bg-white/40 min-h-[250px]"
                  >
                    <div className="w-14 h-14 bg-[#1a1510] rounded-2xl flex items-center justify-center text-brand-gold mb-4 group-hover:scale-110 transition-transform">
                      <Plus size={28} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#1a1510]/20 group-hover:text-[#1a1510]/40 transition-colors">Setup New Node</span>
                  </button>
                </div>

              </motion.div>
            ) : (
              <CreateAccountView onBack={() => setIsCreating(false)} onSave={() => setIsCreating(false)} />
            )}
          </AnimatePresence>
          
        </div>
      </main>
    </div>
  );
}

const X = ({ size, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
