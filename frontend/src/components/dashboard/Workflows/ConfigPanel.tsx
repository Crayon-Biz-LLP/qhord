import React, { useState, useEffect } from "react";
import { WfNode } from "./ZapierBuilder";
import { X, Search, Check, Settings2, Database, AlertCircle, Link, Paperclip, ChevronRight, CheckCircle2 } from "lucide-react";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "@/lib/api";

const TOOLS = ["Apollo", "Clay", "BetterContact", "Smartlead", "Instantly", "HeyReach", "Calendly"];

const ACTIONS: Record<string, { id: string, label: string }[]> = {
  Apollo: [
    { id: "search_people", label: "Search People" },
    { id: "enrich_contact", label: "Enrich Contact" }
  ],
  Clay: [
    { id: "enrich_lead", label: "Enrich Lead via Table" }
  ],
  BetterContact: [
    { id: "verify_email", label: "Verify Email" }
  ],
  Smartlead: [
    { id: "add_to_campaign", label: "Add to Campaign / Send Email" }
  ],
  Instantly: [
    { id: "add_to_campaign", label: "Add to Campaign" }
  ],
  HeyReach: [
    { id: "add_to_campaign", label: "Add to LinkedIn Campaign" }
  ],
  Calendly: [
    { id: "check_booking", label: "Check Booking Status" }
  ]
};

export const ConfigPanel = ({ 
  node, 
  allNodes,
  onChange, 
  onClose 
}: { 
  node: WfNode; 
  allNodes: WfNode[];
  onChange: (updates: Partial<WfNode>) => void;
  onClose: () => void;
}) => {
  const { selectedClient } = useClient();
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"app" | "account" | "action">("app");

  useEffect(() => {
    // Determine which tab to show by default based on node state
    if (!node.tool) {
      setActiveTab("app");
    } else if (node.tool && !node.action) {
      setActiveTab("app");
    } else {
      setActiveTab("action");
    }
    
    // Fetch connected tools for client
    if (selectedClient?.id) {
      // Mocking fetch for now, you would normally call your accounts endpoint
      setConnectedAccounts(["apollo", "smartlead"]); 
    }
  }, [node.tool, node.action, selectedClient]);

  const handleToolSelect = (tool: string) => {
    onChange({ tool, action: null, label: `Setup ${tool}` });
  };

  const handleActionSelect = (actionId: string, actionLabel: string) => {
    onChange({ action: actionId, label: actionLabel });
    setActiveTab("account");
  };

  const handleConfigChange = (key: string, value: any) => {
    onChange({ config: { ...node.config, [key]: value } });
  };

  const isToolConnected = node.tool ? connectedAccounts.includes(node.tool.toLowerCase()) : false;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200">
            {node.tool ? node.tool.charAt(0) : "1"}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {node.type === "trigger" ? "1. Trigger" : `2. Action`}
            </h3>
            <div className="text-xs text-slate-500 font-medium">
               {node.tool ? `${node.tool} • ${ACTIONS[node.tool]?.find(a => a.id === node.action)?.label || 'Select Event'}` : "Select App & Event"}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
         {/* Accordion Style Sections */}
         
         {/* Section 1: App & Event */}
         <div className="border-b border-slate-200">
            <button 
               onClick={() => setActiveTab("app")}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
               <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${node.tool && node.action ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                     {node.tool && node.action ? <CheckCircle2 size={14} /> : "1"}
                  </span>
                  App & Event
               </div>
               {activeTab !== "app" && <ChevronRight size={18} className="text-slate-400" />}
            </button>
            
            {activeTab === "app" && (
               <div className="px-6 pb-6 space-y-6">
                  {node.type !== "trigger" && (
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-800">App *</label>
                        {!node.tool ? (
                           <div className="grid grid-cols-2 gap-2">
                              {TOOLS.map(tool => (
                                 <button 
                                   key={tool}
                                   onClick={() => handleToolSelect(tool)}
                                   className="p-3 border border-slate-200 rounded-lg text-sm font-semibold hover:border-brand-gold hover:bg-brand-gold/5 text-left transition-colors text-slate-700 bg-white shadow-sm"
                                 >
                                   {tool}
                                 </button>
                              ))}
                           </div>
                        ) : (
                           <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                              <span className="text-sm font-bold text-slate-800">{node.tool}</span>
                              <button onClick={() => handleToolSelect("")} className="text-xs font-semibold text-brand-gold hover:underline">Change</button>
                           </div>
                        )}
                     </div>
                  )}

                  {node.tool && (
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-800">Trigger Event *</label>
                        <div className="space-y-2">
                           {ACTIONS[node.tool]?.map(action => (
                              <button 
                                key={action.id}
                                onClick={() => handleActionSelect(action.id, action.label)}
                                className={`w-full p-3 border rounded-lg text-sm font-semibold text-left flex items-center justify-between transition-colors shadow-sm ${node.action === action.id ? 'border-brand-gold bg-brand-gold/5 text-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'}`}
                              >
                                {action.label}
                                {node.action === action.id && <Check size={16} className="text-brand-gold" />}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {node.tool && node.action && (
                     <button onClick={() => setActiveTab("account")} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors text-sm">
                        Continue
                     </button>
                  )}
               </div>
            )}
         </div>

         {/* Section 2: Account */}
         {node.tool && node.action && (
            <div className="border-b border-slate-200">
               <button 
                  onClick={() => setActiveTab("account")}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
               >
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                     <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isToolConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                        {isToolConnected ? <CheckCircle2 size={14} /> : "2"}
                     </span>
                     Account
                  </div>
                  {activeTab !== "account" && <ChevronRight size={18} className="text-slate-400" />}
               </button>
               
               {activeTab === "account" && (
                  <div className="px-6 pb-6 space-y-4">
                     <label className="text-xs font-bold text-slate-800">{node.tool} Account *</label>
                     <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                        {isToolConnected ? (
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                 <span className="text-sm font-medium text-slate-700">Connected as {selectedClient?.name || 'Client'}</span>
                              </div>
                              <button className="text-xs font-semibold text-slate-400 hover:text-slate-600">Reconnect</button>
                           </div>
                        ) : (
                           <div className="text-center py-4 space-y-3">
                              <AlertCircle size={24} className="mx-auto text-amber-500" />
                              <div className="text-sm font-medium text-slate-600">
                                 You do not have access to {node.tool} yet. Please connect this tool to continue.
                              </div>
                              <button className="px-4 py-2 bg-brand-gold text-slate-900 text-sm font-bold rounded hover:brightness-105 transition-all">
                                 Connect {node.tool}
                              </button>
                           </div>
                        )}
                     </div>

                     {isToolConnected && (
                        <button onClick={() => setActiveTab("action")} className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors text-sm">
                           Continue
                        </button>
                     )}
                  </div>
               )}
            </div>
         )}

         {/* Section 3: Action Setup */}
         {node.tool && node.action && (
            <div className="border-b border-slate-200">
               <button 
                  onClick={() => setActiveTab("action")}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
               >
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                     <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${activeTab === 'action' ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-200 text-slate-600'}`}>
                        3
                     </span>
                     Action
                  </div>
                  {activeTab !== "action" && <ChevronRight size={18} className="text-slate-400" />}
               </button>
               
               {activeTab === "action" && (
                  <div className="px-6 pb-6 space-y-6">
                     
                     {/* Apollo Search Fields */}
                     {node.tool === "Apollo" && node.action === "search_people" && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">First Name</label>
                              <input 
                                 type="text"
                                 value={node.config?.first_name || ""}
                                 onChange={e => handleConfigChange("first_name", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. John"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Last Name</label>
                              <input 
                                 type="text"
                                 value={node.config?.last_name || ""}
                                 onChange={e => handleConfigChange("last_name", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. Doe"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Company Name</label>
                              <input 
                                 type="text"
                                 value={node.config?.company || ""}
                                 onChange={e => handleConfigChange("company", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. Acme Corp"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Location</label>
                              <input 
                                 type="text"
                                 value={node.config?.location || ""}
                                 onChange={e => handleConfigChange("location", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. New York, United States"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Job Title</label>
                              <input 
                                 type="text"
                                 value={node.config?.job_title || ""}
                                 onChange={e => handleConfigChange("job_title", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. Founder, CEO"
                              />
                           </div>
                        </div>
                     )}

                     {/* Smartlead Email Fields */}
                     {(node.tool === "Smartlead" || node.tool === "Instantly") && node.action === "add_to_campaign" && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Email Subject</label>
                              <input 
                                 type="text"
                                 value={node.config?.subject || ""}
                                 onChange={e => handleConfigChange("subject", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="Quick question regarding {{companyName}}"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Email Body</label>
                              <textarea 
                                 value={node.config?.body || ""}
                                 onChange={e => handleConfigChange("body", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm h-32 outline-none focus:border-brand-gold resize-none"
                                 placeholder="Hi {{firstName}},\n\n..."
                              />
                           </div>
                           <div className="space-y-1 border-t border-slate-100 pt-4 mt-2">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1"><Paperclip size={12}/> Attachments & Media</label>
                              <p className="text-[11px] text-slate-500 mb-2">Attach files, videos under 10MB, documents, or links.</p>
                              
                              <div className="space-y-2">
                                 <div className="flex gap-2">
                                    <input 
                                       type="text"
                                       value={node.config?.attachment_url || ""}
                                       onChange={e => handleConfigChange("attachment_url", e.target.value)}
                                       className="flex-1 p-2 text-sm border border-slate-200 rounded outline-none focus:border-brand-gold"
                                       placeholder="Paste a link (e.g. Loom video, Google Drive)"
                                    />
                                    <button className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-200">
                                       Add Link
                                    </button>
                                 </div>
                                 <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded bg-slate-50 text-slate-500 hover:border-brand-gold/50 hover:bg-brand-gold/5 cursor-pointer transition-colors">
                                    <div className="text-sm font-semibold">Click to upload files</div>
                                    <div className="text-xs mt-1">PDF, DOCX, MP4 (Max 10MB)</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Clay Fields */}
                     {node.tool === "Clay" && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Clay Table ID</label>
                              <input 
                                 type="text"
                                 value={node.config?.table_id || ""}
                                 onChange={e => handleConfigChange("table_id", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. tbl_123abc"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Lookup Column Map (Domain or Email)</label>
                              <input 
                                 type="text"
                                 value={node.config?.lookup_value || ""}
                                 onChange={e => handleConfigChange("lookup_value", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold font-mono text-xs"
                                 placeholder="{{steps.apollo_search.email}}"
                              />
                           </div>
                        </div>
                     )}

                     {/* BetterContact Fields */}
                     {node.tool === "BetterContact" && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Email Address to Verify</label>
                              <input 
                                 type="text"
                                 value={node.config?.email_to_verify || ""}
                                 onChange={e => handleConfigChange("email_to_verify", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold font-mono text-xs"
                                 placeholder="{{steps.apollo_search.email}}"
                              />
                           </div>
                        </div>
                     )}

                     {/* HeyReach Fields */}
                     {node.tool === "HeyReach" && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">HeyReach Campaign ID</label>
                              <input 
                                 type="text"
                                 value={node.config?.campaign_id || ""}
                                 onChange={e => handleConfigChange("campaign_id", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                                 placeholder="e.g. cmp_xyz789"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">LinkedIn Profile URL Map</label>
                              <input 
                                 type="text"
                                 value={node.config?.linkedin_url || ""}
                                 onChange={e => handleConfigChange("linkedin_url", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold font-mono text-xs"
                                 placeholder="{{steps.apollo_search.linkedin_url}}"
                              />
                           </div>
                        </div>
                     )}

                     {/* Calendly Fields */}
                     {node.tool === "Calendly" && (
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-800">Invitee Email Address</label>
                              <input 
                                 type="text"
                                 value={node.config?.invitee_email || ""}
                                 onChange={e => handleConfigChange("invitee_email", e.target.value)}
                                 className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold font-mono text-xs"
                                 placeholder="{{steps.apollo_search.email}}"
                              />
                           </div>
                        </div>
                     )}

                     {/* Default Generic JSON field for other actions */}
                     {node.tool !== "Apollo" && node.tool !== "Smartlead" && node.tool !== "Instantly" && node.tool !== "Clay" && node.tool !== "BetterContact" && node.tool !== "HeyReach" && node.tool !== "Calendly" && (
                         <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-800">Configuration JSON</label>
                           <textarea 
                              value={JSON.stringify(node.config, null, 2)}
                              onChange={(e) => {
                                 try {
                                    const parsed = JSON.parse(e.target.value);
                                    onChange({ config: parsed });
                                 } catch (err) {}
                              }}
                              className="w-full h-40 p-3 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                           />
                        </div>
                     )}

                     <div className="pt-6 border-t border-slate-100 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors text-sm">
                           Continue
                        </button>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
    </div>
  );
};
