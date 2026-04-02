'use client';

import { useState } from 'react';
import DeptKpiCards from '@/components/departments/dashboard/DeptKpiCards';
import DeptUpcomingActivities from '@/components/departments/dashboard/DeptUpcomingActivities';
import DeptBudgetStatus from '@/components/departments/dashboard/DeptBudgetStatus';
import DeptRecentActivity from '@/components/departments/dashboard/DeptRecentActivity';
import DeptPeriodFilter from '@/components/departments/dashboard/DeptPeriodFilter';
import type { Period } from '@/components/departments/dashboard/DeptPeriodFilter';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

export default function DepartmentDashboard() {
  // null = no filter selected; Period = a filter card is active
  const [period, setPeriod] = useState<Period | null>(null);

  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const deptName = isReady ? profile.departmentName || 'Adventist Youth' : 'Adventist Youth';

  // onApply from filter — updates the active period driving KPI card data
  const handleApply = (p: Period | null) => {
    setPeriod(p);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Period filter — no prop for default selection; onPeriodChange + onApply both drive period state */}
      <div className="px-5 py-3">
        <DeptPeriodFilter onPeriodChange={setPeriod} onApply={handleApply} />
      </div>

      {/* KPI cards — period prop is Period | null; null shows placeholder dashes */}
      <DeptKpiCards period={period} />

      {/* Middle row: upcoming activities + budget */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
        <DeptUpcomingActivities />
        <DeptBudgetStatus />
      </div>

      {/* Recent activity */}
      <DeptRecentActivity />
    </div>
  );
}
