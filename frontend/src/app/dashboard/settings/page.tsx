"use client";

import React, { useState, useEffect } from "react";
import {
   User, Building2, Users, Plug, Send, Brain, Bell, SlidersHorizontal,
   Database, Workflow, BarChart3, Shield, Monitor, Smartphone, Lock, Fingerprint, Settings,
   RefreshCw, ChevronUp, ChevronRight, Plus, Palette, Upload, Ghost, Layers, Handshake, LayoutGrid, Calendar, Trash2,
   Search, Mail, MessageSquare, AlertCircle, Linkedin, Sparkles, MoveRight, Check, Zap, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

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
   const { refreshUser } = useAuth();
   const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
   const [twoFA, setTwoFA] = useState(false);
   
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [safetyMode, setSafetyMode] = useState(true);
   const [autoReply, setAutoReply] = useState(true);
   const [autoPause, setAutoPause] = useState(true);
   const [autoOptimize, setAutoOptimize] = useState(false);
   const [autoScore, setAutoScore] = useState(true);
   const [notificationEvents, setNotificationEvents] = useState([
      { id: "replies", label: "New replies", email: true, slack: true, inapp: true },
      { id: "meeting", label: "Meeting booked", email: true, slack: true, inapp: true },
      { id: "errors", label: "Campaign errors", email: true, slack: true, inapp: true },
      { id: "deliverability", label: "Low deliverability", email: true, slack: true, inapp: false },
      { id: "intent", label: "High intent leads", email: false, slack: true, inapp: true },
      { id: "enrichment", label: "Enrichment complete", email: false, slack: true, inapp: false },
      { id: "weekly", label: "Weekly digest", email: true, slack: false, inapp: false },
   ]);
   const [motivationPopups, setMotivationPopups] = useState(true);
   const [pushQualified, setPushQualified] = useState(true);
   const [pushAll, setPushAll] = useState(false);
   const [createDeals, setCreateDeals] = useState(true);
   const [selectedCRM, setSelectedCRM] = useState('hubspot');
   const [isCRMOpen, setIsCRMOpen] = useState(false);
   
   const [loadingData, setLoadingData] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [toastMessage, setToastMessage] = useState<string | null>(null);

   // Workspace State
   const [workspaceName, setWorkspaceName] = useState("");
   const [workspaceDomain, setWorkspaceDomain] = useState("");
   const [workspaceTimezone, setWorkspaceTimezone] = useState("Eastern (EST)");

   // AI State
   const [aiTone, setAiTone] = useState("Professional");
   const [aiPersonalization, setAiPersonalization] = useState("Medium");

   // Outreach State
   const [dailySendLimit, setDailySendLimit] = useState("200");
   const [inboxRotation, setInboxRotation] = useState("Round Robin");
   const [autoPauseThreshold, setAutoPauseThreshold] = useState("5% bounce rate");
   const [dailyConnectionLimit, setDailyConnectionLimit] = useState("25");
   const [dailyMessageLimit, setDailyMessageLimit] = useState("50");
   const [linkedinAccount, setLinkedinAccount] = useState("sarah.linkedin");

   // Dynamic Data
   const [teamMembers, setTeamMembers] = useState<any[]>([]);
   const [integrations, setIntegrations] = useState<any[]>([]);

   // Change Password State
   const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [isChangingPassword, setIsChangingPassword] = useState(false);
   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   // 2FA State
   const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
   const [twoFAQRCode, setTwoFAQRCode] = useState("");
   const [twoFAVerificationCode, setTwoFAVerificationCode] = useState("");
   const [isVerifying2FA, setIsVerifying2FA] = useState(false);
   const [twoFAStep, setTwoFAStep] = useState<"initial" | "verify">("initial");
   const [twoFAManualSecret, setTwoFAManualSecret] = useState("");


   const crms = [
      { id: 'hubspot', name: 'HubSpot', color: '#ff7a59' },
      { id: 'salesforce', name: 'Salesforce', color: '#00a1e0' },
      { id: 'pipedrive', name: 'Pipedrive', color: '#22d3ee' },
   ];

   const currentCRM = crms.find(c => c.id === selectedCRM) || crms[0];

   const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
   };

   useEffect(() => {
      async function fetchData() {
         try {
            setLoadingData(true);
            const [profileRes, settingsRes] = await Promise.all([
               api.get('/auth/me'),
               api.get('/settings')
            ]);

            if (profileRes.data && profileRes.data.operator) {
               setName(profileRes.data.operator.name || "");
               setEmail(profileRes.data.operator.email || "");
            }

            if (settingsRes.data) {
               const { workspace, settings, team, integrations: intData } = settingsRes.data;
               if (workspace) {
                  setWorkspaceName(workspace.name || "");
                  setWorkspaceDomain(workspace.domain || "");
                  setWorkspaceTimezone(workspace.timezone || "Eastern (EST)");
               }
               if (settings) {
                  setAiTone(settings.ai_tone || "Professional");
                  setAiPersonalization(settings.ai_personalization || "Medium");
                  setAutoReply(settings.auto_reply);
                  setAutoPause(settings.auto_pause);
                  setAutoOptimize(settings.auto_optimize);
                  setAutoScore(settings.auto_score);
                  setDailySendLimit(settings.daily_send_limit?.toString() || "200");
                  setInboxRotation(settings.inbox_rotation || "Round Robin");
                  setAutoPauseThreshold(settings.auto_pause_threshold || "5% bounce rate");
                  setSafetyMode(settings.safety_mode);
                  setDailyConnectionLimit(settings.daily_connection_limit?.toString() || "25");
                  setDailyMessageLimit(settings.daily_message_limit?.toString() || "50");
                  setLinkedinAccount(settings.linkedin_account || "sarah.linkedin");
                  setSelectedCRM(settings.default_crm || "hubspot");
                  setTwoFA(settings.two_factor_enabled || false);
                  if (settings.notifications && Array.isArray(settings.notifications) && settings.notifications.length > 0) {
                     setNotificationEvents(settings.notifications);
                  }
               }
               if (team) setTeamMembers(team);
               if (intData) setIntegrations(intData);
            }
         } catch (error: any) {
            console.error("Failed to fetch settings", error);
            const hint = error.response?.data?.hint;
            if (hint) {
               showToast(`Settings could not load. ${hint}`);
            }
         } finally {
            setLoadingData(false);
         }
      }
      fetchData();
   }, []);

   const handleSave = async () => {
      setIsSaving(true);
      let profileSaved = false;
      let settingsSaved = false;

      try {
         const profileRes = await api.put('/auth/profile', { name: name.trim(), email });
         if (profileRes.data?.operator?.name) {
            setName(profileRes.data.operator.name);
         }
         await refreshUser();
         profileSaved = true;
      } catch (error: any) {
         console.error("Failed to save profile", error);
         showToast(error.response?.data?.message || "Could not save name. Are you logged in?");
      }

      try {
         await api.put('/settings', {
            workspace: {
               name: workspaceName,
               domain: workspaceDomain,
               timezone: workspaceTimezone
            },
            settings: {
               ai_tone: aiTone,
               ai_personalization: aiPersonalization,
               auto_reply: autoReply,
               auto_pause: autoPause,
               auto_optimize: autoOptimize,
               auto_score: autoScore,
               daily_send_limit: dailySendLimit,
               inbox_rotation: inboxRotation,
               auto_pause_threshold: autoPauseThreshold,
               safety_mode: safetyMode,
               notifications: notificationEvents,
               daily_connection_limit: dailyConnectionLimit,
               daily_message_limit: dailyMessageLimit,
               linkedin_account: linkedinAccount,
               default_crm: selectedCRM,
               two_factor_enabled: twoFA
            }
         });
         settingsSaved = true;
      } catch (error: any) {
         console.error("Failed to save settings", error);
         const hint = error.response?.data?.hint || "";
         showToast(
            (error.response?.data?.message || "Settings save failed.") +
            (hint ? ` ${hint}` : " Try: npx prisma db push")
         );
      }

      if (profileSaved && settingsSaved) {
         showToast("Changes saved successfully!");
      } else if (profileSaved) {
         showToast("Name saved. Other settings may need database migration (prisma db push).");
      }

      setIsSaving(false);
   };

   const handlePasswordChange = async () => {
      if (newPassword !== confirmPassword) {
         showToast("Passwords do not match.");
         return;
      }
      if (newPassword.length < 6) {
         showToast("Password must be at least 6 characters.");
         return;
      }

      setIsChangingPassword(true);
      try {
         await api.put('/auth/change-password', {
            currentPassword,
            newPassword
         });
         showToast("Password changed successfully!");
         setIsPasswordModalOpen(false);
         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
      } catch (error: any) {
         console.error("Failed to change password", error);
         showToast(error.response?.data?.message || "Error changing password.");
      } finally {
         setIsChangingPassword(false);
      }
   };

   const handle2FASetup = async () => {
      try {
         const res = await api.post('/auth/2fa/setup');
         setTwoFAQRCode(res.data.qrCodeUrl || "");
         setTwoFAManualSecret(res.data.secret || "");
         setTwoFAStep("verify");
         setTwoFAVerificationCode("");
         setIs2FAModalOpen(true);
      } catch (error: any) {
         console.error("Failed to setup 2FA", error);
         const msg = error.response?.data?.message || error.response?.data?.detail;
         showToast(msg ? `2FA setup failed: ${msg}` : "2FA setup failed. Run npx prisma db push in backend.");
      }
   };

   const handle2FAVerify = async () => {
      if (!twoFAVerificationCode) {
         showToast("Please enter verification code.");
         return;
      }
      setIsVerifying2FA(true);
      try {
         await api.post('/auth/2fa/verify', { token: twoFAVerificationCode });
         showToast("2FA enabled successfully!");
         setTwoFA(true);
         setIs2FAModalOpen(false);
         setTwoFAVerificationCode("");
      } catch (error: any) {
         console.error("Failed to verify 2FA", error);
         showToast(error.response?.data?.message || "Invalid code.");
      } finally {
         setIsVerifying2FA(false);
      }
   };

   return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#b99b7b]/30">
         {/* Top Header */}
         <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg flex items-center justify-center shrink-0">
                  <Settings size={17} />
               </div>
               <div className="hidden sm:block truncate">
                  <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase truncate">Settings</h2>
                  <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Manage your account &amp; workspace</p>
               </div>
            </div>
         </nav>

         <main className="flex-1 flex overflow-hidden">
            {/* Sidebar Nav */}
            <aside className="hidden lg:flex w-60 border-r border-[#1a1510]/[0.07] bg-white flex-col shrink-0 overflow-hidden">
               <div className="p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
                  {NAV_ITEMS.map((item) => (
                     <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${activeTab === item.id
                              ? "bg-[#1a1510] text-white"
                              : "text-[#1a1510]/50 hover:text-[#1a1510] hover:bg-[#f7f8f9]"
                           }`}
                     >
                        <item.icon size={16} className={activeTab === item.id ? "text-[#b99b7b]" : ""} />
                        {item.label}
                        {item.notify && <div className="w-1.5 h-1.5 rounded-full bg-[#b99b7b] ml-auto" />}
                     </button>
                  ))}
               </div>
            </aside>

            {/* Content Area */}
            <section className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide">
               <div className="max-w-4xl mx-auto w-full p-6 sm:p-8 pb-32 space-y-8">
                  
                  {activeTab === "profile" && (
                     <div className="space-y-8">
                        {/* Profile Hub */}
                        <div className="space-y-3">
                           <h3 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Profile</h3>
                           <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 sm:p-6 space-y-6">
                              {loadingData ? (
                                 <div className="flex gap-4 animate-pulse">
                                    <div className="flex-1 h-11 bg-[#1a1510]/5 rounded-xl"></div>
                                    <div className="flex-1 h-11 bg-[#1a1510]/5 rounded-xl"></div>
                                 </div>
                              ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60">Full name</label>
                                       <input
                                          type="text"
                                          value={name}
                                          onChange={(e) => setName(e.target.value)}
                                          className="w-full h-11 px-4 bg-[#f7f8f9] rounded-xl border border-[#1a1510]/[0.07] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all text-[13px] text-[#1a1510]"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[12px] font-semibold text-[#1a1510]/60">Email address</label>
                                       <input
                                          type="email"
                                          value={email}
                                          disabled
                                          className="w-full h-11 px-4 bg-[#f7f8f9] rounded-xl border border-[#1a1510]/[0.07] text-[13px] text-[#1a1510]/50 cursor-not-allowed"
                                       />
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-3">
                           <h3 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Security</h3>

                           <div className="space-y-3">
                              {/* Password */}
                              <div className="bg-white border border-[#1a1510]/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/50"><Lock size={16} /></div>
                                    <div>
                                       <p className="text-[14px] font-semibold text-[#1a1510]">Password</p>
                                       <p className="text-[12px] font-medium text-[#1a1510]/40 mt-0.5">Last changed 30 days ago</p>
                                    </div>
                                 </div>
                                 <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="btn-shine btn-shine-dark px-4 h-9 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] hover:bg-[#1a1510]/[0.02] transition-colors"
                                 >
                                    Change password
                                 </button>
                              </div>

                              {/* 2FA */}
                              <div className="bg-white border border-[#1a1510]/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/50"><Fingerprint size={16} /></div>
                                    <div>
                                       <p className="text-[14px] font-semibold text-[#1a1510]">Two-Factor Authentication</p>
                                       <p className="text-[12px] font-medium text-[#1a1510]/40 mt-0.5 hidden sm:block">Add an extra layer of security</p>
                                    </div>
                                 </div>
                                 <GoldToggle enabled={twoFA} onToggle={() => {
                                    if (!twoFA) { handle2FASetup(); } else { setTwoFA(false); }
                                 }} />
                              </div>

                              {/* SSO */}
                              <div className="bg-white border border-[#1a1510]/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/50"><Building2 size={16} /></div>
                                    <div>
                                       <p className="text-[14px] font-semibold text-[#1a1510]">SSO</p>
                                       <p className="text-[12px] font-medium text-[#1a1510]/40 mt-0.5">Sign in with Google, Microsoft, or Okta</p>
                                    </div>
                                 </div>
                                 <span className="px-2.5 py-1 bg-[#f7f8f9] text-[#1a1510]/60 text-[10px] font-medium uppercase tracking-wide rounded-md">
                                    Enterprise
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="space-y-3">
                           <h3 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Active Sessions</h3>
                           <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl overflow-hidden">
                              {SESSIONS.map((s, i) => (
                                 <div key={i} className="p-5 flex items-center justify-between border-b border-[#1a1510]/[0.06] last:border-0 group hover:bg-[#fafafa] transition-colors">
                                    <div className="flex items-center gap-3">
                                       <s.icon size={17} className="text-[#1a1510]/30" />
                                       <div>
                                          <p className="text-[14px] font-semibold text-[#1a1510]">{s.device}</p>
                                          <p className="text-[12px] font-medium text-[#1a1510]/40">{s.location}</p>
                                       </div>
                                    </div>
                                    {!s.current ? (
                                       <button className="text-[11px] font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Revoke
                                       </button>
                                    ) : (
                                       <span className="text-[10px] font-medium uppercase tracking-wide text-[#1a1510]/45 bg-[#f7f8f9] px-2 py-0.5 rounded-md">
                                          Current
                                       </span>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-1">
                           <button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="btn-shine px-6 h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors disabled:opacity-50"
                           >
                              {isSaving ? "Saving…" : "Save Changes"}
                           </button>
                        </div>
                     </div>
                  )}

                  {activeTab === "workspace" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                     >
                        <div className="space-y-4">
                           <h3 className="text-base font-bold tracking-tight uppercase">Workspace Configuration</h3>
                           <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
                              {/* Row 1 */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Workspace Name</label>
                                    <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full h-10 px-4 bg-[#f7f8f9] rounded-lg border border-transparent focus:bg-white focus:border-[#1a1510]/5 focus:outline-none transition-all text-[13px] font-medium text-[#1a1510]" />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Domain</label>
                                    <input type="text" value={workspaceDomain} onChange={(e) => setWorkspaceDomain(e.target.value)} className="w-full h-10 px-4 bg-[#f7f8f9] rounded-lg border border-transparent focus:bg-white focus:border-[#1a1510]/5 focus:outline-none transition-all text-[13px] font-medium text-[#1a1510]" />
                                 </div>
                              </div>

                              {/* Row 2 */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Timezone</label>
                                    <div className="relative">
                                       <select 
                                          value={workspaceTimezone} 
                                          onChange={(e) => setWorkspaceTimezone(e.target.value)}
                                          className="w-full h-10 px-4 bg-[#f7f8f9] rounded-lg border border-transparent focus:bg-white focus:border-[#1a1510]/5 focus:outline-none transition-all text-[13px] font-medium text-[#1a1510] appearance-none"
                                       >
                                          <option value="Eastern (EST)">Eastern (EST)</option>
                                          <option value="Pacific (PST)">Pacific (PST)</option>
                                          <option value="UTC">UTC</option>
                                       </select>
                                       <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                    </div>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Default Campaign Owner</label>
                                    <div className="relative">
                                       <select className="w-full h-10 px-4 bg-[#f7f8f9] rounded-lg border border-transparent focus:bg-white focus:border-[#1a1510]/5 focus:outline-none transition-all text-[13px] font-medium text-[#1a1510] appearance-none">
                                          <option>Sarah M.</option>
                                       </select>
                                       <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                    </div>
                                 </div>
                              </div>

                              <div className="pt-6 border-t border-[#1a1510]/5 space-y-6">
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                       <Palette size={14} className="text-[#b99b7b]" />
                                       <span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1510]">Branding</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl flex items-center justify-center text-[#1a1510]/20">
                                          <Upload size={18} />
                                       </div>
                                       <button className="px-4 h-8 bg-white border border-[#1a1510]/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#1a1510] hover:border-[#b99b7b] transition-all shadow-sm">
                                          Upload Logo
                                       </button>
                                    </div>
                                 </div>

                                 <div className="pt-2">
                                    <button 
                                       onClick={handleSave}
                                       className="px-6 py-3 bg-[#1a1510] text-[#b99b7b] text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-[#1a1510]/10 hover:translate-y-[-1px] transition-all"
                                    >
                                       Save Changes
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "team" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="flex items-center justify-between">
                           <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Team Management</h3>
                           <button className="px-5 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#1a1510]/10 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                              <Plus size={16} /> Invite User
                           </button>
                        </div>

                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl overflow-hidden shadow-sm">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="bg-[#fafbfc] border-b border-[#1a1510]/5">
                                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">User</th>
                                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Role</th>
                                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Permissions</th>
                                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Status</th>
                                       <th className="px-6 py-4"></th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-[#1a1510]/5">
                                     {teamMembers.map((member, i) => (
                                        <tr key={i} className="hover:bg-[#fafbfc]/40 transition-colors">
                                           <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                 <div className="w-9 h-9 rounded-full bg-[#1a1510]/5 border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510] font-bold text-[11px] shadow-sm">
                                                    {member.name ? member.name.split(" ").map((n: any) => n[0]).join("") : "??"}
                                                 </div>
                                                 <div>
                                                    <h4 className="text-[13px] font-bold text-[#1a1510] leading-tight">{member.name}</h4>
                                                    <p className="text-[11px] font-medium text-[#1a1510]/30">{member.email}</p>
                                                 </div>
                                              </div>
                                           </td>
                                           <td className="px-6 py-4">
                                              <div className="relative min-w-[120px]">
                                                 <select
                                                    defaultValue={member.role}
                                                    className="w-full h-9 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-lg px-3 pr-8 text-[11px] font-bold text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all"
                                                 >
                                                    <option value="operator">Operator</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="sdr">SDR</option>
                                                 </select>
                                                 <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                              </div>
                                           </td>
                                           <td className="px-6 py-4">
                                              <div className="flex flex-wrap gap-1.5">
                                                 {["Campaigns", member.role === "admin" ? "Full Access" : "Standard"].map((perm, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-[#1a1510]/5 border border-[#1a1510]/5 rounded-full text-[10px] font-bold text-[#1a1510]/60 whitespace-nowrap">
                                                       {perm}
                                                    </span>
                                                 ))}
                                              </div>
                                           </td>
                                           <td className="px-6 py-4">
                                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/60`}>
                                                 active
                                              </span>
                                           </td>
                                           <td className="px-6 py-4 text-right">
                                              {member.email !== email && (
                                                 <button className="p-2 text-red-500/30 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                 </button>
                                              )}
                                           </td>
                                        </tr>
                                     ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "integrations" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Connected Integrations</h3>
                              <div className="flex items-center gap-3">
                                 <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Manage API keys and sync status</p>
                                 <div className="flex items-center gap-1.5 ml-2">
                                    <span className="px-2 py-0.5 bg-[#1a1510]/5 border border-[#1a1510]/5 rounded-full text-[9px] font-bold text-[#1a1510]/60">{integrations.length} connected</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-3">
                            {integrations.map((int, i) => (
                               <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={`group flex items-center gap-5 p-4 bg-white border rounded-2xl transition-all shadow-sm border-[#1a1510]/5 hover:border-[#b99b7b]/20`}
                               >
                                  <div className={`w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-black/5`}>
                                     <Layers size={20} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2.5 mb-0.5">
                                        <h4 className="text-[14px] font-bold text-[#1a1510] tracking-tight">{int.tool_name}</h4>
                                        <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100`}>
                                           <span className="w-1 h-1 rounded-full bg-emerald-600" />
                                           connected
                                        </span>
                                     </div>
                                     <div className="flex items-center gap-3">
                                        <p className="text-[11px] font-medium text-[#1a1510]/30 whitespace-nowrap">Account: {int.account_label}</p>
                                        <p className="text-[11px] font-medium text-[#1a1510]/30 whitespace-nowrap">Client: {int.client?.name}</p>
                                     </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                     <button className="px-3 h-9 bg-white border border-[#1a1510]/10 text-[#1a1510]/60 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#fafbfc] transition-all">
                                        <RefreshCw size={14} /> Test
                                     </button>
                                  </div>
                               </motion.div>
                            ))}
                            {integrations.length === 0 && (
                                <div className="text-center py-10 border border-dashed border-[#1a1510]/10 rounded-2xl">
                                    <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">No active integrations found</p>
                                    <button className="mt-3 text-[10px] font-bold text-[#b99b7b] uppercase tracking-widest hover:underline">Add first integration</button>
                                </div>
                            )}
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "outreach" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Email & Deliverability</h3>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4 border border-[#1a1510]/5 rounded-2xl p-5 bg-[#fafbfc]/30">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Sending Domains</span>
                                 <div className="space-y-3">
                                    {[
                                       { domain: "outreach.co", status: "Healthy" },
                                       { domain: "mail.company.com", status: "Healthy" },
                                    ].map((d, i) => (
                                       <div key={i} className="flex items-center justify-between p-3 bg-white border border-[#1a1510]/5 rounded-xl shadow-sm">
                                          <span className="text-[13px] font-medium text-[#1a1510]">{d.domain}</span>
                                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100/60">
                                             {d.status}
                                          </span>
                                       </div>
                                    ))}
                                    <button className="w-full h-10 bg-[#1a1510] text-[#b99b7b] rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                       <Plus size={14} /> Add Domain
                                    </button>
                                 </div>
                              </div>

                              <div className="space-y-4 border border-[#1a1510]/5 rounded-2xl p-5 bg-[#fafbfc]/30">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Warmup Status</span>
                                 <div className="space-y-6">
                                    {[
                                       { domain: "outreach.co", progress: 98 },
                                       { domain: "mail.company.com", progress: 72 },
                                    ].map((w, i) => (
                                       <div key={i} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                             <span className="text-[11px] font-bold text-[#1a1510]">{w.domain}</span>
                                             <span className="text-[11px] font-bold text-[#b99b7b]">{w.progress}%</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-[#1a1510]/5 rounded-full overflow-hidden">
                                             <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${w.progress}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-[#b99b7b]"
                                             />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Daily Send Limit</label>
                                  <input type="text" value={dailySendLimit} onChange={(e) => setDailySendLimit(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Inbox Rotation</label>
                                  <div className="relative">
                                     <select value={inboxRotation} onChange={(e) => setInboxRotation(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all">
                                        <option value="Round Robin">Round Robin</option>
                                        <option value="Sequential">Sequential</option>
                                     </select>
                                     <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Auto-pause threshold</label>
                                  <input type="text" value={autoPauseThreshold} onChange={(e) => setAutoPauseThreshold(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
                               </div>
                            </div>

                           <div className="bg-[#fafbfc] border border-[#1a1510]/5 rounded-2xl p-6">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30 block mb-4">Deliverability Health</span>
                              <div className="grid grid-cols-4 border-t border-[#1a1510]/5 pt-5">
                                 {[
                                    { label: "SPF", status: "Pass", color: "text-emerald-500" },
                                    { label: "DKIM", status: "Pass", color: "text-emerald-500" },
                                    { label: "DMARC", status: "Pass", color: "text-emerald-500" },
                                    { label: "Spam Score", status: "0.2", color: "text-[#1a1510]" },
                                 ].map((h, i) => (
                                    <div key={i} className="text-center space-y-1">
                                       <p className="text-[9px] font-bold uppercase text-[#1a1510]/20 tracking-widest">{h.label}</p>
                                       <p className={`text-[14px] font-bold ${h.color}`}>{h.status}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <button className="flex items-center gap-2 px-6 h-11 bg-[#1a1510] text-[#b99b7b] rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
                              <Mail size={16} /> Send Test Email
                           </button>
                        </div>

                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">LinkedIn Settings</h3>
                           </div>

                           <div className="p-4 border border-[#1a1510]/5 rounded-2xl bg-white flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50">
                                    <Linkedin size={20} />
                                 </div>
                                 <div>
                                     <input type="text" value={linkedinAccount} onChange={(e) => setLinkedinAccount(e.target.value)} className="text-[13px] font-bold text-[#1a1510] bg-transparent border-none outline-none focus:ring-0" />
                                     <p className="text-[11px] font-medium text-[#1a1510]/30 uppercase tracking-tight">Primary account</p>
                                  </div>
                              </div>
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100/60">
                                 Connected
                              </span>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Daily Connection Limit</label>
                                 <input type="text" value={dailyConnectionLimit} onChange={(e) => setDailyConnectionLimit(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Daily Message Limit</label>
                                 <input type="text" value={dailyMessageLimit} onChange={(e) => setDailyMessageLimit(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-5 border-t border-[#1a1510]/5">
                              <div>
                                 <p className="text-[13px] font-bold text-[#1a1510]">Safety Mode</p>
                                 <p className="text-[11px] font-medium text-[#1a1510]/30 uppercase tracking-tight">Auto-pause if activity flagged</p>
                              </div>
                              <GoldToggle enabled={safetyMode} onToggle={() => setSafetyMode(!safetyMode)} />
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "ai" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">AI Preferences</h3>
                              <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Customize how AI behaves across the platform</p>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Tone</label>
                                 <div className="relative">
                                    <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all">
                                       <option value="Professional">Professional</option>
                                       <option value="Friendly">Friendly</option>
                                       <option value="Direct">Direct</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Personalization Depth</label>
                                 <div className="relative">
                                    <select value={aiPersonalization} onChange={(e) => setAiPersonalization(e.target.value)} className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all">
                                       <option value="Medium">Medium — Company research</option>
                                       <option value="Light">Light — First name only</option>
                                       <option value="Deep">Deep — Social media synthesis</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30 block">Auto-Actions</span>
                              <div className="space-y-3">
                                 {[
                                    { id: 'reply', label: "Auto-reply suggestions", sub: "AI generates reply drafts for positive replies", state: autoReply, setter: setAutoReply },
                                    { id: 'pause', label: "Auto-pause campaigns", sub: "Pause campaigns when metrics drop below threshold", state: autoPause, setter: setAutoPause },
                                    { id: 'optimize', label: "Auto-optimize sequences", sub: "AI adjusts send times and subject lines automatically", state: autoOptimize, setter: setAutoOptimize },
                                    { id: 'score', label: "Auto-score leads", sub: "AI assigns lead scores based on engagement", state: autoScore, setter: setAutoScore },
                                 ].map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 bg-[#fafbfc]/50 border border-[#1a1510]/5 rounded-xl shadow-sm">
                                       <div className="space-y-0.5">
                                          <p className="text-[13px] font-bold text-[#1a1510]">{t.label}</p>
                                          <p className="text-[11px] font-medium text-[#1a1510]/30">{t.sub}</p>
                                       </div>
                                       <GoldToggle enabled={t.state} onToggle={() => t.setter(!t.state)} />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <button className="flex items-center gap-2 px-6 h-10 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
                              <Sparkles size={16} /> Show AI Preview
                           </button>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "notifications" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 shadow-sm">
                           <div className="space-y-1 mb-8">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Notification Preferences</h3>
                           </div>

                           <div className="overflow-hidden">
                              <table className="w-full text-left">
                                 <thead>
                                    <tr className="border-b border-[#1a1510]/5">
                                       <th className="pb-5 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Event</th>
                                       <th className="pb-5 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40">Email</th>
                                       <th className="pb-5 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40">Slack</th>
                                       <th className="pb-5 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40">In-App</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-[#1a1510]/5">
                                    {notificationEvents.map((event) => (
                                       <tr key={event.id} className="group transition-colors">
                                          <td className="py-5 text-[13px] font-bold text-[#1a1510]">{event.label}</td>
                                          <td className="py-5">
                                             <div className="flex justify-center">
                                                <GoldToggle 
                                                   enabled={event.email} 
                                                   onToggle={() => setNotificationEvents(notificationEvents.map(e => e.id === event.id ? { ...e, email: !e.email } : e))} 
                                                />
                                             </div>
                                          </td>
                                          <td className="py-5">
                                             <div className="flex justify-center">
                                                <GoldToggle 
                                                   enabled={event.slack} 
                                                   onToggle={() => setNotificationEvents(notificationEvents.map(e => e.id === event.id ? { ...e, slack: !e.slack } : e))} 
                                                />
                                             </div>
                                          </td>
                                          <td className="py-5">
                                             <div className="flex justify-center">
                                                <GoldToggle 
                                                   enabled={event.inapp} 
                                                   onToggle={() => setNotificationEvents(notificationEvents.map(e => e.id === event.id ? { ...e, inapp: !e.inapp } : e))} 
                                                />
                                             </div>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "preferences" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Preferences</h3>
                              <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Customize your workspace experience</p>
                           </div>

                           <div className="p-5 border border-[#1a1510]/5 rounded-2xl bg-[#fafbfc]/30 flex items-center justify-between shadow-sm">
                              <div>
                                 <h4 className="text-[13px] font-bold text-[#1a1510]">Sales Motivation Pop-ups</h4>
                                 <p className="text-[11px] font-medium text-[#1a1510]/30 uppercase tracking-tight">Show motivational sales quotes throughout the day</p>
                              </div>
                              <GoldToggle enabled={motivationPopups} onToggle={() => setMotivationPopups(!motivationPopups)} />
                           </div>

                           <div className="space-y-3">
                              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Frequency</label>
                              <div className="relative max-w-[240px]">
                                 <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none cursor-pointer focus:border-[#b99b7b]/30 transition-all">
                                    <option>Login only</option>
                                    <option defaultValue="Every 2 hours">Every 2 hours</option>
                                    <option>Every 3 hours</option>
                                    <option>Off</option>
                                 </select>
                                 <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "data" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Data & CRM Settings</h3>
                           </div>

                           <div className="space-y-2 relative">
                              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Default CRM</label>
                              <button
                                 onClick={() => setIsCRMOpen(!isCRMOpen)}
                                 className="flex items-center justify-between w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] transition-all hover:border-[#b99b7b]/20"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentCRM.color }} />
                                    {currentCRM.name}
                                 </div>
                                 <ChevronRight size={14} className={`text-[#1a1510]/20 transition-transform ${isCRMOpen ? "-rotate-90" : "rotate-90"}`} />
                              </button>

                              <AnimatePresence>
                                 {isCRMOpen && (
                                    <>
                                       <div className="fixed inset-0 z-10" onClick={() => setIsCRMOpen(false)} />
                                       <motion.div
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 4 }}
                                          className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-[#1a1510]/5 rounded-xl shadow-xl z-20 py-2"
                                       >
                                          {crms.map((crm) => (
                                             <button
                                                key={crm.id}
                                                onClick={() => {
                                                   setSelectedCRM(crm.id);
                                                   setIsCRMOpen(false);
                                                }}
                                                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#fafbfc] transition-colors"
                                             >
                                                <div className="flex items-center gap-3">
                                                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crm.color }} />
                                                   <span className={`text-[13px] ${selectedCRM === crm.id ? "font-bold text-[#1a1510]" : "font-medium text-[#1a1510]/60"}`}>
                                                      {crm.name}
                                                   </span>
                                                </div>
                                                {selectedCRM === crm.id && <Check size={14} className="text-[#b99b7b]" />}
                                             </button>
                                          ))}
                                       </motion.div>
                                    </>
                                 )}
                              </AnimatePresence>
                           </div>

                           <div className="space-y-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30 block">Field Mapping</span>
                              <div className="space-y-3">
                                 {[
                                    { from: "Name", to: "First Name + Last Name" },
                                    { from: "Company", to: "Account Name" },
                                    { from: "Email", to: "Email" },
                                    { from: "Title", to: "Job Title" },
                                    { from: "Campaign", to: "Lead Source" },
                                 ].map((map, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                       <div className="w-24 text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-tight">{map.from}</div>
                                       <MoveRight size={14} className="text-[#1a1510]/20" />
                                       <input
                                          type="text"
                                          defaultValue={map.to}
                                          className="flex-1 h-10 bg-[#fafbfc]/50 border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] shadow-sm outline-none focus:border-[#b99b7b]/30 transition-all"
                                       />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30 block">Auto-Push Rules</span>
                              <div className="space-y-3">
                                 {[
                                    { id: 'qualified', label: "Push qualified leads only", sub: "Only push leads with positive reply or meeting booked", state: pushQualified, setter: setPushQualified },
                                    { id: 'all', label: "Push all leads", sub: "Push every lead to CRM regardless of status", state: pushAll, setter: setPushAll },
                                    { id: 'deals', label: "Create deals on meeting booked", sub: "Automatically create a deal/opportunity when meeting is booked", state: createDeals, setter: setCreateDeals },
                                 ].map((rule) => (
                                    <div key={rule.id} className="flex items-center justify-between p-4 bg-[#fafbfc]/50 border border-[#1a1510]/5 rounded-xl shadow-sm">
                                       <div className="space-y-0.5">
                                          <p className="text-[13px] font-bold text-[#1a1510]">{rule.label}</p>
                                          <p className="text-[11px] font-medium text-[#1a1510]/30">{rule.sub}</p>
                                       </div>
                                       <GoldToggle enabled={rule.state} onToggle={() => rule.setter(!rule.state)} />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <button className="flex items-center gap-2 px-8 h-10 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
                              Save Changes
                           </button>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "workflows" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Workflow Defaults</h3>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Default Delay Between Steps</label>
                                 <div className="relative">
                                    <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all cursor-pointer">
                                       <option>1 day</option>
                                       <option defaultValue="2 days">2 days</option>
                                       <option>3 days</option>
                                       <option>5 days</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Retry Logic</label>
                                 <div className="relative">
                                    <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all cursor-pointer">
                                       <option>1 retry</option>
                                       <option defaultValue="3 retries">3 retries</option>
                                       <option>5 retries</option>
                                       <option>No retries</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Default Fallback Action</label>
                              <div className="relative">
                                 <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all cursor-pointer">
                                    <option>Skip step</option>
                                    <option>Pause workflow</option>
                                    <option>Notify admin</option>
                                    <option>Use alternate channel</option>
                                 </select>
                                 <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                              </div>
                           </div>

                           <button className="flex items-center gap-2 px-6 h-10 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all w-fit">
                              <Zap size={16} fill="currentColor" /> Run Sample Workflow
                           </button>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "usage" && (
                     <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                     >
                        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
                           <div className="space-y-1">
                              <h3 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Usage & Limits</h3>
                              <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Current billing period: Mar 1 - Mar 31, 2026</p>
                           </div>

                           <div className="space-y-6">
                              {[
                                 { label: "Leads Processed", current: 2847, max: 5000 },
                                 { label: "Emails Sent", current: 2341, max: 10000 },
                                 { label: "Enrichments", current: 892, max: 2000 },
                                 { label: "Active Campaigns", current: 3, max: 10 },
                                 { label: "Team Seats", current: 4, max: 5, warning: "Approaching limit — consider upgrading" },
                              ].map((limit, i) => (
                                 <div key={i} className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[11px] font-bold text-[#1a1510] uppercase tracking-tight">{limit.label}</span>
                                       <span className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">
                                          <span className="text-[#1a1510]">{limit.current.toLocaleString()}</span> / {limit.max.toLocaleString()}
                                       </span>
                                    </div>
                                    <div className="h-2 w-full bg-[#fafbfc] border border-[#1a1510]/5 rounded-full overflow-hidden shadow-inner">
                                       <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(limit.current / limit.max) * 100}%` }}
                                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                                          className={`h-full ${limit.warning ? 'bg-orange-400' : 'bg-[#b99b7b]'}`}
                                       />
                                    </div>
                                    {limit.warning && (
                                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                                          <AlertTriangle size={12} />
                                          {limit.warning}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>

                           <div className="mt-4 p-5 bg-[#fafbfc]/50 border border-[#1a1510]/5 rounded-2xl flex items-center justify-between shadow-sm">
                              <div className="space-y-0.5">
                                 <h4 className="text-[13px] font-bold text-[#1a1510]">Current Plan: <span className="text-[#b99b7b]">Starter</span></h4>
                                 <p className="text-[11px] font-medium text-[#1a1510]/30 uppercase tracking-tight">Upgrade for more capacity and advanced features</p>
                              </div>
                              <button className="px-6 h-10 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
                                 Upgrade Plan
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab !== "profile" && activeTab !== "workspace" && activeTab !== "team" && activeTab !== "integrations" && activeTab !== "outreach" && activeTab !== "ai" && activeTab !== "notifications" && activeTab !== "preferences" && activeTab !== "data" && activeTab !== "workflows" && activeTab !== "usage" && (
                     <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#1a1510]/5 rounded-3xl border-dashed">
                        <div className="p-5 bg-[#b99b7b]/10 rounded-full text-[#b99b7b] mb-4 rotate-12">
                           <Settings size={32} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight uppercase">{activeTab} Controls</h3>
                        <p className="text-[10px] font-medium text-[#1a1510]/30 mt-1 uppercase tracking-widest">Interface coming soon</p>
                     </div>
                  )}

               </div>
            </section>
         </main>

         {/* Password Modal */}
         <AnimatePresence>
            {isPasswordModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsPasswordModalOpen(false)}
                     className="absolute inset-0 bg-[#1a1510]/60 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#1a1510]/5"
                  >
                     <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-2xl bg-[#b99b7b]/10 flex items-center justify-center text-[#b99b7b]">
                              <Lock size={24} />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold tracking-tight text-[#1a1510]">Change Password</h3>
                              <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Secure your account</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Current Password</label>
                              <div className="relative">
                                 <input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full h-11 px-4 pr-12 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:border-[#b99b7b]/20 focus:outline-none transition-all text-[14px] font-medium text-[#1a1510]" 
                                    placeholder="••••••••"
                                 />
                                 <button 
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 hover:text-[#b99b7b] transition-colors"
                                 >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">New Password</label>
                              <div className="relative">
                                 <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full h-11 px-4 pr-12 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:border-[#b99b7b]/20 focus:outline-none transition-all text-[14px] font-medium text-[#1a1510]" 
                                    placeholder="••••••••"
                                 />
                                 <button 
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 hover:text-[#b99b7b] transition-colors"
                                 >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Confirm New Password</label>
                              <div className="relative">
                                 <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-11 px-4 pr-12 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:border-[#b99b7b]/20 focus:outline-none transition-all text-[14px] font-medium text-[#1a1510]" 
                                    placeholder="••••••••"
                                 />
                                 <button 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/20 hover:text-[#b99b7b] transition-colors"
                                 >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                           <button 
                              onClick={() => setIsPasswordModalOpen(false)}
                              className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-all"
                           >
                              Cancel
                           </button>
                           <button 
                              onClick={handlePasswordChange}
                              disabled={isChangingPassword}
                              className="flex-[2] h-12 bg-[#1a1510] text-[#b99b7b] rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-[#1a1510]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                           >
                              {isChangingPassword ? "Updating..." : "Update Password"}
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* 2FA Setup Modal */}
         <AnimatePresence>
            {is2FAModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIs2FAModalOpen(false)}
                     className="absolute inset-0 bg-[#1a1510]/60 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#1a1510]/5"
                  >
                     <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-2xl bg-[#b99b7b]/10 flex items-center justify-center text-[#b99b7b]">
                              <Fingerprint size={24} />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold tracking-tight text-[#1a1510]">Setup 2FA</h3>
                              <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Verify your device</p>
                           </div>
                        </div>

                        {twoFAStep === "verify" && (
                           <div className="space-y-6">
                              <div className="flex justify-center p-4 bg-[#f7f8f9] rounded-2xl border border-[#1a1510]/5">
                                 {twoFAQRCode ? (
                                    <img src={twoFAQRCode} alt="2FA QR Code" className="w-48 h-48 mix-blend-multiply" />
                                 ) : (
                                    <div className="w-48 h-48 flex items-center justify-center text-[#1a1510]/20"><RefreshCw className="animate-spin" /></div>
                                 )}
                              </div>
                              
                              <div className="space-y-4">
                                 <p className="text-[11px] text-[#1a1510]/60 text-center font-medium">
                                    Scan this QR in Google Authenticator or Authy. Account name: <strong>Qhord</strong>. If scan fails, add manually with this key:
                                 </p>
                                 {twoFAManualSecret && (
                                    <p className="text-[10px] font-mono text-center break-all bg-white p-2 rounded-lg border border-[#1a1510]/10 select-all">
                                       {twoFAManualSecret}
                                    </p>
                                 )}
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-[#1a1510]/30 tracking-widest">Verification Code</label>
                                    <input 
                                       type="text" 
                                       maxLength={6}
                                       value={twoFAVerificationCode}
                                       onChange={(e) => setTwoFAVerificationCode(e.target.value.replace(/\D/g, ''))}
                                       className="w-full h-12 px-4 bg-[#f7f8f9] rounded-xl border border-transparent focus:bg-white focus:border-[#b99b7b]/20 focus:outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold text-[#1a1510]" 
                                       placeholder="000000"
                                    />
                                 </div>
                              </div>
                           </div>
                        )}

                        <div className="flex gap-3 pt-2">
                           <button 
                              onClick={() => setIs2FAModalOpen(false)}
                              className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-all"
                           >
                              Cancel
                           </button>
                           <button 
                              onClick={handle2FAVerify}
                              disabled={isVerifying2FA || twoFAVerificationCode.length !== 6}
                              className="flex-[2] h-12 bg-[#1a1510] text-[#b99b7b] rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-[#1a1510]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                           >
                              {isVerifying2FA ? "Verifying..." : "Enable 2FA"}
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Toast Message */}
         <AnimatePresence>
            {toastMessage && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-[#1a1510] text-white rounded-xl shadow-2xl border border-white/5 flex items-center gap-3"
               >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b99b7b] animate-pulse" />
                  <span className="text-[11px] font-bold tracking-tight">{toastMessage}</span>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
