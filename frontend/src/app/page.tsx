"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { ProblemSection } from "@/components/home/ProblemSection";
import { SolutionSection } from "@/components/home/SolutionSection";
import { GTMMarquee } from "@/components/home/MarqueeBanner";
import { IntegrationCards } from "@/components/home/IntegrationCards";
import { KeyFeatures } from "@/components/home/KeyFeatures";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { MultiSection } from "@/components/home/MultiSection";
import { Footer } from "@/components/home/Footer";
import { AuthModal } from "@/components/login/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<"signin" | "signup">("signin");
  const router = useRouter();

  const handleSignIn = () => {
    setAuthModalState("signin");
    setIsAuthModalOpen(true);
  };

  const onAuthSuccess = () => {
    setIsAuthModalOpen(false);
    router.push("/dashboard");
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen relative font-sans text-[#2d241c] antialiased">
      <Navbar
        isSignedIn={false}
        onSignIn={handleSignIn}
        onSignOut={() => {}}
      />

      <motion.div
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <Hero onGetStarted={handleSignIn} />

        <div className="">
          <GTMMarquee />
          <ProblemSection onManageNow={handleSignIn} />
          <SolutionSection />
          <IntegrationCards />
          <KeyFeatures />
          <ProcessTimeline />
          <MultiSection />
        </div>

        <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#fdfbf7]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto relative group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-brand-gold/20 via-brand-beige/20 to-brand-gold/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />

            <div className="relative bg-[#1a1510] p-8 sm:p-12 rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

              <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[60px] bg-gradient-to-b from-transparent via-brand-gold/5 to-transparent z-0 pointer-events-none"
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tighter text-white max-w-3xl mx-auto">
                  Unify Your Entire <span className="text-brand-gold italic font-serif font-light">GTM Command.</span>
                </h2>

                <p className="text-white/30 text-base sm:text-lg mb-8 max-w-xl mx-auto font-medium leading-relaxed font-serif italic">
                  Stop the context-switching tax. GTM Control Tower bridges the gap between your tools for your entire revenue workflow.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignIn}
                    className="w-full sm:flex-1 px-6 py-3 bg-brand-gold text-[#1a1510] rounded-xl font-bold text-sm shadow-lg hover:shadow-brand-gold/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Manage Now
                    <ArrowRight size={15} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:flex-1 px-6 py-3 border border-white/10 text-white rounded-xl font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
                  >
                    Book Demo
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </motion.div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialState={authModalState}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}

