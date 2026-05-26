import React from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Activity, Settings, Bell, Search, Plus, Cpu, Zap, ShieldCheck,
  Terminal, BarChart3, Mail, Target, ListTodo, GraduationCap, Box, Computer,
  Sparkles, Bot, CreditCard, DollarSign, ChevronRight, User as UserIcon, LogOut, Globe, Building2, Workflow,
  MessageSquare, TrendingUp
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
