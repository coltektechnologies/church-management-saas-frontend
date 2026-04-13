'use client';

/**
 * Secretary home (/secretary) — server data integration
 * ================================================
 *
 * Purpose
 * -------
 * The secretary dashboard UI was originally driven by localStorage + static KPIs.
 * This provider loads church-scoped analytics and approval previews from the Django API
 * (same patterns as `lib/dashboardApi.ts` and `components/admin/approvals/ApprovalCenter.tsx`).
 *
 * Endpoints used (all require Bearer token + user.church on backend)
 * -----------------------------------------------------------------
 * - GET /api/analytics/dashboard/secretariat/     → counts (announcements, programs pending secretariat)
 * - GET /api/analytics/members/stats/            → total_members, new_members_this_month, etc.
 * - GET /api/members/members/                    → full member list (backend returns array) to bucket
 *   `created_at` by month for the growth chart. NOTE: large churches may need a dedicated
 *   analytics endpoint later (e.g. registrations-by-month) to avoid heavy payloads.
 * - GET /api/activity/?page_size=N               → audit trail preview for Activity feed
 * - GET /api/announcements/?status=PENDING_REVIEW → aligns with ApprovalCenter secretary queue
 * - GET /api/programs/?status=ELDER_APPROVED      → secretariat program queue (same as ApprovalCenter)
 * - GET /api/notifications/notifications/unread_count/ → KPI “unread” (in-app notifications, not SMS)
 *
 * Failure handling
 * ----------------
 * Uses Promise.allSettled; partial data still renders. `loadErrors` lists human-readable failures
 * for debugging or a future toast. KPI cards show em dashes when a slice is missing.
 *
 * Extending
 * ---------
 * - Add refresh: call `refetch()` after approval actions on this page if you add inline actions.
 * - For communications KPI: replace/augment unread_count when a real messaging inbox API exists.
 * - Wire `ChurchProfileProvider` user display into `SecretaryProfileContext` separately if desired.
 *
 * @module components/secretary/contexts/SecretaryDashboardApiContext
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getDashboardSecretariat,
  getDashboardMemberStats,
  getActivityFeed,
  getMembersList,
  type ActivityFeedItem,
  type BackendMember,
  type DashboardSecretariatResponse,
  type MemberStatsResponse,
} from '@/lib/dashboardApi';
import { fetchAnnouncementsList, type AnnouncementListItemApi } from '@/lib/announcementsApi';
import { fetchProgramsByStatus, type ProgramListItem } from '@/lib/departmentsApi';
import { fetchUnreadNotificationCountApi } from '@/lib/notificationsApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SecretaryDashboardLoadStatus = 'idle' | 'loading' | 'ready';

/** One month bucket derived from Member.created_at (ISO) */
export interface MemberRegistrationMonthBucket {
  /** `YYYY-MM` for range filtering in charts */
  period: string;
  /** New member records whose created_at falls in this month */
  count: number;
}

export interface SecretaryPendingPreviewItem {
  id: string;
  kind: 'announcement' | 'program';
  title: string;
  subtitle: string;
}

export interface SecretaryDashboardApiContextValue {
  status: SecretaryDashboardLoadStatus;
  /** Non-fatal load problems (one string per failed slice) */
  loadErrors: string[];
  refetch: () => void;
  lastFetchedAt: string | null;

  secretariat: DashboardSecretariatResponse | null;
  memberStats: MemberStatsResponse | null;

  /** Unread in-app notifications; 0 if endpoint failed or none */
  unreadNotificationCount: number;

  /** Raw audit events (newest first expected from API) */
  activityFeed: ActivityFeedItem[];

  pendingAnnouncements: AnnouncementListItemApi[];
  pendingPrograms: ProgramListItem[];

  /** Monthly new-member counts from full member list */
  memberRegistrationBuckets: MemberRegistrationMonthBucket[];

  /** KPI helpers (null = unknown after load) */
  kpiTotalMembers: number | null;
  kpiAnnouncementsTotal: number | null;
  /** Secretariat queue size: pending announcement reviews + programs awaiting secretariat */
  kpiPendingApprovals: number | null;
}

const SecretaryDashboardApiContext = createContext<SecretaryDashboardApiContextValue | null>(null);

function bucketMembersByCreatedMonth(members: BackendMember[]): MemberRegistrationMonthBucket[] {
  const map = new Map<string, number>();
  for (const m of members) {
    const raw = m.created_at;
    if (!raw || typeof raw !== 'string') {
      continue;
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      continue;
    }
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({ period, count }));
}

async function safeAnnouncementsPending(): Promise<AnnouncementListItemApi[]> {
  try {
    const rows = await fetchAnnouncementsList({ status: 'PENDING_REVIEW', page_size: 100 });
    return rows.filter((a) => a.status === 'PENDING_REVIEW');
  } catch {
    return [];
  }
}

async function safeProgramsSecretariatQueue(): Promise<ProgramListItem[]> {
  try {
    const rows = await fetchProgramsByStatus('ELDER_APPROVED');
    return rows.filter((p) => String(p.status) === 'ELDER_APPROVED');
  } catch {
    return [];
  }
}

async function safeUnreadCount(): Promise<number> {
  try {
    const { unread_count } = await fetchUnreadNotificationCountApi();
    return typeof unread_count === 'number' ? unread_count : 0;
  } catch {
    return 0;
  }
}

export function SecretaryDashboardApiProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SecretaryDashboardLoadStatus>('idle');
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const [secretariat, setSecretariat] = useState<DashboardSecretariatResponse | null>(null);
  const [memberStats, setMemberStats] = useState<MemberStatsResponse | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState<AnnouncementListItemApi[]>([]);
  const [pendingPrograms, setPendingPrograms] = useState<ProgramListItem[]>([]);
  const [memberRegistrationBuckets, setMemberRegistrationBuckets] = useState<
    MemberRegistrationMonthBucket[]
  >([]);

  const runLoad = useCallback(async () => {
    setStatus('loading');
    setLoadErrors([]);

    const errors: string[] = [];
    const settled = await Promise.allSettled([
      getDashboardSecretariat(),
      getDashboardMemberStats(),
      getActivityFeed(30),
      getMembersList(500),
      safeAnnouncementsPending(),
      safeProgramsSecretariatQueue(),
      safeUnreadCount(),
    ]);

    const [secR, statsR, actR, memR, annR, progR, unreadR] = settled;

    if (secR.status === 'fulfilled') {
      setSecretariat(secR.value);
      if (!secR.value) {
        errors.push('Secretariat dashboard: no data (check auth or church context).');
      }
    } else {
      setSecretariat(null);
      errors.push(
        `Secretariat dashboard: ${secR.reason instanceof Error ? secR.reason.message : 'request failed'}`
      );
    }

    if (statsR.status === 'fulfilled') {
      setMemberStats(statsR.value);
      if (!statsR.value) {
        errors.push('Member stats: no data (check auth or church context).');
      }
    } else {
      setMemberStats(null);
      errors.push(
        `Member stats: ${statsR.reason instanceof Error ? statsR.reason.message : 'request failed'}`
      );
    }

    if (actR.status === 'fulfilled') {
      setActivityFeed(actR.value);
    } else {
      setActivityFeed([]);
      errors.push(
        `Activity feed: ${actR.reason instanceof Error ? actR.reason.message : 'request failed'}`
      );
    }

    if (memR.status === 'fulfilled') {
      setMemberRegistrationBuckets(bucketMembersByCreatedMonth(memR.value));
    } else {
      setMemberRegistrationBuckets([]);
      errors.push(
        `Members list (growth chart): ${memR.reason instanceof Error ? memR.reason.message : 'request failed'}`
      );
    }

    if (annR.status === 'fulfilled') {
      setPendingAnnouncements(annR.value);
    } else {
      setPendingAnnouncements([]);
      errors.push(
        `Pending announcements: ${annR.reason instanceof Error ? annR.reason.message : 'request failed'}`
      );
    }

    if (progR.status === 'fulfilled') {
      setPendingPrograms(progR.value);
    } else {
      setPendingPrograms([]);
      errors.push(
        `Pending programs: ${progR.reason instanceof Error ? progR.reason.message : 'request failed'}`
      );
    }

    if (unreadR.status === 'fulfilled') {
      setUnreadNotificationCount(unreadR.value);
    } else {
      setUnreadNotificationCount(0);
      errors.push(
        `Unread notifications: ${unreadR.reason instanceof Error ? unreadR.reason.message : 'request failed'}`
      );
    }

    setLoadErrors(errors);
    setLastFetchedAt(new Date().toISOString());
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void runLoad();
    });
  }, [runLoad]);

  const value = useMemo((): SecretaryDashboardApiContextValue => {
    const kpiTotalMembers = memberStats?.total_members ?? null;
    const kpiAnnouncementsTotal = secretariat?.announcements.total ?? null;

    const listPendingSum = pendingAnnouncements.length + pendingPrograms.length;
    const kpiPendingApprovals =
      secretariat !== null
        ? secretariat.announcements.pending_review + secretariat.programs_pending_secretariat
        : status === 'ready'
          ? listPendingSum
          : null;

    return {
      status,
      loadErrors,
      refetch: runLoad,
      lastFetchedAt,
      secretariat,
      memberStats,
      unreadNotificationCount,
      activityFeed,
      pendingAnnouncements,
      pendingPrograms,
      memberRegistrationBuckets,
      kpiTotalMembers,
      kpiAnnouncementsTotal,
      kpiPendingApprovals,
    };
  }, [
    status,
    loadErrors,
    runLoad,
    lastFetchedAt,
    secretariat,
    memberStats,
    unreadNotificationCount,
    activityFeed,
    pendingAnnouncements,
    pendingPrograms,
    memberRegistrationBuckets,
  ]);

  return (
    <SecretaryDashboardApiContext.Provider value={value}>
      {children}
    </SecretaryDashboardApiContext.Provider>
  );
}

export function useSecretaryDashboardApi(): SecretaryDashboardApiContextValue {
  const ctx = useContext(SecretaryDashboardApiContext);
  if (!ctx) {
    throw new Error('useSecretaryDashboardApi must be used within <SecretaryDashboardApiProvider>');
  }
  return ctx;
}

/** For components shared outside the dashboard provider (optional server data). */
export function useOptionalSecretaryDashboardApi(): SecretaryDashboardApiContextValue | null {
  return useContext(SecretaryDashboardApiContext);
}

export function buildPendingPreviewItems(
  announcements: AnnouncementListItemApi[],
  programs: ProgramListItem[],
  limit = 6
): SecretaryPendingPreviewItem[] {
  const ann = announcements.map<SecretaryPendingPreviewItem>((a) => ({
    id: `ann-${a.id}`,
    kind: 'announcement',
    title: a.title || 'Announcement',
    subtitle: 'Pending review',
  }));
  const prog = programs.map<SecretaryPendingPreviewItem>((p) => ({
    id: `prog-${p.id}`,
    kind: 'program',
    title: p.title || 'Program proposal',
    subtitle: p.department_name || p.department || 'Department',
  }));
  return [...ann, ...prog].slice(0, limit);
}
