"use client";

import '../globals.css';
import type { ReactNode } from 'react';
import { Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import { CreditProvider } from '@/contexts/CreditContext';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased`}
      >
        <CreditProvider>
          <Toaster position="top-right" richColors />
          {children}
        </CreditProvider>
      </body>
    </html>
  );
}
