import React, { useState, useEffect } from "react";
import { WfNode } from "./ZapierBuilder";
import { X, Search, Wand2, Mail, Send, Activity, Clock, GitBranch, ShieldAlert, Settings2 } from "lucide-react";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";

import { ACTION_SCHEMAS, FieldSchema } from "./actionSchemas";

export const ACTIONS: Record<string, { id: string, label: string }[]> = {
  Apollo: [
    { id: "create_account", label: "Create Account" },
    { id: "create_contact", label: "Create Contact" },
    { id: "create_deal", label: "Create Deal" },
    { id: "create_task", label: "Create Task" },
    { id: "update_account", label: "Update Account" },
    { id: "update_contact", label: "Update Contact" },
    { id: "update_deal", label: "Update Deal" }
  ],
  Clay: [
    { id: "import_table", label: "Import Table" },
    { id: "find_person", label: "Find Person" },
    { id: "company_enrichment", label: "Company Enrichment" },
    { id: "email_enrichment", label: "Email Enrichment" },
    { id: "ai_research", label: "AI Research" },
    { id: "update_row", label: "Update Row" }
  ],
  HeyReach: [
    { id: "send_connection_request", label: "Send Connection Request" },
    { id: "send_linkedin_message", label: "Send LinkedIn Message" },
    { id: "send_follow_up", label: "Send Follow-up" },
    { id: "visit_profile", label: "Visit Profile" },
    { id: "like_post", label: "Like Post" },
    { id: "follow_profile", label: "Follow Profile" }
  ],
  Smartlead: [
    { id: "send_email", label: "Send Email" },
    { id: "add_lead", label: "Add Lead" },
    { id: "add_to_campaign", label: "Add to Campaign" },
    { id: "pause_campaign", label: "Pause Campaign" },
    { id: "resume_campaign", label: "Resume Campaign" },
    { id: "stop_campaign", label: "Stop Campaign" }
  ],
  BetterContact: [
    { id: "find_email", label: "Find Email" },
    { id: "find_phone", label: "Find Phone" },
    { id: "verify_email", label: "Verify Email" },
    { id: "verify_phone", label: "Verify Phone" },
    { id: "enrich_contact", label: "Enrich Contact" }
  ],
  Calendly: [
    { id: "create_scheduling_link", label: "Create Scheduling Link" },
    { id: "check_availability", label: "Check Availability" },
    { id: "book_meeting", label: "Book Meeting" },
    { id: "cancel_meeting", label: "Cancel Meeting" }
  ],
  Gojiberry: [
    { id: "import_contacts", label: "Import Contacts" },
    { id: "export_contacts", label: "Export Contacts" },
    { id: "sync_leads", label: "Sync Leads" },
    { id: "update_contact", label: "Update Contact" },
    { id: "create_campaign", label: "Create Campaign" }
  ],
  Instantly: [
    { id: "add_lead", label: "Add Lead" },
    { id: "send_email", label: "Send Email" },
    { id: "add_to_campaign", label: "Add to Campaign" }
  ],
  delay: [
    { id: "delay_after_queue", label: "Delay After Queue" },
    { id: "delay_for", label: "Delay For" },
    { id: "delay_until", label: "Delay Until" }
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
  const [toolAccounts, setToolAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (selectedClient?.id) {
        setIsLoadingAccounts(true);
        try {
          const res = await api.get(`/tools/accounts/${selectedClient.id}`);
          // The backend returns { accounts: [...] }
          setToolAccounts(res.data?.accounts || res.data || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingAccounts(false);
        }
      }
    };
    fetchAccounts();
  }, [selectedClient?.id]);
  useEffect(() => {
    if (node.tool && !node.action && ACTIONS[node.tool]?.[0]) {
      onChange({ action: ACTIONS[node.tool][0].id, label: ACTIONS[node.tool][0].label });
    }
  }, [node.tool, node.action]);

  const handleConfigChange = (key: string, value: any) => {
    onChange({ config: { ...node.config, [key]: value } });
  };

  const getIcon = () => {
    if (node.type === "trigger") {
      if (node.label?.includes("Schedule")) return <Clock size={14} />;
      return <Activity size={14} />;
    }
    if (node.tool === "if_else") return <GitBranch size={14} />;

    switch (node.tool?.toLowerCase()) {
      case "human": return <ShieldAlert size={14} />;
      case "apollo": return <Search size={14} />;
      case "clay": return <Wand2 size={14} />;
      case "smartlead":
      case "instantly": return <Mail size={14} />;
      case "heyreach": return <Send size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const getTypeLabel = () => {
    if (node.type === "trigger") return "TRIGGERS";
    if (node.tool === "if_else") return "LOGIC";
    return "CHANNELS";
  };

  const normalizeToolName = (name?: string) => {
    if (!name) return "";
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized === 'apolloio') return 'apollo';
    if (normalized === 'bettercontacts') return 'bettercontact';
    return normalized;
  };

  const needsAccount = !['delay', 'if_else', 'branch', 'filter', 'wait', 'loop', 'merge', 'end_workflow', 'human', 'manual_trigger', 'run_on_schedule', 'webhook', 'campaign_started', 'campaign_completed', 'reply_received', 'email_opened', 'email_clicked', 'meeting_booked', 'deal_created', 'deal_updated'].includes(node.tool || '');
  const availableAccounts = toolAccounts.filter(a => 
    normalizeToolName(a.tool_name) === normalizeToolName(node.tool) 
    && a.status === 'connected' 
    && a.account_label !== 'Auto (mock-ready)'
  );
  const hasAccount = !needsAccount || availableAccounts.length > 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white border border-[#1a1510]/[0.07] flex items-center justify-center text-[#1a1510]/70">
            {getIcon()}
          </div>
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">
            {getTypeLabel()} / {node.tool || "Action"}
          </h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* Generic Tool Not Configured */}
        {!node.tool && (
          <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 mt-10">
            <ShieldAlert size={32} className="mb-4 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Please select a tool from the Block Library on the right to configure it.</p>
          </div>
        )}

        {/* Step 1: Provider / Integration */}
        {node.tool && (
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[#1a1510]">App <span className="text-red-500">*</span></label>
            
            {needsAccount && !hasAccount && !isLoadingAccounts ? (
              <div className="flex flex-col gap-3 p-4 border border-amber-200 rounded-lg bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800">
                  <ShieldAlert size={16} />
                  <span className="text-[13px] font-bold">⚠ No account connected</span>
                </div>
                <p className="text-xs text-amber-700">Please connect a {node.tool} account before configuring this action.</p>
                <a href="/dashboard/tools" target="_blank" rel="noopener noreferrer" className="self-start px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[13px] font-bold rounded-md transition-colors">
                  Connect Account
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-brand-gold/30 rounded-lg bg-brand-gold/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-[#1a1510] border border-[#1a1510]/[0.05]">
                    {getIcon()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1a1510]">{node.tool}</div>
                    <div className="text-[11px] text-[#1a1510]/60">
                      {needsAccount ? 'Connected to workspace' : 'Built-in Feature'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Action Dropdown */}
        {node.tool && hasAccount && (
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[#1a1510]">Action event <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={node.action || ""}
                onChange={(e) => {
                  const label = ACTIONS[node.tool]?.find(a => a.id === e.target.value)?.label || "";
                  onChange({ action: e.target.value, label, config: {} }); // reset config when action changes
                }}
                className="w-full p-3 bg-white border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none focus:border-brand-gold font-medium text-[#1a1510] appearance-none cursor-pointer"
              >
                <option value="" disabled>Select an action...</option>
                {ACTIONS[node.tool]?.map(action => (
                  <option key={action.id} value={action.id}>{action.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Dynamic Configuration Fields */}
        {node.tool && node.action && hasAccount && (
          <div className="space-y-4 pt-4 border-t border-[#1a1510]/[0.07]">
            <label className="text-[13px] font-bold text-[#1a1510]">{node.tool === 'delay' ? 'Configure' : 'Account Selection'} <span className="text-red-500">*</span></label>

            {needsAccount && (
              <div className="space-y-3 mb-4">
                {(() => {
                  const savedAccountId = node.config?.accountId;
                  const isSavedAccountMissing = savedAccountId && !availableAccounts.find(a => a.id === savedAccountId);

                  if (!savedAccountId && availableAccounts[0]) {
                    setTimeout(() => handleConfigChange("accountId", availableAccounts[0].id), 0);
                  }
                  return (
                    <>
                      {isSavedAccountMissing && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                          <ShieldAlert size={16} />
                          <span>The previously selected account is no longer connected. Please select another or <a href="/tools" target="_blank" rel="noopener noreferrer" className="underline font-bold">reconnect</a>.</span>
                        </div>
                      )}
                      <select 
                        value={(isSavedAccountMissing ? "" : savedAccountId) || ""} 
                        onChange={(e) => handleConfigChange("accountId", e.target.value)}
                        className={`w-full p-2.5 border ${isSavedAccountMissing ? 'border-red-300' : 'border-[#1a1510]/[0.07]'} rounded-lg text-sm outline-none bg-[#faf9f8] font-medium text-[#1a1510]`}
                      >
                        <option value="" disabled>Select {node.tool} Account</option>
                        {availableAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.account_label}</option>
                        ))}
                      </select>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Dynamic Configuration Renderer */}
            {(() => {
              const fields = ACTION_SCHEMAS[node.tool]?.[node.action];
              if (!fields) {
                return (
                  <div className="flex flex-col items-center justify-center p-8 text-center opacity-70 border border-dashed border-slate-300 rounded-lg">
                    <Settings2 size={24} className="mb-2 text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Configuration fields for <br /><b>{node.action}</b><br /> will load dynamically.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {fields.map((field: FieldSchema) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-[11px] font-bold text-[#1a1510]">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          value={node.config?.[field.name] || ""}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          className="w-full h-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none"
                          placeholder={field.placeholder || ""}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={node.config?.[field.name] || ""}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white"
                        >
                          <option value="" disabled>Select {field.label}...</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                          value={node.config?.[field.name] || ""}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white"
                          placeholder={field.placeholder || ""}
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
