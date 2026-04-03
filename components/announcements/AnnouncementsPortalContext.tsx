'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type AnnouncementsPortalConfig = {
  /** e.g. `/admin/announcements` or `/secretary/announcements` */
  announcementsBasePath: string;
};

const defaultConfig: AnnouncementsPortalConfig = {
  announcementsBasePath: '/admin/announcements',
};

const AnnouncementsPortalContext = createContext<AnnouncementsPortalConfig>(defaultConfig);

export function AnnouncementsPortalProvider({
  value,
  children,
}: {
  value: AnnouncementsPortalConfig;
  children: ReactNode;
}) {
  return (
    <AnnouncementsPortalContext.Provider value={value}>
      {children}
    </AnnouncementsPortalContext.Provider>
  );
}

export function useAnnouncementsPortal() {
  return useContext(AnnouncementsPortalContext);
}
