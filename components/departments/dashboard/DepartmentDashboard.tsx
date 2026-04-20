'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Expense } from '@/types/expense';
import { useDepartments } from '@/context/DepartmentsContext';
import DeptKpiCards, { type KpiData } from '@/components/departments/dashboard/DeptKpiCards';
import DeptUpcomingActivities, {
  type DeptActivity,
} from '@/components/departments/dashboard/DeptUpcomingActivities';
import DeptBudgetStatus from '@/components/departments/dashboard/DeptBudgetStatus';
import DeptRecentActivity, {
  type DeptRecentActivityItem,
} from '@/components/departments/dashboard/DeptRecentActivity';
import DeptPeriodFilter, { type Period } from '@/components/departments/dashboard/DeptPeriodFilter';
import {
  buildRecentActivityFeed,
  loadDepartmentDashboardKpis,
  mapActivityRowToDeptActivity,
  upcomingActivitiesToRecentItems,
} from '@/lib/departmentDashboardData';
import { fetchDepartmentActivities, fetchDepartmentActivitiesAllPages } from '@/lib/departmentsApi';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';

const EMPTY_EXPENSES: Expense[] = [];

export default function DepartmentDashboard() {
  const {
    loading: departmentsLoading,
    departmentExpensesMap,
    loadDepartmentExpenseRequests,
    syncDepartmentBudgetFromApi,
  } = useDepartments();
  const { portalIdentityLoaded } = useDepartmentProfile();
  const department = usePortalDepartment();
  const departmentId = department?.id ?? '';
  const expenses = useMemo(
    () => departmentExpensesMap[departmentId] ?? EMPTY_EXPENSES,
    [departmentExpensesMap, departmentId]
  );

  const [period, setPeriod] = useState<Period | null>('this_month');
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<DeptActivity[]>([]);
  const [widgetsLoading, setWidgetsLoading] = useState(true);
  const [recentFeed, setRecentFeed] = useState<DeptRecentActivityItem[] | null>(null);

  const handleApply = useCallback((p: Period | null, range?: { from: string; to: string }) => {
    setPeriod(p);
    if (p === 'custom' && range?.from && range?.to) {
      setCustomRange({ from: range.from, to: range.to });
    } else {
      setCustomRange(null);
    }
  }, []);

  useEffect(() => {
    if (!departmentId) {
      setWidgetsLoading(false);
      setUpcoming([]);
      setRecentFeed([]);
      return;
    }
    let cancelled = false;
    setWidgetsLoading(true);
    void (async () => {
      try {
        await loadDepartmentExpenseRequests(departmentId);
        await syncDepartmentBudgetFromApi(departmentId);
        const rows = await fetchDepartmentActivities(departmentId, 'upcoming');
        if (cancelled) {
          return;
        }
        setUpcoming(rows.slice(0, 8).map(mapActivityRowToDeptActivity));
      } catch {
        if (!cancelled) {
          setUpcoming([]);
        }
      } finally {
        if (!cancelled) {
          setWidgetsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [departmentId, loadDepartmentExpenseRequests, syncDepartmentBudgetFromApi]);

  useEffect(() => {
    if (!departmentId) {
      return;
    }
    let cancelled = false;
    setRecentFeed(null);
    void (async () => {
      try {
        const all = await fetchDepartmentActivitiesAllPages(departmentId, { maxPages: 3 });
        const ex = departmentExpensesMap[departmentId] ?? [];
        if (cancelled) {
          return;
        }
        setRecentFeed(buildRecentActivityFeed(all, ex));
      } catch {
        if (!cancelled) {
          setRecentFeed([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [departmentId, departmentExpensesMap]);

  useEffect(() => {
    if (!period || !departmentId) {
      setKpiData(null);
      setKpiError(null);
      setKpiLoading(false);
      return;
    }
    if (period === 'custom' && (!customRange?.from || !customRange?.to)) {
      setKpiError('Pick start and end dates, then apply.');
      setKpiData(null);
      setKpiLoading(false);
      return;
    }

    let cancelled = false;
    setKpiError(null);
    setKpiLoading(true);
    void loadDepartmentDashboardKpis({
      departmentId,
      period,
      customRange: period === 'custom' ? customRange : null,
      expenses,
      annualBudget: department?.annualBudget ?? 0,
      budgetUsed: department?.budgetUsed ?? 0,
    })
      .then((k) => {
        if (!cancelled) {
          setKpiData(k);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setKpiData(null);
          setKpiError(e instanceof Error ? e.message : 'Could not load dashboard metrics.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setKpiLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    period,
    customRange,
    departmentId,
    expenses,
    department?.annualBudget,
    department?.budgetUsed,
  ]);

  /** Must run before any conditional return — Rules of Hooks. */
  const displayRecentFeed = useMemo(() => {
    if (recentFeed === null) {
      return null;
    }
    if (recentFeed.length > 0) {
      return recentFeed;
    }
    if (widgetsLoading) {
      return null;
    }
    if (upcoming.length > 0) {
      return upcomingActivitiesToRecentItems(upcoming);
    }
    return recentFeed;
  }, [recentFeed, widgetsLoading, upcoming]);

  const budgetAllocated = department?.annualBudget ?? 0;
  const budgetSpent = department?.budgetUsed ?? 0;

  if (!portalIdentityLoaded || (departmentsLoading && !department)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-8">
        <p className="text-gray-400 text-sm animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-8">
        <p className="text-gray-500 text-sm text-center max-w-md">
          No department is linked to your account. You need a member profile linked to this login
          and an assignment as department head or elder in charge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="px-5 py-3">
        <DeptPeriodFilter appliedPeriod={period} onPeriodChange={setPeriod} onApply={handleApply} />
      </div>

      {kpiError && (
        <div className="px-5">
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {kpiError}
          </p>
        </div>
      )}

      <div className="px-1 sm:px-2">
        <DeptKpiCards
          period={period}
          data={kpiData ?? {}}
          loading={kpiLoading}
          failed={Boolean(kpiError && !kpiLoading)}
          snapshotMemberCount={department.members}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
        <DeptUpcomingActivities loading={widgetsLoading} activities={upcoming} />
        <DeptBudgetStatus allocated={budgetAllocated} spent={budgetSpent} />
      </div>

      <DeptRecentActivity feedItems={displayRecentFeed} />
    </div>
  );
}
