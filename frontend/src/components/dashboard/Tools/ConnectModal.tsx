"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../../lib/api";

interface ConnectModalProps {
   isOpen: boolean;
   onClose: () => void;
   tool: { id: string; name: string } | null;
   clientId: string;
   onSuccess: () => void;
}

export const ConnectModal = ({ isOpen, onClose, tool, clientId, onSuccess }: ConnectModalProps) => {
   const [apiKey, setApiKey] = useState("");
   const [accountLabel, setAccountLabel] = useState("");
   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
   const [errorMessage, setErrorMessage] = useState("");

   const handleConnect = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!tool || !clientId) return;

      setLoading(true);
      setStatus("idle");
      setErrorMessage("");

      try {
         await api.post("/tools/accounts", {
            clientId,
            toolName: tool.id,
            accountLabel: accountLabel || `${tool.name} Account`,
            apiKey
         });
         setStatus("success");
         setTimeout(() => {
            onSuccess();
            onClose();
            // Reset state
            setApiKey("");
            setAccountLabel("");
            setStatus("idle");
         }, 1500);
      } catch (err: any) {
         setStatus("error");
         setErrorMessage(err.response?.data?.message || "Failed to establish connection. Verify API protocol.");
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen) return null;

   return (
      <AnimatePresence>
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={onClose}
               className="absolute inset-0 bg-[#1a1510]/40 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden p-8 sm:p-12"
            >
               <button
                  onClick={onClose}
                  className="absolute top-8 right-8 text-[#1a1510]/20 hover:text-[#1a1510] transition-colors"
               >
                  <X size={24} />
               </button>

               <div className="space-y-10">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-xl">
                           <Shield size={20} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-[#1a1510] uppercase">Connect {tool?.name}</h2>
                     </div>
                     <p className="text-[11px] font-bold text-[#1a1510]/30 uppercase tracking-widest leading-relaxed">
                        Establish a secure neural link between the Control Tower and your {tool?.name} instance. 
                        Your API data is encrypted in transit and at rest.
                     </p>
                  </div>

                  {status === "success" ? (
                     <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-12 flex flex-col items-center gap-6"
                     >
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                           <CheckCircle2 size={40} strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                           <p className="text-lg font-black text-[#1a1510]">Protocol Established</p>
                           <p className="text-[10px] font-bold text-[#1a1510]/30 uppercase tracking-widest mt-1">Data sync in progress...</p>
                        </div>
                     </motion.div>
                  ) : (
                     <form onSubmit={handleConnect} className="space-y-6">
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest px-1">Account Label</label>
                              <div className="relative group">
                                 <input
                                    required
                                    type="text"
                                    value={accountLabel}
                                    onChange={(e) => setAccountLabel(e.target.value)}
                                    placeholder="e.g. Master Sales Account"
                                    className="w-full h-14 pl-6 pr-6 rounded-2xl bg-[#f7f8f9] border border-transparent text-sm font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/10"
                                 />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-[#1a1510]/30 tracking-widest px-1">API Key / Protocol Token</label>
                              <div className="relative group">
                                 <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a1510]/10 group-focus-within:text-brand-gold transition-colors" />
                                 <input
                                    required
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter secure token..."
                                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[#f7f8f9] border border-transparent text-sm font-bold focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-[#1a1510]/10"
                                 />
                              </div>
                           </div>
                        </div>

                        {status === "error" && (
                           <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3"
                           >
                              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] font-bold text-red-600 leading-normal">{errorMessage}</p>
                           </motion.div>
                        )}

                        <button
                           type="submit"
                           disabled={loading}
                           className="w-full h-14 bg-[#1a1510] text-brand-gold rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {loading ? (
                              <>
                                 <Loader2 size={18} className="animate-spin" />
                                 <span>Establishing...</span>
                              </>
                           ) : (
                              <span>Authorize Connection</span>
                           )}
                        </button>
                     </form>
                  )}
               </div>
            </motion.div>
         </div>
      </AnimatePresence>
   );
};
