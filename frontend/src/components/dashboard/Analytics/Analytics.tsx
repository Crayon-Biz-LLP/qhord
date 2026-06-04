"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, Activity, Users, Mail, Target, Zap, Briefcase } from "lucide-react";
import { api } from "../../../lib/api";

interface AnalyticsData {
  totalExecutions: number;
  successRate: number;
  leadCount: number;
  campaignCount: number;
  successCount: number;
  failedCount: number;
  toolUsage: Record<string, { total: number; success: number; failed: number }>;
  executionsByDay: { date: string; count: number }[];
}

export const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/summary")
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-sm text-[#1a1510]/50">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-sm text-red-500">Failed to load analytics</div>;

  const toolColors: Record<string, string> = {
    hunter: "bg-emerald-500",
    bettercontacts: "bg-blue-500",
    brevo: "bg-purple-500",
    calendly: "bg-orange-500",
  };

  const toolIcons: Record<string, React.ReactNode> = {
    hunter: <Target size={14} />,
    bettercontacts: <Users size={14} />,
    brevo: <Mail size={14} />,
    calendly: <Zap size={14} />,
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 pb-32">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1a1510] mb-1">Analytics</h1>
          <p className="text-xs font-medium text-[#1a1510]/50">Real pipeline usage, tool performance, and lead generation stats</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: <BarChart3 size={16} />, label: "Total Executions", val: data.totalExecutions.toString() },
            { icon: <Activity size={16} />, label: "Success Rate", val: `${data.successRate}%` },
            { icon: <Users size={16} />, label: "Total Leads", val: data.leadCount.toString() },
            { icon: <Mail size={16} />, label: "Campaigns", val: data.campaignCount.toString() },
            { icon: <TrendingUp size={16} />, label: "Succeeded", val: data.successCount.toString() },
            { icon: <TrendingDown size={16} />, label: "Failed", val: data.failedCount.toString() },
          ].map((m, i) => (
            <div key={i} className="bg-white border border-[#1a1510]/5 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[#1a1510]/40">{m.icon}</div>
              <span className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest">{m.label}</span>
              <div className="text-xl font-black text-[#1a1510] tracking-tight mt-1">{m.val}</div>
            </div>
          ))}
        </div>

        {/* Executions by Day Chart */}
        {data.executionsByDay.length > 0 && (
          <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1a1510] mb-6">Executions (Last 30 Days)</h3>
            <div className="flex items-end gap-1 h-32">
              {data.executionsByDay.map((d, i) => {
                const max = Math.max(...data.executionsByDay.map(x => x.count), 1);
                const h = (d.count / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all min-h-[4px]"
                      style={{ height: `${Math.max(h, 2)}%` }}
                    />
                    <span className="text-[7px] font-medium text-[#1a1510]/30 hidden md:block">
                      {d.date.slice(5)}
                    </span>
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1a1510] text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                      {d.date}: {d.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tool Usage Breakdown */}
        {Object.keys(data.toolUsage).length > 0 && (
          <div className="bg-white border border-[#1a1510]/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1a1510] mb-6">Tool Usage Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.toolUsage).map(([tool, stats]) => (
                <div key={tool} className="border border-[#1a1510]/5 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${toolColors[tool] || "bg-gray-500"} flex items-center justify-center text-white`}>
                      {toolIcons[tool] || <Briefcase size={14} />}
                    </div>
                    <span className="text-sm font-bold capitalize">{tool}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-[#1a1510]/50">Total</span><span className="font-bold">{stats.total}</span></div>
                    <div className="flex justify-between"><span className="text-[#1a1510]/50">Success</span><span className="font-bold text-emerald-600">{stats.success}</span></div>
                    <div className="flex justify-between"><span className="text-[#1a1510]/50">Failed</span><span className="font-bold text-red-500">{stats.failed}</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.total ? (stats.success / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {data.totalExecutions === 0 && (
          <div className="text-center py-16">
            <BarChart3 size={40} className="mx-auto text-[#1a1510]/20 mb-4" />
            <p className="text-sm font-bold text-[#1a1510]/40">No executions yet</p>
            <p className="text-xs text-[#1a1510]/30 mt-1">Run a pipeline on the Workflows page to see analytics here.</p>
          </div>
        )}
      </main>
    </div>
  );
};
