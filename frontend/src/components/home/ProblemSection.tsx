"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle, XCircle, ShieldAlert, Cpu, Zap, Activity } from "lucide-react";

const painPoints = [
  { title: "Too many logins", desc: "Auth overhead across 12+ platforms" },
  { title: "Fragmented workflows", desc: "Disconnected data silos slowing GTM" },
  { title: "Difficult management", desc: "Lack of unified visibility for team leads" },
  { title: "Lost productivity", desc: "Hours wasted in manual tool switching" }
];

const tools = [
  { name: "Apollo", usage: "Prospecting", load: 85 },
  { name: "Clay", usage: "Enrichment", load: 62 },
  { name: "HeyReach", usage: "Outreach", load: 94 },
  { name: "Smartlead", usage: "Inboxes", load: 41 }
];

export const ProblemSection = ({ onManageNow }: { onManageNow?: () => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const index = Math.round(scrollLeft / (width - 40));
    setActiveIndex(index);
  };

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#fdfbf7]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-beige/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Animated Floating Noise Nodes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
          className="absolute hidden lg:block w-32 h-32 border border-brand-gold/10 rounded-full pointer-events-none"
          style={{
            left: `${15 + (i * 15)}%`,
            top: `${20 + (i * 10)}%`,
            borderStyle: 'dashed'
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">

          {/* <ShieldAlert size={16} className="text-brand-gold" /> */}
          {/* <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">System Alert: Operational Chaos</span> */}


          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-8 tracking-[-0.04em] leading-[0.9] text-[#1a1510]">
            Your GTM Stack is <br />
            <span className="text-brand-beige-dark italic">Siloed & Bleeding.</span>
          </h2>
          <p className="text-[#1a1510]/50 max-w-2xl mx-auto font-medium text-lg md:text-xl leading-relaxed">
            The modern GTM engine is broken. Fragmented subscriptions aren&apos;t just a cost—they&apos;re a <span className="text-[#1a1510] font-bold italic underline decoration-brand-gold/30">productivity tax</span> on your entire revenue team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* The Fragmentation Hub Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-brand-gold/10 rounded-[4rem] blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative p-6 md:p-8 rounded-[2rem] bg-[#0a0a0a] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">

              {/* HUD Brackets (Visual Interest) */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-brand-gold/30 rounded-tl-2xl m-3 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-brand-gold/30 rounded-br-2xl m-3 pointer-events-none" />


              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative group/icon">
                      <div className="absolute -inset-2 bg-brand-gold/20 rounded-xl blur-lg scale-0 group-hover/icon:scale-150 transition-transform duration-500" />
                      <div className="w-10 h-10 rounded-xl bg-[#1a1510] border border-white/10 flex items-center justify-center text-brand-gold shadow-2xl relative z-10">
                        <Cpu size={20} strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>

                      <h4 className="text-lg font-black text-white tracking-tight">Fragmentation Crisis</h4>
                    </div>
                  </div>

                  {/* Decorative ID Pulse */}
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex gap-1.5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="w-1.5 h-1.5 rounded-full bg-brand-gold/40"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {tools.map((tool, i) => (
                    <div key={i} className="relative group/tool">
                      <div className="flex justify-between items-end mb-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white/90 uppercase tracking-widest">{tool.name}</span>
                          <span className="text-[9px] font-mono text-white/30 uppercase mt-0.5">{tool.usage} PROTOCOL</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-brand-gold font-mono">{tool.load}</span>
                          <span className="text-[10px] text-white/20 font-mono">% LOAD</span>
                        </div>
                      </div>

                      {/* Modern Segmented Progress Bar */}
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${tool.load}%` }}
                          transition={{ delay: 0.5 + (i * 0.1), duration: 2, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-gradient-to-r from-brand-gold/60 to-brand-gold relative rounded-full"
                        >
                          {/* Glowing Leading Edge */}
                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-md" />
                          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white z-10" />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>


              </div>

              {/* Background HUD Accents */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full border-dashed" />
              </div>

            </div>
          </motion.div>

          {/* Symptom Cards Slider */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto pb-8 sm:pb-0 gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-2 pt-4"
          >
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white border border-brand-gold/10 hover:border-brand-gold transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(185,155,123,0.15)] flex-shrink-0 w-[300px] sm:w-auto h-[200px] flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1510] flex items-center justify-center text-brand-gold mb-4 group-hover:scale-110 transition-transform shadow-xl">
                    <Zap size={16} fill="currentColor" />
                  </div>
                  <h5 className="text-base font-black text-[#1a1510] uppercase tracking-tight mb-1">{point.title}</h5>
                </div>
                <p className="text-sm font-medium text-[#1a1510]/40 leading-relaxed font-serif italic relative z-10">
                  {point.desc}
                </p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="hidden lg:block col-span-1 lg:col-span-2 mt-6 p-8 bg-[#1a1510] rounded-[2rem] text-white overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-beige/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <p className="text-2xl font-black leading-tight tracking-tight relative z-10">
                GTM Control Tower reclaims your bandwidth by <span className="text-brand-beige-dark italic">centralizing</span> your entire growth stack into a single neural command interface.
              </p>
              <div className="mt-8 flex items-center gap-4 relative z-10">
                <div className="h-0.5 flex-1 bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">The Integration Cure</span>
              </div>
            </motion.div>
          </div>

          {/* Mobile Pagination Dots for Pain Points */}
          <div className="flex justify-center gap-2 mt-2 mb-8 sm:hidden">
            {painPoints.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex
                  ? "w-6 bg-brand-gold"
                  : "w-1 bg-brand-gold/20"
                  }`}
              />
            ))}
          </div>

          {/* Mobile Full-width Accent (Moving the col-span-2 outside the slider for better UX) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="lg:hidden mt-10 p-6 sm:p-8 bg-[#1a1510] rounded-[2rem] text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-beige/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <p className="text-xl sm:text-2xl font-black leading-tight tracking-tight relative z-10">
              GTM Control Tower reclaims your bandwidth by <span className="text-brand-beige-dark italic">centralizing</span> your entire growth stack.
            </p>
            <div className="mt-8 flex items-center gap-4 relative z-10">
              <div className="h-0.5 flex-1 bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">The Integration Cure</span>
            </div>
          </motion.div>

          {/* Action CTA for Solving Fragmentation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-2 flex flex-col items-center mt-16 mb-8 text-center"
          >
            <button
              onClick={onManageNow}
              className="group relative flex items-center gap-6 px-10 py-4 bg-[#1a1510] rounded-[2rem] text-white font-black text-base hover:scale-[1.05] transition-all duration-500 shadow-[0_40px_80px_-20px_rgba(26,21,16,0.5)] overflow-hidden"
            >
              <span className="relative z-10 tracking-tight uppercase">Manage Now</span>
              <div className="w-9 h-9 rounded-full bg-brand-gold text-[#1a1510] flex items-center justify-center relative z-10 group-hover:rotate-[360deg] transition-transform duration-700">
                <Zap size={18} fill="currentColor" />
              </div>

              {/* Shimmer Effect */}
              <motion.div
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[45deg]"
              />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
