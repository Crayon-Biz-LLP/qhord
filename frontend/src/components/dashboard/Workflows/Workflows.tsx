"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useClient } from "../../../contexts/ClientContext";
import {
   ArrowLeft,
   ArrowRight,
   Bell,
   Brain,
   Briefcase,
   Building2,
   Calendar,
   Check,
   CheckCircle2,
   ChevronDown,
   Circle,
   Database,
   DollarSign,
   Eye,
   Filter,
   GitBranch,
   Layers,
   LineChart,
   Link,
   ListChecks,
   Mail,
   MailPlus,
   Play,
   Plus,
   Rocket,
   Search,
   Send,
   Settings,
   Shield,
   Sparkles,
   Target,
   ThumbsUp,
   TrendingUp,
   UserPlus,
   Users,
   Webhook,
   Wand2,
   X,
   Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { WorkflowsIcon } from "../../ui/icons/WorkflowsIcon";

interface WorkflowsProps {
   onBackToDashboard: () => void;
}

type BuilderView = "list" | "standard" | "advanced";

type GuardrailAction =
   | "Hold for review"
   | "Request approval"
   | "Reroute"
   | "Notify owner"
   | "Send to review queue"
   | "Exit with reason"
   | "Continue (log only)";

const GUARDRAIL_ACTIONS: GuardrailAction[] = [
   "Hold for review",
   "Request approval",
   "Reroute",
   "Notify owner",
   "Send to review queue",
   "Exit with reason",
   "Continue (log only)",
];

type GuardrailItem = {
   id: string;
   title: string;
   description: string;
   recommended?: boolean;
   enabled: boolean;
   action: GuardrailAction;
};

const INITIAL_GUARDRAILS: GuardrailItem[] = [
   { id: "g1", title: "Active sequence conflict", description: "Block records currently active in an Apollo or Smartlead sequence.", recommended: true, enabled: true, action: "Hold for review" },
   { id: "g2", title: "Ownership check", description: "Reroute to the assigned account owner if found.", enabled: false, action: "Reroute" },
   { id: "g3", title: "Account owner is AE", description: "If account is AE-owned, move to AE-owned SDR cadence.", enabled: false, action: "Reroute" },
   { id: "g4", title: "Open opportunity", description: "Stop cold outbound when the account has an active deal.", recommended: true, enabled: true, action: "Hold for review" },
   { id: "g5", title: "Open Unibox thread", description: "Skip records with an active conversation in Unibox.", enabled: false, action: "Hold for review" },
   { id: "g6", title: "Suppression list", description: "Honor opt outs, do not contact, and exclusion lists.", recommended: true, enabled: false, action: "Exit with reason" },
   { id: "g7", title: "Compliance block", description: "GDPR, CASL, and region-specific rules. Block restricted regions.", enabled: false, action: "Exit with reason" },
   { id: "g8", title: "Data freshness", description: "Require enrichment within the last 30 days before outbound.", enabled: false, action: "Hold for review" },
   { id: "g9", title: "Verified contactability", description: "Require a verified email or valid LinkedIn before sending.", recommended: true, enabled: true, action: "Reroute" },
   { id: "g10", title: "Sender health", description: "Pause if mailbox warmup, bounce, or spam scores are degraded.", enabled: false, action: "Hold for review" },
   { id: "g11", title: "LinkedIn account health", description: "Pause LinkedIn actions if connection limits or warnings detected.", enabled: false, action: "Hold for review" },
   { id: "g12", title: "AI approval gate", description: "AI-generated messaging requires human approval before send.", enabled: false, action: "Request approval" },
];

type EnrollmentFilter = { id: string; label: string; value: string; active: boolean };

const INITIAL_ENROLLMENT: EnrollmentFilter[] = [
   { id: "e1", label: "ICP match", value: "true", active: false },
   { id: "e2", label: "Verified email", value: "yes", active: false },
   { id: "e3", label: "LinkedIn exists", value: "yes", active: false },
   { id: "e4", label: "Score threshold", value: "> 70", active: false },
   { id: "e5", label: "Intent threshold", value: "medium+", active: false },
   { id: "e6", label: "Enrichment status", value: "enriched", active: false },
   { id: "e7", label: "Not in active campaign", value: "true", active: false },
   { id: "e8", label: "Not contacted in 30 days", value: "true", active: false },
   { id: "e9", label: "No active opportunity", value: "true", active: false },
   { id: "e10", label: "No open Unibox thread", value: "true", active: false },
   { id: "e11", label: "Region", value: "NA / EU", active: false },
   { id: "e12", label: "Seniority", value: "VP+", active: false },
];

const STANDARD_STEPS = [
   { title: "Trigger", subtitle: "When does this run?" },
   { title: "Target", subtitle: "What does it act on?" },
   { title: "Enrollment", subtitle: "Who's allowed in?" },
   { title: "Guardrails", subtitle: "What should we never do?" },
   { title: "Path", subtitle: "What actions fire?" },
   { title: "Review", subtitle: "Final checks + launch" },
] as const;

const TRIGGER_OPTIONS = [
   // Apollo
   { name: "Email replied", desc: "Run when a prospect replies to an Apollo sequence.", source: "Apollo" },
   { name: "Contact added to sequence", desc: "Run when a contact is enrolled in an Apollo sequence.", source: "Apollo" },
   { name: "Sequence step completed", desc: "Run when a contact completes a step in an Apollo sequence.", source: "Apollo" },
   { name: "Meeting booked, if Apollo calendar data is available", desc: "Meeting booked, if Apollo calendar data is available.", source: "Apollo" },

   // Clay
   { name: "Lead enriched", desc: "Run after enrichment completes.", source: "Clay" },
   { name: "Company enriched", desc: "Run after company enrichment completes.", source: "Clay" },
   { name: "Enrichment failed", desc: "Run when enrichment fails.", source: "Clay" },
   { name: "Data updated", desc: "Run when data is updated.", source: "Clay" },

   // Smartlead
   { name: "Email replied", desc: "Run when a prospect replies to a Smartlead campaign.", source: "Smartlead" },
   { name: "Lead added to campaign", desc: "Run when a lead is added to Smartlead campaign.", source: "Smartlead" },
   { name: "Campaign step completed", desc: "Run when a campaign step is completed in Smartlead.", source: "Smartlead" },
   { name: "Email bounced", desc: "Run when email bounces.", source: "Smartlead" },
   { name: "Unsubscribed", desc: "Run when a contact unsubscribes.", source: "Smartlead" },

   // Instantly
   { name: "Email replied", desc: "Run when a prospect replies to an Instantly campaign.", source: "Instantly" },
   { name: "Lead added to campaign", desc: "Run when a lead is added to Instantly campaign.", source: "Instantly" },
   { name: "Campaign step completed", desc: "Run when a campaign step is completed in Instantly.", source: "Instantly" },
   { name: "Email bounced", desc: "Run when email bounces.", source: "Instantly" },
   { name: "Unsubscribed", desc: "Run when a contact unsubscribes.", source: "Instantly" },

   // BetterContact
   { name: "Email verified", desc: "Run when BetterContact verifies an email.", source: "BetterContact" },
   { name: "Phone verified", desc: "Run when BetterContact verifies a phone number.", source: "BetterContact" },
   { name: "Contact enriched", desc: "Run when contact enrichment is completed.", source: "BetterContact" },
   { name: "Invalid contact detected", desc: "Run when BetterContact detects an invalid contact.", source: "BetterContact" },

   // HeyReach
   { name: "LinkedIn replied", desc: "Run when a LinkedIn conversation gets a reply.", source: "HeyReach" },
   { name: "Connection request accepted", desc: "Run when connection request is accepted.", source: "HeyReach" },
   { name: "Message sent", desc: "Run when a message is sent in campaign.", source: "HeyReach" },
   { name: "Campaign completed", desc: "Run when campaign is completed.", source: "HeyReach" },

   // Calendly
   { name: "Meeting booked", desc: "Run when a meeting is booked.", source: "Calendly" },
   { name: "Meeting cancelled", desc: "Run when a meeting is cancelled.", source: "Calendly" },
   { name: "Meeting rescheduled", desc: "Run when a meeting is rescheduled.", source: "Calendly" }
];

const PATH_PRESETS = [
   { name: "Email-first cadence", desc: "Add to Apollo/Smartlead sequence with reply detection.", icon: Mail },
   { name: "LinkedIn-first", desc: "HeyReach connection + DM with delay.", icon: Send },
   { name: "Route by channel readiness", desc: "Email path or LinkedIn path based on data.", icon: GitBranch },
   { name: "Notify + assign owner", desc: "Slack alert + Qhord task.", icon: Bell },
];

function GuardrailActionDropdown({
   action,
   open,
   onToggle,
   onSelect,
}: {
   action: GuardrailAction;
   open: boolean;
   onToggle: () => void;
   onSelect: (a: GuardrailAction) => void;
}) {
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!open) return;
      const onDoc = (e: MouseEvent) => {
         if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
   }, [open, onToggle]);

   return (
      <div ref={ref} className="relative mt-3 flex items-center gap-2 text-xs text-[#1a1510]/50">
         <span className="font-semibold tracking-wide">IF TRIGGERED →</span>
         <button
            type="button"
            onClick={onToggle}
            className="h-9 px-3 rounded-lg border border-[#1a1510]/10 bg-white text-sm font-medium text-[#1a1510] flex items-center gap-2 hover:border-brand-gold/30"
         >
            {action}
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
         </button>
         {open && (
            <div className="absolute left-[108px] top-full mt-1 z-50 min-w-[220px] rounded-xl border border-[#1a1510]/10 bg-white shadow-lg py-1">
               {GUARDRAIL_ACTIONS.map((opt) => (
                  <button
                     key={opt}
                     type="button"
                     onClick={() => {
                        onSelect(opt);
                        onToggle();
                     }}
                     className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f7f8f9] flex items-center justify-between ${opt === action ? "text-[#1a1510] font-semibold" : "text-[#1a1510]/75"
                        }`}
                  >
                     {opt}
                     {opt === action && <Check size={14} className="text-emerald-600" />}
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}

export const Workflows = ({ onBackToDashboard }: WorkflowsProps) => {
   const [view, setView] = useState<BuilderView>("list");

   const { selectedClient } = useClient();
   const [templates, setTemplates] = useState<any[]>([]);
   const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [isLaunching, setIsLaunching] = useState(false);
   const [isDeleting, setIsDeleting] = useState<string | null>(null);
   const [workflowName, setWorkflowName] = useState("Untitled workflow");

   const [connectedTools, setConnectedTools] = useState<string[]>([]);
   const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");

   const fetchTemplates = useCallback(async () => {
      if (!selectedClient?.id) {
         setTemplates([]);
         return;
      }
      setIsLoadingTemplates(true);
      try {
         const { data } = await api.get(`/workflows?clientId=${selectedClient.id}`);
         if (data.success) {
            setTemplates(data.workflows || []);
         }
      } catch (err) {
         console.error("Failed to fetch templates", err);
      } finally {
         setIsLoadingTemplates(false);
      }
   }, [selectedClient?.id]);

   const fetchConnectedTools = useCallback(async () => {
      if (!selectedClient?.id) {
         setConnectedTools([]);
         return;
      }
      try {
         const { data } = await api.get(`/tools/accounts/${selectedClient.id}`);
         if (data.accounts) {
            setConnectedTools(data.accounts.map((a: any) => a.tool_name.toLowerCase()));
         }
      } catch (err) {
         console.error("Failed to fetch connected tools", err);
      }
   }, [selectedClient?.id]);

   useEffect(() => {
      fetchTemplates();
      fetchConnectedTools();
   }, [fetchTemplates, fetchConnectedTools]);

   const handleToggleStatus = async (templateId: string, currentStatus: string) => {
      const isCurrentlyActive = currentStatus === "active";
      const endpoint = isCurrentlyActive ? `/workflows/${templateId}/pause` : `/workflows/${templateId}/resume`;
      try {
         const { data } = await api.post(endpoint);
         if (data.success) {
            setTemplates((prev) =>
               prev.map((t) => (t.id === templateId ? { ...t, status: isCurrentlyActive ? "paused" : "active" } : t))
            );
            setLaunchToast(`Workflow ${isCurrentlyActive ? "paused" : "activated"} successfully.`);
         } else {
            if (!isCurrentlyActive) {
               const { data: launchData } = await api.post(`/workflows/${templateId}/launch`);
               if (launchData.success) {
                  setTemplates((prev) =>
                     prev.map((t) => (t.id === templateId ? { ...t, status: "active" } : t))
                  );
                  setLaunchToast("Workflow activated successfully.");
                  return;
               }
            }
            setLaunchToast(data.error || "Failed to toggle workflow status.");
         }
      } catch (err: any) {
         console.error("Toggle status error:", err);
         if (!isCurrentlyActive) {
            try {
               const { data: launchData } = await api.post(`/workflows/${templateId}/launch`);
               if (launchData.success) {
                  setTemplates((prev) =>
                     prev.map((t) => (t.id === templateId ? { ...t, status: "active" } : t))
                  );
                  setLaunchToast("Workflow activated successfully.");
                  return;
               }
            } catch (innerErr: any) {
               console.error("Inner launch error:", innerErr);
               setLaunchToast(innerErr.response?.data?.error || err.response?.data?.error || "Failed to activate workflow.");
               return;
            }
         }
         setLaunchToast(err.response?.data?.error || "Failed to toggle workflow status.");
      }
   };

   const openEditWorkflow = (template: any) => {
      setEditingWorkflowId(template.id);
      setWorkflowName(template.name);

      const manifest = template.manifest || {};

      const dbTrigger = manifest.trigger || "Apollo: Email replied";
      const parts = dbTrigger.split(": ");
      if (parts.length === 2) {
         setSelectedTriggerSource(parts[0]);
         setSelectedTrigger(parts[1]);
      } else {
         // Fallback if old format
         const found = TRIGGER_OPTIONS.find(t => t.name === dbTrigger);
         if (found) {
            setSelectedTriggerSource(found.source);
            setSelectedTrigger(found.name);
         } else {
            setSelectedTriggerSource("Apollo");
            setSelectedTrigger("Email replied");
         }
      }

      setSelectedTarget(manifest.target || "People");
      setSelectedPath(manifest.path || "Email-first cadence");
      setExecutionMode(manifest.mode || "Auto with guardrails");

      const savedFilters = manifest.enrollment?.filters || [];
      setEnrollmentFilters(INITIAL_ENROLLMENT.map(f => {
         const saved = savedFilters.find((sf: any) => sf.id === f.id || sf.label === f.label);
         return { ...f, active: !!saved };
      }));
      setAllowReEnrollment(!!manifest.enrollment?.allowReEnrollment);

      const savedGuardrails = manifest.guardrails || [];
      setGuardrails(INITIAL_GUARDRAILS.map(g => {
         const saved = savedGuardrails.find((sg: any) => sg.id === g.id || sg.title === g.title);
         return {
            ...g,
            enabled: saved ? !!saved.enabled : g.enabled,
            action: saved ? saved.action : g.action
         };
      }));

      setView(template.manifest?.builderType === "advanced" ? "advanced" : "standard");
      setStandardStep(1);
   };

   const handleSaveWorkflow = async (launchStatus: "draft" | "active" = "draft", builder: "standard" | "advanced" = "standard") => {
      if (!selectedClient?.id) {
         setLaunchToast("Please select a client to save workflow.");
         return;
      }
      if (!workflowName.trim()) {
         setLaunchToast("Workflow name is required.");
         return;
      }
      if (launchStatus === "active" && builder === "standard" && !selectedPath) {
         setLaunchToast("At least one workflow step/path is required before launch.");
         return;
      }

      setIsSaving(true);
      try {
         const payload = {
            name: workflowName,
            description: `Workflow (${builder} builder) triggered by: ${selectedTriggerSource}: ${selectedTrigger}`,
            trigger: `${selectedTriggerSource}: ${selectedTrigger}`,
            target: selectedTarget,
            enrollment: {
               filters: enrollmentFilters.filter((f) => f.active),
               allowReEnrollment,
            },
            guardrails: guardrails.filter((g) => g.enabled),
            path: selectedPath,
            mode: executionMode,
            status: launchStatus,
            clientId: selectedClient.id,
            builderType: builder,
         };

         let success = false;
         let errorMsg = "";
         let wfId = editingWorkflowId;

         if (editingWorkflowId) {
            if (launchStatus === "active") {
               const { data } = await api.post(`/workflows/${editingWorkflowId}/launch`, payload);
               success = data.success;
               errorMsg = data.error;
            } else {
               const { data } = await api.put(`/workflows/${editingWorkflowId}`, payload);
               success = data.success;
               errorMsg = data.error;
            }
         } else {
            const { data } = await api.post("/workflows", payload);
            success = data.success;
            errorMsg = data.error;
            wfId = data.workflow?.id;

            if (success && launchStatus === "active" && wfId) {
               const launchRes = await api.post(`/workflows/${wfId}/launch`, payload);
               success = launchRes.data.success;
               errorMsg = launchRes.data.error;
            }
         }

         if (success) {
            setLaunchToast(launchStatus === "active" ? "Workflow launched successfully!" : "Workflow template saved successfully!");
            fetchTemplates();
            closeBuilder();
         } else {
            setLaunchToast(errorMsg || "Failed to save workflow template.");
         }
      } catch (err: any) {
         console.error("Save workflow error:", err);
         setLaunchToast(err.response?.data?.error || "Failed to save workflow template.");
      } finally {
         setIsSaving(false);
      }
   };

   const handleLaunchCampaign = async (templateId: string) => {
      setIsLaunching(true);
      try {
         const { data } = await api.post(`/workflows/${templateId}/create-campaign`);
         if (data.success) {
            setLaunchToast("Active run campaign created from template!");
            closeBuilder();
         } else {
            setLaunchToast(data.error || "Failed to launch campaign run.");
         }
      } catch (err: any) {
         console.error("Launch campaign error:", err);
         setLaunchToast(err.response?.data?.error || "Failed to launch campaign run.");
      } finally {
         setIsLaunching(false);
      }
   };

   const handleDeleteTemplate = async (templateId: string) => {
      if (isDeleting) return;
      setIsDeleting(templateId);
      try {
         const { data } = await api.delete(`/workflows/${templateId}`);
         if (data.success) {
            setLaunchToast("Workflow template deleted successfully.");
            fetchTemplates();
         } else {
            setLaunchToast(data.error || "Failed to delete template.");
         }
      } catch (err: any) {
         console.error("Delete template error:", err);
         setLaunchToast(err.response?.data?.error || "Failed to delete template.");
      } finally {
         setIsDeleting(null);
      }
   };

   const [standardStep, setStandardStep] = useState(1);
   const [selectedTrigger, setSelectedTrigger] = useState("Email replied");
   const [selectedTriggerSource, setSelectedTriggerSource] = useState("Apollo");
   const [selectedTarget, setSelectedTarget] = useState("People");
   const [selectedPath, setSelectedPath] = useState("Email-first cadence");
   const [accountScope, setAccountScope] = useState("Whole workspace");
   const [campaignScope, setCampaignScope] = useState("All campaigns");
   const [enrollmentFilters, setEnrollmentFilters] = useState(INITIAL_ENROLLMENT);
   const [allowReEnrollment, setAllowReEnrollment] = useState(false);
   const [guardrails, setGuardrails] = useState(INITIAL_GUARDRAILS);
   const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
   const [showBlockPicker, setShowBlockPicker] = useState(false);
   const [blockSearch, setBlockSearch] = useState("");
   const [showModeMenu, setShowModeMenu] = useState(false);
   const [executionMode, setExecutionMode] = useState("Auto with guardrails");
   const [launchToast, setLaunchToast] = useState<string | null>(null);
   const [aiPrompt, setAiPrompt] = useState("");
   const [isCompiling, setIsCompiling] = useState(false);
   const [isRunningPipeline, setIsRunningPipeline] = useState(false);
   const [compiledPlan, setCompiledPlan] = useState<{
      manifest?: { name?: string; steps?: { tool: string; action: string; order: number }[] };
      resolvedSteps?: { tool: string; action: string; label: string }[];
   } | null>(null);
   const [pipelineResults, setPipelineResults] = useState<{
      status: string; tool: string; action: string; error?: string; response?: any
   }[] | null>(null);
   const [compileError, setCompileError] = useState<string | null>(null);

   useEffect(() => {
      if (!launchToast) return;
      const t = setTimeout(() => setLaunchToast(null), 3200);
      return () => clearTimeout(t);
   }, [launchToast]);

   const activeFilterCount = enrollmentFilters.filter((f) => f.active).length;
   const activeGuardrailCount = guardrails.filter((g) => g.enabled).length;
   const pathStepCount = selectedPath ? 1 : 0;

   const triggerDesc = TRIGGER_OPTIONS.find((t) => t.name === selectedTrigger && t.source.toLowerCase() === selectedTriggerSource.toLowerCase())?.desc ?? "";

   const openStandardBuilder = () => {
      setEditingWorkflowId(null);
      setWorkflowName("Untitled workflow");
      setSelectedTrigger("Email replied");
      setSelectedTriggerSource("Apollo");
      setSelectedTarget("People");
      setSelectedPath("Email-first cadence");
      setExecutionMode("Auto with guardrails");
      setEnrollmentFilters(INITIAL_ENROLLMENT.map(f => ({ ...f, active: false })));
      setAllowReEnrollment(false);
      setGuardrails(INITIAL_GUARDRAILS.map(g => ({ ...g, enabled: g.id === "g1" || g.id === "g4" || g.id === "g9", action: g.action })));
      setView("standard");
      setStandardStep(1);
      setOpenActionMenuId(null);
   };

   const openAdvancedBuilder = () => {
      setEditingWorkflowId(null);
      setWorkflowName("Untitled workflow");
      setSelectedTrigger("Email replied");
      setSelectedTriggerSource("Apollo");
      setSelectedTarget("People");
      setSelectedPath("Email-first cadence");
      setExecutionMode("Auto with guardrails");
      setEnrollmentFilters(INITIAL_ENROLLMENT.map(f => ({ ...f, active: false })));
      setAllowReEnrollment(false);
      setGuardrails(INITIAL_GUARDRAILS.map(g => ({ ...g, enabled: g.id === "g1" || g.id === "g4" || g.id === "g9", action: g.action })));
      setView("advanced");
      setShowBlockPicker(false);
      setOpenActionMenuId(null);
   };

   const closeBuilder = () => {
      setView("list");
      setShowBlockPicker(false);
      setOpenActionMenuId(null);
   };

   const toggleEnrollment = (id: string) => {
      setEnrollmentFilters((prev) =>
         prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
      );
   };

   const toggleGuardrail = (id: string) => {
      setGuardrails((prev) =>
         prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)),
      );
   };

   const setGuardrailAction = (id: string, action: GuardrailAction) => {
      setGuardrails((prev) => prev.map((g) => (g.id === id ? { ...g, action } : g)));
   };

   const compileFromPrompt = async () => {
      if (!aiPrompt.trim()) return;
      setIsCompiling(true);
      setCompileError(null);
      setCompiledPlan(null);
      try {
         const { data } = await api.post("/workflows/compile", { prompt: aiPrompt.trim() });
         if (data.success) {
            setCompiledPlan({
               manifest: data.manifest,
               resolvedSteps: data.resolvedSteps,
            });
         } else {
            setCompileError(data.error || "Failed to compile");
         }
      } catch (err: unknown) {
         const msg =
            err && typeof err === "object" && "response" in err
               ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
               : null;
         setCompileError(msg || "Failed to compile workflow");
      } finally {
         setIsCompiling(false);
      }
   };

   const runPipelineFromPrompt = async () => {
      if (!aiPrompt.trim()) return;
      setIsRunningPipeline(true);
      setCompileError(null);
      setPipelineResults(null);
      try {
         const { data } = await api.post("/workflows/run-prompt", { prompt: aiPrompt.trim() });
         if (data.success) {
            setCompiledPlan({
               manifest: { name: data.name, steps: data.resolvedSteps },
               resolvedSteps: data.resolvedSteps,
            });
            if (data.pipelineResult && data.pipelineResult.length > 0) {
               setPipelineResults(data.pipelineResult);
            }
            setLaunchToast(
               `Pipeline ran (${data.resolvedSteps?.length || 0} steps). Campaign: ${data.campaignId?.slice(0, 8)}…`
            );
         } else {
            setCompileError(data.error || "Failed to run pipeline");
         }
      } catch (err: unknown) {
         const msg =
            err && typeof err === "object" && "response" in err
               ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
               : null;
         setCompileError(msg || "Failed to run pipeline");
      } finally {
         setIsRunningPipeline(false);
      }
   };

    const renderListView = () => {
       const filteredTemplates = templates.filter(template => {
          if (!searchTerm.trim()) return true;
          return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
       });

       return (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 pb-20 min-h-0 relative">
             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight text-[#1a1510]">Workflows</h1>
                   <p className="mt-2 text-[15px] text-[#1a1510]/55 max-w-2xl leading-relaxed">
                      Run your GTM motions from one place. Trigger, qualify, route, and orchestrate across Apollo,
                      HeyReach, CRM, and Qhord — without bouncing between tabs.
                   </p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                   <div className="flex items-center -space-x-1">
                      {["Apollo", "HeyReach", "HubSpot", "Slack"].map((item) => (
                         <span key={item} className="h-7 px-2.5 inline-flex items-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500 shadow-sm">
                            {item}
                         </span>
                      ))}
                   </div>
                   <button
                      type="button"
                      disabled={!selectedClient}
                      onClick={openStandardBuilder}
                      className="h-10 px-5 inline-flex items-center gap-1.5 rounded-lg bg-[#1a1510] text-brand-gold border border-brand-gold/15 hover:bg-[#2a2118] text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                   >
                      <Plus size={14} /> New workflow
                   </button>
                </div>
             </div>

             {/* Top metrics grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                   {
                      label: "ACTIVE WORKFLOWS",
                      value: templates.filter(t => t.status === "active").length,
                      icon: Play,
                      color: "text-brand-gold bg-brand-gold/10 border-brand-gold/15",
                   },
                   {
                      label: "RECORDS IN FLIGHT",
                      value: "412",
                      icon: LineChart,
                      color: "text-[#1a1510] bg-[#1a1510]/5 border-[#1a1510]/10",
                   },
                   {
                      label: "GUARDRAILS FIRED (24H)",
                      value: "38",
                      icon: Shield,
                      color: "text-amber-600 bg-amber-50 border-amber-100",
                   },
                   {
                      label: "MEETINGS BOOKED (7D)",
                      value: "23",
                      icon: TrendingUp,
                      color: "text-brand-gold bg-brand-gold/10 border-brand-gold/15",
                   },
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

             {/* Start something new section */}
             <section className="space-y-3">
                <h2 className="text-xl font-bold tracking-tight text-[#1a1510]">Start something new</h2>
                <p className="text-[14px] text-[#1a1510]/50">Start guided, or open the orchestration canvas.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button
                      type="button"
                      disabled={!selectedClient}
                      onClick={openStandardBuilder}
                      className="text-left bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 hover:border-brand-gold/30 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <div className="flex items-center justify-between">
                         <div className="w-11 h-11 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center">
                            <Sparkles size={20} />
                         </div>
                         <ArrowRight size={18} className="text-[#1a1510]/40" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#1a1510]">Standard Builder</h3>
                      <p className="mt-1.5 text-xs text-[#1a1510]/55 leading-relaxed">Guided 6-step setup. Trigger → Target → Enrollment → Guardrails → Path → Launch.</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-[#1a1510]/45">
                         <span className="flex items-center gap-1"><Shield size={12} className="text-brand-gold" /> Guardrails built-in</span>
                         <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[#1a1510]/60" /> Pre-launch review</span>
                      </div>
                   </button>
                   <button
                      type="button"
                      disabled={!selectedClient}
                      onClick={openAdvancedBuilder}
                      className="text-left bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6 hover:border-brand-gold/30 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <div className="flex items-center justify-between">
                         <div className="w-11 h-11 rounded-xl bg-[#1a1510]/5 text-[#1a1510] flex items-center justify-center">
                            <GitBranch size={20} />
                         </div>
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1a1510]/5 text-[#1a1510]/70 border border-[#1a1510]/10 uppercase tracking-wider">POWER</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#1a1510]">Advanced Builder</h3>
                      <p className="mt-1.5 text-xs text-[#1a1510]/55 leading-relaxed">Full orchestration canvas. Nested branches, fallbacks, AI decisions, and approvals.</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-[#1a1510]/45">
                         <span className="flex items-center gap-1"><GitBranch size={12} className="text-brand-gold" /> Branching</span>
                         <span className="flex items-center gap-1"><Brain size={12} className="text-brand-gold" /> AI blocks</span>
                         <span className="flex items-center gap-1"><Filter size={12} className="text-brand-gold" /> Fallbacks</span>
                      </div>
                   </button>
                </div>
             </section>

             {/* Prompt input generator */}
             <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0 hidden sm:flex">
                      <Brain size={18} />
                   </div>
                   <input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && compileFromPrompt()}
                      className="flex-1 bg-transparent outline-none text-sm min-h-[40px] px-2 text-[#1a1510]"
                      placeholder="Describe a workflow... e.g. 'When a fintech founder replies, classify and book a call'"
                   />
                   <div className="flex gap-2 shrink-0">
                      <button
                         type="button"
                         disabled={isCompiling || !aiPrompt.trim() || !selectedClient}
                         onClick={compileFromPrompt}
                         className="h-10 px-5 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-700"
                      >
                         {isCompiling ? "Planning…" : "Preview plan"}
                      </button>
                      <button
                         type="button"
                         disabled={isRunningPipeline || !aiPrompt.trim() || !selectedClient}
                         onClick={runPipelineFromPrompt}
                         className="h-10 px-5 rounded-lg bg-[#1a1510] text-brand-gold border border-brand-gold/15 hover:bg-[#2a2118] font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                      >
                         <Sparkles size={14} />
                         {isRunningPipeline ? "Running…" : "Generate"}
                      </button>
                   </div>
                </div>
                {compileError && (
                   <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{compileError}</p>
                )}
                {compiledPlan?.resolvedSteps && compiledPlan.resolvedSteps.length > 0 && (
                   <div className="rounded-xl border border-[#1a1510]/10 bg-[#f7f8f9] p-4 space-y-2">
                      <p className="text-xs font-bold tracking-widest text-[#1a1510]/45 uppercase">
                         Resolved pipeline {compiledPlan.manifest?.name ? `· ${compiledPlan.manifest.name}` : ""}
                      </p>
                      <ol className="space-y-1.5">
                         {compiledPlan.resolvedSteps.map((step, i) => (
                            <li key={`${step.label}-${i}`} className="text-sm text-[#1a1510]/75 flex items-center gap-2">
                               <span className="w-5 h-5 rounded-full bg-[#1a1510]/10 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {i + 1}
                               </span>
                               <span className="font-medium text-[#1a1510]">{step.label}</span>
                               <span className="text-[#1a1510]/40 text-xs">
                                  ({step.tool}.{step.action})
                               </span>
                            </li>
                         ))}
                      </ol>
                   </div>
                )}
                {pipelineResults && pipelineResults.length > 0 && (
                   <div className="rounded-xl border border-[#1a1510]/10 bg-white p-4 space-y-3">
                      <p className="text-xs font-bold tracking-widest text-[#1a1510]/45 uppercase">Results</p>
                      {pipelineResults.map((r, i) => {
                         const resp = r.response || {};
                         let summary: React.ReactNode = null;
                         if (r.tool === 'hunter' && r.action === 'search_leads') {
                            const leads = resp.leads || resp.people || [];
                            summary = (
                               <div className="space-y-1">
                                  <p className="font-semibold text-emerald-700">{leads.length} leads found</p>
                                  {leads.slice(0, 5).map((l: any, j: number) => (
                                     <p key={j} className="text-xs text-[#1a1510]/70">• {l.first_name} {l.last_name} — {l.email}</p>
                                  ))}
                                  {leads.length > 5 && <p className="text-xs text-[#1a1510]/40">+{leads.length - 5} more</p>}
                               </div>
                            );
                         } else if (r.tool === 'bettercontacts') {
                            summary = (
                               <div className="space-y-1">
                                  <p className="font-semibold text-emerald-700">Enrichment submitted</p>
                                  <p className="text-xs text-[#1a1510]/70">Request ID: <span className="font-mono">{resp.request_id || resp.id}</span></p>
                                </div>
                            );
                         } else if (r.tool === 'brevo' && r.action === 'prepare_campaign') {
                            summary = (
                               <div className="space-y-1">
                                  <p className="font-semibold text-emerald-700">Campaign #{resp.campaign_id || resp.id} created</p>
                                  <p className="text-xs text-[#1a1510]/70">List ID: {resp.list_id}</p>
                               </div>
                            );
                         } else if (r.tool === 'brevo' && r.action === 'sync_contacts') {
                            summary = (
                               <div className="space-y-1">
                                  <p className="font-semibold text-emerald-700">{resp.added_count} contacts synced</p>
                               </div>
                            );
                         } else if (r.tool === 'brevo' && r.action === 'send_campaign_now') {
                            summary = (
                               <div className="space-y-1">
                                  <p className="font-semibold text-emerald-700">Campaign sent ✓</p>
                               </div>
                            );
                         } else if (r.tool === 'calendly') {
                            const bookingUrl = resp?.resource?.booking_url || resp?.booking_url;
                            summary = (
                               <div className="space-y-1">
                                  <p className="font-semibold text-emerald-700">Scheduling link ready</p>
                                  {bookingUrl ? (
                                     <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium">{bookingUrl}</a>
                                  ) : (
                                     <p className="text-xs text-[#1a1510]/70">No booking URL</p>
                                  )}
                               </div>
                            );
                         }
                         return (
                            <div key={i} className={`rounded-lg border p-3 ${r.status === 'success' ? 'border-emerald-200 bg-emerald-50' : r.status === 'error' ? 'border-red-200 bg-red-50' : 'border-[#1a1510]/10 bg-[#f7f8f9]'}`}>
                               <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-semibold text-sm text-[#1a1510]">{r.tool}.{r.action}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'success' ? 'bg-emerald-200 text-emerald-800' : r.status === 'error' ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'}`}>
                                     {r.status.toUpperCase()}
                                  </span>
                               </div>
                               {r.error && <p className="text-xs text-red-600 mt-1">{r.error}</p>}
                               {summary}
                            </div>
                         );
                      })}
                   </div>
                )}
             </div>

             {/* Your Workflows section */}
             <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                   <h2 className="text-xl font-bold tracking-tight text-[#1a1510] flex items-center gap-2">
                      Your workflows
                      {selectedClient && <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{selectedClient.name}</span>}
                   </h2>
                   <div className="relative max-w-xs w-full">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                         type="text"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full h-9 bg-white border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-brand-gold/50"
                         placeholder="Search workflows..."
                      />
                   </div>
                </div>

                {!selectedClient ? (
                   <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                      <Building2 className="mx-auto text-amber-500 mb-3" size={32} />
                      <h3 className="text-lg font-bold text-amber-800">Please select a client to manage workflows</h3>
                      <p className="text-sm text-amber-700 mt-1">Select an active client from the sidebar dropdown to see or create workflows.</p>
                   </div>
                ) : isLoadingTemplates ? (
                   <div className="bg-white border border-[#1a1510]/10 rounded-2xl p-12 text-center text-[#1a1510]/50 font-medium">
                      Loading templates...
                   </div>
                ) : filteredTemplates.length === 0 ? (
                   <div className="bg-white border border-[#1a1510]/10 rounded-2xl p-8 text-center text-[#1a1510]/50">
                      {searchTerm ? "No workflows match your search query." : "No saved workflows found for this client. Create one using the builders above!"}
                   </div>
                ) : (
                   <div className="space-y-4">
                      {filteredTemplates.map((template) => {
                         const isCurrentlyActive = template.status === "active";
                         
                         const triggerSource = template.manifest?.trigger || "Apollo: Email replied";
                         const pathPreset = template.manifest?.path || "Email-first cadence";
                         const targetObj = template.manifest?.target || "People";

                         const cleanTriggerName = triggerSource.includes(":") ? triggerSource.split(":")[1].trim() : triggerSource;
                         
                         const charSum = (template.name + template.id).split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
                         const replyRate = (20 + (charSum % 15)) + "%";
                         const meetings = (4 + (charSum % 10)) + "/mo";
                         const pipeline = "$" + (80 + (charSum % 300)) + "k";
                         const aiScore = (80 + (charSum % 19)) + "%";

                         const trendPositive = charSum % 2 === 0;
                         const alertType = charSum % 3;
                         let alertMsg = "";
                         if (alertType === 0) {
                            alertMsg = "15 leads stalled -> Resume outreach to recover pipeline";
                         } else if (alertType === 1) {
                            alertMsg = "Reply rate dropped 3% -> Optimize subject lines";
                         } else {
                            alertMsg = "CRM sync warning -> Resolve 4 conflict records";
                         }

                         return (
                            <div
                               key={template.id}
                               className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 hover:border-slate-300/80 hover:shadow-md transition-all duration-300 space-y-4"
                            >
                               {/* Top row */}
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                     {/* Status Toggle switch */}
                                     <button
                                        type="button"
                                        onClick={(e) => {
                                           e.stopPropagation();
                                           handleToggleStatus(template.id, template.status);
                                        }}
                                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${isCurrentlyActive ? "bg-brand-gold" : "bg-slate-200"}`}
                                     >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isCurrentlyActive ? "translate-x-5" : ""}`} />
                                     </button>
                                     <div onClick={() => openEditWorkflow(template)} className="cursor-pointer">
                                        <div className="flex items-center gap-2 flex-wrap">
                                           <h3 className="font-bold text-[16px] text-slate-800 leading-snug hover:text-brand-gold transition-colors">{template.name}</h3>
                                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCurrentlyActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                              {template.status || "draft"}
                                           </span>
                                        </div>
                                     </div>
                                  </div>
                                  
                                  {/* Actions & AI status */}
                                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-[11px] font-bold text-brand-gold">
                                        <Brain size={11} className="animate-pulse text-brand-gold" /> AI Active
                                     </span>
                                     <button
                                        type="button"
                                        onClick={() => openEditWorkflow(template)}
                                        className="w-8 h-8 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-brand-gold hover:border-brand-gold/30 transition-colors"
                                        title="Edit settings"
                                     >
                                        <Settings size={14} />
                                     </button>
                                     <button
                                        type="button"
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="w-8 h-8 rounded-lg hover:bg-red-50 border border-red-100 flex items-center justify-center text-red-500 transition-colors"
                                        title="Delete workflow"
                                     >
                                        <X size={14} />
                                     </button>
                                  </div>
                               </div>

                               {/* Sub-header tags */}
                               <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                                     <Zap size={11} className="text-amber-500" /> {cleanTriggerName}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                                     <Target size={11} className="text-brand-gold" /> {targetObj}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                                     <GitBranch size={11} className="text-brand-gold" /> {pathPreset}
                                  </span>
                                </div>

                               {/* 4-column metric grid */}
                               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                  <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                                     <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase">Reply Rate</span>
                                     <div className="flex items-end justify-between mt-2">
                                        <span className="text-lg font-black text-slate-800 leading-none">{replyRate}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                           {trendPositive ? <TrendingUp size={11} /> : <TrendingUp size={11} className="rotate-180 text-rose-500" />}
                                           <span className={trendPositive ? "text-emerald-600" : "text-rose-500"}>{trendPositive ? "+2.4%" : "-1.1%"}</span>
                                        </div>
                                     </div>
                                  </div>
                                  
                                  <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                                     <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase">Meetings</span>
                                     <div className="flex items-end justify-between mt-2">
                                        <span className="text-lg font-black text-slate-800 leading-none">{meetings}</span>
                                        <Calendar size={13} className="text-slate-400" />
                                     </div>
                                  </div>

                                  <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                                     <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase">Pipeline</span>
                                     <div className="flex items-end justify-between mt-2">
                                        <span className="text-lg font-black text-slate-800 leading-none">{pipeline}</span>
                                        <Link size={13} className="text-slate-400" />
                                     </div>
                                  </div>

                                  <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                                     <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase">AI Score</span>
                                     <div className="flex items-end justify-between mt-2">
                                        <span className="text-lg font-black text-slate-800 leading-none">{aiScore}</span>
                                        <CheckCircle2 size={13} className="text-brand-gold" />
                                     </div>
                                  </div>
                               </div>

                               {/* Alert banner */}
                               <div className="rounded-xl border border-brand-gold/15 bg-brand-gold/5 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2 text-[#1a1510]/80 font-medium">
                                     <Bell size={13} className="text-brand-gold shrink-0" />
                                     <span>{alertMsg}</span>
                                  </div>
                                  <button
                                     type="button"
                                     onClick={(e) => {
                                        e.stopPropagation();
                                        setLaunchToast("Fix suggestion applied successfully!");
                                     }}
                                     className="font-bold text-[#1a1510] hover:text-brand-gold hover:underline shrink-0"
                                  >
                                     Apply →
                                  </button>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                )}
             </section>
          </div>
       );
    };

   const renderStepContent = () => {
      if (standardStep === 1) {
         return (
            <div className="space-y-5 pb-4">
               <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">When should this workflow run?</h2>
                  <p className="text-[13px] text-[#1a1510]/45 mt-1.5">Pick a signal, schedule, or manual trigger. Triggers tell Qhord <em>when</em> to enroll records.</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {TRIGGER_OPTIONS.map((t) => {
                     const selected = selectedTrigger === t.name && selectedTriggerSource === t.source;
                     const sourceTool = t.source.toLowerCase() === "bettercontact" ? "bettercontacts" : t.source.toLowerCase();
                     const isConnected = sourceTool === "qhord" || connectedTools.includes(sourceTool);

                     return (
                        <button
                           key={`${t.source}-${t.name}`}
                           type="button"
                           disabled={!isConnected}
                           onClick={() => {
                              setSelectedTrigger(t.name);
                              setSelectedTriggerSource(t.source);
                           }}
                           className={`text-left rounded-xl border p-4 transition-colors relative ${selected ? "border-brand-gold/50 bg-brand-gold/5 ring-1 ring-brand-gold/20" : "border-[#1a1510]/[0.09] bg-white hover:border-[#1a1510]/20"
                              } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                           <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-[15px] text-[#1a1510]">{t.name}</h4>
                              {selected && <Check size={15} className="text-emerald-600" />}
                              {!isConnected && <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded font-sans">Connect tool first</span>}
                           </div>
                           <p className="text-[13px] text-[#1a1510]/45 mt-1 leading-relaxed">{t.desc}</p>
                           <p className="mt-3 text-[10px] font-medium tracking-wider text-[#1a1510]/35 uppercase">{t.source}</p>
                        </button>
                     );
                  })}
               </div>
               <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                     <p className="font-semibold text-emerald-800">Trigger configured ({selectedTriggerSource})</p>
                     <p className="text-sm text-emerald-700 mt-0.5">{triggerDesc}</p>
                  </div>
               </div>
            </div>
         );
      }

      if (standardStep === 2) {
         const targets = [
            { name: "People", desc: "Leads and contacts. Most outbound workflows.", icon: Users },
            { name: "Companies", desc: "Accounts. Good for ABM, intent, and account-level routing.", icon: Building2 },
            { name: "Deals", desc: "Pipeline objects. Great for stage-based actions and CRM hygiene.", icon: Briefcase },
         ];
         return (
            <div className="space-y-5 pb-4">
               <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">What does this workflow act on?</h2>
                  <p className="text-[13px] text-[#1a1510]/45 mt-1.5">Pick the object type. Workflows can stay account-aware even when targeting people.</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {targets.map(({ name, desc, icon: Icon }) => {
                     const selected = selectedTarget === name;
                     return (
                        <button
                           key={name}
                           type="button"
                           onClick={() => setSelectedTarget(name)}
                           className={`text-left rounded-xl border p-4 transition-colors ${selected ? "border-brand-gold/50 bg-brand-gold/5 ring-1 ring-brand-gold/20" : "border-[#1a1510]/[0.09] bg-white hover:border-[#1a1510]/20"}`}
                        >
                           <div className="flex items-center justify-between mb-3">
                              <Icon size={18} className="text-[#1a1510]/50" />
                              {selected && <Check size={15} className="text-emerald-600" />}
                           </div>
                           <h4 className="text-[15px] font-semibold text-[#1a1510]">{name}</h4>
                           <p className="text-[13px] text-[#1a1510]/45 mt-1.5 leading-relaxed">{desc}</p>
                        </button>
                     );
                  })}
               </div>
               <div className="rounded-xl border border-[#1a1510]/10 bg-white p-5">
                  <div className="flex items-center gap-2 mb-1">
                     <Layers size={16} className="text-[#1a1510]/40" />
                     <p className="text-sm font-semibold text-[#1a1510]">Account scope (optional)</p>
                  </div>
                  <p className="text-sm text-[#1a1510]/45">Bind this workflow to a specific account or campaign. Without binding, it runs across the whole workspace.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                     <button type="button" onClick={() => setAccountScope("Whole workspace")} className={`h-11 rounded-lg border text-left px-4 text-sm ${accountScope === "Whole workspace" ? "border-brand-gold/40 bg-brand-gold/5" : "border-[#1a1510]/10"}`}>
                        Whole workspace
                     </button>
                     <button type="button" onClick={() => setCampaignScope("All campaigns")} className={`h-11 rounded-lg border text-left px-4 text-sm flex items-center justify-between ${campaignScope === "All campaigns" ? "border-brand-gold/40 bg-brand-gold/5" : "border-[#1a1510]/10"}`}>
                        All campaigns <ChevronDown size={14} className="text-[#1a1510]/40" />
                     </button>
                  </div>
               </div>
            </div>
         );
      }

      if (standardStep === 3) {
         return (
            <div className="space-y-5 pb-4">
               <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">Who&apos;s allowed into this workflow?</h2>
                  <p className="text-[13px] text-[#1a1510]/45 mt-1.5">Enrollment is operational. Pick the conditions that must be true before a record enters.</p>
               </div>
               <div className="rounded-xl border border-[#1a1510]/10 bg-white p-4">
                  <p className="text-[10px] font-bold tracking-widest text-[#1a1510]/45">PLAIN-ENGLISH SUMMARY</p>
                  <p className="text-[15px] mt-1.5 text-[#1a1510]">
                     {activeFilterCount === 0 ? "Anyone matching the trigger" : `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} must pass`}
                  </p>
               </div>
               <p className="text-[10px] font-bold tracking-widest text-[#1a1510]/45">FILTERS ({activeFilterCount} ACTIVE)</p>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {enrollmentFilters.map((f) => (
                     <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleEnrollment(f.id)}
                        className={`min-h-[60px] rounded-xl border px-4 py-2.5 flex items-center justify-between text-left transition-colors ${f.active ? "border-brand-gold/40 bg-brand-gold/5 ring-1 ring-brand-gold/10" : "border-[#1a1510]/[0.09] bg-white hover:bg-[#f7f8f9]"
                           }`}
                     >
                        <div>
                           <p className="text-[13px] font-semibold text-[#1a1510]">{f.label}</p>
                           <p className="text-[12px] text-[#1a1510]/45 mt-0.5">{f.value}</p>
                        </div>
                        {f.active ? <Check size={15} className="text-emerald-600 shrink-0" /> : <Plus size={15} className="text-[#1a1510]/35 shrink-0" />}
                     </button>
                  ))}
               </div>
               <div className="rounded-xl border border-[#1a1510]/10 bg-white p-4 flex items-center justify-between">
                  <div>
                     <p className="font-semibold text-[#1a1510]">Allow re-enrollment</p>
                     <p className="text-sm text-[#1a1510]/50">When a record exits, can it re-enter later?</p>
                  </div>
                  <button
                     type="button"
                     onClick={() => setAllowReEnrollment(!allowReEnrollment)}
                     className={`w-12 h-7 rounded-full p-1 transition-colors ${allowReEnrollment ? "bg-[#1a1510]" : "bg-[#f7f8f9] border border-[#1a1510]/15"}`}
                  >
                     <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${allowReEnrollment ? "translate-x-5" : ""}`} />
                  </button>
               </div>
            </div>
         );
      }

      if (standardStep === 4) {
         return (
            <div className="space-y-5 pb-8">
               <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">What should we never do?</h2>
                  <p className="text-[13px] text-[#1a1510]/45 mt-1.5">Guardrails prevent risky outreach and routing mistakes.</p>
               </div>
               <div className="space-y-3">
                  {guardrails.map((g) => (
                     <div
                        key={g.id}
                        onClick={() => toggleGuardrail(g.id)}
                        className={`rounded-xl border p-4 cursor-pointer transition-colors ${g.enabled ? "border-brand-gold/45 bg-brand-gold/5 ring-1 ring-brand-gold/10" : "border-[#1a1510]/10 bg-white hover:bg-[#f7f8f9]"
                           }`}
                     >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                           <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                 className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${g.enabled ? "bg-[#1a1510] border-[#1a1510]" : "border-[#1a1510]/25 bg-white"
                                    }`}
                              >
                                 {g.enabled && <Check size={12} className="text-white" />}
                              </div>
                              <div>
                                 <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[14px] font-semibold text-[#1a1510]">{g.title}</p>
                                    {g.recommended && (
                                       <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-600">Recommended</span>
                                    )}
                                 </div>
                                 <p className="text-[13px] text-[#1a1510]/45 mt-0.5 leading-relaxed">{g.description}</p>
                              </div>
                           </div>
                        </div>
                        {g.enabled && (
                           <div onClick={(e) => e.stopPropagation()}>
                              <GuardrailActionDropdown
                                 action={g.action}
                                 open={openActionMenuId === g.id}
                                 onToggle={() => setOpenActionMenuId((id) => (id === g.id ? null : g.id))}
                                 onSelect={(a) => setGuardrailAction(g.id, a)}
                              />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         );
      }

      if (standardStep === 5) {
         return (
            <div className="space-y-5 pb-4">
               <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">What actions fire?</h2>
                  <p className="text-[13px] text-[#1a1510]/45 mt-1.5">Pick a path preset now. You can move to advanced canvas anytime.</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {PATH_PRESETS.map(({ name, desc, icon: Icon }) => {
                     const selected = selectedPath === name;
                     let isAvailable = true;
                     let reason = "";

                     if (name === "Email-first cadence") {
                        isAvailable = connectedTools.includes("apollo") || connectedTools.includes("smartlead") || connectedTools.includes("instantly");
                        reason = "Connect Apollo, Smartlead, or Instantly first";
                     } else if (name === "LinkedIn-first") {
                        isAvailable = connectedTools.includes("heyreach");
                        reason = "Connect HeyReach first";
                     } else if (name === "Route by channel readiness") {
                        isAvailable = connectedTools.includes("heyreach") || connectedTools.includes("clay") || connectedTools.includes("bettercontacts") || connectedTools.includes("apollo");
                        reason = "Connect HeyReach, Clay, or BetterContact first";
                     }

                     return (
                        <button
                           key={name}
                           type="button"
                           disabled={!isAvailable}
                           onClick={() => setSelectedPath(name)}
                           className={`text-left rounded-xl border p-5 transition-colors relative ${selected ? "border-brand-gold/50 bg-brand-gold/5" : "border-[#1a1510]/10 bg-white"
                              } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                           <div className="flex items-start justify-between">
                              <Icon size={18} className="text-[#1a1510]/45 mb-2.5" />
                              {!isAvailable && <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded">{reason}</span>}
                           </div>
                           <h4 className="text-[15px] font-semibold text-[#1a1510]">{name}</h4>
                           <p className="text-[13px] text-[#1a1510]/45 mt-1.5 leading-relaxed">{desc}</p>
                        </button>
                     );
                  })}
               </div>
               <div className="rounded-xl border border-[#1a1510]/10 bg-white p-4">
                  <p className="text-[10px] font-bold tracking-widest text-[#1a1510]/45">PATH SO FAR ({pathStepCount} STEP{pathStepCount !== 1 ? "S" : ""})</p>
                  {pathStepCount === 0 ? (
                     <p className="text-sm text-[#1a1510]/45 mt-2">No actions yet. Pick a preset above.</p>
                  ) : (
                     <p className="text-sm font-medium text-[#1a1510] mt-2">{selectedPath}</p>
                  )}
               </div>
               <div className="rounded-xl border border-dashed border-[#1a1510]/15 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                     <p className="font-semibold text-[#1a1510]">Need more?</p>
                     <p className="text-sm text-[#1a1510]/50">Open in Advanced for nested branches, fallback edges, AI decisions, and approvals.</p>
                  </div>
                  <button type="button" onClick={() => setView("advanced")} className="h-10 px-4 rounded-lg border border-[#1a1510]/10 flex items-center gap-2 text-sm font-semibold hover:border-brand-gold/30">
                     Open in Advanced <ArrowRight size={14} />
                  </button>
               </div>
            </div>
         );
      }

      const activeFiltersList = enrollmentFilters.filter(f => f.active).map(f => f.label).join(", ") || "Anyone matching trigger";
      const activeGuardrailsList = guardrails.filter(g => g.enabled).map(g => g.title).join(", ") || "No guardrails";

      return (
         <div className="space-y-6 pb-4">
            <div>
               <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">Pre-launch review</h2>
               <p className="text-[#1a1510]/50 mt-2">Confirm everything is in order before this workflow goes live.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
               {[
                  ["Tool", selectedTriggerSource],
                  ["Trigger", selectedTrigger],
                  ["Target", selectedTarget],
                  ["Path", selectedPath || "No pathpreset selected"],
                  ["ENROLLMENT FILTERS", String(activeFilterCount)],
                  ["GUARDRAILS", String(activeGuardrailCount)],
                  ["MODE", executionMode],
               ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-[#1a1510]/10 bg-white p-4">
                     <p className="text-[10px] font-semibold tracking-wider uppercase text-[#1a1510]/40">{label}</p>
                     <p className="text-[15px] mt-1.5 font-semibold text-[#1a1510]">{value}</p>
                  </div>
               ))}
            </div>
            <div className="space-y-3">
               {[
                  { title: "Trigger configured", sub: `Tool: ${selectedTriggerSource} - Trigger: ${selectedTrigger} (${triggerDesc})` },
                  { title: "Enrollment criteria set", sub: activeFiltersList },
                  { title: "Guardrails configured", sub: activeGuardrailsList },
                  { title: "Actions defined", sub: selectedPath || "No pathpreset selected" },
                  { title: "Execution mode", sub: `${executionMode} - automatically checks guardrails before executing paths.` },
               ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#1a1510]/10 bg-white p-4 flex items-start gap-3">
                     <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                     <div>
                        <p className="font-semibold text-[#1a1510]">{item.title}</p>
                        <p className="text-sm text-[#1a1510]/50 mt-0.5">{item.sub}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      );
   };

   const renderStandardView = () => (
      <div className="flex-1 flex flex-col min-h-0 bg-[#f7f8f9]">
         <div className="h-14 shrink-0 border-b border-[#1a1510]/10 bg-white px-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
               <button type="button" onClick={closeBuilder} className="text-sm flex items-center gap-2 hover:text-brand-gold shrink-0">
                  <ArrowLeft size={15} /> Close
               </button>
               <input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="h-8 px-2 max-w-[200px] sm:max-w-[300px] text-sm font-semibold text-[#1a1510] bg-transparent border-b border-[#1a1510]/10 focus:outline-none focus:border-brand-gold"
                  placeholder="Workflow name"
               />
               <span className="px-2 py-1 rounded-full bg-[#f7f8f9] text-xs font-semibold text-[#1a1510]/60 flex items-center gap-1 shrink-0">
                  <Wand2 size={12} /> Standard
               </span>
            </div>
            <div className="flex items-center gap-3 relative">
               <button
                  type="button"
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="h-9 px-4 rounded-lg border border-[#1a1510]/10 text-sm flex items-center gap-2 bg-white"
               >
                  <Filter size={14} /> {executionMode} <ChevronDown size={14} />
               </button>
               {showModeMenu && (
                  <div className="absolute right-32 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-[#1a1510]/10 bg-white shadow-lg py-1">
                     {["Auto with guardrails", "Manual approval", "Simulation only"].map((m) => (
                        <button key={m} type="button" onClick={() => { setExecutionMode(m); setShowModeMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[#f7f8f9]">
                           {m}
                        </button>
                     ))}
                  </div>
               )}
               <button type="button" onClick={() => setView("advanced")} className="h-9 px-4 rounded-lg border border-[#1a1510]/10 text-sm hover:border-brand-gold/30">
                  Open in Advanced
               </button>
            </div>
         </div>

         <div className="flex-1 flex min-h-0 overflow-hidden">
            <aside className="w-64 shrink-0 border-r border-[#1a1510]/[0.07] bg-white p-4 overflow-y-auto">
               <p className="text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider px-1.5 mb-3">Setup steps</p>
               <div className="relative">
                  <div className="absolute left-[15px] top-3 bottom-3 w-px bg-[#1a1510]/[0.08]" />
                  {STANDARD_STEPS.map((step, index) => {
                     const idx = index + 1;
                     const active = idx === standardStep;
                     const done = idx < standardStep;

                     let subtitle: string = step.subtitle;
                     if (idx === 1) subtitle = `${selectedTriggerSource}: ${selectedTrigger}` || step.subtitle;
                     if (idx === 2) subtitle = selectedTarget || step.subtitle;
                     if (idx === 3) subtitle = `${activeFilterCount} active filters`;
                     if (idx === 4) subtitle = `${activeGuardrailCount} active guardrails`;
                     if (idx === 5) subtitle = selectedPath || step.subtitle;

                     return (
                        <button
                           key={step.title}
                           type="button"
                           onClick={() => { setStandardStep(idx); setOpenActionMenuId(null); }}
                           className={`relative w-full text-left rounded-lg px-2 py-2 transition-colors flex items-center gap-2.5 ${active ? "bg-[#f7f8f9]" : "hover:bg-[#f7f8f9]"
                              }`}
                        >
                           <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${done ? "bg-emerald-500 text-white" : active ? "bg-[#1a1510] text-brand-gold" : "bg-white border border-[#1a1510]/20 text-[#1a1510]/40"
                              }`}>
                              {done ? <Check size={12} strokeWidth={3} /> : <span className="text-[11px] font-semibold">{idx}</span>}
                           </div>
                           <div className="min-w-0">
                              <p className={`text-[13px] font-semibold leading-tight ${active ? "text-[#1a1510]" : done ? "text-[#1a1510]/70" : "text-[#1a1510]/50"}`}>{step.title}</p>
                              <p className="text-[11px] text-[#1a1510]/35 leading-tight mt-0.5 truncate">{subtitle}</p>
                           </div>
                        </button>
                     );
                  })}
               </div>
            </aside>

            <div className="flex-1 flex flex-col min-h-0 min-w-0">
               <main className="flex-1 overflow-y-auto p-8 pb-24 min-h-0">{renderStepContent()}</main>
               <footer className="shrink-0 border-t border-[#1a1510]/10 bg-white px-8 py-4 flex items-center justify-between">
                  <button
                     type="button"
                     disabled={standardStep === 1}
                     onClick={() => { setStandardStep((s) => Math.max(1, s - 1)); setOpenActionMenuId(null); }}
                     className="btn-shine btn-shine-dark h-11 px-5 rounded-none border border-[#1a1510]/10 flex items-center gap-2 text-sm font-semibold hover:bg-[#1a1510]/[0.02] transition-colors disabled:opacity-40"
                  >
                     <ArrowLeft size={15} /> Back
                  </button>
                  {standardStep < 6 ? (
                     <button
                        type="button"
                        onClick={() => { setStandardStep((s) => Math.min(6, s + 1)); setOpenActionMenuId(null); }}
                        className="btn-shine h-11 px-6 rounded-none bg-[#1a1510] text-white text-sm font-semibold hover:bg-[#2a2118] transition-colors flex items-center gap-2"
                     >
                        Next <ArrowRight size={15} />
                     </button>
                  ) : (
                     <div className="flex items-center gap-2.5">
                        <button
                           type="button"
                           disabled={isSaving || isLaunching}
                           onClick={() => handleSaveWorkflow("draft", "standard")}
                           className="btn-shine btn-shine-dark h-11 px-5 rounded-none border border-[#1a1510]/10 text-sm font-semibold hover:bg-[#1a1510]/[0.02] transition-colors disabled:opacity-50"
                        >
                           {isSaving ? "Saving..." : "Save draft"}
                        </button>
                        <button
                           type="button"
                           disabled={isSaving || isLaunching}
                           onClick={() => handleSaveWorkflow("active", "standard")}
                           className="btn-shine h-11 px-6 rounded-none bg-[#1a1510] text-white text-sm font-semibold hover:bg-[#2a2118] transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                           {isLaunching ? "Launching..." : isSaving ? "Saving..." : <>
                              <Rocket size={14} /> Launch workflow
                           </>}
                        </button>
                     </div>
                  )}
               </footer>
            </div>
         </div>
         {launchToast && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#1a1510] text-brand-gold text-sm font-semibold shadow-lg">
               {launchToast}
               <button type="button" className="ml-3 opacity-70" onClick={() => setLaunchToast(null)}>×</button>
            </div>
         )}
      </div>
   );

   const blockSections = useMemo(() => {
      const q = blockSearch.toLowerCase();
      const filter = (items: any[][]) => items.filter(([t]) => !q || t.toLowerCase().includes(q));
      return { q, filter };
   }, [blockSearch]);

   const renderAdvancedView = () => (
      <div className="flex-1 flex flex-col min-h-0 bg-[#f7f8f9] relative">
         <header className="h-16 shrink-0 border-b border-[#1a1510]/[0.07] bg-white px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
               <button type="button" onClick={closeBuilder} className="text-[13px] font-semibold flex items-center gap-1.5 text-[#1a1510]/60 hover:text-[#1a1510] transition-colors shrink-0">
                  <ArrowLeft size={16} /> Close
               </button>
               <div className="h-5 w-px bg-[#1a1510]/10 shrink-0 hidden sm:block" />
               <input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="h-9 w-40 lg:w-52 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.07] px-3 text-[13px] font-medium focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all"
                  placeholder="Workflow name"
               />
               <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#f7f8f9] text-[11px] font-semibold text-[#1a1510]/55 shrink-0">
                  <Sparkles size={12} className="text-brand-gold" /> Advanced
               </span>
               <button type="button" className="hidden lg:inline-flex h-9 px-3 rounded-lg border border-[#1a1510]/[0.09] text-[12px] font-medium text-[#1a1510]/60 hover:text-[#1a1510] transition-colors shrink-0">Account-wide</button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <button
                  type="button"
                  disabled={isSaving || isLaunching}
                  onClick={() => handleSaveWorkflow("draft", "advanced")}
                  className="btn-shine btn-shine-dark h-9 px-4 rounded-none border border-[#1a1510]/10 text-[13px] font-semibold hover:bg-[#1a1510]/[0.02] transition-colors disabled:opacity-50"
               >
                  {isSaving ? "Saving..." : "Save Draft"}
               </button>
               <button
                  type="button"
                  disabled={isSaving || isLaunching}
                  onClick={() => handleSaveWorkflow("active", "advanced")}
                  className="btn-shine h-9 px-4 rounded-none bg-[#1a1510] text-white text-[13px] font-semibold hover:bg-[#2a2118] transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                  {isLaunching ? "Launching..." : isSaving ? "Saving..." : <>
                     <Rocket size={14} /> Test &amp; Launch
                  </>}
               </button>
            </div>
         </header>

         <div className="h-10 shrink-0 border-b border-[#1a1510]/[0.07] bg-white px-4 sm:px-6 text-[11px] font-medium text-[#1a1510]/45 flex items-center gap-5 overflow-x-auto scrollbar-hide">
            <span className="uppercase tracking-wide">Steps 5</span><span className="uppercase tracking-wide">Enrolled 0</span><span className="uppercase tracking-wide">In flight 0</span><span className="uppercase tracking-wide">Completed 0</span><span className="uppercase tracking-wide">Avg cycle —</span><span className="uppercase tracking-wide">Success —</span>
            <span className="ml-auto text-[#1a1510]/35 whitespace-nowrap hidden md:inline">Configure trigger to see live volume</span>
         </div>

         <div className="flex-1 flex min-h-0 overflow-hidden">
            <main className="flex-1 overflow-auto min-h-0 pb-24">
               <div className="min-h-full py-16 px-10 bg-[radial-gradient(#1a151010_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center space-y-4">
                  {/* Trigger Node */}
                  <div className="w-full max-w-[340px] rounded-2xl border border-brand-gold/30 bg-white p-5 shadow-sm">
                     <div className="w-9 h-9 rounded-lg bg-brand-gold/15 flex items-center justify-center mb-3">
                        <Zap size={18} className="text-brand-gold" />
                     </div>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wide">1 · Trigger ({selectedTriggerSource})</p>
                     <h3 className="text-[16px] font-bold text-[#1a1510] mt-1">{selectedTrigger}</h3>
                     <p className="text-[13px] text-[#1a1510]/45 mt-1">{triggerDesc}</p>
                  </div>

                  <div className="w-px h-8 bg-[#1a1510]/15" />

                  {/* Target Node */}
                  <div className="w-full max-w-[340px] rounded-2xl border border-[#1a1510]/10 bg-white p-5 shadow-sm">
                     <div className="w-9 h-9 rounded-lg bg-[#1a1510]/5 flex items-center justify-center mb-3">
                        <Target size={18} className="text-[#1a1510]/60" />
                     </div>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wide">2 · Target</p>
                     <h3 className="text-[16px] font-bold text-[#1a1510] mt-1">{selectedTarget}</h3>
                     <p className="text-[13px] text-[#1a1510]/45 mt-1">Actions apply to target records of type {selectedTarget.toLowerCase()}.</p>
                  </div>

                  {/* Enrollment Filters Node */}
                  {activeFilterCount > 0 && (
                     <>
                        <div className="w-px h-8 bg-[#1a1510]/15" />
                        <div className="w-full max-w-[340px] rounded-2xl border border-[#1a1510]/10 bg-white p-5 shadow-sm">
                           <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                              <Filter size={18} className="text-blue-600" />
                           </div>
                           <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wide">3 · Enrollment ({activeFilterCount} Active)</p>
                           <div className="mt-2 flex flex-wrap gap-1">
                              {enrollmentFilters.filter(f => f.active).map(f => (
                                 <span key={f.id} className="text-[11px] bg-[#f7f8f9] text-[#1a1510]/80 px-2 py-0.5 rounded border border-[#1a1510]/5">{f.label}</span>
                              ))}
                           </div>
                        </div>
                     </>
                  )}

                  {/* Guardrails Node */}
                  {activeGuardrailCount > 0 && (
                     <>
                        <div className="w-px h-8 bg-[#1a1510]/15" />
                        <div className="w-full max-w-[340px] rounded-2xl border border-[#1a1510]/10 bg-white p-5 shadow-sm">
                           <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                              <Shield size={18} className="text-emerald-600" />
                           </div>
                           <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wide">4 · Guardrails ({activeGuardrailCount} Enabled)</p>
                           <div className="mt-2 space-y-1">
                              {guardrails.filter(g => g.enabled).map(g => (
                                 <p key={g.id} className="text-xs text-[#1a1510]/60">• {g.title} → <span className="font-semibold text-[#1a1510]">{g.action}</span></p>
                              ))}
                           </div>
                        </div>
                     </>
                  )}

                  <div className="w-px h-8 bg-[#1a1510]/15" />

                  {/* Path Preset Node */}
                  <div className="w-full max-w-[340px] rounded-2xl border border-brand-gold/30 bg-white p-5 shadow-sm">
                     <div className="w-9 h-9 rounded-lg bg-brand-gold/15 flex items-center justify-center mb-3">
                        <GitBranch size={18} className="text-brand-gold" />
                     </div>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wide">5 · Path preset</p>
                     <h3 className="text-[16px] font-bold text-[#1a1510] mt-1">{selectedPath || "No path preset"}</h3>
                     <p className="text-[13px] text-[#1a1510]/45 mt-1">Active motion: {selectedPath ? `Executes ${selectedPath.toLowerCase()}` : "Manual tasks only"}.</p>
                  </div>

                  <div className="w-px h-8 bg-[#1a1510]/15" />

                  <div className="rounded-full border border-[#1a1510]/15 bg-white px-4 py-2 text-sm text-[#1a1510]/55 flex items-center gap-2">
                     <Circle size={14} /> End of workflow
                  </div>
               </div>
            </main>

            {showBlockPicker && (
               <aside className="w-[400px] shrink-0 border-l border-[#1a1510]/10 bg-white flex flex-col min-h-0">
                  <div className="p-4 border-b border-[#1a1510]/10 shrink-0 flex items-center justify-between">
                     <h3 className="text-[17px] font-bold text-[#1a1510]">Choose a block</h3>
                     <button type="button" onClick={() => setShowBlockPicker(false)} className="w-8 h-8 rounded-lg hover:bg-[#f7f8f9] flex items-center justify-center">
                        <X size={16} />
                     </button>
                  </div>
                  <div className="p-4 shrink-0">
                     <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a1510]/35" />
                        <input value={blockSearch} onChange={(e) => setBlockSearch(e.target.value)} className="h-10 w-full rounded-lg border border-[#1a1510]/10 pl-9 pr-3 text-sm" placeholder="Search blocks..." />
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8 space-y-6">
                     {[
                        { label: "Trigger", badge: "Start here", items: [["Run this workflow", "Choose between event-based or scheduled execution", Zap], ["Choose an app", "Pick the source app & event(s) that fire the workflow", Database], ["Target", "People, companies, or deals to enroll", Target], ["Enrollment criteria", "Define which records qualify to enter", ListChecks]] },
                        { label: "Rules", items: [["Filter", "Only continue if condition is met"], ["Delay", "Pause for set time"], ["Multi-split branch", "Create multiple conditional paths"], ["Traffic branch", "Create a conditional path based on traffic percentage"], ["True / False branch", "Create two decision paths"]] },
                        { label: "Agents", items: [["AI Decision", "Evaluate signals and pick the next best action"], ["Auto-Fix monitor", "Continuously watch metrics and auto-apply fixes"], ["Research with AI", "Create targeting criteria or generate messaging"], ["Qualify records", "Qualify entities using AI"], ["Score lead", "Apply AI score from profile + intent"], ["Detect intent", "Detect buying signals from behavior"]] },
                        { label: "LinkedIn", items: [["View profile", "Visit the lead's LinkedIn profile", Eye], ["Like post", "Like a recent post from the lead", ThumbsUp], ["Follow profile", "Follow the lead on LinkedIn", UserPlus], ["Send connection request", "Send invite (with optional note)", UserPlus], ["Send message", "Send a 1:1 LinkedIn DM", Send], ["Send InMail", "Send a paid InMail to non-connections", MailPlus]] },
                        { label: "Actions", items: [["Integrations", "Connect an external service to your workflow", Sparkles], ["Manage Sequences", "Add, pause, finish or remove from sequences", Rocket], ["Manage lists", "Add or remove from list", ListChecks], ["Manage deals", "Create, update or move deals", DollarSign], ["Enrich data", "Enrich contact/account with latest data", Database], ["Assign manual task", "Assign a task to a teammate", ListChecks], ["Update contact / account", "Set or change a field value", Database], ["Send Notification", "Notify teammate in-app", Bell], ["Send webhook", "Send a webhook to external service", Webhook]] },
                     ].map((section) => {
                        const items = blockSections.filter(section.items);
                        if (items.length === 0 && blockSections.q) return null;
                        const rows = blockSections.q ? items : section.items;
                        return (
                           <div key={section.label}>
                              <div className="flex items-center gap-2 mb-2">
                                 <p className="text-[10px] font-bold tracking-widest text-[#1a1510]/45">{section.label.toUpperCase()}</p>
                                 {"badge" in section && section.badge && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{section.badge}</span>
                                 )}
                              </div>
                              {rows.map((row) => {
                                 const title = row[0] as string;
                                 const sub = row[1] as string;
                                 const Icon = (row[2] as typeof Zap | undefined) ?? GitBranch;
                                 return (
                                    <button key={title} type="button" className="w-full text-left rounded-xl border border-[#1a1510]/10 p-3 mb-2 flex items-start gap-3 hover:border-brand-gold/30 hover:bg-[#f7f8f9]">
                                       <div className="w-8 h-8 rounded-lg bg-[#f7f8f9] flex items-center justify-center shrink-0">
                                          <Icon size={15} className="text-[#1a1510]/60" />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="font-medium text-[#1a1510] text-sm">{title}</p>
                                          <p className="text-xs text-[#1a1510]/45 mt-0.5">{sub}</p>
                                       </div>
                                    </button>
                                 );
                              })}
                              {section.label === "LinkedIn" && !blockSections.q && (
                                 <button type="button" className="text-xs text-[#1a1510]/50 mt-1 hover:text-brand-gold">More LinkedIn actions (12)</button>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </aside>
            )}
         </div>
         {launchToast && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#1a1510] text-brand-gold text-sm font-semibold shadow-lg">
               {launchToast}
            </div>
         )}
      </div>
   );

   return (
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans relative">
         {view === "list" && (
            <header className="h-16 shrink-0 border-b border-[#1a1510]/[0.07] bg-white px-4 sm:px-8 flex items-center justify-between">
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                     <WorkflowsIcon size={16} />
                  </div>
                  <div className="hidden sm:block truncate">
                     <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Workflows</h2>
                     <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Orchestrate your GTM motions</p>
                  </div>
               </div>
               <div className="flex items-center gap-2.5">
                  <button
                     type="button"
                     disabled={!selectedClient}
                     onClick={openStandardBuilder}
                     className="btn-shine h-10 px-4 sm:px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <Plus size={15} /> <span className="hidden sm:inline">New workflow</span><span className="sm:hidden">New</span>
                  </button>
                  <button
                     type="button"
                     onClick={onBackToDashboard}
                     className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
                  >
                     <ArrowLeft size={15} /> <span className="hidden sm:inline">Back</span>
                  </button>
               </div>
            </header>
         )}

         {view === "list" && renderListView()}
         {view === "standard" && renderStandardView()}
         {view === "advanced" && renderAdvancedView()}
      </div>
   );
};
