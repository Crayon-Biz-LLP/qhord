"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Bookmark, ShieldCheck, BarChart3, Download, Star, Clock, 
  CreditCard, Sparkles, CheckCircle2, Mail, MessageSquare, Linkedin
} from "lucide-react";
import { PlaybookItem } from "./Playbooks";

interface PlaybookInspectProps {
  playbook: PlaybookItem | null;
  onClose: () => void;
  onImport: (playbook: PlaybookItem) => void;
}

export const PlaybookInspect = ({ playbook, onClose, onImport }: PlaybookInspectProps) => {
  const [activeSubTab, setActiveSubTab] = useState("Overview");

  const PLAYBOOK_MESSAGING = {
    emails: [
      {
        id: "A",
        subject: "Quick question about {{company}} eng team",
        body: "Hi {{firstName}},\n\nI noticed {{company}} recently {{signal}}. We help similar teams {{value_prop}}.\n\nWorth a quick chat?"
      },
      {
        id: "B",
        subject: "{{firstName}} — saw {{company}} is scaling",
        body: "Hi {{firstName}},\n\nCongrats on the growth at {{company}}. When teams hit your stage, they usually face {{pain_point}}.\n\nWe built something that helps. Open to a 15-min call?"
      }
    ],
    linkedin: [
      {
        type: "connection",
        text: "Hi {{firstName}}, I work with engineering leaders at companies like {{company}}. Would love to connect."
      },
      {
        type: "follow-up",
        text: "Thanks for connecting! I shared a quick email about how we help teams like {{company}}. Worth a look?"
      }
    ],
    guidance: {
      tone: "Professional, concise, value-driven. Avoid salesy language.",
      cta: 'Soft ask — "Worth a quick chat?"',
      placeholders: ["{{firstName}}", "{{company}}", "{{signal}}", "{{value_prop}}", "{{pain_point}}", "{{similar_company}}", "{{result}}"]
    }
  };

  const PLAYBOOK_RULES = {
    safety: [
      { key: "Daily Send Limit", val: "100" },
      { key: "Approval Required", val: "No" },
      { key: "Duplicate Prevention", val: "Enabled" }
    ],
    requiredFields: ["email", "firstName", "company"],
    exclusion: [
      "Exclude existing customers",
      "Exclude contacted in last 90 days"
    ],
    disqualification: [
      "Company size < 20",
      "No business email"
    ]
  };

  const PLAYBOOK_HISTORY = [
    {
      version: "v2.1",
      date: "2026-03-15",
      changes: ["Added LinkedIn fallback branch", "Improved subject lines"]
    },
    {
      version: "v2.0",
      date: "2026-02-28",
      changes: ["Multi-channel support", "Clay enrichment step"]
    }
  ];

  const PLAYBOOK_STEPS = [
    { title: "Source leads from Apollo", tool: "Apollo", meta: ["If fail: Retry with broader filters"] },
    { title: "Push to Clay for enrichment", tool: "Clay", meta: ["Depends on: Step 1", "Condition: contacts > 0", "If fail: Fall back to Apollo enrichment"] },
    { title: "Validate email quality", tool: "Clay", meta: ["Depends on: Step 2", "If fail: Remove invalid, continue with valid"] },
    { title: "Push validated leads to Smartlead", tool: "Smartlead", meta: ["Depends on: Step 3", "Condition: valid email rate > 85%", "If fail: Pause and alert if below threshold"] },
    { title: "Launch email sequence", tool: "Smartlead", meta: ["Depends on: Step 4", "Condition: sender accounts healthy", "If fail: Reduce volume and retry"] },
    { title: "Send LinkedIn connection requests", tool: "HeyReach", meta: ["Depends on: Step 4", "Condition: HeyReach connected", "If fail: Skip LinkedIn, continue email-only"] },
    { title: "Evaluate responses", tool: "Smartlead", meta: ["Depends on: Step 5", "If fail: Manual review queue"] },
    { title: "Push positive replies to CRM", tool: "HubSpot", meta: ["Depends on: Step 7", "Condition: sentiment = positive", "If fail: Queue for manual CRM entry"] },
  ];

  return (
    <AnimatePresence>
      {playbook && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer Content */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-[520px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[101] overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    playbook.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                    playbook.difficulty === "Intermediate" ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20" :
                    "bg-red-50 text-red-500 border-red-100"
                  }`}>
                    {playbook.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-[#1a1510]/5 bg-[#f7f8f9] text-[#1a1510]/40">v2.1</span>
                  <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-brand-gold/10 bg-brand-gold/5 text-brand-gold">control-tower</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[#f7f8f9] rounded-xl transition-all">
                  <Plus className="rotate-45 text-[#1a1510]/40" size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-[#1a1510] tracking-tighter">{playbook.name}</h2>
                <p className="text-[13px] font-medium text-[#1a1510]/40 leading-relaxed italic font-serif">
                  {playbook.description}
                </p>
              </div>

              {/* Top Benchmark Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { label: "Confidence", val: playbook.confidence, color: "text-brand-gold", progress: playbook.confidence },
                  { label: "Fit Score", val: 100, color: "text-black", progress: 100 },
                  { label: "Readiness", val: 90, color: "text-emerald-500", progress: 90 },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-[#1a1510]/5 rounded-2xl p-5 shadow-sm text-center space-y-3">
                    <h4 className="text-2xl font-black text-[#1a1510] tracking-tighter">{stat.val}</h4>
                    <p className="text-[9px] font-black text-[#1a1510]/30 uppercase tracking-widest">{stat.label}</p>
                    <div className="h-1 w-full bg-[#f7f8f9] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        className={`h-full ${stat.color.replace('text', 'bg')}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub nav */}
              <div className="flex items-center gap-6 border-b border-[#1a1510]/5 pb-1">
                {["Overview", "Steps (8)", "Messaging", "Rules", "History"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveSubTab(tab)}
                    className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                      activeSubTab === tab ? "text-[#1a1510]" : "text-[#1a1510]/30 hover:text-[#1a1510]"
                    }`}
                  >
                    {tab}
                    {activeSubTab === tab && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />}
                  </button>
                ))}
              </div>

              {/* Detailed Content */}
              <div className="space-y-8 pb-32 pt-2">
                {activeSubTab === "Overview" ? (
                  <>
                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Strategy Breakdown</h5>
                      <div className="space-y-3">
                        {[
                          { k: "ICP", v: "VP/Director of Engineering at Series A-C SaaS companies" },
                          { k: "Personas", v: "VP Engineering, CTO, Head of Product" },
                          { k: "Company Size", v: "50-500 employees" },
                          { k: "Geography", v: "US & UK" },
                          { k: "Vertical", v: "SaaS / Software" },
                          { k: "Goal", v: "Book discovery meetings with mid-market SaaS leaders" },
                          { k: "Channel Strategy", v: "Email-first with LinkedIn reinforcement" },
                          { k: "Volume", v: "100 / day" },
                          { k: "Duration", v: "21 days" }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-start gap-8 group">
                            <span className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest shrink-0 pt-0.5">{item.k}</span>
                            <span className="text-[11px] font-black text-[#1a1510] text-right">{item.v}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Deployment Benchmarks</h5>
                      <div className="space-y-3">
                        {[
                          { k: "Reply Rate", v: "8-12%" },
                          { k: "Acceptance Rate", v: "25-35%" },
                          { k: "Meeting Rate", v: "3-5%" },
                          { k: "Pipeline Generated", v: "$50K - $150K" }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center group">
                            <span className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{item.k}</span>
                            <span className="text-[11px] font-black text-[#1a1510]">{item.v}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Performance Memory</h5>
                      <div className="space-y-3">
                        {[
                          { k: "Total Imports", v: "2,340" },
                          { k: "Launches", v: "1,820" },
                          { k: "Avg Reply Rate", v: "10.2%" },
                          { k: "Avg Meeting Rate", v: "4.1%" }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center group">
                            <span className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{item.k}</span>
                            <span className="text-[11px] font-black text-[#1a1510]">{item.v}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Stack Integration</h5>
                      <div className="flex flex-wrap gap-2">
                        {["Apollo", "Clay", "Smartlead", "HeyReach"].map((t) => (
                          <div key={t} className="px-4 py-2 bg-[#1a1510] rounded-xl flex items-center gap-2 group cursor-pointer hover:bg-brand-gold transition-all">
                            <CheckCircle2 size={12} className="text-brand-gold group-hover:text-black" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest group-hover:text-black">{t}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Strategic Fit Analysis</h5>
                      <div className="space-y-3">
                        {["Industry match confirmed", "Team size alignment (2-5 reps)", "Tool coverage 100% verified"].map((check, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="p-1 bg-emerald-50 rounded-lg text-emerald-500">
                              <ShieldCheck size={14} />
                            </div>
                            <span className="text-[11px] font-black text-[#1a1510] tracking-tight">{check}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                ) : activeSubTab === "Steps (8)" ? (
                  <div className="space-y-4">
                    {PLAYBOOK_STEPS.map((step, i) => (
                      <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[1.5rem] p-6 flex items-start gap-5 hover:border-brand-gold/20 transition-all relative group">
                        {/* Connecting Line */}
                        {i < PLAYBOOK_STEPS.length - 1 && (
                          <div className="absolute left-[39px] top-[60px] w-[1px] h-[30px] bg-[#1a1510]/5 z-0" />
                        )}
                        
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs font-black shrink-0 relative z-10">
                          {i + 1}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h6 className="text-[13px] font-black text-[#1a1510] tracking-tight">{step.title}</h6>
                            <span className="px-3 py-1 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-full text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest">
                              {step.tool}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {step.meta.map((m, idx) => (
                              <p key={idx} className="text-[10px] font-medium text-[#1a1510]/40 leading-relaxed italic">
                                {m}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeSubTab === "Messaging" ? (
                  <div className="space-y-6">
                    {/* Email Templates */}
                    {PLAYBOOK_MESSAGING.emails.map((email) => (
                      <div key={email.id} className="bg-white border border-[#1a1510]/5 rounded-[1.5rem] p-6 space-y-4 hover:border-brand-gold/20 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                            <Mail size={14} />
                          </div>
                          <span className="text-[10px] font-black text-[#1a1510] uppercase tracking-widest">Email Template {email.id}</span>
                        </div>
                        <div className="space-y-2">
                          <h6 className="text-[14px] font-black text-[#1a1510] tracking-tight">{email.subject}</h6>
                          <div className="text-[12px] font-medium text-[#1a1510]/50 leading-relaxed whitespace-pre-wrap font-serif italic">
                            {email.body}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* LinkedIn Messages */}
                    {PLAYBOOK_MESSAGING.linkedin.map((msg, i) => (
                      <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[1.5rem] p-6 space-y-4 hover:border-brand-gold/20 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Linkedin size={14} />
                          </div>
                          <span className="text-[10px] font-black text-[#1a1510] uppercase tracking-widest">LinkedIn {msg.type}</span>
                        </div>
                        <p className="text-[12px] font-medium text-[#1a1510]/50 leading-relaxed italic font-serif">
                          {msg.text}
                        </p>
                      </div>
                    ))}

                    {/* Guidance & Placeholders */}
                    <div className="bg-[#f7f8f9] border border-[#1a1510]/5 rounded-[2rem] p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h6 className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Tone Guidance</h6>
                          <p className="text-[12px] font-medium text-[#1a1510]/40 italic">{PLAYBOOK_MESSAGING.guidance.tone}</p>
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">CTA Style</h6>
                          <p className="text-[12px] font-medium text-[#1a1510]/40 italic">{PLAYBOOK_MESSAGING.guidance.cta}</p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-[#1a1510]/5">
                        <h6 className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Personalization Placeholders</h6>
                        <div className="flex flex-wrap gap-2">
                          {PLAYBOOK_MESSAGING.guidance.placeholders.map((ph) => (
                            <span key={ph} className="px-4 py-2 bg-white border border-[#1a1510]/5 rounded-xl text-[10px] font-black text-[#1a1510]/30 hover:text-brand-gold transition-colors cursor-default">
                              {ph}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeSubTab === "Rules" ? (
                  <div className="space-y-8">
                    {/* Safety Section */}
                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Safety</h5>
                      <div className="space-y-3">
                        {PLAYBOOK_RULES.safety.map((item, i) => (
                          <div key={i} className="flex justify-between items-center group">
                            <span className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{item.key}</span>
                            <span className="text-[11px] font-black text-[#1a1510]">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Required Fields Section */}
                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Required Fields</h5>
                      <div className="flex flex-wrap gap-2">
                        {PLAYBOOK_RULES.requiredFields.map((f) => (
                          <span key={f} className="px-5 py-2 bg-[#f7f8f9] border border-[#1a1510]/5 rounded-full text-[10px] font-black text-[#1a1510]/30 lowercase">
                            {f}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Exclusion Logic Section */}
                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Exclusion Logic</h5>
                      <ul className="space-y-3">
                        {PLAYBOOK_RULES.exclusion.map((ex, i) => (
                          <li key={i} className="flex items-center gap-3 text-[11px] font-black text-[#1a1510]">
                            <div className="w-1 h-1 rounded-full bg-brand-gold" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Disqualification Section */}
                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Disqualification</h5>
                      <ul className="space-y-3">
                        {PLAYBOOK_RULES.disqualification.map((dq, i) => (
                          <li key={i} className="flex items-center gap-3 text-[11px] font-black text-[#1a1510]">
                            <div className="w-1 h-1 rounded-full bg-red-400" />
                            {dq}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                ) : activeSubTab === "History" ? (
                  <div className="space-y-4">
                    {PLAYBOOK_HISTORY.map((hist, i) => (
                      <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[1.5rem] p-6 space-y-4 hover:border-brand-gold/20 transition-all group">
                        <div className="flex justify-between items-center">
                          <h6 className="text-[14px] font-black text-[#1a1510] tracking-tight">{hist.version}</h6>
                          <span className="text-[10px] font-bold text-[#1a1510]/30 tabular-nums">{hist.date}</span>
                        </div>
                        <ul className="space-y-2">
                          {hist.changes.map((change, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[11px] font-medium text-[#1a1510]/40 italic">
                              <span className="w-1 h-1 rounded-full bg-[#1a1510]/10 shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-[#f7f8f9] rounded-[2rem] border border-dashed border-[#1a1510]/10">
                    <p className="text-[10px] font-black text-[#1a1510]/20 uppercase tracking-widest">Module coming soon</p>
                  </div>
                )}

                {/* Primary Execution Action */}
                <div className="pt-10">
                  <button 
                    onClick={() => playbook && onImport(playbook)}
                    className="w-full h-14 rounded-2xl bg-[#1a1510] text-brand-gold text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:translate-y-[-1px] transition-all"
                  >
                    <Download size={18} strokeWidth={3} /> Import & Configure Playbook
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
