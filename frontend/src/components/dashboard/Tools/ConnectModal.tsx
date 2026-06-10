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
               initial={{ scale: 0.95, opacity: 0, y: 16 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 16 }}
               className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#1a1510]/[0.06] overflow-hidden p-6 sm:p-7"
            >
               <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
                        <Shield size={17} />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold tracking-tight text-[#1a1510]">Connect {tool?.name}</h2>
                        <p className="text-[12px] text-[#1a1510]/45 mt-0.5">Encrypted in transit &amp; at rest</p>
                     </div>
                  </div>
                  <button
                     onClick={onClose}
                     className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1510]/40 hover:text-[#1a1510] hover:bg-[#f7f8f9] transition-colors shrink-0"
                  >
                     <X size={18} />
                  </button>
               </div>

               {status === "success" ? (
                  <motion.div
                     initial={{ opacity: 0, y: 8 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="py-8 flex flex-col items-center gap-4 text-center"
                  >
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={30} strokeWidth={2} />
                     </div>
                     <div>
                        <p className="text-[15px] font-semibold text-[#1a1510]">{tool?.name} connected</p>
                        <p className="text-[13px] text-[#1a1510]/40 mt-1">Syncing your account…</p>
                     </div>
                  </motion.div>
               ) : (
                  <form onSubmit={handleConnect} className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-[#1a1510]/60">Account label</label>
                        <input
                           required
                           type="text"
                           value={accountLabel}
                           onChange={(e) => setAccountLabel(e.target.value)}
                           placeholder="e.g. Master Sales Account"
                           className="w-full h-11 px-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all placeholder:text-[#1a1510]/30"
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-[#1a1510]/60">API key</label>
                        <div className="relative">
                           <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1510]/30 peer-focus:text-brand-gold" />
                           <input
                              required
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="Enter your API key…"
                              className="peer w-full h-11 pl-10 pr-4 rounded-xl bg-[#f7f8f9] border border-[#1a1510]/[0.07] text-[13px] focus:bg-white focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 focus:outline-none transition-all placeholder:text-[#1a1510]/30"
                           />
                        </div>
                     </div>

                     {status === "error" && (
                        <motion.div
                           initial={{ opacity: 0, y: -4 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="bg-red-50 border border-red-100 px-3.5 py-3 rounded-xl flex items-start gap-2.5"
                        >
                           <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                           <p className="text-[12px] font-medium text-red-600 leading-relaxed">{errorMessage}</p>
                        </motion.div>
                     )}

                     <div className="flex gap-2.5 pt-2">
                        <button
                           type="button"
                           onClick={onClose}
                           className="h-11 px-5 rounded-none border border-[#1a1510]/10 text-xs font-semibold text-[#1a1510] hover:bg-[#f7f8f9] transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={loading}
                           className="btn-shine flex-1 h-11 rounded-none bg-[#1a1510] text-white text-xs font-semibold hover:bg-[#2a2118] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {loading ? (
                              <>
                                 <Loader2 size={15} className="animate-spin" /> Connecting…
                              </>
                           ) : (
                              "Connect"
                           )}
                        </button>
                     </div>
                  </form>
               )}
            </motion.div>
         </div>
      </AnimatePresence>
   );
};
