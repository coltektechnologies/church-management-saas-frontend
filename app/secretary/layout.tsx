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
      {/* Mounts once — checks reminders every 60s, fires toast + mailto/wa.me */}
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
  return (
    <AuthProvider defaultRole="secretary">
      <ChurchProfileProvider>
        <SecretaryProfileProvider>
          <AppDataProvider>
            <EventsProvider>
              <ActivityProvider>
                <ThemeProvider>
                  <SecretaryShell>{children}</SecretaryShell>
                </ThemeProvider>
              </ActivityProvider>
            </EventsProvider>
          </AppDataProvider>
        </SecretaryProfileProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );
}
