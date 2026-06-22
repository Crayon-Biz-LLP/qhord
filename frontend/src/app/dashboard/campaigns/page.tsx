"use client";

import React, { useState, useEffect } from "react";
import {
  Bot, Database, Plus, CheckCircle, Clock, RefreshCw, MoreHorizontal, Target,
  LayoutDashboard, ArrowUpRight, Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import { api } from "../../../lib/api";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get("/campaigns");
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBuild = () => router.push("/dashboard/campaigns/build");

  const stats = [
    { label: "Total Campaigns", value: campaigns.length, sub: "Created by you", icon: Database, tint: "text-brand-gold" },
    { label: "Approved", value: campaigns.filter((c) => c.status === "approved").length, sub: "Ready for execution", icon: CheckCircle, tint: "text-emerald-500" },
    { label: "Pending", value: campaigns.filter((c) => c.status === "pending_approval").length, sub: "Awaiting approval", icon: Clock, tint: "text-orange-500" },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">

      {/* Header */}
      <header className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
            <Target size={17} />
          </div>
          <div className="hidden sm:block truncate">
            <h1 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Campaigns</h1>
            <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Tactical orchestration</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-shine btn-shine-dark h-10 px-3 sm:px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] transition-colors"
          >
            <LayoutDashboard size={15} /> <span className="hidden sm:inline">Back to Hub</span>
          </button>
          <button
            onClick={goBuild}
            className="btn-shine h-10 px-4 sm:px-6 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors shrink-0"
          >
            <Plus size={15} /> <span className="hidden xs:inline">New Campaign</span><span className="xs:hidden">New</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">

          {/* Stat ribbon */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white p-5 rounded-2xl border border-[#1a1510]/[0.07] flex flex-col justify-between h-32 group hover:border-[#1a1510]/15 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#1a1510]/40 tracking-wider uppercase">{s.label}</span>
                  <s.icon size={15} className={s.tint} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#1a1510] tracking-tight tabular-nums">{s.value}</h3>
                  <p className="text-[11px] font-medium text-[#1a1510]/40 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Campaigns list */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[15px] font-bold text-[#1a1510]">Your Campaigns</h2>
              <button
                onClick={fetchCampaigns}
                className="w-9 h-9 flex items-center justify-center bg-white border border-[#1a1510]/[0.07] rounded-lg hover:bg-[#f7f8f9] transition-colors"
              >
                <RefreshCw size={15} className="text-[#1a1510]/50" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-hidden">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <Loader size={36} />
                  <p className="text-[13px] text-[#1a1510]/40">Loading campaigns…</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                  <div className="relative mb-5">
                    <div className="absolute -inset-2 bg-brand-gold/15 rounded-2xl blur-lg" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1510] to-[#2a2118] flex items-center justify-center text-brand-gold ring-1 ring-brand-gold/20">
                      <Bot size={24} />
                    </div>
                  </div>
                  <p className="text-[15px] font-semibold text-[#1a1510]">No campaigns yet</p>
                  <p className="text-[13px] text-[#1a1510]/40 mt-1.5 max-w-xs leading-relaxed">Create your first AI-powered campaign and it will appear here.</p>
                  <button
                    onClick={goBuild}
                    className="btn-shine mt-6 h-10 px-6 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
                  >
                    <Sparkles size={14} className="text-brand-gold" /> Create Campaign
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1510]/[0.06]">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-5 sm:p-6 hover:bg-[#fafafa] transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/40 group-hover:text-brand-gold transition-colors shrink-0">
                            <Target size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-[14px] font-semibold text-[#1a1510] truncate">{campaign.name}</h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                                campaign.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                campaign.status === "pending_approval" ? "bg-amber-50 text-amber-600" :
                                campaign.status === "draft" ? "bg-[#1a1510]/5 text-[#1a1510]/50" :
                                "bg-blue-50 text-blue-600"
                              }`}>
                                {String(campaign.status || "").replace("_", " ")}
                              </span>
                            </div>
                            {campaign.description && (
                              <p className="text-[13px] text-[#1a1510]/50 mt-1 line-clamp-1">{campaign.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-[#1a1510]/40">
                              {campaign.estimatedCost != null && <span>${campaign.estimatedCost} est. cost</span>}
                              {campaign.estimatedDuration != null && <span>{campaign.estimatedDuration} min</span>}
                              {campaign.stepCount != null && <span>{campaign.stepCount} steps</span>}
                              {campaign.createdAt && <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {campaign.status === "draft" && (
                            <button className="btn-shine h-9 px-4 rounded-none bg-[#1a1510] text-white text-[11px] font-semibold hover:bg-[#2a2118] transition-colors flex items-center gap-1.5">
                              <ArrowUpRight size={13} className="text-brand-gold" /> Submit
                            </button>
                          )}
                          <button className="w-9 h-9 flex items-center justify-center bg-white border border-[#1a1510]/[0.07] rounded-lg hover:bg-[#f7f8f9] transition-colors">
                            <MoreHorizontal size={16} className="text-[#1a1510]/50" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
