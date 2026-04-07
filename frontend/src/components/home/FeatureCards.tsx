"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, LineChart, Globe, Zap, Cpu, MousePointer2 } from "lucide-react";

const features = [
  {
    title: "Real-time Tracking",
    desc: "Monitor every interaction as it happens with micro-second latency.",
    icon: MousePointer2,
  },
  {
    title: "AI Analysis",
    desc: "Our neural engines process LinkedIn data to predict emerging trends.",
    icon: Cpu,
  },
  {
    title: "Smart Targeting",
    desc: "Identify high-value leads with automated behavioral scoring.",
    icon: Zap,
  },
  {
    title: "Global Reach",
    desc: "Scalable infrastructure that follows your users across the globe.",
    icon: Globe,
  },
  {
    title: "Deep Analytics",
    desc: "Customizable dashboards with drag-and-drop widget systems.",
    icon: LineChart,
  },
  {
    title: "Enterprise Security",
    desc: "ISO-certified data handling ensuring your intelligence stays private.",
    icon: ShieldCheck,
  },
];

export const FeatureCards = () => {
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
    <section className="py-24 px-6 max-w-7xl mx-auto bg-[#fdfbf7]">
      <div className="text-center mb-20">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-[#2d241c]">
          Precision <span className="text-brand-beige-dark italic uppercase tracking-tighter">Capabilities</span>
        </h2>
        <p className="text-[#2d241c]/50 max-w-xl mx-auto font-medium text-lg">
          Everything you need to dominate your market landscape with 
          data-driven confidence and absolute clarity.
        </p>
      </div>

      {/* Desktop Grid / Mobile Slider */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto pb-8 sm:pb-12 gap-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:pb-0 lg:px-0"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group glass card-hover p-8 rounded-[2rem] border-brand-beige/40 relative overflow-hidden bg-gradient-to-br from-white via-white/95 to-brand-beige/10 shadow-[0_10px_40px_rgba(217,187,155,0.05)] flex-shrink-0 w-[280px] sm:w-[320px] lg:w-auto snap-center"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-beige/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-beige/10 transition-colors" />
            
            <div className={`w-12 h-12 rounded-xl bg-[#2d241c] flex items-center justify-center mb-6 shadow-xl shadow-brand-beige-dark/20 group-hover:scale-105 transition-transform`}>
              <f.icon className="text-brand-beige" size={24} />
            </div>
            
            <h3 className="text-xl font-black text-[#2d241c] mb-3">
              {f.title}
            </h3>
            <p className="text-[#2d241c]/50 leading-relaxed font-bold text-[13px]">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Mobile Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4 lg:hidden">
        {features.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex 
                ? "w-8 bg-brand-beige-dark" 
                : "w-1.5 bg-brand-beige-dark/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
