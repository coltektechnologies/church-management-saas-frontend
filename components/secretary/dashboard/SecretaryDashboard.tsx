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

// Lazy-load recharts to prevent Turbopack chunk load failure
const MembershipGrowthChart = dynamic(
  () => import('./MembershipGrowthChart').then((m) => ({ default: m.MembershipGrowthChart })),
  { ssr: false, loading: () => <div className="h-[300px] rounded-2xl bg-muted/20 animate-pulse" /> }
);

// ── Derive a one-line summary from the raw activity log ───────────────────────
function useActivitySummary(): string {
  const { activities, pending } = useAppData();

  // useState's initializer function runs exactly once at mount and never again
  // on re-render. This is the only pattern that satisfies react-hooks/purity,
  // which forbids Date.now() in render scope, useMemo, or useRef() calls.
  const [mountedAt] = useState<number>(() => Date.now());

  return useMemo(() => {
    if (!activities.length && !pending.length) {
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

    if (pending.length > 0) {
      parts.push(`${pending.length} pending approval${pending.length > 1 ? 's' : ''}`);
    }

    // Most active category this week
    const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (topEntry) {
      const [tab, n] = topEntry;
      parts.push(`${n} ${tab} update${n > 1 ? 's' : ''} this week`);
    }

    if (parts.length === 0) {
      return 'No activity recorded yet — things are quiet.';
    }

    // Capitalise first letter
    const summary = parts.join(' · ');
    return summary.charAt(0).toUpperCase() + summary.slice(1) + '.';
  }, [activities, pending, mountedAt]);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SecretaryDashboard() {
  const { profile, isReady } = useSecretaryProfile();
  const activitySummary = useActivitySummary();

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
