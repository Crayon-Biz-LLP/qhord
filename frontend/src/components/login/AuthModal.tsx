"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User, ArrowRight, Zap, ChevronRight, Activity, Globe, Database, Filter, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: "signin" | "signup";
  onSuccess?: () => void;
}

export const AuthModal = ({ isOpen, onClose, initialState = "signin", onSuccess }: AuthModalProps) => {
  const { login, register, loading } = useAuth(false);
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialState === "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = useCallback(() => {
    const w = 500, h = 620;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - h) / 2.5);
    const popup = window.open(
      "/api/auth/google",
      "google-signin",
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        const token: string = event.data.token;
        localStorage.setItem("auth_token", token);
        const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
        document.cookie = `auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
        window.removeEventListener("message", onMessage);
        if (onSuccess) onSuccess();
        else router.replace("/dashboard");
      }
    };
    window.addEventListener("message", onMessage);

    // Clean up listener if popup is closed without completing auth
    const poll = setInterval(() => {
      if (popup?.closed) {
        clearInterval(poll);
        window.removeEventListener("message", onMessage);
      }
    }, 500);
  }, [onSuccess, router]);

  useEffect(() => {
    setIsLogin(initialState === "signin");
    setError(null);
  }, [initialState, isOpen]);

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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Authentication failed. Protocol rejected.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Soft Liquid Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#D9BB9B]/10 backdrop-blur-2xl"
          />

          {/* Main Pipeline Container - Responsive Flex */}
          <motion.div
            layout
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ layout: { type: "spring", stiffness: 120, damping: 22 }, type: "spring", stiffness: 350, damping: 35 }}
            className={`relative w-full max-w-3xl min-h-[480px] md:min-h-[500px] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(45,36,28,0.12)] flex flex-col md:flex-row ${!isLogin ? 'md:flex-row-reverse' : ''} overflow-hidden border border-white/60 mx-auto`}
          >
            {/* THE VISUAL PANEL (With Dynamic Custom Bots) - Responsive Height/Width */}
            <motion.div
              layout
              className="w-full h-[220px] md:h-auto md:w-[38%] bg-gradient-to-br from-[#1a1510] to-[#241c16] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden group/funnel shrink-0"
            >
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <pattern id="gridSmall" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#gridSmall)" />
                </svg>
              </div>

              {/* DYNAMIC HIGH-FIDELITY BOT PERSONAS - Responsive Scaling */}
              <div className="hidden">
                <AnimatePresence mode="wait">
                  {/* LOGIN BOT (SLOW-MOTION MAJESTIC HIGH JUMP) */}
                  {isLogin ? (
                    <motion.div
                      key="login-bot"
                      initial={{ opacity: 0, y: -200, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: -100 }}
                      className="relative w-32 h-32 md:w-56 md:h-56 mt-4 md:mt-16"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 2.5, 1.2, 0.4, 1],
                          opacity: [0.6, 0.1, 0.6, 0.05, 0.6],
                        }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-4 md:-bottom-8 left-1/2 -translate-x-1/2 w-20 md:w-32 h-3 md:h-6 bg-[#D4AF37]/30 blur-xl rounded-full"
                      />

                      <div className="absolute inset-0 bg-[#D4AF37] blur-[40px] md:blur-[70px] rounded-full scale-110 opacity-30 pointer-events-none animate-pulse" />

                      <motion.div
                        animate={{
                          y: [0, -100, 0, -40, 0],
                          scaleY: [1, 1.25, 0.85, 1.15, 1],
                          scaleX: [1, 0.85, 1.15, 0.9, 1],
                        }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.3, 0.5, 0.8, 1]
                        }}
                        className="w-full h-full relative"
                      >
                        <img
                          src="/welcome-bot.png"
                          alt="Welcome Bot"
                          className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.7)]"
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* REGISTER BOT (Slow Power-Up Run) */
                    <motion.div
                      key="register-bot"
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="relative w-32 h-32 md:w-56 md:h-56 mt-4 md:mt-16"
                    >
                      <motion.div
                        animate={{
                          x: [30, -30, 30, 0, -30],
                          scaleX: [1.1, 0.9, 1.1, 1, 0.9],
                          opacity: [0.3, 0.1, 0.3, 0.5, 0.1]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-4 md:-bottom-8 left-1/2 -translate-x-1/2 w-20 md:w-32 h-3 md:h-6 bg-black/40 blur-xl rounded-full"
                      />

                      <motion.div
                        animate={{
                          x: [30, -30, 30, 0, -30],
                          y: [0, -10, 0, -20, 0],
                          rotateY: [0, 0, 0, 360, 360]
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-full h-full relative"
                      >
                        <img
                          src="/login-bot.png"
                          alt="Register Bot"
                          className="w-full h-full object-contain drop-shadow-[0_15px_40px_rgba(212,175,55,0.3)]"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-[#D4AF37] blur-[40px] md:blur-[70px] rounded-full scale-110 opacity-15 pointer-events-none animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-10 space-y-2 md:space-y-6">
                <motion.div
                  className="hidden md:flex items-center justify-start h-16 w-full mb-8"
                >
                  <Image 
                    src="/logo-footer.png"
                    alt="Qhord"
                    width={180}
                    height={56}
                    className="object-contain"
                  />
                </motion.div>

                <div className="space-y-0.5 md:space-y-1 mt-auto md:mt-0">
                  <motion.h2
                    layout
                    className="text-xl md:text-3xl font-black text-white italic tracking-tighter leading-none"
                  >
                    WELCOME <br />
                    <span className="text-[#D4AF37]">{isLogin ? "BACK !" : "READY TO JOIN ?"}</span>
                  </motion.h2>
                </div>
              </div>

              <div className="relative z-10 md:mt-0 mt-2">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="group flex items-center gap-2 md:gap-3 text-white/50 hover:text-[#D4AF37] transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]"
                >
                  {isLogin ? <ChevronRight size={12} className="group-hover:translate-x-1" /> : <ChevronLeft size={12} className="group-hover:-translate-x-1" />}
                  <span>{isLogin ? "Create Account" : "Login"}</span>
                </button>
              </div>
            </motion.div>

            {/* THE FORM PANEL - Responsive Padding */}
            <motion.div
              layout
              className="flex-1 p-6 md:p-10 flex flex-col justify-center bg-[#fdfbf7] relative"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login-view" : "signup-view"}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4 md:space-y-8"
                >
                  <div className="space-y-0.5 md:space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1a1510] uppercase">
                      {isLogin ? "Login" : "Register"}
                    </h1>
                    <p className="text-[9px] md:text-[10px] text-[#1a1510]/30 italic font-semibold uppercase tracking-widest pl-0.5 max-w-[280px] md:max-w-none">
                      {isLogin ? "Please enter your details." : "Access account securely with your registered email."}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-4">
                      {isLogin ? (
                        <>
                          <UnderlineInput label="Email ID*" placeholder="Enter your email" type="email" value={email} onChange={setEmail} />
                          <UnderlineInput label="Password*" placeholder="Enter your password" type="password" value={password} onChange={setPassword} />
                        </>
                      ) : (
                        <>
                          <UnderlineInput label="Name*" placeholder="Full Name" value={name} onChange={setName} />
                          <UnderlineInput label="Email ID*" placeholder="Email Address" type="email" value={email} onChange={setEmail} />
                          <UnderlineInput label="Password*" placeholder="Create Password" type="password" value={password} onChange={setPassword} />
                        </>
                      )}

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] px-3 py-1.5 rounded-lg font-semibold">
                          {error}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 md:pt-2 space-y-4 md:space-y-6">
                      <motion.button
                        type="submit"
                        disabled={submitting || loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group py-3 md:py-3.5 bg-[#1a1510] text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] shadow-xl relative overflow-hidden flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
                      >
                        <span className="relative z-10">{submitting ? "Processing..." : (isLogin ? "Login" : "Register")}</span>
                        <ArrowRight size={14} className="text-[#D4AF37] relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[45deg] translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </motion.button>

                      <div className="flex items-center gap-3 md:gap-4 justify-center">
                        <div className="h-px w-6 md:w-8 bg-[#1a1510]/5" />
                        <span className="text-[9px] md:text-[10px] font-black text-[#1a1510]/20 uppercase tracking-[0.3em] md:tracking-[0.4em]">OR</span>
                        <div className="h-px w-6 md:w-8 bg-[#1a1510]/5" />
                      </div>

                      <div className="px-0 md:px-2">
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full py-3 md:py-3.5 rounded-xl bg-[#1a1510] text-white flex items-center justify-center gap-3 md:gap-4 hover:brightness-125 transition-all shadow-sm group"
                        >
                          <div className="w-5 h-5 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                            </svg>
                          </div>
                          <span className="text-xs md:text-sm font-bold tracking-tight">Sign in with Google</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Global Close Button - Responsive Position */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] p-2 md:p-3 rounded-xl bg-white/40 backdrop-blur-md border border-[#1a1510]/5 text-[#1a1510]/20 hover:text-[#1a1510] transition-all group"
            >
              <X className="size-4 md:size-4.5 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const UnderlineInput = ({ label, placeholder, value, onChange, type = "text" }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-0.5 md:space-y-1 py-1 group">
      <label className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest block transition-colors ${isFocused ? 'text-[#D4AF37]' : 'text-[#1a1510]/40'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          required
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? "" : placeholder}
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-[#1a1510] text-sm font-bold placeholder:text-[#1a1510]/5 placeholder:italic py-1"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#1a1510]/30 hover:text-[#D4AF37] transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-[1px] transition-all duration-500 ${isFocused ? 'bg-[#D4AF37] shadow-[0_1px_5px_rgba(212,175,55,0.4)]' : 'bg-[#1a1510]/10'}`} />
      </div>
    </div>
  );
};
