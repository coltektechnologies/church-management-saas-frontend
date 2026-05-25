import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  setPublishedAnnouncementTotal: (v: number | null) => void;
  setAnnouncementsTotalFromApi: (v: number | null) => void;
}

export interface UseDashboardApiSyncResult {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const DASHBOARD_QUERY_KEY = ['dashboard', 'full'] as const;

async function fetchAllDashboardData() {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

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

  return {
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
  };
}

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

  const {
    isLoading,
    error,
    refetch: queryRefetch,
    data,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchAllDashboardData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: typeof window !== 'undefined' && !!getAccessToken(),
    retry: 1,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const {
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
    } = data;

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
  }, [
    data,
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

  return {
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refetch: async () => {
      await queryRefetch();
    },
  };
}
