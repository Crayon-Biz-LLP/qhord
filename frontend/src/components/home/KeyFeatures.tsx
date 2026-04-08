"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users2, Repeat, ShieldCheck, Eye, ArrowUpRight } from "lucide-react";

const features = [
  {
    title: "Multi-Client Workspace",
    desc: "Manage multiple clients and their GTM stacks in one centralized dashboard.",
    icon: Users2,
    size: "col-span-1",
    delay: 0.1
  },
  {
    title: "Unified Workflow",
    desc: "Move leads seamlessly between Apollo, Clay, HeyReach & Smartlead. No exports, no manual work.",
    icon: Repeat,
    size: "md:col-span-2",
    delay: 0.2
  },
  {
    title: "Single Login System",
    desc: "Stop switching between tools and accounts. Access everything from one secure login.",
    icon: ShieldCheck,
    size: "col-span-1",
    delay: 0.3
  },
  {
    title: "Campaign Visibility",
    desc: "Track outreach across platforms in one view. Monitor campaigns, responses & performance.",
    icon: Eye,
    size: "col-span-1",
  }
];

export const KeyFeatures = () => {
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
    <section className="py-24 px-6 relative bg-[#fdfbf7] overflow-hidden">
      {/* HUD Background Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#d9bc9b_0.5px,transparent_0.5px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(185,155,123,0.05)_0%,transparent_50% )] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-[1px] bg-brand-gold/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold">Infrastructure Core</span>
            </motion.div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1a1510] leading-[0.95]">
              Everything Your <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-brand-gold italic">GTM Team Needs</span>
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  className="absolute bottom-2 left-0 h-4 bg-brand-gold/5 -z-10"
                />
              </span>
            </h2>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 max-w-xs"
          >
            <p className="text-[#1a1510]/50 font-medium text-lg leading-snug">
              Designed by RevOps professionals to eliminate friction and maximize operational velocity.
            </p>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-gold/20" />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bento Grid / Mobile Slider */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:grid md:grid-cols-6 md:grid-rows-2 md:gap-6 md:overflow-visible md:pb-0 md:px-0"
        >
          {features.map((feat, i) => {
            const gridClasses = i === 1 
              ? "md:col-span-4 md:row-span-1" 
              : i === 0 
                ? "md:col-span-2 md:row-span-1" 
                : i === 3
                  ? "md:col-span-4 md:row-span-1" 
                  : "md:col-span-2 md:row-span-1";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative min-h-[260px] rounded-[3.5rem] bg-white/40 backdrop-blur-3xl border border-white/50 shadow-[0_40px_80px_-20px_rgba(185,155,123,0.1)] transition-all duration-700 flex-shrink-0 w-[85vw] sm:w-[450px] md:w-auto snap-center flex flex-col justify-between overflow-hidden ${gridClasses}`}
              >

                {/* 2. BACKGROUND DATA GRID */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700">
                  <div className="absolute inset-0 bg-[radial-gradient(#1a1510_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>

                {/* 3. CENTERPIECE: Volumetric Icon */}
                <div className="relative z-10 pt-16 px-10">
                  <div className="relative w-16 h-16 mb-8">
                     {/* 3D Base Shadow */}
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1a1510]/10 rounded-full blur-[4px] group-hover:scale-x-150 transition-transform duration-700" />
                     
                     <motion.div 
                        whileHover={{ y: -8 }}
                        className="relative w-full h-full rounded-full bg-white shadow-xl flex items-center justify-center text-[#1a1510] border border-white group-hover:bg-[#1a1510] group-hover:text-white transition-all duration-700 overflow-hidden"
                     >
                        <feat.icon size={24} strokeWidth={1} />
                        {/* Shimmering Glint */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     </motion.div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-[#1a1510] tracking-tighter leading-none group-hover:text-brand-gold transition-colors duration-500">
                      {feat.title}
                    </h3>
                    <p className="text-[#1a1510]/50 text-base font-medium leading-relaxed max-w-[320px]">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                {/* 4. FOOTER: Technical Command */}
                <div className="relative z-10 px-10 pb-10 flex items-center justify-end">
                  <button className="relative w-12 h-12 rounded-2xl bg-white border border-[#1a1510]/5 flex items-center justify-center text-[#1a1510] shadow-sm hover:bg-[#1a1510] hover:text-white transition-all duration-500 group/btn">
                    <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </div>

                {/* 5. SIDE ACCENT BAR */}
                <div className="absolute top-0 right-0 w-1.5 h-0 bg-brand-gold group-hover:h-full transition-all duration-1000" />
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex justify-center gap-3 mt-12 md:hidden">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: i * (scrollRef.current.offsetWidth - 40), behavior: 'smooth' });
              }}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeIndex 
                  ? "w-10 bg-brand-gold shadow-[0_0_10px_rgba(185,155,123,0.5)]" 
                  : "w-2 bg-brand-gold/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

