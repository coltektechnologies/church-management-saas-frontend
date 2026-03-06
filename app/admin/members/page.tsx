'use client';

import Link from 'next/link';
import { Home, Users, UserCheck, UserX, UserPlus } from 'lucide-react';
import StatsCard from '@/components/admin/membership/StatsCard';
import MonthlyTrendChart from '@/components/admin/membership/MonthlyTrendChart';
import TithingOfferingsChart from '@/components/admin/membership/TithingOfferingsChart';
import MemberFilters from '@/components/admin/membership/MemberFilters';
import MembersTable from '@/components/admin/membership/MembersTable';

export default function MembershipDashboardPage() {
  return (
    <div className="space-y-8">
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
          <Link href="/admin" className="flex items-center gap-1 hover:opacity-80">
            <Home className="h-4 w-4" />
            Membership
          </Link>
          <span>&gt;</span>
          <span>Dashboard</span>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          icon={<Users className="h-6 w-6" />}
          value="2,450"
          label="Total Members"
          change="+5.2%"
          borderTopColor="#0B2A4A"
        />
        <StatsCard
          icon={<UserCheck className="h-6 w-6" />}
          value="1,850"
          label="Active Members"
          change="+2.1%"
          borderTopColor="#105BA9"
        />
        <StatsCard
          icon={<UserX className="h-6 w-6" />}
          value="285"
          label="Inactive"
          change="-1.3%"
          changePositive={false}
          iconColor="gray"
          borderTopColor="#C4CBD2"
        />
        <StatsCard
          icon={<UserPlus className="h-6 w-6" />}
          value="42"
          label="New This Month"
          change="+5.2%"
          borderTopColor="#1387FF"
        />
      </div>

      {/* Charts */}
      <div className="flex flex-wrap gap-[66px]">
        <MonthlyTrendChart />
        <TithingOfferingsChart />
      </div>

      {/* Filters */}
      <MemberFilters />

      {/* Members Table */}
      <MembersTable />
    </div>
  );
}
