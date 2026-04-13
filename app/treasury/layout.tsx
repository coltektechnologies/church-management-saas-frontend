'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import {
  TreasuryProfileProvider,
  useTreasuryProfile,
} from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { ThemeProvider } from '@/components/treasurydashboard/contexts/ThemeProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import TreasurySidebar from '@/components/treasurydashboard/TreasurySidebar';
import TreasuryTopbar from '@/components/treasurydashboard/TreasuryTopbar';

// ── Shell ─────────────────────────────────────────────────────────────────────
function TreasuryShell({ children }: { children: ReactNode }) {
  const { profile, isReady } = useTreasuryProfile();

  const isDark = isReady ? profile.darkMode : false;
  const mainBg = isReady
    ? isDark
      ? profile.darkBackgroundColor || '#0A1628'
      : profile.backgroundColor || '#F5F7FA'
    : '#F5F7FA';

  return (
    <div
      data-treasury-theme
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: mainBg }}
    >
      <TreasuryTopbar />
      <div className="flex">
        <div className="sticky top-0 h-screen" style={{ zIndex: 20 }}>
          <TreasurySidebar />
        </div>
        <main
          className="flex-1 min-w-0 overflow-y-auto transition-colors duration-300"
          style={{ minHeight: '100vh', backgroundColor: mainBg }}
        >
          <div className="px-6 py-6 max-w-screen-2xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

// ── Inner tree (always rendered) ──────────────────────────────────────────────
function TreasuryTree({ children }: { children: ReactNode }) {
  return (
    <AuthProvider defaultRole="treasury">
      <ChurchProfileProvider>
        <TreasuryProfileProvider>
          <ThemeProvider>
            <TreasuryShell>{children}</TreasuryShell>
          </ThemeProvider>
        </TreasuryProfileProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );
}

// ── Layout root ───────────────────────────────────────────────────────────────
const skipAuth = process.env.NEXT_PUBLIC_SKIP_TREASURY_AUTH === 'true';

export default function TreasuryLayout({ children }: { children: ReactNode }) {
  if (skipAuth) {
    return <TreasuryTree>{children}</TreasuryTree>;
  }

  return (
    <RequireAuth>
      <TreasuryTree>{children}</TreasuryTree>
    </RequireAuth>
  );
}
