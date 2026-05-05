'use client';

import { type ReactNode, useSyncExternalStore } from 'react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts';
import { cn } from '@/lib/utils';
import { useSettingsApiSync } from '@/hooks/useSettingsApiSync';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function MembershipLayoutShell({ children }: { children: ReactNode }) {
  useSettingsApiSync();
  const { profile } = useChurchProfile();
  const mounted = useIsMounted();
  const isDark = mounted ? (profile.darkMode ?? false) : false;
  const bg = isDark ? '#0B1220' : '#F8FAFC';

  return (
    <div
      className={cn(
        'flex min-h-[100dvh] flex-col lg:flex-row transition-colors duration-300',
        isDark && 'dark'
      )}
      style={{ backgroundColor: bg }}
    >
      {children}
    </div>
  );
}
