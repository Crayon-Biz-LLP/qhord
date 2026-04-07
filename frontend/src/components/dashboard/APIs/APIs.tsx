"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Edit2, RotateCw, Trash2, CheckCircle2, 
  AlertCircle, XCircle, Search as SearchIcon, Key, 
  MoreVertical, Zap, Database, Globe, Mail, Target, 
  Briefcase, Cpu, Bot, Settings, Activity
} from "lucide-react";
import { motion } from "framer-motion";

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

export const APIs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = TOOL_DATA.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fa] p-10 space-y-12 pb-40 relative group/shell font-sans scrollbar-hide">
      {/* Cinematic Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1a1510_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Premium Integrated Header Hub (Pill Design) */}
      <header className="max-w-7xl mx-auto w-full relative z-20">
        <div className="bg-white/80 backdrop-blur-xl border border-[#1a1510]/5 rounded-[2.5rem] p-5 flex items-center justify-between shadow-2xl shadow-[#1a1510]/5">
          {/* Left: Identity */}
          <div className="flex items-center gap-6 pl-2">
            <div className="w-14 h-14 bg-[#1a1510] rounded-[1.5rem] flex items-center justify-center text-brand-gold shadow-lg shadow-[#1a1510]/20">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-[15px] font-black text-[#1a1510] tracking-[0.1em] uppercase">APIs & Integrations</h1>
              <p className="text-[10px] font-bold text-[#1a1510]/20 tracking-[0.05em] uppercase">CONNECT — MANAGE, TEST & ORCHESTRATE EXTERNAL TOOLS.</p>
            </div>
          </div>

          {/* Center: Intel Search (Pill Style) */}
          <div className="flex-1 max-w-sm mx-12 relative group/search">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within/search:text-brand-gold transition-colors">
              <SearchIcon size={16} />
            </div>
            <input 
              type="text" 
              placeholder=" "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-14 pr-8 bg-[#f7f8f9] border border-transparent rounded-full text-[13px] font-bold text-[#1a1510] focus:bg-white focus:shadow-xl focus:shadow-[#1a1510]/5 outline-none transition-all"
            />
          </div>

          {/* Right: Action Suite */}
          <div className="flex items-center gap-4 pr-2">
            <button className="px-7 h-14 bg-[#1a1510] text-[#fdfbf7] rounded-full text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-3 shadow-xl shadow-[#1a1510]/10 hover:translate-y-[-1px] transition-all group/btn">
              <Plus size={18} strokeWidth={3} className="text-white/40" />
              <span>Add Connection</span>
            </button>
            <button className="w-40 h-14 bg-white border border-[#1a1510]/5 text-[#1a1510]/20 rounded-full text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-[#f7f8f9] transition-all">
              <Database size={14} className="opacity-40" />
              <span>Back To Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full relative z-10 px-4">
        {filteredTools.map((tool, idx) => (
          <motion.div 
            key={tool.id} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            className={`bg-white border border-gray-100/50 rounded-[2.5rem] p-7 space-y-7 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] transition-all group relative overflow-hidden`}
          >
            {/* Top Identity Block - Tactical Compact Style */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-white border border-gray-200/50 rounded-2xl flex items-center justify-center shadow-sm ${tool.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                  <tool.icon size={26} strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-black text-[#1a1510] tracking-tight leading-none">{tool.name}</h3>
                    </div>
                    <span className="text-[11px] font-black text-brand-gold uppercase tracking-[0.2em]">{tool.category}</span>
                  </div>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer mt-0.5">
                <input type="checkbox" className="sr-only peer" defaultChecked={tool.connected} />
                <div className="w-10 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#b99b7b]"></div>
              </div>
            </div>

            {/* Industrial Key Input - High Density */}
            <div className="relative group/key">
              <div className="w-full h-12 px-5 bg-[#f8f9fa] rounded-xl flex items-center gap-4 border border-transparent group-hover/key:border-brand-gold/20 transition-all">
                <Key size={16} className="text-[#1a1510]/40" />
                <code className="text-[13px] font-mono text-[#1a1510]/60 tracking-tight font-bold">
                  {tool.key || "no key sync"}
                </code>
              </div>
            </div>

            {/* Bottom Orchestration Module - Compact Pilled Triggers */}
            <div className="flex items-center justify-between pt-1">
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f8f9fa] border border-[#1a1510]/5 transition-all shadow-sm`}>
                <div className={`w-2 h-2 rounded-full ${
                  tool.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 
                  tool.status === 'ERROR' ? 'bg-red-500' : 
                  'bg-[#1a1510]/10'
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  tool.status === 'CONNECTED' ? 'text-emerald-600' : 
                  tool.status === 'ERROR' ? 'text-red-500' : 
                  'text-[#1a1510]/40'
                }`}>
                  {tool.status}
                </span>
                {tool.lastChecked && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#1a1510]/10" />
                    <span className="text-[10px] font-bold text-[#1a1510]/40 italic uppercase whitespace-nowrap">
                      {tool.lastChecked}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2.5">
                {tool.connected ? (
                  <>
                    <button className="px-5 h-10 bg-white border border-[#1a1510]/10 rounded-xl text-[10px] font-black text-[#1a1510] uppercase tracking-widest hover:bg-[#1a1510] hover:text-white transition-all shadow-sm">
                      Test
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-[#1a1510]/5 rounded-xl text-[#1a1510]/20 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <button className="px-6 h-11 bg-[#1a1510] text-[#fdfbf7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:translate-y-[-1px] shadow-lg shadow-[#1a1510]/10 transition-all">
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
};
