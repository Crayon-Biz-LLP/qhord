"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, Filter, Mail, MessageSquare, Users, Calendar, ChevronRight,
   ChevronDown, Settings, Bell, Bot, Box, Sparkles, Send, Trash2,
   Archive, MoreVertical, Link, Check, User as UserIcon, LogOut,
   MoreHorizontal, Plus, ShieldCheck, Zap, DollarSign, Activity,
   ThumbsUp, ThumbsDown, Star, ExternalLink, RefreshCw, Smartphone,
   LayoutDashboard, ArchiveX, Reply, Clock, X, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Mock Data ---
const MESSAGES_DATA = [
   {
      id: 1,
      sender: "Sarah Chen",
      company: "Stripe",
      campaign: "Series B Fintech Outreach",
      time: "12m ago",
      body: "Hey, thanks for reaching out! I'd love to chat more about how you handle outbound. We're actually looking for a solution like this.",
      subject: "Re: Quick question about your stack",
      tags: ["positive", "interested"],
      tool: "Smartlead",
      unread: true,
      sentiment: "High Intent",
      avatar: "S"
   },
   {
      id: 2,
      sender: "Marcus Johnson",
      company: "Figma",
      campaign: "Enterprise SaaS Q1",
      time: "1h ago",
      body: "Interesting timing — we were just looking at solutions like yours. Can we discuss next week?",
      subject: "Re: Optimizing your GTM stack",
      tags: ["positive"],
      tool: "HeyReach",
      unread: true,
      sentiment: "Inquisitive",
      avatar: "M"
   },
   {
      id: 3,
      sender: "David Kim",
      company: "Linear",
      campaign: "Enterprise SaaS Q1",
      time: "2h ago",
      body: "Accepted your connection request and sent a message: \"Thanks for connecting, sounds interesting!\"",
      subject: "LinkedIn Connection",
      tags: ["positive"],
      tool: "LinkedIn",
      unread: true,
      sentiment: "Standard",
      avatar: "D"
   },
   {
      id: 4,
      sender: "Lisa Wang",
      company: "Vercel",
      campaign: "Product-Led Growth Targets",
      time: "5h ago",
      body: "Let me loop in our team lead on this. We have budget allocated for Q2.",
      subject: "Re: Scaling Vercel's outreach",
      tags: ["positive", "interested"],
      tool: "Smartlead",
      unread: false,
      sentiment: "High Intent",
      avatar: "L"
   }
];

const INBOX_KPIS = [
   { label: "UNREAD", value: "4", icon: Mail, change: "Need Attention", color: "text-blue-500", bg: "bg-blue-50", sparkline: [30, 40, 35, 50, 45, 60, 55, 70] },
   { label: "REPLY RATE", value: "2.4%", icon: Reply, change: "+0.8% MoM", color: "text-emerald-500", bg: "bg-emerald-50", sparkline: [40, 50, 45, 60, 55, 70, 65, 80] },
   { label: "MEETINGS", value: "6", icon: Calendar, change: "3 booked today", color: "text-brand-gold", bg: "bg-brand-gold/10", sparkline: [20, 30, 25, 40, 35, 50, 45, 60] },
   { label: "SENTIMENT", value: "Positive", icon: ThumbsUp, change: "82% Overall", color: "text-purple-500", bg: "bg-purple-50", sparkline: [60, 70, 65, 80, 75, 90, 85, 95] },
   { label: "RESPONSE", value: "14m", icon: Clock, change: "Sub-threshold", color: "text-[#1a1510]", bg: "bg-[#1a1510]/5", sparkline: [10, 20, 15, 25, 20, 35, 30, 45] },
];

export default function InboxPage() {
   const router = useRouter();
   const [selectedId, setSelectedId] = useState(1);
   const [activeTab, setActiveTab] = useState("All");
   const [mobileView, setMobileView] = useState<"list" | "detail">("list");

   const selectedMessage = MESSAGES_DATA.find(m => m.id === selectedId) || MESSAGES_DATA[0];

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                     <Mail size={18} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-sm font-bold tracking-tight text-[#1a1510] uppercase truncate">Unified Inbox</h2>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                        {MESSAGES_DATA.length} active threads
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-bold uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2">
                  <Send size={14} /> <span className="hidden xs:inline">Broadcast</span><span className="xs:hidden">Send</span>
               </button>
               <button
                  onClick={() => router.push('/dashboard')}
                  className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-bold uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         {/* 2. Main Operating Area */}
         <main className="flex-1 flex overflow-hidden relative">

            {/* Mobile-Responsive Sidebar/List */}
            <aside className={`${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[380px] border-r border-[#1a1510]/5 bg-white flex-col shrink-0 overflow-hidden`}>
               <div className="p-5 sm:p-6 pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-bold text-[#1a1510] uppercase tracking-widest">Live Feed</h3>
                     <button className="p-2 rounded-lg bg-[#f7f8f9] text-[#1a1510]/40"><Filter size={14} /></button>
                  </div>

                  <div className="relative group">
                     <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                     <input
                        type="text"
                        placeholder="Search threads..."
                        className="w-full h-10 pl-11 pr-4 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-medium focus:bg-white focus:outline-none transition-all"
                     />
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-[#f7f8f9] rounded-xl overflow-x-auto scrollbar-hide">
                     {["All", "Unread", "Intent"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`flex-1 py-2 px-4 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                 ? "bg-white text-[#1a1510] shadow-sm"
                                 : "text-[#1a1510]/30 hover:text-[#1a1510]"
                              }`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-4 space-y-1 pb-10">
                  {MESSAGES_DATA.map((m) => (
                     <motion.button
                        key={m.id}
                        onClick={() => {
                           setSelectedId(m.id);
                           setMobileView("detail");
                        }}
                        className={`w-full p-4 text-left rounded-2xl transition-all border ${selectedId === m.id
                              ? "bg-[#1a1510] border-[#1a1510] shadow-lg md:translate-x-1"
                              : "bg-white border-[#1a1510]/5 hover:bg-[#f7f8f9]"
                           }`}
                     >
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2 truncate">
                              <div className={`w-6 h-6 rounded-lg font-bold text-[9px] flex items-center justify-center shrink-0 ${selectedId === m.id ? "bg-brand-gold text-[#1a1510]" : "bg-[#f7f8f9] text-[#1a1510]/60"
                                 }`}>
                                 {m.avatar}
                              </div>
                              <h4 className={`text-[12px] font-bold truncate ${selectedId === m.id ? "text-white" : "text-[#1a1510]"}`}>{m.sender}</h4>
                           </div>
                           <span className={`text-[8px] font-bold shrink-0 ${selectedId === m.id ? "text-white/40" : "text-[#1a1510]/20"}`}>{m.time}</span>
                        </div>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 truncate ${selectedId === m.id ? "text-brand-gold/60" : "text-brand-gold"}`}>
                           {m.company}
                        </p>
                        <p className={`text-[11px] font-medium line-clamp-1 opacity-70 ${selectedId === m.id ? "text-white/60" : "text-[#1a1510]/60"}`}>
                           {m.body}
                        </p>
                     </motion.button>
                  ))}
               </div>
            </aside>

            {/* Message Content Area */}
            <section className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide bg-[#f7f8f9]`}>
               <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full pb-32">

                  {/* Back button for mobile */}
                  <button
                     onClick={() => setMobileView("list")}
                     className="md:hidden flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40 mb-2"
                  >
                     <ArrowLeft size={14} /> Back to Hub
                  </button>

                  {/* Metrics (Pills for mobile) */}
                  <section className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                     {INBOX_KPIS.map((kpi, i) => (
                        <div key={i} className={`bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#1a1510]/5 flex flex-col justify-between h-24 sm:h-28 min-w-[120px] md:min-w-0 flex-1 hover:shadow-md transition-all`}>
                           <div className="flex justify-between items-start">
                              <span className="text-[7px] font-bold text-[#1a1510]/30 tracking-widest uppercase truncate">{kpi.label}</span>
                              <div className={`p-1 rounded-md ${kpi.bg} ${kpi.color}`}>
                                 <kpi.icon size={10} />
                              </div>
                           </div>
                           <div>
                              <h4 className="text-base sm:text-lg font-bold text-[#1a1510] truncate">{kpi.value}</h4>
                              <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest mt-1 truncate">{kpi.change}</p>
                           </div>
                        </div>
                     ))}
                  </section>

                  {/* Message Details */}
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white rounded-[2rem] border border-[#1a1510]/5 shadow-sm overflow-hidden"
                  >
                     {/* Detail Header */}
                     <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-[#1a1510]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-lg font-bold shrink-0 shadow-lg">
                              {selectedMessage.avatar}
                           </div>
                           <div className="truncate">
                              <div className="flex items-center gap-2 truncate">
                                 <h2 className="text-lg sm:text-xl font-bold text-[#1a1510] tracking-tight truncate">{selectedMessage.sender}</h2>
                                 <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-widest shrink-0">{selectedMessage.tool}</span>
                              </div>
                              <p className="text-[10px] font-semibold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">{selectedMessage.company} • {selectedMessage.campaign}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                           <button className="h-10 w-10 min-w-[40px] rounded-xl border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510]/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                           <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-bold uppercase tracking-widest shadow-lg">
                              Manage Hub
                           </button>
                        </div>
                     </div>

                     {/* Message Body Content */}
                     <div className="p-5 sm:p-8 space-y-6">
                        <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5">
                           <div className="flex items-center gap-2 mb-4 border-b border-[#1a1510]/5 pb-3">
                              <Mail size={12} className="text-brand-gold" />
                              <p className="text-[9px] sm:text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest truncate">{selectedMessage.subject}</p>
                           </div>
                           <p className="text-[15px] sm:text-base font-medium text-[#1a1510] leading-relaxed italic">
                              &quot;{selectedMessage.body}&quot;
                           </p>
                        </div>

                        {/* AI intelligence Section */}
                        <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-3xl bg-[#1a1510] text-white relative group overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                              <Bot size={80} className="text-brand-gold" />
                           </div>
                           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="space-y-2">
                                 <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <Sparkles size={18} className="text-brand-gold" />
                                    <h4 className="text-base sm:text-lg font-bold tracking-tight uppercase">AI Suggestion</h4>
                                 </div>
                                 <p className="text-[10px] font-medium text-white/50 leading-relaxed uppercase tracking-widest text-center md:text-left">
                                    Intent: <span className="text-emerald-400 font-bold">{selectedMessage.sentiment}</span>. Respond based on expansion signals.
                                 </p>
                              </div>
                              <button className="w-full md:w-auto h-12 px-8 rounded-xl bg-brand-gold text-[#1a1510] text-[9px] font-bold uppercase tracking-widest shadow-lg hover:shadow-brand-gold/20 transition-all">
                                 Personalized Reply
                              </button>
                           </div>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-6 border-t border-[#1a1510]/5 space-y-4">
                           <p className="text-[8px] font-bold text-[#1a1510]/20 uppercase tracking-widest">Available Actions</p>
                           <div className="flex flex-wrap gap-2">
                              <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"><ThumbsUp size={12} /> Interested</button>
                              <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"><Calendar size={12} /> Book Meet</button>
                              <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"><ExternalLink size={12} /> CRM Sync</button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </div>
            </section>
         </main>
      </div>
   );
}
