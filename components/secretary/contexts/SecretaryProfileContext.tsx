'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export interface SecretaryProfile {
  adminName: string;
  preferredName: string;
  adminEmail: string;
  adminRole: string;
  adminPhone: string;
  avatarUrl: string | null;
  // Light palette
  primaryColor: string;
  accentColor: string;
  sidebarColor: string;
  topbarColor: string; // new — user-editable topbar background
  backgroundColor: string;
  // Dark palette (completely isolated)
  darkPrimaryColor: string;
  darkAccentColor: string;
  darkSidebarColor: string;
  darkTopbarColor: string; // new — dark topbar background
  darkBackgroundColor: string;
  darkMode: boolean;
  // System prefs
  language: string;
  currency: string;
  dateFormat: string;
  fontFamily: string;
  fontSize: string;
  autoBackup: boolean;
}

interface SecretaryProfileContextType {
  profile: SecretaryProfile;
  updateProfile: (partial: Partial<SecretaryProfile>) => void;
  toggleDarkMode: () => void;
  isReady: boolean;
}

const DEFAULT: SecretaryProfile = {
  adminName: '',
  preferredName: '',
  adminEmail: '',
  adminRole: 'Secretary',
  adminPhone: '',
  avatarUrl: null,
  primaryColor: '#0B2A4A',
  accentColor: '#2FC4B2',
  sidebarColor: '#FFFFFF',
  topbarColor: '#FFFFFF',
  backgroundColor: '#F5F7FA',
  darkPrimaryColor: '#1A3F6B',
  darkAccentColor: '#2FC4B2',
  darkSidebarColor: '#0D1F36',
  darkTopbarColor: '#0D1F36',
  darkBackgroundColor: '#0A1628',
  darkMode: false,
  language: 'en',
  currency: 'GHS',
  dateFormat: 'DD/MM/YYYY',
  fontFamily: 'Inter',
  fontSize: '14',
  autoBackup: false,
};

const STORAGE_KEY = 'secretary_profile_v1';

const readStored = (): SecretaryProfile => {
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
};

// Strictly dark OR light — zero blending ever
const applyTheme = (p: SecretaryProfile) => {
  if (typeof window === 'undefined') {
    return;
  }
  const root = document.querySelector('[data-secretary-theme]') as HTMLElement | null;
  if (!root) {
    return;
  }

  if (p.darkMode) {
    root.style.setProperty('--secretary-primary', p.darkPrimaryColor || '#1A3F6B');
    root.style.setProperty('--secretary-accent', p.darkAccentColor || '#2FC4B2');
    root.style.setProperty('--secretary-sidebar-bg', p.darkSidebarColor || '#0D1F36');
    root.style.setProperty('--secretary-topbar-bg', p.darkTopbarColor || '#0D1F36');
    root.style.setProperty('--secretary-main-bg', p.darkBackgroundColor || '#0A1628');
    root.classList.remove('light');
    root.classList.add('dark');
  } else {
    root.style.setProperty('--secretary-primary', p.primaryColor || '#0B2A4A');
    root.style.setProperty('--secretary-accent', p.accentColor || '#2FC4B2');
    root.style.setProperty('--secretary-sidebar-bg', p.sidebarColor || '#FFFFFF');
    root.style.setProperty('--secretary-topbar-bg', p.topbarColor || '#FFFFFF');
    root.style.setProperty('--secretary-main-bg', p.backgroundColor || '#F5F7FA');
    root.classList.remove('dark');
    root.classList.add('light');
  }
};

const SecretaryProfileContext = createContext<SecretaryProfileContextType | undefined>(undefined);

export function SecretaryProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SecretaryProfile>(readStored);

  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (isReady) {
      applyTheme(profile);
    }
  }, [profile, isReady]);

  const updateProfile = useCallback((partial: Partial<SecretaryProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
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
      const next = { ...prev, darkMode: !prev.darkMode };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <SecretaryProfileContext.Provider value={{ profile, updateProfile, toggleDarkMode, isReady }}>
      {children}
    </SecretaryProfileContext.Provider>
  );
}

export function useSecretaryProfile() {
  const ctx = useContext(SecretaryProfileContext);
  if (!ctx) {
    throw new Error('useSecretaryProfile must be used within <SecretaryProfileProvider>');
  }
  return ctx;
}
