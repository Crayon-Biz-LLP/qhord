"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
   ArrowLeft,
   ArrowRight,
   Bell,
   Briefcase,
   Building2,
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

type WorkflowCard = {
   id: string;
   name: string;
   status: "active" | "draft";
   trigger: string;
   target: string;
   path: string;
   metrics: { reply: string; meetings: string; pipeline: string; aiScore: string };
   suggestion: string;
};

const STANDARD_STEPS = [
   { title: "Trigger", subtitle: "When does this run?" },
   { title: "Target", subtitle: "What does it act on?" },
   { title: "Enrollment", subtitle: "Who's allowed in?" },
   { title: "Guardrails", subtitle: "What should we never do?" },
   { title: "Path", subtitle: "What actions fire?" },
   { title: "Review", subtitle: "Final checks + launch" },
] as const;

const TRIGGER_OPTIONS = [
   { name: "New lead added", desc: "Run when a fresh record lands in Lead Source.", source: "QHORD" },
   { name: "Lead enriched", desc: "Run after enrichment completes (Clay / Apollo).", source: "QHORD" },
   { name: "Meeting booked", desc: "Run on Calendly or Qhord booking events.", source: "QHORD" },
   { name: "Email replied", desc: "Run when a prospect replies to a sequence.", source: "APOLLO" },
   { name: "LinkedIn replied", desc: "Run when a HeyReach conversation gets a reply.", source: "HEYREACH" },
   { name: "Intent spike detected", desc: "Run when account intent crosses a threshold.", source: "QHORD" },
   { name: "Deal stage changed", desc: "Run when a CRM deal moves stage.", source: "HUBSPOT" },
   { name: "Manual run", desc: "Run on demand against a saved audience.", source: "QHORD" },
];

const PATH_PRESETS = [
   { name: "Email-first cadence", desc: "Add to Apollo sequence with reply detection.", icon: Mail },
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
                     className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f7f8f9] flex items-center justify-between ${
                        opt === action ? "text-[#1a1510] font-semibold" : "text-[#1a1510]/75"
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

   const [standardStep, setStandardStep] = useState(1);
   const [selectedTrigger, setSelectedTrigger] = useState("Email replied");
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

   const triggerDesc = TRIGGER_OPTIONS.find((t) => t.name === selectedTrigger)?.desc ?? "";

   const openStandardBuilder = () => {
      setView("standard");
      setStandardStep(1);
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

   const renderListView = () => (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 pb-12 min-h-0">
         <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div>
               <h1 className="text-4xl font-black tracking-tight text-[#1a1510]">Workflows</h1>
               <p className="mt-2 text-[#1a1510]/55 max-w-2xl">
                  Run your GTM motions from one place. Trigger, qualify, route, and orchestrate across Apollo,
                  HeyReach, CRM, and Qhord without bouncing between tabs.
               </p>
               <div className="flex flex-wrap gap-2 mt-4">
                  {["Apollo", "HeyReach", "HubSpot", "Slack"].map((item) => (
                     <span key={item} className="h-8 px-3 rounded-lg border border-[#1a1510]/10 bg-white text-xs font-semibold text-[#1a1510]/70">
                        {item}
                     </span>
                  ))}
               </div>
            </div>
            <button
               type="button"
               onClick={openStandardBuilder}
               className="h-12 px-6 rounded-xl bg-[#1a1510] text-brand-gold font-bold flex items-center gap-2 shadow-sm shrink-0"
            >
               <Plus size={18} /> New workflow
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
               ["HUNTER", "Live", "Lead sourcing via Hunter.io API"],
               ["BETTERCONTACTS", "Live", "Contact enrichment"],
               ["BREVO", "Live", "Email campaigns & sending"],
               ["CALENDLY", "Live", "Meeting scheduling links"],
            ].map(([name, status, desc]) => (
               <div key={name} className="bg-white border border-[#1a1510]/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-xs tracking-wider font-semibold text-[#1a1510]/55">{name}</p>
                     <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{status}</span>
                  </div>
                  <p className="text-xs text-[#1a1510]/40">{desc}</p>
               </div>
            ))}
         </div>

         <section className="space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-[#1a1510]">Start something new</h2>
            <p className="text-[#1a1510]/50">Start guided, or open the orchestration canvas.</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
               <button type="button" onClick={openStandardBuilder} className="text-left bg-white border border-[#1a1510]/10 rounded-2xl p-6 hover:border-brand-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                     <div className="w-11 h-11 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center">
                        <Sparkles size={20} />
                     </div>
                     <ArrowRight size={18} className="text-[#1a1510]/40" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-[#1a1510]">Standard Builder</h3>
                  <p className="mt-2 text-[#1a1510]/55">Guided 6-step setup. Trigger → Target → Enrollment → Guardrails → Path → Launch.</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#1a1510]/45">
                     <span className="flex items-center gap-1"><Shield size={12} /> Guardrails built-in</span>
                     <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Pre-launch review</span>
                  </div>
               </button>
               <button type="button" onClick={() => { setView("advanced"); setShowBlockPicker(false); }} className="text-left bg-white border border-[#1a1510]/10 rounded-2xl p-6 hover:border-brand-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                     <div className="w-11 h-11 rounded-xl bg-[#1a1510]/5 text-[#1a1510] flex items-center justify-center">
                        <GitBranch size={20} />
                     </div>
                     <span className="px-2 py-1 rounded-md text-xs font-semibold bg-[#1a1510]/5 text-[#1a1510]/60">POWER</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-[#1a1510]">Advanced Builder</h3>
                  <p className="mt-2 text-[#1a1510]/55">Full orchestration canvas. Nested branches, fallbacks, AI decisions, and approvals.</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#1a1510]/45">
                     <span>Branching</span><span>AI blocks</span><span>Fallbacks</span>
                  </div>
               </button>
            </div>
         </section>

         <div className="bg-white border border-[#1a1510]/10 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
               <Sparkles size={18} className="text-brand-gold shrink-0 hidden sm:block" />
               <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && compileFromPrompt()}
                  className="flex-1 bg-transparent outline-none text-sm min-h-[40px]"
                  placeholder="e.g. Get 100 startup founders from Apollo, enrich in Clay, then send with Smartlead"
               />
               <div className="flex gap-2 shrink-0">
                  <button
                     type="button"
                     disabled={isCompiling || !aiPrompt.trim()}
                     onClick={compileFromPrompt}
                     className="h-10 px-5 rounded-xl border border-[#1a1510]/10 text-sm font-semibold disabled:opacity-50"
                  >
                     {isCompiling ? "Planning…" : "Preview plan"}
                  </button>
                  <button
                     type="button"
                     disabled={isRunningPipeline || !aiPrompt.trim()}
                     onClick={runPipelineFromPrompt}
                     className="h-10 px-5 rounded-xl bg-[#1a1510] text-brand-gold font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                     <Rocket size={14} />
                     {isRunningPipeline ? "Running…" : "Run pipeline"}
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

         <div className="bg-white border border-[#1a1510]/10 rounded-2xl p-6 text-center">
            <p className="text-sm text-[#1a1510]/50">Type a prompt above and click <span className="font-bold text-[#1a1510]">Run pipeline</span> to execute Hunter → BetterContacts → Brevo → Calendly end-to-end.</p>
         </div>
      </div>
   );

   const renderStepContent = () => {
      if (standardStep === 1) {
         return (
            <div className="space-y-6 pb-4">
               <div>
                  <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">When should this workflow run?</h2>
                  <p className="text-[#1a1510]/50 mt-2">Pick a signal, schedule, or manual trigger. Triggers tell Qhord <em>when</em> to enroll records.</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {TRIGGER_OPTIONS.map((t) => {
                     const selected = selectedTrigger === t.name;
                     return (
                        <button
                           key={t.name}
                           type="button"
                           onClick={() => setSelectedTrigger(t.name)}
                           className={`text-left rounded-xl border p-5 transition-colors ${
                              selected ? "border-brand-gold/50 bg-brand-gold/5 ring-1 ring-brand-gold/20" : "border-[#1a1510]/10 bg-white hover:border-[#1a1510]/20"
                           }`}
                        >
                           <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-xl text-[#1a1510]">{t.name}</h4>
                              {selected && <Check size={16} className="text-emerald-600" />}
                           </div>
                           <p className="text-sm text-[#1a1510]/50 mt-1">{t.desc}</p>
                           <p className="mt-3 text-[10px] font-bold tracking-widest text-[#1a1510]/35">{t.source}</p>
                        </button>
                     );
                  })}
               </div>
               <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                     <p className="font-semibold text-emerald-800">Trigger configured</p>
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
            <div className="space-y-6 pb-4">
               <div>
                  <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">What does this workflow act on?</h2>
                  <p className="text-[#1a1510]/50 mt-2">Pick the object type. Workflows can stay account-aware even when targeting people.</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {targets.map(({ name, desc, icon: Icon }) => {
                     const selected = selectedTarget === name;
                     return (
                        <button
                           key={name}
                           type="button"
                           onClick={() => setSelectedTarget(name)}
                           className={`text-left rounded-xl border p-5 ${selected ? "border-brand-gold/50 bg-brand-gold/5 ring-1 ring-brand-gold/20" : "border-[#1a1510]/10 bg-white"}`}
                        >
                           <div className="flex items-center justify-between mb-3">
                              <Icon size={22} className="text-[#1a1510]/50" />
                              {selected && <Check size={16} className="text-emerald-600" />}
                           </div>
                           <h4 className="text-xl font-bold text-[#1a1510]">{name}</h4>
                           <p className="text-sm text-[#1a1510]/50 mt-2">{desc}</p>
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
            <div className="space-y-6 pb-4">
               <div>
                  <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">Who&apos;s allowed into this workflow?</h2>
                  <p className="text-[#1a1510]/50 mt-2">Enrollment is operational. Pick the conditions that must be true before a record enters.</p>
               </div>
               <div className="rounded-xl border border-[#1a1510]/10 bg-white p-4">
                  <p className="text-[10px] font-bold tracking-widest text-[#1a1510]/45">PLAIN-ENGLISH SUMMARY</p>
                  <p className="text-lg mt-2 text-[#1a1510]">
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
                        className={`min-h-[72px] rounded-xl border px-4 py-3 flex items-center justify-between text-left transition-colors ${
                           f.active ? "border-brand-gold/40 bg-brand-gold/5" : "border-[#1a1510]/10 bg-white hover:bg-[#f7f8f9]"
                        }`}
                     >
                        <div>
                           <p className="font-semibold text-[#1a1510]">{f.label}</p>
                           <p className="text-sm text-[#1a1510]/45 mt-0.5">{f.value}</p>
                        </div>
                        {f.active ? <Check size={16} className="text-emerald-600 shrink-0" /> : <Plus size={16} className="text-[#1a1510]/35 shrink-0" />}
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
            <div className="space-y-6 pb-8">
               <div>
                  <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">What should we never do?</h2>
                  <p className="text-[#1a1510]/50 mt-2">Guardrails prevent risky outreach and routing mistakes.</p>
               </div>
               <div className="space-y-3">
                  {guardrails.map((g) => (
                     <div key={g.id} className="rounded-xl border border-[#1a1510]/10 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                           <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                 type="button"
                                 onClick={() => toggleGuardrail(g.id)}
                                 className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    g.enabled ? "bg-[#1a1510] border-[#1a1510]" : "border-[#1a1510]/25 bg-white"
                                 }`}
                              >
                                 {g.enabled && <Check size={12} className="text-white" />}
                              </button>
                              <div>
                                 <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-lg font-semibold text-[#1a1510]">{g.title}</p>
                                    {g.recommended && (
                                       <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Recommended</span>
                                    )}
                                 </div>
                                 <p className="text-sm text-[#1a1510]/50 mt-1">{g.description}</p>
                              </div>
                           </div>
                        </div>
                        {g.enabled && (
                           <GuardrailActionDropdown
                              action={g.action}
                              open={openActionMenuId === g.id}
                              onToggle={() => setOpenActionMenuId((id) => (id === g.id ? null : g.id))}
                              onSelect={(a) => setGuardrailAction(g.id, a)}
                           />
                        )}
                     </div>
                  ))}
               </div>
            </div>
         );
      }

      if (standardStep === 5) {
         return (
            <div className="space-y-6 pb-4">
               <div>
                  <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">What actions fire?</h2>
                  <p className="text-[#1a1510]/50 mt-2">Pick a path preset now. You can move to advanced canvas anytime.</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {PATH_PRESETS.map(({ name, desc, icon: Icon }) => {
                     const selected = selectedPath === name;
                     return (
                        <button
                           key={name}
                           type="button"
                           onClick={() => setSelectedPath(name)}
                           className={`text-left rounded-xl border p-5 ${selected ? "border-brand-gold/50 bg-brand-gold/5" : "border-[#1a1510]/10 bg-white"}`}
                        >
                           <Icon size={20} className="text-[#1a1510]/45 mb-3" />
                           <h4 className="text-xl font-semibold text-[#1a1510]">{name}</h4>
                           <p className="text-sm text-[#1a1510]/50 mt-2">{desc}</p>
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

      return (
         <div className="space-y-6 pb-4">
            <div>
               <h2 className="text-4xl font-black tracking-tight text-[#1a1510]">Pre-launch review</h2>
               <p className="text-[#1a1510]/50 mt-2">Confirm everything is in order before this workflow goes live.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
               {[
                  ["TRIGGER", selectedTrigger.replace(/ /g, "_")],
                  ["TARGET", selectedTarget],
                  ["ENROLLMENT FILTERS", String(activeFilterCount)],
                  ["GUARDRAILS", String(activeGuardrailCount)],
                  ["PATH STEPS", String(pathStepCount)],
                  ["MODE", executionMode],
               ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-[#1a1510]/10 bg-white p-4">
                     <p className="text-[10px] font-bold tracking-widest text-[#1a1510]/45">{label}</p>
                     <p className="text-xl mt-2 font-bold text-[#1a1510]">{value}</p>
                  </div>
               ))}
            </div>
            <div className="space-y-3">
               {[
                  { title: "Trigger configured", sub: triggerDesc },
                  { title: "Enrollment criteria set", sub: `${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active` },
                  { title: "Guardrails configured", sub: `${activeGuardrailCount} guardrails active` },
                  { title: "Actions defined", sub: `${pathStepCount} step${pathStepCount !== 1 ? "s" : ""} in path` },
                  { title: "Execution mode", sub: "Executes automatically. Guardrails stop or reroute risky actions." },
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
            <div className="flex items-center gap-4">
               <button type="button" onClick={closeBuilder} className="text-sm flex items-center gap-2 hover:text-brand-gold">
                  <ArrowLeft size={15} /> Close
               </button>
               <span className="font-semibold text-[#1a1510]">Untitled workflow</span>
               <span className="px-2 py-1 rounded-full bg-[#f7f8f9] text-xs font-semibold text-[#1a1510]/60 flex items-center gap-1">
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
            <aside className="w-72 shrink-0 border-r border-[#1a1510]/10 bg-white p-4 overflow-y-auto">
               {STANDARD_STEPS.map((step, index) => {
                  const idx = index + 1;
                  const active = idx === standardStep;
                  const done = idx < standardStep;
                  return (
                     <button
                        key={step.title}
                        type="button"
                        onClick={() => { setStandardStep(idx); setOpenActionMenuId(null); }}
                        className={`w-full text-left rounded-xl border px-4 py-3 mb-2 transition-colors ${
                           active ? "border-brand-gold/30 bg-brand-gold/5" : done ? "border-transparent hover:bg-[#f7f8f9]" : "border-transparent hover:bg-[#f7f8f9]"
                        }`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              done ? "bg-emerald-100 text-emerald-700" : active ? "bg-[#1a1510] text-brand-gold" : "border border-[#1a1510]/20 text-[#1a1510]/45"
                           }`}>
                              {done ? <Check size={14} /> : <span className="text-sm font-bold">{idx}</span>}
                           </div>
                           <div>
                              <p className="font-semibold text-[#1a1510]">{step.title}</p>
                              <p className="text-xs text-[#1a1510]/45">{step.subtitle}</p>
                           </div>
                        </div>
                     </button>
                  );
               })}
            </aside>

            <div className="flex-1 flex flex-col min-h-0 min-w-0">
               <main className="flex-1 overflow-y-auto p-8 min-h-0">{renderStepContent()}</main>
               <footer className="shrink-0 border-t border-[#1a1510]/10 bg-white px-8 py-4 flex items-center justify-between">
                  <button
                     type="button"
                     disabled={standardStep === 1}
                     onClick={() => { setStandardStep((s) => Math.max(1, s - 1)); setOpenActionMenuId(null); }}
                     className="h-10 px-5 rounded-lg border border-[#1a1510]/10 flex items-center gap-2 text-sm font-semibold disabled:opacity-40"
                  >
                     <ArrowLeft size={14} /> Back
                  </button>
                  {standardStep < 6 ? (
                     <button
                        type="button"
                        onClick={() => { setStandardStep((s) => Math.min(6, s + 1)); setOpenActionMenuId(null); }}
                        className="h-11 px-6 rounded-lg bg-[#1a1510] text-brand-gold font-bold flex items-center gap-2"
                     >
                        Next <ArrowRight size={15} />
                     </button>
                  ) : (
                     <div className="flex items-center gap-3">
                        <button
                           type="button"
                           onClick={() => setLaunchToast("Draft saved (mock)")}
                           className="h-11 px-6 rounded-lg border border-[#1a1510]/10 text-sm font-semibold"
                        >
                           Save draft
                        </button>
                        <button
                           type="button"
                           onClick={() => setLaunchToast("Test run started (mock) — no records enrolled")}
                           className="h-11 px-6 rounded-lg border border-[#1a1510]/10 text-sm font-semibold flex items-center gap-2"
                        >
                           <Play size={14} /> Test
                        </button>
                        <button
                           type="button"
                           onClick={() => setLaunchToast("Workflow launched (mock)")}
                           className="h-11 px-6 rounded-lg bg-[#1a1510] text-brand-gold font-bold flex items-center gap-2"
                        >
                           <Rocket size={14} /> Launch workflow
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
         <header className="h-14 shrink-0 border-b border-[#1a1510]/10 bg-white px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap min-w-0">
               <button type="button" onClick={closeBuilder} className="text-sm flex items-center gap-2 shrink-0">
                  <ArrowLeft size={15} /> Close
               </button>
               <span className="font-semibold flex items-center gap-2 shrink-0">
                  <Sparkles size={14} className="text-brand-gold" /> Power Workflow <span className="text-xs text-[#1a1510]/40 font-normal">Draft</span>
               </span>
               <input className="h-9 w-44 rounded-lg border border-[#1a1510]/10 px-3 text-sm" defaultValue="Untitled workflow" />
               <button type="button" className="h-9 px-3 rounded-lg border border-[#1a1510]/10 text-sm">No account</button>
               <button type="button" className="h-9 px-3 rounded-lg border border-[#1a1510]/10 text-sm">Account-wide</button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <button type="button" className="h-9 px-4 rounded-lg border border-[#1a1510]/10 text-sm font-medium">Simulate</button>
               <button type="button" onClick={() => setLaunchToast("Draft saved (mock)")} className="h-9 px-4 rounded-lg border border-[#1a1510]/10 text-sm font-medium">Save Draft</button>
               <button
                  type="button"
                  onClick={() => setLaunchToast("Test & Launch started (mock)")}
                  className="h-9 px-4 rounded-lg bg-[#1a1510] text-brand-gold text-sm font-bold flex items-center gap-2"
               >
                  <Rocket size={14} /> Test & Launch
               </button>
            </div>
         </header>

         <div className="h-10 shrink-0 border-b border-[#1a1510]/10 bg-white px-4 text-xs font-semibold text-[#1a1510]/55 flex items-center gap-6 overflow-x-auto">
            <span>STEPS 0</span><span>ENROLLED 0</span><span>IN FLIGHT 0</span><span>COMPLETED 0</span><span>AVG CYCLE —</span><span>SUCCESS —</span>
            <span className="ml-auto italic font-normal text-[#1a1510]/40">Configure trigger to see live volume</span>
         </div>

         <div className="flex-1 flex min-h-0 overflow-hidden">
            <main className="flex-1 overflow-auto min-h-0">
               <div className="min-h-full py-16 px-10 bg-[radial-gradient(#1a151010_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center">
                  <div className="w-full max-w-[360px] rounded-2xl border-2 border-dashed border-brand-gold/30 bg-white p-5 shadow-sm">
                     <div className="w-10 h-10 rounded-lg bg-brand-gold/15 flex items-center justify-center mb-3">
                        <Zap size={20} className="text-brand-gold" />
                     </div>
                     <p className="text-xs text-[#1a1510]/45">1. Trigger</p>
                     <h3 className="text-xl font-bold text-[#1a1510] mt-1">When this happens...</h3>
                     <p className="text-sm text-[#1a1510]/45 mt-1">Choose an app & event to start.</p>
                  </div>
                  <div className="w-px h-8 bg-[#1a1510]/15" />
                  <button
                     type="button"
                     onClick={() => setShowBlockPicker(true)}
                     className="w-10 h-10 rounded-full border-2 border-[#1a1510]/15 bg-white flex items-center justify-center hover:border-brand-gold/50 shadow-sm"
                  >
                     <Plus size={18} className="text-[#1a1510]/50" />
                  </button>
                  <p className="text-xs text-[#1a1510]/40 mt-2">Add your first action below</p>
                  <div className="w-px h-8 bg-[#1a1510]/15" />
                  <div className="rounded-full border border-[#1a1510]/15 bg-white px-4 py-2 text-sm text-[#1a1510]/55 flex items-center gap-2">
                     <Circle size={14} /> End of workflow
                  </div>
               </div>
            </main>

            {showBlockPicker && (
               <aside className="w-[400px] shrink-0 border-l border-[#1a1510]/10 bg-white flex flex-col min-h-0">
                  <div className="p-4 border-b border-[#1a1510]/10 shrink-0 flex items-center justify-between">
                     <h3 className="text-xl font-bold text-[#1a1510]">Choose a block</h3>
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
            <header className="h-14 shrink-0 border-b border-[#1a1510]/10 bg-white px-6 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button type="button" onClick={onBackToDashboard} className="h-8 px-3 rounded-lg border border-[#1a1510]/10 text-sm flex items-center gap-2">
                     <ArrowLeft size={14} /> Back
                  </button>
                  <span className="text-xl font-black tracking-tight">Workflows</span>
               </div>
            </header>
         )}

         {view === "list" && renderListView()}
         {view === "standard" && renderStandardView()}
         {view === "advanced" && renderAdvancedView()}
      </div>
   );
};
