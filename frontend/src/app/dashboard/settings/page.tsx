"use client";

import React, { useState, useEffect } from "react";
import {
   User, Building2, Users, Plug, Send, Brain, Bell, SlidersHorizontal,
   Database, Workflow, BarChart3, Shield, Monitor, Smartphone, Lock, Fingerprint, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";

type SettingsTab = "profile" | "workspace" | "team" | "integrations" | "outreach" | "ai" | "notifications" | "preferences" | "data" | "workflows" | "usage";

interface NavItem {
   id: SettingsTab;
   label: string;
   icon: any;
   notify?: boolean;
}

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
   { device: "Chrome on MacOS", location: "San Francisco, CA", current: true, icon: Monitor },
   { device: "Safari on iPhone", location: "San Francisco, CA", current: false, icon: Smartphone },
];

const GoldToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
   <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-[#b99b7b]" : "bg-[#1a1510]/10"}`} // b99b7b is standard brand-gold usually
   >
      <motion.div
         layout
         transition={{ type: "spring", stiffness: 500, damping: 30 }}
         className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm ${enabled ? "right-0.5" : "left-0.5"}`}
      />
   </button>
);

export default function SettingsPage() {
   const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
   const [twoFA, setTwoFA] = useState(false);
   
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [loadingData, setLoadingData] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [toastMessage, setToastMessage] = useState<string | null>(null);

   const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
   };

   useEffect(() => {
      async function fetchProfile() {
         try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.operator) {
               setName(res.data.operator.name || "");
               setEmail(res.data.operator.email || "");
            }
         } catch (error) {
            console.error("Failed to fetch profile", error);
         } finally {
            setLoadingData(false);
         }
      }
      fetchProfile();
   }, []);

   const handleSave = async () => {
      setIsSaving(true);
      try {
         await api.put('/auth/profile', { name, email });
         showToast("Changes saved successfully!");
      } catch (error) {
         console.error("Failed to save changes", error);
         showToast("Error saving changes.");
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#b99b7b]/30">
         {/* Top Header Match Sidebar height roughly */}
         <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#1a1510] text-[#b99b7b] rounded-xl shadow-lg shrink-0">
                  <Settings size={18} />
               </div>
               <div className="hidden sm:block truncate">
                  <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Settings</h2>
                  <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                     Control your entire revenue engine from one place
                  </p>
               </div>
            </div>
         </nav>
         
         <main className="flex-1 flex overflow-hidden">
            {/* Sidebar Nav */}
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
                        {item.notify && <div className="w-1.5 h-1.5 rounded-full bg-[#b99b7b] ml-auto" />}
                     </button>
                  ))}
               </div>
            </aside>

            {/* Content Area */}
            <section className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide">
               <div className="max-w-4xl mx-auto w-full p-4 sm:p-10 pb-32 space-y-12">
                  
                  {activeTab === "profile" && (
                     <div className="space-y-10">
                        {/* Profile Hub */}
                        <div className="space-y-6">
                           <h3 className="text-xl font-black tracking-tight uppercase">Profile & Security</h3>
                           <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-6 sm:p-8 space-y-8 shadow-sm">
                              {loadingData ? (
                                 <div className="flex gap-6 animate-pulse">
                                    <div className="flex-1 h-12 bg-[#1a1510]/5 rounded-xl"></div>
                                    <div className="flex-1 h-12 bg-[#1a1510]/5 rounded-xl"></div>
                                 </div>
                              ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest">Full Name</label>
                                       <input 
                                          type="text" 
                                          value={name} 
                                          onChange={(e) => setName(e.target.value)}
                                          className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:outline-none transition-all text-sm font-bold text-[#1a1510]" 
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest">Email Address</label>
                                       <input 
                                          type="email" 
                                          value={email} 
                                          disabled
                                          className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl border border-transparent text-sm font-bold text-[#1a1510]/50 cursor-not-allowed" 
                                       />
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 text-[#1a1510]">
                              <Shield size={18} className="text-[#1a1510]/50" />
                              <h3 className="text-xl font-black tracking-tight uppercase">Security</h3>
                           </div>

                           <div className="space-y-3">
                              {/* Password */}
                              <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:shadow-md transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#b99b7b]/10 flex items-center justify-center text-[#b99b7b]"><Lock size={18} /></div>
                                    <div>
                                       <p className="text-[13px] font-black">Password</p>
                                       <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">Last changed 30 days ago</p>
                                    </div>
                                 </div>
                                 <button className="mt-4 sm:mt-0 px-5 h-10 bg-[#f7f8f9] text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1a1510] hover:text-white transition-all text-[#1a1510]">
                                    Change Password
                                 </button>
                              </div>

                              {/* 2FA */}
                              <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:shadow-md transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#b99b7b]/10 flex items-center justify-center text-[#b99b7b]"><Fingerprint size={18} /></div>
                                    <div>
                                       <p className="text-[13px] font-black">Two-Factor Authentication</p>
                                       <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 hidden sm:block">Add an extra layer of security</p>
                                    </div>
                                 </div>
                                 <div className="mt-4 sm:mt-0">
                                    <GoldToggle enabled={twoFA} onToggle={() => setTwoFA(!twoFA)} />
                                 </div>
                              </div>

                              {/* SSO */}
                              <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:shadow-md transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a1510]/5 flex items-center justify-center text-[#1a1510]"><Building2 size={18} /></div>
                                    <div>
                                       <p className="text-[13px] font-black">SSO</p>
                                       <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">Sign in with Google, Microsoft, or Okta</p>
                                    </div>
                                 </div>
                                 <span className="mt-4 sm:mt-0 px-3 py-1 bg-[#1a1510]/5 text-[#1a1510] text-[9px] font-black uppercase tracking-widest rounded-md">
                                    Enterprise
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="space-y-6">
                           <h3 className="text-xl font-black tracking-tight uppercase">Active Sessions</h3>
                           <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] overflow-hidden shadow-sm">
                              {SESSIONS.map((s, i) => (
                                 <div key={i} className="p-6 flex items-center justify-between border-b border-[#1a1510]/5 last:border-0 group hover:bg-[#f7f8f9] transition-all">
                                    <div className="flex items-center gap-4">
                                       <s.icon size={18} className="text-[#1a1510]/20" />
                                       <div>
                                          <p className="text-[13px] font-black">{s.device}</p>
                                          <p className="text-[11px] font-medium text-[#1a1510]/30">{s.location}</p>
                                       </div>
                                    </div>
                                    {!s.current && (
                                       <button className="text-[9px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                          Revoke
                                       </button>
                                    )}
                                    {s.current && (
                                       <span className="text-[8px] font-black uppercase tracking-widest text-[#1a1510]/40 bg-[#f7f8f9] px-2 py-1 rounded">
                                          Current
                                       </span>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-2">
                           <button 
                              onClick={handleSave}
                              disabled={isSaving}
                              className="px-8 py-4 bg-[#1a1510] text-[#b99b7b] text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-50"
                           >
                              {isSaving ? "Saving Configuration..." : "Save Changes"}
                           </button>
                        </div>
                     </div>
                  )}

                  {activeTab !== "profile" && (
                     <div className="flex flex-col items-center justify-center py-32 bg-white border border-[#1a1510]/5 rounded-[3rem] border-dashed">
                        <div className="p-6 bg-[#b99b7b]/10 rounded-full text-[#b99b7b] mb-6 rotate-12">
                           <Settings size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">{activeTab} Controls</h3>
                        <p className="text-[12px] font-medium text-[#1a1510]/30 mt-2 uppercase tracking-[0.2em]">Management interface coming soon</p>
                     </div>
                  )}

               </div>
            </section>
         </main>

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
