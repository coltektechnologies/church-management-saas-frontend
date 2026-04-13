'use client';

/**
 * Treasury ThemeProvider
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: Theme;
  mounted: boolean;
  toggleDarkMode: () => void;
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
  const { profile, toggleDarkMode, isReady } = useTreasuryProfile();

  const mounted = isReady;
  const resolvedTheme: Theme = isReady && profile.darkMode ? 'dark' : 'light';

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
