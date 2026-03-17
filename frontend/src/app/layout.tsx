"use client";

import '../globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen items-stretch">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

