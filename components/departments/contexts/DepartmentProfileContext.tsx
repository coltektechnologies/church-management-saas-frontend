'use client';

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DepartmentProfile {
  // Identity
  departmentName: string;
  departmentType: string; // e.g. "Youth", "Choir", "Finance"
  headName: string;
  preferredName: string;
  headEmail: string;
  headPhone: string;
  avatarUrl: string | null;
  /** Church role/title of the department head (e.g. "Elder", "Deaconess") */
  userRole: string;

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

  // Theme state — kept in sync: toggling one updates the other
  darkMode: boolean;
  theme: 'light' | 'dark';

  // System preferences
  language: string;
  currency: string;
  dateFormat: string;
  fontFamily: string;
  fontSize: string;
  autoBackup: boolean;
}

interface DepartmentProfileContextType {
  profile: DepartmentProfile;
  updateProfile: (partial: Partial<DepartmentProfile>) => void;
  toggleDarkMode: () => void;
  isReady: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT: DepartmentProfile = {
  departmentName: 'Adventist Youth',
  departmentType: 'Youth',
  headName: 'Bro. Owusu Williams',
  preferredName: '',
  headEmail: '',
  headPhone: '',
  avatarUrl: null,
  userRole: '',

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
  theme: 'light',

  language: 'en',
  currency: 'GHS',
  dateFormat: 'DD/MM/YYYY',
  fontFamily: 'Inter',
  fontSize: '14',
  autoBackup: false,
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'department_profile_v1';

const readStoredProfile = (): DepartmentProfile => {
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

// ─── Theme application ────────────────────────────────────────────────────────

/**
 * Applies CSS custom properties to the nearest [data-department-theme] element
 * (scoped theming) and also falls back to <html> so global Tailwind dark-mode
 * classes work correctly.
 */
const applyGlobalStyles = (p: DepartmentProfile) => {
  if (typeof window === 'undefined') {
    return;
  }

  const isDark = p.theme === 'dark' || p.darkMode;

  // ── Scoped theming (layout root) ──────────────────────────────────────────
  const scoped = document.querySelector('[data-department-theme]') as HTMLElement | null;
  if (scoped) {
    scoped.style.setProperty('--dept-primary', isDark ? p.darkPrimaryColor : p.primaryColor);
    scoped.style.setProperty('--dept-accent', isDark ? p.darkAccentColor : p.accentColor);
    scoped.style.setProperty('--dept-sidebar-bg', isDark ? p.darkSidebarColor : p.sidebarColor);
    scoped.style.setProperty('--dept-topbar-bg', isDark ? p.darkTopbarColor : p.topbarColor);
    scoped.style.setProperty('--dept-main-bg', isDark ? p.darkBackgroundColor : p.backgroundColor);
    scoped.style.setProperty(
      '--dept-font-family',
      `'${p.fontFamily || 'Inter'}', system-ui, sans-serif`
    );
    scoped.style.setProperty('--dept-font-size', `${p.fontSize || '14'}px`);
    scoped.classList.toggle('dark', isDark);
    scoped.classList.toggle('light', !isDark);
  }

  // ── Global theming (html element — for Tailwind dark mode) ────────────────
  const root = document.documentElement;
  root.style.setProperty('--primary-brand', isDark ? p.darkPrimaryColor : p.primaryColor);
  root.style.setProperty('--accent-brand', isDark ? p.darkAccentColor : p.accentColor);
  root.style.setProperty(
    '--sidebar-bg',
    isDark ? p.darkSidebarColor : p.sidebarColor || p.primaryColor
  );
  root.style.setProperty(
    '--main-bg',
    isDark ? p.darkBackgroundColor : p.backgroundColor || '#F5F7FA'
  );
  root.classList.toggle('dark', isDark);
};

// ─── Context ──────────────────────────────────────────────────────────────────

const DepartmentProfileContext = createContext<DepartmentProfileContextType | undefined>(undefined);

export function DepartmentProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DepartmentProfile>(readStoredProfile);

  /**
   * isReady is false during SSR and true on the client, preventing hydration
   * mismatches when reading localStorage.
   */
  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Apply immediately before paint to avoid flash (SSR-safe guard inside helper)
  useLayoutEffect(() => {
    applyGlobalStyles(profile);
  }, [profile]);
  // Fallback for environments where useLayoutEffect fires after paint
  useEffect(() => {
    if (isReady) {
      applyGlobalStyles(profile);
    }
  }, [profile, isReady]);

  const updateProfile = useCallback((partial: Partial<DepartmentProfile>) => {
    setProfile((prev) => {
      const patch = { ...partial };

      // Keep darkMode ↔ theme in sync whichever side is updated
      if (patch.theme !== undefined && patch.darkMode === undefined) {
        patch.darkMode = patch.theme === 'dark';
      } else if (patch.darkMode !== undefined && patch.theme === undefined) {
        patch.theme = patch.darkMode ? 'dark' : 'light';
      }

      const next: DepartmentProfile = { ...prev, ...patch };
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
      const next: DepartmentProfile = { ...prev, darkMode, theme: darkMode ? 'dark' : 'light' };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <DepartmentProfileContext.Provider value={{ profile, updateProfile, toggleDarkMode, isReady }}>
      {children}
    </DepartmentProfileContext.Provider>
  );
}

export function useDepartmentProfile() {
  const ctx = useContext(DepartmentProfileContext);
  if (!ctx) {
    throw new Error('useDepartmentProfile must be used within <DepartmentProfileProvider>');
  }
  return ctx;
}
