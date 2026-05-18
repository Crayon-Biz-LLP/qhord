"use client";

import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const data = [
  { name: "Mon", users: 400, reach: 240 },
  { name: "Tue", users: 600, reach: 300 },
  { name: "Wed", users: 500, reach: 450 },
  { name: "Thu", users: 900, reach: 700 },
  { name: "Fri", users: 1100, reach: 900 },
  { name: "Sat", users: 1500, reach: 1200 },
  { name: "Sun", users: 2100, reach: 1800 },
];

export const LiveGraphSection = () => {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Observe Growth in <span className="text-gradient">Real-Time</span></h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
              Our dynamic engine doesn't just show history; it visualizes the trajectory. 
              Monitor LinkedIn engagement bursts and user acquisition cycles with crystal clarity.
            </p>
            <div className="space-y-4 inline-block lg:block text-left">
              {["Custom KPIs", "Predictive Trendlines", "Anomaly Detection"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-rose/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-rose" />
                  </div>
                  <span className="font-semibold text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-[300px] sm:h-[400px] glass rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 relative"
          >
            <div className="absolute top-4 sm:top-6 left-4 sm:left-8 flex items-center gap-4 z-20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-purple" />
                <span className="text-xs font-bold text-gray-400 uppercase">User Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-rose" />
                <span className="text-xs font-bold text-gray-400 uppercase">Reach</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#111", 
                    borderColor: "#333", 
                    borderRadius: "12px",
                    color: "#fff" 
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#9333ea" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  animationDuration={2500}
                />
                <Area 
                  type="monotone" 
                  dataKey="reach" 
                  stroke="#fb7185" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReach)" 
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
