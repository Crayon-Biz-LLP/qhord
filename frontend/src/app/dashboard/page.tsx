"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Bot, Search, Bell, LogOut, Terminal, 
  Activity, Cpu, ShieldCheck, Target, Users, LayoutDashboard, Mail, ChevronRight, Box, Zap,
  Wand2, RefreshCw, Clock, Layers, MessageSquare, DollarSign, CreditCard, Sparkles, Moon, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { api } from "../../lib/api";

export default function DashboardHub() {
  const router = useRouter();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
   const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
   const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
   const [recentExecutions, setRecentExecutions] = useState<any[]>([]);

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

    const fetchData = async () => {
      try {
        const [metricsRes, campaignsRes, executionsRes] = await Promise.all([
          api.get("/dashboard/metrics"),
          api.get("/campaigns"),
          api.get("/executions"),
        ]);

        if (metricsRes.data.success) setDashboardMetrics(metricsRes.data.metrics);
        if (campaignsRes.data.campaigns) setRecentCampaigns(campaignsRes.data.campaigns.slice(0, 2));
        if (executionsRes.data.executions) setRecentExecutions(executionsRes.data.executions.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    useEffect(() => { fetchData(); }, []);

    const createCampaign = async (prompt: string) => {
      if (!prompt.trim()) return;
      setIsCreating(true);
      setLastResult(null);
      try {
        const response = await api.post("/campaigns/plan", { prompt });
        const data = response.data;
       if (data.success) {
         setLastResult(data);
         setPromptInput("");
         fetchData();
       } else {
         setLastResult({ error: data.error });
       }
     } catch (error) {
       setLastResult({ error: error instanceof Error ? error.message : 'Unknown error' });
     } finally {
       setIsCreating(false);
     }
   };

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
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
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
              <button className="btn-shine h-9 px-5 rounded-none bg-[#1a1510] text-[#fdfbf7] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:translate-y-[-1px] shadow-lg shadow-[#1a1510]/10">
                 <Plus size={14} /> Quick Actions
              </button>
           </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scrollbar-hide pb-32">
        
        {/* Welcome Section */}
        <section className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-[0.18em]">{currentDate}</span>
            </div>
            <h1 className="text-[2rem] sm:text-[2.5rem] font-bold tracking-tight text-[#1a1510] leading-[1.05] whitespace-nowrap">
              {greeting}, <span className="text-brand-gold">{user?.name || "Operator"}</span>
            </h1>
            <p className="text-sm text-[#1a1510]/45 mt-1.5">
              {dashboardMetrics?.totalLeads ? `${dashboardMetrics.totalLeads} leads collected — pipeline is humming.` : 'Your GTM pipeline is ready. Let’s build something.'}
            </p>
          </motion.div>
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={() => router.push('/dashboard/command')}
              className="btn-shine btn-shine-dark h-11 px-5 rounded-none border border-[#1a1510]/10 bg-white text-xs font-semibold text-[#1a1510] flex items-center gap-2 hover:bg-[#1a1510]/[0.02] hover:border-[#1a1510]/20 transition-colors"
            >
              <Terminal size={15} /> Operating Room
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-shine h-11 px-5 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} /> New Campaign
            </button>
          </div>
        </section>

        {/* Global Performance Header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
              { label: "Active Campaigns", val: dashboardMetrics?.activeCampaigns || "0", icon: Layers },
              { label: "Total Leads", val: dashboardMetrics?.totalLeads || "0", icon: Users },
              { label: "Total Emails Sent", val: dashboardMetrics?.totalEmails || "0", icon: Target },
              { label: "Total Campaigns", val: dashboardMetrics?.totalCampaigns || "0", icon: Bot },
           ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white border border-[#1a1510]/[0.07] rounded-2xl p-5 shadow-[0_1px_2px_rgba(26,21,16,0.04)] hover:shadow-[0_8px_24px_rgba(26,21,16,0.06)] hover:-translate-y-0.5 transition-all duration-200"
              >
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-[#1a1510]/40 uppercase tracking-wider">{stat.label}</span>
                    <stat.icon size={18} strokeWidth={2} className="text-[#1a1510]/30 group-hover:text-[#1a1510]/60 transition-colors" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-[2.5rem] font-bold text-[#1a1510] tracking-tight tabular-nums leading-none">{stat.val}</h3>
                    <span className="text-[11px] font-medium text-[#1a1510]/25 mb-1">total</span>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* AI Prompt Bar */}
        <div className="bg-white border border-[#1a1510]/[0.07] rounded-2xl p-3 flex items-center gap-3 focus-within:border-brand-gold/40 focus-within:ring-2 focus-within:ring-brand-gold/10 transition-all">
           <div className={`w-11 h-11 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 ${isCreating ? 'animate-pulse' : ''}`}>
              {isCreating ? <RefreshCw size={20} className="animate-spin" /> : <Wand2 size={20} />}
           </div>
           <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider">AI Campaign Builder</span>
              <input
                 type="text"
                 value={promptInput}
                 onChange={(e) => setPromptInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && createCampaign(promptInput)}
                 placeholder="Describe what you want to build… e.g. ‘Send 100 B2B leads from Apollo to Smartlead with 2-day warmup’"
                 className="w-full bg-transparent border-none focus:ring-0 p-0 text-[15px] text-[#1a1510] placeholder:text-[#1a1510]/25"
                 disabled={isCreating}
              />
           </div>
           <button
              onClick={() => createCampaign(promptInput)}
              disabled={!promptInput.trim() || isCreating}
              className="btn-shine h-11 px-7 rounded-none bg-[#1a1510] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#2a2118] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
           >
              {isCreating ? 'Creating…' : <>Generate <Sparkles size={14} /></>}
           </button>
        </div>

        {/* Live Result Display */}
        {lastResult && (
          <div className="mt-6">
            {lastResult.success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-emerald-800">🎉 Campaign Created Successfully!</h3>
                  <button 
                    onClick={() => setLastResult(null)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Campaign ID:</span> {lastResult.campaignId}
                  </div>
                  <div>
                    <span className="font-semibold">Name:</span> {lastResult.plan?.name}
                  </div>
                  <div>
                    <span className="font-semibold">Steps:</span> {lastResult.plan?.steps?.length || 0}
                  </div>
                  <div>
                    <span className="font-semibold">Cost:</span> ${lastResult.estimatedCost}
                  </div>
                </div>
                
                {/* LangGraph Nodes Status */}
                <div className="mt-4 p-4 bg-emerald-100 rounded-xl">
                  <h4 className="font-bold text-emerald-800 mb-2">🔄 LangGraph Execution Flow</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-200 rounded border border-green-300">
                      <div className="font-bold">✅ Parser</div>
                      <div>Understanding</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-200 rounded border border-yellow-300">
                      <div className="font-bold">✅ Architect</div>
                      <div>Planning</div>
                    </div>
                    <div className="text-center p-2 bg-blue-200 rounded border border-blue-300">
                      <div className="font-bold">✅ Validator</div>
                      <div>Guardrails</div>
                    </div>
                    <div className="text-center p-2 bg-purple-200 rounded border border-purple-300">
                      <div className="font-bold">✅ Executor</div>
                      <div>Saving</div>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 mt-2 text-center">
                    All 4 LangGraph nodes executed successfully!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-red-800">❌ Error</h3>
                  <button 
                    onClick={() => setLastResult(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-red-600">{lastResult.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Two-Column Deep Context */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left Column: Campaigns & Operator */}
           <div className="lg:col-span-2 space-y-6">
               {/* Recent Executions */}
               <section className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 space-y-5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <Activity size={19} />
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <h2 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Recent Pipeline Runs</h2>
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          </div>
                          <p className="text-[11px] font-medium text-[#1a1510]/35 mt-0.5">Real execution logs</p>
                       </div>
                    </div>
                    <button onClick={() => router.push('/dashboard/executions')} className="text-[11px] font-semibold text-brand-gold hover:underline">View all</button>
                 </div>

                 <div className="space-y-2">
                    {recentExecutions.length === 0 ? (
                       <p className="text-sm text-[#1a1510]/40 text-center py-6">No executions yet. Run a pipeline from Workflows.</p>
                    ) : recentExecutions.map((exe, i) => (
                       <div key={i} className="flex items-center gap-3 p-3.5 bg-[#fafafa] border border-[#1a1510]/[0.05] rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${exe.status === 'success' ? 'bg-emerald-50 text-emerald-600' : exe.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                             {exe.status === 'success' ? '✓' : exe.status === 'error' ? '✗' : '○'}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[13px] font-semibold text-[#1a1510] truncate">{exe.tool_name}.{exe.action}</p>
                             <p className="text-[11px] text-[#1a1510]/40 truncate">{new Date(exe.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${exe.status === 'success' ? 'bg-emerald-50 text-emerald-600' : exe.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                             {exe.status}
                          </span>
                       </div>
                    ))}
                 </div>
               </section>

               {/* Recent Campaigns */}
               <section className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 space-y-5">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#f7f8f9] rounded-lg text-[#1a1510]/70"><Activity size={19} /></div>
                        <h2 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Recent Campaigns</h2>
                     </div>
                     <button onClick={() => router.push('/dashboard/campaigns')} className="text-[11px] font-semibold text-brand-gold hover:underline flex items-center gap-1">All campaigns <ChevronRight size={14} /></button>
                  </div>
                  
                  <div className="space-y-3">
                     {recentCampaigns.length === 0 ? (
                       <p className="text-sm text-[#1a1510]/40 text-center py-6">No campaigns yet. Run a pipeline from Workflows.</p>
                     ) : recentCampaigns.map((cp, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fafafa] border border-[#1a1510]/[0.05]">
                           <div className="w-9 h-9 rounded-lg bg-white border border-[#1a1510]/10 flex items-center justify-center text-brand-gold font-bold text-xs uppercase">
                              {cp.name?.charAt(0) || 'C'}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#1a1510] truncate">{cp.name}</p>
                              <p className="text-[11px] text-[#1a1510]/40">{(cp.manifest as any)?.steps?.length || 0} steps · {cp.status}</p>
                           </div>
                           <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${cp.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : cp.status === 'executing' ? 'bg-blue-50 text-blue-600' : cp.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                              {cp.status}
                           </span>
                        </div>
                     ))}
                  </div>
               </section>
           </div>

            {/* Right Column: Quick Run */}
            <div className="space-y-6">
               <section className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-lg text-orange-500"><Zap size={19} /></div>
                     <h2 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Quick Pipeline</h2>
                  </div>
                  <div className="space-y-2.5">
                     <input
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createCampaign(promptInput)}
                        placeholder="e.g. find 5 leads from hunter…"
                        className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-sm outline-none focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 transition-all"
                     />
                     <button
                        onClick={() => router.push('/dashboard/workflows')}
                        className="btn-shine w-full h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2"
                     >
                        <Sparkles size={15} /> Open Workflows
                     </button>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#1a1510]/[0.05]">
                     <p className="text-[10px] font-semibold text-[#1a1510]/35 uppercase tracking-wider mb-2.5">Tools ready</p>
                     <div className="flex flex-wrap gap-1.5">
                        {['Hunter', 'BetterContacts', 'Brevo', 'Calendly'].map(t => (
                           <span key={t} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#1a1510]/[0.07] text-[#1a1510]/70">{t}</span>
                        ))}
                     </div>
                  </div>
               </section>

               <section className="bg-white rounded-2xl border border-[#1a1510]/[0.07] p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg text-blue-500"><Users size={19} /></div>
                     <h2 className="text-[15px] font-semibold tracking-tight text-[#1a1510]">Leads</h2>
                  </div>
                  <div className="text-center py-2">
                     <p className="text-4xl font-bold text-[#1a1510] tabular-nums">{dashboardMetrics?.totalLeads || '0'}</p>
                     <p className="text-[11px] font-medium text-[#1a1510]/35 uppercase tracking-wider mt-1">Total collected</p>
                  </div>
                  <button onClick={() => router.push('/dashboard/leads')} className="btn-shine btn-shine-dark w-full h-11 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors">
                     View leads
                  </button>
               </section>
            </div>
        </div>
      </main>
      
      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(campaign) => {
          console.log('Campaign created from dashboard:', campaign);
          setLastResult(campaign);
        }}
      />
    </div>
  );
}
