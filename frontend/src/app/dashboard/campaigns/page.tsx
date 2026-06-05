"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, Database, Plus, CheckCircle, Clock, RefreshCw, MoreHorizontal, Target,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { Loader } from "@/components/ui/Loader";

export default function CampaignsPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:4000/api/campaigns", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#D4AF37]/30">
      
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a1510] text-brand-gold rounded-xl shadow-lg shrink-0">
            <Target size={18} />
          </div>
          <div className="hidden sm:block truncate">
            <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Campaigns</h2>
            <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
               Tactical Orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="h-10 px-3 sm:px-5 rounded-xl border border-[#1a1510]/10 text-[10px] font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-[#f7f8f9] transition-all"
          >
            <LayoutDashboard size={14} /> <span className="hidden sm:inline">Back</span>
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 sm:px-6 rounded-xl bg-brand-gold text-[#1a1510] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:translate-y-[-1px] transition-all"
          >
            <Plus size={14} /> <span className="hidden xs:inline">New Campaign</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
           
           <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white rounded-xl p-6 border border-[#1a1510]/5 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <span className="text-xs font-bold text-[#1a1510]/40 uppercase tracking-widest">TOTAL CAMPAIGNS</span>
                   <Database className="w-4 h-4 text-brand-gold" />
                 </div>
                 <div className="text-2xl font-bold text-[#1a1510]">{campaigns.length}</div>
                 <div className="text-xs text-[#1a1510]/40">Created by you</div>
               </div>
               
               <div className="bg-white rounded-xl p-6 border border-[#1a1510]/5 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <span className="text-xs font-bold text-[#1a1510]/40 uppercase tracking-widest">APPROVED</span>
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div className="text-2xl font-bold text-[#1a1510]">
                   {campaigns.filter(c => c.status === 'approved').length}
                 </div>
                 <div className="text-xs text-[#1a1510]/40">Ready for execution</div>
               </div>
               
               <div className="bg-white rounded-xl p-6 border border-[#1a1510]/5 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <span className="text-xs font-bold text-[#1a1510]/40 uppercase tracking-widest">PENDING</span>
                   <Clock className="w-4 h-4 text-orange-500" />
                 </div>
                 <div className="text-2xl font-bold text-[#1a1510]">
                   {campaigns.filter(c => c.status === 'pending_approval').length}
                 </div>
                 <div className="text-xs text-[#1a1510]/40">Awaiting approval</div>
               </div>
             </div>
           </div>

           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a1510]">Your Campaigns</h3>
              <div className="flex items-center gap-2">
                 <button className="p-2 bg-white border border-[#1a1510]/5 rounded-lg hover:bg-[#f7f8f9] transition-colors">
                    <RefreshCw size={16} className="text-[#1a1510]/60" />
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-xl border border-[#1a1510]/5 overflow-hidden">
              {loading ? (
                 <div className="p-8 flex flex-col items-center justify-center gap-4">
                    <Loader size={36} />
                    <p className="text-[13px] text-[#1a1510]/40">Loading campaigns…</p>
                 </div>
              ) : campaigns.length === 0 ? (
                 <div className="p-8 text-center">
                    <Bot className="w-12 h-12 text-[#1a1510]/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#1a1510] mb-2">No campaigns yet</h3>
                    <p className="text-[#1a1510]/60 mb-4">Create your first AI-powered campaign</p>
                    <button 
                       onClick={() => setIsCreateModalOpen(true)}
                       className="px-4 py-2 bg-brand-gold text-[#1a1510] rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors"
                    >
                       Create Campaign
                    </button>
                 </div>
              ) : (
                 <div className="divide-y divide-[#1a1510]/5">
                    {campaigns.map((campaign) => (
                       <div key={campaign.id} className="p-6 hover:bg-[#f7f8f9] transition-colors">
                          <div className="flex items-center justify-between">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <h4 className="font-bold text-[#1a1510]">{campaign.name}</h4>
                                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      campaign.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                      campaign.status === 'pending_approval' ? 'bg-orange-100 text-orange-700' :
                                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                      'bg-blue-100 text-blue-700'
                                   }`}>
                                      {campaign.status}
                                   </span>
                                </div>
                                <p className="text-sm text-[#1a1510]/60 mb-2">{campaign.description}</p>
                                <div className="flex items-center gap-4 text-xs text-[#1a1510]/40">
                                   <span>💰 ${campaign.estimatedCost}</span>
                                   <span>⏱️ {campaign.estimatedDuration} min</span>
                                   <span>📊 {campaign.stepCount} steps</span>
                                   <span>📅 {new Date(campaign.createdAt).toLocaleDateString()}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                {campaign.status === 'draft' && (
                                   <button className="px-3 py-1 bg-brand-gold text-[#1a1510] rounded-lg text-xs font-semibold hover:bg-brand-gold/90 transition-colors">
                                      Submit for Approval
                                   </button>
                                )}
                                <button className="p-2 bg-white border border-[#1a1510]/5 rounded-lg hover:bg-[#f7f8f9] transition-colors">
                                   <MoreHorizontal size={16} className="text-[#1a1510]/60" />
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(campaign) => {
          console.log('Campaign created:', campaign);
          fetchCampaigns();
        }}
      />
        </div>
      </main>
    </div>
  );
}
