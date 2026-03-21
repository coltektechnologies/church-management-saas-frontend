'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeProvider — zero independent state.
// SecretaryProfileContext.darkMode is the SINGLE source of truth.
// Every component that calls useTheme().setTheme() or toggleDarkMode() writes
// to the same place, so all toggles stay perfectly in sync.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, type ReactNode } from 'react';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme; // current resolved theme
  setTheme: (t: Theme) => void;
  resolvedTheme: Theme;
  mounted: boolean; // false on server, true on client
  toggleDarkMode: () => void; // convenience passthrough
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  mounted: false,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, toggleDarkMode, isReady } = useSecretaryProfile();

  // isReady is false on server, true on client — safe hydration guard
  const mounted = isReady;
  const resolvedTheme: Theme = isReady && profile.darkMode ? 'dark' : 'light';

  // setTheme only fires toggleDarkMode when the mode actually needs to change
  const setTheme = (t: Theme) => {
    const wantDark = t === 'dark';
    const currentDark = isReady ? profile.darkMode : false;
    if (wantDark !== currentDark) {
      toggleDarkMode();
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme: resolvedTheme, setTheme, resolvedTheme, mounted, toggleDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
