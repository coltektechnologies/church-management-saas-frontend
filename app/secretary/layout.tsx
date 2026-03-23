'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { SecretaryProfileProvider } from '@/components/secretary/contexts/SecretaryProfileContext';
import { AppDataProvider } from '@/components/secretary/contexts/AppDataContext';
import { ThemeProvider } from '@/components/secretary/ThemeProvider';
import SecretarySidebar from '@/components/secretary/SecretarySidebar';
import SecretaryTopbar from '@/components/secretary/SecretaryTopbar';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';
import { RequireAuth } from '@/components/auth/RequireAuth';

function SecretaryShell({ children }: { children: ReactNode }) {
  const { profile, isReady } = useSecretaryProfile();

  const isDark = isReady ? profile.darkMode : false;

  // Strictly use dark or light background — never mixed
  const mainBg = isReady
    ? isDark
      ? profile.darkBackgroundColor || '#0A1628'
      : profile.backgroundColor || '#F5F7FA'
    : '#F5F7FA';

  return (
    <div
      data-secretary-theme
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: mainBg }}
    >
      <SecretaryTopbar />
      <div className="flex">
        <div className="sticky top-0 h-screen" style={{ zIndex: 20 }}>
          <SecretarySidebar />
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

export default function SecretaryLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AuthProvider defaultRole="secretary">
        <ChurchProfileProvider>
          <SecretaryProfileProvider>
            <AppDataProvider>
              <ThemeProvider>
                <SecretaryShell>{children}</SecretaryShell>
              </ThemeProvider>
            </AppDataProvider>
          </SecretaryProfileProvider>
        </ChurchProfileProvider>
      </AuthProvider>
    </RequireAuth>
  );
}
