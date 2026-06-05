"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";
import type { Execution } from "../../../types";

export default function ExecutionsPage() {
  const { user, loading } = useAuth(true);
  const [executions, setExecutions] = useState<Execution[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/executions");
        setExecutions(res.data.executions);
      } catch (err) {
        console.error(err);
      }
    }
    if (user) {
      load();
    }
  }, [user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]"><Loader size={40} /></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="mb-4 text-xl font-semibold">Execution logs</h2>
        <div className="card">
          {executions.length === 0 ? (
            <p className="text-xs text-slate-400">No executions yet.</p>
          ) : (
            <div className="max-h-[540px] overflow-auto text-xs">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 text-left">Time</th>
                    <th className="px-2 text-left">Client</th>
                    <th className="px-2 text-left">Tool</th>
                    <th className="px-2 text-left">Action</th>
                    <th className="px-2 text-left">Status</th>
                    <th className="px-2 text-left">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((e) => (
                    <tr key={e.id} className="rounded-lg bg-slate-900/80">
                      <td className="px-2 py-1 align-top text-[11px]">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 align-top text-[11px]">{e.client_id.slice(0, 8)}</td>
                      <td className="px-2 py-1 align-top text-[11px] uppercase">{e.tool_name}</td>
                      <td className="px-2 py-1 align-top text-[11px]">{e.action}</td>
                      <td className="px-2 py-1 align-top text-[11px]">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] ${
                            e.status === "success"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : e.status === "error"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-slate-500/20 text-slate-200"
                          }`}
                        >
                          {e.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-top text-[11px] text-red-300">
                        {e.error_message ? e.error_message.slice(0, 120) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

