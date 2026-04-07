"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Edit2, RotateCw, Trash2, CheckCircle2, 
  AlertCircle, XCircle, Search as SearchIcon, Key, 
  MoreVertical, Zap, Database, Globe, Mail, Target, 
  Briefcase, Cpu, Bot, Settings, Activity, LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const TOOL_DATA = [
  { 
    id: 'apollo', 
    name: "Apollo", 
    category: "PROSPECTING", 
    status: "CONNECTED", 
    lastChecked: "2m ago", 
    key: "ak_••••••••7f3d", 
    connected: true,
    icon: Target,
    iconColor: "text-blue-500"
  },
  { 
    id: 'clay', 
    name: "Clay", 
    category: "ENRICHMENT", 
    status: "CONNECTED", 
    lastChecked: "8m ago", 
    key: "cl_••••••••a1b2", 
    connected: true,
    icon: Database,
    iconColor: "text-emerald-500"
  },
  { 
    id: 'smartlead', 
    name: "Smartlead", 
    category: "OUTREACH", 
    status: "CONNECTED", 
    lastChecked: "15m ago", 
    key: "sl_••••••••c3d4", 
    connected: true,
    icon: Mail,
    iconColor: "text-purple-500"
  },
  { 
    id: 'heyreach', 
    name: "HeyReach", 
    category: "OUTREACH", 
    status: "ERROR", 
    lastChecked: "1h ago", 
    key: "hr_••••••••c5f6", 
    connected: true,
    icon: Globe,
    iconColor: "text-orange-500"
  },
  { 
    id: 'hubspot', 
    name: "HubSpot", 
    category: "CRM", 
    status: "CONNECTED", 
    lastChecked: "3h ago", 
    key: "hs_••••••••g7h8", 
    connected: true,
    icon: Settings,
    iconColor: "text-orange-600"
  },
  { 
    id: 'salesforce', 
    name: "Salesforce", 
    category: "CRM", 
    status: "NOT CONNECTED", 
    lastChecked: null, 
    key: null, 
    connected: false,
    icon: Briefcase,
    iconColor: "text-blue-400"
  },
  { 
    id: 'instantly', 
    name: "Instantly", 
    category: "OUTREACH", 
    status: "NOT CONNECTED", 
    lastChecked: null, 
    key: null, 
    connected: false,
    icon: Zap,
    iconColor: "text-orange-400"
  },
  { 
    id: 'openai', 
    name: "OpenAI", 
    category: "AI", 
    status: "CONNECTED", 
    lastChecked: "5m ago", 
    key: "sk_••••••••i9j0", 
    connected: true,
    icon: Bot,
    iconColor: "text-emerald-600"
  },
  { 
    id: 'claude', 
    name: "Claude", 
    category: "AI", 
    status: "NOT CONNECTED", 
    lastChecked: null, 
    key: null, 
    connected: false,
    icon: Cpu,
    iconColor: "text-purple-400"
  }
];

export default function APIsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = TOOL_DATA.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fa] p-4 sm:p-10 space-y-8 sm:space-y-12 pb-40 relative group/shell font-sans scrollbar-hide">
      {/* Cinematic Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1a1510_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Premium Integrated Header Hub */}
      <header className="max-w-7xl mx-auto w-full relative z-20">
        <div className="bg-white/80 backdrop-blur-xl border border-[#1a1510]/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-[#1a1510]/5">
          {/* Left: Identity */}
          <div className="flex items-center gap-4 sm:gap-6 pl-2 w-full md:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1a1510] rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-brand-gold shadow-lg shadow-[#1a1510]/20 shrink-0">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5 truncate">
              <h1 className="text-sm sm:text-[15px] font-black text-[#1a1510] tracking-[0.1em] uppercase truncate">APIs & Integrations</h1>
              <p className="text-[8px] sm:text-[10px] font-bold text-[#1a1510]/20 tracking-[0.05em] uppercase truncate hidden sm:block">MANAGE, TEST & ORCHESTRATE EXTERNAL TOOLS.</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-[#1a1510]/20 tracking-[0.05em] uppercase truncate sm:hidden">MANAGE EXTERNAL TOOLS.</p>
            </div>
          </div>

          {/* Center: Intel Search */}
          <div className="w-full md:flex-1 md:max-w-xs lg:max-w-sm relative group/search">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within/search:text-brand-gold transition-colors">
              <SearchIcon size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search connectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 sm:h-14 pl-14 pr-8 bg-[#f7f8f9] border border-transparent rounded-full text-xs sm:text-[13px] font-bold text-[#1a1510] focus:bg-white focus:shadow-xl focus:shadow-[#1a1510]/5 outline-none transition-all"
            />
          </div>

          {/* Right: Action Suite */}
          <div className="flex items-center gap-3 sm:gap-4 pr-2 w-full md:w-auto justify-end">
             <button 
              onClick={() => router.push('/dashboard')}
              className="h-12 sm:h-14 px-4 sm:px-6 bg-white border border-[#1a1510]/5 text-[#1a1510]/20 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-[#f7f8f9] transition-all"
            >
              <LayoutDashboard size={14} className="opacity-40" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button className="px-6 sm:px-7 h-12 sm:h-14 bg-[#1a1510] text-[#fdfbf7] rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-2 sm:gap-3 shadow-xl hover:translate-y-[-1px] transition-all group/btn whitespace-nowrap">
              <Plus size={18} strokeWidth={3} className="text-white/40" />
              <span>Add New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto w-full relative z-10">
        {filteredTools.map((tool, idx) => (
          <motion.div 
            key={tool.id} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className={`bg-white border border-[#1a1510]/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-7 space-y-6 sm:space-y-7 hover:shadow-xl transition-all group relative overflow-hidden`}
          >
            {/* Top Identity Block */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-white border border-[#1a1510]/5 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm ${tool.iconColor} group-hover:scale-110 transition-transform`}>
                  <tool.icon size={26} strokeWidth={2} />
                </div>
                <div className="space-y-0.5 truncate">
                  <h3 className="text-base sm:text-[17px] font-black text-[#1a1510] tracking-tight truncate">{tool.name}</h3>
                  <span className="text-[9px] sm:text-[11px] font-black text-brand-gold uppercase tracking-widest">{tool.category}</span>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked={tool.connected} />
                <div className="w-9 h-5 sm:w-10 sm:h-6 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] sm:after:top-[3px] after:left-[2.5px] sm:after:left-[3px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 sm:after:h-4.5 after:w-4 sm:after:w-4.5 after:transition-all peer-checked:bg-brand-gold"></div>
              </div>
            </div>

            {/* Industrial Key Input */}
            <div className="relative group/key">
              <div className="w-full h-10 sm:h-12 px-4 sm:px-5 bg-[#f8f9fa] rounded-xl flex items-center gap-3 sm:gap-4 border border-transparent group-hover/key:border-brand-gold/20 transition-all overflow-hidden">
                <Key size={16} className="text-[#1a1510]/40 shrink-0" />
                <code className="text-[11px] sm:text-[13px] font-mono text-[#1a1510]/60 tracking-tight font-bold truncate">
                  {tool.key || "no key sync"}
                </code>
              </div>
            </div>

            {/* Bottom Orchestration Module */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 pt-1">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f9fa] border border-[#1a1510]/5 transition-all shadow-sm`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  tool.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 
                  tool.status === 'ERROR' ? 'bg-red-500' : 
                  'bg-[#1a1510]/10'
                }`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  tool.status === 'CONNECTED' ? 'text-emerald-600' : 
                  tool.status === 'ERROR' ? 'text-red-500' : 
                  'text-[#1a1510]/40'
                }`}>
                  {tool.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2 w-full xs:w-auto">
                {tool.connected ? (
                  <>
                    <button className="flex-1 xs:flex-none px-4 px-5 h-9 sm:h-10 bg-white border border-[#1a1510]/10 rounded-xl text-[9px] sm:text-[10px] font-black text-[#1a1510] uppercase tracking-widest hover:bg-[#1a1510] hover:text-white transition-all">
                      Test
                    </button>
                    <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white border border-[#1a1510]/5 rounded-xl text-[#1a1510]/20 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <button className="w-full xs:w-auto px-6 h-10 sm:h-11 bg-[#1a1510] text-[#fdfbf7] rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:translate-y-[-1px] shadow-lg transition-all">
                    Connect
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
