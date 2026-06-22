"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, ShieldCheck, Zap, Cpu, Activity, Clock, Search, Target, Mail, 
  MessageSquare, LayoutDashboard, Terminal, Settings2, RotateCcw, 
  Database, Plus, ChevronRight, CheckCircle, AlertTriangle, XCircle, 
  Globe, Play, Pause, RefreshCw, Layers, TrendingUp, BarChart3, Users, Sparkles,
  ArrowUpRight, ArrowDownRight, Filter, Download, MoreHorizontal, MousePointer2,
  Lock, ZapOff, History, LayoutPanelLeft, LineChart, Radar, BrainCircuit
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DataSourceIcon } from "../../../components/ui/icons/DataSourceIcon";
import { api } from "../../../lib/api";

export default function CommandPage() {
  const router = useRouter();
  const [operatorMode, setOperatorMode] = useState<"Manual" | "Assisted" | "Autopilot">("Assisted");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Fetch real data from backend
  React.useEffect(() => {
    const fetchCommandCenterData = async () => {
      try {
        // Fetch all data in parallel
        const [metricsResponse, prioritiesResponse, healthTableResponse] = await Promise.all([
          api.get("/command-center/metrics"),
          api.get("/command-center/priorities"),
          api.get("/command-center/health-table")
        ]);

        const metrics = metricsResponse.data;
        const priorities = prioritiesResponse.data;
        const healthTable = healthTableResponse.data;

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

  const hasKpis = dashboardData?.kpis?.length > 0;
  const hasHealth = dashboardData?.healthTable?.length > 0;
  const hasPriorities = dashboardData?.priorities?.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      {/* Header */}
      <header className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-8 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
              <DataSourceIcon size={17} />
            </div>
            <div className="hidden sm:block truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Command Centre</h1>
              </div>
              <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Real-time GTM control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
           <button
                onClick={() => router.push('/dashboard')}
                className="btn-shine btn-shine-dark h-10 px-3 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
            >
                <LayoutDashboard size={15} /> <span className="hidden sm:inline">Back to Hub</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setActionMenuOpen((o) => !o)}
                className="btn-shine h-10 px-4 sm:px-6 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors shrink-0"
              >
                <Plus size={15} /> <span className="hidden xs:inline">Quick Action</span><span className="xs:hidden">Action</span>
              </button>

              <AnimatePresence>
                {actionMenuOpen && (
                  <>
                    {/* Click-away overlay */}
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setActionMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white border border-[#1a1510]/10 rounded-xl shadow-[0_12px_32px_-8px_rgba(26,21,16,0.18)] overflow-hidden z-[70] py-1.5"
                    >
                      {[
                        { icon: Sparkles, label: "Create Campaign", path: "/dashboard/campaigns/build" },
                        { icon: Layers, label: "New Workflow", path: "/dashboard/workflows" },
                        { icon: Database, label: "Connect Tool", path: "/dashboard/tools" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setActionMenuOpen(false);
                            router.push(item.path);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#1a1510]/70 hover:bg-[#f7f8f9] hover:text-[#1a1510] transition-colors text-left"
                        >
                          <item.icon size={15} className="text-[#1a1510]/40" />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide pb-32">

        {/* Metric Ribbon */}
        {loading ? (
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`bg-white p-4 rounded-2xl border border-[#1a1510]/[0.07] h-28 animate-pulse ${i > 3 ? 'hidden lg:block' : ''}`}>
                <div className="h-2 w-12 bg-[#1a1510]/10 rounded mb-6" />
                <div className="h-5 w-10 bg-[#1a1510]/10 rounded" />
              </div>
            ))}
          </section>
        ) : hasKpis && (
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {dashboardData.kpis.map((kpi: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white p-4 rounded-2xl border border-[#1a1510]/[0.07] flex flex-col justify-between h-28 group hover:border-[#1a1510]/15 transition-colors ${i > 3 ? 'hidden lg:flex' : 'flex'}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-[#1a1510]/40 tracking-wider uppercase">{kpi.label}</span>
                  <span className={kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>
                    {kpi.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1510] tracking-tight tabular-nums">{kpi.value}</h3>
                  <p className={`text-[10px] font-medium ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>{kpi.change}</p>
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {/* Action Bar */}
        <section className="flex flex-wrap items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#1a1510]/[0.07] overflow-x-auto scrollbar-hide">
          {[
            { icon: Pause, label: "Pause" },
            { icon: Play, label: "Resume" },
            { icon: RefreshCw, label: "Re-enrich" },
            { icon: Users, label: "Reassign" },
            { icon: Sparkles, label: "Optimize" },
          ].map((action, i) => (
            <button
              key={i}
              className="btn-shine btn-shine-dark h-9 px-4 rounded-none border border-[#1a1510]/10 bg-white text-[11px] font-semibold text-[#1a1510]/60 hover:text-[#1a1510] hover:border-[#1a1510]/20 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <action.icon size={14} className="text-[#1a1510]/40" />
              {action.label}
            </button>
          ))}
          <div className="flex-1 hidden sm:block" />
          <button
            onClick={() => router.push('/dashboard/accounts')}
            className="btn-shine h-9 px-6 rounded-none bg-[#1a1510] text-white text-[11px] font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors shrink-0"
          >
            <Lock size={13} /> Accounts
          </button>
        </section>

        {/* AI Operator Hero */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-hidden shadow-[0_1px_2px_rgba(26,21,16,0.04)]"
          >
            {/* Premium top band */}
            <div className="relative bg-gradient-to-br from-[#1a1510] via-[#241d15] to-[#1a1510] overflow-hidden">
              <div className="absolute -top-20 -right-10 w-72 h-72 bg-brand-gold/20 rounded-full blur-[100px]" />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />
              <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
                <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-6 text-center md:text-left">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-2 bg-brand-gold/30 rounded-2xl blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gold to-[#9a7d5c] flex items-center justify-center text-[#1a1510] ring-1 ring-brand-gold/40 shadow-lg">
                      <BrainCircuit size={32} strokeWidth={2} />
                    </div>
                  </div>
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
                      <h2 className="text-2xl font-bold text-white tracking-tight">AI Operator</h2>
                    </div>
                    <p className="text-[13px] font-medium text-white/45 max-w-sm leading-relaxed">
                      Monitoring egress layers — optimized across <span className="text-brand-gold font-semibold">4 active vectors</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1 shrink-0 overflow-x-auto backdrop-blur-sm">
                  {(["Manual", "Assisted", "Autopilot"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setOperatorMode(mode)}
                      className={`px-4 sm:px-5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                        operatorMode === mode
                          ? "bg-white text-[#1a1510] shadow-sm"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#1a1510]/[0.07]">
              {[
                { label: "Protected", value: dashboardData?.aiOperator?.protectedRevenue || '$0', icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Unlocked", value: dashboardData?.aiOperator?.unlockedRevenue || '$0', icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Safe Actions", value: dashboardData?.aiOperator?.safeActions ?? 0, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Avoided", value: dashboardData?.aiOperator?.risksAvoided ?? 0, icon: Target, color: "text-red-600", bg: "bg-red-50" },
              ].map((stat, i) => (
                <div key={i} className="group p-5 sm:p-6 hover:bg-[#fafafa] transition-colors">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <stat.icon size={15} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/40">{stat.label}</span>
                  </div>
                  <span className="text-[1.75rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Campaign Health */}
          <section className="lg:col-span-8 space-y-4 order-2 lg:order-1">
             <div className="flex items-center gap-3 px-1">
                <LayoutPanelLeft size={17} className="text-[#1a1510]/40" />
                <h3 className="text-[13px] font-semibold text-[#1a1510] tracking-tight">Campaign Health</h3>
             </div>

             <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-hidden">
                {hasHealth ? (
                  <div className="overflow-x-auto">
                     <table className="w-full whitespace-nowrap text-left border-collapse">
                        <thead className="bg-[#fafafa] border-b border-[#1a1510]/[0.07]">
                           <tr>
                              <th className="py-4 px-6 text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider">Name</th>
                              <th className="py-4 px-4 text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider text-center">Status</th>
                              <th className="py-4 px-4 text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider text-center">Health</th>
                              <th className="py-4 px-6 text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider text-right">Pipeline</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1510]/[0.06]">
                            {dashboardData.healthTable.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-[#fafafa] transition-colors group cursor-pointer">
                                 <td className="py-4 px-6">
                                    <div className="flex items-center gap-3 min-w-0">
                                       <div className="w-9 h-9 rounded-lg bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/40 group-hover:text-brand-gold transition-colors shrink-0">
                                          <Activity size={16} />
                                       </div>
                                       <div className="truncate">
                                          <p className="text-[13px] font-semibold text-[#1a1510] truncate">{row.name}</p>
                                          <div className="flex items-center gap-1.5 mt-1">
                                              {row.tools.map((t: any, ti: number) => (
                                                <span key={ti} className="text-[10px] font-medium text-[#1a1510]/50 px-1.5 py-0.5 bg-[#f7f8f9] rounded">{t}</span>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                       row.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#1a1510]/5 text-[#1a1510]/40'
                                    }`}>
                                       {row.status}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                       <div className="w-12 h-1.5 bg-[#f7f8f9] rounded-full overflow-hidden shrink-0 hidden sm:block">
                                          <div className="h-full bg-brand-gold rounded-full" style={{ width: row.health === '—' ? '0%' : row.health }} />
                                       </div>
                                       <span className="text-[11px] font-semibold text-[#1a1510]/50 tabular-nums">{row.health}</span>
                                    </div>
                                 </td>
                                 <td className="py-4 px-6 text-right">
                                    <div className="flex flex-col items-end">
                                       <span className="text-[13px] font-semibold text-[#1a1510] tabular-nums">{row.pipeline}</span>
                                       <span className="text-[10px] font-medium text-[#1a1510]/35">{row.mtgs} meetings</span>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                    <div className="relative mb-5">
                      <div className="absolute -inset-2 bg-brand-gold/15 rounded-2xl blur-lg" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1510] to-[#2a2118] flex items-center justify-center text-brand-gold ring-1 ring-brand-gold/20">
                        <LayoutPanelLeft size={24} />
                      </div>
                    </div>
                    <p className="text-[15px] font-semibold text-[#1a1510]">{loading ? 'Loading campaigns…' : 'No active campaigns yet'}</p>
                    <p className="text-[13px] text-[#1a1510]/40 mt-1.5 max-w-xs leading-relaxed">Launch a pipeline from Workflows and live campaign health will appear here in real time.</p>
                    {!loading && (
                      <button
                        onClick={() => router.push('/dashboard/workflows')}
                        className="btn-shine mt-6 h-10 px-6 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
                      >
                        <Sparkles size={14} /> Open Workflows
                      </button>
                    )}
                  </div>
                )}
             </div>
          </section>

          {/* Action Queue */}
          <section className="lg:col-span-4 space-y-4 order-1 lg:order-2">
             <div className="flex items-center gap-3 px-1">
                <Target size={17} className="text-[#1a1510]/40" />
                <h3 className="text-[13px] font-semibold text-[#1a1510] tracking-tight">Action Queue</h3>
             </div>

             <div className="space-y-3">
                {hasPriorities ? (
                  dashboardData.priorities.map((item: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl bg-white border border-[#1a1510]/[0.07] group hover:border-[#1a1510]/15 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${item.bg} ${item.color}`}>{item.type}</span>
                        <span className="text-[11px] font-medium text-[#1a1510]/35">{item.entity}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#1a1510] mb-1 leading-snug">{item.title}</h4>
                      <p className="text-[12px] text-[#1a1510]/45 leading-relaxed">{item.impact}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-2xl border border-[#1a1510]/[0.07]">
                    <p className="text-[15px] font-semibold text-[#1a1510]">{loading ? 'Loading queue…' : 'You’re all caught up'}</p>
                    <p className="text-[13px] text-[#1a1510]/40 mt-1.5 leading-relaxed">No actions need your<br className="hidden sm:block" /> attention right now.</p>
                  </div>
                )}
             </div>
          </section>
        </div>

      </main>
    </div>
  );
}
