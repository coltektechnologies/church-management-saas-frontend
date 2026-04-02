'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { ChurchProfileProvider, useChurchProfile } from '@/components/admin/dashboard/contexts';
import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import { AuthProvider } from '@/context/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useSettingsApiSync } from '@/hooks/useSettingsApiSync';
import AdminSidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';

/*
 * Optional local preview without login (do not ship):
 * 1) .env.local: NEXT_PUBLIC_SKIP_ADMIN_AUTH=true so proxy.ts allows /admin without church_session cookie
 * 2) In AdminLayout below: uncomment `skipAuth` + the `if (skipAuth) { return tree; }` block
 *    (also set NEXT_PUBLIC_SKIP_DASHBOARD_AUTH=true in .env so skipAuth is true, or hardcode `true` locally)
 *
 * Otherwise: normal auth — login first, then /admin.
 */

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { profile } = useChurchProfile();
  useSettingsApiSync();
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
          <div className="px-4 py-6 sm:px-6 max-w-screen-2xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const tree = (
    <AuthProvider defaultRole="admin">
      <ChurchProfileProvider>
        <AppDataProvider>
          <AdminShell>{children}</AdminShell>
        </AppDataProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );

  // Local preview without RequireAuth — uncomment the block below (and set NEXT_PUBLIC_SKIP_ADMIN_AUTH=true
  // in .env.local so proxy.ts allows /admin without the session cookie). Restart dev after .env changes.
  // const skipAuth = process.env.NEXT_PUBLIC_SKIP_DASHBOARD_AUTH === 'true';
  // if (skipAuth) {
  //   return tree;
  // }

  return <RequireAuth>{tree}</RequireAuth>;
}
