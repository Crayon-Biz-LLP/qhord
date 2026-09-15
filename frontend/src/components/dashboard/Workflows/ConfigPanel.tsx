import React, { useState, useEffect } from "react";
import { WfNode } from "./ZapierBuilder";
import { X, Search, Wand2, Mail, Send, Activity, Clock, GitBranch, ShieldAlert, Settings2, ChevronDown } from "lucide-react";
import { useClient } from "../../../contexts/ClientContext";
import { api } from "../../../lib/api";

import { ACTION_SCHEMAS, FieldSchema } from "./actionSchemas";

export const ACTIONS: Record<string, { id: string, label: string }[]> = {
  Apollo: [
    { id: "search_people", label: "Search People" },
    { id: "enrich_contact", label: "Enrich Contact" },
    { id: "create_contact", label: "Create Contact" }
  ],
  Clay: [
    { id: "import_table", label: "Import Table" },
    { id: "company_enrichment", label: "Company Enrichment" },
    { id: "email_enrichment", label: "Email Enrichment" }
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
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [campaignsList, setCampaignsList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get('/settings')
      .then(res => setTeamMembers(res.data?.team || []))
      .catch(() => setTeamMembers([]));
    api.get('/campaigns')
      .then(res => setCampaignsList(res.data?.campaigns || []))
      .catch(() => setCampaignsList([]));
  }, []);

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

  // Apollo-backed generic Actions (Manage Lists/Sequences/Tasks, Enrich Data) always need
  // an Apollo account regardless of which block-library item they were added as.
  const apolloAccounts = toolAccounts.filter(a =>
    normalizeToolName(a.tool_name) === 'apollo'
    && a.status === 'connected'
    && a.account_label !== 'Auto (mock-ready)'
  );

  const renderApolloAccountPicker = () => {
    if (isLoadingAccounts) return null;
    if (apolloAccounts.length === 0) {
      return (
        <div className="flex flex-col gap-3 p-4 border border-amber-200 rounded-lg bg-amber-50">
          <div className="flex items-center gap-2 text-amber-800">
            <ShieldAlert size={16} />
            <span className="text-[13px] font-bold">⚠ No Apollo account connected</span>
          </div>
          <p className="text-xs text-amber-700">This action calls Apollo's API. Please connect an Apollo account before configuring it.</p>
          <a href="/dashboard/tools" target="_blank" rel="noopener noreferrer" className="self-start px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[13px] font-bold rounded-md transition-colors">
            Connect Account
          </a>
        </div>
      );
    }
    const savedAccountId = node.config?.accountId;
    const isSavedAccountMissing = savedAccountId && !apolloAccounts.find(a => a.id === savedAccountId);
    if (!savedAccountId) {
      setTimeout(() => handleConfigChange("accountId", apolloAccounts[0].id), 0);
    }
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#1a1510]">Apollo Account <span className="text-red-500">*</span></label>
        {isSavedAccountMissing && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <ShieldAlert size={16} />
            <span>The previously selected account is no longer connected. Please select another.</span>
          </div>
        )}
        <select
          value={(isSavedAccountMissing ? "" : savedAccountId) || ""}
          onChange={(e) => handleConfigChange("accountId", e.target.value)}
          className={`w-full p-2.5 border ${isSavedAccountMissing ? 'border-red-300' : 'border-[#1a1510]/[0.07]'} rounded-lg text-sm outline-none bg-[#faf9f8] font-medium text-[#1a1510]`}
        >
          <option value="" disabled>Select Apollo Account</option>
          {apolloAccounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.account_label}</option>
          ))}
        </select>
      </div>
    );
  };

  if (node.tool === 'manage_lists') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Manage Lists</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Adds records to an Apollo list, creating the list automatically if it doesn't exist yet.</p>
          {renderApolloAccountPicker()}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Record Type</label>
            <select value={node.config?.modality || "contacts"} onChange={e => handleConfigChange("modality", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              <option value="contacts">Contacts</option>
              <option value="accounts">Accounts</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Apollo Record IDs <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g., 60f1a..., 60f1b... (comma separated)" value={node.config?.entityIds || ""} onChange={e => handleConfigChange("entityIds", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">List Name(s) <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g., Q4 Outreach (comma separated)" value={node.config?.labelNames || ""} onChange={e => handleConfigChange("labelNames", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (node.tool === 'manage_sequences') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Manage Sequences</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Adds contacts to an existing Apollo outreach sequence.</p>
          {renderApolloAccountPicker()}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Sequence ID <span className="text-red-500">*</span></label>
            <input type="text" placeholder="{{trigger.sequence_id}}" value={node.config?.sequenceId || ""} onChange={e => handleConfigChange("sequenceId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Contact IDs <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Comma separated Apollo contact IDs" value={node.config?.contactIds || ""} onChange={e => handleConfigChange("contactIds", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Send From (Email Account ID) <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Apollo email sending account ID" value={node.config?.sendEmailFromAccountId || ""} onChange={e => handleConfigChange("sendEmailFromAccountId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Status</label>
            <select value={node.config?.status || "active"} onChange={e => handleConfigChange("status", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (node.tool === 'assign_manual_tasks') {
    const TASK_TYPES = ['call', 'outreach_manual_email', 'linkedin_step_connect', 'linkedin_step_message', 'linkedin_step_view_profile', 'linkedin_step_interact_post', 'action_item'];
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Assign Manual Tasks</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Creates a task in Apollo assigned to a specific user.</p>
          {renderApolloAccountPicker()}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Apollo User ID (owner) <span className="text-red-500">*</span></label>
            <input type="text" value={node.config?.userId || ""} onChange={e => handleConfigChange("userId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Contact ID <span className="text-red-500">*</span></label>
            <input type="text" placeholder="{{trigger.contact.id}}" value={node.config?.contactId || ""} onChange={e => handleConfigChange("contactId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Task Type</label>
            <select value={node.config?.type || "action_item"} onChange={e => handleConfigChange("type", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Due At <span className="text-red-500">*</span></label>
            <input type="text" placeholder="2026-10-15T10:00:00Z" value={node.config?.dueAt || ""} onChange={e => handleConfigChange("dueAt", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Priority</label>
            <select value={node.config?.priority || "medium"} onChange={e => handleConfigChange("priority", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Note</label>
            <textarea value={node.config?.note || ""} onChange={e => handleConfigChange("note", e.target.value)} className="w-full h-20 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (node.tool === 'enrich_data') {
    const mode = node.config?.mode || 'people';
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Enrich Data</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Enriches people or company data via Apollo.</p>
          {renderApolloAccountPicker()}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Enrich</label>
            <select value={mode} onChange={e => handleConfigChange("mode", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              <option value="people">People (bulk, up to 10)</option>
              <option value="organization">Organization</option>
            </select>
          </div>
          {mode === 'people' ? (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]">People (JSON array) <span className="text-red-500">*</span></label>
              <textarea placeholder='[{"email":"jane@acme.com"},{"first_name":"John","last_name":"Doe","organization_name":"Acme"}]' value={node.config?.details || ""} onChange={e => handleConfigChange("details", e.target.value)} className="w-full h-28 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none bg-white font-mono" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1a1510]">Company Domain</label>
                <input type="text" placeholder="apollo.io" value={node.config?.domain || ""} onChange={e => handleConfigChange("domain", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1a1510]">Website</label>
                <input type="text" placeholder="http://www.apollo.io" value={node.config?.website || ""} onChange={e => handleConfigChange("website", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1a1510]">LinkedIn URL</label>
                <input type="text" value={node.config?.linkedinUrl || ""} onChange={e => handleConfigChange("linkedinUrl", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1a1510]">Company Name</label>
                <input type="text" value={node.config?.name || ""} onChange={e => handleConfigChange("name", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (node.type === 'trigger') {
    const triggerType = node.config?.triggerType || 'schedule';
    const scheduleConfig = node.config?.scheduleConfig || { startType: 'immediate', frequencyType: 'once', intervalValue: 1, intervalUnit: 'weeks', activeDays: [], hasEndDate: false };
    const eventConfig = node.config?.eventConfig || { eventId: '' };

    const EVENT_OPTIONS = [
      { id: 'contact_added', label: 'Contact added' },
      { id: 'contact_updated', label: 'Contact updated' },
      { id: 'email_sent', label: 'Email sent' },
      { id: 'email_opened', label: 'Email opened' },
      { id: 'email_clicked', label: 'Email clicked' },
      { id: 'email_replied', label: 'Email replied' },
      { id: 'email_bounced', label: 'Email bounced' },
      { id: 'contact_enrolled_sequence', label: 'Contact enrolled/added to sequence' },
      { id: 'deal_created', label: 'Deal created' },
      { id: 'deal_updated', label: 'Deal updated' }
    ];

    // Apollo's reference scopes these events by "Sequence" + "Email sender" — we don't have
    // Sequences, so this maps to our real Campaign model instead.
    const EVENTS_WITH_CAMPAIGN_CONTEXT = ['email_sent', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced', 'contact_enrolled_sequence'];

    return (
      <div className="h-full flex flex-col bg-[#fcfcfc]">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#1a1510] text-[13px]">Trigger</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <h4 className="text-[13px] font-bold text-[#1a1510]">Run this workflow</h4>
            
            <div className={`space-y-3 p-4 rounded-xl border transition-colors shadow-sm ${triggerType === 'schedule' ? 'bg-brand-gold/[0.04] border-brand-gold/30' : 'bg-white border-[#1a1510]/[0.08]'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="triggerType" 
                  value="schedule" 
                  checked={triggerType === 'schedule'} 
                  onChange={() => handleConfigChange('triggerType', 'schedule')} 
                  className="mt-1 w-4 h-4 accent-brand-gold cursor-pointer" 
                />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#1a1510]">Based on a date or schedule</div>
                  <div className="text-[11px] text-[#1a1510]/50 mt-0.5">Example: On a specific date, or weekly on Mondays and Wednesdays.</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
              </label>
            </div>

            <div className={`space-y-3 p-4 rounded-xl border transition-colors shadow-sm ${triggerType === 'event' ? 'bg-brand-gold/[0.04] border-brand-gold/30' : 'bg-white border-[#1a1510]/[0.08]'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="triggerType" 
                  value="event" 
                  checked={triggerType === 'event'} 
                  onChange={() => handleConfigChange('triggerType', 'event')} 
                  className="mt-1 w-4 h-4 accent-brand-gold cursor-pointer" 
                />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#1a1510]">Based on a trigger event</div>
                  <div className="text-[11px] text-[#1a1510]/50 mt-0.5">Example: When a person opens your email, or a deal is created.</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Activity size={16} />
                </div>
              </label>
            </div>
          </div>

          <div className="h-px bg-[#1a1510]/[0.06]" />

          {triggerType === 'schedule' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3">
                <h4 className="text-[12px] font-semibold text-[#1a1510]/50 uppercase tracking-wider">Start</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="startType" 
                      checked={scheduleConfig.startType === 'immediate'} 
                      onChange={() => handleConfigChange('scheduleConfig', { ...scheduleConfig, startType: 'immediate' })} 
                      className="w-4 h-4 accent-brand-gold cursor-pointer" 
                    />
                    <span className="text-[13px] text-[#1a1510]">Immediately after activation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="startType" 
                      checked={scheduleConfig.startType === 'scheduled'} 
                      onChange={() => handleConfigChange('scheduleConfig', { ...scheduleConfig, startType: 'scheduled' })} 
                      className="w-4 h-4 accent-brand-gold cursor-pointer" 
                    />
                    <span className="text-[13px] text-[#1a1510]">On</span>
                    {scheduleConfig.startType === 'scheduled' && (
                      <input 
                        type="datetime-local" 
                        value={scheduleConfig.startDateTime || ""} 
                        onChange={(e) => handleConfigChange('scheduleConfig', { ...scheduleConfig, startDateTime: e.target.value })} 
                        className="ml-2 p-1.5 border border-[#1a1510]/[0.08] rounded-md text-[12px] outline-none" 
                      />
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[12px] font-semibold text-[#1a1510]/50 uppercase tracking-wider">Frequency</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="frequencyType" 
                      checked={scheduleConfig.frequencyType === 'once'} 
                      onChange={() => handleConfigChange('scheduleConfig', { ...scheduleConfig, frequencyType: 'once' })} 
                      className="w-4 h-4 accent-brand-gold cursor-pointer" 
                    />
                    <span className="text-[13px] text-[#1a1510]">Run only once</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="frequencyType" 
                      checked={scheduleConfig.frequencyType === 'recurring'} 
                      onChange={() => handleConfigChange('scheduleConfig', { ...scheduleConfig, frequencyType: 'recurring' })} 
                      className="w-4 h-4 accent-brand-gold cursor-pointer" 
                    />
                    <span className="text-[13px] text-[#1a1510]">Run every</span>
                    {scheduleConfig.frequencyType === 'recurring' && (
                      <div className="flex items-center gap-2 ml-2">
                        <input 
                          type="number" 
                          min="1" 
                          value={scheduleConfig.intervalValue} 
                          onChange={(e) => handleConfigChange('scheduleConfig', { ...scheduleConfig, intervalValue: parseInt(e.target.value) || 1 })} 
                          className="w-16 p-1.5 border border-[#1a1510]/[0.08] rounded-md text-[12px] outline-none" 
                        />
                        <select 
                          value={scheduleConfig.intervalUnit} 
                          onChange={(e) => handleConfigChange('scheduleConfig', { ...scheduleConfig, intervalUnit: e.target.value })} 
                          className="p-1.5 border border-[#1a1510]/[0.08] rounded-md text-[12px] outline-none bg-white"
                        >
                          <option value="days">days</option>
                          <option value="weeks">weeks</option>
                        </select>
                      </div>
                    )}
                  </label>

                  {scheduleConfig.frequencyType === 'recurring' && scheduleConfig.intervalUnit === 'weeks' && (
                    <div className="ml-6 mt-3 flex items-center gap-3">
                      <span className="text-[12px] text-[#1a1510]/60">On</span>
                      <div className="flex gap-1.5">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                          const fullDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                          const dayName = fullDays[idx];
                          const isActive = scheduleConfig.activeDays.includes(dayName);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                const newDays = isActive 
                                  ? scheduleConfig.activeDays.filter((d: string) => d !== dayName)
                                  : [...scheduleConfig.activeDays, dayName];
                                handleConfigChange('scheduleConfig', { ...scheduleConfig, activeDays: newDays });
                              }}
                              className={`w-7 h-7 rounded-md text-[11px] font-bold transition-colors ${isActive ? 'bg-[#1a1510] text-white' : 'bg-white border border-[#1a1510]/10 text-[#1a1510]/50 hover:bg-slate-50'}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={scheduleConfig.hasEndDate} 
                    onChange={(e) => handleConfigChange('scheduleConfig', { ...scheduleConfig, hasEndDate: e.target.checked })} 
                    className="w-4 h-4 accent-brand-gold cursor-pointer rounded" 
                  />
                  <span className="text-[13px] text-[#1a1510]">Set end date</span>
                </label>
                {scheduleConfig.hasEndDate && (
                  <div className="mt-3 ml-6">
                    <input 
                      type="datetime-local" 
                      value={scheduleConfig.endDateTime || ""} 
                      onChange={(e) => handleConfigChange('scheduleConfig', { ...scheduleConfig, endDateTime: e.target.value })} 
                      className="p-1.5 border border-[#1a1510]/[0.08] rounded-md text-[12px] outline-none w-full" 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {triggerType === 'event' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3">
                <h4 className="text-[12px] font-semibold text-[#1a1510]/50 uppercase tracking-wider">Trigger when</h4>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Event <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={eventConfig.eventId} 
                      onChange={(e) => handleConfigChange('eventConfig', { eventId: e.target.value })} 
                      className="w-full p-2.5 border border-[#1a1510]/[0.08] rounded-lg text-[13px] outline-none bg-white appearance-none pr-8"
                    >
                      <option value="" disabled>Select event...</option>
                      {EVENT_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {EVENTS_WITH_CAMPAIGN_CONTEXT.includes(eventConfig.eventId) && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#1a1510]">Campaigns</label>
                      <div className="border border-[#1a1510]/[0.08] rounded-lg bg-white max-h-40 overflow-y-auto">
                        {campaignsList.length === 0 ? (
                          <div className="p-3 text-[12px] text-slate-400">No campaigns found.</div>
                        ) : campaignsList.map(camp => {
                          const selectedIds: string[] = eventConfig.campaignIds || [];
                          const isSelected = selectedIds.includes(camp.id);
                          return (
                            <label key={camp.id} className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1a1510] hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const next = isSelected ? selectedIds.filter(id => id !== camp.id) : [...selectedIds, camp.id];
                                  handleConfigChange('eventConfig', { ...eventConfig, campaignIds: next });
                                }}
                                className="w-4 h-4 accent-brand-gold"
                              />
                              {camp.name}
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-400">Leave empty to trigger from any campaign.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#1a1510]">Email sender</label>
                      <select
                        value={eventConfig.senderOperatorId || ""}
                        onChange={(e) => handleConfigChange('eventConfig', { ...eventConfig, senderOperatorId: e.target.value })}
                        className="w-full p-2.5 border border-[#1a1510]/[0.08] rounded-lg text-[13px] outline-none bg-white"
                      >
                        <option value="">Any sender</option>
                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
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

           {node.tool === 'delay' && (() => {
             const mode = node.config?.mode || 'duration';
             const DELAY_MODES = [
               { id: 'duration', title: 'Wait for a set amount of time', example: 'Example: Wait 3 days' },
               { id: 'date_variable', title: 'Wait based on a date variable', example: 'Example: Wait 30 days after contact created date' },
               { id: 'recurring_day', title: 'Wait until a specific day each month or week', example: 'Example: Wait until the 15th of every month' },
               { id: 'specific_date', title: 'Wait until a specific date', example: 'Example: Wait until June 20, 2026' },
             ];
             return (
               <div className="space-y-4">
                 <div className="text-[13px] font-bold text-[#1a1510]">Timing</div>

                 <div className="space-y-2">
                   {DELAY_MODES.map(m => (
                     <label key={m.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${mode === m.id ? 'bg-brand-gold/[0.06] border-brand-gold/40' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                       <input type="radio" name="delay_mode" value={m.id} checked={mode === m.id} onChange={() => handleConfigChange('mode', m.id)} className="mt-1 w-4 h-4 accent-brand-gold cursor-pointer" />
                       <div>
                         <div className="text-[13px] font-semibold text-[#1a1510]">{m.title}</div>
                         <div className="text-[11px] text-slate-500 mt-0.5">{m.example}</div>
                       </div>
                     </label>
                   ))}
                 </div>

                 <div className="h-px bg-[#1a1510]/[0.06]" />

                 {mode === 'duration' && (
                   <div className="flex gap-2">
                     <input type="number" min="1" placeholder="Amount" value={node.config?.amount || ""} onChange={e => handleConfigChange("amount", parseInt(e.target.value) || 0)} className="w-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                     <select value={node.config?.unit || "days"} onChange={(e) => handleConfigChange("unit", e.target.value)} className="flex-1 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                       <option value="minutes">Minutes</option>
                       <option value="hours">Hours</option>
                       <option value="days">Days</option>
                       <option value="weeks">Weeks</option>
                     </select>
                   </div>
                 )}

                 {mode === 'date_variable' && (
                   <div className="space-y-2">
                     <label className="text-[11px] font-bold text-[#1a1510]">Date Variable</label>
                     <input type="text" placeholder="{{trigger.contact.created_at}}" value={node.config?.dateVariable || ""} onChange={e => handleConfigChange("dateVariable", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                     <label className="text-[11px] font-bold text-[#1a1510]">Offset (days after that date, can be negative)</label>
                     <input type="number" placeholder="30" value={node.config?.offsetDays ?? ""} onChange={e => handleConfigChange("offsetDays", parseInt(e.target.value) || 0)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                   </div>
                 )}

                 {mode === 'recurring_day' && (
                   <div className="space-y-3">
                     <div className="flex gap-2">
                       <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                         <input type="radio" name="delay_recurrence" checked={(node.config?.recurrence || 'weekly') === 'weekly'} onChange={() => handleConfigChange('recurrence', 'weekly')} className="accent-brand-gold" /> Weekly
                       </label>
                       <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                         <input type="radio" name="delay_recurrence" checked={node.config?.recurrence === 'monthly'} onChange={() => handleConfigChange('recurrence', 'monthly')} className="accent-brand-gold" /> Monthly
                       </label>
                     </div>
                     {node.config?.recurrence === 'monthly' ? (
                       <div className="space-y-2">
                         <label className="text-[11px] font-bold text-[#1a1510]">Day of Month (1-28)</label>
                         <input type="number" min={1} max={28} placeholder="15" value={node.config?.dayOfMonth || ""} onChange={e => handleConfigChange("dayOfMonth", parseInt(e.target.value) || 1)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                       </div>
                     ) : (
                       <div className="space-y-2">
                         <label className="text-[11px] font-bold text-[#1a1510]">Day of Week</label>
                         <select value={node.config?.dayOfWeek || "Mon"} onChange={(e) => handleConfigChange("dayOfWeek", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
                           {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                       </div>
                     )}
                   </div>
                 )}

                 {mode === 'specific_date' && (
                   <div className="flex gap-2">
                     <div className="flex-1 space-y-1">
                       <label className="text-[11px] font-bold text-[#1a1510]">Date</label>
                       <input type="date" value={node.config?.date || ""} onChange={e => handleConfigChange("date", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                     </div>
                     <div className="flex-1 space-y-1">
                       <label className="text-[11px] font-bold text-[#1a1510]">Time</label>
                       <input type="time" value={node.config?.time || ""} onChange={e => handleConfigChange("time", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                     </div>
                   </div>
                 )}
               </div>
             );
           })()}

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

  if (node.tool === 'send_webhook') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Send Webhook</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Sends an outbound HTTP request to a URL you control — no account connection needed.</p>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">URL <span className="text-red-500">*</span></label>
            <input type="text" placeholder="https://example.com/webhook" value={node.config?.url || ""} onChange={e => handleConfigChange("url", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Method</label>
            <select value={node.config?.method || "POST"} onChange={e => handleConfigChange("method", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Headers (JSON, optional)</label>
            <textarea placeholder='{"Authorization": "Bearer ..."}' value={node.config?.headers || ""} onChange={e => handleConfigChange("headers", e.target.value)} className="w-full h-20 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none bg-white font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Body (JSON or text, optional)</label>
            <textarea placeholder='{"email": "{{trigger.contact.email}}"}' value={node.config?.body || ""} onChange={e => handleConfigChange("body", e.target.value)} className="w-full h-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none bg-white font-mono" />
          </div>
        </div>
      </div>
    );
  }

  if (node.tool === 'send_notifications') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Send Notifications</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Creates an in-app notification for the operator who owns this workflow.</p>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="New lead replied" value={node.config?.title || ""} onChange={e => handleConfigChange("title", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Message <span className="text-red-500">*</span></label>
            <textarea placeholder="{{trigger.contact.email}} replied to your outreach." value={node.config?.message || ""} onChange={e => handleConfigChange("message", e.target.value)} className="w-full h-24 p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none resize-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Type</label>
            <input type="text" placeholder="workflow" value={node.config?.type || ""} onChange={e => handleConfigChange("type", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Related Entity ID (optional)</label>
            <input type="text" placeholder="{{trigger.lead.id}}" value={node.config?.entity_id || ""} onChange={e => handleConfigChange("entity_id", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Related Entity Type (optional)</label>
            <input type="text" placeholder="lead" value={node.config?.entity_type || ""} onChange={e => handleConfigChange("entity_type", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (node.tool === 'update_contact_account') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">ACTION / Update Contact/Account</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <p className="text-xs text-slate-500">Updates a lead record in your CRM. Leave a field blank to keep its current value.</p>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Lead ID <span className="text-red-500">*</span></label>
            <input type="text" placeholder="{{trigger.contact.id}}" value={node.config?.leadId || ""} onChange={e => handleConfigChange("leadId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Email</label>
            <input type="email" value={node.config?.email || ""} onChange={e => handleConfigChange("email", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]">First Name</label>
              <input type="text" value={node.config?.first_name || ""} onChange={e => handleConfigChange("first_name", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1a1510]">Last Name</label>
              <input type="text" value={node.config?.last_name || ""} onChange={e => handleConfigChange("last_name", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Title</label>
            <input type="text" value={node.config?.title || ""} onChange={e => handleConfigChange("title", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Company Name</label>
            <input type="text" value={node.config?.company_name || ""} onChange={e => handleConfigChange("company_name", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Industry</label>
            <input type="text" value={node.config?.industry || ""} onChange={e => handleConfigChange("industry", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#1a1510]">Status</label>
            <select value={node.config?.status || ""} onChange={e => handleConfigChange("status", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white">
              <option value="">Leave unchanged</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (node.tool === 'manage_deals') {
    const DEAL_STAGES = ['New Lead', 'Engaged', 'Meeting', 'Proposal', 'Closed'];
    const DEAL_FIELDS = [
      { id: 'amount', label: 'Deal amount' },
      { id: 'stage', label: 'Deal stage' },
      { id: 'health', label: 'Health score' },
      { id: 'pipeline', label: 'Pipeline' },
      { id: 'owner_operator_id', label: 'Deal owner' },
      { id: 'contact', label: 'Contact' },
      { id: 'name', label: 'Deal name' },
    ];
    const dealField = node.config?.deal_field || 'amount';

    const renderOwnerSelect = (fieldKey: string) => (
      <select value={node.config?.[fieldKey] || ""} onChange={e => handleConfigChange(fieldKey, e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white font-medium text-slate-700">
        <option value="">Unassigned</option>
        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    );

    const renderStageSelect = (fieldKey: string, includeUnchanged: boolean) => (
      <select value={node.config?.[fieldKey] || ""} onChange={e => handleConfigChange(fieldKey, e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white font-medium text-slate-700">
        {includeUnchanged ? <option value="">Leave unchanged</option> : <option value="" disabled>Select...</option>}
        {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    );

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-14 px-4 border-b border-[#1a1510]/[0.07] flex items-center justify-between shrink-0 bg-[#faf9f8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white border border-[#1a1510]/[0.07] flex items-center justify-center text-[#1a1510]/70">
              {getIcon()}
            </div>
            <h3 className="font-bold text-[#1a1510] text-[11px] tracking-widest uppercase">
              ACTION / Manage deals
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[#1a1510]">Action</label>
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                <input type="radio" name="deal_action" value="update" checked={node.config?.deal_action === 'update'} onChange={() => handleConfigChange('deal_action', 'update')} className="accent-[#1a1510] w-4 h-4" />
                Update deal
              </label>
              <label className="flex items-center gap-3 text-sm text-[#1a1510] font-medium cursor-pointer">
                <input type="radio" name="deal_action" value="create" checked={node.config?.deal_action !== 'update'} onChange={() => handleConfigChange('deal_action', 'create')} className="accent-[#1a1510] w-4 h-4" />
                Create deal
              </label>
            </div>
          </div>

          <div className="p-5 bg-[#faf9f8] border border-slate-200 rounded-xl space-y-4">
            {node.config?.deal_action === 'update' ? (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Deal ID <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="{{trigger.deal.id}}" value={node.config?.dealId || ""} onChange={e => handleConfigChange("dealId", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Deal field <span className="text-red-500">*</span></label>
                  <select value={dealField} onChange={e => handleConfigChange("deal_field", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white font-medium text-slate-700">
                    {DEAL_FIELDS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Set new value to</label>
                  {dealField === 'stage' ? renderStageSelect('stage', true)
                    : dealField === 'owner_operator_id' ? renderOwnerSelect('owner_operator_id')
                    : dealField === 'health' ? (
                      <input type="number" min={0} max={100} placeholder="Leave blank to keep unchanged" value={node.config?.health || ""} onChange={e => handleConfigChange("health", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                    ) : (
                      <input type="text" placeholder="Leave blank to keep unchanged" value={node.config?.[dealField] || ""} onChange={e => handleConfigChange(dealField, e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                    )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Deal Name <span className="text-red-500">*</span></label>
                  <input type="text" value={node.config?.name || ""} onChange={e => handleConfigChange("name", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Contact <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="{{trigger.contact.name}}" value={node.config?.contact || ""} onChange={e => handleConfigChange("contact", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Amount <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. $18.5K" value={node.config?.amount || ""} onChange={e => handleConfigChange("amount", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Pipeline <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Pipeline 1" value={node.config?.pipeline || ""} onChange={e => handleConfigChange("pipeline", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510] flex items-center gap-1">Deal Stage <span className="text-red-500">*</span></label>
                  {renderStageSelect('stage', false)}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Deal owner</label>
                  {renderOwnerSelect('owner_operator_id')}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1a1510]">Health Score (0-100)</label>
                  <input type="number" min={0} max={100} placeholder="80" value={node.config?.health || ""} onChange={e => handleConfigChange("health", e.target.value)} className="w-full p-2.5 border border-[#1a1510]/[0.07] rounded-lg text-sm outline-none bg-white" />
                </div>
                <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer pt-1">
                  <input type="checkbox" checked={!!node.config?.allowDuplicates} onChange={e => handleConfigChange("allowDuplicates", e.target.checked)} className="accent-[#1a1510] w-4 h-4" />
                  Allow duplicates
                </label>
                {!node.config?.allowDuplicates && (
                  <p className="text-[11px] text-slate-400 -mt-2">If a deal with this Name and Contact already exists for this client, it won't be created again.</p>
                )}
              </>
            )}
          </div>
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

        {/* Unverified endpoint notice: these tools' actions call our best-guess mapping
            of their API, not one confirmed against official docs. */}
        {node.tool && node.action && ['Clay', 'BetterContact'].includes(node.tool) && (
          <div className="flex items-start gap-2 p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>This action calls an unverified placeholder endpoint for {node.tool} — it hasn't been confirmed against official API documentation yet. Verify the response shape before relying on it in production.</span>
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
