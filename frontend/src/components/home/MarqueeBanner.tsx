"use client";

import React from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  items: string[];
  direction?: "left" | "right";
  speed?: number;
  className?: string;
  bgColor?: string;
  textColor?: string;
}

const MarqueeTrack: React.FC<MarqueeProps> = ({ 
  items, 
  direction = "left", 
  speed = 20, 
  className = "", 
  bgColor = "bg-brand-gold", 
  textColor = "text-white" 
}) => {
  // Triple the items to ensure seamless loop
  const displayItems = [...items, ...items, ...items];

  return (
    <div className={`overflow-hidden py-4 flex whitespace-nowrap ${bgColor} ${className}`}>
      <motion.div
        animate={{
          x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex items-center"
      >
        {displayItems.map((item, index) => (
          <React.Fragment key={index}>
            <span className={`text-2xl md:text-3xl font-black uppercase tracking-wider mx-8 ${textColor}`}>
              {item}
            </span>
            <span className={textColor}>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-6 h-6 rotate-45"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export const GTMMarquee = () => {
  const line1 = ["GTM Team Needs", "Operational Alpha", "Strategic Velocity", "Scale Ready"];
  const line2 = ["GTM Teams", "Sales Ops", "Marketing Ops", "Revenue Leaders"];

  return (
    <div className="relative py-24 bg-[#fdfbf7] overflow-hidden min-h-[400px] flex flex-col justify-center">
      {/* Curved Tracks Container */}
      <div className="relative w-full">
        {/* Track 1 - Tilted Down */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] md:w-[120%] rotate-[-4deg] z-10">
          <MarqueeTrack 
            items={line1} 
            direction="left" 
            speed={25} 
            bgColor="bg-brand-gold" 
            className="shadow-2xl"
          />
        </div>

        {/* Track 2 - Tilted Up */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] rotate-[4deg] z-20">
          <MarqueeTrack 
            items={line2} 
            direction="right" 
            speed={30} 
            bgColor="bg-black" 
            className="shadow-2xl"
          />
        </div>
      </div>
      
      {/* Decorative Orbs to Match the SolutionSection Aesthetic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#20D5AB]/10 rounded-full blur-3xl -ml-32 -mb-32" />
    </div>
  );
};
