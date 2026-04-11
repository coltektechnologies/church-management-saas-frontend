'use client';

/**
 * TreasuryProfileContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export interface TreasuryProfile {
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
  topbarColor: string;
  backgroundColor: string;
  // Dark palette
  darkPrimaryColor: string;
  darkAccentColor: string;
  darkSidebarColor: string;
  darkTopbarColor: string;
  darkBackgroundColor: string;
  darkMode: boolean;
  // System prefs
  language: string;
  currency: string;
  dateFormat: string;
  fontFamily: string;
  fontSize: string;
  autoBackup: boolean;
  // Event reminder contacts
  reminderEmail: string;
  reminderPhone: string;
}

interface TreasuryProfileContextType {
  profile: TreasuryProfile;
  updateProfile: (partial: Partial<TreasuryProfile>) => void;
  toggleDarkMode: () => void;
  isReady: boolean;
}

const DEFAULT: TreasuryProfile = {
  adminName: '',
  preferredName: '',
  adminEmail: '',
  adminRole: '',
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
  reminderEmail: '',
  reminderPhone: '',
};

const STORAGE_KEY = 'treasury_profile_v1';

const readStored = (): TreasuryProfile => {
  if (typeof window === 'undefined') {
    return DEFAULT;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT;
};

const applyTheme = (p: TreasuryProfile) => {
  if (typeof window === 'undefined') {
    return;
  }
  const root = document.querySelector('[data-treasury-theme]') as HTMLElement | null;
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

const TreasuryProfileContext = createContext<TreasuryProfileContextType | undefined>(undefined);

export function TreasuryProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<TreasuryProfile>(readStored);

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

  const updateProfile = useCallback((partial: Partial<TreasuryProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
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
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <TreasuryProfileContext.Provider value={{ profile, updateProfile, toggleDarkMode, isReady }}>
      {children}
    </TreasuryProfileContext.Provider>
  );
}

export function useTreasuryProfile() {
  const ctx = useContext(TreasuryProfileContext);
  if (!ctx) {
    throw new Error('useTreasuryProfile must be used within <TreasuryProfileProvider>');
  }
  return ctx;
}
