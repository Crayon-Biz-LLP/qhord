"use client";

import React, { useState } from "react";
import { X, Bot, Target, Zap, CheckCircle } from "lucide-react";

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
      const response = await fetch("http://localhost:4000/api/campaigns/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

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
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      
      const response = await fetch("http://localhost:4000/api/approvals/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ campaignId })
      });

      const data = await response.json();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-brand-gold" />
            <h2 className="text-xl font-bold">Create Campaign</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* AI Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              What campaign do you want to create?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your campaign in natural language..."
              className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              disabled={isCreating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Send 100 B2B leads from Apollo to Smartlead with 2-day warmup"
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={createCampaign}
            disabled={!prompt.trim() || isCreating}
            className="w-full bg-brand-gold text-white py-3 rounded-lg font-medium hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating campaign...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Create Campaign
              </div>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="font-bold text-emerald-800 mb-2">🎉 Campaign Created Successfully!</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Campaign ID:</span> {result.campaignId}
                </div>
                <div>
                  <span className="font-semibold">Name:</span> {result.plan?.name}
                </div>
                <div>
                  <span className="font-semibold">Steps:</span> {result.plan?.steps?.length || 0}
                </div>
                <div>
                  <span className="font-semibold">Cost:</span> ${result.estimatedCost}
                </div>
              </div>
              
              {/* LangGraph Nodes Status */}
              <div className="mt-4 p-4 bg-emerald-100 rounded-xl">
                <h4 className="font-bold text-emerald-800 mb-2">🔄 LangGraph Execution Flow</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-200 rounded border border-green-300">
                    <div className="font-bold">✅ Parser</div>
                    <div>Understanding</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-200 rounded border border-yellow-300">
                    <div className="font-bold">✅ Architect</div>
                    <div>Planning</div>
                  </div>
                  <div className="text-center p-2 bg-blue-200 rounded border border-blue-300">
                    <div className="font-bold">✅ Validator</div>
                    <div>Guardrails</div>
                  </div>
                  <div className="text-center p-2 bg-purple-200 rounded border border-purple-300">
                    <div className="font-bold">✅ Executor</div>
                    <div>Saving</div>
                  </div>
                </div>
                <p className="text-xs text-emerald-700 mt-2 text-center">
                  All 4 LangGraph nodes executed successfully!
                </p>
              </div>

              {/* Auto-submission Status */}
              <div className={`mt-4 p-4 border rounded-xl ${isSubmittedForApproval ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
                <h4 className={`font-bold mb-2 ${isSubmittedForApproval ? "text-blue-800" : "text-orange-800"}`}>
                  {isSubmittedForApproval ? "✅ Submitted to Approval Queue" : "⏳ Submitting to Approval Queue"}
                </h4>
                <p className={`text-sm ${isSubmittedForApproval ? "text-blue-700" : "text-orange-700"}`}>
                  {isSubmittedForApproval
                    ? "Campaign has been sent for approval. Manage all pending items in the Approvals tab."
                    : "Preparing approval request..."}
                </p>
                {isSubmittedForApproval && (
                  <button
                    onClick={onClose}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
