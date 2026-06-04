"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Mail, MessageSquare, Users, Calendar, ChevronRight, 
  ChevronDown, Settings, Bell, Bot, Box, Sparkles, Send, Trash2, 
  Archive, MoreVertical, Link, Check, User as UserIcon, LogOut, 
  MoreHorizontal, Plus, ShieldCheck, Zap, DollarSign, Activity,
  ThumbsUp, ThumbsDown, Star, ExternalLink, RefreshCw, Smartphone,
  LayoutDashboard, ArchiveX, Reply, Clock, X, ArrowLeft, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";

interface InboxMessageItem {
  id: string;
  sender: string;
  company: string;
  campaign: string;
  subject: string;
  body: string;
  tags: string[];
  tool: string;
  unread: boolean;
  sentiment: string;
  avatar: string;
  created_at: string;
}

export default function InboxPage() {
  const router = useRouter();
  const { selectedClient } = useClient();
  const [messages, setMessages] = useState<InboxMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  
  // Broadcast composing state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [newSender, setNewSender] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCampaign, setNewCampaign] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTool, setNewTool] = useState("Smartlead");
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!selectedClient) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/inbox?clientId=${selectedClient.id}`);
      if (res.data.success) {
        const fetched: InboxMessageItem[] = (res.data.messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender,
          company: m.company,
          campaign: m.campaign,
          subject: m.subject,
          body: m.body,
          tags: Array.isArray(m.tags) ? m.tags : JSON.parse(m.tags || "[]"),
          tool: m.tool,
          unread: m.unread,
          sentiment: m.sentiment,
          avatar: m.avatar || m.sender.charAt(0).toUpperCase(),
          created_at: m.created_at
        }));
        setMessages(fetched);
        
        // Select the first message by default if none selected
        if (fetched.length > 0 && !selectedId) {
          setSelectedId(fetched[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch inbox messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedClient]);

  // Mark selected message as read
  useEffect(() => {
    if (!selectedId) return;
    const msg = messages.find(m => m.id === selectedId);
    if (msg && msg.unread) {
      api.put(`/inbox/${selectedId}/read`, { unread: false })
        .then(res => {
          if (res.data.success) {
            setMessages(prev => prev.map(m => m.id === selectedId ? { ...m, unread: false } : m));
          }
        })
        .catch(err => console.error("Error marking read:", err));
    }
  }, [selectedId, messages]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newSender || !newSubject || !newBody) return;
    setSending(true);
    try {
      const res = await api.post("/inbox", {
        sender: newSender,
        company: newCompany,
        campaign: newCampaign || "Outbound Broadcast",
        subject: newSubject,
        body: newBody,
        tool: newTool,
        tags: ["broadcast"],
        sentiment: "Broadcast",
        avatar: newSender.charAt(0).toUpperCase(),
        clientId: selectedClient.id,
        unread: false
      });
      if (res.data.success) {
        const m = res.data.message;
        const newMsg: InboxMessageItem = {
          id: m.id,
          sender: m.sender,
          company: m.company,
          campaign: m.campaign,
          subject: m.subject,
          body: m.body,
          tags: Array.isArray(m.tags) ? m.tags : JSON.parse(m.tags || "[]"),
          tool: m.tool,
          unread: m.unread,
          sentiment: m.sentiment,
          avatar: m.avatar || m.sender.charAt(0).toUpperCase(),
          created_at: m.created_at
        };
        setMessages(prev => [newMsg, ...prev]);
        setSelectedId(newMsg.id);
        setIsBroadcastOpen(false);
        setNewSender("");
        setNewCompany("");
        setNewCampaign("");
        setNewSubject("");
        setNewBody("");
      }
    } catch (err) {
      console.error("Failed to send broadcast:", err);
    } finally {
      setSending(false);
    }
  };

  const selectedMessage = useMemo(() => {
    return messages.find(m => m.id === selectedId) || null;
  }, [messages, selectedId]);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch = 
        m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.body.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesTab = 
        activeTab === "All" ||
        (activeTab === "Unread" && m.unread) ||
        (activeTab === "Intent" && m.tags.includes("interested"));
        
      return matchesSearch && matchesTab;
    });
  }, [messages, searchQuery, activeTab]);

  const unreadCount = useMemo(() => {
    return messages.filter(m => m.unread).length;
  }, [messages]);

  const kpis = useMemo(() => {
    return [
      { label: "UNREAD", value: unreadCount, icon: Mail, change: "Need Attention", color: "text-blue-500", bg: "bg-blue-50" },
      { label: "REPLY RATE", value: "11.2%", icon: Reply, change: "+2.4% MoM", color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "MEETINGS", value: "3", icon: Calendar, change: "Active scheduling", color: "text-brand-gold", bg: "bg-brand-gold/10" },
      { label: "SENTIMENT", value: "Positive", icon: ThumbsUp, change: "Strong Intent", color: "text-purple-500", bg: "bg-purple-50" },
      { label: "RESPONSE", value: "8m", icon: Clock, change: "Average SLA", color: "text-[#1a1510]", bg: "bg-[#1a1510]/5" },
    ];
  }, [unreadCount]);

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
                <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Unified Inbox</h2>
                <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                   {selectedClient ? `${selectedClient.name} • ${messages.length} active threads` : "Unified Inbox"}
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={!selectedClient}
            onClick={() => setIsBroadcastOpen(true)}
            className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-brand-gold text-[10px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2 disabled:opacity-55"
          >
            <Send size={14} /> <span className="hidden xs:inline">Broadcast</span><span className="xs:hidden">Send</span>
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
          >
            <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      {/* 2. Main Operating Area */}
      {!selectedClient ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
           <Mail size={48} className="text-[#1a1510]/10 mb-4" />
           <p className="text-sm font-bold text-[#1a1510]/40">Please select or establish a Client node first.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
           <Loader2 className="animate-spin text-brand-gold" size={32} />
        </div>
      ) : (
        <main className="flex-1 flex overflow-hidden relative">
          
          {/* Mobile-Responsive Sidebar/List */}
          <aside className={`${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[380px] border-r border-[#1a1510]/5 bg-white flex-col shrink-0 overflow-hidden`}>
             <div className="p-5 sm:p-6 pb-4 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-[#1a1510] uppercase tracking-widest">Live Feed</h3>
                   <button onClick={fetchMessages} className="p-2 rounded-lg bg-[#f7f8f9] text-[#1a1510]/40"><RefreshCw size={14} /></button>
                </div>

                <div className="relative group">
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 group-focus-within:text-brand-gold transition-colors" />
                   <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search threads..." 
                      className="w-full h-10 pl-11 pr-4 rounded-xl bg-[#f7f8f9] border border-transparent text-xs font-medium focus:bg-white focus:outline-none transition-all"
                   />
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#f7f8f9] rounded-xl overflow-x-auto scrollbar-hide">
                  {["All", "Unread", "Intent"].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-4 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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

             <div className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-4 space-y-1 pb-10">
                {filteredMessages.length === 0 ? (
                   <p className="text-center text-[10px] text-[#1a1510]/30 py-8">No messages found.</p>
                ) : (
                   filteredMessages.map((m) => (
                      <motion.button 
                         key={m.id}
                         onClick={() => {
                             setSelectedId(m.id);
                             setMobileView("detail");
                         }}
                         className={`w-full p-4 text-left rounded-2xl transition-all border ${
                            selectedId === m.id 
                            ? "bg-[#1a1510] border-[#1a1510] shadow-lg md:translate-x-1" 
                            : "bg-white border-[#1a1510]/5 hover:bg-[#f7f8f9]"
                         }`}
                      >
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 truncate">
                               <div className={`w-6 h-6 rounded-lg font-black text-[9px] flex items-center justify-center shrink-0 ${
                                  selectedId === m.id ? "bg-brand-gold text-[#1a1510]" : "bg-[#f7f8f9] text-[#1a1510]/60"
                                  } ${m.unread ? "ring-2 ring-blue-500" : ""}`}>
                                  {m.avatar}
                               </div>
                               <h4 className={`text-[12px] font-black truncate ${selectedId === m.id ? "text-white" : "text-[#1a1510]"}`}>{m.sender}</h4>
                            </div>
                            {m.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                         </div>
                         <p className={`text-[9px] font-black uppercase tracking-widest mb-1 truncate ${selectedId === m.id ? "text-brand-gold/60" : "text-brand-gold"}`}>
                            {m.company}
                         </p>
                         <p className={`text-[11px] font-medium line-clamp-1 opacity-70 ${selectedId === m.id ? "text-white/60" : "text-[#1a1510]/60"}`}>
                            {m.body}
                         </p>
                      </motion.button>
                   ))
                )}
             </div>
          </aside>

          {/* Message Content Area */}
          <section className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide bg-[#f7f8f9]`}>
             {selectedMessage ? (
                <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full pb-32">
                   
                   {/* Back button for mobile */}
                   <button 
                     onClick={() => setMobileView("list")}
                     className="md:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40 mb-2"
                   >
                       <ArrowLeft size={14} /> Back to Hub
                   </button>

                   {/* Metrics */}
                   <section className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                      {kpis.map((kpi, i) => (
                         <div key={i} className={`bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#1a1510]/5 flex flex-col justify-between h-24 sm:h-28 min-w-[120px] md:min-w-0 flex-1 hover:shadow-md transition-all`}>
                            <div className="flex justify-between items-start">
                               <span className="text-[7px] font-black text-[#1a1510]/30 tracking-widest uppercase truncate">{kpi.label}</span>
                               <div className={`p-1 rounded-md ${kpi.bg} ${kpi.color}`}>
                                  <kpi.icon size={10} />
                               </div>
                            </div>
                            <div>
                               <h4 className="text-base sm:text-lg font-black text-[#1a1510] truncate">{kpi.value}</h4>
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
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-lg font-black shrink-0 shadow-lg">
                               {selectedMessage.avatar}
                            </div>
                            <div className="truncate">
                               <div className="flex items-center gap-2 truncate">
                                  <h2 className="text-lg sm:text-xl font-black text-[#1a1510] tracking-tight truncate">{selectedMessage.sender}</h2>
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest shrink-0">{selectedMessage.tool}</span>
                               </div>
                               <p className="text-[10px] font-semibold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">{selectedMessage.company} • {selectedMessage.campaign}</p>
                            </div>
                         </div>
                         <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold text-[9px] font-black uppercase tracking-widest shadow-lg hover:translate-y-[-1px] transition-all" onClick={() => router.push('/dashboard/campaigns')}>
                               Manage Campaign
                            </button>
                         </div>
                      </div>

                      {/* Message Body Content */}
                      <div className="p-5 sm:p-8 space-y-6">
                         <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5">
                            <div className="flex items-center gap-2 mb-4 border-b border-[#1a1510]/5 pb-3">
                               <Mail size={12} className="text-brand-gold" />
                               <p className="text-[9px] sm:text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest truncate">{selectedMessage.subject}</p>
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
                                     <h4 className="text-base sm:text-lg font-black tracking-tight uppercase">AI Suggestion</h4>
                                  </div>
                                  <p className="text-[10px] font-medium text-white/50 leading-relaxed uppercase tracking-widest text-center md:text-left">
                                     Intent Sentiment: <span className="text-emerald-400 font-bold">{selectedMessage.sentiment}</span>. Suggested next step: Schedule meeting.
                                  </p>
                                </div>
                                <button className="w-full md:w-auto h-12 px-8 rounded-xl bg-brand-gold text-[#1a1510] text-[9px] font-black uppercase tracking-widest shadow-lg hover:shadow-brand-gold/20 transition-all">
                                   Personalized Reply
                                </button>
                            </div>
                         </div>

                         {/* Action Bar */}
                         <div className="pt-6 border-t border-[#1a1510]/5 space-y-4">
                            <p className="text-[8px] font-black text-[#1a1510]/20 uppercase tracking-widest">Available Actions</p>
                            <div className="flex flex-wrap gap-2">
                               <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"><ThumbsUp size={12} /> Interested</button>
                               <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl border border-[#1a1510]/10 text-[#1a1510] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"><Calendar size={12} /> Book Meet</button>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center m-auto">
                   <Mail size={48} className="text-[#1a1510]/10 mb-4" />
                   <p className="text-sm font-bold text-[#1a1510]/40">Select a thread to view conversations.</p>
                </div>
             )}
          </section>
        </main>
      )}

      {/* Compose Broadcast Modal */}
      <AnimatePresence>
         {isBroadcastOpen && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBroadcastOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-[500px] h-fit bg-white rounded-[2rem] shadow-2xl z-[201] p-6 sm:p-8">
                  <form onSubmit={handleBroadcast} className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-[#1a1510]">Compose Outbound Broadcast</h2>
                        <button type="button" onClick={() => setIsBroadcastOpen(false)} className="p-2 hover:bg-[#f7f8f9] rounded-xl"><X size={18} /></button>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Sender Identity</label>
                           <input required type="text" value={newSender} onChange={(e) => setNewSender(e.target.value)} placeholder="e.g. Sarah Chen" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Company Name</label>
                              <input type="text" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Stripe" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Outbound Channel / Tool</label>
                              <select value={newTool} onChange={(e) => setNewTool(e.target.value)} className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold">
                                 <option value="Smartlead">Smartlead</option>
                                 <option value="HeyReach">HeyReach</option>
                                 <option value="LinkedIn">LinkedIn</option>
                                 <option value="Gmail">Gmail</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Campaign Name</label>
                           <input type="text" value={newCampaign} onChange={(e) => setNewCampaign(e.target.value)} placeholder="e.g. Series B Fintech Outreach" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none text-xs font-bold" />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Subject Line</label>
                           <input required type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Re: Quick question about your stack" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Message Body</label>
                           <textarea required value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Write your personalized broadcast content..." className="w-full min-h-[100px] p-4 bg-[#f7f8f9] rounded-xl outline-none focus:ring-2 ring-blue-500/10 text-xs font-bold" />
                        </div>
                     </div>

                     <div className="flex gap-3 pt-4 border-t border-[#1a1510]/5">
                        <button type="button" onClick={() => setIsBroadcastOpen(false)} className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase">Cancel</button>
                        <button type="submit" disabled={sending} className="flex-1 h-12 bg-[#1a1510] text-brand-gold rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2">
                           {sending ? <Loader2 className="animate-spin" size={14} /> : <> <Send size={14} /> Send Broadcast </>}
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
