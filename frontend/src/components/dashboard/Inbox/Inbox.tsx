"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Mail, MessageSquare, Users, Calendar, ChevronRight, 
  ChevronDown, Settings, Bell, Bot, Box, Sparkles, Send, Trash2, 
  Archive, MoreVertical, Link, Check, User as UserIcon, LogOut, 
  MoreHorizontal, Plus, ShieldCheck, Zap, DollarSign, Activity,
  ThumbsUp, ThumbsDown, Star, ExternalLink, RefreshCw, Smartphone,
  LayoutDashboard, ArchiveX, Reply, Clock
} from "lucide-react";

interface InboxProps {
  onBackToDashboard: () => void;
}

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

export const Inbox = ({ onBackToDashboard }: InboxProps) => {
  const [selectedId, setSelectedId] = useState(1);
  const [activeTab, setActiveTab] = useState("All");

  const selectedMessage = MESSAGES_DATA.find(m => m.id === selectedId) || MESSAGES_DATA[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      
      {/* 1. Consolidated Header */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg">
                <Mail size={18} />
             </div>
             <div>
                <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase">Unified Inbox</h2>
                <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                   {MESSAGES_DATA.length} active threads across 4 channels
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="h-10 px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-3">
            <Send size={14} /> New Broadcast
          </button>
          <button 
            onClick={onBackToDashboard}
            className="h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
          >
            <LayoutDashboard size={14} /> Back to Hub
          </button>
        </div>
      </nav>

      {/* 2. Main Operating Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Message List - REDUCED WIDTH & COMPACT CARDS */}
        <aside className="w-[380px] border-r border-[#1a1510]/5 bg-white flex flex-col shrink-0 overflow-hidden">
           <div className="p-6 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-[#1a1510] uppercase tracking-[0.2em]">Live Feed</h3>
                 <button className="p-2 rounded-lg bg-[#f7f8f9] text-[#1a1510]/40"><Filter size={14} /></button>
              </div>

              <div className="relative group">
                 <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                 <input 
                    type="text" 
                    placeholder="Search intelligence..." 
                    className="w-full h-10 pl-11 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/5 text-xs font-medium focus:ring-1 focus:ring-brand-gold/10 outline-none transition-all"
                 />
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#f7f8f9] rounded-xl">
                {["All", "Unread", "Intent"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab 
                      ? "bg-white text-[#1a1510] shadow-sm" 
                      : "text-[#1a1510]/30 hover:text-[#1a1510]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
           </div>

           {/* Message Rail - REFINED NODE SIZE */}
           <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-1 pb-10">
              {MESSAGES_DATA.map((m) => (
                 <motion.button 
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full p-4 text-left rounded-2xl transition-all border ${
                       selectedId === m.id 
                       ? "bg-[#1a1510] border-[#1a1510] shadow-lg translate-x-1" 
                       : "bg-white border-[#1a1510]/5 hover:bg-[#f7f8f9]"
                    }`}
                 >
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg font-black text-[9px] flex items-center justify-center ${
                             selectedId === m.id ? "bg-brand-gold text-[#1a1510]" : "bg-[#f7f8f9] text-[#1a1510]/60"
                          }`}>
                             {m.avatar}
                          </div>
                          <h4 className={`text-[12px] font-black ${selectedId === m.id ? "text-white" : "text-[#1a1510]"}`}>{m.sender}</h4>
                       </div>
                       <span className={`text-[8px] font-bold ${selectedId === m.id ? "text-white/40" : "text-[#1a1510]/20"}`}>{m.time}</span>
                    </div>
                    
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedId === m.id ? "text-brand-gold/60" : "text-brand-gold"}`}>
                       {m.company}
                    </p>
                    <p className={`text-[11px] font-medium line-clamp-1 opacity-70 ${selectedId === m.id ? "text-white/60" : "text-[#1a1510]/60"}`}>
                       {m.body}
                    </p>
                    
                    {m.sentiment === "High Intent" && (
                       <div className="mt-2">
                          <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                             selectedId === m.id ? "bg-white/10 text-white" : "bg-[#f7f8f9] text-[#1a1510]/40"
                          }`}>
                             {m.sentiment}
                          </span>
                       </div>
                    )}
                 </motion.button>
              ))}
           </div>
        </aside>

        {/* Right Section: View & Metrics - REFINED SPACING */}
        <section className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide bg-[#f7f8f9]">
           <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
              
              {/* 3. Metric Ribbon - COMPACT */}
              <section className="grid grid-cols-5 gap-4">
                 {INBOX_KPIS.map((kpi, i) => (
                    <div key={i} className="bg-white p-4 rounded-3xl border border-[#1a1510]/5 flex flex-col justify-between h-28 hover:shadow-md transition-all">
                       <div className="flex justify-between items-start">
                          <span className="text-[7px] font-black text-[#1a1510]/30 tracking-[0.2em] uppercase">{kpi.label}</span>
                          <div className={`p-1 rounded-md ${kpi.bg} ${kpi.color}`}>
                             <kpi.icon size={10} />
                          </div>
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-[#1a1510] tracking-tighter leading-none">{kpi.value}</h4>
                          <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{kpi.change}</p>
                       </div>
                       <div className="h-3 flex items-end gap-[2px] mt-1.5 opacity-10">
                          {kpi.sparkline.map((val, idx) => (
                             <div key={idx} className="flex-1 bg-brand-gold rounded-full" style={{ height: `${val}%` }} />
                          ))}
                       </div>
                    </div>
                 ))}
              </section>

              {/* Message Details Card - CLEANER ALIGNMENT */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.99 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white rounded-[2rem] border border-[#1a1510]/5 shadow-sm overflow-hidden"
              >
                 {/* Detail Header */}
                 <div className="px-8 py-6 border-b border-[#1a1510]/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-xl font-black shadow-lg">
                          {selectedMessage.avatar}
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <h2 className="text-xl font-black text-[#1a1510] tracking-tight">{selectedMessage.sender}</h2>
                             <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest">{selectedMessage.tool}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-[#1a1510]/30 uppercase tracking-[0.15em] mt-0.5">{selectedMessage.company} • {selectedMessage.campaign}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="h-10 w-10 rounded-xl border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510]/20 hover:text-[#1a1510] transition-colors"><Trash2 size={16} /></button>
                       <button className="h-10 w-10 rounded-xl border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510]/20 hover:text-[#1a1510] transition-colors"><Archive size={16} /></button>
                       <button className="h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                          Manage Hub
                       </button>
                    </div>
                 </div>

                 {/* Message Body Content */}
                 <div className="p-8 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 relative">
                       <div className="flex items-center gap-2 mb-4 border-b border-[#1a1510]/5 pb-3">
                          <Mail size={12} className="text-brand-gold" />
                          <p className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest">{selectedMessage.subject}</p>
                       </div>
                       <p className="text-base font-medium text-[#1a1510] leading-relaxed">
                          {selectedMessage.body}
                       </p>
                    </div>

                    {/* AI intelligence Section - REFINED SIZE */}
                    <div className="p-8 rounded-3xl bg-[#1a1510] text-white relative group overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-5 -translate-y-4 translate-x-4 group-hover:scale-105 transition-transform duration-700">
                          <Bot size={140} className="text-brand-gold" />
                       </div>
                       <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-gold text-[#1a1510] rounded-xl shadow-lg shadow-brand-gold/10">
                                   <Sparkles size={18} />
                                </div>
                                <h4 className="text-lg font-black tracking-tight">AI OS Suggestion</h4>
                             </div>
                             <p className="text-[11px] font-medium text-white/50 leading-relaxed max-w-sm uppercase tracking-widest">
                                Intent: <span className="text-emerald-400 font-bold">{selectedMessage.sentiment}</span>. Personalize draft based on <span className="text-brand-gold italic">Stripe's</span> recent expansion.
                             </p>
                          </div>
                          <button className="h-12 px-8 rounded-xl bg-brand-gold text-[#1a1510] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-brand-gold/20 transition-all whitespace-nowrap">
                             Craft Personalized Reply
                          </button>
                       </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-6 border-t border-[#1a1510]/5 space-y-4">
                       <p className="text-[8px] font-black text-[#1a1510]/20 uppercase tracking-[0.3em]">Operational Assembly</p>
                       <div className="flex flex-wrap gap-2">
                          <button className="h-11 px-6 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all"><ThumbsUp size={14} /> Interested</button>
                          <button className="h-11 px-6 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"><Calendar size={14} /> Calendly</button>
                          <button className="h-11 px-6 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"><ExternalLink size={14} /> Push to CRM</button>
                          <button className="h-11 px-6 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"><ArchiveX size={14} /> Not Interested</button>
                       </div>
                    </div>
                 </div>
              </motion.div>
              
              <div className="h-20" />
           </div>
        </section>
      </main>
    </div>
  );
};
