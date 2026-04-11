'use client';

import { type ReactNode } from 'react';
import { MembersPortalProvider } from '@/components/admin/membership/MembersPortalContext';
import { departmentMembersPortal } from '@/lib/departmentMembersPortal';

export default function DepartmentMembersSectionLayout({ children }: { children: ReactNode }) {
  return <MembersPortalProvider value={departmentMembersPortal}>{children}</MembersPortalProvider>;
}
