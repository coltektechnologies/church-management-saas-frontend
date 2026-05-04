'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users2,
  CircleDollarSign,
  Megaphone,
  PersonStanding,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import StatCard from '@/components/admin/dashboard/StatCard';
import MembershipGrowthChart from '@/components/admin/dashboard/MembershipGrowthChart';
import IncomeExpenseChart from '@/components/admin/dashboard/IncomeExpenseChart';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import UpcomingEvents from '@/components/admin/dashboard/UpcomingEvents';
import PendingApprovals from '@/components/admin/dashboard/PendingApprovals';
import DashboardCalendar from '@/components/admin/dashboard/DashboardCalendar';
import LatestEvents from '@/components/admin/dashboard/LatestEvents';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import DashboardDateRangePicker from '@/components/admin/dashboard/DashboardDateRangePicker';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useChurchProfile();
  const {
    totalMembers,
    newMembersThisWeek,
    totalIncome,
    publishedAnnouncements,
    pendingAnnouncements,
    averageAttendance,
    apiLoading,
    apiError,
    refetchDashboard,
  } = useAppData();

  const mounted = useIsMounted();

  // All values that read from localStorage must be gated behind mounted.
  // Server and client must agree on the initial render — use safe static
  // fallbacks on the server, real values only after hydration.
  const dark = mounted ? (profile.darkMode ?? false) : false;
  const adminName = mounted ? profile.adminName || 'Admin' : 'Admin';

  const featuredCardStyle: React.CSSProperties = {
    backgroundColor: dark ? '#112240' : '#FDFEFE',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : 'none',
    boxShadow: dark ? '0px 1px 6px 0px rgba(0,0,0,0.4)' : '0px 1px 4px 0px #2FC4B2',
    borderRadius: '5px',
    overflow: 'hidden',
  };

  const summaryLead = "Here's what's happening with your church today.";
  const summaryBody = (() => {
    const p = pendingAnnouncements;
    const n = newMembersThisWeek;
    if (p > 0 && n > 0) {
      return ` You have ${p} pending announcement${p === 1 ? '' : 's'} and ${n} new member${n === 1 ? '' : 's'} this week.`;
    }
    if (p > 0) {
      return ` You have ${p} pending announcement${p === 1 ? '' : 's'}.`;
    }
    if (n > 0) {
      return ` You have ${n} new member${n === 1 ? '' : 's'} this week.`;
    }
    return " You're all caught up—no pending announcements and no new members this week.";
  })();

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-5">
      {/* API Error banner */}
      {apiError && (
        <div
          className="flex items-center justify-between gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
          role="alert"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 truncate">
              {apiError}
            </p>
          </div>
          <button
            onClick={() => refetchDashboard()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 transition-colors shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Loading overlay (subtle) */}
      {apiLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading dashboard data…</span>
        </div>
      )}

      {/* Welcome row — light layout aligned with /admin reference (no gradient hero) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <h1 className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-[#0B2A4A] dark:text-white shrink-0">
          Welcome back, {adminName}! 👋
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 lg:max-w-xl lg:text-right">
          {summaryLead}
          {summaryBody}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 -mt-1">
        <DashboardDateRangePicker />
        <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline tabular-nums">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Stat Cards — reference: white tiles, title | icon, divider, value, Last month | View detail */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Members"
          value={totalMembers.toLocaleString()}
          subtitle="Last month"
          icon={Users2}
          empty={totalMembers === 0}
          onViewDetail={() => router.push('/admin/members')}
        />
        <StatCard
          title="Monthly Income"
          value={`GHS${totalIncome.toLocaleString()}`}
          subtitle="Last month"
          icon={CircleDollarSign}
          empty={totalIncome === 0}
          onViewDetail={() => router.push('/admin/treasury')}
        />
        <StatCard
          title="Announcements"
          value={publishedAnnouncements.toLocaleString()}
          subtitle="Last month"
          icon={Megaphone}
          empty={publishedAnnouncements === 0}
          onViewDetail={() => router.push('/admin/announcements')}
        />
        <StatCard
          title="Attendance"
          value={averageAttendance.toLocaleString()}
          subtitle="Last month"
          icon={PersonStanding}
          empty={averageAttendance === 0}
          onViewDetail={() => router.push('/admin/members')}
        />
      </div>

      {/* Main chart + feed grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div style={{ ...featuredCardStyle, height: '331px' }}>
            <MembershipGrowthChart />
          </div>
          <div style={{ ...featuredCardStyle, height: '455px' }}>
            <IncomeExpenseChart />
          </div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div style={{ ...featuredCardStyle, height: '404px' }}>
            <ActivityFeed />
          </div>
          <div style={{ ...featuredCardStyle, height: '369px' }}>
            <UpcomingEvents />
          </div>
        </div>
      </div>

      {/* Bottom sections */}
      <QuickActions />
      <PendingApprovals />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardCalendar />
        <LatestEvents />
      </div>
    </div>
  );
}
