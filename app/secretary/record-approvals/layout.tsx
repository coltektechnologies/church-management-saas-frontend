'use client';

import { type ReactNode } from 'react';
import SecretaryAdminThemeShell from '@/components/secretary/SecretaryAdminThemeShell';

export default function SecretaryRecordApprovalsLayout({ children }: { children: ReactNode }) {
  return <SecretaryAdminThemeShell>{children}</SecretaryAdminThemeShell>;
}
