"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/command", label: "Command" },
    { href: "/dashboard/campaigns", label: "Campaigns" },
    { href: "/dashboard/inbox", label: "Inbox" },
    { href: "/dashboard/pipeline", label: "Pipeline" },
    { href: "/dashboard/leads", label: "Leads" },
    { href: "/dashboard/tools", label: "Tools" },
    { href: "/dashboard/pricing", label: "Pricing" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 p-4">
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight">GTM Control Tower</h1>
        {user && <p className="mt-1 text-xs text-slate-400">Signed in as {user.email}</p>}
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="mt-4 text-left text-xs text-slate-400 hover:text-red-400"
        onClick={logout}
      >
        Sign out
      </button>
    </aside>
  );
}

