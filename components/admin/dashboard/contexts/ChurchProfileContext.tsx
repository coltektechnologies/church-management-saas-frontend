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

export type SubscriptionStatus = 'trial' | 'active' | 'inactive';
export type ThemeMode = 'light' | 'dark';

/**
 * System-level access permission — controls what the granted admin
 * can do inside the system dashboard.
 */
export type AdminPermission = 'Admin' | 'Editor' | 'Viewer';

/**
 * The admin's official church link/position.
 * This is the value that populates DepartmentProfile.userRole in DeptMyProfileTab.
 * Distinct from system permission — a Treasurer may only need "Viewer" access.
 */
export type ChurchLink =
  | 'Pastor'
  | 'Associate Pastor'
  | 'Elder'
  | 'Deacon'
  | 'Deaconess'
  | 'Church Secretary'
  | 'Treasurer'
  | 'Youth Director'
  | 'Choir Director'
  | 'Sabbath School Superintendent'
  | 'Community Services Director'
  | 'Head of Department'
  | 'Department Secretary'
  | 'Volunteer'
  | 'Other';

// ─── GrantedAdmin ─────────────────────────────────────────────────────────────

export interface GrantedAdmin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  /** System-level access permission (Admin / Editor / Viewer). */
  permission: AdminPermission;
  /**
   * Official church link / position — feeds into DeptMyProfileTab as userRole.
   * Stored as a string so custom values typed by the user are also accepted.
   */
  churchLink: ChurchLink | string;
  department?: string;
  departmentType?: string;
  notification_preference: string;
  send_credentials: boolean;
  church_groups: string[];
  granted_at: string; // ISO string
  revoked_at?: string | null; // ISO string, null if still active
}

// ─── ChurchProfile ────────────────────────────────────────────────────────────

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

// ─── Context type ─────────────────────────────────────────────────────────────

interface ChurchProfileContextType {
  profile: ChurchProfile;
  updateProfile: (partial: Partial<ChurchProfile>) => void;
  toggleDarkMode: () => void;
  isReady: boolean;
  // Admin management
  grantAdmin: (admin: Omit<GrantedAdmin, 'id' | 'granted_at' | 'revoked_at'>) => void;
  revokeAdmin: (id: string) => void;
  getAllAdmins: () => GrantedAdmin[];
  getActiveAdmins: () => GrantedAdmin[];
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'church_profile_v1';
const ADMINS_STORAGE_KEY = 'church_granted_admins_v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const readStoredProfile = (): ChurchProfile => {
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

const readStoredAdmins = (): GrantedAdmin[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as GrantedAdmin[];
    }
  } catch {
    /* ignore */
  }
  return [];
};

const saveAdmins = (admins: GrantedAdmin[]) => {
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
  } catch {
    /* ignore */
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ChurchProfileContext = createContext<ChurchProfileContextType | undefined>(undefined);

export const ChurchProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ChurchProfile>(readStoredProfile);
  const [admins, setAdmins] = useState<GrantedAdmin[]>(readStoredAdmins);

  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useLayoutEffect(() => {
    applyGlobalStyles(profile);
  }, [profile]);
  useEffect(() => {
    applyGlobalStyles(profile);
  }, [profile]);

  // ── Profile ──────────────────────────────────────────────────────────────

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

  // ── Admin management ─────────────────────────────────────────────────────

  const grantAdmin = useCallback(
    (admin: Omit<GrantedAdmin, 'id' | 'granted_at' | 'revoked_at'>) => {
      const newAdmin: GrantedAdmin = {
        ...admin,
        id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      };
      setAdmins((prev) => {
        const next = [...prev, newAdmin];
        saveAdmins(next);
        return next;
      });
    },
    []
  );

  const revokeAdmin = useCallback((id: string) => {
    setAdmins((prev) => {
      const next = prev.map((a) =>
        a.id === id ? { ...a, revoked_at: new Date().toISOString() } : a
      );
      saveAdmins(next);
      return next;
    });
  }, []);

  const getAllAdmins = useCallback((): GrantedAdmin[] => admins, [admins]);
  const getActiveAdmins = useCallback(
    (): GrantedAdmin[] => admins.filter((a) => !a.revoked_at),
    [admins]
  );

  return (
    <ChurchProfileContext.Provider
      value={{
        profile,
        updateProfile,
        toggleDarkMode,
        isReady,
        grantAdmin,
        revokeAdmin,
        getAllAdmins,
        getActiveAdmins,
      }}
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
