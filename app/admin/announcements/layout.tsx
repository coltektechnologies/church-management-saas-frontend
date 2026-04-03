'use client';

import { type ReactNode } from 'react';
import { AnnouncementsPortalProvider } from '@/components/announcements/AnnouncementsPortalContext';

const adminAnnouncementsPortal = {
  announcementsBasePath: '/admin/announcements',
} as const;

export default function AdminAnnouncementsLayout({ children }: { children: ReactNode }) {
  return (
    <AnnouncementsPortalProvider value={adminAnnouncementsPortal}>
      {children}
    </AnnouncementsPortalProvider>
  );
}
