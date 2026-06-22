import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Activity, Settings, Bell, Search, Plus, Cpu, Zap, ShieldCheck,
  Terminal, BarChart3, Mail, Target, ListTodo, GraduationCap, Box, Computer,
  Sparkles, Bot, CreditCard, DollarSign, ChevronRight, User as UserIcon, LogOut, Globe, Building2, Workflow,
  MessageSquare, TrendingUp, Bookmark, ChevronDown,
  Briefcase, Inbox, GitBranch, Handshake, LineChart, Wrench, BookOpen, KeyRound, Network, Megaphone, BrainCircuit, Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import { useClient } from "../../../contexts/ClientContext";
import { useAuth } from "../../../hooks/useAuth";
import { useCredits } from "../../../contexts/CreditContext";
import { DataSourceIcon } from "../../ui/icons/DataSourceIcon";
import { ClientAccountsIcon } from "../../ui/icons/ClientAccountsIcon";
import { InboxIcon } from "../../ui/icons/InboxIcon";
import { AccountNodesIcon } from "../../ui/icons/AccountNodesIcon";
import { LeadSourceIcon } from "../../ui/icons/LeadSourceIcon";
import { WorkflowsIcon } from "../../ui/icons/WorkflowsIcon";
import { DealsIcon } from "../../ui/icons/DealsIcon";
import { AnalyticsIcon } from "../../ui/icons/AnalyticsIcon";
import { ToolsIcon } from "../../ui/icons/ToolsIcon";

export type DashboardView = 
  | 'dashboard' 
  | 'clients' 
  | 'command' 
  | 'workflows' 
  | 'campaigns' 
  | 'inbox' 
  | 'pipeline' 
  | 'leads' 
  | 'accounts' 
  | 'tools' 
  | 'playbooks' 
  | 'apis' 
  | 'pricing' 
  | 'billing' 
  | 'settings' 
  | 'analytics' 
  | 'ai-sdr' 
  | 'ai-operator' 
  | 'ai-engine';

interface SidebarProps {
  onSignOut?: () => void;
  activeView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
}

export const Sidebar = ({ onSignOut, activeView = 'dashboard', onViewChange }: SidebarProps) => {
  const { clients, selectedClient, setSelectedClient } = useClient();
  const { user } = useAuth();
  const { userCredits } = useCredits();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <aside className="w-64 border-r border-white/[0.06] flex flex-col hidden md:flex bg-gradient-to-b from-[#201810] via-[#1a1510] to-[#16110c] relative z-20 overflow-y-auto scrollbar-hide shrink-0">
      {/* decorative top glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-gold/10 rounded-full blur-[100px]" />
      <div className="relative p-4 space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pt-1 group">
          <div className="w-9 h-9 bg-brand-gold rounded-xl flex items-center justify-center shadow-lg shadow-brand-gold/20 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Cpu className="text-[#1a1510]" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-tight text-white leading-none">Qhord</span>
            <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.18em] mt-1">GTM Command Centre</span>
          </div>
        </Link>

        {/* Client Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/15 rounded-xl transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                <Building2 size={15} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-semibold text-white/35 uppercase tracking-wider leading-none">Active Client</span>
                <span className="text-[13px] font-semibold text-white truncate mt-1 leading-none">
                  {selectedClient ? selectedClient.name : "Select Client…"}
                </span>
              </div>
            </div>
            <ChevronDown
              size={15}
              className={`text-white/30 group-hover:text-white transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180 text-brand-gold' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay background to close dropdown when clicked outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

              {/* Dropdown Menu */}
              <div className="absolute left-0 right-0 mt-2 bg-[#221a12] border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 max-h-52 overflow-y-auto scrollbar-hide">
                {clients.length === 0 ? (
                  <div className="px-4 py-2 text-[12px] font-medium text-white/35 text-center">
                    No clients found
                  </div>
                ) : (
                  clients.map((c) => {
                    const isSelected = selectedClient?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedClient(c);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-[13px] font-medium transition-colors truncate flex items-center justify-between ${
                          isSelected
                            ? "text-brand-gold bg-white/5"
                            : "text-white/55 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
                <div className="border-t border-white/5 mt-1 pt-1">
                  <Link
                    href="/dashboard/clients"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-[12px] font-semibold text-brand-gold hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Plus size={13} /> Add new client
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {[
          {
            title: "NAVIGATION",
            items: [
              { icon: DataSourceIcon, label: "Command Center", id: 'command', href: '/dashboard/command' },
              { icon: ClientAccountsIcon, label: "Client Accounts", id: 'clients', href: '/dashboard/clients' },
              { icon: InboxIcon, label: "Unibox", id: 'inbox', href: '/dashboard/inbox' },
              { icon: LeadSourceIcon, label: "Lead Source", id: 'leads', href: '/dashboard/leads' },
              { icon: WorkflowsIcon, label: "Workflows", id: 'workflows', href: '/dashboard/workflows' },
              { icon: DealsIcon, label: "Deals", id: 'pipeline', href: '/dashboard/pipeline' },
              { icon: AnalyticsIcon, label: "Analytics", id: 'analytics', href: '/dashboard/analytics' },
              { icon: ToolsIcon, label: "Tools Config", id: 'tools', href: '/dashboard/tools' },
            ]
          },
          {
            title: "SYSTEM",
            items: [
              { icon: Settings, label: "Settings", id: 'settings', href: '/dashboard/settings' },
              { icon: Wallet, label: "Billing", id: 'billing', href: '/dashboard/billing' },
            ]
          }
        ].map((section, idx) => (
          <div key={idx} className="space-y-1">
            <span className="block px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">{section.title}</span>
            <div className="space-y-0.5">
              {section.items.map((item, i) => {
                const isActive = item.id === activeView;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={(e) => {
                      if (onViewChange) {
                        e.preventDefault();
                        onViewChange(item.id as DashboardView);
                      }
                    }}
                    className={`group relative w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${isActive
                      ? "bg-gradient-to-r from-brand-gold to-[#cba87f] text-[#1a1510] shadow-[0_8px_20px_-6px_rgba(185,155,123,0.5)]"
                      : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                      }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeBar"
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-gold"
                      />
                    )}
                    <span className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors shrink-0 ${isActive ? "bg-[#1a1510]/10" : "bg-white/[0.04] group-hover:bg-white/[0.08]"}`}>
                      <item.icon size={14} className={isActive ? "text-[#1a1510]" : "text-white/45 group-hover:text-white transition-colors"} />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-auto p-4 space-y-3 border-t border-white/[0.06]">
        <div className="relative p-3.5 rounded-xl bg-gradient-to-br from-brand-gold/[0.12] to-white/[0.02] border border-brand-gold/15 space-y-2.5 overflow-hidden">
          <div className="absolute -top-8 -right-6 w-24 h-24 bg-brand-gold/15 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white leading-none">{userCredits.toLocaleString()}</span>
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider mt-1">Credits left</span>
            </div>
            <Link href="/dashboard/billing" className="px-3 py-1.5 rounded-lg bg-brand-gold text-[#1a1510] text-[10px] font-bold uppercase tracking-wider hover:bg-[#cba87f] transition-colors">Upgrade</Link>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
             <div className="h-full bg-gradient-to-r from-brand-gold to-[#cba87f] rounded-full" style={{ width: `${Math.min((userCredits / 2000) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-gold to-[#a98b6c] flex items-center justify-center text-[#1a1510] font-bold text-[12px] shrink-0">
            {user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-white truncate">{user?.name || "—"}</span>
            <span className="text-[11px] font-medium text-white/35 truncate">{user?.email || ""}</span>
          </div>
          <button
            onClick={onSignOut}
            className="ml-auto p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
