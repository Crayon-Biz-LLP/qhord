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

const CONDITION_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'number', label: 'Number' },
  { id: 'boolean', label: 'Boolean' },
  { id: 'date', label: 'Date' },
  { id: 'exists', label: 'Exists' }
];

const OPERATORS: Record<string, { id: string, label: string }[]> = {
  text: [
    { id: 'equals', label: 'Equals' },
    { id: 'not_equals', label: 'Does not equal' },
    { id: 'contains', label: 'Contains' },
    { id: 'not_contains', label: 'Does not contain' },
    { id: 'starts_with', label: 'Starts with' },
    { id: 'ends_with', label: 'Ends with' },
    { id: 'is_empty', label: 'Is empty' },
    { id: 'is_not_empty', label: 'Is not empty' },
  ],
  number: [
    { id: 'num_equals', label: 'Equals' },
    { id: 'num_not_equals', label: 'Does not equal' },
    { id: 'greater_than', label: 'Greater than' },
    { id: 'greater_than_or_equal', label: 'Greater than or equal' },
    { id: 'less_than', label: 'Less than' },
    { id: 'less_than_or_equal', label: 'Less than or equal' }
  ],
  boolean: [
    { id: 'is_true', label: 'Is true' },
    { id: 'is_false', label: 'Is false' }
  ],
  date: [
    { id: 'before', label: 'Before' },
    { id: 'after', label: 'After' },
    { id: 'on', label: 'On' },
    { id: 'between', label: 'Between' }
  ],
  exists: [
    { id: 'exists', label: 'Exists' },
    { id: 'not_exists', label: 'Does not exist' }
  ]
};

const NO_VALUE_OPERATORS = [
  'is_empty', 'is_not_empty', 'is_true', 'is_false', 'exists', 'not_exists'
];

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

  if (node.type === 'trigger') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white border border-[#1a1510]/[0.07] flex items-center justify-center text-[#1a1510]/70">
              {getIcon()}
            </div>
            <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">
              TRIGGERS / {node.tool?.replace(/_/g, ' ') || "Trigger"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
           {node.tool === 'manual_trigger' && (
             <div className="text-center p-8 bg-slate-50 rounded-lg">
               <h4 className="font-bold mb-2">Manual Trigger</h4>
               <p className="text-sm text-slate-500">Start this workflow manually. No configuration required.</p>
             </div>
           )}
           
           {node.tool === 'run_on_schedule' && (
             <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Frequency <span className="text-red-500">*</span></label>
                  <select value={node.config?.frequency || "daily"} onChange={(e) => handleConfigChange("frequency", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="once">Once</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
               </div>
               {node.config?.frequency === 'weekly' && (
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Recurrence Days <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 flex-wrap">
                      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                        <label key={day} className="flex items-center gap-1 text-sm bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          <input type="checkbox" checked={node.config?.days?.includes(day) || false} onChange={(e) => {
                            const days = node.config?.days || [];
                            handleConfigChange("days", e.target.checked ? [...days, day] : days.filter((d: string) => d !== day));
                          }} /> {day}
                        </label>
                      ))}
                    </div>
                 </div>
               )}
               <div className="flex gap-4">
                 <div className="space-y-2 flex-1">
                    <label className="text-[11px] font-bold text-[#1a1510]">Time <span className="text-red-500">*</span></label>
                    <input type="time" value={node.config?.time || "09:00"} onChange={e => handleConfigChange("time", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
                 <div className="space-y-2 flex-1">
                    <label className="text-[11px] font-bold text-[#1a1510]">Timezone <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. UTC" value={node.config?.timezone || "UTC"} onChange={e => handleConfigChange("timezone", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="space-y-2 flex-1">
                    <label className="text-[11px] font-bold text-[#1a1510]">Start Date</label>
                    <input type="date" value={node.config?.startDate || ""} onChange={e => handleConfigChange("startDate", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
                 <div className="space-y-2 flex-1">
                    <label className="text-[11px] font-bold text-[#1a1510]">End Date</label>
                    <input type="date" value={node.config?.endDate || ""} onChange={e => handleConfigChange("endDate", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               </div>
               <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                 <input type="checkbox" id="schedule-active" checked={node.config?.enabled ?? true} onChange={e => handleConfigChange("enabled", e.target.checked)} className="w-4 h-4 accent-brand-gold" />
                 <label htmlFor="schedule-active" className="text-sm font-semibold text-[#1a1510]">Schedule Active</label>
               </div>
             </div>
           )}

           {node.tool === 'webhook' && (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Webhook URL</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 break-all">
                    https://api.qhord.com/webhooks/catch/generate_on_save
                  </div>
                  <p className="text-[10px] text-slate-400">Save the workflow to generate the unique URL.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">HTTP Method</label>
                  <select value={node.config?.method || "POST"} onChange={(e) => handleConfigChange("method", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Authentication Type</label>
                  <select value={node.config?.authType || "none"} onChange={(e) => handleConfigChange("authType", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                  </select>
               </div>
               {node.config?.authType && node.config.authType !== 'none' && (
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Secret / Token</label>
                    <input type="password" placeholder="Enter secret to validate incoming requests" value={node.config?.secret || ""} onChange={e => handleConfigChange("secret", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               )}
             </div>
           )}

           {(node.tool === 'campaign_started' || node.tool === 'campaign_completed') && (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Campaign Selection <span className="text-red-500">*</span></label>
                  <select value={node.config?.campaignId || ""} onChange={e => handleConfigChange("campaignId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="" disabled>Select a campaign...</option>
                    <option value="any">Any Campaign (Global)</option>
                    <option value="camp_1">Q4 Outbound Campaign</option>
                    <option value="camp_2">Webinar Follow-up</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Optional Filters</label>
                  <input type="text" placeholder="e.g. Lead Score > 50" value={node.config?.filters || ""} onChange={e => handleConfigChange("filters", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
               </div>
             </div>
           )}

           {node.tool === 'reply_received' && (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Campaign</label>
                  <select value={node.config?.campaignId || "any"} onChange={e => handleConfigChange("campaignId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="any">Any Campaign</option>
                    <option value="camp_1">Q4 Outbound Campaign</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Reply Classification</label>
                  <select value={node.config?.classification || "any"} onChange={e => handleConfigChange("classification", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="any">Any Reply</option>
                    <option value="positive">Positive / Interested Only</option>
                    <option value="negative">Negative / Uninterested</option>
                    <option value="ooo">Out of Office</option>
                  </select>
               </div>
             </div>
           )}

           {(node.tool === 'email_opened' || node.tool === 'email_clicked') && (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Campaign</label>
                  <select value={node.config?.campaignId || "any"} onChange={e => handleConfigChange("campaignId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="any">Any Campaign</option>
                  </select>
               </div>
               {node.tool === 'email_opened' && (
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Minimum Open Count</label>
                    <input type="number" min="1" value={node.config?.minCount || "1"} onChange={e => handleConfigChange("minCount", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               )}
               {node.tool === 'email_clicked' && (
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Specific Link URL (Optional)</label>
                    <input type="url" placeholder="https://..." value={node.config?.linkUrl || ""} onChange={e => handleConfigChange("linkUrl", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               )}
             </div>
           )}

           {node.tool === 'meeting_booked' && (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Calendar Provider</label>
                  <select value={node.config?.provider || "calendly"} onChange={e => handleConfigChange("provider", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="calendly">Calendly</option>
                    <option value="google">Google Calendar</option>
                    <option value="outlook">Outlook</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Event Type (Optional)</label>
                  <input type="text" placeholder="e.g. 30 Minute Discovery Call" value={node.config?.eventType || ""} onChange={e => handleConfigChange("eventType", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
               </div>
             </div>
           )}

           {(node.tool === 'deal_created' || node.tool === 'deal_updated') && (
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">CRM</label>
                  <select value={node.config?.crm || "hubspot"} onChange={e => handleConfigChange("crm", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="hubspot">HubSpot</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="apollo">Apollo</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Pipeline (Optional)</label>
                  <input type="text" placeholder="e.g. Sales Pipeline" value={node.config?.pipeline || ""} onChange={e => handleConfigChange("pipeline", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
               </div>
               {node.tool === 'deal_updated' && (
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Stage (Optional)</label>
                    <input type="text" placeholder="e.g. Closed Won" value={node.config?.stage || ""} onChange={e => handleConfigChange("stage", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    );
  }

  if (node.type === 'logic') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white border border-[#1a1510]/[0.07] flex items-center justify-center text-[#1a1510]/70">
              {getIcon()}
            </div>
            <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">
              LOGIC / {node.tool?.replace(/_/g, ' ') || "Logic"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
           {node.tool === 'filter' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Filter Configuration</div>
               <p className="text-xs text-slate-500">Only continue if the following conditions are met:</p>
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <select value={node.config?.matchType || "AND"} onChange={(e) => handleConfigChange("matchType", e.target.value)} className="p-2 border border-slate-200 rounded text-xs bg-slate-50 outline-none">
                     <option value="AND">Match ALL conditions (AND)</option>
                     <option value="OR">Match ANY condition (OR)</option>
                   </select>
                 </div>
                 {(node.config?.conditions || [{ id: '1', field: '', type: 'text', operator: 'equals', value: '' }]).map((cond: any, idx: number) => {
                   const type = cond.type || 'text';
                   const ops = OPERATORS[type] || OPERATORS.text;
                   const noValue = NO_VALUE_OPERATORS.includes(cond.operator);
                   
                   return (
                     <div key={cond.id || idx} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                       <div className="flex gap-2 items-start">
                         <input type="text" placeholder="Field e.g. {{trigger.contact.email}}" value={cond.field || ""} onChange={e => {
                           const newConds = [...(node.config?.conditions || [])];
                           newConds[idx] = { ...cond, field: e.target.value };
                           handleConfigChange("conditions", newConds);
                         }} className="flex-1 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                         
                         <select value={type} onChange={e => {
                           const newType = e.target.value;
                           const defaultOp = OPERATORS[newType][0].id;
                           const newConds = [...(node.config?.conditions || [])];
                           newConds[idx] = { ...cond, type: newType, operator: defaultOp, value: '' };
                           handleConfigChange("conditions", newConds);
                         }} className="w-24 p-2 border border-slate-200 rounded text-xs outline-none bg-white">
                           {CONDITION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                         </select>

                         <button onClick={() => {
                            const newConds = [...(node.config?.conditions || [])];
                            newConds.splice(idx, 1);
                            handleConfigChange("conditions", newConds.length > 0 ? newConds : [{ id: '1', field: '', type: 'text', operator: 'equals', value: '' }]);
                         }} className="text-slate-400 hover:text-red-500 p-2"><X size={14}/></button>
                       </div>
                       
                       <div className="flex gap-2 items-start">
                         <select value={cond.operator || ops[0].id} onChange={e => {
                           const newConds = [...(node.config?.conditions || [])];
                           newConds[idx] = { ...cond, operator: e.target.value };
                           if (NO_VALUE_OPERATORS.includes(e.target.value)) newConds[idx].value = '';
                           handleConfigChange("conditions", newConds);
                         }} className={`${noValue ? 'w-full' : 'w-1/2'} p-2 border border-slate-200 rounded text-xs outline-none bg-white`}>
                           {ops.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
                         </select>
                         
                         {!noValue && (
                           <input type="text" placeholder="Value" value={cond.value || ""} onChange={e => {
                             const newConds = [...(node.config?.conditions || [])];
                             newConds[idx] = { ...cond, value: e.target.value };
                             handleConfigChange("conditions", newConds);
                           }} className="w-1/2 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                         )}
                       </div>
                     </div>
                   );
                 })}
                 <button onClick={() => {
                    const newConds = [...(node.config?.conditions || [{ id: '1', field: '', type: 'text', operator: 'equals', value: '' }])];
                    newConds.push({ id: crypto.randomUUID(), field: '', type: 'text', operator: 'equals', value: '' });
                    handleConfigChange("conditions", newConds);
                 }} className="text-xs font-bold text-brand-gold hover:text-brand-gold/80">+ Add Condition</button>
               </div>
             </div>
           )}

           {node.tool === 'if_else' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">If / Else Configuration</div>
               <p className="text-xs text-slate-500">Determine if the TRUE or FALSE path executes.</p>
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-bold">IF</span>
                   <select value={node.config?.matchType || "AND"} onChange={(e) => handleConfigChange("matchType", e.target.value)} className="p-1.5 border border-slate-200 rounded text-xs bg-slate-50 outline-none">
                     <option value="AND">ALL conditions match</option>
                     <option value="OR">ANY condition matches</option>
                   </select>
                 </div>
                 {(node.config?.conditions || [{ id: '1', field: '', type: 'text', operator: 'equals', value: '' }]).map((cond: any, idx: number) => {
                   const type = cond.type || 'text';
                   const ops = OPERATORS[type] || OPERATORS.text;
                   const noValue = NO_VALUE_OPERATORS.includes(cond.operator);
                   
                   return (
                     <div key={cond.id || idx} className="flex flex-col gap-2 bg-brand-gold/5 p-3 rounded-lg border border-brand-gold/20">
                       <div className="flex gap-2 items-start">
                         <input type="text" placeholder="Field e.g. {{trigger.contact.email}}" value={cond.field || ""} onChange={e => {
                           const newConds = [...(node.config?.conditions || [])];
                           newConds[idx] = { ...cond, field: e.target.value };
                           handleConfigChange("conditions", newConds);
                         }} className="flex-1 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                         
                         <select value={type} onChange={e => {
                           const newType = e.target.value;
                           const defaultOp = OPERATORS[newType][0].id;
                           const newConds = [...(node.config?.conditions || [])];
                           newConds[idx] = { ...cond, type: newType, operator: defaultOp, value: '' };
                           handleConfigChange("conditions", newConds);
                         }} className="w-24 p-2 border border-slate-200 rounded text-xs outline-none bg-white">
                           {CONDITION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                         </select>

                         <button onClick={() => {
                            const newConds = [...(node.config?.conditions || [])];
                            newConds.splice(idx, 1);
                            handleConfigChange("conditions", newConds.length > 0 ? newConds : [{ id: '1', field: '', type: 'text', operator: 'equals', value: '' }]);
                         }} className="text-slate-400 hover:text-red-500 p-2"><X size={14}/></button>
                       </div>
                       
                       <div className="flex gap-2 items-start">
                         <select value={cond.operator || ops[0].id} onChange={e => {
                           const newConds = [...(node.config?.conditions || [])];
                           newConds[idx] = { ...cond, operator: e.target.value };
                           if (NO_VALUE_OPERATORS.includes(e.target.value)) newConds[idx].value = '';
                           handleConfigChange("conditions", newConds);
                         }} className={`${noValue ? 'w-full' : 'w-1/2'} p-2 border border-slate-200 rounded text-xs outline-none bg-white`}>
                           {ops.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
                         </select>
                         
                         {!noValue && (
                           <input type="text" placeholder="Value" value={cond.value || ""} onChange={e => {
                             const newConds = [...(node.config?.conditions || [])];
                             newConds[idx] = { ...cond, value: e.target.value };
                             handleConfigChange("conditions", newConds);
                           }} className="w-1/2 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                         )}
                       </div>
                     </div>
                   );
                 })}
                 <button onClick={() => {
                    const newConds = [...(node.config?.conditions || [{ id: '1', field: '', type: 'text', operator: 'equals', value: '' }])];
                    newConds.push({ id: crypto.randomUUID(), field: '', type: 'text', operator: 'equals', value: '' });
                    handleConfigChange("conditions", newConds);
                 }} className="text-xs font-bold text-brand-gold hover:text-brand-gold/80">+ Add Condition</button>
               </div>
               
               <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-xs">
                   <div className="w-16 font-bold text-slate-500">THEN</div>
                   <div className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono text-[10px] font-bold">TRUE</div> branch executes
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                   <div className="w-16 font-bold text-slate-500">ELSE</div>
                   <div className="px-2 py-1 bg-red-100 text-red-700 rounded font-mono text-[10px] font-bold">FALSE</div> branch executes
                 </div>
               </div>
             </div>
           )}

           {node.tool === 'branch' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Branch Configuration</div>
               <p className="text-xs text-slate-500">The first branch that matches will execute.</p>
               <div className="space-y-4">
                 {(node.config?.branches || [{ id: 'branch_1', name: 'Branch 1', field: '', operator: 'equals', value: '' }]).map((b: any, idx: number) => (
                   <div key={b.id || idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                     <div className="flex items-center justify-between">
                       <input type="text" placeholder="Branch Name" value={b.name} onChange={e => {
                         const newBs = [...(node.config?.branches || [])];
                         newBs[idx].name = e.target.value;
                         handleConfigChange("branches", newBs);
                       }} className="font-bold bg-transparent outline-none border-b border-transparent focus:border-slate-300 text-sm w-full max-w-[200px]" />
                       <button onClick={() => {
                          const newBs = [...(node.config?.branches || [])];
                          newBs.splice(idx, 1);
                          handleConfigChange("branches", newBs.length > 0 ? newBs : [{ id: 'branch_1', name: 'Branch 1', field: '', operator: 'equals', value: '' }]);
                       }} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                     </div>
                     <div className="flex gap-2">
                       <input type="text" placeholder="Field" value={b.field} onChange={e => {
                         const newBs = [...(node.config?.branches || [])];
                         newBs[idx].field = e.target.value;
                         handleConfigChange("branches", newBs);
                       }} className="flex-1 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                       <select value={b.operator} onChange={e => {
                         const newBs = [...(node.config?.branches || [])];
                         newBs[idx].operator = e.target.value;
                         handleConfigChange("branches", newBs);
                       }} className="w-24 p-2 border border-slate-200 rounded text-xs outline-none bg-white">
                         <option value="equals">=</option>
                         <option value="not_equals">!=</option>
                         <option value="contains">Has</option>
                       </select>
                       <input type="text" placeholder="Value" value={b.value} onChange={e => {
                         const newBs = [...(node.config?.branches || [])];
                         newBs[idx].value = e.target.value;
                         handleConfigChange("branches", newBs);
                       }} className="flex-1 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                     </div>
                   </div>
                 ))}
                 <button onClick={() => {
                    const newBs = [...(node.config?.branches || [{ id: 'branch_1', name: 'Branch 1', field: '', operator: 'equals', value: '' }])];
                    newBs.push({ id: `branch_${crypto.randomUUID().substring(0,8)}`, name: `Branch ${newBs.length + 1}`, field: '', operator: 'equals', value: '' });
                    handleConfigChange("branches", newBs);
                 }} className="text-xs font-bold text-brand-gold hover:text-brand-gold/80">+ Add Branch</button>
               </div>
               
               <div className="mt-4 pt-4 border-t border-slate-100 p-3 bg-slate-50 rounded-lg border flex items-center justify-between">
                 <div className="text-xs font-bold">Fallback Branch</div>
                 <div className="text-[10px] text-slate-500">Executes if no other branches match</div>
               </div>
             </div>
           )}

           {node.tool === 'multi_split' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Multi Split</div>
               <p className="text-xs text-slate-500">Evaluate a single field against multiple specific values.</p>
               
               <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#1a1510]">Evaluate Field</label>
                 <input type="text" placeholder="{{trigger.contact.country}}" value={node.config?.evaluateField || ""} onChange={e => handleConfigChange("evaluateField", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
               </div>

               <div className="space-y-3 mt-4">
                 <label className="text-[11px] font-bold text-[#1a1510]">Cases (Values)</label>
                 {(node.config?.cases || [{ id: 'case_1', label: 'Case 1', value: '' }]).map((c: any, idx: number) => (
                   <div key={c.id || idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                     <div className="text-xs font-bold text-slate-400 w-16 text-right mr-2">Equals</div>
                     <input type="text" placeholder="Value" value={c.value} onChange={e => {
                       const newCs = [...(node.config?.cases || [])];
                       newCs[idx].value = e.target.value;
                       newCs[idx].label = e.target.value || `Case ${idx+1}`;
                       handleConfigChange("cases", newCs);
                     }} className="flex-1 p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                     <button onClick={() => {
                        const newCs = [...(node.config?.cases || [])];
                        newCs.splice(idx, 1);
                        handleConfigChange("cases", newCs.length > 0 ? newCs : [{ id: 'case_1', label: 'Case 1', value: '' }]);
                     }} className="text-slate-400 hover:text-red-500 p-2"><X size={14}/></button>
                   </div>
                 ))}
                 <button onClick={() => {
                    const newCs = [...(node.config?.cases || [{ id: 'case_1', label: 'Case 1', value: '' }])];
                    newCs.push({ id: `case_${crypto.randomUUID().substring(0,8)}`, label: `Case ${newCs.length + 1}`, value: '' });
                    handleConfigChange("cases", newCs);
                 }} className="text-xs font-bold text-brand-gold hover:text-brand-gold/80">+ Add Case</button>
               </div>
             </div>
           )}

           {node.tool === 'delay' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Delay Configuration</div>
               
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Delay Mode</label>
                  <select value={node.config?.mode || "for"} onChange={(e) => handleConfigChange("mode", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="for">Delay For (Duration)</option>
                    <option value="until">Delay Until (Specific Date/Time)</option>
                  </select>
               </div>

               {(!node.config?.mode || node.config.mode === 'for') ? (
                 <div className="flex gap-2">
                   <input type="number" min="1" placeholder="Amount" value={node.config?.amount || ""} onChange={e => handleConfigChange("amount", parseInt(e.target.value) || 0)} className="w-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                   <select value={node.config?.unit || "minutes"} onChange={(e) => handleConfigChange("unit", e.target.value)} className="flex-1 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                     <option value="minutes">Minutes</option>
                     <option value="hours">Hours</option>
                     <option value="days">Days</option>
                     <option value="weeks">Weeks</option>
                   </select>
                 </div>
               ) : (
                 <div className="space-y-2">
                   <input type="datetime-local" value={node.config?.datetime || ""} onChange={e => handleConfigChange("datetime", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                   <input type="text" placeholder="Timezone (e.g. UTC)" value={node.config?.timezone || "UTC"} onChange={e => handleConfigChange("timezone", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                 </div>
               )}
             </div>
           )}

           {node.tool === 'wait' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Wait Configuration</div>
               
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Wait Type</label>
                  <select value={node.config?.type || "condition"} onChange={(e) => handleConfigChange("type", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="condition">Wait until Condition is met</option>
                    <option value="event">Wait for External Event</option>
                  </select>
               </div>
               
               {(!node.config?.type || node.config.type === 'condition') ? (
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400">CONDITION TO WAIT FOR</label>
                    <input type="text" placeholder="Field" value={node.config?.field || ""} onChange={e => handleConfigChange("field", e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                    <select value={node.config?.operator || "equals"} onChange={e => handleConfigChange("operator", e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs outline-none bg-white">
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                    </select>
                    <input type="text" placeholder="Value" value={node.config?.value || ""} onChange={e => handleConfigChange("value", e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs outline-none bg-white" />
                 </div>
               ) : (
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#1a1510]">Event to Wait For</label>
                    <select value={node.config?.event || "reply_received"} onChange={(e) => handleConfigChange("event", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                      <option value="reply_received">Reply Received</option>
                      <option value="email_opened">Email Opened</option>
                      <option value="deal_won">Deal Won</option>
                    </select>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Timeout</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" placeholder="Duration" value={node.config?.timeout || 3} onChange={e => handleConfigChange("timeout", parseInt(e.target.value) || 0)} className="w-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                    <select value={node.config?.timeoutUnit || "days"} onChange={(e) => handleConfigChange("timeoutUnit", e.target.value)} className="flex-1 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
               </div>
             </div>
           )}

           {node.tool === 'loop' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Loop Configuration</div>
               
               <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#1a1510]">Array / Collection</label>
                 <input type="text" placeholder="{{apollo.people}}" value={node.config?.collection || ""} onChange={e => handleConfigChange("collection", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
               </div>

               <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#1a1510]">Concurrency (Parallel Executions)</label>
                 <select value={node.config?.concurrency || 1} onChange={(e) => handleConfigChange("concurrency", parseInt(e.target.value))} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                   <option value={1}>1 (Sequential)</option>
                   <option value={5}>5 Concurrent</option>
                   <option value={10}>10 Concurrent</option>
                 </select>
               </div>

               <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-xs">
                 <span className="font-bold">Available inside loop:</span><br/>
                 <code className="bg-white px-1 py-0.5 rounded text-[10px] mt-1 inline-block">{"{{"}loop.item{"}}"}</code><br/>
                 <code className="bg-white px-1 py-0.5 rounded text-[10px] mt-1 inline-block">{"{{"}loop.index{"}}"}</code>
               </div>
             </div>
           )}

           {node.tool === 'merge' && (
             <div className="space-y-4">
               <div className="text-[13px] font-bold text-[#1a1510]">Merge Configuration</div>
               <p className="text-xs text-slate-500">Wait for all incoming paths to complete before proceeding.</p>
               
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Merge Mode</label>
                  <select value={node.config?.mode || "all"} onChange={(e) => handleConfigChange("mode", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                    <option value="all">Wait for all required branches</option>
                    <option value="any">Continue when first branch completes</option>
                  </select>
               </div>
             </div>
           )}

           {node.tool === 'end_workflow' && (
             <div className="space-y-4 flex flex-col items-center justify-center text-center pt-8">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                 <X size={24} />
               </div>
               <div className="text-[13px] font-bold text-[#1a1510]">End Workflow</div>
               <p className="text-xs text-slate-500">This execution path will cleanly terminate here.</p>
             </div>
           )}

        </div>
      </div>
    );
  }

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
