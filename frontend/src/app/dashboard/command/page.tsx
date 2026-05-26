"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, ShieldCheck, Zap, Cpu, Activity, Clock, Search, Target, Mail, 
  MessageSquare, LayoutDashboard, Terminal, Settings2, RotateCcw, 
  Database, Plus, ChevronRight, CheckCircle, AlertTriangle, XCircle, 
  Globe, Play, Pause, RefreshCw, Layers, TrendingUp, BarChart3, Users, Sparkles,
  ArrowUpRight, ArrowDownRight, Filter, Download, MoreHorizontal, MousePointer2,
  Lock, ZapOff, History, LayoutPanelLeft, LineChart
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPage() {
  const router = useRouter();
  const [operatorMode, setOperatorMode] = useState<"Manual" | "Assisted" | "Autopilot">("Assisted");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  React.useEffect(() => {
    const fetchCommandCenterData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        
        // Fetch all data in parallel
        const [metricsResponse, prioritiesResponse, healthTableResponse] = await Promise.all([
          fetch("http://localhost:4000/api/command-center/metrics", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:4000/api/command-center/priorities", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:4000/api/command-center/health-table", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        const [metrics, priorities, healthTable] = await Promise.all([
          metricsResponse.json(),
          prioritiesResponse.json(),
          healthTableResponse.json()
        ]);

        if (metrics.success && priorities.success && healthTable.success) {
          setDashboardData({
            kpis: metrics.data.metrics.kpis,
            aiOperator: metrics.data.metrics.aiOperator,
            priorities: priorities.data.priorities,
            healthTable: healthTable.data.healthTable
          });
        }
      } catch (error) {
        console.error('Failed to fetch command center data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandCenterData();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#D4AF37]/30">
      {/* Header */}
      <header className="h-16 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-8 min-w-0">
          <div className="flex items-center gap-4">
            <motion.div 
               whileHover={{ rotate: 180 }}
               className="p-2 bg-[#1a1510] text-[#D4AF37] rounded-lg shadow-lg shrink-0"
            >
              <Terminal size={18} />
            </motion.div>
            <div className="hidden sm:block truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Command Centre</h1>
                <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 shrink-0">
                  LIVE OPS
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-widest truncate">Real-time GTM Control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
           <button 
                onClick={() => router.push('/dashboard')}
                className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
            >
                <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back Hub</span>
            </button>
            <button className="h-10 px-4 sm:px-6 rounded-xl bg-[#1a1510] text-[#D4AF37] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:translate-y-[-1px] transition-all group shrink-0">
                <Plus size={14} /> <span className="hidden xs:inline">Quick Action</span><span className="xs:hidden">Action</span>
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-hide">
        
        {/* Metric Ribbon */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {dashboardData?.kpis?.map((kpi: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white p-3 sm:p-4 rounded-2xl border border-[#1a1510]/5 flex flex-col justify-between h-28 sm:h-32 group transition-all shadow-sm hover:shadow-md cursor-default ${i > 3 ? 'hidden lg:flex' : 'flex'}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black text-[#1a1510]/30 tracking-widest uppercase">{kpi.label}</span>
                <div className={`p-1 rounded-md ${kpi.trend === 'up' ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#1a1510] tracking-tighter mb-0.5">{kpi.value}</h3>
                <p className={`text-[8px] font-bold uppercase tracking-wider ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {kpi.change}
                </p>
              </div>

              <div className="h-4 flex items-end gap-[2px] mt-2 opacity-10 group-hover:opacity-100 transition-opacity">
                {kpi.sparkline.map((val: any, idx: number) => (
                  <div key={idx} className="flex-1 bg-brand-gold rounded-full" style={{ height: `${val}%` }} />
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Action Bar */}
        <section className="flex flex-wrap items-center gap-2 sm:gap-3 py-2 bg-[#f7f8f9]/50 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border border-[#1a1510]/5 overflow-x-auto scrollbar-hide">
          {[
            { icon: Pause, label: "Pause" },
            { icon: Play, label: "Resume" },
            { icon: RefreshCw, label: "Re-enrich" },
            { icon: Users, label: "Reassign" },
            { icon: Sparkles, label: "Optimize" },
          ].map((action, i) => (
            <button 
              key={i} 
              className="h-9 px-4 rounded-lg border border-[#1a1510]/5 bg-white text-[9px] font-black uppercase tracking-widest text-[#1a1510]/50 hover:text-[#1a1510] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <action.icon size={12} className="text-[#1a1510]/30" />
              {action.label}
            </button>
          ))}
          <div className="flex-1 hidden sm:block" />
          <button 
            onClick={() => router.push('/dashboard/accounts')}
            className="h-9 px-6 rounded-lg bg-brand-gold text-[#1a1510] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md hover:translate-y-[-1px] transition-all shrink-0"
          >
            <Lock size={12} /> Accounts
          </button>
        </section>

        {/* AI Operator Hero */}
        <section className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-[2rem] sm:rounded-[3rem] border border-[#1a1510]/5 shadow-sm overflow-hidden"
          >
            <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-4 bg-brand-gold/10 rounded-full blur-2xl animate-pulse" />
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#1a1510] border border-brand-gold/20 flex items-center justify-center text-brand-gold relative z-10 transition-transform hover:scale-105">
                    <Bot size={40} />
                  </div>
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1a1510] tracking-tighter">AI Operator</h2>
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">SYSTEM NOMINAL</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#1a1510]/40 max-w-sm leading-relaxed uppercase tracking-widest truncate sm:whitespace-normal">
                    Monitoring egress layers — optimized across <span className="text-brand-gold font-black">4 active vectors.</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#f7f8f9] p-1.5 rounded-xl sm:rounded-2xl border border-[#1a1510]/5 flex items-center gap-1 shrink-0 overflow-x-auto">
                {(["Manual", "Assisted", "Autopilot"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOperatorMode(mode)}
                    className={`px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      operatorMode === mode 
                        ? "bg-white text-[#1a1510] shadow-md" 
                        : "text-[#1a1510]/30 hover:text-[#1a1510]/50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1a1510]/5 bg-[#fcfcfc] grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1a1510]/5">
              {[
                { label: "Protected", value: dashboardData?.aiOperator?.protectedRevenue || '$0', icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Unlocked", value: dashboardData?.aiOperator?.unlockedRevenue || '$0', icon: Sparkles, color: "text-brand-gold", bg: "bg-brand-gold/5" },
                { label: "Safe Actions", value: dashboardData?.aiOperator?.safeActions || 0, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Avoided", value: dashboardData?.aiOperator?.risksAvoided || 0, icon: Target, color: "text-red-600", bg: "bg-red-50" },
              ].map((stat, i) => (
                <div key={i} className="p-4 sm:p-8 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg} ${stat.color} shadow-sm shrink-0`}>
                      <stat.icon size={14} />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#1a1510]/20 hidden md:inline truncate">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-2xl font-black text-[#1a1510] tracking-tighter truncate">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
          
          <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-[#f7f8f9] text-[#1a1510]/40 rounded-lg"><LayoutPanelLeft size={16} /></div>
                   <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest leading-none">Campaign Health</h3>
                </div>
             </div>

             <div className="bg-white rounded-[2rem] border border-[#1a1510]/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full whitespace-nowrap text-left border-collapse">
                      <thead className="bg-[#fcfcfc] border-b border-[#1a1510]/5">
                         <tr>
                            <th className="py-5 px-6 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest">Name</th>
                            <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Status</th>
                            <th className="py-5 px-4 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-center">Health</th>
                            <th className="py-5 px-6 text-[9px] font-black text-[#1a1510]/20 uppercase tracking-widest text-right">Pipeline</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1510]/5">
                          {dashboardData?.healthTable?.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-[#f7f8f9] transition-colors group cursor-pointer font-medium">
                               <td className="py-5 px-6">
                                  <div className="flex items-center gap-4 min-w-0">
                                     <div className="w-10 h-10 rounded-xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold group-hover:bg-[#1a1510] transition-all shrink-0">
                                        <Plus size={16} />
                                     </div>
                                     <div className="truncate">
                                        <p className="text-xs font-black text-[#1a1510] group-hover:text-brand-gold transition-colors truncate">{row.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {row.tools.map((t: any, ti: number) => (
                                              <span key={ti} className="text-[8px] font-bold text-[#1a1510]/30 lowercase px-1.5 py-0.5 bg-[#f7f8f9] rounded">{t}</span>
                                           ))}
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-5 px-4 text-center">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                     row.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#1a1510]/5 text-[#1a1510]/30'
                                  }`}>
                                     {row.status}
                                  </span>
                               </td>
                               <td className="py-5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                     <div className="w-12 h-1 bg-[#f7f8f9] rounded-full overflow-hidden shrink-0 hidden sm:block">
                                        <div className="h-full bg-brand-gold rounded-full" style={{ width: row.health === '—' ? '0%' : row.health }} />
                                     </div>
                                     <span className="text-[9px] font-black text-[#1a1510]/40">{row.health}</span>
                                  </div>
                               </td>
                               <td className="py-5 px-6 text-right">
                                  <div className="flex flex-col items-end">
                                     <span className="text-xs font-black text-[#1a1510]">{row.pipeline}</span>
                                     <span className="text-[9px] font-bold text-[#1a1510]/20 uppercase">{row.mtgs} Meetings</span>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </section>

          <section className="lg:col-span-4 space-y-8 order-1 lg:order-2">
             <div className="space-y-4 px-2 sm:px-0">
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#1a1510] text-[#D4AF37] rounded-lg"><Target size={16} /></div>
                  <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest leading-none">Action Queue</h3>
               </div>
               
               <div className="space-y-4">
                  {dashboardData?.priorities?.map((item: any, i: number) => (
                   <motion.div
                     key={i}
                     className="p-5 rounded-2xl bg-white border border-[#1a1510]/5 group hover:border-brand-gold/30 transition-all shadow-sm"
                   >
                     <div className="flex items-start justify-between mb-3">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${item.bg} ${item.color}`}>{item.type}</span>
                       <span className="text-[9px] font-black text-[#1a1510]/20 uppercase">{item.entity}</span>
                     </div>
                     <h4 className="text-sm font-black text-[#1a1510] mb-1 leading-tight">{item.title}</h4>
                     <p className="text-[9px] font-medium text-[#1a1510]/40 uppercase tracking-widest">{item.impact}</p>
                   </motion.div>
                 ))}
               </div>
             </div>
          </section>
        </div>

      </main>
    </div>
  );
}
