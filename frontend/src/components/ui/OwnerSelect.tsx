"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ADD_CUSTOM = "__custom__";

interface OwnerSelectProps {
  value: string;
  onChange: (owner: string) => void;
  className?: string;
  placeholder?: string;
}

// Owner picker shared across forms: workspace teammates plus the operator's saved custom
// owners (client_owners). "+ Add custom owner…" saves a new name so it's listed everywhere
// next time, not just on the form it was typed into.
export function OwnerSelect({ value, onChange, className = "", placeholder = "Assign owner..." }: OwnerSelectProps) {
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [customOwners, setCustomOwners] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    api.get("/settings")
      .then(res => setTeamMembers((res.data?.team || []).map((m: any) => m.name).filter(Boolean)))
      .catch(() => setTeamMembers([]));
    api.get("/owners")
      .then(res => setCustomOwners((res.data?.owners || []).map((o: any) => o.name).filter(Boolean)))
      .catch(() => setCustomOwners([]));
  }, []);

  // The current value is always an option so a saved record whose owner isn't in either list
  // (e.g. legacy data) still displays instead of falling back to the placeholder.
  const options = Array.from(new Set<string>([...teamMembers, ...customOwners, ...(value ? [value] : [])]));

  const cancelAdd = () => {
    setIsAdding(false);
    setDraft("");
  };

  const confirmAdd = async () => {
    const name = draft.trim();
    if (!name) return;
    try {
      await api.post("/owners", { name });
      setCustomOwners(prev => (prev.includes(name) ? prev : [...prev, name]));
    } catch (err) {
      console.error("Save owner error", err);
      toast.error("Couldn't save this owner to your list — it will still be used here");
    }
    onChange(name);
    cancelAdd();
  };

  if (isAdding) {
    return (
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); confirmAdd(); }
            if (e.key === "Escape") cancelAdd();
          }}
          placeholder="Owner name"
          className={`${className} flex-1 min-w-0`}
        />
        <button
          type="button"
          onClick={confirmAdd}
          disabled={!draft.trim()}
          className="px-3 rounded-lg bg-[#1a1510] text-brand-gold text-[12px] font-semibold disabled:opacity-40 transition-opacity"
        >
          Add
        </button>
        <button
          type="button"
          onClick={cancelAdd}
          className="px-3 rounded-lg text-[12px] font-semibold text-[#1a1510]/50 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === ADD_CUSTOM) {
            setIsAdding(true);
            return;
          }
          onChange(e.target.value);
        }}
        className={`${className} appearance-none pr-10 cursor-pointer ${value ? "" : "text-[#1a1510]/30"}`}
      >
        <option value="">{placeholder}</option>
        {options.map(name => (
          <option key={name} value={name} className="text-[#1a1510]">{name}</option>
        ))}
        <option value={ADD_CUSTOM} className="text-[#1a1510]">+ Add custom owner…</option>
      </select>
      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/40 pointer-events-none" />
    </div>
  );
}
