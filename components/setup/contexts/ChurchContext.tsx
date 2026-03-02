'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

/* ─── Church setup data shared across the app ─── */
export interface ChurchSetupData {
  churchName: string;
  logoUrl: string | null;
  primaryColor: string; // stored as hex
  accentColor: string; // stored as hex
  services: { id: string; day: string; time: string; label: string }[];
  departments: { id: string; name: string; leader: string }[];
}

interface ChurchContextType {
  church: ChurchSetupData;
  setChurch: (data: Partial<ChurchSetupData>) => void;
  resetChurch: () => void;
}

const defaultChurch: ChurchSetupData = {
  churchName: 'My Church',
  logoUrl: null,
  primaryColor: '#2FC4B2',
  accentColor: '#0B2A4A',
  services: [],
  departments: [],
};

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider = ({ children }: { children: ReactNode }) => {
  const [church, setChurchState] = useState<ChurchSetupData>(defaultChurch);

  // Memoized to prevent unnecessary re-renders in Client Components
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

export const useChurch = () => {
  const ctx = useContext(ChurchContext);
  if (!ctx) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return ctx;
};
