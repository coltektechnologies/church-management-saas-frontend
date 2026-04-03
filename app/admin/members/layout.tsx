'use client';

import { type ReactNode } from 'react';
import { MembersPortalProvider } from '@/components/admin/membership/MembersPortalContext';

const adminMembersPortal = {
  membersBasePath: '/admin/members',
  appHomeHref: '/admin',
  appHomeLabel: 'Membership',
  departmentsHref: '/admin/departments',
} as const;

export default function AdminMembersLayout({ children }: { children: ReactNode }) {
  return <MembersPortalProvider value={adminMembersPortal}>{children}</MembersPortalProvider>;
}
