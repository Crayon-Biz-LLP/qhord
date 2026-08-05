import React, { useState, useEffect } from "react";
import { WfNode } from "./ZapierBuilder";
import { X, Search, Wand2, Mail, Send, Activity, Clock, GitBranch, ShieldAlert, Settings2 } from "lucide-react";
import { useClient } from "../../../contexts/ClientContext";

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

  // Make sure tool has an initial action if available
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
            <div className="flex items-center justify-between p-3 border border-brand-gold/30 rounded-lg bg-brand-gold/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-[#1a1510] border border-[#1a1510]/[0.05]">
                  {getIcon()}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1a1510]">{node.tool}</div>
                  <div className="text-[11px] text-[#1a1510]/60">Connected as {selectedClient?.name || 'Workspace Default'}</div>
                </div>
              </div>
              <button className="text-[11px] font-bold text-brand-gold underline">Change</button>
            </div>
          </div>
        )}

        {/* Step 2: Action Dropdown */}
        {node.tool && (
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
        {node.tool && node.action && (
          <div className="space-y-4 pt-4 border-t border-[#1a1510]/[0.07]">
            <label className="text-[13px] font-bold text-[#1a1510]">{node.tool === 'delay' ? 'Configure' : 'Account'} <span className="text-red-500">*</span></label>

            {/* Apollo -> Account Setup */}
            {node.tool === "Apollo" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border border-[#1a1510]/[0.07] rounded-lg p-3 bg-white">
                  <input type="text" className="w-full text-sm outline-none bg-transparent" placeholder="Connect Apollo" readOnly />
                  <button className="text-[12px] font-bold text-white bg-[#4F46E5] px-4 py-2 rounded-md hover:bg-[#4338CA] transition-colors whitespace-nowrap">Sign In</button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Apollo is a secure partner with Zapier. Your credentials are encrypted & can be removed at any time. You can manage all of your connected accounts here.
                </p>
              </div>
            )}

            {/* HeyReach -> Send LinkedIn Message */}
            {node.tool === "HeyReach" && node.action === "send_linkedin_message" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Connected Account</label>
                  <select className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-[#faf9f8]"><option>Default HeyReach Account</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Campaign</label>
                  <select className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none"><option>Select Campaign...</option><option>Outbound Q3</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Message Template</label>
                  <textarea value={node.config?.message_template || ""} onChange={e => handleConfigChange("message_template", e.target.value)} className="w-full h-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none" placeholder="Hi {{first_name}}, I saw..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Delay (Hours)</label>
                    <input type="number" value={node.config?.delay || ""} onChange={e => handleConfigChange("delay", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none" placeholder="24" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Variables</label>
                    <input type="text" value={node.config?.variables || ""} onChange={e => handleConfigChange("variables", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none" placeholder='{"first_name": "John"}' />
                  </div>
                </div>
              </div>
            )}

            {/* Calendly -> Book Meeting */}
            {node.tool === "Calendly" && node.action === "book_meeting" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Connected Account</label>
                  <select className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-[#faf9f8]"><option>Default Calendly Account</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Event Type</label>
                  <select className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none"><option>Select Event Type...</option><option>30 Min Discovery</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Date & Time</label>
                  <input type="datetime-local" value={node.config?.datetime || ""} onChange={e => handleConfigChange("datetime", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Invitee Email</label>
                    <input type="email" value={node.config?.invitee || ""} onChange={e => handleConfigChange("invitee", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none" placeholder="{{contact.email}}" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Timezone</label>
                    <select className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none"><option>UTC</option><option>America/New_York</option></select>
                  </div>
                </div>
              </div>
            )}

            {/* Delay -> Delay For */}
            {node.tool === "delay" && node.action === "delay_for" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Time Delayed For (value) <span className="text-red-500">*</span></label>
                  <input type="number" value={node.config?.delay_value || ""} onChange={e => handleConfigChange("delay_value", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" placeholder="1.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Time Delayed For (unit) <span className="text-red-500">*</span></label>
                  <select value={node.config?.delay_unit || ""} onChange={e => handleConfigChange("delay_unit", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="" disabled>Choose value...</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            )}

            {/* Delay -> Delay Until */}
            {node.tool === "delay" && node.action === "delay_until" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Date/Time Delayed Until <span className="text-red-500">*</span></label>
                  <input type="text" value={node.config?.delay_until_time || ""} onChange={e => handleConfigChange("delay_until_time", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" placeholder="Enter text or insert data..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">How should we handle dates in the past?</label>
                  <select value={node.config?.delay_past_behavior || ""} onChange={e => handleConfigChange("delay_past_behavior", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="" disabled>Choose value...</option>
                    <option value="continue_15_min">Continue if it's up to 15 minutes</option>
                    <option value="continue_1_hour">Continue if it's up to one hour</option>
                    <option value="continue_1_day">Continue if it's up to one day (default)</option>
                    <option value="always_continue">Always continue</option>
                  </select>
                </div>
              </div>
            )}

            {/* Delay -> Delay After Queue */}
            {node.tool === "delay" && node.action === "delay_after_queue" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Queue Title</label>
                  <input type="text" value={node.config?.queue_title || ""} onChange={e => handleConfigChange("queue_title", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" placeholder="Enter text or insert data..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Time Delayed For (value) <span className="text-red-500">*</span></label>
                  <input type="number" value={node.config?.delay_value || ""} onChange={e => handleConfigChange("delay_value", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" placeholder="1.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Time Delayed For (unit) <span className="text-red-500">*</span></label>
                  <select value={node.config?.delay_unit || ""} onChange={e => handleConfigChange("delay_unit", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="" disabled>Choose value...</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            )}

            {/* Generic Configuration fallback if not explicitly designed above */}
            {(!["Apollo", "HeyReach", "Calendly", "delay"].includes(node.tool) || !["search_people", "send_linkedin_message", "book_meeting", "delay_for", "delay_until", "delay_after_queue"].includes(node.action)) && (
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-70 border border-dashed border-slate-300 rounded-lg">
                <Settings2 size={24} className="mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-500">Configuration fields for <br /><b>{node.action}</b><br /> will load dynamically.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
