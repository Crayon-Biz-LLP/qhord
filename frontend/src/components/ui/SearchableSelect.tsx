"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

type BaseProps = {
  options: SelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  // Rendered under the list, e.g. a "Create new" link.
  footer?: React.ReactNode;
  // Classes for the closed trigger button.
  className?: string;
};
type SingleProps = BaseProps & { multiple?: false; value: string; onChange: (value: string) => void };
type MultiProps = BaseProps & { multiple: true; value: string[]; onChange: (value: string[]) => void };

// Dropdown with a search box; single-select closes on pick, multi-select stays open and shows chips.
export function SearchableSelect(props: SingleProps | MultiProps) {
  const { options, placeholder = "Select…", emptyMessage = "No results", footer, className = "" } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected: string[] = props.multiple ? props.value : props.value ? [props.value] : [];
  const labelFor = (value: string) => options.find(o => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const pick = (value: string) => {
    if (props.multiple) {
      props.onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
    } else {
      props.onChange(value);
      setOpen(false);
    }
  };

  const removeChip = (value: string) => {
    if (props.multiple) props.onChange(selected.filter(v => v !== value));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}
        className={`w-full min-h-[42px] px-3 py-2 border border-[#1a1510]/[0.07] rounded-lg text-sm bg-white flex items-center justify-between gap-2 cursor-pointer ${open ? "border-brand-gold/50 ring-2 ring-brand-gold/10" : ""} ${className}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {selected.length === 0 ? (
            <span className="text-[#1a1510]/35">{placeholder}</span>
          ) : props.multiple ? (
            selected.map(v => (
              <span key={v} className="inline-flex items-center gap-1 max-w-full px-2 py-0.5 rounded-md bg-slate-100 text-[12px] font-medium text-[#1a1510]">
                <span className="truncate">{labelFor(v)}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeChip(v); }}
                  className="text-slate-400 hover:text-slate-700 shrink-0"
                  aria-label={`Remove ${labelFor(v)}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))
          ) : (
            <span className="truncate text-[#1a1510]">{labelFor(selected[0])}</span>
          )}
        </div>
        <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#1a1510]/10 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-brand-gold/40 bg-white">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full text-[13px] outline-none bg-transparent placeholder:text-[#1a1510]/30"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-slate-400">{emptyMessage}</div>
            ) : (
              filtered.map(o => {
                const isSelected = selected.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => pick(o.value)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-[13px] hover:bg-slate-50 ${isSelected ? "bg-slate-50 font-semibold" : ""}`}
                  >
                    <span className="truncate text-[#1a1510]">{o.label}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {o.hint && <span className="text-[11px] text-slate-400">{o.hint}</span>}
                      {isSelected && <Check size={14} className="text-brand-gold" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {footer && <div className="border-t border-slate-100">{footer}</div>}
        </div>
      )}
    </div>
  );
}
