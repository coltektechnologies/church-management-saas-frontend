/**
 * useDashboardApiSync
 *
 * Fetches dashboard data from the backend API and syncs it to AppDataContext.
 * Runs when the user is authenticated (has access token). Handles loading and
 * error states.
 *
 * @module hooks/useDashboardApiSync
 */

import { useEffect, useCallback, useState } from 'react';
import { getAccessToken } from '@/lib/api';
import * as dashboardApi from '@/lib/dashboardApi';
import * as mappers from '@/lib/dashboardMappers';
import type {
  Member,
  Transaction,
  Announcement,
  EventItem,
  Dept,
  Approval,
  ActivityLogItem,
} from '@/components/admin/dashboard/contexts/AppDataContext';

export interface UseDashboardApiSyncOptions {
  setMembers: (v: Member[] | ((prev: Member[]) => Member[])) => void;
  setTransactions: (v: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  setAnnouncements: (v: Announcement[] | ((prev: Announcement[]) => Announcement[])) => void;
  setEvents: (v: EventItem[] | ((prev: EventItem[]) => EventItem[])) => void;
  setDepartments: (v: Dept[] | ((prev: Dept[]) => Dept[])) => void;
  setApprovals: (v: Approval[] | ((prev: Approval[]) => Approval[])) => void;
  setActivityLog: (v: ActivityLogItem[] | ((prev: ActivityLogItem[]) => ActivityLogItem[])) => void;
  /** Church-wide published count from analytics (list fetch is capped). */
  setPublishedAnnouncementTotal: (v: number | null) => void;
  /** All announcements total from GET /analytics/dashboard/admin/ (fallback: announcements stats `total`). */
  setAnnouncementsTotalFromApi: (v: number | null) => void;
}

export interface UseDashboardApiSyncResult {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches all dashboard data from API and populates context setters.
 */
export function useDashboardApiSync(
  options: UseDashboardApiSyncOptions
): UseDashboardApiSyncResult {
  const {
    setMembers,
    setTransactions,
    setAnnouncements,
    setEvents,
    setDepartments,
    setApprovals,
    setActivityLog,
    setPublishedAnnouncementTotal,
    setAnnouncementsTotalFromApi,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSync = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        membersRes,
        incomeRes,
        expenseRes,
        announcementsRes,
        departmentsRes,
        expenseRequestsRes,
        activityRes,
        upcomingRes,
        announcementStatsRes,
        publishedAnnouncementsTotalRes,
        dashboardAdminRes,
      ] = await Promise.all([
        dashboardApi.getMembersList(100),
        dashboardApi.getIncomeTransactions(100),
        dashboardApi.getExpenseTransactions(100),
        dashboardApi.getAnnouncementsList(100),
        dashboardApi.getDepartmentsList(100),
        dashboardApi.getExpenseRequests(50),
        dashboardApi.getActivityFeed(30),
        dashboardApi.getUpcomingActivities(),
        dashboardApi.getAnnouncementStats(),
        dashboardApi.getAnnouncementsPublishedTotal(),
        dashboardApi.getDashboardAdmin(),
      ]);

      setMembers(membersRes.map(mappers.mapBackendMember));

      const incomeTxns = incomeRes.map(mappers.mapBackendIncomeTransaction);
      const expenseTxns = expenseRes.map(mappers.mapBackendExpenseTransaction);
      setTransactions([...incomeTxns, ...expenseTxns].sort((a, b) => b.date.localeCompare(a.date)));

      const mappedAnnouncements = announcementsRes.map(mappers.mapBackendAnnouncement);
      setAnnouncements(mappedAnnouncements);
      const publishedInList = mappedAnnouncements.filter((a) => a.status === 'Published').length;
      setPublishedAnnouncementTotal(
        mappers.resolvePublishedAnnouncementTotal(
          announcementStatsRes,
          publishedAnnouncementsTotalRes,
          publishedInList
        )
      );

      const coerceCount = (v: unknown): number | null => {
        if (v === null || v === undefined) {
          return null;
        }
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isNaN(n) ? null : n;
      };
      const totalFromAdmin = dashboardAdminRes
        ? coerceCount(dashboardAdminRes.announcements_total)
        : null;
      const totalFromAnnouncementStats = announcementStatsRes
        ? coerceCount(announcementStatsRes.total)
        : null;
      setAnnouncementsTotalFromApi(totalFromAdmin ?? totalFromAnnouncementStats ?? null);

      setDepartments(departmentsRes.map(mappers.mapBackendDepartment));

      const pendingRequests = expenseRequestsRes.filter((r) =>
        [
          'SUBMITTED',
          'DEPT_HEAD_APPROVED',
          'FIRST_ELDER_APPROVED',
          'TREASURER_APPROVED',
          'APPROVED',
        ].includes((r.status || '').toUpperCase())
      );
      setApprovals(pendingRequests.map(mappers.mapBackendExpenseRequestToApproval));

      setActivityLog(activityRes.map(mappers.mapBackendActivityToLogItem));

      setEvents(upcomingRes.map(mappers.mapBackendActivityToEvent));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    setMembers,
    setTransactions,
    setAnnouncements,
    setEvents,
    setDepartments,
    setApprovals,
    setActivityLog,
    setPublishedAnnouncementTotal,
    setAnnouncementsTotalFromApi,
  ]);

  useEffect(() => {
    if (getAccessToken()) {
      fetchAndSync();
    }
  }, [fetchAndSync]);

  return { isLoading, error, refetch: fetchAndSync };
}
