"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Search, Edit2, RotateCw, Trash2, CheckCircle2, 
  AlertCircle, XCircle, Search as SearchIcon, Key, 
  MoreVertical, Zap, Database, Globe, Mail, Target, 
  Briefcase, Cpu, Bot, Settings, Activity, LayoutDashboard, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";

interface ToolItem {
  id: string; // matches tool_id
  name: string;
  category: string;
  description: string;
  status: string;
}

interface ConnectedAccount {
  id: string;
  client_id: string;
  tool_name: string;
  account_label: string;
  created_at: string;
}

const mapToolIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("apollo")) return Target;
  if (n.includes("clay")) return Database;
  if (n.includes("smartlead")) return Mail;
  if (n.includes("heyreach")) return Globe;
  if (n.includes("hubspot")) return Settings;
  if (n.includes("salesforce")) return Briefcase;
  if (n.includes("openai")) return Bot;
  if (n.includes("claude") || n.includes("anthropic")) return Cpu;
  return Zap;
};

const mapToolIconColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("apollo")) return "text-blue-500";
  if (n.includes("clay")) return "text-emerald-500";
  if (n.includes("smartlead")) return "text-purple-500";
  if (n.includes("heyreach")) return "text-orange-500";
  if (n.includes("hubspot")) return "text-orange-600";
  if (n.includes("salesforce")) return "text-blue-400";
  if (n.includes("openai")) return "text-emerald-600";
  return "text-purple-400";
};

export default function APIsPage() {
  const router = useRouter();
  const { selectedClient } = useClient();
  
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Connection Modal
  const [connectTool, setConnectTool] = useState<ToolItem | null>(null);
  const [accountLabel, setAccountLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);

  const fetchToolsAndAccounts = async () => {
    setLoading(true);
    try {
      const toolsRes = await api.get("/tools");
      const loadedTools = toolsRes.data.tools || [];
      setTools(loadedTools);

      if (selectedClient) {
        const accsRes = await api.get(`/tools/accounts/${selectedClient.id}`);
        setAccounts(accsRes.data.accounts || []);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.error("Failed to load APIs information:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolsAndAccounts();
  }, [selectedClient]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !connectTool || !accountLabel || !apiKey) return;
    setConnecting(true);
    try {
      const res = await api.post("/tools/accounts", {
        clientId: selectedClient.id,
        toolName: connectTool.id,
        accountLabel,
        apiKey
      });
      if (res.data.account) {
        setAccounts(prev => [res.data.account, ...prev]);
        setConnectTool(null);
        setAccountLabel("");
        setApiKey("");
      }
    } catch (err) {
      console.error("Failed to connect tool account:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this tool account?")) return;
    try {
      await api.delete(`/tools/accounts/${accountId}`);
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const processedTools = useMemo(() => {
    return tools.map(t => {
      const connectedAcc = accounts.find(acc => acc.tool_name.toLowerCase() === t.id.toLowerCase());
      return {
        ...t,
        connected: !!connectedAcc,
        account: connectedAcc,
        icon: mapToolIcon(t.name),
        iconColor: mapToolIconColor(t.name)
      };
    });
  }, [tools, accounts]);

  const filteredTools = useMemo(() => {
    return processedTools.filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedTools, searchTerm]);

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
              <p className="text-[8px] sm:text-[10px] font-bold text-[#1a1510]/20 tracking-[0.05em] uppercase truncate hidden sm:block">
                {selectedClient ? `${selectedClient.name} Tool Stack` : "MANAGE, TEST & ORCHESTRATE EXTERNAL TOOLS."}
              </p>
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
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tool Grid */}
      {!selectedClient ? (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-7xl mx-auto w-full">
           <Zap size={48} className="text-[#1a1510]/10 mb-4" />
           <p className="text-sm font-bold text-[#1a1510]/40">Please establish/select a Client from the sidebar first.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24 max-w-7xl mx-auto w-full">
          <Loader2 className="animate-spin text-brand-gold" size={32} />
        </div>
      ) : (
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
              </div>

              {/* API Key Account label */}
              <div className="relative group/key">
                <div className="w-full h-10 sm:h-12 px-4 sm:px-5 bg-[#f8f9fa] rounded-xl flex items-center gap-3 sm:gap-4 border border-transparent group-hover/key:border-brand-gold/20 transition-all overflow-hidden">
                  <Key size={16} className="text-[#1a1510]/40 shrink-0" />
                  <code className="text-[11px] sm:text-[13px] font-mono text-[#1a1510]/60 tracking-tight font-bold truncate">
                    {tool.connected && tool.account ? `${tool.account.account_label} (active)` : "no key sync"}
                  </code>
                </div>
              </div>

              {/* Bottom Orchestration Module */}
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 pt-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f9fa] border border-[#1a1510]/5 transition-all shadow-sm`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    tool.connected ? 'bg-emerald-500 animate-pulse' : 'bg-[#1a1510]/10'
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    tool.connected ? 'text-emerald-600' : 'text-[#1a1510]/40'
                  }`}>
                    {tool.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 w-full xs:w-auto">
                  {tool.connected && tool.account ? (
                    <>
                      <button className="flex-1 xs:flex-none px-4 px-5 h-9 sm:h-10 bg-white border border-[#1a1510]/10 rounded-xl text-[9px] sm:text-[10px] font-black text-[#1a1510] uppercase tracking-widest hover:bg-[#1a1510] hover:text-white transition-all">
                        Active
                      </button>
                      <button onClick={() => handleDeleteAccount(tool.account!.id)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white border border-[#1a1510]/5 rounded-xl text-[#1a1510]/20 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setConnectTool(tool)}
                      className="w-full xs:w-auto px-6 h-10 sm:h-11 bg-[#1a1510] text-[#fdfbf7] rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:translate-y-[-1px] shadow-lg transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Connect API Key Modal */}
      <AnimatePresence>
        {connectTool && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConnectTool(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[500px] h-fit bg-white rounded-[2rem] shadow-2xl z-[201] p-6 sm:p-8">
               <form onSubmit={handleConnect} className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h2 className="text-xl font-black text-[#1a1510]">Connect {connectTool.name}</h2>
                     <button type="button" onClick={() => setConnectTool(null)} className="p-2 hover:bg-[#f7f8f9] rounded-xl"><X size={18} /></button>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Account Label</label>
                        <input required type="text" value={accountLabel} onChange={(e) => setAccountLabel(e.target.value)} placeholder="e.g. Primary Apollo Account" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#1a1510]/30">API Key / Credential</label>
                        <input required type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API Key / Token" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                     </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#1a1510]/5">
                     <button type="button" onClick={() => setConnectTool(null)} className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase">Cancel</button>
                     <button type="submit" disabled={connecting} className="flex-1 h-12 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2">
                        {connecting ? <Loader2 className="animate-spin" size={14} /> : "Save Connector"}
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
