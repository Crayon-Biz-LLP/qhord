"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Cpu, Activity, Zap, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, BarChart3, Settings, RefreshCw, Play, Pause,
  Database, Globe, Target, Layers, Sparkles, Bot, BrainCircuit, LayoutDashboard
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";

export default function AIEnginePage() {
  const { user } = useAuth(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/ai-engine/metrics");
      if (response.data.success) {
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch AI Engine metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const statusStyle = (status?: string) =>
    status === "Optimal" ? "bg-emerald-50 text-emerald-600"
      : status === "Good" ? "bg-amber-50 text-amber-600"
      : "bg-[#1a1510]/5 text-[#1a1510]/45";

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      {/* Header */}
      <nav className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
            <BrainCircuit size={17} />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">AI Engine</h2>
            <p className="text-[11px] font-medium text-[#1a1510]/40">LangGraph processing performance</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-shine btn-shine-dark h-10 px-4 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </nav>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader size={36} /></div>
      ) : (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide pb-32">
          {/* Status Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Campaigns", value: metrics?.totalCampaigns || 0, icon: Cpu, badge: metrics?.status || "Unknown", badgeStyle: statusStyle(metrics?.status) },
              { label: "Total Executions", value: metrics?.totalExecutions || 0, icon: Activity, sub: "Last 30 days" },
              { label: "Processing Success", value: `${metrics?.successRate || 0}%`, icon: CheckCircle, sub: "Success rate" },
              { label: "Processing Time", value: `${metrics?.avgProcessingTime || 0}s`, icon: Clock, sub: "Average" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.07)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon size={18} strokeWidth={1.75} className="text-[#1a1510]/25 group-hover:text-[#1a1510]/50 transition-colors" />
                  {stat.badge ? (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${stat.badgeStyle}`}>{stat.badge}</span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#1a1510]/35">{stat.sub}</span>
                  )}
                </div>
                <h3 className="text-[2.25rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{stat.value}</h3>
                <p className="text-[11px] font-medium text-[#1a1510]/45 uppercase tracking-wider mt-2.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Node Performance */}
          <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-[#1a1510] tracking-tight">Node Performance</h2>
              <Layers size={17} className="text-[#1a1510]/35" />
            </div>

            {metrics?.nodePerformance?.length ? (
              <div className="space-y-2.5">
                {metrics.nodePerformance.map((node: any, index: number) => (
                  <motion.div
                    key={node.node}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between gap-4 p-3.5 bg-[#fafafa] border border-[#1a1510]/[0.05] rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1a1510] text-brand-gold flex items-center justify-center shrink-0">
                        <Bot size={17} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-semibold text-[#1a1510]">{node.node} Node</h3>
                        <p className="text-[12px] text-[#1a1510]/45">{node.totalExecutions} executions · {node.avgTime}s avg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[13px] font-semibold text-[#1a1510] tabular-nums">{node.successRate}%</span>
                      <div className="w-20 h-1.5 bg-[#1a1510]/[0.07] rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold rounded-full" style={{ width: `${node.successRate}%` }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-[#f7f8f9] text-[#1a1510]/25 flex items-center justify-center mb-3"><Layers size={22} /></div>
                <p className="text-[13px] font-semibold text-[#1a1510]/60">No node activity yet</p>
                <p className="text-[12px] text-[#1a1510]/35 mt-0.5">Run a campaign to see node performance.</p>
              </div>
            )}
          </div>

          {/* System Health + Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#1a1510] tracking-tight">System Health</h2>
                <Activity size={17} className="text-[#1a1510]/35" />
              </div>
              <div className="divide-y divide-[#1a1510]/[0.06]">
                {[
                  { label: "Uptime", value: `${metrics?.uptime || 0}%`, tone: "text-[#1a1510]" },
                  { label: "Memory Usage", value: "Normal", tone: "text-emerald-600" },
                  { label: "API Response", value: "Fast", tone: "text-emerald-600" },
                  { label: "Database", value: "Connected", tone: "text-emerald-600" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-[#1a1510]/50">{row.label}</span>
                    <span className={`text-[13px] font-semibold ${row.tone}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#1a1510] tracking-tight">Recent Activity</h2>
                <Clock size={17} className="text-[#1a1510]/35" />
              </div>
              <div className="space-y-3">
                {[
                  { dot: "bg-emerald-500", text: "Parser node completed campaign processing", time: "2m ago" },
                  { dot: "bg-blue-500", text: "Architect node generated campaign plan", time: "5m ago" },
                  { dot: "bg-violet-500", text: "Validator node approved campaign manifest", time: "8m ago" },
                  { dot: "bg-amber-500", text: "Executor node started campaign execution", time: "12m ago" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.dot} shrink-0`} />
                    <span className="text-[13px] text-[#1a1510]/70 flex-1 truncate">{a.text}</span>
                    <span className="text-[12px] text-[#1a1510]/35 shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
