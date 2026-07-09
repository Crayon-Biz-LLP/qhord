"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wallet, TrendingUp, PieChart, Users, DollarSign, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { api } from "../../../lib/api";

export default function CreditsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/credits/dashboard");
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load credit dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f7f8f9] min-h-screen">
        <Loader size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f7f8f9] min-h-screen">
        <div className="text-center space-y-3">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <p className="text-[15px] font-semibold text-[#1a1510]">{error}</p>
          <button onClick={fetchDashboard} className="text-[13px] text-brand-gold hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Master Pool", value: data.masterPool, icon: Wallet, tint: "text-brand-gold", suffix: "credits" },
    { label: "Consumed This Month", value: data.totalCreditsConsumed, icon: TrendingUp, tint: "text-blue-500", suffix: "credits" },
    { label: "Tokens Used", value: (data.totalTokensUsed / 1000000).toFixed(1), icon: PieChart, tint: "text-purple-500", suffix: "M" },
    { label: "Overall Margin", value: data.overallMargin, icon: DollarSign, tint: data.overallMargin > 50 ? "text-emerald-500" : "text-amber-500", suffix: "%" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      <header className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
            <Wallet size={17} />
          </div>
          <div>
            <h1 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Token & Credit Command Center</h1>
            <p className="text-[11px] font-medium text-[#1a1510]/40">Real-time AI usage across all clients</p>
          </div>
        </div>
        <button onClick={fetchDashboard} className="w-9 h-9 flex items-center justify-center bg-white border border-[#1a1510]/[0.07] rounded-lg hover:bg-[#f7f8f9] transition-colors">
          <RefreshCw size={15} className="text-[#1a1510]/50" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Master Pool Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-5 rounded-2xl border border-[#1a1510]/[0.07] flex flex-col justify-between h-28 group hover:border-[#1a1510]/15 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#1a1510]/40 tracking-wider uppercase">{s.label}</span>
                <s.icon size={15} className={s.tint} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#1a1510] tracking-tight tabular-nums">
                  {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  <span className="text-[11px] font-medium text-[#1a1510]/40 ml-1">{s.suffix}</span>
                </h3>
              </div>
            </div>
          ))}
        </section>

        {/* Summary Row */}
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#1a1510]/50 px-1">
          <span className="flex items-center gap-1.5"><DollarSign size={13} /> Wholesale: ${data.totalWholesale}</span>
          <span className="flex items-center gap-1.5"><TrendingUp size={13} /> Retail: ${data.totalRetail}</span>
          <span className="flex items-center gap-1.5"><PieChart size={13} /> Tokens: {data.totalTokensUsed.toLocaleString()}</span>
          <span className="flex items-center gap-1.5">{data.month ? new Date(data.month).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}</span>
        </div>

        {/* Client Breakdown Table */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-bold text-[#1a1510] px-1">Client Usage & Margin Analytics</h2>

          <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#1a1510]/[0.06] bg-[#fafafa]">
                  <th className="text-left font-semibold text-[#1a1510]/60 p-4">Client Name</th>
                  <th className="text-left font-semibold text-[#1a1510]/60 p-4">Active Campaigns</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">Tokens Used</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">Credits Consumed</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">Balance</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">Cost (Wholesale)</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">Value (Retail)</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">Margin</th>
                  <th className="text-right font-semibold text-[#1a1510]/60 p-4">AI Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1510]/[0.06]">
                {data.clientBreakdown?.map((client: any, i: number) => (
                  <tr key={client.clientId || i} className="hover:bg-[#fafafa] transition-colors">
                    <td className="p-4 font-semibold">{client.clientName}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">{client.activeCampaigns}</span>
                    </td>
                    <td className="p-4 text-right tabular-nums">{client.tokensUsed.toLocaleString()}</td>
                    <td className="p-4 text-right tabular-nums">{client.creditsConsumed}</td>
                    <td className="p-4 text-right tabular-nums font-medium">{client.currentBalance}</td>
                    <td className="p-4 text-right tabular-nums">${client.wholesaleCost}</td>
                    <td className="p-4 text-right tabular-nums font-medium">${client.retailValue}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        client.margin > 60 ? 'bg-emerald-50 text-emerald-600' :
                        client.margin > 30 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>{client.margin}%</span>
                    </td>
                    <td className="p-4 text-right tabular-nums">{client.aiCallCount}</td>
                  </tr>
                ))}
                {(!data.clientBreakdown || data.clientBreakdown.length === 0) && (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-[13px] text-[#1a1510]/40">
                      No client usage data yet. Run some AI workflows to see analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
