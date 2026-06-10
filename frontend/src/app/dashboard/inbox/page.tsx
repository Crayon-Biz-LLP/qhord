"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search, RefreshCw, Send, Loader2, ArrowLeft, ChevronDown,
  AlertCircle, LayoutDashboard, MessageSquare, Plug
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";
import { InboxIcon } from "../../../components/ui/icons/InboxIcon";

interface Conversation {
  id: string;
  toolId: string;
  sourcePlatform: string;
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  campaignName?: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  canSend: boolean;
}

interface Message {
  id: string;
  direction: "incoming" | "outgoing";
  sender?: string;
  recipient?: string;
  body: string;
  status: string;
  sentAt?: string;
}

const CONVERSATION_STATUSES = [
  "New Reply",
  "Needs Response",
  "Replied",
  "AI Draft Ready",
  "Closed",
  "Failed",
];

const statusStyle = (status: string) => {
  switch (status) {
    case "New Reply": return "bg-blue-50 text-blue-600";
    case "Needs Response": return "bg-amber-50 text-amber-600";
    case "Replied": return "bg-emerald-50 text-emerald-600";
    case "AI Draft Ready": return "bg-violet-50 text-violet-600";
    case "Closed": return "bg-[#1a1510]/5 text-[#1a1510]/50";
    case "Failed": return "bg-red-50 text-red-600";
    default: return "bg-[#1a1510]/5 text-[#1a1510]/50";
  }
};

const msgStatusStyle = (status: string) => {
  switch (status) {
    case "Failed": return "text-red-500";
    case "Sending": return "text-[#1a1510]/40";
    case "Sent":
    case "Delivered":
    case "Read": return "text-emerald-600";
    default: return "text-[#1a1510]/40";
  }
};

export default function InboxPage() {
  const router = useRouter();
  const { selectedClient } = useClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hasIntegrations, setHasIntegrations] = useState(true);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [toast, setToast] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  // --- Data loading ---
  const fetchConversations = async (autoSelect = true) => {
    if (!selectedClient) {
      setConversations([]);
      setHasIntegrations(false);
      setLoadingConvos(false);
      return;
    }
    try {
      const res = await api.get(`/clients/${selectedClient.id}/inbox/conversations`);
      if (res.data.success) {
        setConversations(res.data.conversations || []);
        setHasIntegrations(res.data.hasIntegrations);
        if (autoSelect && res.data.conversations?.length && !selectedId) {
          setSelectedId(res.data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  const loadInbox = async () => {
    if (!selectedClient) {
      setConversations([]);
      setHasIntegrations(false);
      setLoadingConvos(false);
      return;
    }
    setLoadingConvos(true);
    // pull latest replies on page load (Phase 1: mock sync), then fetch
    try {
      await api.post(`/clients/${selectedClient.id}/inbox/sync`);
    } catch {
      /* sync is best-effort on load */
    }
    await fetchConversations();
    setLoadingConvos(false);
  };

  useEffect(() => {
    setSelectedId(null);
    setMessages([]);
    loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  const fetchMessages = async (conversationId: string) => {
    if (!selectedClient) return;
    setLoadingThread(true);
    setSendError(null);
    try {
      const res = await api.get(
        `/clients/${selectedClient.id}/inbox/conversations/${conversationId}/messages`
      );
      if (res.data.success) {
        setMessages(res.data.messages || []);
        // mark read locally
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (selectedId) fetchMessages(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const handleSync = async () => {
    if (!selectedClient || syncing) return;
    setSyncing(true);
    try {
      const res = await api.post(`/clients/${selectedClient.id}/inbox/sync`);
      if (res.data.success) {
        setHasIntegrations(res.data.hasIntegrations);
        await fetchConversations(false);
        if (selectedId) await fetchMessages(selectedId);
        showToast(
          res.data.hasIntegrations
            ? `Synced — ${res.data.syncedConversations} new conversation(s), ${res.data.newMessages} new message(s)`
            : "No inbox integrations connected for this client."
        );
      }
    } catch (err) {
      console.error("Sync failed", err);
      showToast("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSend = async () => {
    if (!selectedClient || !selectedConversation || !reply.trim() || sending) return;
    setSending(true);
    setSendError(null);
    const bodyText = reply.trim();
    try {
      const res = await api.post(
        `/clients/${selectedClient.id}/inbox/conversations/${selectedConversation.id}/send`,
        { body: bodyText }
      );
      if (res.data.success) {
        setReply("");
        await fetchMessages(selectedConversation.id);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: bodyText, status: "Replied", lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        setSendError(res.data.error || "Failed to send reply");
      }
    } catch (err: any) {
      setSendError(err?.response?.data?.error || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedClient || !selectedConversation) return;
    try {
      await api.patch(
        `/clients/${selectedClient.id}/inbox/conversations/${selectedConversation.id}/status`,
        { status }
      );
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, status } : c))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredConversations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        !q ||
        c.contactName?.toLowerCase().includes(q) ||
        c.companyName?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q) ||
        c.sourcePlatform?.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const initials = (c: Conversation) =>
    (c.contactName || c.contactEmail || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      {/* Header */}
      <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
            <InboxIcon size={16} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Unified Inbox</h2>
            <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">
              {selectedClient ? `${selectedClient.name} · ${conversations.length} conversations` : "Unified Inbox"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={!selectedClient || syncing}
            onClick={handleSync}
            className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            <span className="hidden xs:inline">{syncing ? "Syncing…" : "Sync"}</span>
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
          >
            <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      {!selectedClient ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-4"><InboxIcon size={26} /></div>
          <p className="text-[15px] font-semibold text-[#1a1510]">Select a client first</p>
          <p className="text-[13px] text-[#1a1510]/40 mt-1">Choose a client to view their unified inbox.</p>
        </div>
      ) : loadingConvos ? (
        <div className="flex-1 flex items-center justify-center"><Loader size={36} /></div>
      ) : !hasIntegrations ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-4"><Plug size={26} /></div>
          <p className="text-[15px] font-semibold text-[#1a1510]">No inbox integrations connected for this client.</p>
          <p className="text-[13px] text-[#1a1510]/40 mt-1 max-w-xs">Connect Smartlead, Instantly, HeyReach, or HubSpot in Tools to start receiving replies here.</p>
          <button
            onClick={() => router.push("/dashboard/tools")}
            className="btn-shine mt-6 h-10 px-6 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
          >
            <Plug size={14} /> Connect a tool
          </button>
        </div>
      ) : (
        <main className="flex-1 flex overflow-hidden relative">
          {/* Conversation list */}
          <aside className={`${mobileView === "detail" ? "hidden md:flex" : "flex"} w-full md:w-[320px] lg:w-[380px] border-r border-[#1a1510]/[0.07] bg-white flex-col shrink-0 overflow-hidden`}>
            <div className="p-4 sm:p-5 pb-3 space-y-3">
              <h3 className="text-[13px] font-semibold text-[#1a1510] tracking-tight">Conversations</h3>
              <div className="relative group">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/25 group-focus-within:text-brand-gold transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/25"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-4 space-y-1.5 pb-10">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center text-center py-16 px-6">
                  <div className="w-12 h-12 rounded-xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-3"><MessageSquare size={22} /></div>
                  <p className="text-[13px] font-semibold text-[#1a1510]/60">No conversations yet</p>
                  <p className="text-[12px] text-[#1a1510]/35 mt-0.5">Click Sync to pull the latest replies.</p>
                </div>
              ) : (
                filteredConversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setMobileView("detail"); }}
                    className={`w-full p-3.5 text-left rounded-xl transition-all border ${
                      selectedId === c.id
                        ? "bg-[#1a1510] border-[#1a1510]"
                        : "bg-white border-[#1a1510]/[0.07] hover:bg-[#fafafa] hover:border-[#1a1510]/15"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-6 h-6 rounded-lg font-semibold text-[10px] flex items-center justify-center shrink-0 ${selectedId === c.id ? "bg-brand-gold text-[#1a1510]" : "bg-[#f7f8f9] text-[#1a1510]/60"} ${c.unreadCount > 0 ? "ring-2 ring-blue-500" : ""}`}>
                          {initials(c)}
                        </div>
                        <h4 className={`text-[13px] font-semibold truncate ${selectedId === c.id ? "text-white" : "text-[#1a1510]"}`}>{c.contactName || c.contactEmail || "Unknown"}</h4>
                      </div>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0 ${selectedId === c.id ? "bg-white/10 text-white/70" : "bg-[#f7f8f9] text-[#1a1510]/45"}`}>{c.sourcePlatform}</span>
                    </div>
                    <p className={`text-[12px] font-medium line-clamp-1 ${selectedId === c.id ? "text-white/55" : "text-[#1a1510]/55"}`}>{c.lastMessage || "—"}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${selectedId === c.id ? "bg-white/10 text-white/70" : statusStyle(c.status)}`}>{c.status}</span>
                      {c.unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Thread + composer */}
          <section className={`${mobileView === "list" ? "hidden md:flex" : "flex"} flex-1 flex flex-col min-w-0 bg-[#f7f8f9]`}>
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center m-auto px-6">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#1a1510]/[0.07] text-[#1a1510]/25 flex items-center justify-center mb-4 shadow-[0_1px_2px_rgba(26,21,16,0.04)]"><InboxIcon size={28} /></div>
                <p className="text-[15px] font-semibold text-[#1a1510]">Select a conversation</p>
                <p className="text-[13px] text-[#1a1510]/40 mt-1">Choose a conversation from the left to view and reply.</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="shrink-0 bg-white border-b border-[#1a1510]/[0.07] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setMobileView("list")} className="md:hidden text-[#1a1510]/50 hover:text-[#1a1510]"><ArrowLeft size={18} /></button>
                    <div className="w-10 h-10 rounded-xl bg-[#1a1510] text-brand-gold flex items-center justify-center text-[12px] font-semibold shrink-0">{initials(selectedConversation)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold text-[#1a1510] truncate">{selectedConversation.contactName || selectedConversation.contactEmail}</h2>
                        <span className="px-2 py-0.5 rounded-md bg-[#f7f8f9] text-[#1a1510]/50 text-[10px] font-medium shrink-0">{selectedConversation.sourcePlatform}</span>
                      </div>
                      <p className="text-[12px] text-[#1a1510]/40 truncate">{selectedConversation.companyName || selectedConversation.contactEmail}{selectedConversation.campaignName ? ` · ${selectedConversation.campaignName}` : ""}</p>
                    </div>
                  </div>
                  {/* status selector */}
                  <div className="relative shrink-0">
                    <select
                      value={selectedConversation.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`appearance-none h-8 pl-2.5 pr-7 rounded-lg text-[11px] font-medium cursor-pointer outline-none ${statusStyle(selectedConversation.status)}`}
                    >
                      {CONVERSATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-current opacity-60 pointer-events-none" />
                  </div>
                </div>

                {/* Messages */}
                <div ref={threadRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 space-y-3">
                  {loadingThread ? (
                    <div className="flex items-center justify-center py-16"><Loader size={32} /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-[13px] text-[#1a1510]/40">No messages in this conversation yet.</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.direction === "outgoing" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.direction === "outgoing" ? "bg-[#1a1510] text-white rounded-br-sm" : "bg-white border border-[#1a1510]/[0.07] text-[#1a1510] rounded-bl-sm"}`}>
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.body}</p>
                          <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${m.direction === "outgoing" ? "text-white/45 justify-end" : "text-[#1a1510]/35"}`}>
                            {m.sentAt && <span>{new Date(m.sentAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                            {m.direction === "outgoing" && (
                              <span className={`font-medium ${m.direction === "outgoing" ? "text-white/60" : msgStatusStyle(m.status)}`}>· {m.status}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply composer */}
                <div className="shrink-0 bg-white border-t border-[#1a1510]/[0.07] p-3 sm:p-4">
                  {sendError && (
                    <div className="mb-2 flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                      <span className="flex items-center gap-2 text-[12px] font-medium text-red-600"><AlertCircle size={14} /> {sendError}</span>
                      <button onClick={handleSend} disabled={sending} className="text-[11px] font-semibold text-red-600 hover:underline">Retry</button>
                    </div>
                  )}
                  {selectedConversation.canSend ? (
                    <div className="flex items-end gap-2.5">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                        placeholder={`Reply via ${selectedConversation.sourcePlatform}…`}
                        rows={2}
                        className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] outline-none focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!reply.trim() || sending}
                        className="btn-shine h-11 px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {sending ? "Sending…" : "Send"}
                      </button>
                    </div>
                  ) : (
                    <div
                      title="Sending not supported for this source yet"
                      className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#f7f8f9] border border-dashed border-[#1a1510]/15 text-[12px] font-medium text-[#1a1510]/40"
                    >
                      <AlertCircle size={14} /> Sending not supported for this source yet
                    </div>
                  )}
                  <p className="text-[10px] text-[#1a1510]/30 mt-1.5 px-1 hidden sm:block">Press ⌘/Ctrl + Enter to send</p>
                </div>
              </>
            )}
          </section>
        </main>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-xl bg-[#1a1510] text-white text-[12px] font-medium shadow-2xl max-w-xs"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
