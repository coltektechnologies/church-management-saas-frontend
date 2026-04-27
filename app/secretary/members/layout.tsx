'use client';

import { type ReactNode } from 'react';
import { MembersPortalProvider } from '@/components/admin/membership/MembersPortalContext';
import SecretaryAdminThemeShell from '@/components/secretary/SecretaryAdminThemeShell';

const secretaryMembersPortal = {
  membersBasePath: '/secretary/members',
  appHomeHref: '/secretary',
  appHomeLabel: 'Dashboard',
  departmentsHref: '/secretary/departments',
} as const;

export default function SecretaryMembersLayout({ children }: { children: ReactNode }) {
  return (
    <MembersPortalProvider value={secretaryMembersPortal}>
      <SecretaryAdminThemeShell>{children}</SecretaryAdminThemeShell>
    </MembersPortalProvider>
  );
}
