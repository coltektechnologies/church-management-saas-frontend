'use client';

import { type ReactNode } from 'react';
import { MembersPortalProvider } from '@/components/admin/membership/MembersPortalContext';

const secretaryMembersPortal = {
  membersBasePath: '/secretary/members',
  appHomeHref: '/secretary',
  appHomeLabel: 'Dashboard',
  departmentsHref: '/secretary/departments',
} as const;

export default function SecretaryMembersLayout({ children }: { children: ReactNode }) {
  return <MembersPortalProvider value={secretaryMembersPortal}>{children}</MembersPortalProvider>;
}
