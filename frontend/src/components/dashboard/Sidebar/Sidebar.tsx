import React from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Activity, Settings, Bell, Search, Plus, Cpu, Zap, ShieldCheck,
  Terminal, BarChart3, Mail, Target, ListTodo, GraduationCap, Box, Computer,
  Sparkles, Bot, CreditCard, DollarSign, ChevronRight, User as UserIcon, LogOut, Globe, Building2
} from "lucide-react";
import { useClient } from "../../../contexts/ClientContext";
import { useAuth } from "../../../hooks/useAuth";

interface SidebarProps {
  onSignOut?: () => void;
  activeView: 'dashboard' | 'command' | 'campaigns' | 'inbox' | 'pipeline' | 'leads' | 'accounts' | 'tools' | 'playbooks' | 'apis' | 'pricing' | 'billing' | 'settings';
}

export const Sidebar = ({ onSignOut, activeView }: SidebarProps) => {
  const { clients, selectedClient, setSelectedClient } = useClient();
  const { user } = useAuth();

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
            title: "CORE",
            items: [
              { icon: LayoutDashboard, label: "Dashboard", id: 'dashboard', href: '/dashboard' },
              { icon: Users, label: "Clients", id: 'clients', href: '/dashboard/clients' },
            ]
          },
          {
            title: "DATA",
            items: [
              { icon: Box, label: "Tools", id: 'tools', href: '/dashboard/tools' },
            ]
          },
          {
            title: "SYSTEM",
            items: [
              { icon: CreditCard, label: "Billing", id: 'billing', href: '/dashboard/billing' },
              { icon: Settings, label: "Settings", id: 'settings', href: '/dashboard/settings' },
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
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-all ${isActive
                      ? "bg-brand-gold text-[#1a1510] shadow-[0_10px_20px_-5px_rgba(185,155,123,0.3)]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-6 space-y-6 border-t border-white/5 bg-black/20">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-gold/10 text-brand-gold">
              <Zap size={14} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">2,847 credits left</p>
              <button className="text-[9px] font-black uppercase tracking-widest text-brand-gold hover:underline">Buy more →</button>
            </div>
          </div>
        </div>
        {/* Client Selector */}
        <div className="space-y-2 px-2 pb-2 border-b border-white/5">
          <label className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] px-2 flex items-center justify-between">
            Active Node
            <Building2 size={10} />
          </label>
          <div className="relative group">
            <select
              value={selectedClient?.id || ""}
              onChange={(e) => {
                const client = clients.find(c => c.id === e.target.value);
                if (client) setSelectedClient(client);
              }}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-[11px] font-bold text-white outline-none appearance-none focus:border-brand-gold/30 transition-all cursor-pointer group-hover:bg-white/10"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id} className="bg-[#1a1510] text-white">
                  {client.name}
                </option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none rotate-90 group-hover:text-brand-gold transition-colors" />
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4 px-2 group">
          <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-black text-xs">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'OP'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate">{user?.name || 'Operator'}</p>
            <p className="text-[10px] font-medium text-white/30 truncate">{user?.email || 'N/A'}</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 text-brand-gold hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-white/5 hover:border-red-400/20"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

