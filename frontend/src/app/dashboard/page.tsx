"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import type { Client } from "../../types";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await api.get("/clients");
        setClients(res.data.clients);
      } catch (err) {
        console.error(err);
      }
    }
    if (user) {
      loadClients();
    }
  }, [user]);

  const handleCreateClient = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/clients", { name, description });
      setClients((prev) => [res.data.client, ...prev]);
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="mb-4 text-xl font-semibold">Clients</h2>
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Create client</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc. – Outbound"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Description</label>
                <textarea
                  className="input min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional context for this client workspace."
                />
              </div>
              <button
                type="button"
                className="btn-primary w-full"
                disabled={submitting || !name.trim()}
                onClick={handleCreateClient}
              >
                {submitting ? "Creating..." : "Create client"}
              </button>
            </div>
          </div>
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Client workspaces</h3>
            {clients.length === 0 ? (
              <p className="text-xs text-slate-400">No clients yet. Create one to get started.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {clients.map((client) => (
                  <li key={client.id} className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-100">{client.name}</p>
                      {client.description && (
                        <p className="text-xs text-slate-400">{client.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700"
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

