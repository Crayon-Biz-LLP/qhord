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
   },
   {
      title: "Clay Enrichment",
      desc: "Enrich your leads with powerful data automation and enrichment workflows powered by Clay.",
      icon: Database,
      features: ["Data enrichment", "Company intelligence", "Automated workflows"],
      color: "from-purple-500/20 to-brand-purple/20",

   },
   {
      title: "HeyReach LinkedIn",
      desc: "Launch and manage LinkedIn outreach campaigns without switching platforms.",
      icon: MessageSquare,
      features: ["Multi-account outreach", "Campaign automation", "Message tracking"],
      color: "from-brand-gold/20 to-brand-beige/20",
   },
   {
      title: "Smartlead Inboxes",
      desc: "Run cold email campaigns with inbox rotation and deliverability optimization.",
      icon: Mail,
      features: ["Email sequence management", "Campaign analytics", "Reply tracking"],
      color: "from-emerald-400/20 to-teal-500/20",
   }
];

export const IntegrationCards = () => {
   const [activeIndex, setActiveIndex] = useState(0);
   const scrollRef = useRef<HTMLDivElement>(null);

   const scrollToIndex = (index: number) => {
      if (!scrollRef.current) return;
      const card = scrollRef.current.children[index] as HTMLElement;
      if (card) {
         scrollRef.current.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
         setActiveIndex(index);
      }
   };

   const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 1;
      const gap = 32;
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(index, integrations.length - 1));
   };

   const next = () => scrollToIndex(Math.min(activeIndex + 1, integrations.length - 1));
   const prev = () => scrollToIndex(Math.max(activeIndex - 1, 0));

   return (
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#fdfbf7]">
         {/* Background Decorative Accents */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/5 blur-[150px] pointer-events-none" />
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

         <div className="max-w-7xl mx-auto relative z-10">
            {/* Header with Nav Arrows */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
               <div className="max-w-3xl">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1a1510] tracking-tight leading-[0.95] mb-6">
                     One Hub. <br />
                     <span className="text-brand-gold italic">All Playbooks.</span>
                  </h2>
                  <p className="text-[#1a1510]/50 text-lg font-medium max-w-xl font-serif italic">
                     The landscape of outreach fragmented by choice, unified by architecture.
                  </p>
               </div>

               {/* Navigation Arrows */}
               <div className="flex items-center gap-3">
                  <button
                     onClick={prev}
                     disabled={activeIndex === 0}
                     className="w-12 h-12 rounded-full bg-white border border-brand-gold/20 flex items-center justify-center text-[#1a1510]/40 hover:text-[#1a1510] hover:border-brand-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                     <ArrowRight size={18} className="rotate-180" />
                  </button>
                  <button
                     onClick={next}
                     disabled={activeIndex === integrations.length - 1}
                     className="w-12 h-12 rounded-full bg-[#1a1510] border border-white/10 flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-[#1a1510] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                     <ArrowRight size={18} />
                  </button>
               </div>
            </div>

            {/* Carousel Slider */}
            <div
               ref={scrollRef}
               onScroll={handleScroll}
               className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
               style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
               {integrations.map((int, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1, duration: 0.6 }}
                     className="group relative flex flex-col sm:flex-row p-1 rounded-[2.5rem] bg-white border-2 border-brand-gold/10 hover:border-brand-gold transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(185,155,123,0.25)] overflow-hidden cursor-pointer snap-start flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[calc(50%-16px)]"
                  >
                     {/* Internal Bezel/Glass Face */}
                     <div className="flex-1 flex flex-col sm:flex-row bg-[#fdfbf7]/50 backdrop-blur-xl rounded-[2.2rem] overflow-hidden relative">

                        {/* Left Side Visual Detail (Icon Side) */}
                        <div className={`w-full h-[140px] sm:h-auto sm:w-[140px] md:w-[160px] bg-gradient-to-br ${int.color} flex items-center justify-center relative overflow-hidden shrink-0`}>
                           <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#1a1510_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                           <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-16 h-16 rounded-2xl bg-[#1a1510] border border-white/20 shadow-2xl flex items-center justify-center text-brand-gold relative z-10"
                           >
                              <int.icon size={28} strokeWidth={1.5} />
                           </motion.div>
                        </div>

                        {/* Right Side Content */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                           <div>
                              <div className="flex items-center justify-between mb-3">
                                 <h3 className="text-lg font-black text-[#1a1510] tracking-tight uppercase leading-none group-hover:text-brand-gold transition-colors">{int.title}</h3>
                                 <div className="w-8 h-8 rounded-full bg-white border border-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-[#1a1510] group-hover:text-white transition-all shadow-lg">
                                    <Zap size={14} fill="currentColor" />
                                 </div>
                              </div>
                              <p className="text-[#1a1510]/50 font-medium text-sm leading-relaxed mb-6 max-w-[300px]">
                                 {int.desc}
                              </p>
                           </div>

                           <div className="flex flex-col gap-3">
                              <div className="flex flex-wrap gap-1.5">
                                 {int.features.map((feat, fi) => (
                                    <span key={fi} className="px-2.5 py-1 rounded-lg bg-white border border-brand-gold/10 text-[9px] font-black uppercase tracking-widest text-brand-gold/60 shadow-sm group-hover:border-brand-gold/30 transition-all">
                                       {feat}
                                    </span>
                                 ))}
                              </div>

                              <div className="pt-4 border-t border-brand-gold/5 flex items-center">
                                 <div className="flex items-center gap-2 text-brand-gold group-hover:translate-x-1 transition-transform">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Suite</span>
                                    <ArrowRight size={14} />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Ambient Hover Gradient Glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
               {integrations.map((_, i) => (
                  <button
                     key={i}
                     onClick={() => scrollToIndex(i)}
                     className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex
                           ? "w-8 bg-brand-gold"
                           : "w-1.5 bg-brand-gold/20 hover:bg-brand-gold/40"
                        }`}
                  />
               ))}
            </div>
         </div>
      </section>
   );
};
