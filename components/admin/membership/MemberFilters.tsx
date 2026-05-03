'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import {
  type MemberFilterState,
  MEMBERSHIP_STATUS_OPTIONS,
  MEMBER_ROLE_OPTIONS,
  DATE_RANGE_OPTIONS,
} from '@/lib/memberFilters';
import { useMembersPortal } from '@/components/admin/membership/MembersPortalContext';

const selectClassName =
  'h-9 min-w-[7.5rem] max-w-[11rem] shrink-0 rounded-md border pl-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FC4B2]/30 appearance-none bg-no-repeat';

const selectChevronStyle: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundPosition: 'right 0.35rem center',
  backgroundSize: '1rem',
};

const selectFieldStyle: CSSProperties = {
  backgroundColor: 'var(--admin-surface, #ffffff)',
  color: 'var(--admin-text, #2B2B2C)',
  borderColor: 'var(--admin-border, #D9DADC)',
  ...selectChevronStyle,
};

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
      className="w-full rounded-xl border p-4 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/5"
      style={{
        borderColor: 'var(--admin-border, rgba(0,0,0,0.07))',
        background: 'var(--admin-surface, #FFFFFF)',
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="relative w-full lg:w-64 lg:max-w-xs lg:shrink-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: 'var(--admin-text-muted, #9ca3af)' }}
          />
          <Input
            placeholder="Search member..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="pl-9 h-9 rounded-md text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-[var(--admin-surface,#fff)] text-[color:var(--admin-text,#2B2B2C)] border-[var(--admin-border,#D9DADC)]"
            style={{
              borderColor: 'var(--admin-border, #D9DADC)',
              background: 'var(--admin-surface, #fff)',
              color: 'var(--admin-text, #2B2B2C)',
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-1 lg:justify-center lg:min-w-0">
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className={selectClassName}
            style={selectFieldStyle}
          >
            {MEMBERSHIP_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.role}
            onChange={(e) => update('role', e.target.value)}
            className={selectClassName}
            style={selectFieldStyle}
          >
            {MEMBER_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.department}
            onChange={(e) => update('department', e.target.value)}
            className={selectClassName}
            style={selectFieldStyle}
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
            className={selectClassName}
            style={selectFieldStyle}
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
            className="flex w-full lg:w-[156px] items-center justify-center shrink-0 hover:opacity-90"
            style={{
              height: 42,
              borderRadius: 8,
              padding: '9px 17px',
              gap: 13,
              background: 'var(--color-primary, #0B2A4A)',
              color: '#FFFFFF',
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
