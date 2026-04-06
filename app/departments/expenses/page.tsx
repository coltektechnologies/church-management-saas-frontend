'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartments } from '@/context/DepartmentsContext';

export default function ExpenseRequestsPage() {
  const router = useRouter();
  const { departments } = useDepartments();

  // For now use the first active department — API integration will filter by logged-in user
  const department = departments.find((d) => d.status === 'active') ?? departments[0];
  const departmentId = department?.id ?? '';

  useEffect(() => {
    if (!departmentId) {
      return;
    }
    router.replace(`/departments/${departmentId}/expenses/new`);
  }, [departmentId, router]);

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <p className="text-gray-400 text-sm animate-pulse">Loading expense form…</p>
    </div>
  );
}
