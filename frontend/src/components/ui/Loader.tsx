"use client";

import React from "react";

/**
 * Shared brand loader — a 12-bar fading ring spinner.
 * Themed with the landing-page gold palette via `text-brand-gold` (currentColor).
 */
export function Loader({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`qhord-spinner text-brand-gold ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          style={{
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${(i * 1.1) / 12 - 1.1}s`,
          }}
        />
      ))}
    </span>
  );
}

/**
 * Full-area centered loader with an optional label.
 * Use inside page/content regions while data loads.
 */
export function PageLoader({
  label = "Loading",
  size = 44,
  className = "",
}: {
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <Loader size={size} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#1a1510]/30">
        {label}
      </p>
    </div>
  );
}
