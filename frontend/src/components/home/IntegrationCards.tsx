"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Database, MessageSquare, Mail, Zap, ArrowRight, ShieldCheck } from "lucide-react";

const integrations = [
  {
    title: "Apollo Intelligence",
    desc: "Discover high-quality B2B prospects using Apollo’s powerful database directly inside Control Tower.",
    icon: Search,
    features: ["Advanced lead search", "Contact import", "Prospect list management"],
    color: "from-blue-500/20 to-indigo-400/20",
    protocol: "PROTO_SEARCH_01"
  },
  {
    title: "Clay Enrichment",
    desc: "Enrich your leads with powerful data automation and enrichment workflows powered by Clay.",
    icon: Database,
    features: ["Data enrichment", "Company intelligence", "Automated workflows"],
    color: "from-purple-500/20 to-brand-purple/20",
    protocol: "PROTO_DATA_02"
  },
  {
    title: "HeyReach LinkedIn",
    desc: "Launch and manage LinkedIn outreach campaigns without switching platforms.",
    icon: MessageSquare,
    features: ["Multi-account outreach", "Campaign automation", "Message tracking"],
    color: "from-brand-gold/20 to-brand-beige/20",
    protocol: "PROTO_SOCIAL_03"
  },
  {
    title: "Smartlead Inboxes",
    desc: "Run cold email campaigns with inbox rotation and deliverability optimization.",
    icon: Mail,
    features: ["Email sequence management", "Campaign analytics", "Reply tracking"],
    color: "from-emerald-400/20 to-teal-500/20",
    protocol: "PROTO_MAIL_04"
  }
];

export const IntegrationCards = () => {
  return (
    <section className="py-32 px-4 sm:px-6 relative overflow-hidden bg-[#fdfbf7]">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/5 blur-[150px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-gold/20 shadow-xl flex items-center justify-center text-brand-gold">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold block">Connectivity Network</span>
                 <span className="text-[10px] font-bold text-[#1a1510]/30 uppercase">Enterprise Protocol v4.0</span>
              </div>
            </motion.div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#1a1510] tracking-tight leading-[0.95] mb-8">
               One Hub. <br />
               <span className="text-brand-gold italic">All Playbooks.</span>
            </h2>
            <p className="text-[#1a1510]/50 text-xl font-medium max-w-xl font-serif italic">
               The landscape of outreach fragmented by choice, unified by architecture.
            </p>
          </div>
        </div>

        {/* LANDSCAPE CARDS GRID (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {integrations.map((int, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col sm:flex-row p-1 rounded-[3.5rem] bg-white border-2 border-brand-gold/10 hover:border-brand-gold transition-all duration-700 hover:shadow-[0_60px_100px_-30px_rgba(185,155,123,0.3)] hover:-translate-y-2 overflow-hidden cursor-pointer min-h-[320px]"
            >
              {/* Internal Bezel/Glass Face */}
              <div className="flex-1 flex flex-col sm:flex-row bg-[#fdfbf7]/50 backdrop-blur-xl rounded-[3.2rem] overflow-hidden relative">
                 
                 {/* Left Side Visual Detail (Icon Side) */}
                 <div className={`w-full sm:w-[140px] md:w-[180px] bg-gradient-to-br ${int.color} flex items-center justify-center relative overflow-hidden shrink-0`}>
                    {/* Perspective Mesh */}
                    <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#1a1510_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                    
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-20 h-20 rounded-3xl bg-[#1a1510] border border-white/20 shadow-2xl flex items-center justify-center text-brand-gold relative z-10"
                    >
                       <int.icon size={36} strokeWidth={1.5} />
                    </motion.div>

                    {/* Background ID Text */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1a1510]/10">{int.protocol}</span>
                    </div>
                 </div>

                 {/* Right Side Content (Data Side) */}
                 <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-3xl font-black text-[#1a1510] tracking-tight uppercase leading-none group-hover:text-brand-gold transition-colors">{int.title}</h3>
                          <div className="w-10 h-10 rounded-full bg-white border border-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-[#1a1510] group-hover:text-white transition-all shadow-xl">
                             <Zap size={18} fill="currentColor" />
                          </div>
                       </div>
                       
                       <p className="text-[#1a1510]/60 font-medium text-sm leading-relaxed mb-8 max-w-[340px]">
                          {int.desc}
                       </p>
                    </div>

                    <div className="flex flex-col gap-4">
                       <div className="flex flex-wrap gap-2">
                          {int.features.map((feat, fi) => (
                            <span key={fi} className="px-3 py-1.5 rounded-xl bg-white border border-brand-gold/10 text-[10px] font-black uppercase tracking-widest text-brand-gold/60 shadow-sm group-hover:border-brand-gold/30 transition-all">
                               {feat}
                            </span>
                          ))}
                       </div>
                       
                       <div className="pt-6 border-t border-brand-gold/5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1510]/20">Protocol Initialized</span>
                          <div className="flex items-center gap-2 text-brand-gold group-hover:translate-x-1 transition-transform">
                             <span className="text-[10px] font-black uppercase tracking-widest">Deploy Suite</span>
                             <ArrowRight size={14} />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Ambient Hover Gradient Glow */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Footnote */}
        <div className="mt-24 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.8em] text-[#1a1510]/20 mb-8 italic">Synchronizing Your Stack</p>
           <button className="px-12 py-6 bg-[#1a1510] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-6 mx-auto group">
              Centralize Now
              <div className="w-10 h-10 rounded-full bg-brand-gold text-[#1a1510] flex items-center justify-center group-hover:bg-white transition-all">
                 <Zap size={20} fill="currentColor" />
              </div>
           </button>
        </div>
      </div>
    </section>
  );
};
