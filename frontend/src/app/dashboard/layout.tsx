"use client";

import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../../components/dashboard/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { ClientProvider, useClient } from "../../contexts/ClientContext";
import { Plus, Building2, User as UserIcon, LogOut, ArrowRight, Bot } from "lucide-react";
import { PageLoader } from "../../components/ui/Loader";

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
        <PageLoader label="Loading" />
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
