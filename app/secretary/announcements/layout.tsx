'use client';

import { type ReactNode } from 'react';
import { AnnouncementsPortalProvider } from '@/components/announcements/AnnouncementsPortalContext';

const secretaryAnnouncementsPortal = {
  announcementsBasePath: '/secretary/announcements',
} as const;

export default function SecretaryAnnouncementsLayout({ children }: { children: ReactNode }) {
  return (
    <AnnouncementsPortalProvider value={secretaryAnnouncementsPortal}>
      {children}
    </AnnouncementsPortalProvider>
  );
}
