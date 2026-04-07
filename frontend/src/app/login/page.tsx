"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Zap, ChevronRight, Filter, ChevronLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login, register, loading } = useAuth(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) {
          setError("Name is required");
          setSubmitting(false);
          return;
        }
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Authentication failed. Protocol rejected.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden relative">
      {/* Soft Liquid Backdrop */}
      <div className="absolute inset-0 bg-[#D9BB9B]/5 backdrop-blur-3xl" />
      
      {/* Decorative Background Patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[#1a1510] [background-size:32px_32px]" style={{ backgroundImage: 'radial-gradient(#1a1510 1px, transparent 1px)' }} />
      </div>

      {/* Main Pipeline Container */}
      <motion.div
        layout
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ layout: { type: "spring", stiffness: 120, damping: 22 }, type: "spring", stiffness: 350, damping: 35 }}
        className={`relative w-full max-w-4xl min-h-[550px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(45,36,28,0.15)] flex flex-col md:flex-row ${!isLogin ? 'md:flex-row-reverse' : ''} overflow-hidden border border-white/60`}
      >
        {/* THE VISUAL PANEL (With Dynamic Custom Bots) */}
        <motion.div
          layout
          className="w-full h-[250px] md:h-auto md:w-[40%] bg-gradient-to-br from-[#1a1510] to-[#241c16] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group/funnel shrink-0"
        >
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="absolute inset-0">
              <pattern id="gridLarge" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#gridLarge)" />
            </svg>
          </div>

          {/* DYNAMIC HIGH-FIDELITY BOT PERSONAS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
             <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-bot"
                    initial={{ opacity: 0, y: -200, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: -100 }}
                    className="relative w-40 h-40 md:w-64 md:h-64"
                  >
                     <motion.div 
                       animate={{ 
                         scale: [1, 2.5, 1.2, 0.4, 1],
                         opacity: [0.6, 0.1, 0.6, 0.05, 0.6],
                       }}
                       transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-8 bg-[#D4AF37]/30 blur-2xl rounded-full" 
                     />
                     <div className="absolute inset-0 bg-[#D4AF37] blur-[80px] rounded-full scale-110 opacity-30 pointer-events-none animate-pulse" />
                     <motion.div 
                       animate={{ 
                         y: [0, -100, 0, -40, 0],
                         scaleY: [1, 1.25, 0.85, 1.15, 1],
                         scaleX: [1, 0.85, 1.15, 0.9, 1],
                       }}
                       transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 0.8, 1] }}
                       className="w-full h-full relative"
                     >
                        <img src="/welcome-bot.png" alt="Welcome Bot" className="w-full h-full object-contain drop-shadow-[0_0_60px_rgba(212,175,55,0.7)]" />
                     </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-bot"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    className="relative w-40 h-40 md:w-64 md:h-64"
                  >
                     <motion.div 
                       animate={{ 
                         x: [40, -40, 40, 0, -40],
                         scaleX: [1.1, 0.9, 1.1, 1, 0.9],
                         opacity: [0.3, 0.1, 0.3, 0.5, 0.1]
                       }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/40 blur-2xl rounded-full" 
                     />
                     <motion.div 
                       animate={{ 
                         x: [40, -40, 40, 0, -40],
                         y: [0, -15, 0, -25, 0],
                         rotateY: [0, 0, 0, 360, 360]
                       }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                       className="w-full h-full relative"
                     >
                        <img src="/login-bot.png" alt="Register Bot" className="w-full h-full object-contain drop-shadow-[0_15px_50px_rgba(212,175,55,0.3)]" />
                     </motion.div>
                     <div className="absolute inset-0 bg-[#D4AF37] blur-[80px] rounded-full scale-110 opacity-15 pointer-events-none animate-pulse" />
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="relative z-10 space-y-6">
            <motion.div whileHover={{ scale: 1.1, rotate: 90 }} className="hidden md:flex w-14 h-14 bg-[#D4AF37] rounded-2xl items-center justify-center shadow-2xl transition-transform duration-500">
              <Filter size={24} className="text-[#1a1510]" />
            </motion.div>
            <div className="space-y-1">
              <motion.h2 layout className="text-3xl md:text-4xl font-black text-white italic tracking-tighter leading-none uppercase">
                CT PROTOCOL <br />
                <span className="text-[#D4AF37]">{isLogin ? "VERIFY !" : "INITIALIZE ?"}</span>
              </motion.h2>
            </div>
          </div>

          <div className="relative z-10">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="group flex items-center gap-3 text-white/50 hover:text-[#D4AF37] transition-all text-xs font-bold uppercase tracking-[0.3em]"
            >
              {isLogin ? <ChevronRight size={14} className="group-hover:translate-x-1" /> : <ChevronLeft size={14} className="group-hover:-translate-x-1" />}
              <span>{isLogin ? "Register Access" : "Secure Login"}</span>
            </button>
          </div>
        </motion.div>

        {/* THE FORM PANEL */}
        <motion.div
          layout
          className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-[#fdfbf7] relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-view" : "signup-view"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#1a1510] uppercase">
                  {isLogin ? "Terminal Log" : "New Operator"}
                </h1>
                <p className="text-xs text-[#1a1510]/30 italic font-semibold uppercase tracking-widest pl-1">
                  {isLogin ? "Secure verification for control tower access." : "Establish high-clearance command credentials."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="space-y-4 md:space-y-6">
                  {isLogin ? (
                    <>
                      <UnderlineInput label="Operator Email*" placeholder="name@company.com" type="email" value={email} onChange={setEmail} />
                      <UnderlineInput label="Access Key*" placeholder="Enter security password" type="password" value={password} onChange={setPassword} />
                    </>
                  ) : (
                    <>
                      <UnderlineInput label="Full Identity*" placeholder="John Operator" value={name} onChange={setName} />
                      <UnderlineInput label="Operator Email*" placeholder="name@company.com" type="email" value={email} onChange={setEmail} />
                      <UnderlineInput label="Secret Key*" placeholder="Create master password" type="password" value={password} onChange={setPassword} />
                    </>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2 rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <div className="pt-2 space-y-6 md:space-y-8">
                  <motion.button
                    type="submit"
                    disabled={submitting || loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full group py-4 md:py-5 bg-[#1a1510] text-white rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-2xl relative overflow-hidden flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <span className="relative z-10">{submitting ? "Processing..." : (isLogin ? "Verify" : "Register")}</span>
                    <ArrowRight size={18} className="text-[#D4AF37] relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[45deg] translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </motion.button>

                  <div className="flex items-center gap-6 justify-center">
                    <div className="h-px w-12 bg-[#1a1510]/5" />
                    <span className="text-xs font-black text-[#1a1510]/20 uppercase tracking-[0.4em]">External</span>
                    <div className="h-px w-12 bg-[#1a1510]/5" />
                  </div>

                  <div className="px-2">
                     <button
                       type="button"
                       className="w-full py-4 rounded-xl bg-[#1a1510] text-white flex items-center justify-center gap-4 hover:brightness-125 transition-all shadow-sm group"
                     >
                       <div className="w-5 h-5 flex items-center justify-center">
                         <svg viewBox="0 0 24 24" className="w-5 h-5">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                           <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                         </svg>
                       </div>
                       <span className="text-sm font-bold tracking-tight">Access with SSO</span>
                     </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Global Status Footer */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-center text-[10px] font-black uppercase tracking-[1em] text-[#1a1510]/30"
      >
        CONTROL TOWER • VERIFIED OPERATOR TERMINAL
      </motion.p>
    </div>
  );
}

const UnderlineInput = ({ label, placeholder, value, onChange, type = "text" }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1 py-1 group">
      <label className={`text-xs font-bold uppercase tracking-widest block transition-colors ${isFocused ? 'text-[#D4AF37]' : 'text-[#1a1510]/40'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? "" : placeholder}
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-[#1a1510] text-sm font-bold placeholder:text-[#1a1510]/5 placeholder:italic py-2"
        />
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-500 ${isFocused ? 'bg-[#D4AF37] shadow-[0_2px_10px_rgba(212,175,55,0.5)]' : 'bg-[#1a1510]/10'}`} />
      </div>
    </div>
  );
};
