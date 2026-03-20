'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider defaultRole="admin">
      <main className="min-h-screen bg-slate-100">{children}</main>
    </AuthProvider>
  );
}
