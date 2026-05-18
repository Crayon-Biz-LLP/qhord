"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, MessageSquare, Mail, Layers, Zap } from "lucide-react";

const capabilities = [
  { 
    text: "Smart Prospecting", 
    subtitle: "Intelligence Layer",
    description: "Identify high-intent accounts with precision-guided AI. Our system processes millions of data points to find your next best-fit customer.",
    icon: Search, 
    color: "text-blue-400" 
  },
  { 
    text: "Data Enrichment", 
    subtitle: "Precision Context",
    description: "Go beyond basic contact info. Enrich your CRM with real-time intent signals, hiring trends, and technological footprint in seconds.",
    icon: Database, 
    color: "text-brand-gold" 
  },
  { 
    text: "LinkedIn Fusion", 
    subtitle: "Social Velocity",
    description: "Automate your LinkedIn outreach with a human touch. Seamlessly sync conversations and activity across your entire GTM workspace.",
    icon: MessageSquare, 
    color: "text-brand-gold" 
  },
  { 
    text: "Email Campaigns", 
    subtitle: "Infinite Outreach",
    description: "Execute cold email at scale with 100% deliverability. Unified inbox management ensures you never miss a high-priority reply.",
    icon: Mail, 
    color: "text-brand-gold" 
  },
  { 
    text: "Multi-Client Hub", 
    subtitle: "Command Center",
    description: "Manage multiple agencies or departments from a single glass pane. Distributed architecture for high-growth operational mastery.",
    icon: Layers, 
    color: "text-emerald-400" 
  }
];

export const SolutionSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % capabilities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[#fdfbf7]">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(217,187,155,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-10 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[600px_1fr] gap-12 lg:gap-24 items-center">

          {/* Vertical Cinematic Ticker - Left Side */}
          <div className="relative h-auto order-2 lg:order-1 flex flex-col justify-center py-8 lg:py-0">
            {/* Index Display - Visible from MD up */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4">
              {capabilities.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: i === index ? 32 : 8,
                    backgroundColor: i === index ? "#B99B7B" : "rgba(185,155,123,0.15)"
                  }}
                  className="w-1 rounded-full transition-colors duration-500"
                />
              ))}
            </div>

            <div className="md:pl-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <span className="text-[#1a1510] font-bold text-base sm:text-2xl lg:text-3xl xl:text-4xl uppercase tracking-wide sm:tracking-[0.1em] lg:tracking-[0.15em] block text-center lg:text-left leading-tight lg:leading-[1.1]">
                    {capabilities[index].text}
                  </span>

                  {/* Subtle Label */}
                  <div className="mt-4 flex items-center justify-center lg:justify-start gap-4">
                    <div className="h-[2px] w-8 bg-brand-gold/30" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-brand-gold/60 italic">Module {index + 1}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Solution Content - Right Side */}
          <div className="order-1 lg:order-2 text-center lg:text-left h-full flex flex-col justify-center">
            {/* Dynamic Subtitle Badge */}
            <div className="h-8 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`sub-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center lg:justify-start gap-4"
                >
                  <div className="h-[2px] w-12 bg-brand-gold" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-brand-gold">
                    {capabilities[index].subtitle}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* STATIC HEADING (Keep Default) */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-10 tracking-tight leading-[0.9] text-[#1a1510]">
              Built for <br />
              <span className="text-brand-gold italic">Operational Precision.</span>
            </h2>
            
            {/* Dynamic Description Content */}
            <div className="min-h-[160px] sm:min-h-[120px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`desc-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-[#1a1510]/60 text-base sm:text-lg font-medium leading-[1.6] max-w-xl mx-auto lg:mx-0">
                    {capabilities[index].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
