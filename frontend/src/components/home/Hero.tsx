"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from "framer-motion";
import { ArrowRight, Globe, Database, Target, Cpu, Share2, Activity, Shield, Zap, ChevronDown } from "lucide-react";
import { PointCloudBuilding } from "./PointCloudBuilding";

const VitalItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-brand-beige/10">
    <span className="text-[9px] font-black text-[#1a1510]/30 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-black text-[#1a1510]">{value}</span>
  </div>
);

const LogLine = ({ status, msg, time }: any) => (
  <div className="flex gap-3 text-[9px] whitespace-nowrap overflow-hidden">
    <span className={`font-bold ${status === 'OK' ? 'text-green-500' : 'text-brand-beige'}`}>{status}</span>
    <span className="text-white/40 flex-1 truncate">{msg}</span>
    <span className="text-white/10">{time}</span>
  </div>
);


const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest: number) => {
    if (value % 1 !== 0) return latest.toFixed(1);
    return Math.round(latest).toString();
  });

  useEffect(() => {
    const animation = animate(count, value, { duration, ease: "easeOut", delay: 1.5 });
    return animation.stop;
  }, [count, value, duration]);

  return <motion.span>{rounded}</motion.span>;
};

const StatBlock = ({ label, value, suffix, isSerif }: { label: string, value: number, suffix: string, isSerif?: boolean }) => (
  <div className="flex flex-col items-center md:items-start text-center md:text-left">
    <span className={`text-[10px] font-black uppercase tracking-widest mb-2 text-brand-beige-dark/60`}>{label}</span>
    <span className={`text-3xl sm:text-4xl font-black text-[#1a1510] tracking-tighter ${isSerif ? 'font-serif italic font-light' : ''}`}>
      <Counter value={value} />
      {suffix}
    </span>
  </div>
);

export const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[110vh] flex flex-col items-center justify-start bg-[#fdfbf7] overflow-hidden pt-32 pb-16 px-4 sm:px-6">

      {/* 1. Cinematic Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Radial Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1500px] h-[1500px] bg-[radial-gradient(circle,rgba(217,187,155,0.3)_0%,transparent_70%)]"
        />

        {/* Modern Dot Grid with Perspective - Ends before globe */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_30%,transparent_50%)]">
          <motion.div 
            animate={{ 
              backgroundPosition: ["0px 0px", "24px 24px"],
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 border-t border-brand-beige/20 bg-[radial-gradient(#d9bc9b_0.5px,transparent_0.5px)] [background-size:24px_24px] [transform:perspective(1000px)_rotateX(60deg)_scale(2.5)] -top-1/2" 
          />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center">

        {/* 3. High-Impact Typography - The "Aura" Headline */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black text-[#1a1510] leading-[0.85] tracking-[-0.04em] mb-10">
              <span className="relative inline-block overflow-hidden py-1 px-4 bg-brand-beige-dark/10 rounded-2xl border border-brand-beige/20 mr-2 sm:mr-4">
                <span className="inline-block translate-y-0 text-brand-beige-dark">One</span>
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[45deg]"
                />
              </span>
              <span className="font-extrabold">Dashboard</span> <br />
              <span className="block text-[0.35em] uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light text-[#1a1510]/30 my-4 sm:my-6">to run your entire</span>
              <span className="relative inline-block overflow-hidden py-1 px-4 bg-[#1a1510] rounded-2xl sm:rounded-3xl mr-2 sm:mr-4">
                <span className="inline-block translate-y-0 text-white uppercase tracking-tighter">Gtm</span>
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.25 }}
                  className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg]"
                />
              </span>
              <span className="font-black text-brand-beige-dark drop-shadow-sm">Stack</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-[#1a1510]/50 max-w-3xl mx-auto font-medium leading-relaxed px-4"
          >
            <span className="font-bold text-[#1a1510]">GTM Control Tower</span> brings your prospecting, enrichment, and outreach tools together in a single command center.
            Connect <span className="font-bold text-[#1a1510]">Apollo</span>, <span className="font-bold text-[#1a1510]">Clay</span>, <span className="font-bold text-[#1a1510]">HeyReach</span>, <span className="font-bold text-[#1a1510]">Smartlead</span> and several more to manage all GTM workflows without switching accounts.
          </motion.p>
        </div>

        {/* 3.5 Bottom Scroll Indicator - Moved above globe */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-12 flex flex-col items-center gap-2 opacity-20 pointer-events-none"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#1a1510]">Explore Hub</span>
          <ChevronDown size={16} />
        </motion.div>

        {/* 4. THE 3D CENTERPIECE - "The Projection Hub" */}
        <div className="relative w-full max-w-7xl min-h-[400px] lg:h-[600px] flex flex-col lg:flex-row items-center justify-center lg:justify-between perspective-[2000px] px-4 md:px-12 gap-12 lg:gap-0 mt-12 lg:mt-0">

          {/* Left: System Vitality Module */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-6 w-80 z-20"
          >
            <div className="relative p-8 rounded-[3.5rem] bg-white/20 backdrop-blur-3xl border border-white/40 shadow-2xl overflow-hidden group">

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-beige-dark/40">Vitality Hub</span>
                  <div className="w-8 h-8 rounded-full border border-brand-beige/20 flex items-center justify-center">
                    <Activity size={12} className="text-brand-beige-dark animate-pulse" />
                  </div>
                </div>

                {/* Segmented Circular Gauge */}
                <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(45,36,28,0.05)" strokeWidth="5" strokeDasharray="4 4" />
                    <motion.circle
                      cx="56" cy="56" r="50" fill="none" stroke="#2d241c" strokeWidth="5"
                      strokeDasharray="4 2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.85 }}
                      transition={{ duration: 2, delay: 1.5 }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-[#1a1510]">88<span className="text-xs">%</span></span>
                    <span className="text-[7px] font-black uppercase text-brand-beige-dark/40 tracking-widest">Health</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <VitalItem label="Stability" value="99.2%" />
                  <VitalItem label="Logic" value="Optimal" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Central Visual: Globe + Rings + Projections */}
          <motion.div
            style={{
              x: mousePos.x,
              y: mousePos.y,
              rotateX: -mousePos.y * 0.1,
              rotateY: mousePos.x * 0.1
            }}
            className="relative z-20 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] shrink-0 flex items-center justify-center"
          >
            {/* 1. LAYER: Atmospheric Glows & Rings */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Massive Outer Halo */}
              <div className="absolute w-[150%] h-[150%] rounded-full bg-[radial-gradient(circle,rgba(185,155,123,0.08)_0%,transparent_70%)] animate-pulse" />

              {/* Orbiting HUD Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute w-[110%] h-[110%] rounded-full border border-dashed border-brand-gold/10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute w-[120%] h-[120%] rounded-full border border-brand-gold/5 opacity-50"
              />
            </div>

            {/* 2. LAYER: The Glass Command Orb */}
            <div className="relative w-full h-full group">
              {/* Outer Shell Glass */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-full border border-white/80 shadow-[0_50px_100px_rgba(45,36,28,0.1),inset_0_0_80px_rgba(255,255,255,0.6)] overflow-hidden flex items-center justify-center transition-all duration-700 group-hover:shadow-[0_80px_150px_rgba(185,155,123,0.3)]">

                {/* Internal HUD Elements */}
                <div className="absolute inset-4 rounded-full border border-brand-gold/5 opacity-20" />
                <div className="absolute inset-8 rounded-full border border-brand-gold/5 opacity-10" />

                {/* Dynamic Gradient Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/10 via-transparent to-brand-beige/20 mix-blend-overlay" />

                {/* Center 3D Globe Projection */}
                <div className="w-[110%] h-[110%] relative z-0 opacity-90">
                  <PointCloudBuilding />
                </div>

              </div>

              {/* 3. LAYER: Distributed Orbiting Ecosystem */}
              <div className="absolute inset-0 z-30 pointer-events-none">
              </div>
            </div>
          </motion.div>

          {/* Right: Nexus Deployment Module */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-4 w-80 z-20"
          >
            <div className="relative p-8 rounded-[3.5rem] bg-[#1a1510]/95 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[380px]">
              {/* Terminal Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/40" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                  <div className="w-2 h-2 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[8px] font-mono tracking-widest text-white/20 uppercase">Deployment_Log</span>
              </div>

              {/* Scrolling Data Stream */}
              <div className="space-y-3 font-mono">
                <LogLine status="OK" msg="Initializing Apex..." time="00ms" />
                <LogLine status="RUN" msg="Parsing Clusters..." time="12ms" />
                <LogLine status="SYNC" msg="Smartlead Connected" time="15ms" />
                <LogLine status="OK" msg="Layer_04 Active" time="42ms" />
                <LogLine status="BOOT" msg="Grid Calibrating..." time="88ms" />
                <LogLine status="OK" msg="Pulse Ready" time="94ms" />
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-3 bg-brand-beige"
                />
              </div>

              {/* Bottom Mission Label */}
              <div className="absolute bottom-8 left-8 right-8 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-black text-green-500 text-right">OPERATIONAL</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 5. Fluid Interaction Area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-20 flex flex-col items-center gap-12"
        >
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <StatBlock label="Protocol Flux" value={1.2} suffix="b+" isSerif />
            <div className="w-px h-12 bg-brand-beige/30 self-center" />
            <StatBlock label="Sync Fidelity" value={99.9} suffix="%" isSerif />
            <div className="w-px h-12 bg-brand-beige/30 self-center" />
            <StatBlock label="Neural Response" value={8} suffix="ms" isSerif />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={onGetStarted}
              className="group relative flex items-center gap-4 px-8 py-4 bg-[#1a1510] rounded-[1.5rem] text-white font-bold text-base hover:scale-[1.02] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(26,21,16,0.3)]"
            >
              <span className="tracking-tight">Manage Now</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#1a1510] transition-all">
                <ArrowRight size={16} />
              </div>
            </button>

            <button
              className="group px-8 py-4 bg-white/40 backdrop-blur-xl border border-brand-beige/20 rounded-[1.5rem] text-[#1a1510] font-bold text-base hover:bg-white transition-all duration-300 shadow-sm"
            >
              Book Demo
            </button>
          </div>
        </motion.div>


      </div>

      <style jsx>{`
        .perspective-grid {
           transform: perspective(1000px) rotateX(60deg);
        }
      `}</style>
    </section>
  );
};



