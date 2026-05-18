"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Building2, Settings2, Target, CheckCircle, Zap, ArrowUpRight } from "lucide-react";

export const MultiSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef}>
      {/* Built for Modern GTM Teams - Expanding Pillars UI (Light Theme) */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/5 mb-8"
            >
              <div className="w-1 h-1 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-gold">Architecture Focus</span>
            </motion.div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1a1510] tracking-tighter leading-[0.9] mb-8">
              Built for <br />
              <span className="text-brand-gold italic">Modern Teams.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-[#1a1510]/50 text-xl font-medium leading-relaxed">
              Tailored workspaces engineered for the three pillars of global GTM delivery and operational excellence.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[350px] gap-6">
            {[
              { 
                id: "agencies",
                title: "GTM Agencies", 
                desc: "Scale 100+ client stacks without friction. High-density infrastructure for global growth.",
                icon: Building2,
                tag: "Scalability",
              },
              { 
                id: "revops",
                title: "RevOps Units", 
                desc: "The central nervous system for outbound scale. Full visibility into every protocol.",
                icon: Settings2,
                tag: "Operations",
              },
              { 
                id: "sales",
                title: "Sales Divisions", 
                desc: "Zero-friction pipeline generation for hunters. Data-led execution at peak velocity.",
                icon: Target,
                tag: "Execution",
              }
            ].map((pillar, i) => (
              <motion.div
                key={pillar.id}
                whileHover={{ flexGrow: 3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex-1 flex flex-col p-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 transition-all duration-700 hover:shadow-[0_60px_100px_-30px_rgba(185,155,123,0.3)] hover:border-brand-gold/40 cursor-pointer overflow-hidden"
              >
                {/* Top Ambient Gold Glow */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                
                {/* Header: Icon & Tag */}
                <div className="flex justify-between items-start mb-6 relative z-10 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-[#1a1510] transition-all duration-700 shadow-2xl shrink-0">
                    <pillar.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 py-1 px-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shrink-0">
                    {pillar.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-2 group-hover:mb-4 transition-all duration-500">
                    <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-brand-gold transition-colors duration-500 whitespace-nowrap">
                      {pillar.title}
                    </h3>
                    <ArrowUpRight size={20} className="text-white/20 group-hover:text-brand-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
                  </div>
                  
                  {/* Animated Detail Reveal on Hover (Accordion Style) */}
                  <div className="max-h-0 group-hover:max-h-[250px] opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-700 ease-[0.16,1,0.3,1]">
                    <div className="w-10 h-[1px] bg-brand-gold/30 my-4" />
                    <p className="text-white/50 text-sm font-medium leading-relaxed font-serif italic mb-4 max-w-sm">
                      {pillar.desc}
                    </p>
                    


                    {/* Action CTA */}
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
                        Enter Suite
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-brand-gold group-hover:text-[#1a1510] transition-all duration-500">
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Accent Line (Animated) */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-gold group-hover:w-full transition-all duration-1000" />
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Teams Use GTM Control Tower - Strategic List UI */}
      <section className="py-16 px-4 sm:px-6 relative overflow-hidden bg-[#fdfbf7] border-t border-[#1a1510]/5">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="h-[2px] w-12 bg-brand-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">The Strategic Edge</span>
            </motion.div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1a1510] leading-[0.95]">
              Why Teams Use <br />
              <span className="text-brand-gold italic">GTM Control Tower</span>
            </h2>
          </div>

          <div className="relative">
            {/* Animated Vertical Path Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-[#1a1510]/5 md:-translate-x-1/2" />
            <motion.div 
              style={{ scaleY, originY: 0 }}
              className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-gold md:-translate-x-1/2 z-10"
            />

            <div className="space-y-12 relative">
              {[
                { 
                  title: "Save hours switching between tools", 
                  desc: "Eliminate the context-switching tax that drains your team's mental energy.",
                  icon: Settings2 
                },
                { 
                  title: "Run workflows faster", 
                  desc: "A single command interface for your entire outbound engine, designed for speed.",
                  icon: Zap 
                },
                { 
                  title: "Manage multiple clients easily", 
                  desc: "Scale your agency operations without increasing overhead or account switching.",
                  icon: Building2 
                },
                { 
                  title: "Centralize GTM operations", 
                  desc: "One source of truth for all your playbooks, data, and performance metrics.",
                  icon: CheckCircle 
                },
                { 
                  title: "Improve campaign efficiency", 
                  desc: "Leverage cross-tool insights to optimize every touchpoint in real-time.",
                  icon: Target 
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-12 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* The Connecting Node */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-white border-2 border-brand-gold md:-translate-x-1/2 z-20 shadow-[0_0_15px_rgba(185,155,123,0.3)]" 
                  />

                  {/* Content Side */}
                  <div className={`flex-1 pl-12 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16"}`}>
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold mb-4 ${
                      i % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1a1510] leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[#1a1510]/50 text-base font-medium max-w-md mx-auto md:mx-0 font-serif italic leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Visual Side (Spacer for MD) */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </section>
    </div>
  );
};
