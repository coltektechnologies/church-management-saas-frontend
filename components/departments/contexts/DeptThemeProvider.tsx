'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

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

export const useDeptTheme = () => useContext(ThemeContext);

export function DeptThemeProvider({ children }: { children: ReactNode }) {
  const { profile, toggleDarkMode, isReady } = useDepartmentProfile();

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
