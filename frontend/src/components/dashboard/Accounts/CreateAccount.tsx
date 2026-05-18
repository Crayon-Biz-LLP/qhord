"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Building2, Target, Trophy, Wrench, ChevronDown, 
  MapPin, Users, DollarSign, Calendar, Tag, Info, Laptop,
  Cpu, Zap, Mail, Globe, Sparkles
} from "lucide-react";

interface CreateAccountProps {
  onBack: () => void;
  onSave: () => void;
}

export const CreateAccount = ({ onBack, onSave }: CreateAccountProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full bg-[#f7f8f9] text-[#1a1510] font-sans"
    >
      {/* Header */}
      <nav className="h-20 border-b border-[#1a1510]/5 bg-white flex items-center px-8 shrink-0 z-50 shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-[#f7f8f9] transition-colors group mr-4"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#1a1510] uppercase">New Account</h1>
          <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-0.5">
            Set up an account to organize your campaigns
          </p>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1: Account Details */}
          <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-[#f7f8f9] text-[#1a1510]/40 rounded-xl"><Building2 size={18} /></div>
               <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Account Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Account Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nike, US Enterprise SaaS" 
                  className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium focus:border-brand-gold/30 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Account Type</label>
                  <div className="relative">
                    <select className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium focus:border-brand-gold/30 outline-none appearance-none cursor-pointer">
                      <option>Company</option>
                      <option>Segment</option>
                      <option>Territory</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Status</label>
                  <div className="relative">
                    <select className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium focus:border-brand-gold/30 outline-none appearance-none cursor-pointer">
                      <option>Active</option>
                      <option>Paused</option>
                      <option>Draft</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1a1510]/20 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Owner</label>
                  <input type="text" placeholder="e.g. Sarah M." className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium outline-none shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Industry</label>
                  <input type="text" placeholder="e.g. Fintech, SaaS" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium outline-none shadow-inner" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Description / Notes</label>
                <textarea 
                  placeholder="What is this account about?" 
                  rows={4}
                  className="w-full p-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium outline-none shadow-inner resize-none min-h-[120px]"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Section 2: Targeting */}
          <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#f7f8f9] text-[#1a1510]/40 rounded-xl"><Target size={18} /></div>
               <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Targeting</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Geography</label>
                <input type="text" placeholder="e.g. US & UK, LATAM" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium shadow-inner outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">ICP / Target Segment</label>
                <input type="text" placeholder="e.g. VP Sales at Series B" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium shadow-inner outline-none" />
              </div>
            </div>
          </section>

          {/* Section 3: Goals */}
          <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-10 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#f7f8f9] text-[#1a1510]/40 rounded-xl"><Trophy size={18} /></div>
                 <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Goals</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#f7f8f9] text-[8px] font-black text-[#1a1510]/30 uppercase tracking-widest">Optional</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Revenue Goal ($)</label>
                <input type="text" placeholder="e.g. 500000" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium shadow-inner outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Meeting Goal</label>
                <input type="text" placeholder="e.g. 20" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium shadow-inner outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1a1510]/40 uppercase tracking-widest ml-1">Tags</label>
                <input type="text" placeholder="e.g. enterprise, high-priority" className="w-full h-14 px-6 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 text-sm font-medium shadow-inner outline-none" />
              </div>
            </div>
          </section>

          {/* Section 4: Default Tools */}
          <section className="bg-white rounded-[2.5rem] border border-[#1a1510]/5 p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#f7f8f9] text-[#1a1510]/40 rounded-xl"><Wrench size={18} /></div>
               <h3 className="text-xs font-black text-[#1a1510] uppercase tracking-widest">Default Tools</h3>
            </div>
            <p className="text-[10px] font-medium text-[#1a1510]/40 uppercase tracking-widest mb-6">Campaigns in this account will inherit these tools by default</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Apollo", icon: Globe, color: "text-blue-500" },
                { name: "Clay", icon: Sparkles, color: "text-brand-gold" },
                { name: "Smartlead", icon: Zap, color: "text-purple-500" },
                { name: "HeyReach", icon: Users, color: "text-blue-600" },
                { name: "HubSpot", icon: Database, color: "text-orange-500" },
                { name: "Salesforce", icon: Cloud, color: "text-blue-400" },
                { name: "OpenAI", icon: Cpu, color: "text-emerald-500" },
              ].map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f7f8f9] border border-[#1a1510]/5 group hover:border-[#1a1510]/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-white rounded-lg shadow-sm ${tool.color}`}><tool.icon size={14} /></div>
                    <span className="text-xs font-black text-[#1a1510] uppercase tracking-widest">{tool.name}</span>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-[#1a1510]/5 relative cursor-pointer overflow-hidden p-1 shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Form Actions (Integrated into flow) */}
          <div className="flex items-center justify-end gap-3 pt-6 pb-20">
            <button 
              onClick={onBack}
              className="h-12 px-8 rounded-xl border border-[#1a1510]/10 text-xs font-black uppercase tracking-widest text-[#1a1510] hover:bg-white transition-all shadow-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              className="h-12 px-10 rounded-xl bg-[#1a1510] text-brand-gold text-xs font-black uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-all"
            >
              Save Account
            </button>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

// Dummy icons for tools since I missed some in the map
function Database(props: any) { return <Laptop {...props} /> }
function Cloud(props: any) { return <Globe {...props} /> }
