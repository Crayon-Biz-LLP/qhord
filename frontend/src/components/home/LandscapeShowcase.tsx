"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Activity, Shield, ArrowRight, Layers, Globe } from "lucide-react";

const landscapeFeatures = [
  {
    title: "Centralized Intelligence",
    desc: "Every data point from Apollo and Clay unified into one stream.",
    icon: Cpu,
    color: "brand-gold"
  },
  {
    title: "Global Grid Control",
    desc: "Manage LinkedIn and Email outreach from a single neural map.",
    icon: Globe,
    color: "brand-beige-dark"
  },
  {
    title: "Sync Fidelity",
    desc: "99.9% uptime across all tool protocols and integrations.",
    icon: Zap,
    color: "brand-gold"
  }
];

export const LandscapeShowcase = () => {
  return (
    <section className="py-24 px-4 sm:px-6 relative bg-[#fdfbf7] overflow-hidden">
      {/* Background Decorative HUD */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1a1510_1.5px,transparent_1.5px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-brand-gold/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold">Experience Landscape</span>
           </div>
           <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#1a1510] tracking-tighter leading-none mb-4">
              The Command <br/>
              <span className="text-brand-gold italic">Landscape.</span>
           </h2>
        </div>

        {/* Cinematic Wide Landscape Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group rounded-[3.5rem] bg-[#0a0a0a] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] border border-white/10 h-[500px] md:h-[600px] flex items-center"
        >
          {/* Internal HUD Accents */}
          <div className="absolute inset-x-0 top-0 h-16 border-b border-white/5 bg-white/[0.02] flex items-center px-8 justify-between z-20">
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400/20" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/20" />
                <div className="w-2 h-2 rounded-full bg-green-400/20" />
             </div>
             <span className="text-[9px] font-black tracking-[0.4em] text-white/20 uppercase font-mono">GRID_VIEW_PROTOCOL_v4.2</span>
             <div className="w-4 h-4 rounded bg-brand-gold/10" />
          </div>

          <div className="absolute inset-0 opacity-20 pointer-events-none">
             {/* Animated Perspective Grid */}
             <div className="absolute inset-0 [transform:perspective(1000px)_rotateX(60deg)_scale(2)] bg-[linear-gradient(rgba(217,187,155,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(217,187,155,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
          </div>

          {/* Left Side Content - Pushed back to create landscape feel */}
          <div className="relative z-10 w-full md:w-1/2 p-12 md:p-20 space-y-12">
             <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/30 bg-brand-gold/5">
                   <Activity size={12} className="text-brand-gold" />
                   <span className="text-[9px] font-black uppercase text-brand-gold">Operational State</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                   Unify your <span className="text-brand-gold italic">Global Reach</span> in one pane.
                </h3>
                <p className="text-white/40 font-medium text-lg leading-relaxed italic font-serif">
                   Stop the friction. Start managing. The landscape of outbound growth has finally been centralized.
                </p>
             </div>

             <div className="flex items-center gap-8">
                <button className="px-8 py-4 bg-brand-gold rounded-2xl text-[#1a1510] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-gold/10">
                   Enter Console
                </button>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                      <Shield size={16} />
                   </div>
                   <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Secure Tunnel</span>
                </div>
             </div>
          </div>

          {/* Right Side Visual - Landscape Depth */}
          <div className="hidden md:flex absolute right-[-5%] top-1/2 -translate-y-1/2 w-3/5 h-[120%] z-0 pointer-events-none">
             <div className="relative w-full h-full [perspective:2000px]">
                <motion.div 
                  initial={{ rotateY: -30, rotateX: 10 }}
                  animate={{ 
                    rotateY: -25,
                    rotateX: 5,
                    y: [0, -20, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/20 shadow-[0_100px_200px_-50px_rgba(185,155,123,0.3)] flex items-center justify-center p-8"
                >
                   {/* HUD Elements inside the floating dashboard */}
                   <div className="w-full h-full relative border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                      <Zap size={100} className="text-brand-gold opacity-10 animate-pulse" fill="currentColor" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/10 via-transparent to-white/5" />
                      
                      {/* Random Grid Data Lines */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.1, 0.4, 0.1] }}
                          transition={{ duration: 2 + i, repeat: Infinity }}
                          className="absolute w-[200%] h-px bg-brand-gold/20"
                          style={{ top: `${20 * i}%`, left: "-50%", rotate: "15deg" }}
                        />
                      ))}
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>

        {/* Landscape Footer - Horizontal Features List */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
           {landscapeFeatures.map((feat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 * i }}
               className="flex items-center gap-6 group"
             >
                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-brand-gold/20 shadow-xl flex items-center justify-center text-brand-gold group-hover:bg-[#1a1510] group-hover:text-white transition-all duration-500">
                   <feat.icon size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="text-lg font-black text-[#1a1510] uppercase tracking-tight mb-1">{feat.title}</h4>
                   <p className="text-sm font-medium text-[#1a1510]/40 leading-snug">{feat.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};
