"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "@/lib/api";
import {
   Play, LineChart, Shield, TrendingUp, Plus, ArrowRight, X, Settings, ArrowLeft, MoreVertical
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ZapierBuilder } from "@/components/dashboard/Workflows/ZapierBuilder";

export const Workflows = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
   const [view, setView] = useState<"list" | "builder">("list");
   const { selectedClient } = useClient();
   
   const [workflows, setWorkflows] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
   const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
   const [renamingWorkflow, setRenamingWorkflow] = useState<any | null>(null);
   const [renameValue, setRenameValue] = useState("");
   const [deletingWorkflowId, setDeletingWorkflowId] = useState<string | null>(null);

   const handleRename = async (id: string) => {
       if (!renameValue.trim()) return;
       try {
           const { data } = await api.put(`/workflows/${id}`, { name: renameValue });
           if (data.success) {
               toast.success("Workflow renamed successfully");
               setRenamingWorkflow(null);
               fetchWorkflows();
           }
       } catch (err) {
           toast.error("Failed to rename workflow");
       }
   };

   const handleDelete = async (id: string) => {
       try {
           const { data } = await api.delete(`/workflows/${id}`);
           if (data.success) {
               toast.success("Workflow deleted");
               setDeletingWorkflowId(null);
               fetchWorkflows();
           }
       } catch (err) {
           toast.error("Failed to delete workflow");
       }
   };

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
         <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl shadow-sm">
             <div className="p-4 border-b border-[#1a1510]/[0.05] rounded-t-2xl">
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
                      <div key={wf.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group last:rounded-b-2xl">
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
                          <div className="relative">
                              <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === wf.id ? null : wf.id); }} className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-[#1a1510] hover:border-brand-gold/40 hover:bg-slate-50 transition-colors">
                                  <MoreVertical size={16} />
                              </button>
                              
                              {menuOpenId === wf.id && (
                                  <>
                                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setRenamingWorkflow(wf); setRenameValue(wf.name); }}
                                              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1a1510] flex items-center gap-2"
                                          >
                                              Rename
                                          </button>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); openBuilder(wf.id); }}
                                              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1a1510] flex items-center gap-2"
                                          >
                                              Edit
                                          </button>
                                          <div className="h-px bg-slate-100 my-1" />
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setDeletingWorkflowId(wf.id); }}
                                              className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                          >
                                              Delete
                                          </button>
                                      </div>
                                  </>
                              )}
                          </div>
                      </div>
                   ))}
                </div>
             )}
         </div>

          {/* Rename Modal */}
          {renamingWorkflow && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-slate-100">
                          <h3 className="font-semibold text-[#1a1510]">Rename "{renamingWorkflow.name}"</h3>
                          <button onClick={() => setRenamingWorkflow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                      </div>
                      <div className="p-4">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Name (required)</label>
                          <input 
                              type="text" 
                              value={renameValue} 
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="w-full h-10 px-3 border-2 border-brand-gold/50 rounded-lg outline-none focus:border-brand-gold bg-white"
                              autoFocus
                          />
                      </div>
                      <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
                          <button onClick={() => setRenamingWorkflow(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors">Cancel</button>
                          <button onClick={() => handleRename(renamingWorkflow.id)} className="px-4 py-2 text-sm font-semibold text-[#1a1510] bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">Save</button>
                      </div>
                  </div>
              </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingWorkflowId && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center">
                      <div className="p-6">
                          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                              <Shield size={24} />
                          </div>
                          <h3 className="font-bold text-[#1a1510] text-lg mb-2">Delete Automation?</h3>
                          <p className="text-sm text-slate-500 leading-relaxed">Are you sure you want to delete this automation? This action cannot be undone.</p>
                      </div>
                      <div className="flex items-center p-4 bg-slate-50 border-t border-slate-100 gap-3">
                          <button onClick={() => setDeletingWorkflowId(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                          <button onClick={() => handleDelete(deletingWorkflowId)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">Delete</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
   );
};
