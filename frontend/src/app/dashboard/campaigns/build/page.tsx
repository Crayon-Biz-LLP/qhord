"use client";

import React, { useState, useEffect } from "react";
import { useClient } from "../../../../contexts/ClientContext";
import { api } from "../../../../lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Save, Target, Layers, Users, Mail, RefreshCw,
  CheckCircle, Zap, Linkedin, Send, Check, Building2, Globe, Filter,
  Clock, Sparkles, ChevronDown, Settings2, Calendar,
  Phone, Database, Search, Upload, Pencil, ClipboardList, Puzzle,
  Wand2, Trash2, ArrowLeftRight, X, AlertTriangle, Plus,
  LayoutGrid, UserPlus, GitBranch, Shuffle, GitFork, LogOut, Bot,
  Star, Activity, Eye, ThumbsUp, ListChecks, DollarSign, Bell, Download, Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Step definitions ──────────────────────────────────────────────
const STEPS = [
  { key: "intent", label: "Intent", icon: Target },
  { key: "channels", label: "Channels", icon: Layers },
  { key: "leads", label: "Leads", icon: Users },
  { key: "messaging", label: "Messaging", icon: Mail },
  { key: "workflow", label: "Workflow", icon: RefreshCw },
  { key: "review", label: "Review", icon: Send },
] as const;

const INTENT_OPTIONS = [
  {
    id: "email",
    icon: Mail,
    title: "Email Outbound",
    desc: "Cold email sequences at scale",
    tools: ["Apollo", "Smartlead"],
  },
  {
    id: "linkedin",
    icon: Linkedin,
    title: "LinkedIn Outbound",
    desc: "Connection requests & DMs",
    tools: ["Apollo", "HeyReach"],
  },
  {
    id: "multichannel",
    icon: Send,
    title: "Multichannel Outbound",
    desc: "Email + LinkedIn + Calls combined",
    tools: ["Apollo", "Clay", "Smartlead", "HeyReach"],
  },
  {
    id: "signal",
    icon: Zap,
    title: "Signal-based Outreach",
    desc: "Triggered by hiring, funding, intent",
    tools: ["Clay", "Apollo", "Smartlead"],
  },
] as const;

const ALL_TOOLS = ["Apollo", "Clay", "Smartlead", "HeyReach"] as const;
const TIMING_OPTIONS = [
  "Send immediately", "Send in 30 minutes", "Send in 1 hour",
  "Wait 1 day", "Wait 3 days", "Wait 1 week",
] as const;

const MESSAGE_VARIABLES = ["{{first_name}}", "{{company}}", "{{title}}"] as const;

const PREVIEW_SAMPLE: Record<string, string> = {
  "{{first_name}}": "Sarah",
  "{{company}}": "Acme Corp",
  "{{title}}": "VP Sales",
};

type EmailStep = { id: string; timing: string; subject: string; body: string };

const WORKFLOW_TEMPLATES = [
  { id: "outbound", name: "Outbound — Email + LinkedIn", desc: "Smartlead + HeyReach + follow-ups", steps: 7 },
  { id: "executive", name: "Executive Touch", desc: "High-touch personalized outreach", steps: 4 },
  { id: "sprint", name: "Quick Sprint", desc: "Fast email-only sequence", steps: 3 },
] as const;

const GUARDRAILS = [
  { id: "reply", label: "If reply received", desc: "Pause sequence", required: true },
  { id: "meeting", label: "If meeting booked", desc: "Stop sequence", required: true },
  { id: "bounce", label: "If email bounces", desc: "Remove lead", required: true },
  { id: "positive", label: "Positive reply", desc: "Assign to AE + create deal", required: false },
  { id: "ooo", label: "Out-of-office detected", desc: "Pause 7 days", required: false },
] as const;

type WfAction = { id: string; label: string };
type WorkflowTab = { id: string; name: string; trigger: WfAction | null; actions: WfAction[] };

// Block-detail config (Trigger panel) options
const TRIGGER_MODES = [
  { id: "event", title: "When something happens", desc: "When a lead replies, books a meeting, signs up…", icon: Zap },
  { id: "schedule", title: "On a schedule", desc: "On a specific date, or weekly on Mondays.", icon: Calendar },
] as const;
const TRIGGER_APPS = [
  { id: "Qhord", icon: Sparkles },
  { id: "HeyReach", icon: Linkedin },
] as const;
const EVERY_UNITS = ["days", "weeks", "months"] as const;
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const TARGET_TABS = ["People", "Companies", "Deals"] as const;

const FIX_MODES = ["Suggest Only", "Require Approval", "Auto-Run (guardrailed)", "Fully Autonomous"] as const;

const FIX_PLANS = [
  {
    id: "mercedes",
    title: "Recover 132 Mercedes leads",
    risk: "Low Risk",
    problem: "1 lead with unknown email status.",
    diagnosis: "Apollo enrichment failed for legacy company aliases. Clay can resolve via secondary sources.",
    confidence: 85,
    impact: "$28K",
    expected: "132 leads unlocked, +$28K pipeline potential",
    steps: 3,
  },
  {
    id: "nike",
    title: "Recover Nike ABM reply rate",
    risk: "Low Risk",
    problem: "Single channel — adding LinkedIn lifts replies +18%.",
    diagnosis: "Subject line A/B variant B underperforming. Send window shifted to off-hours.",
    confidence: 86,
    impact: "$42K",
    expected: "+18% replies, +4 meetings expected",
    steps: 3,
  },
] as const;

// "Choose a block" library — grouped by category, each collapsible in the drawer.
const BLOCK_LIBRARY = [
  {
    key: "trigger", title: "Trigger", badge: "Start here",
    blocks: [
      { name: "Run this workflow", desc: "Choose between manual or scheduled execution", icon: Zap },
      { name: "Choose an app", desc: "Pick the source app & event to start", icon: LayoutGrid },
      { name: "Target", desc: "People, companies, or leads to enroll", icon: Target },
      { name: "Enrollment criteria", desc: "Define which records qualify to enter", icon: UserPlus },
    ],
  },
  {
    key: "rules", title: "Rules",
    blocks: [
      { name: "Filter", desc: "Only continue if condition is met", icon: Filter },
      { name: "Delay", desc: "Pause for a set time", icon: Clock },
      { name: "Multi-split branch", desc: "Create multiple conditional paths", icon: GitBranch },
      { name: "Traffic branch", desc: "Split a path by percentage", icon: Shuffle },
      { name: "True / False branch", desc: "Create two conditional paths", icon: GitFork },
      { name: "Exit workflow", desc: "Remove records from this workflow", icon: LogOut },
    ],
  },
  {
    key: "agents", title: "Agents", badge: "New",
    blocks: [
      { name: "AI Decision", desc: "Route based on AI signals and intent", icon: Bot },
      { name: "Auto-Fix monitor", desc: "Continuously watch metrics and auto-apply fixes", icon: Wand2 },
      { name: "Research with AI", desc: "Enrich by generating messaging using AI", icon: Search },
      { name: "Qualify records", desc: "Qualify entries using AI", icon: CheckCircle },
      { name: "Score lead", desc: "Assign a fit & intent score", icon: Star },
      { name: "Detect intent", desc: "Detect buying intent signals", icon: Activity },
    ],
  },
  {
    key: "linkedin", title: "LinkedIn",
    blocks: [
      { name: "View profile", desc: "Visit the lead's LinkedIn profile", icon: Eye },
      { name: "Like post", desc: "Like a recent post from the lead", icon: ThumbsUp },
      { name: "Follow profile", desc: "Follow the lead on LinkedIn", icon: UserPlus },
      { name: "Send connection request", desc: "Send invite (with optional note)", icon: Users },
      { name: "Send message", desc: "Send a 1:1 LinkedIn DM", icon: Send },
      { name: "Send InMail", desc: "Send a paid InMail to non-connections", icon: Mail },
    ],
  },
  {
    key: "actions", title: "Actions",
    blocks: [
      { name: "Integrations", desc: "Connect an external service to your workflow", icon: Layers, badge: "Beta" },
      { name: "Manage Sequences", desc: "Add, pause, finish or remove from sequences", icon: Send },
      { name: "Manage lists", desc: "Add or remove from lists", icon: ListChecks },
      { name: "Manage deals", desc: "Create, update or move deals", icon: DollarSign },
      { name: "Enrich data", desc: "Enrich contact/account with latest data", icon: Sparkles },
      { name: "Assign manual task", desc: "Assign a task to a teammate", icon: ClipboardList },
      { name: "Update contact / account", desc: "Set or change a field value", icon: RefreshCw },
      { name: "Send Notification", desc: "Notify a teammate in-app", icon: Bell },
    ],
  },
] as const;

const renderTemplate = (text: string) =>
  Object.entries(PREVIEW_SAMPLE).reduce((acc, [k, v]) => acc.split(k).join(v), text);

const CAMPAIGN_GOALS = [
  { id: "Book Meetings", icon: Calendar },
  { id: "Build Pipeline", icon: Target },
  { id: "Market Awareness", icon: Globe },
  { id: "Reactivation", icon: RefreshCw },
] as const;

const PARENT_ACCOUNTS = ["Acme Corp", "Globex", "Initech", "Umbrella Inc"] as const;

const EXECUTION_TOOLS = [
  { id: "Smartlead", icon: Mail, desc: "Email outreach & warming" },
  { id: "HeyReach", icon: Linkedin, desc: "LinkedIn automation" },
  { id: "Apollo", icon: Search, desc: "Prospecting & sequences" },
  { id: "Clay", icon: Database, desc: "Data enrichment" },
  { id: "HubSpot", icon: RefreshCw, desc: "CRM sync" },
  { id: "Calendly", icon: Calendar, desc: "Meeting booking" },
] as const;

const LEAD_METHODS = [
  { id: "tool", label: "Import leads from tool", icon: Database },
  { id: "csv", label: "Import CSV file", icon: Upload },
  { id: "manual", label: "Enter manually", icon: Pencil },
] as const;

type Lead = {
  id: string; name: string; email: string; company: string; title: string;
  status: "verified" | "catch-all" | "unknown"; source: string;
};

// Sample pool — in production, replace with the response from the selected source's API.
const SAMPLE_LEADS: Lead[] = [
  { id: "l1", name: "Sarah Chen", email: "sarah.chen@acme.io", company: "Acme Corp", title: "VP Sales", status: "verified", source: "apollo" },
  { id: "l2", name: "Marcus Weber", email: "mweber@techflow.de", company: "TechFlow GmbH", title: "Head of Growth", status: "verified", source: "apollo" },
  { id: "l3", name: "Emily Rodriguez", email: "emily.r@scalehq.com", company: "ScaleHQ", title: "Director Revenue", status: "catch-all", source: "csv" },
  { id: "l4", name: "James Park", email: "jpark@cloudnine.io", company: "CloudNine", title: "CRO", status: "verified", source: "clay" },
  { id: "l5", name: "Anna Müller", email: "amuller@datastack.eu", company: "DataStack EU", title: "VP Marketing", status: "verified", source: "apollo" },
  { id: "l6", name: "David Kim", email: "dkim@revops.co", company: "RevOps Co", title: "Sales Manager", status: "unknown", source: "csv" },
  { id: "l7", name: "Lisa Thompson", email: "lthompson@growthio.com", company: "Growth.io", title: "Head of Partnerships", status: "verified", source: "clay" },
  { id: "l8", name: "Robert Zhao", email: "rzhao@nexgen.ai", company: "NexGen AI", title: "CEO", status: "verified", source: "apollo" },
];

const LEAD_BULK_ACTIONS = [
  { label: "Find more leads like this", icon: Wand2 },
  { label: "Enrich missing data", icon: Sparkles },
  { label: "Clean & Dedup", icon: Filter },
  { label: "Add LinkedIn profiles", icon: Linkedin },
] as const;

const STATUS_STYLES: Record<Lead["status"], string> = {
  verified: "bg-[#1a1510] text-white",
  "catch-all": "bg-brand-gold/15 text-[#1a1510]/70",
  unknown: "bg-[#1a1510]/5 text-[#1a1510]/45",
};

const ICON_TILE = "bg-[#f7f8f9] text-[#1a1510]/50";

const LEAD_TOOL_SOURCES = [
  { id: "Apollo", desc: "275M+ contacts", icon: Search },
  { id: "Clay", desc: "Enriched tables", icon: Puzzle },
  { id: "Previous Campaigns", desc: "Reuse existing leads", icon: ClipboardList },
  { id: "CRM Import", desc: "HubSpot / Salesforce", icon: RefreshCw },
] as const;

const CHANNEL_STRATEGIES = [
  { id: "Email", icon: Mail, desc: "Cold email sequences via Smartlead", tools: ["Smartlead", "Apollo"] },
  { id: "LinkedIn", icon: Linkedin, desc: "Connection requests & DMs via HeyReach", tools: ["HeyReach"] },
  { id: "Call", icon: Phone, desc: "Manual call tasks for your team", tools: ["Manual"] },
  { id: "Task", icon: Settings2, desc: "Manual tasks and reminders", tools: ["Manual"] },
] as const;

export default function BuildCampaignPage() {
  const router = useRouter();
  const { clients, selectedClient } = useClient();
  const [step, setStep] = useState(0);
  const [campaignId] = useState(() => typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : 'c' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  const [apolloConfigModalOpen, setApolloConfigModalOpen] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [importingLeads, setImportingLeads] = useState(false);
  const [apolloFilters, setApolloFilters] = useState({
    jobTitle: "",
    companyName: "",
    industry: "",
    location: "",
    employeeCount: "",
    seniority: "",
    keywords: "",
    emailStatus: "",
    maxLeads: "25",
  });
  const [building, setBuilding] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [msgTab, setMsgTab] = useState<"email" | "linkedin">("email");
  const [timingOpenId, setTimingOpenId] = useState<string | null>(null);
  const [stepCounter, setStepCounter] = useState(2);
  const [liCounter, setLiCounter] = useState(1);
  const [emailSteps, setEmailSteps] = useState<EmailStep[]>([
    {
      id: "e1",
      timing: "Send in 30 minutes",
      subject: "Quick question about {{company}}",
      body: "Hi {{first_name}},\n\nI noticed {{company}} is scaling fast. Open to a chat?",
    },
  ]);
  const [linkedinSteps, setLinkedinSteps] = useState<EmailStep[]>([]);
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowTab[]>([{ id: "w1", name: "Main Workflow", trigger: null, actions: [] }]);
  const [activeWf, setActiveWf] = useState("w1");
  const [wfCounter, setWfCounter] = useState(2);
  const [actionCounter, setActionCounter] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [guardrails, setGuardrails] = useState<Record<string, boolean>>({
    reply: true, meeting: true, bounce: true, positive: true, ooo: true,
  });
  const [blockPanelOpen, setBlockPanelOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [detailBlock, setDetailBlock] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"trigger" | "action">("action");
  const [trigCfg, setTrigCfg] = useState({
    mode: "event" as string,
    run: "every" as string,
    everyCount: 1,
    everyUnit: "weeks" as string,
    days: [2] as number[],
    app: "HeyReach" as string,
    target: "People" as string,
    enrollment: "Any saved contacts" as string,
  });
  const [fixModes, setFixModes] = useState<Record<string, string>>({ mercedes: "Require Approval", nike: "Require Approval" });
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    trigger: true, rules: true, agents: true, linkedin: true, actions: true,
  });

  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualTitle, setManualTitle] = useState("");

  const [form, setForm] = useState({
    name: "",
    intent: "email" as string,
    goal: "Book Meetings" as string,
    parentAccount: "" as string,
    owner: "" as string,
    channels: ["Apollo", "Smartlead"] as string[],
    strategies: ["Email"] as string[],
    leadMethod: "tool" as string,
    leadSource: "Apollo" as string,
    manualLeads: "" as string,
    leadCount: 100,
    title: "",
    industry: "",
    geo: "",
    tone: "Professional" as string,
    sequenceSteps: 3,
    subject: "",
    body: "",
    warmupDays: 2,
    dailyLimit: 50,
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (selectedClient && !form.parentAccount) {
      set({ parentAccount: selectedClient.name });
    }
  }, [selectedClient, form.parentAccount]);

  const handleAddManualLead = () => {
    if (!manualName && !manualEmail) return;
    const newLead: Lead = {
      id: `manual_${Date.now()}`,
      name: manualName || "Unknown",
      email: manualEmail || "Unknown",
      company: manualCompany || "Unknown",
      title: manualTitle || "Unknown",
      status: "verified",
      source: "manual",
    };
    setLeads((prev) => [...prev, newLead]);
    setManualName("");
    setManualEmail("");
    setManualCompany("");
    setManualTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddManualLead();
    }
  };

  const handleApolloCardClick = async () => {
    if (!selectedClient) {
      toast.error("Please select an active client account from the sidebar first.");
      return;
    }

    setCheckingConnection(true);
    try {
      const res = await api.get(`/tools/apollo/status?clientAccountId=${selectedClient.id}`);
      const data = res.data;
      if (data.success) {
        set({ leadSource: "Apollo" });
        setApolloConfigModalOpen(true);
      } else {
        toast.error("Apollo is not connected for this client. Please connect Apollo in Tools Config.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to validate Apollo connection.");
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleImportApolloLeads = async () => {
    if (!selectedClient) {
      toast.error("Please select an active client first.");
      return;
    }

    setImportingLeads(true);
    try {
      const res = await api.post(`/campaigns/${campaignId}/leads/import/apollo`, {
        clientAccountId: selectedClient.id,
        filters: apolloFilters
      });
      const data = res.data;
      if (data.success) {
        if (data.fallback) {
          toast.warning("Apollo search is restricted on your free Apollo plan. Loaded sandbox/mock leads for testing.");
        } else {
          toast.success(`Successfully imported ${data.count} leads from Apollo!`);
        }
        setLeads(data.leads.map((l: any) => ({
          id: l.id,
          name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unknown',
          email: l.email || '',
          company: l.company_name || '',
          title: l.title || '',
          status: l.status || 'unknown',
          source: l.source || 'apollo'
        })));
        setSelectedLeads([]);
        setApolloConfigModalOpen(false);
      } else {
        toast.error(data.error || "Failed to import leads from Apollo.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to import leads from Apollo.");
    } finally {
      setImportingLeads(false);
    }
  };

  const handleEnrichLeads = async () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead to enrich.");
      return;
    }
    try {
      const res = await api.post(`/campaigns/${campaignId}/leads/enrich`, {
        leadIds: selectedLeads,
        tool: 'clay'
      });
      const data = res.data;
      if (data.success) {
        toast.success(`Enriched ${data.leads.length} leads successfully!`);
        setLeads(prev => prev.map(l => {
          const enriched = data.leads.find((el: any) => el.id === l.id);
          return enriched ? { ...l, status: 'verified', enriched: true } : l;
        }));
        setSelectedLeads([]);
      } else {
        toast.error("Failed to enrich leads.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to enrich leads.");
    }
  };

  const handleDedupLeads = async () => {
    try {
      const res = await api.post(`/campaigns/${campaignId}/leads/dedup`);
      const data = res.data;
      if (data.success) {
        toast.success(`Cleaned and removed ${data.removedCount} duplicate leads!`);
        setLeads(data.leads.map((l: any) => ({
          id: l.id,
          name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unknown',
          email: l.email || '',
          company: l.company_name || '',
          title: l.title || '',
          status: l.status || 'unknown',
          source: l.source || 'apollo'
        })));
        setSelectedLeads([]);
      } else {
        toast.error("Failed to deduplicate leads.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to deduplicate leads.");
    }
  };

  const handleAddLinkedInProfiles = async () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead.");
      return;
    }
    try {
      const res = await api.post(`/campaigns/${campaignId}/leads/enrich`, {
        leadIds: selectedLeads,
        tool: 'bettercontacts'
      });
      const data = res.data;
      if (data.success) {
        toast.success(`Fetched LinkedIn profiles for ${data.leads.length} leads!`);
        setLeads(prev => prev.map(l => {
          const enriched = data.leads.find((el: any) => el.id === l.id);
          return enriched ? { ...l, linkedinUrl: enriched.linkedin_url || (l as any).linkedinUrl } : l;
        }));
        setSelectedLeads([]);
      } else {
        toast.error("Failed to find LinkedIn profiles.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch LinkedIn profiles.");
    }
  };

  const handlePushLeads = () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead to push.");
      return;
    }
    toast.success(`Pushed ${selectedLeads.length} leads to outreach sequence!`);
    setSelectedLeads([]);
    next();
  };

  const toggleChannel = (tool: string) =>
    set({
      channels: form.channels.includes(tool)
        ? form.channels.filter((c) => c !== tool)
        : [...form.channels, tool],
    });

  const toggleStrategy = (id: string) =>
    set({
      strategies: form.strategies.includes(id)
        ? form.strategies.filter((s) => s !== id)
        : [...form.strategies, id],
    });

  const isLast = step === STEPS.length - 1;

  const manualCount = form.manualLeads.split("\n").map((s) => s.trim()).filter(Boolean).length;
  const leadsLoaded = form.leadMethod === "manual" ? manualCount : leads.length;

  const filteredLeads = leads.filter((l) => {
    const q = leadSearch.trim().toLowerCase();
    if (!q) return true;
    return [l.name, l.email, l.company, l.title].some((v) => v.toLowerCase().includes(q));
  });
  const allSelected = filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeads.includes(l.id));
  const unverifiedCount = leads.filter((l) => l.status !== "verified").length;

  const loadLeads = (source: string) => {
    set({ leadSource: source });
    // Map dynamically from the source — swap SAMPLE_LEADS for a real API response here.
    setLeads(SAMPLE_LEADS.map((l) => ({ ...l })));
    setSelectedLeads([]);
  };
  const toggleLead = (id: string) =>
    setSelectedLeads((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => setSelectedLeads(allSelected ? [] : filteredLeads.map((l) => l.id));
  const removeLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedLeads((prev) => prev.filter((x) => x !== id));
  };
  const removeSelected = () => {
    setLeads((prev) => prev.filter((l) => !selectedLeads.includes(l.id)));
    setSelectedLeads([]);
  };

  // Email sequence helpers
  const updateStep = (id: string, patch: Partial<EmailStep>) =>
    setEmailSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addFollowUp = () => {
    setEmailSteps((prev) => [...prev, { id: `e${stepCounter}`, timing: "Wait 3 days", subject: "", body: "" }]);
    setStepCounter((c) => c + 1);
  };
  const removeStep = (id: string) => setEmailSteps((prev) => prev.filter((s) => s.id !== id));
  const insertVariable = (id: string, variable: string) => {
    const s = emailSteps.find((x) => x.id === id);
    if (!s) return;
    updateStep(id, { body: `${s.body}${s.body && !s.body.endsWith(" ") ? " " : ""}${variable}` });
  };

  // LinkedIn sequence helpers
  const updateLiStep = (id: string, patch: Partial<EmailStep>) =>
    setLinkedinSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addLinkedinMessage = () => {
    setLinkedinSteps((prev) => [...prev, { id: `li${liCounter}`, timing: prev.length === 0 ? "Send in 1 hour" : "Wait 3 days", subject: "", body: "" }]);
    setLiCounter((c) => c + 1);
  };
  const removeLiStep = (id: string) => setLinkedinSteps((prev) => prev.filter((s) => s.id !== id));
  const insertLiVariable = (id: string, variable: string) => {
    const s = linkedinSteps.find((x) => x.id === id);
    if (!s) return;
    updateLiStep(id, { body: `${s.body}${s.body && !s.body.endsWith(" ") ? " " : ""}${variable}` });
  };

  // Workflow helpers
  const activeWorkflow = workflows.find((w) => w.id === activeWf) ?? workflows[0];
  const addWorkflow = () => {
    const id = `w${wfCounter}`;
    setWorkflows((prev) => [...prev, { id, name: `Workflow ${wfCounter}`, trigger: null, actions: [] }]);
    setActiveWf(id);
    setWfCounter((c) => c + 1);
  };
  const removeWorkflow = (id: string) => {
    if (workflows.length === 1) return;
    const rest = workflows.filter((w) => w.id !== id);
    setWorkflows(rest);
    if (activeWf === id) setActiveWf(rest[0].id);
  };
  const renameActiveWorkflow = (name: string) =>
    setWorkflows((prev) => prev.map((w) => (w.id === activeWf ? { ...w, name } : w)));
  const addAction = (label = "Send Email") => {
    setWorkflows((prev) => prev.map((w) => (w.id === activeWf ? { ...w, actions: [...w.actions, { id: `a${actionCounter}`, label }] } : w)));
    setActionCounter((c) => c + 1);
  };
  const removeAction = (aid: string) =>
    setWorkflows((prev) => prev.map((w) => (w.id === activeWf ? { ...w, actions: w.actions.filter((a) => a.id !== aid) } : w)));
  const toggleGuardrail = (id: string) => setGuardrails((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleCat = (key: string) => setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));
  const closeBlockPanel = () => {
    setBlockPanelOpen(false);
    setDetailBlock(null);
    setBlockSearch("");
  };
  const setTrig = (patch: Partial<typeof trigCfg>) => setTrigCfg((prev) => ({ ...prev, ...patch }));
  const toggleDay = (i: number) =>
    setTrigCfg((prev) => ({ ...prev, days: prev.days.includes(i) ? prev.days.filter((d) => d !== i) : [...prev.days, i] }));
  const setWorkflowTrigger = (label: string) =>
    setWorkflows((prev) => prev.map((w) => (w.id === activeWf ? { ...w, trigger: { id: `t-${w.id}`, label } } : w)));
  const openTriggerPicker = () => { setPickerTarget("trigger"); setBlockPanelOpen(true); };
  const openActionPicker = () => { setPickerTarget("action"); setBlockPanelOpen(true); };
  const confirmBlock = () => {
    if (detailBlock) {
      if (pickerTarget === "trigger") setWorkflowTrigger(detailBlock);
      else addAction(detailBlock);
    }
    closeBlockPanel();
  };
  const getBlockIcon = (name: string) => {
    for (const cat of BLOCK_LIBRARY) {
      const b = cat.blocks.find((x) => x.name === name);
      if (b) return b.icon;
    }
    return Zap;
  };
  // Light heuristic so the badges respond to the actual content
  const personalized = emailSteps.some((s) => /\{\{/.test(s.body));
  const replyRate = personalized ? Math.min(34, 8 + emailSteps.length * 6) : 8;
  const spamRisk = emailSteps.some((s) => /free|guarantee|!!!/i.test(s.subject + s.body)) ? 42 : 10;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => {
    if (step === 0) router.push("/dashboard/campaigns");
    else setStep((s) => s - 1);
  };

  const buildPrompt = () => {
    const intent = INTENT_OPTIONS.find((o) => o.id === form.intent)?.title ?? "Outbound";
    const sourceLabel =
      form.leadMethod === "csv" ? "a CSV upload" :
      form.leadMethod === "manual" ? "a manual list" :
      form.leadSource;
    return (
      `Create a ${intent} campaign${form.name ? ` named "${form.name}"` : ""}` +
      `${form.parentAccount ? ` under ${form.parentAccount}` : ""} ` +
      `with the goal of ${form.goal.toLowerCase()}. ` +
      `Source ${form.leadCount} leads from ${sourceLabel}` +
      `${form.title ? ` targeting "${form.title}"` : ""}` +
      `${form.industry ? ` in ${form.industry}` : ""}` +
      `${form.geo ? ` (${form.geo})` : ""}. ` +
      `Use these tools: ${form.channels.join(", ")}. ` +
      `Run a ${emailSteps.length}-step ${form.tone.toLowerCase()} email sequence` +
      `${emailSteps[0]?.subject ? ` opening with subject "${emailSteps[0].subject}"` : ""}. ` +
      `Warm up over ${form.warmupDays} days with a daily limit of ${form.dailyLimit}.`
    );
  };

  const handleBuild = async () => {
    setBuilding(true);
    try {
      await api.post("/campaigns/plan", {
        prompt: buildPrompt(),
        workflows: workflows.map((w) => ({
          name: w.name,
          actions: w.actions.map((a) => ({
            label: a.label,
          })),
        })),
      }, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        }
      });
    } catch (e) {
      console.error("Build campaign failed:", e);
    } finally {
      setBuilding(false);
      router.push("/dashboard/campaigns");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      {/* Header */}
      <header className="border-b border-[#1a1510]/[0.07] bg-white px-4 sm:px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push("/dashboard/campaigns")}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#1a1510]/50 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1510] truncate">Build Campaign</h1>
            <p className="text-[12px] font-medium text-[#1a1510]/40 truncate">
              {form.parentAccount ? `${form.parentAccount} · ` : ""}Step {step + 1} of {STEPS.length} · {STEPS[step].label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => isLast ? handleBuild() : setStep(STEPS.length - 1)}
            className="h-10 px-5 rounded-full border border-[#1a1510]/15 text-[12px] font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"
          >
            Build
          </button>
          <button
            onClick={() => router.push("/dashboard/campaigns")}
            className="h-10 px-5 rounded-full border border-[#1a1510]/15 text-[12px] font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-colors"
          >
            <Save size={15} className="text-[#1a1510]/50" /> <span className="hidden sm:inline">Save Draft</span>
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-[#1a1510]/[0.07] px-4 sm:px-8 py-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <button
                key={s.key}
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#1a1510] text-white shadow-sm"
                    : done
                    ? "bg-brand-gold/15 text-[#1a1510] hover:bg-brand-gold/25"
                    : "bg-[#f7f8f9] text-[#1a1510]/40"
                } ${i > step ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {done ? <Check size={14} className="text-brand-gold" /> : <s.icon size={14} className={active ? "text-brand-gold" : ""} />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={STEPS[step].key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {/* STEP 1 — INTENT */}
              {step === 0 && (
                <Section title="What do you want to run?" subtitle="Pick your outreach type — we'll handle the tool setup">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INTENT_OPTIONS.map((opt) => {
                      const selected = form.intent === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => set({ intent: opt.id, channels: [...opt.tools] })}
                          className={`text-left p-6 rounded-2xl border bg-white transition-all ${
                            selected
                              ? "border-brand-gold ring-2 ring-brand-gold/20 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.4)]"
                              : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selected ? "bg-[#1a1510] text-brand-gold" : "bg-[#f7f8f9] text-[#1a1510]/50"}`}>
                              <opt.icon size={20} />
                            </div>
                            <h3 className="text-base font-bold text-[#1a1510]">{opt.title}</h3>
                            {selected && <CheckCircle size={18} className="ml-auto text-brand-gold" />}
                          </div>
                          <p className="text-[13px] text-[#1a1510]/50 mb-3">{opt.desc}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {opt.tools.map((t) => (
                              <span key={t} className="text-[11px] font-semibold text-[#1a1510]/60 px-2 py-1 bg-[#f7f8f9] rounded-md">{t}</span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Advanced: manually select tools */}
                  <div className="rounded-2xl border border-[#1a1510]/[0.07] bg-white overflow-hidden">
                    <button
                      onClick={() => setAdvancedOpen((o) => !o)}
                      className="w-full flex items-center gap-2.5 px-5 py-4 text-[13px] font-semibold text-[#1a1510]/70 hover:bg-[#f7f8f9] transition-colors"
                    >
                      <Settings2 size={16} className="text-[#1a1510]/40" />
                      Advanced: manually select tools
                      <ChevronDown size={16} className={`ml-auto text-[#1a1510]/40 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {advancedOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {ALL_TOOLS.map((tool) => {
                              const on = form.channels.includes(tool);
                              return (
                                <button
                                  key={tool}
                                  onClick={() => toggleChannel(tool)}
                                  className={`py-3 rounded-xl text-[13px] font-bold transition-all border ${
                                    on
                                      ? "border-brand-gold bg-brand-gold/10 text-[#1a1510] ring-1 ring-brand-gold/30"
                                      : "border-[#1a1510]/[0.08] bg-white text-[#1a1510]/50 hover:border-[#1a1510]/20"
                                  }`}
                                >
                                  {tool}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-px bg-[#1a1510]/[0.07]" />

                  {/* Campaign Goal */}
                  <Field label="Campaign Goal" icon={Target}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {CAMPAIGN_GOALS.map((g) => {
                        const selected = form.goal === g.id;
                        return (
                          <button
                            key={g.id}
                            onClick={() => set({ goal: g.id })}
                            className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border bg-white transition-all ${
                              selected
                                ? "border-brand-gold ring-2 ring-brand-gold/20 text-[#1a1510]"
                                : "border-[#1a1510]/[0.07] text-[#1a1510]/60 hover:border-[#1a1510]/15"
                            }`}
                          >
                            <g.icon size={20} className={selected ? "text-brand-gold" : "text-[#1a1510]/40"} />
                            <span className="text-[13px] font-semibold">{g.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Parent Account */}
                  <Field label="Parent Account *" icon={Building2}>
                    <div className="relative">
                      <select
                        value={form.parentAccount}
                        onChange={(e) => set({ parentAccount: e.target.value })}
                        className={`${inputCls} appearance-none pr-10 cursor-pointer ${form.parentAccount ? "" : "text-[#1a1510]/30"}`}
                      >
                        <option value="">Select account…</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.name} className="text-[#1a1510]">{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/40 pointer-events-none" />
                    </div>
                  </Field>

                  {/* Campaign Name + Owner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Campaign Name *" icon={Sparkles}>
                      <input
                        value={form.name}
                        onChange={(e) => set({ name: e.target.value })}
                        placeholder="e.g. Germany Fleet Outreach Q2"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Owner" icon={Users}>
                      <input
                        value={form.owner}
                        onChange={(e) => set({ owner: e.target.value })}
                        placeholder="e.g. Sarah Kim"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </Section>
              )}

              {/* STEP 2 — CHANNELS */}
              {step === 1 && (
                <Section title="Channels & Tools" subtitle="Select channels and tools for this campaign">
                  {/* Execution Tools */}
                  <div>
                    <p className="text-[12px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3">Execution Tools</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {EXECUTION_TOOLS.map((tool) => {
                        const on = form.channels.includes(tool.id);
                        return (
                          <button
                            key={tool.id}
                            onClick={() => toggleChannel(tool.id)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border bg-white text-left transition-all ${
                              on ? "border-brand-gold ring-2 ring-brand-gold/15" : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ICON_TILE}`}>
                              <tool.icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-bold text-[#1a1510] truncate">{tool.id}</p>
                              <p className="text-[12px] text-[#1a1510]/45 truncate">{tool.desc}</p>
                            </div>
                            {on && <Check size={16} className="text-brand-gold shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Channel Strategy */}
                  <div>
                    <p className="text-[12px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3">Channel Strategy</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CHANNEL_STRATEGIES.map((s) => {
                        const on = form.strategies.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleStrategy(s.id)}
                            className={`p-5 rounded-2xl border bg-white text-left transition-all ${
                              on ? "border-brand-gold ring-2 ring-brand-gold/15" : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${on ? "bg-[#1a1510] text-brand-gold" : "bg-[#f7f8f9] text-[#1a1510]/40"}`}>
                                <s.icon size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-[15px] font-bold text-[#1a1510]">{s.id}</h3>
                                  {on && <Check size={15} className="text-brand-gold" />}
                                </div>
                                <p className="text-[12px] text-[#1a1510]/45 mt-0.5">{s.desc}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {s.tools.map((t) => (
                                <span key={t} className="text-[11px] font-semibold text-[#1a1510]/60 px-2 py-1 bg-[#f7f8f9] rounded-md">{t}</span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Channels */}
                  <div className="rounded-2xl border border-[#1a1510]/[0.07] bg-white p-5">
                    <p className="text-[12px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3">Active Channels</p>
                    {form.strategies.length === 0 ? (
                      <p className="text-[13px] text-[#1a1510]/35">No channels selected yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {form.strategies.map((id) => {
                          const s = CHANNEL_STRATEGIES.find((x) => x.id === id);
                          const Icon = s?.icon ?? Mail;
                          return (
                            <span key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1510] text-white text-[12px] font-semibold">
                              <Icon size={13} className="text-brand-gold" /> {id}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* STEP 3 — LEADS */}
              {step === 2 && (
                <Section
                  title="Add Leads"
                  subtitle="Upload, import, or manually add your contacts"
                  action={
                    <span className="px-3 py-1.5 rounded-lg border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/60">
                      {leadsLoaded} leads loaded
                    </span>
                  }
                >
                  {/* Method dropdown */}
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1510] mb-2.5">How would you like to add leads?</p>
                    <div className="relative">
                      <button
                        onClick={() => setMethodOpen((o) => !o)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#1a1510]/[0.07] bg-white text-left hover:border-[#1a1510]/15 transition-colors"
                      >
                        {(() => {
                          const m = LEAD_METHODS.find((x) => x.id === form.leadMethod) ?? LEAD_METHODS[0];
                          return <m.icon size={17} className="text-[#1a1510]/50 shrink-0" />;
                        })()}
                        <span className="text-[14px] font-semibold text-[#1a1510] flex-1">
                          {LEAD_METHODS.find((x) => x.id === form.leadMethod)?.label}
                        </span>
                        <ChevronDown size={17} className={`text-[#1a1510]/40 transition-transform ${methodOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {methodOpen && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setMethodOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 mt-2 bg-white border border-[#1a1510]/10 rounded-xl shadow-[0_12px_32px_-8px_rgba(26,21,16,0.18)] overflow-hidden z-[70] py-1.5"
                            >
                              {LEAD_METHODS.map((m) => {
                                const active = form.leadMethod === m.id;
                                return (
                                  <button
                                    key={m.id}
                                    onClick={() => {
                                      set({ leadMethod: m.id });
                                      setMethodOpen(false);
                                      setLeads([]);
                                      setSelectedLeads([]);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left ${
                                      active ? "bg-[#f7f8f9] text-[#1a1510]" : "text-[#1a1510]/70 hover:bg-[#f7f8f9]"
                                    }`}
                                  >
                                    <Check size={15} className={active ? "text-brand-gold" : "opacity-0"} />
                                    <m.icon size={16} className="text-[#1a1510]/50" />
                                    {m.label}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Method content */}
                  {form.leadMethod === "tool" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LEAD_TOOL_SOURCES.map((src) => {
                        const selected = form.leadSource === src.id;
                        return (
                          <button
                            key={src.id}
                            disabled={checkingConnection && src.id === "Apollo"}
                            onClick={() => {
                              if (src.id === "Apollo") {
                                handleApolloCardClick();
                              } else {
                                loadLeads(src.id);
                              }
                            }}
                            className={`text-left p-6 rounded-2xl border bg-white transition-all ${
                              selected ? "border-brand-gold ring-2 ring-brand-gold/15" : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                            } ${checkingConnection && src.id === "Apollo" ? "opacity-75 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ICON_TILE}`}>
                                {checkingConnection && src.id === "Apollo" ? (
                                  <div className="w-5 h-5 border-2 border-[#1a1510]/30 border-t-[#1a1510] rounded-full animate-spin" />
                                ) : (
                                  <src.icon size={18} />
                                )}
                              </div>
                              {selected && <CheckCircle size={18} className="text-brand-gold" />}
                            </div>
                            <h3 className="text-[15px] font-bold text-[#1a1510]">{src.id}</h3>
                            <p className="text-[12px] text-[#1a1510]/45 mt-0.5">{src.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Leads table — opens after a source is selected */}
                  {(form.leadMethod === "tool" || form.leadMethod === "manual") && leads.length > 0 && (
                    <div className="space-y-4">
                      {/* Auto-fix banner */}
                      {unverifiedCount > 0 && (
                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#1a1510]/[0.07] bg-[#fafafa]">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                              <AlertTriangle size={17} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[13px] font-bold text-[#1a1510]">
                                  {unverifiedCount} of {leads.length} leads are unverified or catch-all
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1a1510]/50 px-2 py-0.5 rounded-md bg-white border border-[#1a1510]/10">
                                  <Sparkles size={11} /> Auto-fix available
                                </span>
                              </div>
                              <p className="text-[12px] text-[#1a1510]/50 mt-0.5">
                                Fix: Recover unverified leads · 89% confidence ·
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-[#1a1510]/5 text-[#1a1510]/60 font-semibold text-[10px] uppercase">Low</span>
                              </p>
                            </div>
                          </div>
                          <button className="btn-shine h-9 px-4 rounded-lg bg-[#1a1510] text-white text-[12px] font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors shrink-0">
                            <Clock size={13} className="text-brand-gold" /> Queue Fix
                          </button>
                        </div>
                      )}

                      {/* Bulk actions */}
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (form.leadSource === "Apollo") {
                              setApolloConfigModalOpen(true);
                            } else {
                              toast.info("Find more leads is currently only supported with Apollo source.");
                            }
                          }}
                          className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2"
                        >
                          <Wand2 size={14} className="text-[#1a1510]/40" /> Find more leads like this
                        </button>
                        <button
                          type="button"
                          onClick={handleEnrichLeads}
                          className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2"
                        >
                          <Sparkles size={14} className="text-[#1a1510]/40" /> Enrich missing data
                        </button>
                        <button
                          type="button"
                          onClick={handleDedupLeads}
                          className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2"
                        >
                          <Filter size={14} className="text-[#1a1510]/40" /> Clean & Dedup
                        </button>
                        <button
                          type="button"
                          onClick={handleAddLinkedInProfiles}
                          className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2"
                        >
                          <Linkedin size={14} className="text-[#1a1510]/40" /> Add LinkedIn profiles
                        </button>
                      </div>

                      {/* Search + push/remove */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/30" />
                          <input
                            value={leadSearch}
                            onChange={(e) => setLeadSearch(e.target.value)}
                            placeholder="Search leads…"
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handlePushLeads}
                          className="h-11 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] transition-colors flex items-center gap-2"
                        >
                          <ArrowLeftRight size={14} className="text-[#1a1510]/40" /> Push Leads ({selectedLeads.length})
                        </button>
                        <button
                          onClick={removeSelected}
                          disabled={selectedLeads.length === 0}
                          className="h-11 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/60 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      {/* Table */}
                      <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-[#fafafa] border-b border-[#1a1510]/[0.07]">
                              <tr className="text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider">
                                <th className="py-3.5 px-4 w-10">
                                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#D4AF37] w-4 h-4 cursor-pointer" />
                                </th>
                                <th className="py-3.5 px-4">Name</th>
                                <th className="py-3.5 px-4">Email</th>
                                <th className="py-3.5 px-4">Company</th>
                                <th className="py-3.5 px-4">Title</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-center">Source</th>
                                <th className="py-3.5 px-4 w-10" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a1510]/[0.06]">
                              {filteredLeads.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="py-10 text-center text-[13px] text-[#1a1510]/40">No leads match your search.</td>
                                </tr>
                              ) : (
                                filteredLeads.map((l) => {
                                  const checked = selectedLeads.includes(l.id);
                                  return (
                                    <tr key={l.id} className={`group transition-colors ${checked ? "bg-brand-gold/[0.04]" : "hover:bg-[#fafafa]"}`}>
                                      <td className="py-3.5 px-4">
                                        <input type="checkbox" checked={checked} onChange={() => toggleLead(l.id)} className="accent-[#D4AF37] w-4 h-4 cursor-pointer" />
                                      </td>
                                      <td className="py-3.5 px-4 text-[13px] font-semibold text-[#1a1510]">{l.name}</td>
                                      <td className="py-3.5 px-4 text-[13px] text-[#1a1510]/55">{l.email}</td>
                                      <td className="py-3.5 px-4 text-[13px] text-[#1a1510]/70">{l.company}</td>
                                      <td className="py-3.5 px-4 text-[13px] text-[#1a1510]/55">{l.title}</td>
                                      <td className="py-3.5 px-4 text-center">
                                        <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[l.status]}`}>
                                          {l.status}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-4 text-center">
                                        <span className="inline-block text-[10px] font-semibold text-[#1a1510]/55 px-2 py-1 rounded-md bg-[#f7f8f9] lowercase">{l.source}</span>
                                      </td>
                                      <td className="py-3.5 px-4 text-center">
                                        <button
                                          onClick={() => removeLead(l.id)}
                                          className="text-[#1a1510]/25 hover:text-[#1a1510] transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <X size={15} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {form.leadMethod === "csv" && (
                    <label className="flex flex-col items-center justify-center gap-3 p-12 rounded-2xl border-2 border-dashed border-[#1a1510]/15 bg-white hover:border-brand-gold/50 transition-colors cursor-pointer text-center">
                      <div className="w-12 h-12 rounded-xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/40">
                        <Upload size={22} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1a1510]">Drop your CSV here or click to browse</p>
                        <p className="text-[12px] text-[#1a1510]/40 mt-1">Supports .csv up to 10MB · columns auto-mapped</p>
                      </div>
                      <input type="file" accept=".csv" className="hidden" />
                    </label>
                  )}

                  {form.leadMethod === "manual" && (
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Full Name"
                          className="w-full h-11 px-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="email"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Email"
                          className="w-full h-11 px-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={manualCompany}
                          onChange={(e) => setManualCompany(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Company"
                          className="w-full h-11 px-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Title"
                          className="w-full h-11 px-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddManualLead}
                        className="w-11 h-11 rounded-xl bg-[#1a1510] hover:bg-[#2a2118] text-white flex items-center justify-center transition-colors shrink-0 font-bold"
                      >
                        <Plus size={18} className="text-brand-gold" />
                      </button>
                    </div>
                  )}

                </Section>
              )}

              {/* STEP 4 — MESSAGING */}
              {step === 3 && (
                <Section
                  title="Messaging"
                  subtitle="Create your outreach messages"
                  action={
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-brand-gold/15 text-center">
                        <p className="text-[14px] font-bold text-[#1a1510] leading-none">{replyRate}%</p>
                        <p className="text-[10px] font-medium text-[#1a1510]/50 mt-0.5">Est. Reply</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-[#f7f8f9] text-center">
                        <p className="text-[14px] font-bold text-[#1a1510] leading-none">{spamRisk}%</p>
                        <p className="text-[10px] font-medium text-[#1a1510]/40 mt-0.5">Spam Risk</p>
                      </div>
                    </div>
                  }
                >
                  {/* Auto-fix banner */}
                  {replyRate < 15 && (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#1a1510]/[0.07] bg-[#fafafa]">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                          <AlertTriangle size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-bold text-[#1a1510]">Predicted reply rate is low ({replyRate}%) — messaging may be underperforming</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1a1510]/50 px-2 py-0.5 rounded-md bg-white border border-[#1a1510]/10">
                              <Sparkles size={11} /> Auto-fix available
                            </span>
                          </div>
                          <p className="text-[12px] text-[#1a1510]/50 mt-0.5">
                            Fix: Improve personalization · 86% confidence ·
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-[#1a1510]/5 text-[#1a1510]/60 font-semibold text-[10px] uppercase">Low</span>
                          </p>
                        </div>
                      </div>
                      <button className="btn-shine h-9 px-4 rounded-lg bg-[#1a1510] text-white text-[12px] font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors shrink-0">
                        <Clock size={13} className="text-brand-gold" /> Queue Fix
                      </button>
                    </div>
                  )}

                  {/* Active channels pills */}
                  <div className="flex flex-wrap gap-2">
                    {form.strategies.map((id) => {
                      const s = CHANNEL_STRATEGIES.find((x) => x.id === id);
                      const Icon = s?.icon ?? Mail;
                      return (
                        <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-[#1a1510] text-[12px] font-semibold">
                          <Icon size={13} /> {id}
                        </span>
                      );
                    })}
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-6 border-b border-[#1a1510]/[0.07]">
                    {([
                      { id: "email", label: "Emails", icon: Mail, count: emailSteps.length },
                      { id: "linkedin", label: "LinkedIn Messages", icon: Linkedin, count: linkedinSteps.length },
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setMsgTab(tab.id)}
                        className={`flex items-center gap-2 pb-3 -mb-px border-b-2 text-[13px] font-semibold transition-colors ${
                          msgTab === tab.id ? "border-[#1a1510] text-[#1a1510]" : "border-transparent text-[#1a1510]/40 hover:text-[#1a1510]/70"
                        }`}
                      >
                        <tab.icon size={15} /> {tab.label}
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${msgTab === tab.id ? "bg-[#1a1510] text-white" : "bg-[#f7f8f9] text-[#1a1510]/50"}`}>{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  {msgTab === "email" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[15px] font-bold text-[#1a1510]">Email Sequence</h3>
                          <p className="text-[12px] text-[#1a1510]/45">Build emails and follow-ups with custom timing</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#1a1510]/50 px-2.5 py-1 rounded-md border border-[#1a1510]/10">{emailSteps.length} step{emailSteps.length > 1 ? "s" : ""}</span>
                      </div>

                      {emailSteps.map((s, idx) => (
                        <div key={s.id} className="rounded-2xl border border-[#1a1510]/[0.07] bg-white p-5 space-y-4">
                          {/* Step header */}
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-[#1a1510] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1a1510]/60 px-2 py-1 rounded-md bg-[#f7f8f9]">
                              <Mail size={12} /> Email
                            </span>
                            <span className="text-[#1a1510]/20">·</span>
                            {/* Timing dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setTimingOpenId(timingOpenId === s.id ? null : s.id)}
                                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1a1510]/70 px-2.5 py-1 rounded-md border border-[#1a1510]/10 hover:border-[#1a1510]/20 transition-colors"
                              >
                                <Clock size={12} className="text-[#1a1510]/40" /> {s.timing}
                                <ChevronDown size={13} className={`text-[#1a1510]/40 transition-transform ${timingOpenId === s.id ? "rotate-180" : ""}`} />
                              </button>
                              <AnimatePresence>
                                {timingOpenId === s.id && (
                                  <>
                                    <div className="fixed inset-0 z-[60]" onClick={() => setTimingOpenId(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                                      className="absolute left-0 mt-2 w-48 bg-white border border-[#1a1510]/10 rounded-xl shadow-[0_12px_32px_-8px_rgba(26,21,16,0.18)] overflow-hidden z-[70] py-1.5"
                                    >
                                      {TIMING_OPTIONS.map((t) => (
                                        <button
                                          key={t}
                                          onClick={() => { updateStep(s.id, { timing: t }); setTimingOpenId(null); }}
                                          className={`w-full flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-left transition-colors ${t === s.timing ? "bg-[#f7f8f9] text-[#1a1510]" : "text-[#1a1510]/70 hover:bg-[#f7f8f9]"}`}
                                        >
                                          <Check size={13} className={t === s.timing ? "text-brand-gold" : "opacity-0"} /> {t}
                                        </button>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                            {emailSteps.length > 1 && (
                              <button onClick={() => removeStep(s.id)} className="ml-auto text-[#1a1510]/25 hover:text-[#1a1510] transition-colors">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          {/* Subject */}
                          <input
                            value={s.subject}
                            onChange={(e) => updateStep(s.id, { subject: e.target.value })}
                            placeholder="Subject line…"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[14px] font-medium text-[#1a1510] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                          />

                          {/* Body */}
                          <textarea
                            value={s.body}
                            onChange={(e) => updateStep(s.id, { body: e.target.value })}
                            placeholder="Write your message…"
                            className="w-full h-28 px-4 py-3 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[14px] resize-none focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                          />

                          {/* Variables */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-medium text-[#1a1510]/40">Variables:</span>
                            {MESSAGE_VARIABLES.map((v) => (
                              <button
                                key={v}
                                onClick={() => insertVariable(s.id, v)}
                                className="text-[11px] font-semibold text-brand-gold px-2 py-0.5 rounded-md bg-brand-gold/10 hover:bg-brand-gold/20 transition-colors"
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Add follow-up + Send test */}
                      <div className="flex flex-wrap gap-2.5">
                        <button onClick={addFollowUp} className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2">
                          <Plus size={15} className="text-[#1a1510]/40" /> Add Follow-up
                        </button>
                        <button className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2">
                          <Send size={14} className="text-[#1a1510]/40" /> Send Test
                        </button>
                      </div>

                      {/* Preview */}
                      <div className="rounded-2xl border border-[#1a1510]/[0.07] bg-[#fafafa] p-5">
                        <p className="text-[10px] font-bold text-[#1a1510]/35 uppercase tracking-wider mb-2">Preview · Email · Step 1</p>
                        <h4 className="text-[14px] font-bold text-[#1a1510]">{renderTemplate(emailSteps[0]?.subject || "—")}</h4>
                        <p className="text-[13px] text-[#1a1510]/55 mt-1.5 whitespace-pre-line leading-relaxed">{renderTemplate(emailSteps[0]?.body || "")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[15px] font-bold text-[#1a1510]">LinkedIn Sequence</h3>
                          <p className="text-[12px] text-[#1a1510]/45">Write LinkedIn DMs and follow-ups with custom timing</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#1a1510]/50 px-2.5 py-1 rounded-md border border-[#1a1510]/10">{linkedinSteps.length} step{linkedinSteps.length === 1 ? "" : "s"}</span>
                      </div>

                      {linkedinSteps.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#1a1510]/15 bg-white py-12 px-6 text-center">
                          <p className="text-[13px] text-[#1a1510]/40">No LinkedIn messages yet. Add one below to get started.</p>
                        </div>
                      ) : (
                        linkedinSteps.map((s, idx) => (
                          <div key={s.id} className="rounded-2xl border border-[#1a1510]/[0.07] bg-white p-5 space-y-4">
                            {/* Step header */}
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#1a1510] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1a1510]/60 px-2 py-1 rounded-md bg-[#f7f8f9]">
                                <Linkedin size={12} /> LinkedIn DM
                              </span>
                              <span className="text-[#1a1510]/20">·</span>
                              {/* Timing dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() => setTimingOpenId(timingOpenId === s.id ? null : s.id)}
                                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1a1510]/70 px-2.5 py-1 rounded-md border border-[#1a1510]/10 hover:border-[#1a1510]/20 transition-colors"
                                >
                                  <Clock size={12} className="text-[#1a1510]/40" /> {s.timing}
                                  <ChevronDown size={13} className={`text-[#1a1510]/40 transition-transform ${timingOpenId === s.id ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                  {timingOpenId === s.id && (
                                    <>
                                      <div className="fixed inset-0 z-[60]" onClick={() => setTimingOpenId(null)} />
                                      <motion.div
                                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                                        className="absolute left-0 mt-2 w-48 bg-white border border-[#1a1510]/10 rounded-xl shadow-[0_12px_32px_-8px_rgba(26,21,16,0.18)] overflow-hidden z-[70] py-1.5"
                                      >
                                        {TIMING_OPTIONS.map((t) => (
                                          <button
                                            key={t}
                                            onClick={() => { updateLiStep(s.id, { timing: t }); setTimingOpenId(null); }}
                                            className={`w-full flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-left transition-colors ${t === s.timing ? "bg-[#f7f8f9] text-[#1a1510]" : "text-[#1a1510]/70 hover:bg-[#f7f8f9]"}`}
                                          >
                                            <Check size={13} className={t === s.timing ? "text-brand-gold" : "opacity-0"} /> {t}
                                          </button>
                                        ))}
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                              <button onClick={() => removeLiStep(s.id)} className="ml-auto text-[#1a1510]/25 hover:text-[#1a1510] transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Body */}
                            <textarea
                              value={s.body}
                              onChange={(e) => updateLiStep(s.id, { body: e.target.value })}
                              placeholder="Hi {{first_name}}, came across {{company}} — would love to connect."
                              className="w-full h-24 px-4 py-3 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[14px] resize-none focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                            />

                            {/* Variables */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-medium text-[#1a1510]/40">Variables:</span>
                              {MESSAGE_VARIABLES.map((v) => (
                                <button
                                  key={v}
                                  onClick={() => insertLiVariable(s.id, v)}
                                  className="text-[11px] font-semibold text-brand-gold px-2 py-0.5 rounded-md bg-brand-gold/10 hover:bg-brand-gold/20 transition-colors"
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}

                      {/* Add message + Send test */}
                      <div className="flex flex-wrap gap-2.5">
                        <button onClick={addLinkedinMessage} className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2">
                          <Plus size={15} className="text-[#1a1510]/40" /> Add LinkedIn Message
                        </button>
                        <button className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2">
                          <Send size={14} className="text-[#1a1510]/40" /> Send Test
                        </button>
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* STEP 5 — WORKFLOW */}
              {step === 4 && (
                <Section
                  title="Workflows"
                  subtitle="Create one workflow per channel or campaign type — e.g. one for LinkedIn, one for Apollo"
                  action={
                    <button
                      onClick={addWorkflow}
                      className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2"
                    >
                      <Plus size={15} className="text-[#1a1510]/40" /> Add Workflow
                    </button>
                  }
                >
                  {/* Adaptive Mode */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#1a1510]/[0.07] bg-white">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                        <Sparkles size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#1a1510]">Adaptive Mode</p>
                        <p className="text-[12px] text-[#1a1510]/45">Auto Re-engine modifies the workflow based on engagement. Stays inside guardrails.</p>
                      </div>
                    </div>
                    <Toggle on={adaptiveMode} onChange={() => setAdaptiveMode((v) => !v)} />
                  </div>

                  {/* Workflow tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    {workflows.map((w) => {
                      const active = w.id === activeWf;
                      return (
                        <span
                          key={w.id}
                          className={`flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                            active ? "bg-brand-gold/15 text-[#1a1510] ring-1 ring-brand-gold/30" : "bg-[#f7f8f9] text-[#1a1510]/50"
                          }`}
                        >
                          <button onClick={() => setActiveWf(w.id)}>{w.name}</button>
                          {workflows.length > 1 && (
                            <button onClick={() => removeWorkflow(w.id)} className="text-[#1a1510]/30 hover:text-[#1a1510] transition-colors">
                              <X size={13} />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  {/* Workflow name */}
                  <div className="relative">
                    <Pencil size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/30" />
                    <input
                      value={activeWorkflow.name}
                      onChange={(e) => renameActiveWorkflow(e.target.value)}
                      placeholder="Workflow name"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#1a1510]/[0.07] text-[14px] font-semibold focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all"
                    />
                  </div>

                  {/* Templates */}
                  <div>
                    <p className="text-[12px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3">Start from a Template</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {WORKFLOW_TEMPLATES.map((t) => {
                        const selected = selectedTemplate === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTemplate(t.id)}
                            className={`text-left p-4 rounded-2xl border bg-white transition-all ${
                              selected ? "border-brand-gold ring-2 ring-brand-gold/15" : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                            }`}
                          >
                            <h4 className="text-[13px] font-bold text-[#1a1510]">{t.name}</h4>
                            <p className="text-[11px] text-[#1a1510]/45 mt-1 mb-3 line-clamp-1">{t.desc}</p>
                            <span className="text-[10px] font-semibold text-[#1a1510]/60 px-2 py-1 rounded-md bg-[#f7f8f9]">{t.steps} steps</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Canvas */}
                  <div
                    className="rounded-2xl border border-[#1a1510]/[0.07] p-6 min-h-[280px] flex flex-col items-center"
                    style={{ backgroundColor: "#fbfbfa", backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,21,16,0.08) 1px, transparent 0)", backgroundSize: "20px 20px" }}
                  >
                    {/* Trigger node */}
                    <button
                      onClick={openTriggerPicker}
                      className="w-full max-w-sm text-left rounded-2xl border border-brand-gold/40 bg-brand-gold/[0.06] p-4 hover:border-brand-gold transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center">
                          {(() => { const Icon = activeWorkflow.trigger ? getBlockIcon(activeWorkflow.trigger.label) : Zap; return <Icon size={15} />; })()}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a1510]/50">Trigger</span>
                      </div>
                      {activeWorkflow.trigger ? (
                        <p className="text-[14px] font-bold text-[#1a1510]">{activeWorkflow.trigger.label}</p>
                      ) : (
                        <>
                          <p className="text-[14px] font-bold text-[#1a1510]">When this happens…</p>
                          <p className="text-[12px] text-[#1a1510]/45">Choose an app & event to start</p>
                        </>
                      )}
                    </button>

                    {/* Action nodes */}
                    {activeWorkflow.actions.map((a) => {
                      const Icon = getBlockIcon(a.label);
                      return (
                        <React.Fragment key={a.id}>
                          <div className="w-px h-6 bg-[#1a1510]/15" />
                          <div className="w-full max-w-sm rounded-2xl border border-[#1a1510]/[0.07] bg-white p-4 flex items-center gap-3 group">
                            <div className="w-7 h-7 rounded-lg bg-[#1a1510] text-brand-gold flex items-center justify-center shrink-0">
                              <Icon size={14} />
                            </div>
                            <span className="text-[13px] font-semibold text-[#1a1510] flex-1">{a.label}</span>
                            <button onClick={() => removeAction(a.id)} className="text-[#1a1510]/25 hover:text-[#1a1510] transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Connector + add */}
                    <div className="w-px h-6 bg-[#1a1510]/15" />
                    <button
                      onClick={openActionPicker}
                      className="w-9 h-9 rounded-full bg-white border border-[#1a1510]/15 flex items-center justify-center text-[#1a1510]/50 hover:text-[#1a1510] hover:border-brand-gold/50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <p className="text-[12px] text-[#1a1510]/35 mt-3">
                      {!activeWorkflow.trigger
                        ? "Select a trigger to start"
                        : activeWorkflow.actions.length === 0
                        ? "Add your first action below"
                        : "End of workflow"}
                    </p>
                  </div>

                  {/* Guardrails */}
                  <div>
                    <p className="text-[12px] font-semibold text-[#1a1510]/40 uppercase tracking-wider mb-3">Guardrails</p>
                    <div className="rounded-2xl border border-[#1a1510]/[0.07] bg-white divide-y divide-[#1a1510]/[0.06]">
                      {GUARDRAILS.map((g) => (
                        <div key={g.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <Toggle on={!!guardrails[g.id]} onChange={() => toggleGuardrail(g.id)} disabled={g.required} />
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-[#1a1510]">{g.label}</p>
                              <p className="text-[12px] text-[#1a1510]/45">→ {g.desc}</p>
                            </div>
                          </div>
                          {g.required && (
                            <span className="text-[10px] font-semibold text-[#1a1510]/40 uppercase tracking-wider shrink-0">Required</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Send Limit */}
                  <Field label="Daily Send Limit" icon={Zap}>
                    <input
                      type="number" min={1}
                      value={form.dailyLimit}
                      onChange={(e) => set({ dailyLimit: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </Field>
                </Section>
              )}

              {/* STEP 6 — REVIEW */}
              {step === 5 && (
                <Section title="Review & Launch" subtitle="Confirm everything before activating">
                  {/* Metric cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { value: leads.length || leadsLoaded, label: "Leads" },
                      { value: form.strategies.length, label: "Channels" },
                      { value: emailSteps.length + linkedinSteps.length, label: "Workflow Steps" },
                      { value: `${form.warmupDays}d`, label: "Timeline" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-5 text-center">
                        <p className="text-2xl font-bold text-[#1a1510] tabular-nums">{m.value}</p>
                        <p className="text-[11px] font-medium text-[#1a1510]/40 mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Campaign */}
                  <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-5">
                    <p className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-wider mb-3">Campaign</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { label: "Name", value: form.name || "Untitled campaign" },
                        { label: "Account", value: form.parentAccount || "—" },
                        { label: "Type", value: INTENT_OPTIONS.find((o) => o.id === form.intent)?.title ?? "—" },
                        { label: "Owner", value: form.owner || "Unassigned" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center gap-2">
                          <span className="text-[12px] text-[#1a1510]/40">{r.label}:</span>
                          <span className="text-[13px] font-semibold text-[#1a1510] truncate">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leads */}
                  <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-5">
                    <p className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-wider mb-3">Leads</p>
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                      <span className="text-[13px]"><span className="text-[#1a1510]/40">Total</span> <b className="text-[#1a1510]">{leads.length || leadsLoaded}</b></span>
                      <span className="text-[13px]"><span className="text-[#1a1510]/40">Verified</span> <b className="text-[#1a1510]">{leads.filter((l) => l.status === "verified").length}</b></span>
                      <span className="text-[13px]"><span className="text-[#1a1510]/40">Enriched</span> <b className="text-[#1a1510]">0 actions</b></span>
                    </div>
                  </div>

                  {/* Workflows */}
                  <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-5">
                    <p className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-wider mb-3">Workflows ({workflows.length})</p>
                    <div className="space-y-2">
                      {workflows.map((w) => (
                        <div key={w.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#f7f8f9]">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#1a1510] truncate">{w.name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {form.channels.slice(0, 3).map((c) => (
                                <span key={c} className="text-[10px] font-semibold text-[#1a1510]/55 px-1.5 py-0.5 rounded bg-white">{c}</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-[#1a1510]/50 px-2 py-1 rounded-md bg-white shrink-0">{w.actions.length} block{w.actions.length === 1 ? "" : "s"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-Fix Plans */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={16} className="text-brand-gold" />
                      <h3 className="text-[15px] font-bold text-[#1a1510]">Auto-Fix Plans for this campaign</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1510]/60 px-2 py-0.5 rounded bg-brand-gold/15">{FIX_PLANS.length} issues</span>
                    </div>
                    <p className="text-[12px] text-[#1a1510]/45 mb-3">Each task has a multi-step fix plan with confidence, impact, and guardrails. Choose how to handle it before launch.</p>

                    <div className="space-y-3">
                      {FIX_PLANS.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                              <Wand2 size={17} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[14px] font-bold text-[#1a1510]">{p.title}</h4>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#1a1510]/55 px-1.5 py-0.5 rounded bg-[#1a1510]/5">{p.risk}</span>
                              </div>
                              <p className="text-[12px] text-[#1a1510]/60 mt-1"><b className="text-[#1a1510]/80">Problem:</b> {p.problem}</p>
                              <p className="text-[12px] text-[#1a1510]/50 mt-0.5"><b className="text-[#1a1510]/70">Diagnosis:</b> {p.diagnosis}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]">
                                <span className="text-[#1a1510]/45">Confidence <b className="text-[#1a1510]">{p.confidence}%</b></span>
                                <span className="text-[#1a1510] font-semibold">{p.impact} pipeline impact</span>
                                <span className="text-[#1a1510]/45">Expected: <b className="text-[#1a1510]/70">{p.expected}</b></span>
                              </div>
                              <span className="inline-block mt-2 text-[11px] font-semibold text-brand-gold px-2 py-1 rounded-md bg-brand-gold/10">{p.steps}-step fix plan</span>
                            </div>
                          </div>

                          {/* Mode row */}
                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1a1510]/[0.06]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1510]/35 mr-1">Mode</span>
                            {FIX_MODES.map((mode) => {
                              const active = (fixModes[p.id] ?? "Require Approval") === mode;
                              return (
                                <button
                                  key={mode}
                                  onClick={() => setFixModes((prev) => ({ ...prev, [p.id]: mode }))}
                                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
                                    active ? "bg-[#1a1510] text-white" : "bg-[#f7f8f9] text-[#1a1510]/55 hover:text-[#1a1510]"
                                  }`}
                                >
                                  {mode}
                                </button>
                              );
                            })}
                            <button className="btn-shine ml-auto h-9 px-4 rounded-lg bg-[#1a1510] text-white text-[11px] font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors">
                              <Clock size={13} className="text-brand-gold" /> Queue for Approval
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predicted Outcomes */}
                  <div className="rounded-2xl border border-[#1a1510]/[0.07] bg-[#fafafa] p-5">
                    <p className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-wider mb-3">Predicted Outcomes</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { value: "48%", label: "Open Rate" },
                        { value: `${replyRate}%`, label: "Reply Rate" },
                        { value: "0", label: "Est. Meetings" },
                        { value: "$2K", label: "Est. Pipeline" },
                      ].map((o) => (
                        <div key={o.label}>
                          <p className="text-2xl font-bold text-[#1a1510] tabular-nums">{o.value}</p>
                          <p className="text-[11px] font-medium text-[#1a1510]/45 mt-0.5">{o.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary actions */}
                  <div className="flex flex-wrap gap-2.5">
                    <button className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2">
                      <Save size={14} className="text-[#1a1510]/40" /> Save as Template
                    </button>
                    <button className="h-10 px-4 rounded-xl border border-[#1a1510]/10 bg-white text-[12px] font-semibold text-[#1a1510]/70 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2">
                      <ClipboardList size={14} className="text-[#1a1510]/40" /> Clone Campaign
                    </button>
                  </div>
                </Section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="border-t border-[#1a1510]/[0.07] bg-white px-4 sm:px-8 py-4 flex items-center justify-between shrink-0">
        <button
          onClick={back}
          className="h-11 px-5 rounded-xl text-[13px] font-semibold text-[#1a1510]/60 hover:text-[#1a1510] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {isLast ? (
          <button
            onClick={handleBuild}
            disabled={building}
            className="btn-shine h-11 px-7 rounded-xl bg-brand-gold text-[#1a1510] text-[13px] font-bold flex items-center gap-2 hover:translate-y-[-1px] transition-all disabled:opacity-50"
          >
            {building ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1a1510]/30 border-t-[#1a1510] rounded-full animate-spin" /> Launching…
              </>
            ) : (
              <>
                <Send size={16} /> Launch Campaign
              </>
            )}
          </button>
        ) : (
          <button
            onClick={next}
            className="btn-shine h-11 px-7 rounded-xl bg-[#1a1510] text-white text-[13px] font-bold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
          >
            Next <ArrowRight size={16} className="text-brand-gold" />
          </button>
        )}
      </footer>

      {/* "Choose a block" right drawer */}
      <AnimatePresence>
        {blockPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeBlockPanel}
              className="fixed inset-0 bg-[#1a1510]/20 z-[110]"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white border-l border-[#1a1510]/10 shadow-[-12px_0_40px_-12px_rgba(26,21,16,0.18)] z-[120] flex flex-col"
            >
              {detailBlock === null ? (
                <>
                  {/* Drawer header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1510]/[0.07] shrink-0">
                    <h3 className="text-[15px] font-bold text-[#1a1510]">Choose a block</h3>
                    <button onClick={closeBlockPanel} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">
                      <X size={17} />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="px-5 py-3 border-b border-[#1a1510]/[0.07] shrink-0">
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/30" />
                      <input
                        value={blockSearch}
                        onChange={(e) => setBlockSearch(e.target.value)}
                        placeholder="Search blocks…"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-5">
                    {BLOCK_LIBRARY.map((cat) => {
                      const q = blockSearch.trim().toLowerCase();
                      const blocks = cat.blocks.filter((b) => !q || b.name.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q));
                      if (blocks.length === 0) return null;
                      const expanded = q ? true : openCats[cat.key] !== false;
                      return (
                        <div key={cat.key}>
                          <button
                            onClick={() => toggleCat(cat.key)}
                            className="w-full flex items-center gap-2 mb-2.5"
                          >
                            <span className="text-[12px] font-bold text-[#1a1510]">{cat.title}</span>
                            {"badge" in cat && cat.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-gold px-1.5 py-0.5 rounded bg-brand-gold/10">{cat.badge}</span>
                            )}
                            <ChevronDown size={15} className={`ml-auto text-[#1a1510]/30 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }} className="overflow-hidden"
                              >
                                <div className="space-y-2">
                                  {blocks.map((b) => (
                                    <button
                                      key={b.name}
                                      onClick={() => {
                                        if (pickerTarget === "trigger") {
                                          setWorkflowTrigger(b.name);
                                          closeBlockPanel();
                                        } else {
                                          setDetailBlock(b.name);
                                        }
                                      }}
                                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-[#1a1510]/[0.07] bg-white text-left hover:border-brand-gold/40 hover:bg-brand-gold/[0.03] transition-all"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-[#f7f8f9] text-[#1a1510]/50 flex items-center justify-center shrink-0">
                                        <b.icon size={16} />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-[13px] font-bold text-[#1a1510]">{b.name}</p>
                                          {"badge" in b && b.badge && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1a1510]/40 px-1.5 py-0.5 rounded bg-[#f7f8f9]">{b.badge}</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-[#1a1510]/45 mt-0.5">{b.desc}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Detail header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1510]/[0.07] shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <button onClick={() => setDetailBlock(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors shrink-0">
                        <ArrowLeft size={17} />
                      </button>
                      <h3 className="text-[15px] font-bold text-[#1a1510] truncate">{detailBlock}</h3>
                    </div>
                    <button onClick={closeBlockPanel} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">
                      <X size={17} />
                    </button>
                  </div>

                  {/* Detail body */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-6">
                    {/* Run this workflow */}
                    <div>
                      <p className="text-[12px] font-bold text-[#1a1510] mb-2.5">Run this workflow</p>
                      <div className="space-y-2">
                        {TRIGGER_MODES.map((m) => {
                          const active = trigCfg.mode === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setTrig({ mode: m.id })}
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                                active ? "border-brand-gold ring-2 ring-brand-gold/15 bg-brand-gold/[0.04]" : "border-[#1a1510]/[0.07] bg-white hover:border-[#1a1510]/15"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-brand-gold" : "border-[#1a1510]/25"}`}>
                                {active && <span className="w-2 h-2 rounded-full bg-brand-gold" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-[#1a1510]">{m.title}</p>
                                <p className="text-[11px] text-[#1a1510]/45">{m.desc}</p>
                              </div>
                              <m.icon size={16} className="text-[#1a1510]/35 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Frequency (schedule only) */}
                    <AnimatePresence initial={false}>
                      {trigCfg.mode === "schedule" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }} className="overflow-hidden"
                        >
                          <p className="text-[12px] font-bold text-[#1a1510] mb-2.5">Frequency</p>
                          <div className="space-y-3">
                            <button onClick={() => setTrig({ run: "once" })} className="flex items-center gap-2.5">
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${trigCfg.run === "once" ? "border-brand-gold" : "border-[#1a1510]/25"}`}>
                                {trigCfg.run === "once" && <span className="w-2 h-2 rounded-full bg-brand-gold" />}
                              </span>
                              <span className="text-[13px] font-semibold text-[#1a1510]">Run once</span>
                            </button>
                            <div className="flex items-center gap-2.5">
                              <button onClick={() => setTrig({ run: "every" })} className="flex items-center gap-2.5 shrink-0">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${trigCfg.run === "every" ? "border-brand-gold" : "border-[#1a1510]/25"}`}>
                                  {trigCfg.run === "every" && <span className="w-2 h-2 rounded-full bg-brand-gold" />}
                                </span>
                                <span className="text-[13px] font-semibold text-[#1a1510]">Every</span>
                              </button>
                              <input
                                type="number" min={1}
                                value={trigCfg.everyCount}
                                onChange={(e) => setTrig({ everyCount: Number(e.target.value) })}
                                className="w-16 h-9 px-3 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] font-semibold text-center focus:bg-white focus:outline-none focus:border-brand-gold/40 transition-all"
                              />
                              <select
                                value={trigCfg.everyUnit}
                                onChange={(e) => setTrig({ everyUnit: e.target.value })}
                                className="h-9 px-3 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-brand-gold/40 transition-all cursor-pointer"
                              >
                                {EVERY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[12px] font-semibold text-[#1a1510]/50 mr-1">On</span>
                              {WEEK_DAYS.map((d, i) => {
                                const on = trigCfg.days.includes(i);
                                return (
                                  <button
                                    key={i}
                                    onClick={() => toggleDay(i)}
                                    className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${on ? "bg-[#1a1510] text-white" : "bg-[#f7f8f9] text-[#1a1510]/50 hover:bg-[#1a1510]/5"}`}
                                  >
                                    {d}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Choose an app */}
                    <div>
                      <p className="text-[12px] font-bold text-[#1a1510] mb-2.5">Choose an app</p>
                      <div className="grid grid-cols-2 gap-3">
                        {TRIGGER_APPS.map((a) => {
                          const active = trigCfg.app === a.id;
                          return (
                            <button
                              key={a.id}
                              onClick={() => setTrig({ app: a.id })}
                              className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl border transition-all ${
                                active ? "border-brand-gold ring-2 ring-brand-gold/15 bg-brand-gold/[0.04]" : "border-[#1a1510]/[0.07] bg-white hover:border-[#1a1510]/15"
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? "bg-brand-gold/15 text-brand-gold" : "bg-[#f7f8f9] text-[#1a1510]/45"}`}>
                                <a.icon size={18} />
                              </div>
                              <span className="text-[12px] font-bold text-[#1a1510]">{a.id}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Targets */}
                    <div>
                      <p className="text-[12px] font-bold text-[#1a1510] mb-2.5">Targets</p>
                      <div className="flex p-1 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07]">
                        {TARGET_TABS.map((t) => (
                          <button
                            key={t}
                            onClick={() => setTrig({ target: t })}
                            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                              trigCfg.target === t ? "bg-white text-[#1a1510] shadow-sm" : "text-[#1a1510]/45 hover:text-[#1a1510]/70"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enrollment criteria */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <p className="text-[12px] font-bold text-[#1a1510]">Enrollment criteria</p>
                        <Info size={13} className="text-[#1a1510]/30" />
                      </div>
                      <input
                        value={trigCfg.enrollment}
                        onChange={(e) => setTrig({ enrollment: e.target.value })}
                        placeholder="e.g. Any saved contacts"
                        className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>
                  </div>

                  {/* Detail footer */}
                  <div className="px-5 py-4 border-t border-[#1a1510]/[0.07] shrink-0 flex justify-end">
                    <button
                      onClick={confirmBlock}
                      className="btn-shine h-10 px-6 rounded-xl bg-[#1a1510] text-white text-[13px] font-bold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
                    >
                      <Check size={15} className="text-brand-gold" /> Done
                    </button>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Apollo Lead Search Modal */}
      <AnimatePresence>
        {apolloConfigModalOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-[#1a1510]/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4" onClick={() => !importingLeads && setApolloConfigModalOpen(false)}>
              {/* Modal content container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-[#1a1510]/10 shadow-[0_24px_64px_-16px_rgba(26,21,16,0.24)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1510]/[0.07] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                      <Search size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1a1510]">Apollo Lead Search</h3>
                      <p className="text-[12px] font-medium text-[#1a1510]/40">Configure search parameters for your client account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={importingLeads}
                    onClick={() => setApolloConfigModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors disabled:opacity-50"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Job Title */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. VP Sales, CRO"
                        value={apolloFilters.jobTitle}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={apolloFilters.companyName}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Industry</label>
                      <input
                        type="text"
                        placeholder="e.g. Software, Finance"
                        value={apolloFilters.industry}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. United States, Germany"
                        value={apolloFilters.location}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Employee Count */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Employee Count</label>
                      <input
                        type="text"
                        placeholder="e.g. 51-200, 501-1000"
                        value={apolloFilters.employeeCount}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, employeeCount: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Seniority */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Seniority</label>
                      <input
                        type="text"
                        placeholder="e.g. director, executive, VP"
                        value={apolloFilters.seniority}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, seniority: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Keywords</label>
                      <input
                        type="text"
                        placeholder="e.g. SaaS, AI, logistics"
                        value={apolloFilters.keywords}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, keywords: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>

                    {/* Email Status */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Email Status</label>
                      <select
                        value={apolloFilters.emailStatus}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, emailStatus: e.target.value }))}
                        className="w-full h-10 px-3 py-1.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all"
                      >
                        <option value="">Any Status</option>
                        <option value="verified">Verified</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>

                    {/* Max Leads */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[12px] font-bold text-[#1a1510]/60">Max Leads to Import</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={apolloFilters.maxLeads}
                        onChange={(e) => setApolloFilters(prev => ({ ...prev, maxLeads: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#1a1510]/[0.07] bg-[#fafafa] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    disabled={importingLeads}
                    onClick={() => setApolloConfigModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-[#1a1510]/15 text-[12px] font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={importingLeads}
                    onClick={handleImportApolloLeads}
                    className="btn-shine h-10 px-5 rounded-xl bg-[#1a1510] text-white text-[12px] font-bold flex items-center gap-2 hover:bg-[#2a2118] transition-colors disabled:opacity-50"
                  >
                    {importingLeads ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing…
                      </>
                    ) : (
                      <>
                        <Download size={14} className="text-brand-gold" />
                        Import Leads
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small presentational helpers ──────────────────────────────────
const inputCls =
  "w-full p-3 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[14px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30";

function Section({ title, subtitle, action, children }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">{title}</h2>
          <p className="text-[14px] text-[#1a1510]/45 mt-1">{subtitle}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

function FieldCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 space-y-6 ${className}`}>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, disabled = false }: { on: boolean; onChange?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${on ? "bg-brand-gold" : "bg-[#1a1510]/15"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
    </button>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ComponentType<any>; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1510]">
        {Icon && <Icon size={15} className="text-[#1a1510]/40" />}
        {label}
      </label>
      {children}
    </div>
  );
}
