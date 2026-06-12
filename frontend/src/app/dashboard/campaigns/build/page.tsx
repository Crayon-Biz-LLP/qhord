"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Save, Target, Layers, Users, Mail, RefreshCw,
  CheckCircle, Zap, Linkedin, Send, Check, Building2, Globe, Filter,
  Clock, Sparkles, MessageSquare,
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
const LEAD_SOURCES = ["Apollo Search", "Clay Table", "CSV Upload"] as const;
const TONES = ["Professional", "Friendly", "Direct", "Casual"] as const;

export default function BuildCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [building, setBuilding] = useState(false);

  const [form, setForm] = useState({
    name: "",
    intent: "email" as string,
    channels: ["Apollo", "Smartlead"] as string[],
    leadSource: "Apollo Search" as string,
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

  const toggleChannel = (tool: string) =>
    set({
      channels: form.channels.includes(tool)
        ? form.channels.filter((c) => c !== tool)
        : [...form.channels, tool],
    });

  const isLast = step === STEPS.length - 1;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => {
    if (step === 0) router.push("/dashboard/campaigns");
    else setStep((s) => s - 1);
  };

  const buildPrompt = () => {
    const intent = INTENT_OPTIONS.find((o) => o.id === form.intent)?.title ?? "Outbound";
    return (
      `Create a ${intent} campaign${form.name ? ` named "${form.name}"` : ""}. ` +
      `Source ${form.leadCount} leads from ${form.leadSource}` +
      `${form.title ? ` targeting "${form.title}"` : ""}` +
      `${form.industry ? ` in ${form.industry}` : ""}` +
      `${form.geo ? ` (${form.geo})` : ""}. ` +
      `Use these tools: ${form.channels.join(", ")}. ` +
      `Run a ${form.sequenceSteps}-step ${form.tone.toLowerCase()} sequence` +
      `${form.subject ? ` with subject "${form.subject}"` : ""}. ` +
      `Warm up over ${form.warmupDays} days with a daily limit of ${form.dailyLimit}.`
    );
  };

  const handleBuild = async () => {
    setBuilding(true);
    try {
      await fetch("http://localhost:4000/api/campaigns/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ prompt: buildPrompt() }),
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
              Step {step + 1} of {STEPS.length} · {STEPS[step].label}
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
                </Section>
              )}

              {/* STEP 2 — CHANNELS */}
              {step === 1 && (
                <Section title="Confirm your channels" subtitle="Toggle the tools this campaign should run through">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ALL_TOOLS.map((tool) => {
                      const on = form.channels.includes(tool);
                      return (
                        <button
                          key={tool}
                          onClick={() => toggleChannel(tool)}
                          className={`flex items-center justify-between p-5 rounded-2xl border bg-white transition-all ${
                            on ? "border-brand-gold ring-2 ring-brand-gold/15" : "border-[#1a1510]/[0.07] hover:border-[#1a1510]/15"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${on ? "bg-[#1a1510] text-brand-gold" : "bg-[#f7f8f9] text-[#1a1510]/40"}`}>
                              <Layers size={18} />
                            </div>
                            <span className="text-sm font-bold text-[#1a1510]">{tool}</span>
                          </div>
                          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${on ? "bg-brand-gold" : "bg-[#1a1510]/10"}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <FieldCard className="mt-4">
                    <Field label="Campaign name">
                      <input
                        value={form.name}
                        onChange={(e) => set({ name: e.target.value })}
                        placeholder="e.g. Q3 SaaS Founders Outbound"
                        className={inputCls}
                      />
                    </Field>
                  </FieldCard>
                </Section>
              )}

              {/* STEP 3 — LEADS */}
              {step === 2 && (
                <Section title="Who are we reaching?" subtitle="Define your lead source and targeting">
                  <FieldCard>
                    <Field label="Lead source" icon={Building2}>
                      <div className="flex flex-wrap gap-2">
                        {LEAD_SOURCES.map((src) => (
                          <button
                            key={src}
                            onClick={() => set({ leadSource: src })}
                            className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                              form.leadSource === src ? "bg-[#1a1510] text-white" : "bg-[#f7f8f9] text-[#1a1510]/60 hover:bg-[#1a1510]/5"
                            }`}
                          >
                            {src}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label={`Number of leads — ${form.leadCount}`} icon={Users}>
                      <input
                        type="range" min={10} max={1000} step={10}
                        value={form.leadCount}
                        onChange={(e) => set({ leadCount: Number(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Job title" icon={Filter}>
                        <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="VP Sales" className={inputCls} />
                      </Field>
                      <Field label="Industry" icon={Building2}>
                        <input value={form.industry} onChange={(e) => set({ industry: e.target.value })} placeholder="SaaS" className={inputCls} />
                      </Field>
                      <Field label="Geography" icon={Globe}>
                        <input value={form.geo} onChange={(e) => set({ geo: e.target.value })} placeholder="United States" className={inputCls} />
                      </Field>
                    </div>
                  </FieldCard>
                </Section>
              )}

              {/* STEP 4 — MESSAGING */}
              {step === 3 && (
                <Section title="Craft your message" subtitle="Set the tone and the opening touch">
                  <FieldCard>
                    <Field label="Tone" icon={Sparkles}>
                      <div className="flex flex-wrap gap-2">
                        {TONES.map((t) => (
                          <button
                            key={t}
                            onClick={() => set({ tone: t })}
                            className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                              form.tone === t ? "bg-[#1a1510] text-white" : "bg-[#f7f8f9] text-[#1a1510]/60 hover:bg-[#1a1510]/5"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Subject line" icon={Mail}>
                      <input value={form.subject} onChange={(e) => set({ subject: e.target.value })} placeholder="Quick question about {{company}}" className={inputCls} />
                    </Field>
                    <Field label="Opening message" icon={MessageSquare}>
                      <textarea
                        value={form.body}
                        onChange={(e) => set({ body: e.target.value })}
                        placeholder="Hi {{firstName}}, noticed your team is scaling outbound…"
                        className={`${inputCls} h-32 resize-none`}
                      />
                    </Field>
                    <Field label={`Sequence steps — ${form.sequenceSteps}`} icon={Layers}>
                      <input
                        type="range" min={1} max={7} step={1}
                        value={form.sequenceSteps}
                        onChange={(e) => set({ sequenceSteps: Number(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                    </Field>
                  </FieldCard>
                </Section>
              )}

              {/* STEP 5 — WORKFLOW */}
              {step === 4 && (
                <Section title="Tune the workflow" subtitle="Control pacing and sending safety">
                  <FieldCard>
                    <Field label={`Warm-up period — ${form.warmupDays} days`} icon={Clock}>
                      <input
                        type="range" min={0} max={14} step={1}
                        value={form.warmupDays}
                        onChange={(e) => set({ warmupDays: Number(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                    </Field>
                    <Field label={`Daily send limit — ${form.dailyLimit}`} icon={Zap}>
                      <input
                        type="range" min={10} max={300} step={10}
                        value={form.dailyLimit}
                        onChange={(e) => set({ dailyLimit: Number(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                    </Field>

                    <div className="rounded-xl bg-[#1a1510] p-5 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <RefreshCw size={15} className="text-brand-gold" />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Flow preview</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {["Source leads", "Enrich", `Warmup ${form.warmupDays}d`, `${form.sequenceSteps}-step sequence`, "Track replies"].map((stg, i, arr) => (
                          <React.Fragment key={stg}>
                            <span className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-white/10">{stg}</span>
                            {i < arr.length - 1 && <ArrowRight size={12} className="text-white/30" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </FieldCard>
                </Section>
              )}

              {/* STEP 6 — REVIEW */}
              {step === 5 && (
                <Section title="Review & build" subtitle="Confirm everything before we wire it up">
                  <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] divide-y divide-[#1a1510]/[0.06]">
                    {[
                      { label: "Campaign name", value: form.name || "Untitled campaign" },
                      { label: "Intent", value: INTENT_OPTIONS.find((o) => o.id === form.intent)?.title ?? "—" },
                      { label: "Channels", value: form.channels.join(", ") || "—" },
                      { label: "Lead source", value: `${form.leadSource} · ${form.leadCount} leads` },
                      { label: "Targeting", value: [form.title, form.industry, form.geo].filter(Boolean).join(" · ") || "Any" },
                      { label: "Tone", value: form.tone },
                      { label: "Sequence", value: `${form.sequenceSteps} steps` },
                      { label: "Pacing", value: `${form.warmupDays}d warmup · ${form.dailyLimit}/day` },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-4">
                        <span className="text-[12px] font-semibold text-[#1a1510]/40 uppercase tracking-wider">{row.label}</span>
                        <span className="text-[13px] font-semibold text-[#1a1510] text-right truncate">{row.value}</span>
                      </div>
                    ))}
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
                <div className="w-4 h-4 border-2 border-[#1a1510]/30 border-t-[#1a1510] rounded-full animate-spin" /> Building…
              </>
            ) : (
              <>
                <Zap size={16} /> Build Campaign
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
    </div>
  );
}

// ── Small presentational helpers ──────────────────────────────────
const inputCls =
  "w-full p-3 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[14px] focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30";

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1a1510]">{title}</h2>
        <p className="text-[14px] text-[#1a1510]/45 mt-1">{subtitle}</p>
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

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
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
