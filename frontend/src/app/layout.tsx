"use client";

import '../globals.css';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { CreditProvider } from '@/contexts/CreditContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <CreditProvider>
          <Toaster position="top-right" richColors />
          {children}
        </CreditProvider>
      </body>
    </html>
  );
}
