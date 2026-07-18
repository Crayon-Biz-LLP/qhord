"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "@/lib/api";
import {
   Play, LineChart, Shield, TrendingUp, Plus, ArrowRight, X, Settings, ArrowLeft
} from "lucide-react";
import { ZapierBuilder } from "@/components/dashboard/Workflows/ZapierBuilder";

export const Workflows = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
   const [view, setView] = useState<"list" | "builder">("list");
   const { selectedClient } = useClient();
   
   const [workflows, setWorkflows] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

   const fetchWorkflows = useCallback(async () => {
      if (!selectedClient?.id) {
         setWorkflows([]);
         return;
      }
      setIsLoading(true);
      try {
         const { data } = await api.get(`/workflows?clientId=${selectedClient.id}`);
         if (data.success) {
            setWorkflows(data.workflows || []);
         }
      } catch (err) {
         console.error("Failed to fetch workflows", err);
      } finally {
         setIsLoading(false);
      }
   }, [selectedClient?.id]);

   useEffect(() => {
      fetchWorkflows();
   }, [fetchWorkflows]);

   const openBuilder = (workflowId: string | null = null) => {
      setEditingWorkflowId(workflowId);
      setView("builder");
   };

   const closeBuilder = () => {
      setView("list");
      setEditingWorkflowId(null);
      fetchWorkflows();
   };

   if (view === "builder") {
      return (
         <div className="flex-1 bg-[#faf9f8] flex flex-col relative h-screen overflow-hidden">
             <div className="h-16 px-6 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <button onClick={closeBuilder} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                      <ArrowLeft size={16} className="text-slate-600" />
                   </button>
                   <div>
                      <h2 className="text-sm font-bold text-[#1a1510]">Automation Builder</h2>
                      <p className="text-[11px] text-slate-500">
                         {selectedClient?.name || "No Client Selected"}
                      </p>
                   </div>
                </div>
             </div>
             
             {/* Main Zapier-style Builder Component */}
             <ZapierBuilder 
                 workflowId={editingWorkflowId} 
                 onClose={closeBuilder} 
             />
         </div>
      );
   }

   const filteredWorkflows = workflows.filter(w => 
       !searchTerm.trim() || w.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 pb-20 min-h-0 relative">
         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-[#1a1510]">Automations</h1>
               <p className="mt-2 text-[15px] text-[#1a1510]/55 max-w-2xl leading-relaxed">
                  Design powerful Zapier-style automations to coordinate Apollo, Clay, Smartlead, and more.
               </p>
            </div>
            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
               <button
                  type="button"
                  disabled={!selectedClient}
                  onClick={() => openBuilder()}
                  className="h-10 px-5 inline-flex items-center gap-1.5 rounded-lg bg-[#1a1510] text-brand-gold border border-brand-gold/15 hover:bg-[#2a2118] text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
               >
                  <Plus size={14} /> Create Workflow
               </button>
            </div>
         </div>

         {/* Top metrics grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
               { label: "ACTIVE AUTOMATIONS", value: workflows.filter(w => w.status === "active").length, icon: Play, color: "text-brand-gold bg-brand-gold/10" },
               { label: "RECORDS PROCESSED (24H)", value: "0", icon: LineChart, color: "text-[#1a1510] bg-[#1a1510]/5" },
               { label: "ERRORS ENCOUNTERED", value: "0", icon: Shield, color: "text-amber-600 bg-amber-50" },
               { label: "ACTIONS FIRED (7D)", value: "0", icon: TrendingUp, color: "text-brand-gold bg-brand-gold/10" },
            ].map((card) => {
               const Icon = card.icon;
               return (
                  <div key={card.label} className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 hover:shadow-sm transition-all flex items-center justify-between">
                     <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 block mb-1 uppercase">{card.label}</span>
                        <span className="text-2xl font-black text-slate-800 leading-none">{card.value}</span>
                     </div>
                     <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.color}`}>
                        <Icon size={18} />
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Workflows List */}
         <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl overflow-hidden shadow-sm">
             <div className="p-4 border-b border-[#1a1510]/[0.05]">
                 <input 
                    type="text" 
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold/50"
                 />
             </div>
             
             {isLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading automations...</div>
             ) : filteredWorkflows.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Plus size={20} />
                    </div>
                    <h3 className="text-[#1a1510] font-semibold mb-1">No automations found</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-sm">
                       Create your first multi-step workflow by clicking the Create Workflow button.
                    </p>
                    <button 
                       onClick={() => openBuilder()} 
                       disabled={!selectedClient}
                       className="text-sm font-semibold text-brand-gold hover:underline disabled:opacity-50"
                    >
                        + Start blank workflow
                    </button>
                </div>
             ) : (
                <div className="divide-y divide-[#1a1510]/[0.05]">
                   {filteredWorkflows.map(wf => (
                      <div key={wf.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className={`w-2 h-2 rounded-full ${wf.status === 'active' ? 'bg-emerald-500' : wf.status === 'paused' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                                 <span className="font-semibold text-sm text-[#1a1510]">{wf.name}</span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-3">
                                 <span>Trigger: {wf.triggerTool || 'Manual'} ({wf.triggerType})</span>
                                 <span>•</span>
                                 <span>Updated {new Date(wf.updated_at).toLocaleDateString()}</span>
                              </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openBuilder(wf.id)} className="h-8 px-3 bg-white border border-slate-200 rounded-md text-xs font-semibold hover:border-brand-gold/40 text-slate-700">
                                  Edit
                              </button>
                          </div>
                      </div>
                   ))}
                </div>
             )}
         </div>
      </div>
   );
};
