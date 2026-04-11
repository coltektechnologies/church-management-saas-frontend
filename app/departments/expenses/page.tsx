'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartments } from '@/context/DepartmentsContext';
import { Department } from '@/types/Department';
import ExpenseRequest from '@/components/departments/ExpenseRequests/ExpenseRequest';

// ── Mock fallback — used when API returns no departments (local dev / no auth) ──
const MOCK_DEPARTMENT: Department = {
  id: '1',
  name: 'Adventist Youth',
  code: 'AY-001',
  description: 'Youth ministry department',
  members: 25,
  activities: 5,
  budgetUsed: 3750,
  annualBudget: 8000,
  status: 'active',
  themeColor: 'navy',
  icon: '📖',
  dateEstablished: '2022-01-10',
  settings: {
    autoApprovalThreshold: 500,
    requiresElderApproval: true,
    weeklySummary: true,
    canSubmitAnnouncements: true,
  },
};
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

  return <ExpenseRequest />;
}
