/**
 * Dashboard API Integration
 *
 * Centralized API client for the admin dashboard at /admin.
 * Connects to the church-management-saas-backend analytics, members, treasury,
 * announcements, departments, and activity endpoints.
 *
 * @module lib/dashboardApi
 * @see docs/API_INTEGRATION.md for full integration documentation
 */

import { getApiBaseUrl, getAccessToken } from './api';

/** Standard auth headers for authenticated requests */
function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Fetch with auth; throws on non-2xx (kept for future use) */
async function _fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(), ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (data?.error as string) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/** Fetch with auth; returns fallback on error (for optional data) */
async function fetchAuthSafe<T>(
  url: string,
  init?: RequestInit,
  fallback: T | null = null as T | null
): Promise<T | null> {
  try {
    const token = getAccessToken();
    if (!token) {
      return fallback ?? null;
    }
    const res = await fetch(url, {
      ...init,
      headers: { ...getAuthHeaders(), ...init?.headers },
    });
    if (!res.ok) {
      return fallback ?? null;
    }
    return (await res.json().catch(() => fallback ?? null)) as T;
  } catch {
    return fallback ?? null;
  }
}

/** Normalize API response: backend may return paginated { results } or plain array */
function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

// =============================================================================
// Types (matching backend responses)
// =============================================================================

export interface DashboardAdminResponse {
  members_total: number;
  departments_total: number;
  announcements_total: number;
  programs_total: number;
  current_month_income: string;
  current_month_expenses: string;
  current_month_net: string;
  pending_expense_requests: number;
  generated_at?: string;
}

export interface MemberStatsResponse {
  total_members: number;
  total_change_percent: number;
  active_members: number;
  active_change_percent: number;
  inactive_members: number;
  inactive_change_percent: number;
  new_members_this_month: number;
  new_members_change_percent: number;
  pending_approvals: number;
  by_membership_status?: { membership_status: string; count: number }[];
  by_gender?: { gender: string; count: number }[];
  generated_at?: string;
}

export interface FinanceKPIsResponse {
  period: { date_from: string; date_to: string };
  total_income: string;
  total_expenses: string;
  net_cash_flow: string;
  income_transaction_count: number;
  expense_transaction_count: number;
  generated_at?: string;
}

export interface FinanceTrendsResponse {
  period_days: number;
  date_from: string;
  date_to: string;
  income_by_month: { month: string; total: string; count: number }[];
  expenses_by_month: { month: string; total: string; count: number }[];
  generated_at?: string;
}

export interface AnnouncementStatsResponse {
  total: number;
  by_status: { status: string; count: number }[];
  by_priority: { priority: string; count: number }[];
  generated_at?: string;
}

export interface ActivityFeedItem {
  id: string;
  action: string;
  action_display: string;
  model_name: string;
  object_id: string | null;
  description: string;
  changes: Record<string, unknown> | null;
  user: string;
  user_email: string | null;
  user_display: string | null;
  church: string;
  church_name: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BackendMember {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  membership_status: string;
  member_since?: string;
  gender?: string;
  email?: string;
  phone_number?: string;
  [key: string]: unknown;
}

export interface BackendIncomeTransaction {
  id: string;
  transaction_date: string;
  category_name: string;
  amount: string;
  contributor_display?: string;
  receipt_number?: string;
  [key: string]: unknown;
}

export interface BackendExpenseTransaction {
  id: string;
  transaction_date: string;
  category_name?: string;
  amount: string;
  description?: string;
  [key: string]: unknown;
}

export interface BackendAnnouncement {
  id: string;
  title: string;
  status: string;
  publish_at?: string;
  content?: string;
  priority?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface BackendDepartment {
  id: string;
  name: string;
  code?: string;
  is_active: boolean;
  member_count?: number;
  head_name?: string | null;
  [key: string]: unknown;
}

export interface BackendDepartmentActivity {
  id: string;
  title: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  location?: string;
  description?: string;
  department?: { id: string; name: string };
  [key: string]: unknown;
}

export interface BackendExpenseRequest {
  id: string;
  request_number: string;
  status: string;
  amount_requested?: string;
  purpose?: string;
  department?: { id: string; name: string };
  department_name?: string;
  [key: string]: unknown;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * GET /api/analytics/dashboard/admin/
 * Admin overview: members_total, departments_total, announcements_total,
 * programs_total, current_month_income/expenses/net, pending_expense_requests.
 */
export async function getDashboardAdmin(): Promise<DashboardAdminResponse | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<DashboardAdminResponse>(
    `${base}/analytics/dashboard/admin/`,
    undefined,
    null
  );
}

/**
 * GET /api/analytics/members/stats/
 * Member statistics: total, active, inactive, new this month, etc.
 */
export async function getDashboardMemberStats(): Promise<MemberStatsResponse | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<MemberStatsResponse>(`${base}/analytics/members/stats/`, undefined, null);
}

/**
 * GET /api/analytics/finance/kpis/?date_from=&date_to=
 * Finance KPIs for a date range.
 */
export async function getFinanceKPIs(params?: {
  date_from?: string;
  date_to?: string;
}): Promise<FinanceKPIsResponse | null> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (params?.date_from) {
    sp.set('date_from', params.date_from);
  }
  if (params?.date_to) {
    sp.set('date_to', params.date_to);
  }
  const qs = sp.toString();
  return fetchAuthSafe<FinanceKPIsResponse>(
    `${base}/analytics/finance/kpis/${qs ? `?${qs}` : ''}`,
    undefined,
    null
  );
}

/**
 * GET /api/analytics/finance/trends/?period_days=90
 * Income and expense trends by month.
 */
export async function getFinanceTrends(periodDays = 90): Promise<FinanceTrendsResponse | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<FinanceTrendsResponse>(
    `${base}/analytics/finance/trends/?period_days=${periodDays}`,
    undefined,
    null
  );
}

/**
 * GET /api/analytics/announcements/stats/
 * Announcement counts by status and priority.
 */
export async function getAnnouncementStats(): Promise<AnnouncementStatsResponse | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<AnnouncementStatsResponse>(
    `${base}/analytics/announcements/stats/`,
    undefined,
    null
  );
}

/**
 * GET /api/activity/?page_size=20
 * Activity feed (audit log).
 */
export async function getActivityFeed(pageSize = 20): Promise<ActivityFeedItem[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuthSafe<PaginatedResponse<ActivityFeedItem> | ActivityFeedItem[]>(
    `${base}/activity/?page_size=${pageSize}`,
    undefined,
    null
  );
  return normalizeListResponse<ActivityFeedItem>(raw);
}

/**
 * GET /api/members/members/?page_size=100
 * Members list (for charts and derived stats).
 */
export async function getMembersList(pageSize = 100): Promise<BackendMember[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuthSafe<PaginatedResponse<BackendMember> | BackendMember[]>(
    `${base}/members/members/?page_size=${pageSize}`,
    undefined,
    null
  );
  return normalizeListResponse<BackendMember>(raw);
}

/**
 * GET /api/treasury/income-transactions/?page_size=100
 * Income transactions for dashboard charts.
 */
export async function getIncomeTransactions(
  pageSize = 100,
  params?: { start_date?: string; end_date?: string }
): Promise<BackendIncomeTransaction[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams({ page_size: String(pageSize) });
  if (params?.start_date) {
    sp.set('start_date', params.start_date);
  }
  if (params?.end_date) {
    sp.set('end_date', params.end_date);
  }
  const raw = await fetchAuthSafe<
    PaginatedResponse<BackendIncomeTransaction> | BackendIncomeTransaction[]
  >(`${base}/treasury/income-transactions/?${sp}`, undefined, null);
  return normalizeListResponse<BackendIncomeTransaction>(raw);
}

/**
 * GET /api/treasury/expense-transactions/?page_size=100
 * Expense transactions for dashboard charts.
 */
export async function getExpenseTransactions(
  pageSize = 100,
  params?: { start_date?: string; end_date?: string }
): Promise<BackendExpenseTransaction[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams({ page_size: String(pageSize) });
  if (params?.start_date) {
    sp.set('start_date', params.start_date);
  }
  if (params?.end_date) {
    sp.set('end_date', params.end_date);
  }
  const raw = await fetchAuthSafe<
    PaginatedResponse<BackendExpenseTransaction> | BackendExpenseTransaction[]
  >(`${base}/treasury/expense-transactions/?${sp}`, undefined, null);
  return normalizeListResponse<BackendExpenseTransaction>(raw);
}

/**
 * GET /api/announcements/?page_size=100
 * Announcements list.
 */
export async function getAnnouncementsList(pageSize = 100): Promise<BackendAnnouncement[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuthSafe<PaginatedResponse<BackendAnnouncement> | BackendAnnouncement[]>(
    `${base}/announcements/?page_size=${pageSize}`,
    undefined,
    null
  );
  return normalizeListResponse<BackendAnnouncement>(raw);
}

/**
 * GET /api/departments/?page_size=100
 * Departments list.
 */
export async function getDepartmentsList(pageSize = 100): Promise<BackendDepartment[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuthSafe<PaginatedResponse<BackendDepartment> | BackendDepartment[]>(
    `${base}/departments/?page_size=${pageSize}`,
    undefined,
    null
  );
  return normalizeListResponse<BackendDepartment>(raw);
}

/**
 * GET /api/treasury/expense-requests/?page_size=50&status=SUBMITTED
 * Pending expense requests (approvals).
 */
export async function getExpenseRequests(
  pageSize = 50,
  statusFilter?: string
): Promise<BackendExpenseRequest[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams({ page_size: String(pageSize) });
  if (statusFilter) {
    sp.set('status', statusFilter);
  }
  const raw = await fetchAuthSafe<
    PaginatedResponse<BackendExpenseRequest> | BackendExpenseRequest[]
  >(`${base}/treasury/expense-requests/?${sp}`, undefined, null);
  return normalizeListResponse<BackendExpenseRequest>(raw);
}

/**
 * Fetch upcoming activities from all departments.
 * GET /api/departments/{id}/activities/?time_filter=upcoming for each dept.
 */
export async function getUpcomingActivities(): Promise<BackendDepartmentActivity[]> {
  const departments = await getDepartmentsList(50);
  const base = getApiBaseUrl();
  const all: BackendDepartmentActivity[] = [];

  await Promise.all(
    departments.slice(0, 20).map(async (dept) => {
      const raw = await fetchAuthSafe<
        PaginatedResponse<BackendDepartmentActivity> | BackendDepartmentActivity[]
      >(
        `${base}/departments/${dept.id}/activities/?time_filter=upcoming&page_size=10`,
        undefined,
        null
      );
      const items = normalizeListResponse<BackendDepartmentActivity>(raw);
      all.push(
        ...items.map((a) => ({
          ...a,
          department: a.department || { id: dept.id, name: dept.name },
        }))
      );
    })
  );

  return all.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
}
