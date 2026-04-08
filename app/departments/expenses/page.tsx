'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartments } from '@/context/DepartmentsContext';
import { Department } from '@/types/Department';

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

export default function ExpenseRequestsPage() {
  const router = useRouter();
  const { departments } = useDepartments();

  const department: Department =
    departments.find((d) => d.status === 'active') ??
    departments[0] ??
    MOCK_DEPARTMENT;

  const departmentId = department.id;

  useEffect(() => {
    if (!departmentId) {return;}
    router.replace(`/departments/${departmentId}/expenses/new`);
  }, [departmentId, router]);

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <p className="text-gray-400 text-sm animate-pulse">Loading expense form…</p>
    </div>
  );
}