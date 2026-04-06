'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { KpiCards } from './KpiCards';
import { ActivityFeed } from './ActivityFeed';
import { UpcomingEvents } from './UpcomingEvents';
import { QuickActions } from './QuickActions';
import { PendingApprovals } from './PendingApprovals';
import { CalendarSection } from './CalendarSection';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';
import { useAppData } from '@/components/secretary/contexts/AppDataContext';
import {
  useSecretaryDashboardApi,
  type SecretaryDashboardApiContextValue,
} from '@/components/secretary/contexts/SecretaryDashboardApiContext';

// Lazy-load recharts to prevent Turbopack chunk load failure
const MembershipGrowthChart = dynamic(
  () => import('./MembershipGrowthChart').then((m) => ({ default: m.MembershipGrowthChart })),
  { ssr: false, loading: () => <div className="h-[300px] rounded-2xl bg-muted/20 animate-pulse" /> }
);

// ── Derive a one-line summary from API + local activity (local pending is unused; KPIs use API) ──
function useActivitySummary(dash: SecretaryDashboardApiContextValue): string {
  const { activities, pending } = useAppData();
  const { kpiPendingApprovals, activityFeed, status } = dash;

  // useState's initializer function runs exactly once at mount and never again
  // on re-render. This is the only pattern that satisfies react-hooks/purity,
  // which forbids Date.now() in render scope, useMemo, or useRef() calls.
  const [mountedAt] = useState<number>(() => Date.now());

  return useMemo(() => {
    const pendingN = typeof kpiPendingApprovals === 'number' ? kpiPendingApprovals : pending.length;

    if (status === 'ready' && !activities.length && pendingN === 0 && activityFeed.length === 0) {
      return "Everything's up to date — no recent audit entries.";
    }

    if (!activities.length && pendingN === 0 && activityFeed.length === 0) {
      return "Everything's up to date — no recent activity.";
    }

    const todayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * todayMs;

    // Activities in the last 7 days
    const recent = activities.filter((a) => {
      const ts = new Date(a.timestamp).getTime();
      return !isNaN(ts) && mountedAt - ts <= weekMs;
    });

    // Count by tab/entity type
    const counts: Record<string, number> = {};
    for (const a of recent) {
      const key = a.tab || 'item';
      counts[key] = (counts[key] ?? 0) + 1;
    }

    // Today's slice
    const todayCount = activities.filter((a) => {
      const ts = new Date(a.timestamp).getTime();
      return !isNaN(ts) && mountedAt - ts <= todayMs;
    }).length;

    // Build readable parts
    const parts: string[] = [];

    if (todayCount > 0) {
      parts.push(`${todayCount} action${todayCount > 1 ? 's' : ''} today`);
    }

    if (pendingN > 0) {
      parts.push(`${pendingN} pending approval${pendingN > 1 ? 's' : ''}`);
    }

    // Most active category this week
    const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (topEntry) {
      const [tab, n] = topEntry;
      parts.push(`${n} ${tab} update${n > 1 ? 's' : ''} this week`);
    }

    if (parts.length === 0 && activityFeed.length > 0) {
      return `${activityFeed.length} recent audit event${activityFeed.length > 1 ? 's' : ''} — see feed.`;
    }

    if (parts.length === 0) {
      return 'No activity recorded yet — things are quiet.';
    }

    // Capitalise first letter
    const summary = parts.join(' · ');
    return summary.charAt(0).toUpperCase() + summary.slice(1) + '.';
  }, [activities, pending, mountedAt, kpiPendingApprovals, activityFeed, status]);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SecretaryDashboard() {
  const dash = useSecretaryDashboardApi();
  const { profile, isReady } = useSecretaryProfile();
  const activitySummary = useActivitySummary(dash);
  const { loadErrors, refetch, status } = dash;

  const firstName = isReady
    ? profile.preferredName?.trim() ||
      profile.adminName?.split(' ').filter(Boolean).pop() ||
      'there'
    : 'there';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Welcome, {firstName}! 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">{activitySummary}</p>
        {loadErrors.length > 0 ? (
          <div
            role="status"
            className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800/60 px-3 py-2 text-xs text-amber-900 dark:text-amber-100/90"
          >
            <p className="font-medium">Some dashboard data could not be loaded</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 opacity-90">
              {loadErrors.slice(0, 4).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            {loadErrors.length > 4 ? (
              <p className="mt-1 opacity-80">
                + {loadErrors.length - 4} more (check network / permissions)
              </p>
            ) : null}
            <button
              type="button"
              className="mt-2 text-[11px] font-medium underline underline-offset-2 hover:opacity-80"
              disabled={status === 'loading'}
              onClick={() => void refetch()}
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>

      {/* KPI summary */}
      <KpiCards />

      {/* Chart + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MembershipGrowthChart />
        </div>
        <ActivityFeed />
      </div>

      {/* Upcoming events */}
      <UpcomingEvents />

      {/* Quick actions */}
      <QuickActions />

      {/* Pending approvals */}
      <PendingApprovals />

      {/* Full calendar */}
      <CalendarSection />
    </div>
  );
}
