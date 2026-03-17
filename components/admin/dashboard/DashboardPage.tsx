'use client';

import { useRouter } from 'next/navigation';
import { Users, Banknote, Megaphone, ClipboardList } from 'lucide-react';

import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';

import StatCard from '@/components/admin/dashboard/StatCard';
import MembershipGrowthChart from '@/components/admin/dashboard/MembershipGrowthChart';
import IncomeExpenseChart from '@/components/admin/dashboard/IncomeExpenseChart';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import UpcomingEvents from '@/components/admin/dashboard/UpcomingEvents';
import PendingApprovals from '@/components/admin/dashboard/PendingApprovals';
import DashboardCalendar from '@/components/admin/dashboard/DashboardCalendar';
import LatestEvents from '@/components/admin/dashboard/LatestEvents';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import MockDataToggle from '@/components/admin/mock/MockDataToggle';
import DashboardDateRangePicker from '@/components/admin/dashboard/DashboardDateRangePicker';

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

  const adminName = profile.adminName || 'Admin';
  const pc = profile.primaryColor || '#0B2A4A';

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* ── Welcome banner ── */}
      <div
        className="rounded-xl p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${pc}ee 0%, ${pc}99 100%)` }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10 bg-white" />

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold">
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
                <>
                  <button
                    onClick={() => router.push('/admin/members')}
                    className="underline font-semibold hover:text-white transition-colors"
                  >
                    {newMembersThisWeek} new member{newMembersThisWeek > 1 ? 's' : ''} this week
                  </button>
                </>
              )}
              {pendingAnnouncements === 0 && newMembersThisWeek === 0 && (
                <span>Welcome back to {profile.churchName || 'your church dashboard'}.</span>
              )}
            </p>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <MockDataToggle />
            <DashboardDateRangePicker />
            {/* Live date chip */}
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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Members"
          value={totalMembers > 0 ? totalMembers.toLocaleString() : '—'}
          subtitle={
            totalMembers > 0
              ? `${activeMembers} active · ${newMembersThisWeek} new this week`
              : 'No members yet'
          }
          icon={Users}
          iconBgClass="bg-accent"
          empty={totalMembers === 0}
          onViewDetail={() => router.push('/admin/members')}
        />
        <StatCard
          title="Monthly Income"
          value={totalIncome > 0 ? `₵${totalIncome.toLocaleString()}` : '—'}
          subtitle={totalIncome > 0 ? 'Filtered by date range' : 'No transactions yet'}
          icon={Banknote}
          iconBgClass="bg-accent"
          empty={totalIncome === 0}
          onViewDetail={() => router.push('/admin/treasury')}
        />
        <StatCard
          title="Announcements"
          value={
            publishedAnnouncements > 0 || pendingAnnouncements > 0
              ? `${publishedAnnouncements + pendingAnnouncements}`
              : '—'
          }
          subtitle={
            publishedAnnouncements > 0 || pendingAnnouncements > 0
              ? `${publishedAnnouncements} published · ${pendingAnnouncements} draft`
              : 'No announcements yet'
          }
          icon={Megaphone}
          iconBgClass="bg-accent"
          empty={publishedAnnouncements === 0 && pendingAnnouncements === 0}
          onViewDetail={() => router.push('/admin/announcements')}
        />
        <StatCard
          title="Attendance"
          value={averageAttendance > 0 ? `${averageAttendance}%` : '—'}
          subtitle={averageAttendance > 0 ? 'Average across members' : 'No attendance data yet'}
          icon={ClipboardList}
          iconBgClass="bg-accent"
          empty={averageAttendance === 0}
          onViewDetail={() => router.push('/admin/members')}
        />
      </div>

      {/* ── ROW 1: Membership Growth + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <MembershipGrowthChart />
        </div>
        <div className="lg:col-span-1 min-h-[320px] flex flex-col">
          <ActivityFeed />
        </div>
      </div>

      {/* ── ROW 2: Income/Expense Chart + Upcoming Events ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <IncomeExpenseChart />
        </div>
        <div className="lg:col-span-1 min-h-[320px] flex flex-col">
          <UpcomingEvents />
        </div>
      </div>

      {/* ── ROW 3: Quick Actions ── */}
      <QuickActions />

      {/* ── ROW 4: Pending Approvals ── */}
      <PendingApprovals />

      {/* ── ROW 5: Calendar + Latest Events ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <DashboardCalendar />
        <LatestEvents />
      </div>
    </div>
  );
}
