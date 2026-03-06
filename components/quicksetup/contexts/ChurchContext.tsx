'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

/* ─── 1. TYPES & INTERFACES ─── */
export interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profilePic: string | null;
}

export interface ChurchSetupData {
  churchName: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  services: { id: string; day: string; time: string; label: string }[];
  departments: { id: string; name: string; leader: string }[];
  adminName: string;
  email: string;
  website: string;
  mission: string;
  admin?: AdminProfile;
}

interface ChurchContextType {
  church: ChurchSetupData;
  setChurch: (data: Partial<ChurchSetupData>) => void;
  resetChurch: () => void;
}

/* ─── 2. INITIAL STATE ─── */
const defaultChurch: ChurchSetupData = {
  churchName: 'My Church',
  logoUrl: null,
  primaryColor: '#2FC4B2',
  accentColor: '#0B2A4A',
  services: [],
  departments: [],
  adminName: '',
  email: '',
  website: '',
  mission: '',
  admin: undefined,
};

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

/* ─── 3. PROVIDER ─── */
export const ChurchProvider = ({ children }: { children: ReactNode }) => {
  const [church, setChurchState] = useState<ChurchSetupData>(defaultChurch);

  const setChurch = useCallback((data: Partial<ChurchSetupData>) => {
    setChurchState((prev) => ({ ...prev, ...data }));
  }, []);

  const resetChurch = useCallback(() => {
    setChurchState(defaultChurch);
  }, []);

  return (
    <ChurchContext.Provider value={{ church, setChurch, resetChurch }}>
      {children}
    </ChurchContext.Provider>
  );
};

/* ─── 4. CUSTOM HOOK ─── */
export const useChurch = () => {
  const ctx = useContext(ChurchContext);
  if (!ctx) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return ctx;
};
