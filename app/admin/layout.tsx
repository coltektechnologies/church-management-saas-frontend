'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { ChurchProfileProvider, useChurchProfile } from '@/components/admin/dashboard/contexts';
import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import { AuthProvider } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { profile } = useChurchProfile();
  const mounted = useIsMounted();
  const dark = mounted ? (profile.darkMode ?? false) : false;

  const tokens = {
    bg: dark ? '#0A1628' : '#F5F7FA',
    surface: dark ? '#112240' : '#FFFFFF',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    text: dark ? '#E2E8F0' : '#1A202C',
    textMuted: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    primary: profile.primaryColor || '#0B2A4A',
    accent: profile.accentColor || '#2FC4B2',
  };

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={
        {
          '--admin-bg': tokens.bg,
          '--admin-surface': tokens.surface,
          '--admin-border': tokens.border,
          '--admin-text': tokens.text,
          '--admin-text-muted': tokens.textMuted,
          '--color-primary': tokens.primary,
          '--color-accent': tokens.accent,
          backgroundColor: tokens.bg,
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar />
        <main
          className="flex-1 overflow-y-auto transition-colors duration-300"
          style={{ backgroundColor: tokens.bg }}
        >
          <div className="px-6 py-6 max-w-screen-2xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider defaultRole="admin">
      <ChurchProfileProvider>
        <AppDataProvider>
          <AdminShell>{children}</AdminShell>
        </AppDataProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );
}
