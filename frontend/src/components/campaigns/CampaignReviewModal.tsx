"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, CheckCircle, XCircle, Clock, DollarSign, Users, Target, Mail, Calendar, 
  AlertTriangle, ChevronRight, ArrowRight, Activity, Layers, Zap, ShieldCheck, Bot
} from "lucide-react";

interface CampaignReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onSubmit: (priority?: number) => void;
}

export function CampaignReviewModal({ isOpen, onClose, campaign, onSubmit }: CampaignReviewModalProps) {
  const [priority, setPriority] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(priority);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Review Campaign</h2>
              <p className="text-sm text-gray-500">Review and submit for approval</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Overview */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-gold" />
              AI-Generated Campaign Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Campaign Name</label>
                <p className="font-semibold">{campaign.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Client</label>
                <p className="font-semibold">{campaign.client?.name || 'Default Client'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                <p className="font-semibold text-green-600">${campaign.estimated_cost}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p className="font-semibold">{campaign.estimated_duration} minutes</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-gray-700">{campaign.description}</p>
            </div>
          </div>

          {/* LangGraph Execution Flow */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              LangGraph Execution Flow
            </h3>
            
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-3 bg-green-100 rounded-lg border border-green-300">
                <div className="font-bold text-green-800">✅ Parser</div>
                <div className="text-green-600">Understanding</div>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                <div className="font-bold text-yellow-800">✅ Architect</div>
                <div className="text-yellow-600">Planning</div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-300">
                <div className="font-bold text-blue-800">✅ Validator</div>
                <div className="text-blue-600">Guardrails</div>
              </div>
              <div className="text-center p-3 bg-purple-100 rounded-lg border border-purple-300">
                <div className="font-bold text-purple-800">✅ Executor</div>
                <div className="text-purple-600">Saving</div>
              </div>
            </div>
            
            <p className="text-xs text-blue-700 mt-3 text-center">
              All 4 LangGraph nodes executed successfully
            </p>
          </div>

          {/* Campaign Steps */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-600" />
              Campaign Steps ({campaign.steps?.length || 0})
            </h3>
            
            <div className="space-y-3">
              {campaign.steps?.map((step: any, index: number) => (
                <div key={step.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{step.tool}</span>
                      <span className="text-sm text-gray-500">→</span>
                      <span className="text-sm">{step.action}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Order: {step.order} | Dependencies: {step.dependencies?.join(', ') || 'None'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {step.estimated_time} min
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Setting */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Execution Priority
            </h3>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Priority Level:</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              >
                <option value={1}>1 - Highest Priority</option>
                <option value={2}>2 - High Priority</option>
                <option value={3}>3 - Medium-High Priority</option>
                <option value={4}>4 - Medium Priority</option>
                <option value={5}>5 - Normal Priority</option>
                <option value={6}>6 - Low Priority</option>
                <option value={7}>7 - Very Low Priority</option>
                <option value={8}>8 - Lowest Priority</option>
                <option value={9}>9 - Background</option>
                <option value={10}>10 - Archive</option>
              </select>
              <span className="text-sm text-gray-500">
                {priority <= 3 ? '⚡ Fast execution' : priority <= 6 ? '🔄 Normal execution' : '🐌 Slow execution'}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800">Approval Required</h4>
                <p className="text-sm text-orange-700 mt-1">
                  This campaign will be submitted for manager approval before execution. 
                  You'll receive a notification once it's reviewed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand-gold text-white rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit for Approval
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
