/**
 * Member list filters — types and client-side filtering logic.
 * Used by /admin/members to filter the members table.
 *
 * @module lib/memberFilters
 */

export interface MemberFilterState {
  search: string;
  status: string;
  department: string;
  dateRange: string;
}

export const DEFAULT_MEMBER_FILTERS: MemberFilterState = {
  search: '',
  status: 'all',
  department: 'all',
  dateRange: 'all',
};

export const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'NEW_CONVERT', label: 'New Convert' },
  { value: 'VISITOR', label: 'Visitor' },
];

export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Dates' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
];

export interface FilterableMemberRow {
  id: string;
  name: string;
  memberId: string;
  phone: string;
  email: string;
  department: string;
  role: string;
  status: string;
  memberSince: string;
}

/**
 * Client-side filter: returns true if the member passes all active filters.
 */
export function passesMemberFilters(row: FilterableMemberRow, filters: MemberFilterState): boolean {
  const { search, status, department, dateRange } = filters;

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    const name = (row.name || '').toLowerCase();
    const email = (row.email || '').toLowerCase();
    const phone = (row.phone || '').toLowerCase();
    const memberId = (row.memberId || '').toLowerCase();
    if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !memberId.includes(q)) {
      return false;
    }
  }

  if (status && status !== 'all' && row.status !== status) {
    return false;
  }

  if (department && department !== 'all' && row.department !== department) {
    return false;
  }

  if (dateRange && dateRange !== 'all' && row.memberSince) {
    const since = new Date(row.memberSince);
    const now = new Date();

    switch (dateRange) {
      case 'this_month':
        if (since.getMonth() !== now.getMonth() || since.getFullYear() !== now.getFullYear()) {
          return false;
        }
        break;
      case 'last_6_months': {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (since < sixMonthsAgo) {
          return false;
        }
        break;
      }
      case 'this_year':
        if (since.getFullYear() !== now.getFullYear()) {
          return false;
        }
        break;
      case 'last_year':
        if (since.getFullYear() !== now.getFullYear() - 1) {
          return false;
        }
        break;
      default:
        break;
    }
  }

  return true;
}

/**
 * Apply filters to an array of members. Returns the filtered array.
 */
export function applyMemberFilters<T extends FilterableMemberRow>(
  members: T[],
  filters: MemberFilterState
): T[] {
  if (
    !filters.search.trim() &&
    (filters.status === 'all' || !filters.status) &&
    (filters.department === 'all' || !filters.department) &&
    (filters.dateRange === 'all' || !filters.dateRange)
  ) {
    return members;
  }
  return members.filter((m) => passesMemberFilters(m, filters));
}
