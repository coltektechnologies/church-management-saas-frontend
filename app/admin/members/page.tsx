'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Users, UserCheck, UserX, UserPlus } from 'lucide-react';
import StatsCard from '@/components/admin/membership/StatsCard';
import MonthlyTrendChart from '@/components/admin/membership/MonthlyTrendChart';
import TithingOfferingsChart from '@/components/admin/membership/TithingOfferingsChart';
import MemberFilters from '@/components/admin/membership/MemberFilters';
import MembersTable from '@/components/admin/membership/MembersTable';
import { useMembersPortal } from '@/components/admin/membership/MembersPortalContext';
import { getMemberStats, getTitheOfferingStats } from '@/lib/api';
import { DEFAULT_MEMBER_FILTERS, type MemberFilterState } from '@/lib/memberFilters';

function formatChange(pct: number): string {
  if (pct > 0) {
    return `+${pct}%`;
  }
  if (pct < 0) {
    return `${pct}%`;
  }
  return '0%';
}

export default function MembershipDashboardPage() {
  const { appHomeHref, appHomeLabel } = useMembersPortal();
  const [stats, setStats] = useState({
    total_members: 0,
    total_change_percent: 0,
    active_members: 0,
    active_change_percent: 0,
    inactive_members: 0,
    inactive_change_percent: 0,
    new_members_this_month: 0,
    new_members_change_percent: 0,
  });

  const [titheStats, setTitheStats] = useState({
    monthly_trend: [] as { month: string; tithe: number; offering: number }[],
    this_month: {
      tithe_total: '0',
      offering_total: '0',
      tithe_by_week: [] as { name: string; value: number }[],
      offering_by_week: [] as { name: string; value: number }[],
    },
  });

  const [filters, setFilters] = useState<MemberFilterState>(DEFAULT_MEMBER_FILTERS);

  useEffect(() => {
    getMemberStats().then(setStats);
    getTitheOfferingStats(9).then(setTitheStats);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto min-w-0 space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <h1
          style={{
            fontFamily: 'OV Soge, sans-serif',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '100%',
            letterSpacing: 0,
            color: '#000000',
          }}
        >
          Membership Dashboard
        </h1>
        <nav
          className="flex items-center gap-2 mt-2"
          style={{
            fontFamily: 'OV Soge, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '100%',
            letterSpacing: 0,
            color: '#666666',
          }}
        >
          <Link href={appHomeHref} className="flex items-center gap-1 hover:opacity-80">
            <Home className="h-4 w-4" />
            {appHomeLabel}
          </Link>
          <span>&gt;</span>
          <span>Dashboard</span>
        </nav>
      </div>

      {/* Stats Cards — same line as charts/search/table: start at left, New This Month ends at right */}
      <div className="flex flex-wrap gap-3 w-full lg:flex-nowrap lg:justify-between">
        <StatsCard
          icon={<Users className="h-6 w-6" />}
          value={stats.total_members.toLocaleString()}
          label="Total Members"
          change={formatChange(stats.total_change_percent)}
          changePositive={stats.total_change_percent >= 0}
          borderTopColor="#0B2A4A"
        />
        <StatsCard
          icon={<UserCheck className="h-6 w-6" />}
          value={stats.active_members.toLocaleString()}
          label="Active Members"
          change={formatChange(stats.active_change_percent)}
          changePositive={stats.active_change_percent >= 0}
          borderTopColor="#105BA9"
        />
        <StatsCard
          icon={<UserX className="h-6 w-6" />}
          value={stats.inactive_members.toLocaleString()}
          label="Inactive"
          change={formatChange(stats.inactive_change_percent)}
          changePositive={stats.inactive_change_percent >= 0}
          iconColor="gray"
          borderTopColor="#C4CBD2"
        />
        <StatsCard
          icon={<UserPlus className="h-6 w-6" />}
          value={stats.new_members_this_month.toLocaleString()}
          label="New This Month"
          change={formatChange(stats.new_members_change_percent)}
          changePositive={stats.new_members_change_percent >= 0}
          borderTopColor="#1387FF"
        />
      </div>

      {/* Charts — full width row, same line as stats cards; wrap on small screens */}
      <div className="flex flex-wrap gap-4 w-full min-w-0">
        <div className="flex-1 min-w-[280px] min-h-[281px]">
          <MonthlyTrendChart data={titheStats.monthly_trend} />
        </div>
        <div className="flex-1 min-w-[280px] min-h-[281px]">
          <TithingOfferingsChart
            titheTotal={titheStats.this_month.tithe_total}
            offeringTotal={titheStats.this_month.offering_total}
            titheByWeek={titheStats.this_month.tithe_by_week}
            offeringByWeek={titheStats.this_month.offering_by_week}
          />
        </div>
      </div>

      {/* Filters */}
      <MemberFilters filters={filters} onFiltersChange={setFilters} />

      {/* Members Table */}
      <MembersTable filters={filters} />
    </div>
  );
}
