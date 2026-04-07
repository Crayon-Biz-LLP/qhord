"use client";

import React, { useState, useCallback } from "react";
import {
   User, Building2, Users, Plug, Send, Brain, Bell, SlidersHorizontal,
   Database, Workflow, BarChart3, Shield, Lock, Smartphone, Monitor,
   Globe, ChevronRight, Check, Loader2, Crown, X,
   KeyRound, Fingerprint, LogIn, Palette, Upload, Trash2, Plus,
   RefreshCw, AlertCircle, Calendar, Ghost, Layers, MessageSquare, Handshake, LayoutGrid,
   Linkedin, Mail, Activity, AtSign, Info, Eye, EyeOff, Sparkles, MoveRight, Zap, AlertTriangle,
   LayoutDashboard, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Types ---
type SettingsTab = "profile" | "workspace" | "team" | "integrations" | "outreach" | "ai" | "notifications" | "preferences" | "data" | "workflows" | "usage";

interface NavItem {
   id: SettingsTab;
   label: string;
   icon: any;
   notify?: boolean;
}

// --- Data ---
const NAV_ITEMS: NavItem[] = [
   { id: "profile", label: "Profile", icon: User },
   { id: "workspace", label: "Workspace", icon: Building2 },
   { id: "team", label: "Team", icon: Users },
   { id: "integrations", label: "Integrations", icon: Plug, notify: true },
   { id: "outreach", label: "Outreach", icon: Send },
   { id: "ai", label: "AI Preferences", icon: Brain },
   { id: "notifications", label: "Notifications", icon: Bell },
   { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
   { id: "data", label: "Data & CRM", icon: Database },
   { id: "workflows", label: "Workflows", icon: Workflow },
   { id: "usage", label: "Usage", icon: BarChart3 },
];

const SESSIONS = [
   { device: "MacBook Pro · Chrome", location: "San Francisco, CA", ip: "192.168.1.42", lastActive: "Active now", current: true, icon: Monitor },
   { device: "iPhone 15 Pro · Safari", location: "San Francisco, CA", ip: "192.168.1.87", lastActive: "2 hours ago", current: false, icon: Smartphone },
];

// --- Sub-components ---
const GoldToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
   <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-brand-gold" : "bg-[#1a1510]/10"}`}
   >
      <motion.div
         layout
         transition={{ type: "spring", stiffness: 500, damping: 30 }}
         className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm ${enabled ? "right-0.5" : "left-0.5"}`}
      />
   </button>
);

export default function SettingsPage() {
   const router = useRouter();
   const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
   const [twoFA, setTwoFA] = useState(false);

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

         {/* 1. Header Navigation */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
                  <Settings size={18} />
               </div>
               <div className="hidden sm:block truncate">
                  <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Settings</h2>
                  <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                     Configure your OS
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={() => router.push('/dashboard')}
                  className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
               >
                  <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
               </button>
            </div>
         </nav>

         {/* 2. Main Operating Area */}
         <main className="flex-1 flex overflow-hidden">

            {/* Sidebar Nav (Responsive) */}
            <aside className="hidden lg:flex w-72 border-r border-[#1a1510]/5 bg-white flex-col shrink-0 overflow-hidden">
               <div className="p-6 space-y-1 overflow-y-auto scrollbar-hide">
                  {NAV_ITEMS.map((item) => (
                     <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id
                              ? "bg-[#1a1510] text-white shadow-lg shadow-[#1a1510]/10"
                              : "text-[#1a1510]/30 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                           }`}
                     >
                        <item.icon size={16} />
                        {item.label}
                        {item.notify && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold ml-auto" />}
                     </button>
                  ))}
               </div>
            </aside>

            {/* Content Area */}
            <section className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide">
               <div className="max-w-4xl mx-auto w-full p-4 sm:p-10 pb-32 space-y-12">

                  {/* Mobile Tab Nav */}
                  <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4">
                     {NAV_ITEMS.map((item) => (
                        <button
                           key={item.id}
                           onClick={() => setActiveTab(item.id)}
                           className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border ${activeTab === item.id ? 'bg-[#1a1510] text-white border-[#1a1510]' : 'bg-white text-[#1a1510]/40 border-[#1a1510]/5'}`}
                        >
                           {item.label}
                        </button>
                     ))}
                  </div>

                  {activeTab === "profile" ? (
                     <div className="space-y-10">
                        <div className="space-y-6">
                           <h3 className="text-xl font-black tracking-tight uppercase">Profile Hub</h3>
                           <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 sm:p-8 space-y-8 shadow-sm">
                              <div className="flex flex-col sm:flex-row items-center gap-6">
                                 <div className="w-20 h-20 rounded-[1.5rem] bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-2xl font-black shadow-inner">SM</div>
                                 <div className="text-center sm:text-left">
                                    <h4 className="text-lg font-black tracking-tight">Sarah Mitchell</h4>
                                    <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Growth Lead • Admin</p>
                                    <button className="mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">Change photo</button>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Full Name</label>
                                    <input type="text" defaultValue="Sarah Mitchell" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:outline-none transition-all" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-[#1a1510]/30">Email Address</label>
                                    <input type="email" defaultValue="sarah@qhord.io" className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:outline-none transition-all" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h3 className="text-xl font-black tracking-tight uppercase">Security Shield</h3>
                           <div className="space-y-3">
                              <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 flex items-center justify-between group hover:shadow-md transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-gold/5 flex items-center justify-center text-brand-gold"><Lock size={18} /></div>
                                    <div className="hidden sm:block">
                                       <p className="text-[13px] font-black">Password</p>
                                       <p className="text-[11px] font-medium text-[#1a1510]/30">Updated 31 days ago</p>
                                    </div>
                                    <div className="sm:hidden font-black text-[11px]">Password</div>
                                 </div>
                                 <button className="px-5 h-10 bg-[#f7f8f9] text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1a1510] hover:text-white transition-all">Reset</button>
                              </div>
                              <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 flex items-center justify-between group hover:shadow-md transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-gold/5 flex items-center justify-center text-brand-gold"><Fingerprint size={18} /></div>
                                    <div>
                                       <p className="text-[13px] font-black">2FA</p>
                                       <p className="text-[11px] font-medium text-[#1a1510]/30 hidden sm:block">Extra security layer</p>
                                    </div>
                                 </div>
                                 <GoldToggle enabled={twoFA} onToggle={() => setTwoFA(!twoFA)} />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h3 className="text-xl font-black tracking-tight uppercase">Sessions</h3>
                           <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] overflow-hidden shadow-sm">
                              {SESSIONS.map((s, i) => (
                                 <div key={i} className="p-6 flex items-center justify-between border-b border-[#1a1510]/5 last:border-0">
                                    <div className="flex items-center gap-4">
                                       <s.icon size={18} className="text-[#1a1510]/20" />
                                       <div>
                                          <p className="text-[13px] font-black">{s.device}</p>
                                          <p className="text-[11px] font-medium text-[#1a1510]/30">{s.location} • {s.ip}</p>
                                       </div>
                                    </div>
                                    {!s.current && <button className="text-[9px] font-black text-red-400 uppercase tracking-widest">Revoke</button>}
                                    {s.current && <span className="text-[8px] font-black uppercase tracking-widest text-[#1a1510]/20 bg-[#f7f8f9] px-2 py-1 rounded">Current</span>}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#1a1510]/5 rounded-[3rem] border-dashed">
                        <div className="p-6 bg-brand-gold/5 rounded-full text-brand-gold mb-6 rotate-12">
                           <Zap size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">{activeTab} Controls</h3>
                        <p className="text-[12px] font-medium text-[#1a1510]/30 mt-2 uppercase tracking-[0.2em]">Management interface in progress</p>
                     </div>
                  )}

               </div>
            </section>
         </main>
      </div>
   );
}
