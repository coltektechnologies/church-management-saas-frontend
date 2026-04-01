'use client';

import { useState } from 'react';
import DeptKpiCards from '@/components/departments/dashboard/DeptKpiCards';
import DeptUpcomingActivities from '@/components/departments/dashboard/DeptUpcomingActivities';
import DeptBudgetStatus from '@/components/departments/dashboard/DeptBudgetStatus';
import DeptRecentActivity from '@/components/departments/dashboard/DeptRecentActivity';
import DeptPeriodFilter, { type Period } from '@/components/departments/dashboard/DeptPeriodFilter';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

export default function DepartmentDashboard() {
  const [period, setPeriod] = useState<Period>('this_month');
  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const deptName = isReady ? profile.departmentName || 'Adventist Youth' : 'Adventist Youth';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Department Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span style={{ color: accentColor, fontWeight: 600 }}>{deptName}</span>
            {' / Department Dashboard'}
          </p>
        </div>
      </div>

      {/* Period filter */}
      <div className="bg-card border border-border rounded-2xl px-5 py-3">
        <DeptPeriodFilter period={period} onPeriodChange={setPeriod} />
      </div>

      {/* KPI cards */}
      <DeptKpiCards />

      {/* Middle row: upcoming activities + budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DeptUpcomingActivities />
        <DeptBudgetStatus />
      </div>

      {/* Recent activity */}
      <DeptRecentActivity />
    </div>
  );
}
