'use client';

import { type ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireDepartmentPortal } from '@/components/auth/RequireDepartmentPortal';

// const skipAuth = process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH === 'true';

export default function DepartmentLayoutClient({ children }: { children: ReactNode }) {
  // if (skipAuth) return <>{children}</>;
  return (
    <RequireAuth>
      <RequireDepartmentPortal>{children}</RequireDepartmentPortal>
    </RequireAuth>
  );
}
