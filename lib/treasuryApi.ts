/**
 * Treasury API Integration
 *
 * Centralized API client for the admin treasury dashboard at /admin/treasury.
 * Connects to treasury and analytics endpoints.
 *
 * @module lib/treasuryApi
 * @see docs/API_INTEGRATION.md
 */

import { getApiBaseUrl, getAccessToken } from './api';

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

/** Fetch with auth; throws on non-2xx */
async function fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
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

/** Fetch with auth; returns fallback on error */
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

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface TreasuryStatisticsResponse {
  total_income: string;
  total_expenses: string;
  net_balance: string;
  income_by_category: { category__name: string; total: string; count: number }[];
  expenses_by_category: { category__name: string; total: string; count: number }[];
  expenses_by_department: { department__name: string; total: string; count: number }[];
  pending_expense_requests: number;
  total_assets_value: string;
}

export interface DashboardTreasuryResponse {
  period: { date_from: string; date_to: string };
  total_income: string;
  total_expenses: string;
  net_balance: string;
  pending_expense_requests: number;
  total_assets_value: string;
  income_transaction_count: number;
  expense_transaction_count: number;
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

export interface IncomeTransactionItem {
  id: string;
  receipt_number?: string;
  transaction_date: string;
  category_name: string;
  amount: string;
  contributor_display?: string;
  payment_method_display?: string;
  [key: string]: unknown;
}

export interface ExpenseTransactionItem {
  id: string;
  voucher_number?: string;
  transaction_date: string;
  category_name?: string;
  department_name?: string;
  amount: string;
  paid_to?: string;
  payment_method_display?: string;
  [key: string]: unknown;
}

export interface ExpenseRequestItem {
  id: string;
  request_number: string;
  department_name: string;
  category_name?: string;
  amount_requested: string;
  amount_approved?: string;
  status: string;
  requested_by_name?: string;
  required_by_date?: string;
  purpose?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface IncomeCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  transaction_count?: number;
  total_amount?: string;
  [key: string]: unknown;
}

export interface ExpenseCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  transaction_count?: number;
  total_amount?: string;
  [key: string]: unknown;
}

export interface MemberContributionsResponse {
  contributors: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    status: string;
    total_amount: number;
    last_date: string;
    contributions: { date: string; amount: number; type: string }[];
  }[];
  period?: { date_from: string; date_to: string };
  generated_at?: string;
}

export interface DepartmentBudgetsResponse {
  departments: {
    id: string;
    name: string;
    allocated: number;
    utilized: number;
  }[];
  generated_at?: string;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

export interface DateRange {
  date_from?: string;
  date_to?: string;
  start_date?: string;
  end_date?: string;
}

/** GET /api/treasury/statistics/?start_date=&end_date= */
export async function getTreasuryStatistics(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<TreasuryStatisticsResponse | null> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (params?.start_date) {
    sp.set('start_date', params.start_date);
  }
  if (params?.end_date) {
    sp.set('end_date', params.end_date);
  }
  const qs = sp.toString();
  return fetchAuthSafe<TreasuryStatisticsResponse>(
    `${base}/treasury/statistics/${qs ? `?${qs}` : ''}`,
    undefined,
    null
  );
}

/** GET /api/analytics/dashboard/treasury/?date_from=&date_to= */
export async function getDashboardTreasury(
  params?: DateRange
): Promise<DashboardTreasuryResponse | null> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  const from = params?.date_from ?? params?.start_date;
  const to = params?.date_to ?? params?.end_date;
  if (from) {
    sp.set('date_from', from);
  }
  if (to) {
    sp.set('date_to', to);
  }
  const qs = sp.toString();
  return fetchAuthSafe<DashboardTreasuryResponse>(
    `${base}/analytics/dashboard/treasury/${qs ? `?${qs}` : ''}`,
    undefined,
    null
  );
}

/** GET /api/analytics/finance/kpis/?date_from=&date_to= */
export async function getFinanceKPIs(params?: DateRange): Promise<FinanceKPIsResponse | null> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  const from = params?.date_from ?? params?.start_date;
  const to = params?.date_to ?? params?.end_date;
  if (from) {
    sp.set('date_from', from);
  }
  if (to) {
    sp.set('date_to', to);
  }
  const qs = sp.toString();
  return fetchAuthSafe<FinanceKPIsResponse>(
    `${base}/analytics/finance/kpis/${qs ? `?${qs}` : ''}`,
    undefined,
    null
  );
}

/** GET /api/analytics/finance/trends/?period_days=90 */
export async function getFinanceTrends(periodDays = 365): Promise<FinanceTrendsResponse | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<FinanceTrendsResponse>(
    `${base}/analytics/finance/trends/?period_days=${periodDays}`,
    undefined,
    null
  );
}

/** GET /api/treasury/income-transactions/?start_date=&end_date= */
export async function getIncomeTransactions(params?: {
  start_date?: string;
  end_date?: string;
  page_size?: number;
}): Promise<IncomeTransactionItem[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  sp.set('page_size', String(params?.page_size ?? 100));
  if (params?.start_date) {
    sp.set('start_date', params.start_date);
  }
  if (params?.end_date) {
    sp.set('end_date', params.end_date);
  }
  const raw = await fetchAuthSafe<{ results?: IncomeTransactionItem[] } | IncomeTransactionItem[]>(
    `${base}/treasury/income-transactions/?${sp}`,
    undefined,
    []
  );
  return normalizeListResponse<IncomeTransactionItem>(raw ?? []);
}

/** GET /api/treasury/expense-transactions/?start_date=&end_date= */
export async function getExpenseTransactions(params?: {
  start_date?: string;
  end_date?: string;
  page_size?: number;
}): Promise<ExpenseTransactionItem[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  sp.set('page_size', String(params?.page_size ?? 100));
  if (params?.start_date) {
    sp.set('start_date', params.start_date);
  }
  if (params?.end_date) {
    sp.set('end_date', params.end_date);
  }
  const raw = await fetchAuthSafe<
    { results?: ExpenseTransactionItem[] } | ExpenseTransactionItem[]
  >(`${base}/treasury/expense-transactions/?${sp}`, undefined, []);
  return normalizeListResponse<ExpenseTransactionItem>(raw ?? []);
}

/** GET /api/treasury/expense-requests/{id}/ */
export async function getExpenseRequest(id: string): Promise<ExpenseRequestItem | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<ExpenseRequestItem>(
    `${base}/treasury/expense-requests/${id}/`,
    undefined,
    null
  );
}

/** GET /api/treasury/expense-requests/?status= */
export async function getExpenseRequests(params?: {
  status?: string;
  page_size?: number;
}): Promise<ExpenseRequestItem[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  sp.set('page_size', String(params?.page_size ?? 50));
  if (params?.status) {
    sp.set('status', params.status);
  }
  const raw = await fetchAuthSafe<{ results?: ExpenseRequestItem[] } | ExpenseRequestItem[]>(
    `${base}/treasury/expense-requests/?${sp}`,
    undefined,
    []
  );
  return normalizeListResponse<ExpenseRequestItem>(raw ?? []);
}

/** GET /api/analytics/finance/member-contributions/?limit=&date_from=&date_to= */
export async function getMemberContributions(params?: {
  limit?: number;
  date_from?: string;
  date_to?: string;
}): Promise<MemberContributionsResponse | null> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (params?.limit !== undefined && params?.limit !== null) {
    sp.set('limit', String(params.limit));
  }
  if (params?.date_from) {
    sp.set('date_from', params.date_from);
  }
  if (params?.date_to) {
    sp.set('date_to', params.date_to);
  }
  const qs = sp.toString();
  return fetchAuthSafe<MemberContributionsResponse>(
    `${base}/analytics/finance/member-contributions/${qs ? `?${qs}` : ''}`,
    undefined,
    null
  );
}

/** GET /api/analytics/finance/department-budgets/ */
export async function getDepartmentBudgets(): Promise<DepartmentBudgetsResponse | null> {
  const base = getApiBaseUrl();
  return fetchAuthSafe<DepartmentBudgetsResponse>(
    `${base}/analytics/finance/department-budgets/`,
    undefined,
    null
  );
}

/** GET /api/treasury/income-categories/ */
export async function getIncomeCategories(): Promise<IncomeCategoryItem[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuthSafe<IncomeCategoryItem[]>(
    `${base}/treasury/income-categories/`,
    undefined,
    []
  );
  return Array.isArray(raw) ? raw : [];
}

/** GET /api/treasury/expense-categories/ */
export async function getExpenseCategories(): Promise<ExpenseCategoryItem[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuthSafe<ExpenseCategoryItem[]>(
    `${base}/treasury/expense-categories/`,
    undefined,
    []
  );
  return Array.isArray(raw) ? raw : [];
}

/** POST /api/treasury/expense-requests/{id}/approve-dept-head/ */
export async function approveExpenseRequestDeptHead(
  id: string,
  body?: { amount_approved?: string; comments?: string }
): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/expense-requests/${id}/approve-dept-head/`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
}

/** POST /api/treasury/expense-requests/{id}/approve-first-elder/ */
export async function approveExpenseRequestFirstElder(id: string): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/expense-requests/${id}/approve-first-elder/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/** POST /api/treasury/expense-requests/{id}/approve-treasurer/ */
export async function approveExpenseRequestTreasurer(id: string): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/expense-requests/${id}/approve-treasurer/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/** POST /api/treasury/expense-requests/{id}/reject/ */
export async function rejectExpenseRequest(
  id: string,
  body?: { reason?: string }
): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/expense-requests/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
}

/** POST /api/treasury/income-transactions/ */
export async function createIncomeTransaction(body: Record<string, unknown>): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/income-transactions/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** POST /api/treasury/expense-transactions/ */
export async function createExpenseTransaction(body: Record<string, unknown>): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/expense-transactions/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
