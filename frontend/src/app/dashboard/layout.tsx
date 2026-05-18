"use client";

import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../../components/dashboard/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { ClientProvider, useClient } from "../../contexts/ClientContext";
import { Plus, Building2, User as UserIcon, LogOut, ArrowRight, Bot } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth(true);
  const pathname = usePathname();

  const getActiveView = () => {
    if (pathname === "/dashboard") return "dashboard";
    return pathname.split("/").pop() as any;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold/20 rounded-full" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#1a1510]/30">Interface Initializing...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ClientProvider>
      <div className="h-screen bg-[#f7f8f9] text-[#1a1510] flex pt-0 relative overflow-hidden font-sans">
        <Sidebar 
          onSignOut={logout} 
          activeView={getActiveView()}
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {children}
        </div>
      </div>
    </ClientProvider>
  );
}
