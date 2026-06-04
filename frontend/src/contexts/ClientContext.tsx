"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

interface Client {
  id: string;
  name: string;
  description?: string | null;
  region?: string | null;
  account_owner?: string | null;
  industry?: string | null;
  status?: string;
  website?: string | null;
  priority?: string;
  icp_summary?: string | null;
  strategy_notes?: string | null;
  channels?: any;
  connected_tools?: any;
  approval_mode?: string | null;
  max_daily_sends?: number | null;
  require_crm_approval?: boolean | null;
}

interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  setSelectedClient: (client: Client | null) => void;
  refreshClients: () => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<Client>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/clients");
      const fetchedClients = res.data.clients;
      setClients(fetchedClients);

      // Restore from localStorage or pick first
      const storedId = localStorage.getItem("selected_client_id");
      if (storedId) {
        const found = fetchedClients.find((c: Client) => c.id === storedId);
        if (found) {
          setSelectedClientState(found);
        } else if (fetchedClients.length > 0) {
          setSelectedClientState(fetchedClients[0]);
        }
      } else if (fetchedClients.length > 0) {
        setSelectedClientState(fetchedClients[0]);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setSelectedClient = (client: Client | null) => {
    setSelectedClientState(client);
    if (client) {
      localStorage.setItem("selected_client_id", client.id);
    } else {
      localStorage.removeItem("selected_client_id");
    }
  };

  const createClient = async (clientData: Partial<Client>) => {
    const res = await api.post("/clients", clientData);
    const newClient = res.data.client;
    setClients((prev) => [newClient, ...prev]);
    setSelectedClient(newClient);
    return newClient;
  };

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  return (
    <ClientContext.Provider
      value={{
        clients,
        selectedClient,
        loading,
        setSelectedClient,
        refreshClients,
        createClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
}
