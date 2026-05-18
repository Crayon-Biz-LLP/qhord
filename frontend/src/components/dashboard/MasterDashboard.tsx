import {
  LayoutDashboard, Users, Activity, Settings as SettingsIcon, Bell, Search, Plus, Cpu, Zap, ShieldCheck,
  Terminal, BarChart3, Mail, Target, ListTodo, GraduationCap, Box, Computer,
  Sparkles, Bot, CreditCard, DollarSign, ChevronRight, User as UserIcon, LogOut, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sidebar, DashboardView } from "./Sidebar/Sidebar";
import { CommandCenter } from "./CommandCenter/CommandCenter";
import { Campaigns } from "./Campaigns/Campaigns";
import { Accounts } from "./Accounts/Accounts";
import { Inbox } from "./Inbox/Inbox";
import { Pipeline } from "./Pipeline/Pipeline";
import { Leads } from "./Leads/Leads";
import { Tools } from "./Tools/Tools";
import { Playbooks } from "./Playbooks/Playbooks";
import { APIs } from "./APIs/APIs";
import { Pricing } from "./Pricing/Pricing";
import { Billing } from "./Billing/Billing";
import { Settings } from "./Settings/Settings";
import { Workflows } from "./Workflows/Workflows";

interface DashboardProps {
  onSignOut?: () => void;
  userName?: string;
}

export const Workflow = ({ onSignOut, userName = "Sarah" }: DashboardProps) => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [view, setView] = useState<DashboardView>('dashboard');

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
    const interval = setInterval(updateTimeContext, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-[#f7f8f9] text-[#1a1510] flex pt-0 relative overflow-hidden font-sans">
      <Sidebar 
        onSignOut={onSignOut} 
        activeView={view}
        onViewChange={(newView: DashboardView) => setView(newView)}
      />

      {/* Main Content Area */}
      {view === 'command' ? (
        <CommandCenter 
          onBackToDashboard={() => setView('dashboard')} 
          onOpenAccounts={() => setView('accounts')}
        />
      ) : view === 'workflows' ? (
        <Workflows onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'campaigns' ? (
        <Campaigns onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'accounts' ? (
        <Accounts onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'inbox' ? (
        <Inbox onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'pipeline' ? (
        <Pipeline onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'leads' ? (
        <Leads onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'tools' ? (
        <Tools onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'playbooks' ? (
        <Playbooks onBackToDashboard={() => setView('dashboard')} />
      ) : view === 'apis' ? (
        <APIs />
      ) : view === 'pricing' ? (
        <Pricing />
      ) : view === 'billing' ? (
        <Billing />
      ) : view === 'settings' ? (
        <Settings />
      ) : (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header Navigation */}
          <header className="h-16 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-8 shrink-0 z-20">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-4">
                  <button className="p-2 text-[#1a1510]/40"><Box size={18} /></button>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a1510]">
                     <span className="text-[#1a1510]">Control Tower</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="h-9 px-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/5 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#1a1510]/40">2,847 / 5,000 credits</span>
                  <div className="w-20 h-1.5 rounded-full bg-[#1a1510]/5">
                     <div className="w-[57%] h-full bg-brand-gold rounded-full"></div>
                  </div>
                  <button className="text-[10px] font-black text-brand-gold border-l border-[#1a1510]/5 pl-3">+ Buy</button>
               </div>
               
               <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1510]/30" />
                  <input type="text" placeholder="Search Command..." className="h-9 w-64 pl-11 pr-4 rounded-full bg-[#f7f8f9] border border-[#1a1510]/10 text-xs font-medium focus:ring-1 focus:ring-brand-gold/20 transition-all opacity-100" />
               </div>

               <div className="flex items-center gap-3">
                  <button className="h-9 px-5 rounded-full bg-[#1a1510] text-[#fdfbf7] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-brand-gold hover:text-[#1a1510]">
                     <Plus size={14} /> Quick Actions
                  </button>
                  <button className="h-9 px-5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     <Bot size={14} /> AI Operator
                  </button>
               </div>
               
               <div className="flex items-center gap-2 border-l border-[#1a1510]/10 pl-4">
                  <button className="p-2 text-[#1a1510]/60 hover:text-brand-gold relative transition-colors"><Bell size={18} /><span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span></button>
                  <button 
                     onClick={onSignOut}
                     className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#1a1510] hover:text-brand-gold transition-all ml-2 border border-transparent hover:border-brand-gold/10 rounded-full"
                  >
                     <LogOut size={16} className="text-brand-gold" />
                     Sign Out
                  </button>
               </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
            {/* Welcome Section */}
            <section className="flex items-end justify-between">
              <div>
                 <h1 className="text-2xl font-black tracking-tighter text-[#1a1510] mb-1 leading-none">{greeting}, {userName}</h1>
                 <p className="text-[11px] font-medium text-[#1a1510]/40">{currentDate} — Your GTM engine is running at <span className="text-emerald-500 font-bold">94% health</span></p>
              </div>
              <div className="flex gap-4">
                 <button 
                    onClick={() => setView('command')}
                    className="h-11 px-6 rounded-xl border border-[#1a1510]/10 text-xs font-black uppercase tracking-widest text-[#1a1510] flex items-center gap-2 hover:bg-white transition-all shadow-sm"
                 >
                    <Terminal size={14} /> Operating Room
                 </button>
                 <button className="h-11 px-6 rounded-xl bg-brand-gold text-[#1a1510] text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-brand-gold/20 transition-all">
                    <Plus size={14} /> New Campaign
                 </button>
              </div>
            </section>

            {/* AI Operator Hub */}
            <section className="bg-white rounded-[1.5rem] border border-[#1a1510]/5 shadow-sm overflow-hidden p-5 space-y-5">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                       <Bot size={20} />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <h2 className="text-base font-black tracking-tight text-[#1a1510]">AI Operator</h2>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       </div>
                       <p className="text-[10px] font-medium text-[#1a1510]/40">GTM system optimized in real time</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex gap-6">
                       {[
                          { label: "Revenue Protected", value: "$213K" },
                          { label: "Revenue Unlocked", value: "$42K" },
                          { label: "Auto-actions", value: "7" },
                       ].map((stat, i) => (
                          <div key={i} className="text-right">
                             <p className="text-[8px] font-black uppercase tracking-widest text-[#1a1510]/20 mb-0.5">{stat.label}</p>
                             <p className="text-xs font-black text-[#1a1510]">{stat.value}</p>
                          </div>
                       ))}
                    </div>
                    <div className="h-8 px-1.5 rounded-full bg-[#f7f8f9] flex items-center gap-0.5">
                       <button className="h-6 px-3 rounded-full bg-white text-[9px] font-black uppercase shadow-sm border border-[#1a1510]/5">Manual</button>
                       <button className="h-6 px-3 text-[9px] font-black uppercase text-[#1a1510]/30">Assisted</button>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                 {[
                    { title: "Pause Fintech Series B for 4 hours", desc: "Domain warm-up score dropped below threshold — pausing protects reput.", tag: "Protects $185K", health: "94% conf.", icon: Zap },
                    { title: "Increase SaaS Enterprise send volume by 15%", desc: "Reply rate is 2.1x above benchmark with healthy deliverability — safe to scale.", tag: "+$28k proj.", health: "88% conf.", icon: Activity },
                    { title: "Switch 132 failing Clay records to fallback provider", desc: "Enrichment records failed validation — Zoominfo fallback has 92% fill rate.", tag: "Recovers 132", health: "91% conf.", icon: Cpu },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-[#fcfcfc] border border-[#1a1510]/5 rounded-xl group hover:border-brand-gold/30 transition-all">
                       <div className="w-8 h-8 rounded-lg bg-white border border-[#1a1510]/5 flex items-center justify-center text-brand-gold">
                          <item.icon size={16} />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-[12px] font-black text-[#1a1510] mb-0">{item.title}</h4>
                          <p className="text-[10px] font-medium text-[#1a1510]/40 line-clamp-1">{item.desc}</p>
                       </div>
                       <div className="flex items-center gap-2 text-[9px] font-black">
                          <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">{item.tag}</span>
                          <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600">{item.health}</span>
                          <button className="h-7 px-3 rounded-md bg-[#1a1510] text-white uppercase tracking-widest text-[8px]">Approve</button>
                       </div>
                 </div>
                 ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                 <span className="text-[10px] font-bold text-[#1a1510]/40 italic">3 safe actions ready for execution</span>
                 <button className="h-10 px-8 rounded-xl bg-[#1a1510] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg hover:shadow-brand-gold/10 transition-all">
                    <ShieldCheck size={14} /> Execute All Safe Actions
                 </button>
              </div>
            </section>

            {/* Quick Metrics Grid */}
            <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                 { label: "PIPELINE GEN", value: "$745K", trend: "+$28K", icon: Target },
                 { label: "MEETINGS", value: "15", trend: "+3", icon: Users },
                 { label: "ACTIVE CP", value: "3", trend: "3 healthy", icon: LayoutDashboard },
                 { label: "REPLY RT", value: "8.3%", trend: "+1.1%", icon: Activity },
                 { label: "RISK", value: "$12K", trend: "-64%", icon: ShieldCheck, risk: true },
                 { label: "DELIV.", value: "98.2%", trend: "Safe", icon: Zap },
              ].map((stat, i) => (
                 <div key={i} className="bg-white p-4 rounded-[1.2rem] border border-[#1a1510]/5 shadow-sm space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-[#f7f8f9] flex items-center justify-center text-[#1a1510]/20">
                       <stat.icon size={14} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-[#1a1510]/30 tracking-widest uppercase mb-0.5">{stat.label}</p>
                       <h3 className="text-xl font-black tracking-tighter text-[#1a1510]">{stat.value}</h3>
                    </div>
                    <span className={`text-[9px] font-black ${stat.risk ? 'text-red-500' : 'text-emerald-500'}`}>{stat.trend}</span>
                 </div>
              ))}
            </section>

            {/* Two-Column Deep Context */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* Left Column: Campaigns & Feed */}
               <div className="lg:col-span-2 space-y-10">
                  <section className="bg-white rounded-[1.5rem] border border-[#1a1510]/5 shadow-sm p-5 space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-[#f7f8f9] rounded-lg text-[#1a1510]"><Activity size={16} /></div>
                           <h2 className="text-sm font-black tracking-tight text-[#1a1510]">Active Campaign Control</h2>
                        </div>
                        <button className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">All <ChevronRight size={12} /></button>
                     </div>
                     
                     <div className="space-y-2">
                        {[
                           { name: "Fintech Outreach", leads: "4", rev: "$185K", health: "92%" },
                           { name: "Enterprise SaaS", leads: "5", rev: "$320K", health: "78%" },
                        ].map((cp, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#fcfcfc] border border-[#1a1510]/5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white border border-[#1a1510]/10 flex items-center justify-center text-brand-gold font-black italic text-[10px]">G</div>
                                 <div>
                                    <h4 className="text-[11px] font-black text-[#1a1510] flex items-center gap-2">{cp.name}</h4>
                                    <p className="text-[9px] font-medium text-[#1a1510]/30">{cp.leads} leads • {cp.rev}</p>
                                 </div>
                              </div>
                              <div className="w-20 h-1.5 rounded-full bg-[#1a1510]/5 overflow-hidden">
                                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: cp.health }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-[2rem] border border-[#1a1510]/5 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Target size={18} className="text-brand-gold" />
                           <span className="text-xs font-black uppercase tracking-widest text-[#1a1510]">Live Feed</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#1a1510]/40">18 events today</span>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] border border-[#1a1510]/5 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <ShieldCheck size={18} className="text-brand-gold" />
                           <span className="text-xs font-black uppercase tracking-widest text-[#1a1510]">Since Yesterday</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#1a1510]/40">5 core changes</span>
                     </div>
                  </div>
               </div>

               {/* Right Column: Priorities & Notes */}
               <div className="space-y-10">
                  <section className="bg-white rounded-[1.5rem] border border-[#1a1510]/5 shadow-sm p-5 space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg text-orange-500"><Target size={16} /></div>
                        <h2 className="text-sm font-black tracking-tight text-[#1a1510]">Priorities</h2>
                     </div>
                     <div className="space-y-2">
                        {[
                           { id: 1, text: "Reply to high-intent leads", val: "~$85K at risk" },
                           { id: 2, text: "Review AI subject lines", val: "+12% opens" },
                        ].map((task, i) => (
                           <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-[#f7f8f9] transition-all">
                              <span className="w-5 h-5 rounded-md bg-[#f7f8f9] flex items-center justify-center text-[9px] font-black text-[#1a1510]/40">{task.id}</span>
                              <div>
                                 <p className="text-[10px] font-bold text-[#1a1510] leading-none mb-0.5">{task.text}</p>
                                 <p className="text-[8px] font-medium text-[#1a1510]/30 italic">{task.val}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>

                  <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 shadow-sm p-8 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Mail size={18} /></div>
                           <h2 className="text-lg font-black tracking-tight text-[#1a1510]">Notes & Tasks</h2>
                        </div>
                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">3 OPEN</span>
                     </div>
                     <div className="space-y-4">
                        <button className="w-full py-4 rounded-xl border-2 border-dashed border-[#1a1510]/5 text-[10px] font-black uppercase tracking-widest text-[#1a1510]/20 hover:border-brand-gold/40 hover:text-brand-gold transition-all">+ Add Note</button>
                        
                        <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-2xl relative">
                           <div className="absolute top-4 right-4 text-orange-200"><Target size={14} /></div>
                           <p className="text-[11px] font-medium text-[#1a1510] leading-relaxed mb-4">Follow up with Stripe lead — Sarah Chen interested in demo</p>
                           <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase py-1 px-2 bg-white border border-orange-100 rounded text-orange-600">2h ago</span>
                              <span className="text-[8px] font-black uppercase py-1 px-2 bg-[#1a1510] rounded text-white italic">Series B Fintech</span>
                           </div>
                        </div>
                     </div>
                  </section>
               </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};
