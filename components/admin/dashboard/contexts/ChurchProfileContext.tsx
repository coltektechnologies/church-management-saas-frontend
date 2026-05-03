'use client';

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type SubscriptionStatus = 'trial' | 'active' | 'inactive';
export type ThemeMode = 'light' | 'dark';

/** Department settings pre-fill; wire to API / superadmin store when available. */
export interface GrantedAdmin {
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
  departmentType?: string;
  churchLink?: string;
  phone?: string;
  granted_at: string;
}

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
  /** Active admins for department profile pre-fill; returns [] until backed by API. */
  getActiveAdmins: () => GrantedAdmin[];
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
  const isDark = p.theme === 'dark' || !!p.darkMode;
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
};

const readStoredProfile = (): ChurchProfile => {
  if (typeof window === 'undefined') {
    return DEFAULT;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT;
};

export const ChurchProfileProvider = ({ children }: { children: ReactNode }) => {
  /** Always start with DEFAULT so SSR + first client paint match (avoids hydration mismatch when localStorage differs). */
  const [profile, setProfile] = useState<ChurchProfile>(DEFAULT);

  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useLayoutEffect(() => {
    applyGlobalStyles(profile);
  }, [profile]);

  /** After mount, hydrate from localStorage (deferred to avoid react-hooks/set-state-in-effect on synchronous effect bodies). */
  useLayoutEffect(() => {
    queueMicrotask(() => {
      setProfile(readStoredProfile());
    });
  }, []);

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

  const getActiveAdmins = useCallback((): GrantedAdmin[] => {
    return [];
  }, []);

  return (
    <ChurchProfileContext.Provider
      value={{ profile, updateProfile, toggleDarkMode, isReady, getActiveAdmins }}
    >
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
