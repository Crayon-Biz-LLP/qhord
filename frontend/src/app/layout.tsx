"use client";

import '../globals.css';
import type { ReactNode } from 'react';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { Toaster } from 'sonner';
import { CreditProvider } from '@/contexts/CreditContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        <CreditProvider>
          <Toaster position="top-right" richColors />
          {children}
        </CreditProvider>
      </body>
    </html>
  );
}
