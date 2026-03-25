'use client';

// Replace with real data fetching when building each feature.
import { createContext, useContext, useState, ReactNode } from 'react';

interface AppDataContextValue {
  pending: { id: string; title: string }[];
  activities: {
    id: string;
    userName: string;
    action: string;
    entity: string;
    timestamp: string;
    tab: string;
  }[];
}

const AppDataContext = createContext<AppDataContextValue>({
  pending: [],
  activities: [],
});

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [pending] = useState<AppDataContextValue['pending']>([]);
  const [activities] = useState<AppDataContextValue['activities']>([]);

  return (
    <AppDataContext.Provider value={{ pending, activities }}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
