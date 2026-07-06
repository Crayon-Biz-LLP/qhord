"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { AuthModal } from "../../components/login/AuthModal";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const calledRef = React.useRef(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setSuccess(false);
      setMessage("Invalid or missing verification token.");
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    async function verify() {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setSuccess(true);
        setMessage(res.data.message || "Your email has been verified successfully!");
      } catch (err: any) {
        setSuccess(false);
        setMessage(err?.response?.data?.message || "Failed to verify email. The link may have expired.");
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-gold/15 flex items-center justify-center border border-brand-gold/20">
          <Sparkles className="text-brand-gold w-5 h-5 animate-pulse" />
        </div>
        <span className="text-[20px] font-black tracking-[0.2em] text-white uppercase">Qhord</span>
      </div>

      {verifying ? (
        <div className="space-y-6 py-6">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-white mb-2">Verifying your email</h2>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Connecting to GTM command center to authorize your identity...
            </p>
          </div>
        </div>
      ) : success ? (
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-white mb-2">Verification Success</h2>
            <p className="text-[13px] text-white/60 leading-relaxed px-2">
              {message}
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full h-12 bg-white text-[#1a1510] hover:bg-brand-gold hover:text-[#1a1510] font-black text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            Log In to Dashboard <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <XCircle className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-[13px] text-white/60 leading-relaxed px-2">
              {message}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full h-12 bg-white/5 text-white hover:bg-white/10 border border-white/10 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            Return Home
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="text-[11px] text-white/30 mt-8">
        Powered by Qhord GTM Pipeline Autopilot
      </p>

      {/* Auth Modal popup */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialState="signin"
        onSuccess={() => router.replace("/dashboard")}
      />
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1a1510] to-[#241c16] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="gridLarge" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#gridLarge)" />
        </svg>
      </div>

      {/* Floating Ambient Light */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-gold/10 blur-[120px] top-1/4 left-1/4 animate-pulse pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-gold/5 blur-[100px] bottom-1/4 right-1/4 pointer-events-none" />

      <Suspense fallback={
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto" />
          <p className="text-[13px] text-white/50">Loading verification context...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
