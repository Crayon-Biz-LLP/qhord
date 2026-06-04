"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Users, Search, Filter, Plus, Zap, ShieldCheck, Mail, Target,
   LayoutDashboard, Terminal, MessageSquare, BarChart3, Clock,
   CheckCircle, Sparkles, Bot, Box, MoreVertical, Star,
   Smartphone, MapPin, Briefcase, Globe, ExternalLink, RefreshCw,
   Database, Zap as ZapIcon, Shield, ChevronRight, Download, Settings,
   Cpu, Layout, Layers, Link as LinkIcon, UserPlus, Send
} from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "../../../lib/api";
import { ConnectModal } from "../../../components/dashboard/Tools/ConnectModal";

import { useClient } from "../../../contexts/ClientContext";

// --- Types ---
interface ToolItem {
   id: string;
   name: string;
   category: string;
   description: string;
   status: string;
   isConnected: boolean;
   syncStat?: string;
   icon: any;
}

// --- Icons Mapper ---
const TOOL_ICONS: Record<string, any> = {
   apollo: Database,
   zoominfo: Globe,
   cognism: Target,
   lusha: Smartphone,
   clay: Layers,
   clearbit: Cpu,
   smartlead: Zap,
   instantly: Mail,
   lemlist: Send,
   heyreach: MessageSquare,
   expandi: Bot,
   zapier: ZapIcon,
   make: Plus,
   hubspot: Layout,
   salesforce: Shield,
   pipedrive: Target,
};

const CATEGORIES = [
   "All",
   "Prospecting & Data",
   "Enrichment",
   "Email Outreach",
   "LinkedIn",
   "Automation",
   "CRM"
];

export default function ToolsPage() {
   const router = useRouter();
   const [activeCategory, setActiveCategory] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");
   const [tools, setTools] = useState<ToolItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedTool, setSelectedTool] = useState<{ id: string, name: string } | null>(null);
   const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
   const [toastMessage, setToastMessage] = useState<string | null>(null);
   const { selectedClient, loading: isClientLoading } = useClient();

   const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
   };

   const fetchData = useCallback(async () => {
      if (isClientLoading) return;
      
      setLoading(true);
      try {
         // 1. Fetch all supported tools from backend
         const toolsRes = await api.get("/tools");
         const baseTools = toolsRes.data.tools;

         let connectedToolNames = new Set<string>();

         // 2. Fetch connected accounts for the SELECTED client
         if (selectedClient) {
             const accountsRes = await api.get(`/tools/accounts/${selectedClient.id}`);
             connectedToolNames = new Set(accountsRes.data.accounts.map((a: any) => a.tool_name));
         }

         // 3. Merge info
         const mergedTools: ToolItem[] = baseTools.map((t: any) => ({
            ...t,
            isConnected: connectedToolNames.has(t.id),
            status: t.status || 'active',
            icon: TOOL_ICONS[t.id] || Box,
            syncStat: connectedToolNames.has(t.id) ? "Connected" : undefined
         }));

         setTools(mergedTools);
      } catch (err) {
         console.error("Failed to fetch tools", err);
      } finally {
         setLoading(false);
      }
   }, [selectedClient, isClientLoading]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const handleConnectClick = (tool: { id: string, name: string }) => {
      if (!selectedClient) {
         showToast("Please create or select a client first to connect tools.");
         setTimeout(() => router.push("/dashboard/clients"), 1500);
         return;
      }
      setSelectedTool(tool);
      setIsConnectModalOpen(true);
   };

   const handleDisabledConnectClick = (tool: ToolItem) => {
      // Opt-in tracking hook/log for measuring interest in integration 
      console.log(`[TRACKING] Interest logged for coming soon tool: ${tool.name} (${tool.id})`);
   };

   const filteredTools = useMemo(() => {
      return tools.filter(tool => {
         const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
         const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
         return matchesCategory && matchesSearch;
      });
   }, [activeCategory, searchQuery, tools]);

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                     <Box size={18} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Tools</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                        Connect GTM stack
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
               <div className="relative group hidden md:block">
                  <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search tools..."
                     className="h-10 w-48 lg:w-72 pl-12 pr-4 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-medium focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
               </div>

               <button
                  onClick={() => router.push('/dashboard')}
                  className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8 overflow-y-auto scrollbar-hide pb-32">
            {loading ? (
               <div className="flex-1 flex items-center justify-center py-40">
                  <div className="flex flex-col items-center gap-4">
                     <RefreshCw className="animate-spin text-brand-gold" size={40} />
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-[#1a1510]/30">Calibrating Nexus...</p>
                  </div>
               </div>
            ) : (
               <>
                  {/* 2. Category Rail */}
                  <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-[#1a1510]/5 w-fit shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                     {CATEGORIES.slice(0, 5).map((cat) => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`h-9 px-4 sm:px-6 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                              ? "bg-[#1a1510] text-brand-gold shadow-lg"
                              : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                              }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>

                  {!selectedClient && (
                     <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-3 shadow-sm">
                        <Shield className="text-amber-600 shrink-0" size={18} />
                        <span>Please select a client to connect tools.</span>
                     </div>
                  )}

                  {/* 3. Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-32">
                     {filteredTools.map((tool, idx) => (
                        <motion.div
                           key={tool.id}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ duration: 0.4, delay: idx * 0.05 }}
                           className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#1a1510]/5 p-6 sm:p-8 flex flex-col justify-between h-[300px] group hover:shadow-xl transition-all relative overflow-hidden"
                        >
                           <div className="space-y-6">
                              {/* Card Header */}
                              <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold border border-[#1a1510]/5 shrink-0 group-hover:scale-110 transition-transform">
                                       <tool.icon size={20} />
                                    </div>
                                    <div className="truncate">
                                       <h3 className="text-base sm:text-lg font-black text-[#1a1510] tracking-tight leading-none mb-1.5 truncate">{tool.name}</h3>
                                       <div className="flex gap-2">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border truncate inline-block ${tool.category === 'Prospecting & Data' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-[#1a1510]/5 text-[#1a1510]/40 border-transparent'}`}>
                                             {tool.category}
                                          </span>
                                          {tool.status === 'comingSoon' && (
                                             <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-orange-200 bg-orange-50 text-orange-600 truncate inline-block">
                                                Coming Soon
                                             </span>
                                          )}
                                          {tool.status === 'disabled' && (
                                             <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-200 bg-red-50 text-red-600 truncate inline-block">
                                                Disabled
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1.5 shrink-0">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tool.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-[#1a1510]/10'}`} />
                                 </div>
                              </div>

                              {/* Description */}
                              <p className="text-[11px] sm:text-[12px] font-medium text-[#1a1510]/40 leading-relaxed italic line-clamp-2">
                                 {tool.description}
                              </p>
                           </div>

                           {/* Action Node */}
                           <div className="mt-8">
                              {tool.isConnected ? (
                                 <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20 px-1">
                                       <span>Flow Sync</span>
                                       <span className="text-brand-gold truncate max-w-[120px]">{tool.syncStat}</span>
                                    </div>
                                    <div className="flex gap-2">
                                       <button className="flex-1 h-11 rounded-xl sm:rounded-2xl border border-[#1a1510]/10 text-[#1a1510] text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#1a1510] hover:text-brand-gold transition-all">
                                          Manage
                                       </button>
                                       <button className="w-11 h-11 rounded-xl sm:rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/40 hover:text-[#1a1510] transition-colors shrink-0">
                                          <ChevronRight size={18} />
                                       </button>
                                    </div>
                                 </div>
                              ) : tool.status === 'active' ? (
                                 <button 
                                    onClick={() => handleConnectClick(tool)}
                                    disabled={!selectedClient}
                                    className={`w-full h-11 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                       selectedClient 
                                          ? "bg-[#1a1510] text-brand-gold shadow-xl hover:translate-y-[-1px] cursor-pointer" 
                                          : "bg-[#1a1510]/5 text-[#1a1510]/20 cursor-not-allowed border border-[#1a1510]/5"
                                    }`}
                                 >
                                    <LinkIcon size={14} /> Connect
                                 </button>
                              ) : (
                                 <div title={tool.status === 'comingSoon' ? "This integration is coming soon" : "This integration is currently disabled"}>
                                    <button 
                                       onClick={() => handleDisabledConnectClick(tool)}
                                       className="w-full h-11 rounded-xl sm:rounded-2xl bg-[#f7f8f9] text-[#1a1510]/30 border border-[#1a1510]/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-[#1a1510]/5"
                                    >
                                       <LinkIcon size={14} /> {tool.status === 'comingSoon' ? "Coming Soon" : "Disabled"}
                                    </button>
                                 </div>
                              )}
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </>
            )}
         </main>

         <ConnectModal
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
            tool={selectedTool}
            clientId={selectedClient?.id || ""}
            onSuccess={fetchData}
         />

         <AnimatePresence>
            {toastMessage && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 20 }} 
                  className="fixed bottom-10 right-10 bg-[#1a1510] text-white px-6 py-4 rounded-xl shadow-2xl z-50 text-[11px] font-black tracking-widest uppercase border border-white/10"
               >
                  {toastMessage}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
