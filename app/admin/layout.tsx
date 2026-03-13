'use client';

import type { ReactNode } from 'react';
import {
  ChurchProfileProvider,
  useChurchProfile,
} from '@/components/admin/contexts/ChurchProfileContext';
import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import AdminSidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';

// Inner wrapper — reads context and injects CSS variables
function AdminShell({ children }: { children: ReactNode }) {
  const { profile } = useChurchProfile();

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={
        {
          // Using your brand navy as fallback for primary to ensure visibility against white bg
          '--color-primary': profile.primaryColor || '#0B2A4A',
          '--color-accent': profile.accentColor || '#2FC4B2',
          // Forced to white as requested
          backgroundColor: '#FFFFFF',
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// Outer layout — providers must wrap the shell so useChurchProfile() works inside it
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ChurchProfileProvider>
      <AppDataProvider>
        <AdminShell>{children}</AdminShell>
      </AppDataProvider>
    </ChurchProfileProvider>
  );
}
