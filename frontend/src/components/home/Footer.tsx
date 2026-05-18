"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Mail, ArrowUpRight, Github, Globe, Shield, Terminal } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative bg-[#1a1510] pt-24 pb-12 px-6 overflow-hidden">
      {/* Decorative Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(circle,rgba(185,155,123,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">

          {/* Brand Hub */}
          <div className="lg:col-span-4 flex flex-col items-start gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center transition-transform"
            >
              <div className="relative w-52 h-16 flex items-center justify-start">
                <Image
                  src="/logo-footer.png"
                  alt="Qhord Logo"
                  width={200}
                  height={64}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm font-serif italic border-l-2 border-brand-gold/20 pl-6">
              Engineering the next-generation neural interface for high-fidelity revenue operations and GTM orchestration.
            </p>

            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.1)" }}
                  className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-brand-gold transition-all"
                >
                  <Icon size={20} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Sitemapped Intelligence - Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-8">
            <LinkColumn
              title="Intelligence Hub"
              links={["Module Suite", "GTM Pulse", "Automation Lab", "Neural Pricing"]}
            />
            <LinkColumn
              title="Nexus Core"
              links={["About Portal", "Engineering Blog", "Ops Support", "Deployment Guide"]}
            />
            <LinkColumn
              title="Protocol Registry"
              links={["Privacy Vault", "Architecture Terms", "Layer 0 Security", "Regulatory Compliance"]}
            />
          </div>
        </div>

        {/* Global Footer Hub */}
        <div className="relative pt-10 border-t border-white/5 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col gap-2">
              <p className="text-white/20 text-xs font-medium uppercase tracking-[0.25em]">
                © 2026 Qhord. All rights reserved.
              </p>
            </div>

          </div>

          {/* Subtle Decorative Gradient */}
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        </div>
      </div>
    </footer>
  );
};

const LinkColumn = ({ title, links }: { title: string; links: string[] }) => (
  <div className="flex flex-col gap-8">
    <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-2">{title}</h4>
    <ul className="flex flex-col gap-5">
      {links.map((link, i) => (
        <li key={i}>
          <motion.a
            href="#"
            whileHover={{ x: 5 }}
            className="group flex items-center gap-2 text-white/40 hover:text-white font-medium text-sm transition-colors"
          >
            <span className="group-hover:text-brand-gold transition-colors">{link}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:text-brand-gold transition-all -translate-y-1 translate-x-[-5px] group-hover:translate-x-0" />
          </motion.a>
        </li>
      ))}
    </ul>
  </div>
);

const StatusIndicator = ({ label, status, color }: { label: string; status: string; color: string }) => (
  <div className="flex flex-col items-center md:items-end gap-1">
    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')} animate-pulse`} />
      <span className={`text-[10px] font-black ${color} tracking-widest`}>{status}</span>
    </div>
  </div>
);

