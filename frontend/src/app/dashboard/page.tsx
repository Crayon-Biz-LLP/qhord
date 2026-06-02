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
       const token = localStorage.getItem("auth_token");
       const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

       const [metricsRes, campaignsRes, executionsRes] = await Promise.all([
         fetch("http://localhost:4000/api/dashboard/metrics", { headers }),
         fetch("http://localhost:4000/api/campaigns", { headers }),
         fetch("http://localhost:4000/api/executions", { headers }),
       ]);

       const metrics = await metricsRes.json();
       if (metrics.success) setDashboardMetrics(metrics.metrics);

       const campaigns = await campaignsRes.json();
       if (campaigns.campaigns) setRecentCampaigns(campaigns.campaigns.slice(0, 2));

       const executions = await executionsRes.json();
       if (executions.executions) setRecentExecutions(executions.executions.slice(0, 3));
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
       const token = localStorage.getItem("auth_token");
       const response = await fetch("http://localhost:4000/api/campaigns/plan", {
         method: "POST",
         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
         body: JSON.stringify({ prompt })
       });
       const data = await response.json();
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
                 <span className="text-[9px] font-bold text-[#1a1510]/30 uppercase tracking-widest">Active Node: Main</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="h-9 px-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center gap-2">
               <span className="text-[10px] font-bold text-emerald-600">● All systems live</span>
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
              <p className="text-sm font-medium text-[#1a1510]/40">{currentDate} — {dashboardMetrics?.totalLeads ? `${dashboardMetrics.totalLeads} leads collected` : 'GTM pipeline ready'}</p>
          </motion.div>
          <div className="flex gap-4">
             <button 
                onClick={() => router.push('/dashboard/command')}
                className="h-12 px-6 rounded-xl border border-[#1a1510]/10 text-xs font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-white transition-all shadow-sm"
             >
                <Terminal size={14} /> Operating Room
             </button>
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="h-12 px-6 rounded-xl bg-brand-gold text-[#1a1510] text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-brand-gold/20 hover:translate-y-[-1px] transition-all"
              >
                <Plus size={16} strokeWidth={3} /> New Campaign
             </button>
          </div>
        </section>

        {/* Global Performance Header - Premium Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
              { label: "Active Campaigns", val: dashboardMetrics?.activeCampaigns || "0", color: "text-emerald-500", icon: Layers },
              { label: "Total Leads", val: dashboardMetrics?.totalLeads || "0", color: "text-blue-500", icon: Users },
              { label: "Total Emails Sent", val: dashboardMetrics?.totalEmails || "0", color: "text-brand-gold", icon: Target },
              { label: "Total Campaigns", val: dashboardMetrics?.totalCampaigns || "0", color: "text-blue-500", icon: Bot },
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
              <div className={`w-14 h-14 rounded-2xl bg-[#f7f8f9] flex items-center justify-center text-brand-gold ${isCreating ? 'animate-pulse' : ''}`}>
                 {isCreating ? <RefreshCw size={28} className="animate-spin" /> : <Wand2 size={28} />}
              </div>
              <input 
                 type="text" 
                 value={promptInput}
                 onChange={(e) => setPromptInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && createCampaign(promptInput)}
                 placeholder="Describe what you want to build... e.g. 'Send 100 B2B leads from Apollo to Smartlead with 2-day warmup'"
                 className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium placeholder:text-[#1a1510]/20"
                 disabled={isCreating}
              />
              <button 
                 onClick={() => createCampaign(promptInput)}
                 disabled={!promptInput.trim() || isCreating}
                 className="h-12 px-10 rounded-2xl bg-[#1a1510] text-brand-gold text-xs font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isCreating ? 'Creating...' : 'Generate'}
              </button>
           </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Column: Campaigns & Operator */}
           <div className="lg:col-span-2 space-y-10">
               {/* Recent Executions */}
               <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm overflow-hidden p-8 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <Activity size={24} />
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <h2 className="text-lg font-black tracking-tight text-[#1a1510]">Recent Pipeline Runs</h2>
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          </div>
                          <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-1">Real execution logs</p>
                       </div>
                    </div>
                    <button onClick={() => router.push('/dashboard/executions')} className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline">View All</button>
                 </div>

                 <div className="space-y-2">
                    {recentExecutions.length === 0 ? (
                       <p className="text-sm text-[#1a1510]/40 text-center py-6">No executions yet. Run a pipeline from Workflows.</p>
                    ) : recentExecutions.map((exe, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 bg-[#fcfcfc] border border-[#1a1510]/5 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${exe.status === 'success' ? 'bg-emerald-50 text-emerald-600' : exe.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                             {exe.status === 'success' ? '✓' : exe.status === 'error' ? '✗' : '○'}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-black text-[#1a1510] truncate">{exe.tool_name}.{exe.action}</p>
                             <p className="text-[10px] text-[#1a1510]/40 truncate">{new Date(exe.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase ${exe.status === 'success' ? 'bg-emerald-50 text-emerald-600' : exe.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                             {exe.status}
                          </span>
                       </div>
                    ))}
                 </div>
               </section>

               {/* Recent Campaigns */}
               <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f7f8f9] rounded-xl text-[#1a1510]"><Activity size={20} /></div>
                        <h2 className="text-base font-black tracking-tight text-[#1a1510]">Recent Campaigns</h2>
                     </div>
                     <button onClick={() => router.push('/dashboard/campaigns')} className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">All Campaigns <ChevronRight size={14} /></button>
                  </div>
                  
                  <div className="space-y-3">
                     {recentCampaigns.length === 0 ? (
                       <p className="text-sm text-[#1a1510]/40 text-center py-6">No campaigns yet. Run a pipeline from Workflows.</p>
                     ) : recentCampaigns.map((cp, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#fcfcfc] border border-[#1a1510]/5">
                           <div className="w-9 h-9 rounded-lg bg-white border border-[#1a1510]/10 flex items-center justify-center text-brand-gold font-black text-xs uppercase">
                              {cp.name?.charAt(0) || 'C'}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-[#1a1510] truncate">{cp.name}</p>
                              <p className="text-[10px] text-[#1a1510]/40">{(cp.manifest as any)?.steps?.length || 0} steps · {cp.status}</p>
                           </div>
                           <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase ${cp.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : cp.status === 'executing' ? 'bg-blue-50 text-blue-600' : cp.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                              {cp.status}
                           </span>
                        </div>
                     ))}
                  </div>
               </section>
           </div>

            {/* Right Column: Quick Run */}
            <div className="space-y-10">
               <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-orange-50 rounded-xl text-orange-500"><Zap size={20} /></div>
                     <h2 className="text-base font-black tracking-tight text-[#1a1510]">Quick Pipeline</h2>
                  </div>
                  <div className="space-y-3">
                     <input
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createCampaign(promptInput)}
                        placeholder="e.g. find 5 leads from hunter..."
                        className="w-full h-12 px-5 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-gold/20"
                     />
                     <button
                        onClick={() => router.push('/dashboard/workflows')}
                        className="w-full h-12 rounded-2xl bg-[#1a1510] text-brand-gold text-xs font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
                     >
                        <Sparkles size={16} /> Open Workflows
                     </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#fcfcfc] border border-[#1a1510]/5">
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mb-2">TOOLS READY</p>
                     <div className="flex flex-wrap gap-2">
                        {['Hunter', 'BetterContacts', 'Brevo', 'Calendly'].map(t => (
                           <span key={t} className="text-[9px] font-bold px-3 py-1.5 rounded-lg bg-white border border-[#1a1510]/5 text-[#1a1510]">{t}</span>
                        ))}
                     </div>
                  </div>
               </section>

               <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Users size={20} /></div>
                     <h2 className="text-base font-black tracking-tight text-[#1a1510]">Leads</h2>
                  </div>
                  <div className="text-center">
                     <p className="text-4xl font-black text-[#1a1510]">{dashboardMetrics?.totalLeads || '0'}</p>
                     <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-1">Total Collected</p>
                  </div>
                  <button onClick={() => router.push('/dashboard/leads')} className="w-full h-12 rounded-2xl border border-[#1a1510]/5 text-[10px] font-black uppercase tracking-widest text-[#1a1510] hover:bg-[#f7f8f9] transition-all">
                     View Leads
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
