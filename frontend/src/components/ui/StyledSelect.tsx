"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

export interface StyledSelectOption {
  value: string;
  label: string;
  // Rendered before the label, both in the trigger and the list — a colored dot for
  // Priority, a tool logo, etc. Purely decorative, no semantics attached to it here.
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface StyledSelectProps {
  options: StyledSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // Classes for the closed trigger — match surrounding field sizing (h-10, h-11, ...).
  className?: string;
}

// Drop-in replacement for a native <select> with the same click/keyboard-select behavior,
// but a custom animated popup instead of the browser's own (unstyleable, non-animated) list.
export function StyledSelect({ options, value, onChange, placeholder = "Select…", disabled, className = "" }: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, options.findIndex(o => o.value === value)));
  }, [open, options, value]);

  const pick = (opt: StyledSelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) pick(opt);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={onKeyDown}
        className={`w-full flex items-center justify-between gap-2 text-left text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          open ? "border-brand-gold/50 ring-2 ring-brand-gold/10" : "border-[#1a1510]/[0.07]"
        } ${className}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected?.icon}
          <span className={`truncate ${selected ? "text-[#1a1510]" : "text-[#1a1510]/35"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown size={15} className={`text-[#1a1510]/40 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#1a1510]/10 rounded-xl shadow-[0_12px_32px_-8px_rgba(26,21,16,0.18)] overflow-hidden py-1.5 max-h-64 overflow-y-auto origin-top"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => pick(opt)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    i === activeIndex ? "bg-[#faf9f8]" : ""
                  } ${isSelected ? "font-semibold text-[#1a1510]" : "text-[#1a1510]/80"}`}
                >
                  <span className="flex items-center gap-2 min-w-0 truncate">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {isSelected && <Check size={14} className="text-brand-gold shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
