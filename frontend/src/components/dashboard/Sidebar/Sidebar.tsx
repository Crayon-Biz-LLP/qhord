import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Activity, Settings, Bell, Search, Plus, Cpu, Zap, ShieldCheck,
  Terminal, BarChart3, Mail, Target, ListTodo, GraduationCap, Box, Computer,
  Sparkles, Bot, CreditCard, DollarSign, ChevronRight, User as UserIcon, LogOut, Globe, Building2, Workflow,
  MessageSquare, TrendingUp, Bookmark, ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { useClient } from "../../../contexts/ClientContext";
import { useAuth } from "../../../hooks/useAuth";
import { useCredits } from "../../../contexts/CreditContext";

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
    <aside className="w-72 border-r border-[#1a1510]/5 flex flex-col hidden md:flex bg-[#1a1510] relative z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.1)] overflow-y-auto scrollbar-hide shrink-0">
      <div className="p-6 space-y-8">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8 group">
          <div className="w-10 h-10 bg-brand-gold rounded-2xl flex items-center justify-center shadow-lg shadow-brand-gold/20 flex-shrink-0 group-hover:rotate-6 transition-transform cursor-pointer">
            <Cpu className="text-[#1a1510]" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">Qhord</span>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">GTM COMMAND CENTRE</span>
          </div>
        </Link>

        {/* Client Selector Dropdown */}
        <div className="relative mb-6">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">Active Client</span>
                <span className="text-[11px] font-black text-white truncate mt-1 leading-none">
                  {selectedClient ? selectedClient.name : "Select Client..."}
                </span>
              </div>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-white/20 group-hover:text-white transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180 text-brand-gold' : ''}`} 
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay background to close dropdown when clicked outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 right-0 mt-2 bg-[#221a12] border border-white/10 rounded-2xl shadow-2xl z-50 py-2 max-h-48 overflow-y-auto scrollbar-hide">
                {clients.length === 0 ? (
                  <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider text-center">
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
                        className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-all truncate flex items-center justify-between ${
                          isSelected 
                            ? "text-brand-gold bg-white/5 font-black" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
                <div className="border-t border-white/5 mt-1 pt-1.5">
                  <Link
                    href="/dashboard/clients"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-brand-gold hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={10} /> Establish New Client
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
              { icon: Terminal, label: "Command Center", id: 'command', href: '/dashboard/command' },
              { icon: Building2, label: "Client Accounts", id: 'clients', href: '/dashboard/clients' },
              { icon: Mail, label: "Unibox", id: 'inbox', href: '/dashboard/inbox' },
              { icon: Globe, label: "Lead Source", id: 'leads', href: '/dashboard/leads' },
              { icon: Workflow, label: "Workflows", id: 'workflows', href: '/dashboard/workflows' },
              { icon: DollarSign, label: "Deals", id: 'pipeline', href: '/dashboard/pipeline' },
              { icon: BarChart3, label: "Analytics", id: 'analytics', href: '/dashboard/analytics' },
              { icon: Box, label: "Tools Config", id: 'tools', href: '/dashboard/tools' },
              { icon: Bookmark, label: "Playbooks", id: 'playbooks', href: '/dashboard/playbooks' },
              { icon: Zap, label: "APIs & Keys", id: 'apis', href: '/dashboard/apis' },
              { icon: Globe, label: "Account Nodes", id: 'accounts', href: '/dashboard/accounts' },
            ]
          },
          {
            title: "INTELLIGENCE",
            items: [
              { icon: Sparkles, label: "AI SDR", id: 'ai-sdr', href: '/dashboard/ai-sdr' },
              { icon: Bot, label: "AI Operator", id: 'ai-operator', href: '/dashboard/ai-operator' },
              { icon: Cpu, label: "AI Engine", id: 'ai-engine', href: '/dashboard/ai-engine' },
            ]
          },
          {
            title: "SYSTEM",
            items: [
              { icon: Settings, label: "Settings", id: 'settings', href: '/dashboard/settings' },
              { icon: CreditCard, label: "Billing", id: 'billing', href: '/dashboard/billing' },
            ]
          }
        ].map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{section.title}</span>
              <ChevronRight size={10} className="text-white/10" />
            </div>
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
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-all ${isActive
                      ? "bg-brand-gold text-[#1a1510] shadow-[0_10px_20px_-5px_rgba(185,155,123,0.3)]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <item.icon size={18} className={isActive ? "text-[#1a1510]" : "text-white/20 group-hover:text-white"} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a1510]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{userCredits.toLocaleString()} credits</span>
            <Link href="/dashboard/billing" className="text-[9px] font-black text-brand-gold uppercase tracking-widest">Upgrade</Link>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
             <div className="h-full bg-brand-gold rounded-full" style={{ width: `${Math.min((userCredits / 2000) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center text-[#1a1510] font-black text-xs shadow-lg shadow-brand-gold/10">
            {user?.name?.substring(0, 2).toUpperCase() || "SM"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-white truncate">{user?.name || "Sarah Mitchell"}</span>
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate">Growth Team</span>
          </div>
          <button 
            onClick={onSignOut}
            className="ml-auto p-2 text-white/20 hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
