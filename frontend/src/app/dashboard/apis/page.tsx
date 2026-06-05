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
import { Loader } from "../../../components/ui/Loader";

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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

      {/* Header */}
      <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
              <Zap size={17} />
            </div>
            <div className="hidden sm:block truncate">
              <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">APIs &amp; Keys</h2>
              <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">
                {selectedClient ? `${selectedClient.name} · connected integrations` : "Manage external integrations"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative group hidden md:block">
            <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
            <input
              type="text"
              placeholder="Search connectors…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-48 lg:w-64 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
            />
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
          >
            <LayoutDashboard size={15} /> <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-hide pb-32">
      {!selectedClient ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
           <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-4"><Zap size={26} /></div>
           <p className="text-[15px] font-semibold text-[#1a1510]">Select a client first</p>
           <p className="text-[13px] text-[#1a1510]/40 mt-1">Choose a client from the sidebar to manage their integrations.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24 w-full">
          <Loader size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {filteredTools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 flex flex-col group shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:border-[#1a1510]/15 transition-all"
            >
              {/* Top Identity Block */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#f7f8f9] border border-[#1a1510]/[0.06] rounded-xl flex items-center justify-center text-[#1a1510]/50 shrink-0">
                  <tool.icon size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#1a1510] tracking-tight truncate">{tool.name}</h3>
                  <span className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-wide">{tool.category}</span>
                </div>
              </div>

              {/* API Key Account label */}
              <div className="w-full h-10 px-3.5 mt-4 bg-[#fafafa] rounded-lg flex items-center gap-2.5 border border-[#1a1510]/[0.05] overflow-hidden">
                <Key size={15} className="text-[#1a1510]/35 shrink-0" />
                <code className="text-[12px] font-mono text-[#1a1510]/55 truncate">
                  {tool.connected && tool.account ? `${tool.account.account_label} (active)` : "no key synced"}
                </code>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-[#1a1510]/[0.06]">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${tool.connected ? 'text-emerald-600' : 'text-[#1a1510]/35'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tool.connected ? 'bg-emerald-500 animate-pulse' : 'bg-[#1a1510]/15'}`} />
                  {tool.connected ? 'Connected' : 'Not connected'}
                </span>

                <div className="flex items-center gap-2">
                  {tool.connected && tool.account ? (
                    <button onClick={() => handleDeleteAccount(tool.account!.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-[#1a1510]/[0.07] rounded-lg text-[#1a1510]/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConnectTool(tool)}
                      className="btn-shine h-9 px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors"
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
      </main>

      {/* Connect API Key Modal */}
      <AnimatePresence>
        {connectTool && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConnectTool(null)} className="fixed inset-0 bg-[#1a1510]/40 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[460px] h-fit bg-white rounded-2xl shadow-2xl border border-[#1a1510]/[0.06] z-[201] p-6 sm:p-7">
               <form onSubmit={handleConnect} className="space-y-5">
                  <div className="flex justify-between items-center">
                     <h2 className="text-lg font-bold text-[#1a1510]">Connect {connectTool.name}</h2>
                     <button type="button" onClick={() => setConnectTool(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"><X size={18} /></button>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-[#1a1510]/60">Account label</label>
                        <input required type="text" value={accountLabel} onChange={(e) => setAccountLabel(e.target.value)} placeholder="e.g. Primary Apollo Account" className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 text-[13px] transition-all placeholder:text-[#1a1510]/30" />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-[#1a1510]/60">API key / credential</label>
                        <input required type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key or token" className="w-full h-11 px-4 bg-[#f7f8f9] border border-[#1a1510]/[0.07] rounded-xl outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 text-[13px] transition-all placeholder:text-[#1a1510]/30" />
                     </div>
                  </div>

                  <div className="flex gap-2.5 pt-4 border-t border-[#1a1510]/[0.07]">
                     <button type="button" onClick={() => setConnectTool(null)} className="h-11 px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">Cancel</button>
                     <button type="submit" disabled={connecting} className="btn-shine flex-1 h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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
