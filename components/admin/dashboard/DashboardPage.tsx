'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Users2, CircleDollarSign, Megaphone, PersonStanding } from 'lucide-react';

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
    activeMembers,
  } = useAppData();

  const mounted = useIsMounted();

  // All values that read from localStorage must be gated behind mounted.
  // Server and client must agree on the initial render — use safe static
  // fallbacks on the server, real values only after hydration.
  const dark = mounted ? (profile.darkMode ?? false) : false;
  const adminName = mounted ? profile.adminName || 'Admin' : 'Admin';
  const pc = mounted ? profile.primaryColor || '#0B2A4A' : '#0B2A4A';
  const churchName = mounted ? profile.churchName || '' : '';

  const featuredCardStyle: React.CSSProperties = {
    backgroundColor: dark ? '#112240' : '#FDFEFE',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : 'none',
    boxShadow: dark ? '0px 1px 6px 0px rgba(0,0,0,0.4)' : '0px 1px 4px 0px #2FC4B2',
    borderRadius: '5px',
    overflow: 'hidden',
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-5">
      {/* Welcome banner */}
      <div
        className="p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${pc}ee 0%, ${pc}99 100%)`,
          borderRadius: '5px',
        }}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10 bg-white" />

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1
              className="text-base sm:text-lg lg:text-xl"
              style={{ fontFamily: 'OV Soge, sans-serif', fontWeight: 600 }}
            >
              {greeting}, {adminName} 👋
            </h1>

            <p className="text-white/80 text-[11px] sm:text-xs mt-1 leading-relaxed">
              {pendingAnnouncements > 0 && (
                <>
                  You have{' '}
                  <button
                    onClick={() => router.push('/admin/announcements')}
                    className="underline font-semibold hover:text-white transition-colors"
                  >
                    {pendingAnnouncements} pending announcement{pendingAnnouncements > 1 ? 's' : ''}
                  </button>
                  {newMembersThisWeek > 0 && ' and '}
                </>
              )}
              {newMembersThisWeek > 0 && (
                <button
                  onClick={() => router.push('/admin/members')}
                  className="underline font-semibold hover:text-white transition-colors"
                >
                  {newMembersThisWeek} new member{newMembersThisWeek > 1 ? 's' : ''} this week
                </button>
              )}
              {pendingAnnouncements === 0 && newMembersThisWeek === 0 && (
                <span>Welcome back to {churchName || 'your church dashboard'}.</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DashboardDateRangePicker />
            <span className="text-[10px] bg-white/20 rounded-full px-3 py-1.5 font-medium hidden sm:inline-block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Members"
          value={totalMembers > 0 ? totalMembers.toLocaleString() : '—'}
          subtitle={totalMembers > 0 ? `${activeMembers} active` : 'No members yet'}
          icon={Users2}
          empty={totalMembers === 0}
          onViewDetail={() => router.push('/admin/members')}
        />
        <StatCard
          title="Monthly Income"
          value={totalIncome > 0 ? `₵${totalIncome.toLocaleString()}` : '—'}
          subtitle={totalIncome > 0 ? 'Filtered by date' : 'No transactions yet'}
          icon={CircleDollarSign}
          empty={totalIncome === 0}
          onViewDetail={() => router.push('/admin/treasury')}
        />
        <StatCard
          title="Announcements"
          value={publishedAnnouncements > 0 ? `${publishedAnnouncements}` : '—'}
          subtitle="Published"
          icon={Megaphone}
          empty={publishedAnnouncements === 0}
          onViewDetail={() => router.push('/admin/announcements')}
        />
        <StatCard
          title="Attendance"
          value={averageAttendance > 0 ? `${averageAttendance}%` : '—'}
          subtitle="Average"
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
