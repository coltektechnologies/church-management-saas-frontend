'use client';

import { useMemo } from 'react';
import { useDepartments } from '@/context/DepartmentsContext';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import type { Department } from '@/types/Department';

const skipDepartmentPortalFetch =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH === 'true';

/**
 * Department row for the signed-in portal user. Uses `portalDepartmentId` from my-portal;
 * in skip-auth dev mode, falls back to first active department from the list.
 */
export function usePortalDepartment(): Department | undefined {
  const { departments } = useDepartments();
  const { profile } = useDepartmentProfile();

  return useMemo(() => {
    if (skipDepartmentPortalFetch) {
      return departments.find((d) => d.status === 'active') ?? departments[0];
    }
    const pid = profile.portalDepartmentId;
    if (!pid) {
      return undefined;
    }
    return departments.find((d) => d.id === pid);
  }, [departments, profile.portalDepartmentId]);
}
