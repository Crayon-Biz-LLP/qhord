"use client";

import React, { useState, useCallback } from "react";
import {
  User, Building2, Users, Plug, Send, Brain, Bell, SlidersHorizontal,
  Database, Workflow, BarChart3, Shield, Lock, Smartphone, Monitor,
  Globe, ChevronRight, Check, Loader2, Crown, X,
  KeyRound, Fingerprint, LogIn, Palette, Upload, Trash2, Plus,
  RefreshCw, AlertCircle, Calendar, Ghost, Layers, MessageSquare, Handshake, LayoutGrid, Search,
  Linkedin, Mail, Activity, AtSign, Info, Eye, EyeOff, Sparkles, MoveRight, Zap, AlertTriangle,
  type LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────── TYPES ─────────────────── */
type SettingsTab =
  | "profile"
  | "workspace"
  | "team"
  | "integrations"
  | "outreach"
  | "ai"
  | "notifications"
  | "preferences"
  | "data"
  | "workflows"
  | "usage";

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
  notify?: boolean;
}

/* ─────────────────── DATA ─────────────────── */
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
  {
    device: "MacBook Pro · Chrome",
    location: "San Francisco, CA",
    ip: "192.168.1.42",
    lastActive: "Active now",
    current: true,
    icon: Monitor,
  },
  {
    device: "iPhone 15 Pro · Safari",
    location: "San Francisco, CA",
    ip: "192.168.1.87",
    lastActive: "2 hours ago",
    current: false,
    icon: Smartphone,
  },
  {
    device: "Windows 11 · Edge",
    location: "New York, NY",
    ip: "74.125.224.72",
    lastActive: "3 days ago",
    current: false,
    icon: Globe,
  },
];

/* ─────────────────── REUSABLE: TOGGLE ─────────────────── */
const GoldToggle = ({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`relative w-12 h-[26px] rounded-full transition-colors duration-300 focus:outline-none ${enabled
        ? "bg-gradient-to-r from-brand-gold to-[#D4AF37]"
        : "bg-[#1a1510]/10"
      }`}
    aria-label="Toggle"
  >
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`absolute top-[3px] w-5 h-5 rounded-full shadow-md ${enabled ? "left-[26px] bg-white" : "left-[3px] bg-white"
        }`}
    />
  </button>
);

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Form state
  const [fullName, setFullName] = useState("Sarah Mitchell");
  const [email, setEmail] = useState("sarah.mitchell@qhord.io");
  const [twoFA, setTwoFA] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Settings saved successfully");
    }, 1500);
  }, [showToast]);

  /* ══════════════════ PROFILE PANEL ══════════════════ */
  const ProfilePanel = () => (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      {/* ── Profile Information ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-[18px] font-black text-[#1a1510] tracking-tight">Profile Information</h2>
          <p className="text-[12px] font-medium text-[#1a1510]/35">Update your personal details and account settings</p>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-5">
          {/* Avatar row */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center text-brand-gold font-black text-xl shadow-sm">
              SM
            </div>
            <div className="space-y-0.5">
              <p className="text-[14px] font-bold text-[#1a1510]">Sarah Mitchell</p>
              <p className="text-[11px] font-medium text-[#1a1510]/30">Growth Team · Admin</p>
            </div>
            <button className="ml-auto px-5 h-9 bg-[#f7f8f9] border border-[#e5e7eb] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1a1510]/50 hover:text-brand-gold hover:border-brand-gold/30 transition-all">
              Upload Photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] placeholder-[#1a1510]/20 outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] placeholder-[#1a1510]/20 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Security ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-brand-gold" />
            <h2 className="text-[18px] font-black text-[#1a1510] tracking-tight">Security</h2>
          </div>
          <p className="text-[12px] font-medium text-[#1a1510]/35">Manage your authentication methods and session security</p>
        </div>

        <div className="space-y-3">
          {/* Password */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center justify-between group hover:shadow-md hover:border-brand-gold/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                <Lock size={18} className="text-brand-gold" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#1a1510]">Password</h4>
                <p className="text-[11px] font-medium text-[#1a1510]/30">Last changed 30 days ago</p>
              </div>
            </div>
            <button className="px-5 h-10 border border-brand-gold/30 text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold/5 transition-all">
              Change Password
            </button>
          </div>

          {/* 2FA */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center justify-between group hover:shadow-md hover:border-brand-gold/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                <Fingerprint size={18} className="text-brand-gold" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#1a1510]">Two-Factor Authentication</h4>
                <p className="text-[11px] font-medium text-[#1a1510]/30">
                  {twoFA ? "Enabled — adds an extra layer of security" : "Protect your account with 2FA verification"}
                </p>
              </div>
            </div>
            <GoldToggle enabled={twoFA} onToggle={() => setTwoFA(!twoFA)} />
          </div>

          {/* SSO */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center justify-between group hover:shadow-md hover:border-brand-gold/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                <LogIn size={18} className="text-brand-gold" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#1a1510] flex items-center gap-2.5">
                  Single Sign-On (SSO)
                  <span className="px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-[8px] font-black uppercase tracking-widest rounded-md">
                    Enterprise
                  </span>
                </h4>
                <p className="text-[11px] font-medium text-[#1a1510]/30">Sign in with Google, Okta, or SAML provider</p>
              </div>
            </div>
            <button className="px-5 h-10 border border-[#e5e7eb] text-[#1a1510]/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-gold hover:border-brand-gold/30 transition-all">
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Sessions ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-[18px] font-black text-[#1a1510] tracking-tight">Active Sessions</h2>
          <p className="text-[12px] font-medium text-[#1a1510]/35">Devices currently signed in to your account</p>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden divide-y divide-[#e5e7eb]/60">
          {SESSIONS.map((session, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex items-center justify-between p-5 group hover:bg-[#fafbfc] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.current ? "bg-brand-gold/10 text-brand-gold" : "bg-[#f7f8f9] text-[#1a1510]/25"
                  }`}>
                  <session.icon size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-[13px] font-bold text-[#1a1510]">{session.device}</h4>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                        This Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-[#1a1510]/25">
                    {session.location} · {session.ip} ·{" "}
                    <span className={session.current ? "text-emerald-500 font-bold" : "text-[#1a1510]/25"}>
                      {session.lastActive}
                    </span>
                  </p>
                </div>
              </div>
              {!session.current && (
                <button className="px-4 h-9 text-[10px] font-black uppercase tracking-widest text-red-500/60 border border-red-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all">
                  Revoke
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  /* ══════════════════ WORKSPACE PANEL ══════════════════ */
  const WorkspacePanel = () => (
    <motion.div
      key="workspace"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div className="space-y-1">
        <h2 className="text-[18px] font-black text-[#1a1510] tracking-tight">Workspace Configuration</h2>
        <p className="text-[12px] font-medium text-[#1a1510]/35">Manage your global workspace settings, branding, and defaults</p>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-7 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Workspace Name</label>
            <input type="text" defaultValue="Growth Team" className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Domain</label>
            <input type="text" defaultValue="company.com" className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none transition-all" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Timezone</label>
            <div className="relative">
              <select className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none transition-all appearance-none">
                <option>Eastern (EST)</option>
                <option>Pacific (PST)</option>
                <option>Central (CST)</option>
                <option>London (GMT)</option>
              </select>
              <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30 rotate-90" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Default Campaign Owner</label>
            <div className="relative">
              <select className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none transition-all appearance-none">
                <option>Sarah M.</option>
                <option>James R.</option>
                <option>Anna C.</option>
              </select>
              <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30 rotate-90" />
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Default Meeting Link</label>
            <input type="text" defaultValue="https://calendly.com/team/30min" className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1510]/25">Default Slack Channel</label>
            <input type="text" defaultValue="#outbound-alerts" className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none transition-all" />
          </div>
        </div>

        <div className="border-t border-[#e5e7eb]/60 pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-brand-gold" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1510]">Branding</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100/50 rounded-xl flex items-center justify-center text-blue-600">
                <Upload size={16} />
              </div>
              <button className="px-4 h-8 bg-white border border-[#e5e7eb] rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#1a1510] hover:border-brand-gold transition-all shadow-sm">
                Upload Logo
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showToast("Workspace settings saved!")}
              className="px-6 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md shadow-[#1a1510]/10 hover:-translate-y-0.5 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  /* ══════════════════ TEAM PANEL ══════════════════ */
  /* ══════════════════ TEAM PANEL ══════════════════ */
  const TeamPanel = () => {
    const members = [
      { name: "Sarah Mitchell", email: "sarah@company.com", role: "Admin", permissions: ["Full Access"], status: "active", current: true },
      { name: "Mike Thompson", email: "mike@company.com", role: "SDR", permissions: ["Campaigns"], status: "active" },
      { name: "Lisa Kim", email: "lisa@company.com", role: "AE", permissions: ["Campaigns", "Analytics"], status: "active" },
      { name: "David Chen", email: "david@company.com", role: "RevOps", permissions: ["Campaigns", "Analytics", "Workflows"], status: "invited" },
    ];

    return (
      <motion.div
        key="team"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Team Management</h2>
          <button className="px-5 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#1a1510]/10 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus size={16} /> Invite User
          </button>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafbfc] border-b border-[#e5e7eb]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Permissions</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/60">
                {members.map((member, i) => (
                  <tr key={i} className="hover:bg-[#fafbfc]/40 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1a1510]/5 border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510] font-bold text-[11px] shadow-sm">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-[#1a1510] leading-tight">{member.name}</h4>
                          <p className="text-[11px] font-medium text-[#1a1510]/30">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative min-w-[120px]">
                        <select
                          defaultValue={member.role}
                          className="w-full h-9 bg-[#f7f8f9] border border-[#e5e7eb] rounded-lg px-3 pr-8 text-[11px] font-bold text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all"
                        >
                          <option>Admin</option>
                          <option>SDR</option>
                          <option>AE</option>
                          <option>RevOps</option>
                        </select>
                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                      </div>
                    </td>

                    {/* Permissions Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {member.permissions.map((perm, idx) => (
                          <span key={idx} className="px-3 py-1 bg-[#1a1510]/5 border border-[#1a1510]/5 rounded-full text-[10px] font-bold text-[#1a1510]/60 whitespace-nowrap">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Tag */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${member.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100/60"
                          : "bg-amber-50 text-amber-600 border border-amber-100/60"
                        }`}>
                        {member.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {!member.current && (
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
    );
  };

  /* ══════════════════ INTEGRATIONS PANEL ══════════════════ */
  const IntegrationsPanel = () => {
    const integrations = [
      { name: "Apollo", status: "connected", sync: "2m ago", key: "sk_apollo_3f8a", icon: Search, color: "text-blue-500", bg: "bg-blue-50" },
      { name: "Clay", status: "connected", sync: "8m ago", key: "clay_key_9b2c", icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
      { name: "Smartlead", status: "connected", sync: "15m ago", key: "s1_api_7d4e", icon: Mail, color: "text-indigo-600", bg: "bg-indigo-50" },
      { name: "HeyReach", status: "warning", sync: "1h ago", key: "hr_key_2f1a", icon: Handshake, color: "text-amber-600", bg: "bg-amber-50" },
      { name: "HubSpot", status: "connected", sync: "3h ago", key: "hs_pat_8c5b", icon: LayoutGrid, color: "text-orange-600", bg: "bg-orange-50" },
      { name: "Salesforce", status: "disconnected", sync: "Never", key: null, icon: Database, color: "text-blue-400", bg: "bg-blue-50" },
      { name: "Slack", status: "connected", sync: "1m ago", key: "xoxb_slack_4a7d", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
      { name: "Calendly", status: "connected", sync: "5m ago", key: "cal_key_6e3f", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    ];

    return (
      <motion.div
        key="integrations"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Connected Integrations</h2>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Manage API keys and sync status</p>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="px-2 py-0.5 bg-[#1a1510]/5 border border-[#1a1510]/5 rounded-full text-[9px] font-bold text-[#1a1510]/60">6 connected</span>
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-full text-[9px] font-bold">1 warning</span>
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
              className={`group flex items-center gap-5 p-4 bg-white border rounded-2xl transition-all shadow-sm ${
                int.status === "warning" ? "border-amber-200 bg-amber-50/20" : "border-[#1a1510]/5 hover:border-[#b99b7b]/20"
              }`}
            >
              <div className={`w-11 h-11 ${int.bg} rounded-xl flex items-center justify-center ${int.color} shrink-0 shadow-sm border border-black/5`}>
                <int.icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <h4 className="text-[14px] font-bold text-[#1a1510] tracking-tight">{int.name}</h4>
                  <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    int.status === "connected" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    int.status === "warning" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-red-50 text-red-500 border-red-100"
                  }`}>
                    {int.status === "connected" && <span className="w-1 h-1 rounded-full bg-emerald-600" />}
                    {int.status === "warning" && <AlertCircle size={10} />}
                    {int.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-medium text-[#1a1510]/30 whitespace-nowrap">Last sync: {int.sync}</p>
                  {int.key && (
                    <p className="text-[11px] font-mono font-medium text-[#1a1510]/20 tracking-tighter">
                      <span className="hidden sm:inline">••••••••</span>{int.key}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select className="h-9 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-lg px-3 pr-8 text-[11px] font-bold text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all cursor-pointer">
                    <option>Real-time</option>
                    <option>Every 1h</option>
                    <option>Daily</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 rotate-90" />
                </div>

                {int.status === "disconnected" ? (
                  <button className="px-5 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
                    Connect
                  </button>
                ) : int.status === "warning" ? (
                  <button className="px-5 h-9 bg-[#1a1510] text-amber-500 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all border border-amber-500/20">
                    Reconnect
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button className="px-3 h-9 bg-white border border-[#1a1510]/10 text-[#1a1510]/60 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#fafbfc] transition-all">
                      <RefreshCw size={14} /> Test
                    </button>
                    <button className="px-5 h-9 bg-[#1a1510] text-[#b99b7b] rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all">
                      Sync Now
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };
  /* ══════════════════ OUTREACH PANEL ══════════════════ */
  const OutreachPanel = () => {
    const [safetyMode, setSafetyMode] = useState(true);

    return (
      <motion.div
        key="outreach"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        {/* Email & Deliverability */}
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Email & Deliverability</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Sending Domains */}
            <div className="space-y-4 border border-[#1a1510]/5 rounded-2xl p-5 bg-[#fafbfc]/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30">Sending Domains</span>
              </div>
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

            {/* Warmup Status */}
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
              <input type="text" defaultValue="200" className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Inbox Rotation</label>
              <div className="relative">
                <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all">
                  <option>Round Robin</option>
                  <option>Sequential</option>
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30 rotate-90" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Auto-pause threshold</label>
              <input type="text" defaultValue="5% bounce rate" className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
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

        {/* LinkedIn Settings */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1a1510] tracking-tight">LinkedIn Settings</h2>
          </div>

          <div className="p-4 border border-[#1a1510]/5 rounded-2xl bg-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50">
                <Linkedin size={20} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1a1510]">sarah.linkedin</p>
                <p className="text-[11px] font-medium text-[#1a1510]/30">Primary account</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100/60">
              Connected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Daily Connection Limit</label>
              <input type="text" defaultValue="25" className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Daily Message Limit</label>
              <input type="text" defaultValue="50" className="w-full h-11 bg-[#f7f8f9] border border-[#e5e7eb] rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none focus:border-[#b99b7b]/30 transition-all" />
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
    );
  };

  /* ══════════════════ AI PREFERENCES PANEL ══════════════════ */
  const AIPanel = () => {
    const [autoReply, setAutoReply] = useState(true);
    const [autoPause, setAutoPause] = useState(true);
    const [autoOptimize, setAutoOptimize] = useState(false);
    const [autoScore, setAutoScore] = useState(true);

    const toggles = [
      { id: 'reply', label: "Auto-reply suggestions", sub: "AI generates reply drafts for positive replies", state: autoReply, setter: setAutoReply },
      { id: 'pause', label: "Auto-pause campaigns", sub: "Pause campaigns when metrics drop below threshold", state: autoPause, setter: setAutoPause },
      { id: 'optimize', label: "Auto-optimize sequences", sub: "AI adjusts send times and subject lines automatically", state: autoOptimize, setter: setAutoOptimize },
      { id: 'score', label: "Auto-score leads", sub: "AI assigns lead scores based on engagement", state: autoScore, setter: setAutoScore },
    ];

    return (
      <motion.div
        key="ai"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">AI Preferences</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Customize how AI behaves across the platform</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Tone</label>
              <div className="relative">
                <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all">
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Direct</option>
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30 rotate-90" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Personalization Depth</label>
              <div className="relative">
                <select className="w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] outline-none appearance-none focus:border-[#b99b7b]/30 transition-all">
                  <option>Medium — Company research</option>
                  <option>Light — First name only</option>
                  <option>Deep — Social media synthesis</option>
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30 rotate-90" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1510]/30 block">Auto-Actions</span>
            <div className="space-y-3">
              {toggles.map((t) => (
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
    );
  };

  /* ══════════════════ NOTIFICATIONS PANEL ══════════════════ */
  const NotificationsPanel = () => {
    const [events, setEvents] = useState([
      { id: "replies", label: "New replies", email: true, slack: true, inapp: true },
      { id: "meeting", label: "Meeting booked", email: true, slack: true, inapp: true },
      { id: "errors", label: "Campaign errors", email: true, slack: true, inapp: true },
      { id: "deliverability", label: "Low deliverability", email: true, slack: true, inapp: false },
      { id: "intent", label: "High intent leads", email: false, slack: true, inapp: true },
      { id: "enrichment", label: "Enrichment complete", email: false, slack: true, inapp: false },
      { id: "weekly", label: "Weekly digest", email: true, slack: false, inapp: false },
    ]);

    const toggleStatus = (id: string, type: 'email' | 'slack' | 'inapp') => {
      setEvents(events.map(e => e.id === id ? { ...e, [type]: !e[type] } : e));
    };

    return (
      <motion.div
        key="notifications"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 shadow-sm">
          <div className="space-y-1 mb-8">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Notification Preferences</h2>
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
                {events.map((event) => (
                  <tr key={event.id} className="group transition-colors">
                    <td className="py-5 text-[13px] font-bold text-[#1a1510]">{event.label}</td>
                    <td className="py-5">
                      <div className="flex justify-center">
                        <GoldToggle enabled={event.email} onToggle={() => toggleStatus(event.id, 'email')} />
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex justify-center">
                        <GoldToggle enabled={event.slack} onToggle={() => toggleStatus(event.id, 'slack')} />
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex justify-center">
                        <GoldToggle enabled={event.inapp} onToggle={() => toggleStatus(event.id, 'inapp')} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ══════════════════ PREFERENCES PANEL ══════════════════ */
  const PreferencesPanel = () => {
    const [motivationPopups, setMotivationPopups] = useState(true);

    return (
      <motion.div
        key="preferences"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Preferences</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Customize your workspace experience</p>
          </div>

          <div className="p-5 border border-[#1a1510]/5 rounded-2xl bg-[#fafbfc]/30 flex items-center justify-between shadow-sm">
            <div>
              <h4 className="text-[13px] font-bold text-[#1a1510]">Sales Motivation Pop-ups</h4>
              <p className="text-[11px] font-medium text-[#1a1510]/30">Show motivational sales quotes throughout the day</p>
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
    );
  };
  /* ══════════════════ DATA & CRM PANEL ══════════════════ */
  const DataPanel = () => {
    const [pushQualified, setPushQualified] = useState(true);
    const [pushAll, setPushAll] = useState(false);
    const [createDeals, setCreateDeals] = useState(true);
    const [selectedCRM, setSelectedCRM] = useState('hubspot');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const crms = [
      { id: 'hubspot', name: 'HubSpot', color: '#ff7a59' },
      { id: 'salesforce', name: 'Salesforce', color: '#00a1e0' },
      { id: 'pipedrive', name: 'Pipedrive', color: '#22d3ee' },
    ];

    const currentCRM = crms.find(c => c.id === selectedCRM) || crms[0];

    const rules = [
      { id: 'qualified', label: "Push qualified leads only", sub: "Only push leads with positive reply or meeting booked", state: pushQualified, setter: setPushQualified },
      { id: 'all', label: "Push all leads", sub: "Push every lead to CRM regardless of status", state: pushAll, setter: setPushAll },
      { id: 'deals', label: "Create deals on meeting booked", sub: "Automatically create a deal/opportunity when meeting is booked", state: createDeals, setter: setCreateDeals },
    ];

    return (
      <motion.div
        key="data"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Data & CRM Settings</h2>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Default CRM</label>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full h-11 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-xl px-4 text-[13px] font-medium text-[#1a1510] transition-all hover:border-[#b99b7b]/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentCRM.color }} />
                {currentCRM.name}
              </div>
              <ChevronRight size={14} className={`text-[#1a1510]/30 transition-transform ${isDropdownOpen ? "-rotate-90" : "rotate-90"}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
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
                          setIsDropdownOpen(false);
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
              {rules.map((rule) => (
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
    );
  };

  /* ══════════════════ WORKFLOWS PANEL ══════════════════ */
  const WorkflowPanel = () => {
    return (
      <motion.div
        key="workflows"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Workflow Defaults</h2>
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
    );
  };
  /* ══════════════════ USAGE & LIMITS PANEL ══════════════════ */
  const UsagePanel = () => {
    const limits = [
      { label: "Leads Processed", current: 2847, max: 5000 },
      { label: "Emails Sent", current: 2341, max: 10000 },
      { label: "Enrichments", current: 892, max: 2000 },
      { label: "Active Campaigns", current: 3, max: 10 },
      { label: "Team Seats", current: 4, max: 5, warning: "Approaching limit — consider upgrading" },
    ];

    return (
      <motion.div
        key="usage"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-7 space-y-7 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#1a1510] tracking-[0.2em] uppercase">Usage & Limits</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Current billing period: Mar 1 - Mar 31, 2026</p>
          </div>

          <div className="space-y-6">
            {limits.map((limit, i) => (
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
    );
  };

  const PlaceholderPanel = ({ tab }: { tab: SettingsTab }) => {
    const item = NAV_ITEMS.find((n) => n.id === tab);
    const IconComp = item?.icon;
    return (
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-8"
      >
        <div className="space-y-1">
          <h2 className="text-[18px] font-black text-[#1a1510] tracking-tight">{item?.label}</h2>
          <p className="text-[12px] font-medium text-[#1a1510]/35">Configure your {item?.label?.toLowerCase()} settings</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
            {IconComp && <IconComp size={28} className="text-brand-gold" />}
          </div>
          <div className="space-y-1.5">
            <h3 className="text-[15px] font-black text-[#1a1510]">{item?.label} Settings</h3>
            <p className="text-[12px] text-[#1a1510]/30 font-medium max-w-xs">
              Configure advanced {item?.label?.toLowerCase()} options to fine-tune your GTM engine.
            </p>
          </div>
          <button className="mt-2 px-6 h-10 bg-[#f7f8f9] border border-[#e5e7eb] rounded-xl text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest hover:text-brand-gold hover:border-brand-gold/30 transition-all">
            Coming Soon
          </button>
        </div>
      </motion.div>
    );
  };

  /* ── RENDER TAB CONTENT ── */
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePanel />;
      case "workspace":
        return <WorkspacePanel />;
      case "team":
        return <TeamPanel />;
      case "integrations":
        return <IntegrationsPanel />;
      case "outreach":
        return <OutreachPanel />;
      case "ai":
        return <AIPanel />;
      case "notifications":
        return <NotificationsPanel />;
      case "preferences":
        return <PreferencesPanel />;
      case "data":
        return <DataPanel />;
      case "workflows":
        return <WorkflowPanel />;
      case "usage":
        return <UsagePanel />;
      default:
        return <PlaceholderPanel tab={activeTab} />;
    }
  };

  /* ═══════════════════════════════════════════════ */
  /*                  MAIN RENDER                    */
  /* ═══════════════════════════════════════════════ */
  return (
    <div className="flex-1 overflow-hidden bg-white relative font-sans flex flex-col">

      {/* ═══════════ HEADER ═══════════ */}
      <section className="relative z-10 max-w-[1200px] w-full mx-auto px-6 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-[#1a1510] tracking-tight">Settings</h1>
            <p className="text-[11px] text-[#1a1510]/35 font-medium">Control your entire revenue engine from one place</p>
          </div>
        </div>
      </section>

      {/* ═══════════ BODY: SIDEBAR + CONTENT ═══════════ */}
      <section className="relative z-10 flex-1 overflow-hidden flex max-w-[1200px] w-full mx-auto px-6 pb-6">
        <div className="flex gap-6 w-full min-h-0">

          {/* ── SETTINGS SIDEBAR NAV ── */}
          <nav className="w-48 shrink-0 py-1 overflow-y-auto scrollbar-hide">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.id === activeTab;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all relative ${isActive
                        ? "bg-brand-gold text-[#1a1510] shadow-md shadow-brand-gold/10"
                        : "text-[#1a1510]/35 hover:text-[#1a1510]/60 hover:bg-[#f7f8f9]"
                      }`}
                  >
                    <IconComp
                      size={14}
                      className={isActive ? "text-[#1a1510]" : "text-brand-gold/50"}
                    />
                    {item.label}
                    {item.notify && !isActive && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-gold shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── CONTENT AREA ── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1 min-h-0 pb-8">
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

            {/* ── SAVE FOOTER (Profile tab) — placed at end of scroll content ── */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-6"
              >
                <div className="flex items-center justify-between p-4 bg-[#fafbfc] border border-[#e5e7eb] rounded-xl">
                  <p className="text-[10px] font-medium text-[#1a1510]/25">Unsaved changes detected</p>
                  <div className="flex items-center gap-3">
                    <button className="px-4 h-8 text-[9px] font-bold uppercase tracking-widest text-[#1a1510]/30 hover:text-[#1a1510]/60 transition-all">
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="group relative px-6 h-9 bg-[#1a1510] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md shadow-[#1a1510]/10 hover:bg-brand-gold hover:text-[#1a1510] disabled:opacity-60 transition-all overflow-hidden"
                    >
                      <span className="relative flex items-center gap-2">
                        {saving ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            Save Changes
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ TOAST NOTIFICATION ═══════════ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[60] px-6 py-3 bg-[#1a1510] text-white rounded-xl shadow-xl flex items-center gap-3 border border-white/5"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={12} className="text-emerald-400" strokeWidth={3} />
            </div>
            <span className="text-[12px] font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
