'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import {
  ChurchProfileProvider,
  useChurchProfile,
} from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import AdminSidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { DepartmentsProvider } from '@/context/DepartmentsContext';

// useSyncExternalStore: server=false, client=true — no setState, no effects
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { profile } = useChurchProfile();

  // Gate dark + backgroundColor behind mounted so server and client agree on
  // the first render. Server always renders the light defaults.
  const mounted = useIsMounted();
  const dark = mounted ? (profile.darkMode ?? false) : false;

  const backgroundColor = mounted
    ? profile.backgroundColor || (dark ? '#0A1628' : '#F5F7FA')
    : '#F5F7FA';

  return (
    <DepartmentsProvider>
      <div
        className="min-h-screen flex transition-colors duration-300"
        style={
          {
            '--color-primary': profile.primaryColor || '#0B2A4A',
            '--color-accent': profile.accentColor || '#2FC4B2',
            backgroundColor,
          } as React.CSSProperties
        }
      >
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNavbar />
          <main
            className="flex-1 overflow-y-auto transition-colors duration-300"
            style={{ backgroundColor }}
          >
            {children}
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
