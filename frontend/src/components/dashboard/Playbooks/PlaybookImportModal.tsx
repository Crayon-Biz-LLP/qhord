"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, ChevronRight, ArrowLeft, CheckCircle2, ChevronDown, XCircle, Rocket 
} from "lucide-react";
import { PlaybookItem } from "./Playbooks";

interface PlaybookImportModalProps {
  playbook: PlaybookItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaybookImportModal = ({ playbook, isOpen, onClose }: PlaybookImportModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const STEPS = ["Compatibility", "Adapt", "Personalize", "Validate", "Launch"];

  if (!playbook) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-[700px] bg-white rounded-[2rem] shadow-2xl overflow-hidden z-[201]"
          >
            {/* Minimal Header */}
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#1a1510] tracking-tight">Import: {playbook.name}</h2>
                <p className="text-[9px] font-black text-[#1a1510]/30 uppercase tracking-[0.2em]">Step {currentStep} of 5 — {STEPS[currentStep-1]}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#f7f8f9] rounded-xl transition-all">
                <X size={18} className="text-[#1a1510]/30" />
              </button>
            </div>

            {/* Compact Progress */}
            <div className="px-8 pb-8 flex items-center gap-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={`h-1.5 rounded-full transition-all duration-700 ${
                    i + 1 <= currentStep ? "bg-[#2563eb] shadow-[0_0_12px_rgba(37,99,235,0.3)]" : "bg-[#f7f8f9]"
                  }`} />
                  <span className={`text-[7px] font-black uppercase tracking-widest mt-2 block ${
                    i + 1 === currentStep ? "text-[#2563eb]" : "text-[#1a1510]/10"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-8 pb-10 space-y-8 overflow-y-auto max-h-[55vh]">
              {currentStep === 1 ? (
                <>
                  {/* Score Small Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f7f8f9]/50 border border-[#1a1510]/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-1 group hover:border-[#2563eb]/20 transition-all">
                      <div className="text-2xl font-black text-[#1a1510] tracking-tighter">100%</div>
                      <p className="text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest">Tool Compatibility</p>
                    </div>
                    <div className="bg-[#f7f8f9]/50 border border-[#1a1510]/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-1 group hover:border-[#2563eb]/20 transition-all">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black text-[#1a1510] tracking-tighter">100%</div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[7px] font-black uppercase border border-emerald-200">High</span>
                      </div>
                      <p className="text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest">Fit Score</p>
                    </div>
                  </div>

                  {/* Connected Tools Grid */}
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-black text-[#1a1510]/20 uppercase tracking-[0.2em] flex items-center gap-3">
                      Connected Tools
                      <div className="h-[1px] flex-1 bg-[#1a1510]/5" />
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {["Apollo", "Clay", "Smartlead", "HeyReach", "HubSpot"].map((t) => (
                        <div key={t} className="flex items-center gap-3 px-4 py-3 bg-white border border-[#1a1510]/5 rounded-xl shadow-sm">
                          <div className="p-1 bg-emerald-50 text-emerald-500 rounded-lg">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-[11px] font-black text-[#1a1510] tracking-tight">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Condensed Fit Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-black text-[#1a1510]/20 uppercase tracking-[0.2em] flex items-center gap-3">
                      Fit Analysis
                      <div className="h-[1px] flex-1 bg-[#1a1510]/5" />
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "Industry match", val: "Playbook targets SaaS / Software" },
                        { label: "Team size fit", val: "Recommended for SDR team (2-5 reps)" },
                        { label: "Tool coverage", val: "Requires Apollo, Clay, Smartlead, HeyReach" },
                        { label: "Channel alignment", val: "Uses Email, LinkedIn" },
                        { label: "Goal alignment", val: "Book discovery meetings with mid-market SaaS leaders" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 py-1 border-b border-[#1a1510]/[0.02]">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest shrink-0">{item.label}</span>
                          </div>
                          <span className="text-[11px] font-black text-[#1a1510] text-right italic font-serif leading-none">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : currentStep === 2 ? (
                <div className="space-y-6">
                  <header>
                    <p className="text-[12px] font-medium text-[#1a1510]/40 italic font-serif leading-relaxed">The playbook will be adapted to your workspace automatically.</p>
                  </header>

                  <div className="space-y-3">
                    {[
                      { l: "Source Tool", v: "Apollo", s: "mapped" },
                      { l: "Enrichment", v: "Clay", s: "mapped" },
                      { l: "Outreach", v: "Smartlead", s: "mapped" },
                      { l: "LinkedIn", v: "HeyReach", s: "mapped" },
                      { l: "CRM", v: "HubSpot", s: "mapped" },
                      { l: "Timezone", v: "Asia/Calcutta", s: "auto" },
                      { l: "Sender Settings", v: "Default workspace senders", s: "auto" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-5 flex items-center justify-between group hover:border-[#2563eb]/20 transition-all">
                        <span className="text-[12px] font-bold text-[#1a1510]/30 tracking-tight">{item.l}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-black text-[#1a1510] tracking-tight">{item.v}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[7.5px] font-black uppercase border ${
                            item.s === "mapped" ? "bg-blue-50 text-[#2563eb] border-blue-100" : "bg-[#f7f8f9] text-[#1a1510]/30 border-[#1a1510]/5"
                          }`}>
                            {item.s}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Channel Adaptation Box */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-3">
                    <h4 className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Channel Adaptation</h4>
                    <div className="flex items-center gap-3">
                      <div className="p-0.5 bg-emerald-500 rounded text-white">
                        <Check size={10} strokeWidth={4} />
                      </div>
                      <p className="text-[11px] font-medium text-[#1a1510]/50 italic">LinkedIn steps will be included via HeyReach</p>
                    </div>
                  </div>
                </div>
              ) : currentStep === 3 ? (
                <div className="space-y-6">
                  {/* Campaign Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Campaign Name *</label>
                    <input 
                      type="text" 
                      defaultValue={playbook.name}
                      className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510] focus:border-[#2563eb]/30 focus:ring-4 focus:ring-[#2563eb]/5 outline-none transition-all"
                    />
                  </div>

                  {/* Geography & Industry Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Target Geography</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510]/40 appearance-none cursor-pointer outline-none group-hover:border-[#2563eb]/20 transition-all">
                          <option>Select region</option>
                          <option>US</option>
                          <option>UK</option>
                          <option>EUROPE</option>
                          <option>US & UK</option>
                          <option>Global</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Target Industry</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510]/40 appearance-none cursor-pointer outline-none group-hover:border-[#2563eb]/20 transition-all">
                          <option>Select industry</option>
                          <option>SaaS</option>
                          <option>Fintech</option>
                          <option>Enterprise</option>
                          <option>Agency</option>
                          <option>Start-Up</option>
                          <option>E-Commerce</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Owner & CTA Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Campaign Owner</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510]/40 appearance-none cursor-pointer outline-none group-hover:border-[#2563eb]/20 transition-all">
                          <option>Assign owner</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">CTA Preference</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510]/40 appearance-none cursor-pointer outline-none group-hover:border-[#2563eb]/20 transition-all">
                          <option>Select CTA style</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1a1510]/20 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Brand Tone */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Brand Tone</label>
                    <input 
                      type="text" 
                      placeholder="Professional, concise, value-driven. Avoid salesy language."
                      className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510] focus:border-[#2563eb]/30 focus:ring-4 focus:ring-[#2563eb]/5 outline-none transition-all"
                    />
                  </div>

                  {/* Exclusions */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest">Exclusions (optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Exclude current customers"
                      className="w-full h-12 px-5 bg-white border border-[#1a1510]/5 rounded-xl text-[13px] font-medium text-[#1a1510] focus:border-[#2563eb]/30 focus:ring-4 focus:ring-[#2563eb]/5 outline-none transition-all"
                    />
                  </div>
                </div>
              ) : currentStep === 4 ? (
                <div className="space-y-6">
                  {/* Readiness Score Card */}
                  <div className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-8 text-center space-y-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="text-[40px] font-black text-orange-400 tracking-tighter leading-none">70</div>
                      <p className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-widest">Readiness Score</p>
                    </div>
                    <div className="w-full max-w-[200px] mx-auto h-1.5 bg-[#f7f8f9] rounded-full overflow-hidden">
                      <div className="w-[70%] h-full bg-[#2563eb]" />
                    </div>
                  </div>

                  {/* Checklist Section */}
                  <div className="grid grid-cols-1 gap-2 px-2">
                    {[
                      { l: "Campaign name set", s: false },
                      { l: "Geography specified", s: false },
                      { l: "Industry specified", s: false },
                      { l: "Source tool connected", s: true },
                      { l: "Enrichment tool connected", s: true },
                      { l: "Outreach tool connected", s: true },
                      { l: "Email templates configured", s: true },
                      { l: "Sequence has content", s: true },
                      { l: "Safe send limits applied", s: true },
                      { l: "Duplicate prevention enabled", s: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.s ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-red-400" />
                        )}
                        <span className={`text-[12px] font-bold ${item.s ? "text-[#1a1510]/40" : "text-[#1a1510]"} tracking-tight`}>
                          {item.l}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warnings Box */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-3">
                    <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Warnings</h4>
                    <ul className="space-y-1">
                      {["Campaign name set", "Geography specified", "Industry specified"].map((w, i) => (
                        <li key={i} className="text-[11px] font-medium text-[#1a1510]/40 italic shrink-0 flex items-center gap-2">
                           • {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Launch Summary Card */}
                  <div className="bg-[#f7f8f9]/50 border border-[#1a1510]/5 rounded-[2rem] p-8 space-y-6 shadow-sm">
                    <h4 className="text-[11px] font-black text-[#1a1510] uppercase tracking-widest border-b border-[#1a1510]/5 pb-4">Launch Summary</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { l: "Campaign", v: "SaaS SDR Playbook" },
                        { l: "Steps", v: "8" },
                        { l: "Channels", v: "Email, LinkedIn" },
                        { l: "Daily Volume", v: "100" },
                        { l: "Duration", v: "21 days" },
                        { l: "Expected Reply", v: "8-12%" },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center group/item hover:translate-x-1 transition-all">
                          <span className="text-[12px] font-bold text-[#1a1510]/30 tracking-tight uppercase group-hover/item:text-[#1a1510]/50">{item.l}</span>
                          <span className="text-[12px] font-black text-[#1a1510] tracking-tight">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : currentStep === 5 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-12">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#2563eb] shadow-xl shadow-blue-500/10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <Rocket size={40} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-4 max-w-[440px]">
                      <h3 className="text-[32px] font-black text-[#1a1510] tracking-tighter leading-none">Ready to Launch</h3>
                      <p className="text-[14px] font-medium text-[#1a1510]/40 italic font-serif leading-relaxed">
                        &quot;{playbook.name}&quot; will be created with all configured steps, messaging, and automation rules.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full">
                    {[
                      { l: "Steps", v: "8" },
                      { l: "Tools", v: "4" },
                      { l: "Confidence", v: "82%" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-8 text-center space-y-1 shadow-sm hover:border-[#2563eb]/20 transition-all group">
                        <div className="text-2xl font-black text-[#2563eb] tracking-tighter group-hover:scale-110 transition-transform">{item.v}</div>
                        <p className="text-[10px] font-black text-[#1a1510]/30 uppercase tracking-widest">{item.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-[#f7f8f9] rounded-[2rem] border border-dashed border-[#1a1510]/10 space-y-2">
                  <p className="text-[10px] font-black text-[#1a1510]/20 uppercase tracking-widest">Next stage orchestration in progress</p>
                </div>
              )}
            </div>

            {/* Refined Footer */}
            <div className="p-8 pt-4 bg-[#f7f8f9]/30 border-t border-[#1a1510]/5">
              {currentStep === 5 ? (
                <button 
                  onClick={onClose}
                  className="w-full h-16 bg-[#2563eb] text-white rounded-2xl text-[14px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 hover:bg-blue-600 hover:translate-y-[-2px] transition-all"
                >
                  <Rocket size={20} strokeWidth={3} /> Launch Campaign
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                    className="px-6 py-2.5 bg-white border border-[#1a1510]/5 text-[#1a1510]/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#1a1510]/10 transition-all disabled:opacity-30"
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft size={12} strokeWidth={3} /> Back
                  </button>
                  <button 
                    onClick={() => currentStep < 5 && setCurrentStep(currentStep + 1)}
                    className="px-10 py-3 bg-[#2563eb] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all"
                  >
                    Next <ChevronRight size={12} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
