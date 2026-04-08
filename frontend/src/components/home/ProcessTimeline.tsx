"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Link2, Search, BarChart4, Rocket } from "lucide-react";

const steps = [
  {
    step: "Step 1:",
    action: "Connect",
    desc: "Sync your enterprise data sources and tracking endpoints in seconds.",
    icon: Link2,
  },
  {
    step: "Step 2:",
    action: "Track",
    desc: "Deploy micro-trackers that capture engagement and behavior patterns.",
    icon: Search,
  },
  {
    step: "Step 3:",
    action: "Analyze",
    desc: "Our high-performance engines distill raw data into actionable relationship insights.",
    icon: BarChart4,
  },
  {
    step: "Step 4:",
    action: "Scale",
    desc: "Execute high-conversion campaigns based on real-time intelligence.",
    icon: Rocket,
  }
];

export const ProcessTimeline = () => {
  return (
    <section className="py-16 px-6 relative overflow-hidden bg-[#fdfbf7]">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-4"
          >
            <div className="w-1 h-1 rounded-full bg-brand-gold" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold">Execution Pipeline</span>
          </motion.div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1a1510] tracking-tight leading-none mb-4">
            The Command <br />
            <span className="text-brand-gold italic">Flow.</span>
          </h2>
          <p className="text-[#1a1510]/40 text-base font-medium max-w-lg mx-auto leading-relaxed font-serif italic">
            A precision-engineered workflow designed to transform fragmented signals into a high-velocity growth engine.
          </p>
        </div>

        <div className="space-y-12 relative">
          {/* Subtle Vertical Progress indicator */}
          <div className="absolute left-[27px] md:left-[27px] top-10 bottom-10 w-px bg-[#1a1510]/5" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="relative flex items-center md:items-start gap-8 group"
            >
              {/* Reference-style Black Icon Box */}
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#1a1510] flex items-center justify-center shrink-0 shadow-[0_15px_30px_rgba(26,21,16,0.1)] group-hover:bg-brand-gold group-hover:shadow-[0_20px_40px_rgba(185,155,123,0.3)] transition-all duration-500">
                <step.icon className="text-white w-6 h-6 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                
                {/* Decorative Number for hover */}
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-[#1a1510]/5 flex items-center justify-center text-[9px] font-black text-[#1a1510] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1">
                  0{i + 1}
                </span>
              </div>

              <div className="pt-1">
                <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">
                   <span className="text-[#1a1510]">{step.step}</span>{" "}
                   <span className="text-brand-gold">{step.action}</span>
                </h3>
                <p className="text-[#1a1510]/40 text-base font-medium leading-relaxed max-w-xl group-hover:text-[#1a1510]/60 transition-colors">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decorative Accent */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-brand-gold/5 blur-[120px] pointer-events-none" />
    </section>
  );
};
