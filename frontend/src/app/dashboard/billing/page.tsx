"use client";

import React, { useState, useEffect } from "react";
import {
  Zap, Crown, Building2, Check, LayoutDashboard, Search, Bell, Ghost, Sparkles, Rocket
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";

interface Plan {
  id: string;
  name: string;
  tagline: string | null;
  price: string;
  credits: string | null;
  features: string[];
  is_custom: boolean;
  button_text: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await api.get('/plans');
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const getIcon = (name: string) => {
    const lName = name.toLowerCase();
    if (lName.includes('starter')) return Zap;
    if (lName.includes('growth')) return Rocket;
    if (lName.includes('pro')) return Crown;
    return Building2;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-[#b99b7b]/30">
      {/* Top Header Match Sidebar height roughly */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 shadow-sm relative">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1510] text-[#b99b7b] rounded-xl shadow-lg shrink-0">
               <LayoutDashboard size={18} />
            </div>
            <div className="hidden sm:block truncate">
               <h2 className="text-sm font-black tracking-tight text-[#1a1510] uppercase truncate">Billing & Usage</h2>
               <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5 truncate">
                  Track spending, forecast usage, and optimize efficiency
               </p>
            </div>
         </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 space-y-10">
          
          <div className="space-y-6">
            <div className="space-y-1">
               <h2 className="text-xl font-black tracking-tight uppercase">Plans</h2>
               <p className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">Choose the plan that fits your GTM motion</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-white rounded-[2rem] h-[450px] border border-[#1a1510]/5 p-6 flex flex-col gap-4">
                       <div className="w-12 h-12 bg-[#1a1510]/5 rounded-xl"></div>
                       <div className="w-24 h-6 bg-[#1a1510]/5 rounded mt-2"></div>
                       <div className="w-full h-10 bg-[#1a1510]/5 rounded mb-4"></div>
                       <div className="flex-1 space-y-4">
                          <div className="w-full h-3 bg-[#1a1510]/5 rounded"></div>
                          <div className="w-5/6 h-3 bg-[#1a1510]/5 rounded"></div>
                          <div className="w-4/6 h-3 bg-[#1a1510]/5 rounded"></div>
                       </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                  const Icon = getIcon(plan.name);
                  const isCurrent = plan.name.toLowerCase() === 'growth'; // Based on screenshot logic
                  
                  return (
                    <div 
                      key={plan.id} 
                      className={`relative bg-white rounded-[2rem] p-6 sm:p-8 flex flex-col items-start text-left border ${isCurrent ? 'border-[#b99b7b] shadow-md shadow-[#b99b7b]/10' : 'border-[#1a1510]/5 shadow-sm'} transition-all`}
                    >
                      {/* Current Plan Badge */}
                      {isCurrent && (
                        <div className="absolute top-6 right-6 bg-[#b99b7b]/10 text-[#b99b7b] px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest">
                           Current
                        </div>
                      )}

                      <div className="w-12 h-12 rounded-2xl bg-[#1a1510] text-[#b99b7b] flex items-center justify-center mb-6 shadow-inner">
                         <Icon size={24} />
                      </div>
                      
                      <h3 className="text-xl font-black text-[#1a1510] uppercase tracking-tight">{plan.name}</h3>
                      <p className="text-[10px] font-bold text-[#1a1510]/40 uppercase tracking-widest mt-1.5 min-h-[32px] leading-relaxed w-[90%]">{plan.tagline}</p>
                      
                      <div className="mt-6 mb-6">
                         {plan.is_custom ? (
                            <div className="text-3xl font-black tracking-tighter text-[#1a1510]">{plan.price}</div>
                         ) : (
                            <div className="flex items-baseline gap-1 text-[#1a1510]">
                               <span className="text-4xl font-black tracking-tighter">${plan.price}</span>
                               <span className="text-[11px] font-bold text-[#1a1510]/40 uppercase tracking-widest">/mo</span>
                            </div>
                         )}
                         <div className="flex items-center gap-2 mt-3 bg-[#1a1510]/5 px-3 py-1.5 rounded-lg w-max">
                           <Zap size={12} className="text-[#b99b7b] fill-[#b99b7b]" />
                           <span className="text-[10px] font-black text-[#1a1510] uppercase tracking-wider">{plan.credits}</span>
                         </div>
                      </div>

                      <div className="h-px w-full bg-[#1a1510]/5 my-2" />

                      <ul className="flex-1 space-y-4 py-5 w-full">
                        {plan.features.map((feature, i) => (
                           <li key={i} className="flex items-start gap-3">
                              <Check size={14} className="text-[#b99b7b] shrink-0 mt-0.5" strokeWidth={4} />
                              <span className="text-[11px] font-bold text-[#1a1510]/70 uppercase tracking-widest leading-relaxed">{feature}</span>
                           </li>
                        ))}
                      </ul>

                      <button 
                         className={`w-full mt-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                            isCurrent 
                            ? 'bg-[#1a1510]/5 text-[#1a1510]/40 cursor-default shadow-none border border-transparent' 
                            : plan.button_text.toLowerCase() === 'upgrade to pro'
                              ? 'bg-[#1a1510] hover:bg-[#2a221a] hover:translate-y-[-2px] text-[#b99b7b] shadow-xl'
                              : 'bg-white border-2 border-[#1a1510]/10 text-[#1a1510] hover:bg-[#f7f8f9] hover:border-[#1a1510]/20'
                         }`}
                      >
                         {plan.button_text}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
