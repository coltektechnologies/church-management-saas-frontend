/**
 * Aggregates backend data for the department portal dashboard (/departments).
 */

import type { Period } from '@/components/departments/dashboard/DeptPeriodFilter';
import type { KpiData } from '@/components/departments/dashboard/DeptKpiCards';
import {
  deriveActivityDisplayStatus,
  fetchDepartmentStatistics,
  fetchDepartmentActivitiesAllPages,
  fetchDepartmentActivities,
  type DepartmentActivityRow,
} from '@/lib/departmentsApi';
import { fetchAnnouncementsList } from '@/lib/announcementsApi';
import type { Expense } from '@/types/expense';
import type { DeptRecentActivityItem } from '@/components/departments/dashboard/DeptRecentActivity';
import type { DeptActivity } from '@/components/departments/dashboard/DeptUpcomingActivities';

function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map((x) => parseInt(x, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1);
}

function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  const lastMonth = q * 3 + 2;
  return new Date(d.getFullYear(), lastMonth + 1, 0, 23, 59, 59, 999);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function getPeriodDateBounds(
  period: Period,
  custom?: { from: string; to: string } | null
): { from: Date; to: Date } | null {
  const now = new Date();
  if (period === 'custom') {
    if (!custom?.from || !custom?.to) {
      return null;
    }
    const from = parseYmd(custom.from);
    const to = parseYmd(custom.to);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (period === 'this_month') {
    return { from: startOfMonth(now), to: endOfMonth(now) };
  }
  if (period === 'this_quarter') {
    return { from: startOfQuarter(now), to: endOfQuarter(now) };
  }
  if (period === 'this_year') {
    return { from: startOfYear(now), to: endOfYear(now) };
  }
  return { from: startOfMonth(now), to: endOfMonth(now) };
}

function activityStartsInRange(row: DepartmentActivityRow, from: Date, to: Date): boolean {
  try {
    const t = parseYmd(row.start_date).getTime();
    return t >= from.getTime() && t <= to.getTime();
  } catch {
    return false;
  }
}

export function mapActivityRowToDeptActivity(row: DepartmentActivityRow): DeptActivity {
  const time = row.start_time && row.start_time.length >= 5 ? row.start_time.slice(0, 5) : '—';
  const phase = deriveActivityDisplayStatus(row);
  const status: DeptActivity['status'] = phase === 'Past' ? 'completed' : 'upcoming';
  return {
    id: String(row.id),
    name: row.title,
    date: row.start_date,
    time,
    location: row.location?.trim() || '—',
    status,
  };
}

function ts(iso?: string | null): number {
  if (!iso) {
    return Date.now();
  }
  const n = new Date(iso).getTime();
  return Number.isFinite(n) ? n : Date.now();
}

function activityYmdToTimestamp(dateYmd: string): number {
  try {
    const t = parseYmd(dateYmd).getTime();
    return Number.isFinite(t) ? t : Date.now();
  } catch {
    return Date.now();
  }
}

/** When the activity API feed is empty, reuse upcoming rows already shown on the dashboard. */
export function upcomingActivitiesToRecentItems(
  upcoming: DeptActivity[]
): DeptRecentActivityItem[] {
  return upcoming.map((a) => ({
    id: `up-${a.id}`,
    icon: '📅',
    label: `Activity: ${a.name}`,
    detail: a.date,
    timestamp: activityYmdToTimestamp(a.date),
  }));
}

export function buildRecentActivityFeed(
  activityRows: DepartmentActivityRow[],
  expenses: Expense[]
): DeptRecentActivityItem[] {
  const fromActs: DeptRecentActivityItem[] = activityRows.map((r) => ({
    id: `act-${r.id}`,
    icon: '📅',
    label: `Activity: ${r.title?.trim() || 'Event'}`,
    detail: r.start_date,
    timestamp: ts(r.updated_at ?? r.created_at),
  }));

  const fromExp: DeptRecentActivityItem[] = expenses.map((e) => ({
    id: `exp-${e.id}`,
    icon: '💰',
    label: `Request: ${e.title}`,
    detail: e.status === 'pending' ? 'pending' : e.status,
    timestamp: ts(e.submittedAt),
  }));

  return [...fromActs, ...fromExp].sort((a, b) => b.timestamp - a.timestamp);
}

export async function loadDepartmentDashboardKpis(input: {
  departmentId: string;
  period: Period;
  customRange: { from: string; to: string } | null;
  expenses: Expense[];
  annualBudget: number;
  budgetUsed: number;
}): Promise<KpiData> {
  const { departmentId, period, customRange, expenses } = input;
  const bounds = getPeriodDateBounds(period, period === 'custom' ? customRange : null);
  if (!bounds) {
    throw new Error('Choose start and end dates for a custom range.');
  }
  const { from, to } = bounds;

  const [stats, upcomingList, allForRange] = await Promise.all([
    fetchDepartmentStatistics(departmentId),
    fetchDepartmentActivities(departmentId, 'upcoming'),
    fetchDepartmentActivitiesAllPages(departmentId),
  ]);

  const inRange = allForRange.filter((r) => activityStartsInRange(r, from, to));

  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length;

  let pendingAnnouncements = 0;
  try {
    const [drafts, pending] = await Promise.all([
      fetchAnnouncementsList({ status: 'DRAFT', page_size: 100, mine_only: true }),
      fetchAnnouncementsList({ status: 'PENDING_REVIEW', page_size: 100, mine_only: true }),
    ]);
    pendingAnnouncements = drafts.length + pending.length;
  } catch {
    pendingAnnouncements = 0;
  }

  const totalMembers = stats.total_members ?? 0;
  const pendingItems = pendingAnnouncements + pendingExpenses;
  const annualBudget = Math.max(0, input.annualBudget);
  const budgetUsed = Math.max(0, input.budgetUsed);
  const budgetRemaining = Math.max(annualBudget - budgetUsed, 0);

  return {
    members: totalMembers,
    membersChange: 'Live from directory',
    activitiesThisMonth: inRange.length,
    activitiesUpcoming: upcomingList.length,
    budgetRemaining,
    budgetAllocated: annualBudget,
    pendingItems,
    pendingAnnouncements,
    pendingRequests: pendingExpenses,
  };
}
