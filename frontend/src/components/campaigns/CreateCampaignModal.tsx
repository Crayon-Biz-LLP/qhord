"use client";

import React, { useState } from "react";
import { X, Bot, Target, Zap, CheckCircle } from "lucide-react";
import { api } from "../../lib/api";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: any) => void;
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSubmittedForApproval, setIsSubmittedForApproval] = useState(false);

  const createCampaign = async () => {
    if (!prompt.trim()) return;

    setIsCreating(true);
    setError("");
    setResult(null);
    setIsSubmittedForApproval(false);

    try {
      const response = await api.post("/campaigns/plan", { prompt }, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = response.data;

      if (data.success) {
        setResult(data);
        setPrompt("");
        await submitForApproval(data.campaignId);
      } else {
        setResult({ error: data.error });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsCreating(false);
    }
  };

  const submitForApproval = async (campaignId: string) => {
    try {
      console.log('🔄 Submitting campaign for approval:', { campaignId });
      
      const response = await api.post("/approvals/submit", { campaignId }, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });

      const data = response.data;
      console.log('📊 Approval submission response:', data);

      if (data.success) {
        console.log('✅ Campaign submitted for approval successfully');
        setIsSubmittedForApproval(true);
        onSuccess({ ...result, campaignId, submitted: true });
      } else {
        console.log('❌ Approval submission failed:', data.error);
        setError(data.error || "Failed to submit for approval");
      }
    } catch (error) {
      console.log('❌ Approval submission error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1a1510]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1a1510]/[0.06]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1510]/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a1510] text-brand-gold flex items-center justify-center">
              <Bot className="w-[18px] h-[18px]" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1510]">Create Campaign</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* AI Input */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1510] mb-2.5">
              <Target className="w-4 h-4 text-[#1a1510]/40" />
              What campaign do you want to create?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your campaign in plain English…"
              className="w-full h-28 p-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[14px] resize-none focus:bg-white focus:outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-[#1a1510]/30"
              disabled={isCreating}
            />
            <p className="text-[12px] text-[#1a1510]/40 mt-2">
              Example: “Send 100 B2B leads from Apollo to Smartlead with a 2-day warmup.”
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={createCampaign}
            disabled={!prompt.trim() || isCreating}
            className="btn-shine w-full h-12 rounded-none bg-[#1a1510] text-white text-sm font-semibold hover:bg-[#2a2118] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating campaign…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Create Campaign
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-600 text-[13px] font-medium">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="mt-5 rounded-xl border border-[#1a1510]/[0.07] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 bg-emerald-50 border-b border-emerald-100">
                <CheckCircle size={18} className="text-emerald-600" />
                <h3 className="text-[14px] font-semibold text-emerald-700">Campaign created successfully</h3>
              </div>

              <div className="p-5 grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Campaign ID", value: result.campaignId },
                  { label: "Name", value: result.plan?.name || "—" },
                  { label: "Steps", value: result.plan?.steps?.length || 0 },
                  { label: "Estimated cost", value: `$${result.estimatedCost ?? 0}` },
                ].map((row, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className="text-[13px] font-semibold text-[#1a1510] truncate">{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Pipeline stages */}
              <div className="px-5 pb-5">
                <p className="text-[11px] font-medium text-[#1a1510]/40 uppercase tracking-wider mb-2.5">Pipeline stages</p>
                <div className="flex items-center gap-2">
                  {["Parsed", "Planned", "Validated", "Saved"].map((stage, i) => (
                    <React.Fragment key={stage}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f7f8f9] border border-[#1a1510]/[0.06]">
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span className="text-[11px] font-medium text-[#1a1510]/70">{stage}</span>
                      </div>
                      {i < 3 && <div className="flex-1 h-px bg-[#1a1510]/[0.08]" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Approval status */}
              <div className="px-5 pb-5">
                <div className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${isSubmittedForApproval ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"}`}>
                  <div>
                    <h4 className={`text-[13px] font-semibold ${isSubmittedForApproval ? "text-blue-700" : "text-amber-700"}`}>
                      {isSubmittedForApproval ? "Submitted to approval queue" : "Submitting to approval queue…"}
                    </h4>
                    <p className={`text-[12px] mt-0.5 ${isSubmittedForApproval ? "text-blue-600/80" : "text-amber-600/80"}`}>
                      {isSubmittedForApproval
                        ? "Manage all pending items in the Approvals tab."
                        : "Preparing approval request…"}
                    </p>
                  </div>
                  {isSubmittedForApproval && (
                    <button
                      onClick={onClose}
                      className="btn-shine h-9 px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center gap-2 shrink-0"
                    >
                      <CheckCircle size={14} /> Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
