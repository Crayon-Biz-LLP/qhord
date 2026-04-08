"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { LogOut, Zap } from "lucide-react";


interface NavbarProps {
  isSignedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar = ({ isSignedIn, onSignIn, onSignOut }: NavbarProps) => {
  return (
    <nav
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl px-6 py-2 rounded-full glass border border-brand-beige/30 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-12 flex items-center justify-center"
          >
            <Image
              src="/logo-header.png"
              alt="Qhord Logo"
              width={160}
              height={50}
              className="object-contain"
              priority
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {!isSignedIn ? (
            <>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSignIn}
                className="glass flex items-center gap-2 text-[#2d241c] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black border-white/60 hover:bg-white/60 transition-all shadow-xl whitespace-nowrap"
              >
                <div className="p-1 sm:p-1.5 bg-[#2d241c] text-white rounded-full">
                  <Zap size={12} className="sm:size-3.5" />
                </div>
                <span>Manage Now</span>
              </motion.button>
            </>
          ) : (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 text-[#2d241c]/60 hover:text-[#2d241c] transition-colors text-sm font-bold"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
