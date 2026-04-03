'use client';

import { type ReactNode, useSyncExternalStore } from 'react';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Sets --admin-* and --color-* CSS variables from secretary profile so admin-styled UIs
 * (reports, approvals) match contrast in the secretary shell.
 */
export default function SecretaryAdminThemeShell({ children }: { children: ReactNode }) {
  const { profile, isReady } = useSecretaryProfile();
  const mounted = useIsMounted();
  const dark = mounted && isReady ? profile.darkMode : false;

  const tokens = {
    bg: dark ? profile.darkBackgroundColor || '#0A1628' : profile.backgroundColor || '#F5F7FA',
    surface: dark ? '#112240' : '#FFFFFF',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    text: dark ? '#E2E8F0' : '#1A202C',
    textMuted: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    primary: dark ? profile.darkPrimaryColor || '#1A3F6B' : profile.primaryColor || '#0B2A4A',
    accent: dark ? profile.darkAccentColor || '#2FC4B2' : profile.accentColor || '#2FC4B2',
  };

  return (
    <div
      className="min-w-0"
      style={
        {
          '--admin-bg': tokens.bg,
          '--admin-surface': tokens.surface,
          '--admin-border': tokens.border,
          '--admin-text': tokens.text,
          '--admin-text-muted': tokens.textMuted,
          '--color-primary': tokens.primary,
          '--color-accent': tokens.accent,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
