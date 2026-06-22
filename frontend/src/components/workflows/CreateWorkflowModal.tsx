"use client";

import React, { useState } from "react";
import { X, Workflow, Sparkles } from "lucide-react";
import { api } from "../../lib/api";

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateWorkflowModal({ isOpen, onClose, onSuccess }: CreateWorkflowModalProps) {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const createWorkflow = async () => {
    if (!prompt.trim()) return;
    setIsCreating(true);
    setError("");

    try {
      const response = await api.post("/workflows", {
        prompt: prompt.trim(),
        name: name.trim() || undefined
      });

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to create workflow");
      }

      setPrompt("");
      setName("");
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Workflow className="w-6 h-6 text-brand-gold" />
            <h2 className="text-xl font-bold">Create Workflow</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Workflow Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: SaaS Founder Outreach v1"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Describe Workflow in natural language</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Example: Build a multi-step workflow to source CTO leads, enrich emails, then send 3-step follow-up sequence'
              className="w-full h-28 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              disabled={isCreating}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={createWorkflow}
            disabled={!prompt.trim() || isCreating}
            className="w-full bg-brand-gold text-white py-3 rounded-lg font-medium hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isCreating ? "Creating workflow..." : "Create Workflow Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

