'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { SecretaryProfileProvider } from '@/components/secretary/contexts/SecretaryProfileContext';
import { AppDataProvider } from '@/components/secretary/contexts/AppDataContext';
import { EventsProvider } from '@/components/secretary/contexts/EventsContext';
import { ActivityProvider } from '@/components/secretary/contexts/ActivityContext';
import { ThemeProvider } from '@/components/secretary/ThemeProvider';
import { ReminderEngine } from '@/components/secretary/dashboard/ReminderEngine';
import SecretarySidebar from '@/components/secretary/SecretarySidebar';
import SecretaryTopbar from '@/components/secretary/SecretaryTopbar';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';
import { RequireAuth } from '@/components/auth/RequireAuth';

/*
 * Optional local preview without login:
 * 1) Uncomment NEXT_PUBLIC_SKIP_SECRETARY_AUTH=true in .env.local
 * 2) Uncomment skipAuth + the if/return block at the bottom of SecretaryLayout
 * 3) In proxy.ts, uncomment skipSecretaryCookie and the combined `if` line
 * 4) Restart dev
 *
 * Otherwise: normal auth — login first, then /secretary.
 */
// const skipAuth = process.env.NEXT_PUBLIC_SKIP_SECRETARY_AUTH === 'true';

function SecretaryShell({ children }: { children: ReactNode }) {
  const { profile, isReady } = useSecretaryProfile();

  const isDark = isReady ? profile.darkMode : false;

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
      <ReminderEngine />
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
  const tree = (
    <AuthProvider defaultRole="secretary">
      <ChurchProfileProvider>
        <SecretaryProfileProvider>
          <ActivityProvider>
            <AppDataProvider>
              <EventsProvider>
                <ThemeProvider>
                  <SecretaryShell>{children}</SecretaryShell>
                </ThemeProvider>
              </EventsProvider>
            </AppDataProvider>
          </ActivityProvider>
        </SecretaryProfileProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );

  // // When preview is enabled: uncomment skipAuth above and these two lines:
  // if (skipAuth) {
  //   return tree;
  // }
  return <RequireAuth>{tree}</RequireAuth>;
  // return tree;
}
