'use client';

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export type SubscriptionStatus = 'trial' | 'active' | 'inactive';
export type ThemeMode = 'light' | 'dark';

export interface ChurchProfile {
  churchName: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  sidebarColor: string;
  backgroundColor: string;
  subscriptionStatus: SubscriptionStatus;
  address: string;
  mission: string;
  website: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  adminPhone: string;
  avatarUrl: string | null;
  darkMode: boolean;
  theme: ThemeMode;
}

const DEFAULT: ChurchProfile = {
  churchName: '',
  tagline: '',
  logoUrl: null,
  primaryColor: '#0B2A4A',
  accentColor: '#2FC4B2',
  sidebarColor: '#0B2A4A',
  backgroundColor: '#F8FAFC',
  subscriptionStatus: 'trial',
  address: '',
  mission: '',
  website: '',
  adminName: '',
  adminEmail: '',
  adminRole: 'Admin',
  adminPhone: '',
  avatarUrl: null,
  darkMode: false,
  theme: 'light',
};

interface ChurchProfileContextType {
  profile: ChurchProfile;
  updateProfile: (partial: Partial<ChurchProfile>) => void;
  toggleDarkMode: () => void;
  isReady: boolean;
}

const ChurchProfileContext = createContext<ChurchProfileContextType | undefined>(undefined);
const STORAGE_KEY = 'church_profile_v1';

const applyGlobalStyles = (p: ChurchProfile) => {
  if (typeof window === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.style.setProperty('--primary-brand', p.primaryColor);
  root.style.setProperty('--accent-brand', p.accentColor);
  root.style.setProperty('--sidebar-bg', p.sidebarColor || p.primaryColor);
  root.style.setProperty('--main-bg', p.backgroundColor || '#F8FAFC');
  root.classList.toggle('dark', p.theme === 'dark' || !!p.darkMode);
};

export const ChurchProfileProvider = ({ children }: { children: ReactNode }) => {
  // Lazy initialiser reads localStorage synchronously — no setState in useEffect needed
  const [profile, setProfile] = useState<ChurchProfile>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT, ...JSON.parse(raw) };
      }
    } catch {
      /* ignore */
    }
    return DEFAULT;
  });

  const [isReady, setIsReady] = useState(false);

  // Apply global CSS vars + dark class before first paint.
  // useLayoutEffect only runs on the client, so setState here is safe —
  // it avoids the server/client mismatch that useEffect would cause.
  // The eslint-disable is intentional: we only want this to run once on mount.
  // Re-applying styles on profile change is handled by the useEffect below.
  useLayoutEffect(() => {
    applyGlobalStyles(profile);
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally omit `profile` — only needs to run once on mount

  // Re-apply whenever profile changes after save / toggleDarkMode
  useEffect(() => {
    applyGlobalStyles(profile);
  }, [profile]);

  const updateProfile = useCallback((partial: Partial<ChurchProfile>) => {
    setProfile((prev) => {
      const patch = { ...partial };
      if (patch.theme !== undefined && patch.darkMode === undefined) {
        patch.darkMode = patch.theme === 'dark';
      } else if (patch.darkMode !== undefined && patch.theme === undefined) {
        patch.theme = patch.darkMode ? 'dark' : 'light';
      }
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setProfile((prev) => {
      const darkMode = !prev.darkMode;
      const next: ChurchProfile = { ...prev, darkMode, theme: darkMode ? 'dark' : 'light' };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ChurchProfileContext.Provider value={{ profile, updateProfile, toggleDarkMode, isReady }}>
      {children}
    </ChurchProfileContext.Provider>
  );
};

export const useChurchProfile = () => {
  const ctx = useContext(ChurchProfileContext);
  if (!ctx) {
    throw new Error('useChurchProfile must be used within <ChurchProfileProvider>');
  }
  return ctx;
};
