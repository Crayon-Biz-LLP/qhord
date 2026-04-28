"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Bot, Search, Bell, LogOut, Terminal, 
  Activity, Cpu, ShieldCheck, Target, Users, LayoutDashboard, Mail, ChevronRight, Box, Zap,
  Wand2, RefreshCw, Clock, Layers, MessageSquare, DollarSign, CreditCard, Sparkles, Moon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardHub() {
  const router = useRouter();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTimeContext = () => {
      const now = new Date();
      const hour = now.getHours();
      
      let timeGreeting = "";
      if (hour >= 5 && hour < 12) timeGreeting = "Good Morning";
      else if (hour >= 12 && hour < 18) timeGreeting = "Good Afternoon";
      else timeGreeting = "Good Evening";

      setGreeting(timeGreeting);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-[#f7f8f9] rounded-lg text-[#1a1510] border border-[#1a1510]/5">
                <Box size={18} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[11px] font-black uppercase tracking-widest text-[#1a1510]">Control Tower</span>
                 <span className="text-[9px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Active Node: Main</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="h-9 px-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center gap-3">
              <span className="text-[10px] font-bold text-[#1a1510]/40">2,847 / 5,000 credits</span>
              <div className="w-20 h-1.5 rounded-full bg-[#1a1510]/5 overflow-hidden">
                 <div className="w-[57%] h-full bg-brand-gold rounded-full"></div>
              </div>
              <button className="text-[10px] font-black text-brand-gold border-l border-[#1a1510]/5 pl-3 hover:underline">+ Buy</button>
           </div>
           
           <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30 group-focus-within:text-brand-gold transition-colors" />
              <input type="text" placeholder="Search Command..." className="h-9 w-64 pl-11 pr-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/10 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold/20 transition-all opacity-100" />
           </div>

           <div className="flex items-center gap-3 border-l border-[#1a1510]/10 pl-6">
              <button className="p-2 text-[#1a1510]/40 hover:text-brand-gold relative transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2 text-[#1a1510]/40 hover:text-brand-gold transition-colors"><Moon size={18} /></button>
              <button className="h-9 px-5 rounded-full bg-[#1a1510] text-[#fdfbf7] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:translate-y-[-1px] shadow-lg shadow-[#1a1510]/10">
                 <Plus size={14} /> Quick Actions
              </button>
           </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scrollbar-hide pb-32">
        
        {/* Welcome Section */}
        <section className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
             <h1 className="text-3xl font-black tracking-tighter text-[#1a1510] mb-2 leading-none">{greeting}, {user?.name || "Operator"}</h1>
             <p className="text-sm font-medium text-[#1a1510]/40">{currentDate} — Your GTM engine is running at <span className="text-emerald-500 font-bold">94% health</span></p>
          </motion.div>
          <div className="flex gap-4">
             <button 
                onClick={() => router.push('/dashboard/command')}
                className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-xs font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-white transition-all shadow-sm"
             >
                <Terminal size={14} /> Operating Room
             </button>
             <button className="h-12 px-6 rounded-xl bg-brand-gold text-[#1a1510] text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-brand-gold/20 hover:translate-y-[-1px] transition-all">
                <Plus size={16} strokeWidth={3} /> New Campaign
             </button>
          </div>
        </section>

        {/* Global Performance Header - Premium Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
              { label: "Active Nodes", val: "12", color: "text-emerald-500", icon: Layers },
              { label: "Meetings / month", val: "23", color: "text-blue-500", icon: MessageSquare },
              { label: "Pipeline Gen", val: "$505k", color: "text-brand-gold", icon: Target },
              { label: "Avg AI Score", val: "82%", color: "text-blue-500", icon: Bot },
           ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#1a1510]/5 rounded-[2rem] p-8 shadow-sm group hover:border-brand-gold/20 transition-all"
              >
                 <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl bg-[#f7f8f9] flex items-center justify-center ${stat.color}`}>
                       <stat.icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">{stat.label}</span>
                 </div>
                 <h3 className="text-4xl font-black text-[#1a1510] tracking-tighter">{stat.val}</h3>
              </motion.div>
           ))}
        </div>

        {/* AI Prompt Bar - Premium Style */}
        <div className="relative group">
           <div className="absolute inset-0 bg-brand-gold/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all" />
           <div className="relative bg-white border border-[#1a1510]/5 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold">
                 <Wand2 size={28} />
              </div>
              <input 
                 type="text" 
                 placeholder="Describe what you want to build... e.g. 'Outbound to fintech founders using email + LinkedIn'"
                 className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium placeholder:text-[#1a1510]/20"
              />
              <button className="h-12 px-10 rounded-2xl bg-[#1a1510] text-brand-gold text-xs font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all">
                 Generate
              </button>
           </div>
        </div>

        {/* Two-Column Deep Context */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Column: Campaigns & Operator */}
           <div className="lg:col-span-2 space-y-10">
              {/* AI Operator Hub */}
              <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm overflow-hidden p-8 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                         <Bot size={24} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black tracking-tight text-[#1a1510]">AI Operator Hub</h2>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                         </div>
                         <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-1">GTM system optimized in real time</p>
                      </div>
                   </div>
                   <div className="h-10 px-2 rounded-full bg-[#f7f8f9] flex items-center gap-1">
                      <button className="h-7 px-4 rounded-full bg-white text-[10px] font-black uppercase shadow-sm border border-[#1a1510]/5">Manual</button>
                      <button className="h-7 px-4 text-[10px] font-black uppercase text-[#1a1510]/30">Assisted</button>
                   </div>
                </div>

                <div className="space-y-3">
                   {[
                      { title: "Pause Fintech Series B for 4 hours", desc: "Domain warm-up score dropped below threshold — protects reputation.", tag: "Protects $185K", health: "94% conf.", icon: Zap },
                      { title: "Increase SaaS Enterprise volume by 15%", desc: "Reply rate is 2.1x above benchmark with healthy deliverability.", tag: "+$28k proj.", health: "88% conf.", icon: Activity },
                   ].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 p-5 bg-[#fcfcfc] border border-[#1a1510]/5 rounded-[1.5rem] group hover:border-brand-gold/30 transition-all">
                         <div className="w-10 h-10 rounded-xl bg-white border border-[#1a1510]/5 flex items-center justify-center text-brand-gold shadow-sm">
                            <item.icon size={20} />
                         </div>
                         <div className="flex-1">
                            <h4 className="text-[13px] font-black text-[#1a1510] mb-0.5">{item.title}</h4>
                            <p className="text-[11px] font-medium text-[#1a1510]/40">{item.desc}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">{item.tag}</span>
                            <button className="h-9 px-5 rounded-xl bg-[#1a1510] text-white uppercase tracking-widest text-[9px] font-black">Approve</button>
                         </div>
                      </div>
                   ))}
                </div>
              </section>

              {/* Active Control */}
              <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-[#f7f8f9] rounded-xl text-[#1a1510]"><Activity size={20} /></div>
                       <h2 className="text-base font-black tracking-tight text-[#1a1510]">Active Campaign Control</h2>
                    </div>
                    <button onClick={() => router.push('/dashboard/campaigns')} className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">All Campaigns <ChevronRight size={14} /></button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                       { name: "Fintech Outreach", leads: "4", rev: "$185K", health: "92%" },
                       { name: "Enterprise SaaS", leads: "5", rev: "$320K", health: "78%" },
                    ].map((cp, i) => (
                       <div key={i} className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-[#fcfcfc] border border-[#1a1510]/5 hover:border-brand-gold/20 transition-all">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-[#1a1510]/10 flex items-center justify-center text-brand-gold font-black italic text-xs">G</div>
                                <div>
                                   <h4 className="text-sm font-black text-[#1a1510]">{cp.name}</h4>
                                   <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{cp.leads} leads active</p>
                                </div>
                             </div>
                             <span className="text-xs font-black text-[#1a1510]">{cp.health}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#1a1510]/5 overflow-hidden">
                             <div className="h-full bg-emerald-500 rounded-full" style={{ width: cp.health }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Right Column: Priorities & Context */}
           <div className="space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-xl text-orange-500"><Target size={20} /></div>
                    <h2 className="text-base font-black tracking-tight text-[#1a1510]">Revenue Priorities</h2>
                 </div>
                 <div className="space-y-4">
                    {[
                       { id: 1, text: "Reply to high-intent leads", val: "~$85K at risk", color: "bg-red-50 text-red-500" },
                       { id: 2, text: "Review AI subject lines", val: "+12% opens", color: "bg-emerald-50 text-emerald-500" },
                       { id: 3, text: "Scale Fintech Series B", val: "Healthy health", color: "bg-blue-50 text-blue-500" },
                    ].map((task, i) => (
                       <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-[#f7f8f9] transition-all group">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${task.color} shadow-sm`}>{task.id}</span>
                          <div>
                             <p className="text-xs font-black text-[#1a1510] mb-1">{task.text}</p>
                             <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest">{task.val}</p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button className="w-full h-12 rounded-xl border border-[#1a1510]/5 text-[10px] font-black uppercase tracking-widest text-[#1a1510]/40 hover:text-[#1a1510] transition-all">View All Priorities</button>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Mail size={20} /></div>
                       <h2 className="text-base font-black tracking-tight text-[#1a1510]">Notes & Context</h2>
                    </div>
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">3 OPEN</span>
                 </div>
                 <div className="space-y-4 relative z-10">
                    <button className="w-full py-5 rounded-2xl border-2 border-dashed border-[#1a1510]/5 text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20 hover:border-brand-gold/40 hover:text-brand-gold transition-all">+ Add System Note</button>
                    
                    <div className="p-6 bg-[#fcfcfc] border border-[#1a1510]/5 rounded-[2rem] relative">
                       <div className="absolute top-6 right-6 text-orange-200"><Target size={18} /></div>
                       <p className="text-xs font-medium text-[#1a1510] leading-relaxed mb-6 italic font-serif">"Follow up with Stripe lead — Sarah Chen expressed high interest in the Q3 enterprise demo."</p>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase py-1.5 px-3 bg-[#1a1510] rounded-lg text-white">Series B Fintech</span>
                          </div>
                          <span className="text-[9px] font-bold text-[#1a1510]/30 uppercase tracking-widest">2h ago</span>
                       </div>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  );
}
