'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';

export default function ExpenseRequestsPage() {
  const router = useRouter();
  const { portalIdentityLoaded } = useDepartmentProfile();
  const department = usePortalDepartment();
  const departmentId = department?.id ?? '';

  useEffect(() => {
    if (!portalIdentityLoaded || !departmentId) {
      return;
    }
    router.replace(`/departments/${departmentId}/expenses/new`);
  }, [departmentId, portalIdentityLoaded, router]);

  if (portalIdentityLoaded && !departmentId) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <p className="text-gray-500 text-sm text-center max-w-md">
          No department is linked to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <p className="text-gray-400 text-sm animate-pulse">Loading expense form…</p>
    </div>
  );
}
