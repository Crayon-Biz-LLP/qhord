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
import { Loader } from "../../../components/ui/Loader";
import { ToolsIcon } from "../../../components/ui/icons/ToolsIcon";

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
         <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                     <ToolsIcon size={16} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase truncate">Tools</h2>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Connect your GTM stack</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
               <div className="relative group hidden md:block">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search tools…"
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

         <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide pb-32">
            {loading ? (
               <div className="flex-1 flex items-center justify-center py-40">
                  <div className="flex flex-col items-center gap-4">
                     <Loader size={40} />
                     <p className="text-[13px] font-medium text-[#1a1510]/40">Loading tools…</p>
                  </div>
               </div>
            ) : (
               <>
                  {/* 2. Category Rail */}
                  <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#1a1510]/[0.07] w-fit overflow-x-auto scrollbar-hide max-w-full">
                     {CATEGORIES.slice(0, 5).map((cat) => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`h-9 px-4 sm:px-5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === cat
                              ? "bg-[#1a1510] text-white"
                              : "text-[#1a1510]/35 hover:text-[#1a1510]/60"
                              }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>

                  {!selectedClient && (
                     <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[13px] font-medium flex items-center gap-3">
                        <Shield className="text-amber-600 shrink-0" size={17} />
                        <span>Select a client to connect tools.</span>
                     </div>
                  )}

                  {/* 3. Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
                     {filteredTools.map((tool, idx) => (
                        <motion.div
                           key={tool.id}
                           initial={{ opacity: 0, y: 12 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3, delay: idx * 0.03 }}
                           className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-5 flex flex-col group shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:border-[#1a1510]/15 transition-all"
                        >
                           {/* Card Header */}
                           <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className="w-11 h-11 rounded-xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/50 shrink-0">
                                    <tool.icon size={20} />
                                 </div>
                                 <div className="min-w-0">
                                    <h3 className="text-[15px] font-semibold text-[#1a1510] tracking-tight leading-none mb-1.5 truncate">{tool.name}</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                       <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide bg-[#f7f8f9] text-[#1a1510]/45">
                                          {tool.category}
                                       </span>
                                       {tool.status === 'comingSoon' && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide bg-amber-50 text-amber-600">
                                             Soon
                                          </span>
                                       )}
                                       {tool.status === 'disabled' && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide bg-red-50 text-red-600">
                                             Disabled
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              {tool.isConnected && (
                                 <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 shrink-0 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                                 </span>
                              )}
                           </div>

                           {/* Description */}
                           <p className="text-[13px] text-[#1a1510]/45 leading-relaxed line-clamp-2 mt-4 flex-1">
                              {tool.description}
                           </p>

                           {/* Action */}
                           <div className="mt-5">
                              {tool.isConnected ? (
                                 <div className="flex gap-2">
                                    <button className="btn-shine btn-shine-dark flex-1 h-10 rounded-none border border-[#1a1510]/10 text-[#1a1510] text-xs font-semibold hover:bg-[#1a1510]/[0.02] transition-colors">
                                       Manage
                                    </button>
                                    <button className="w-10 h-10 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] flex items-center justify-center text-[#1a1510]/40 hover:text-[#1a1510] transition-colors shrink-0">
                                       <ChevronRight size={17} />
                                    </button>
                                 </div>
                              ) : tool.status === 'active' ? (
                                 <button
                                    onClick={() => handleConnectClick(tool)}
                                    disabled={!selectedClient}
                                    className={`w-full h-10 rounded-none text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                                       selectedClient
                                          ? "btn-shine bg-[#1a1510] text-white hover:bg-[#2a2118] cursor-pointer"
                                          : "bg-[#f7f8f9] text-[#1a1510]/25 cursor-not-allowed border border-[#1a1510]/[0.07]"
                                    }`}
                                 >
                                    <LinkIcon size={14} /> Connect
                                 </button>
                              ) : (
                                 <button
                                    onClick={() => handleDisabledConnectClick(tool)}
                                    className="w-full h-10 rounded-none bg-[#f7f8f9] text-[#1a1510]/35 border border-[#1a1510]/[0.07] text-xs font-semibold flex items-center justify-center gap-2 cursor-default"
                                 >
                                    {tool.status === 'comingSoon' ? "Coming Soon" : "Disabled"}
                                 </button>
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
