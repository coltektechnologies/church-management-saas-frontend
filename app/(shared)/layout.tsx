'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AuthProvider defaultRole="admin">
        <main className="min-h-screen bg-slate-100">{children}</main>
      </AuthProvider>
    </RequireAuth>
  );
}
