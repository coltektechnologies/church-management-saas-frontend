'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import {
  type MemberFilterState,
  MEMBERSHIP_STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
} from '@/lib/memberFilters';
import { useMembersPortal } from '@/components/admin/membership/MembersPortalContext';

export interface MemberFiltersProps {
  filters: MemberFilterState;
  onFiltersChange: (filters: MemberFilterState) => void;
  departmentOptions?: { value: string; label: string }[];
}

export default function MemberFilters({
  filters,
  onFiltersChange,
  departmentOptions = [],
}: MemberFiltersProps) {
  const { membersBasePath } = useMembersPortal();
  const update = (key: keyof MemberFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div
      className="w-full border border-[#D9DADC] bg-white p-3 md:p-4"
      style={{
        gap: 40,
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="grid grid-cols-1 gap-2 md:flex md:items-center md:gap-3 md:flex-1 md:min-w-0">
          <div className="relative w-full md:max-w-[220px] md:min-w-[140px] md:shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search member..."
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className="pl-9 h-9 rounded-none border-[#D9DADC] bg-white text-[#2B2B2C] placeholder:text-gray-400 text-sm"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className="h-9 w-full md:w-auto px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {MEMBERSHIP_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.department}
            onChange={(e) => update('department', e.target.value)}
            className="h-9 w-full md:w-auto px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Departments</option>
            {departmentOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => update('dateRange', e.target.value)}
            className="h-9 w-full md:w-auto px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {DATE_RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Link href={`${membersBasePath}/add`} className="w-full md:w-auto">
          <Button
            className="flex w-full md:w-[156px] items-center justify-center shrink-0 hover:opacity-90"
            style={{
              height: 42,
              borderRadius: 8,
              padding: '9px 17px',
              gap: 13,
              background: '#0B2A4A',
              color: '#FFFFFF',
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '100%',
              letterSpacing: 0,
            }}
          >
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>
    </div>
  );
}
