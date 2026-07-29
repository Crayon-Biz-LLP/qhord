import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Lead = {
  id: string;
  name: string;
  email?: string;
  company: string;
  persona?: string;
  title?: string;
  location?: string;
  icp?: string;
  source: string;
  status: string;
  time?: string;
  raw?: Record<string, string>;
};

export type Deal = {
  id: number;
  name: string;
  contact: string;
  amount: string;
  health: number;
  auto: boolean;
  avatar: string;
};

interface CRMContextType {
  globalLeads: Lead[];
  addGlobalLeads: (leads: Lead[]) => void;
  globalDeals: Deal[];
  addGlobalDeal: (deal: Deal) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [globalLeads, setGlobalLeads] = useState<Lead[]>([]);
  const [globalDeals, setGlobalDeals] = useState<Deal[]>([]);

  const addGlobalLeads = (leads: Lead[]) => {
    setGlobalLeads(prev => {
      const existingIds = new Set(prev.map(l => l.id));
      const newLeads = leads.filter(l => !existingIds.has(l.id));
      return [...prev, ...newLeads];
    });
  };

  const addGlobalDeal = (deal: Deal) => {
    setGlobalDeals(prev => {
      if (prev.find(d => d.id === deal.id)) return prev;
      return [...prev, deal];
    });
  };

  return (
    <CRMContext.Provider value={{ globalLeads, addGlobalLeads, globalDeals, addGlobalDeal }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
