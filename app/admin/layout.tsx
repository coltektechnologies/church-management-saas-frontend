'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { ChurchProfileProvider, useChurchProfile } from '@/components/admin/dashboard/contexts';
import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import { DepartmentsProvider } from '@/context/DepartmentsContext';
import AdminSidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminShell
//
// Dark mode strategy:
//   • The <html> element gets class="dark" via applyGlobalStyles() in the
//     context — Tailwind's dark: variants work automatically everywhere.
//   • We ALSO set CSS custom properties on this shell div so any child page
//     or card component can use var(--admin-surface), var(--admin-text) etc.
//     and automatically inherit the correct dark/light value with zero extra
//     logic in the child.
//   • The backgroundColor on <main> is what was previously missing — the
//     content canvas stayed white in dark mode because only the sidebar and
//     topbar had explicit dark colours.
// ─────────────────────────────────────────────────────────────────────────────
function AdminShell({ children }: { children: ReactNode }) {
  const { profile } = useChurchProfile();
  const mounted = useIsMounted();
  const dark = mounted ? (profile.darkMode ?? false) : false;

  // Semantic colour tokens — one place to change, affects every admin page
  const tokens = {
    bg: dark ? '#0A1628' : '#F5F7FA', // page canvas (behind cards)
    surface: dark ? '#112240' : '#FFFFFF', // card / panel background
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    text: dark ? '#E2E8F0' : '#1A202C',
    textMuted: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    primary: profile.primaryColor || '#0B2A4A',
    accent: profile.accentColor || '#2FC4B2',
  };

  return (
    <DepartmentsProvider>
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
        {/* Sidebar */}
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNavbar />

          {/*
             cards/pages goes dark when dark mode is on.
          */}
          <main
            className="flex-1 overflow-y-auto transition-colors duration-300"
            style={{ backgroundColor: tokens.bg }}
          >
            {/*
              Auto-margin shell 
            */}
            <div className="px-6 py-6 max-w-screen-2xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </DepartmentsProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ChurchProfileProvider>
      <AppDataProvider>
        <AdminShell>{children}</AdminShell>
      </AppDataProvider>
    </ChurchProfileProvider>
  );
}
