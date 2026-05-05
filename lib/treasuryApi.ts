/**
 * Treasury API Integration
 *
 * Centralized API client for the admin treasury dashboard at /admin/treasury.
 * Connects to treasury and analytics endpoints.
 *
 * @module lib/treasuryApi
 * @see docs/API_INTEGRATION.md
 */

import type { Expense } from '@/types/expense';

import { messageFromApiErrorJson } from '@/lib/apiMessages';

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
    throw new Error(messageFromApiErrorJson(data, `Request failed: ${res.status}`));
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
    return data as T[];
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return (Array.isArray(r) ? r : []) as T[];
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

/** One Church / Conference line from the treasury income allocation engine. */
export interface IncomeAllocationRow {
  id?: string;
  destination: 'CHURCH' | 'CONFERENCE' | string;
  destination_display?: string;
  amount: string;
  percentage: string;
}

export interface IncomeTransactionItem {
  id: string;
  receipt_number?: string;
  transaction_date: string;
  category_name: string;
  amount: string;
  contributor_display?: string;
  payment_method_display?: string;
  /** Present on list/detail from the API; drives Church–Conference demarcation. */
  allocations?: IncomeAllocationRow[];
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

/** Next actor in the expense approval workflow (from API `pending_step`). */
export interface ExpensePendingStep {
  code: string;
  label: string;
}

/** One step in the expense approval chain (from API `approval_chain`). */
export interface ExpenseApprovalStage {
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
}

export interface ExpenseApprovalChain {
  dept_head: ExpenseApprovalStage;
  first_elder: ExpenseApprovalStage;
  treasurer: ExpenseApprovalStage;
}

export interface ExpenseReviewPermissions {
  dept_head: boolean;
  first_elder: boolean;
  treasurer: boolean;
}

export interface ExpenseRequestItem {
  id: string;
  request_number: string;
  department_name: string;
  category_name?: string;
  amount_requested: string;
  amount_approved?: string;
  status: string;
  status_display?: string;
  requested_by_name?: string;
  required_by_date?: string;
  purpose?: string;
  created_at?: string;
  pending_step?: ExpensePendingStep | null;
  approval_chain?: ExpenseApprovalChain | null;
  review_permissions?: ExpenseReviewPermissions | null;
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

/** Same as {@link getExpenseRequest} but fails loudly (load-into-form flows). */
export async function getExpenseRequestStrict(id: string): Promise<ExpenseRequestItem> {
  const base = getApiBaseUrl();
  return fetchAuth<ExpenseRequestItem>(`${base}/treasury/expense-requests/${id}/`, {
    method: 'GET',
  });
}

/** GET /api/treasury/expense-requests/?status=&department_id=&church_id= */
export async function getExpenseRequests(params?: {
  status?: string;
  department_id?: string;
  church_id?: string;
  page_size?: number;
}): Promise<ExpenseRequestItem[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  sp.set('page_size', String(params?.page_size ?? 100));
  if (params?.status) {
    sp.set('status', params.status);
  }
  if (params?.department_id) {
    sp.set('department_id', params.department_id);
  }
  if (params?.church_id) {
    sp.set('church_id', params.church_id);
  }
  const raw = await fetchAuth<{ results?: ExpenseRequestItem[] } | ExpenseRequestItem[]>(
    `${base}/treasury/expense-requests/?${sp}`,
    { method: 'GET' }
  );
  return normalizeListResponse<ExpenseRequestItem>(raw);
}

/** POST /api/treasury/expense-requests/ — create (usually status DRAFT, then call submit) */
export interface CreateExpenseRequestBody {
  department_id: string;
  category_id: string;
  amount_requested: string;
  purpose: string;
  justification: string;
  required_by_date: string;
  status?: string;
  priority?: string;
}

export async function createExpenseRequest(
  body: CreateExpenseRequestBody
): Promise<Record<string, unknown>> {
  const base = getApiBaseUrl();
  return fetchAuth<Record<string, unknown>>(`${base}/treasury/expense-requests/`, {
    method: 'POST',
    body: JSON.stringify({
      status: 'DRAFT',
      priority: 'MEDIUM',
      ...body,
    }),
  });
}

/** POST /api/treasury/expense-requests/{id}/submit/ */
export async function submitExpenseRequest(id: string): Promise<Record<string, unknown>> {
  const base = getApiBaseUrl();
  return fetchAuth<Record<string, unknown>>(`${base}/treasury/expense-requests/${id}/submit/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/** Create draft + submit for approval in one call. */
export async function createAndSubmitExpenseRequest(params: {
  departmentId: string;
  categoryId: string;
  purpose: string;
  justification: string;
  amount: number;
  /** YYYY-MM-DD; defaults to 14 days from today */
  requiredByDate?: string;
}): Promise<{ id: string; requestNumber: string; status: string }> {
  const reqDate =
    params.requiredByDate ??
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const created = await createExpenseRequest({
    department_id: params.departmentId,
    category_id: params.categoryId,
    amount_requested: params.amount.toFixed(2),
    purpose: params.purpose,
    justification: params.justification,
    required_by_date: reqDate,
    status: 'DRAFT',
    priority: 'MEDIUM',
  });

  const id = String(created.id ?? '');
  if (!id) {
    throw new Error('Invalid expense request response');
  }

  const submitted = await submitExpenseRequest(id);
  const status = String(submitted.status ?? 'SUBMITTED');
  return {
    id,
    requestNumber: String(created.request_number ?? submitted.request_number ?? id),
    status,
  };
}

/** Map backend expense request status → UI expense status */
export function mapApiExpenseStatusToUi(status: string): 'pending' | 'approved' | 'rejected' {
  const s = status.toUpperCase();
  if (s === 'APPROVED' || s === 'DISBURSED') {
    return 'approved';
  }
  if (s === 'REJECTED' || s === 'CANCELLED') {
    return 'rejected';
  }
  return 'pending';
}

/** Map list API row → local Expense (list payload may omit purpose) */
export function mapExpenseRequestRowToExpense(row: ExpenseRequestItem): Expense {
  const amount = parseFloat(String(row.amount_requested ?? 0));
  const st = mapApiExpenseStatusToUi(String(row.status ?? 'SUBMITTED'));
  const ext = row as ExpenseRequestItem & { purpose?: string };
  const title =
    (typeof ext.purpose === 'string' && ext.purpose.trim()) ||
    String(row.category_name ?? row.department_name ?? 'Expense request');

  return {
    id: String(row.id),
    expenseRef: String(row.request_number ?? row.id),
    title,
    description: typeof ext.purpose === 'string' ? ext.purpose : '',
    submitterName: String(row.requested_by_name ?? ''),
    items: [{ id: 'agg', name: title, quantity: 1, unitCost: amount }],
    amount,
    documents: [],
    status: st,
    submittedAt: String(row.created_at ?? new Date().toISOString()),
    reviewedAt: undefined,
  };
}

/** GET /api/analytics/finance/member-contributions/?limit=&date_from=&date_to= */
export async function getMemberContributions(params?: {
  limit?: number;
  date_from?: string;
  date_to?: string;
}): Promise<MemberContributionsResponse> {
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
  return fetchAuth<MemberContributionsResponse>(
    `${base}/analytics/finance/member-contributions/${qs ? `?${qs}` : ''}`
  );
}

/** GET /api/analytics/finance/department-budgets/ */
export async function getDepartmentBudgets(
  fiscalYear?: number
): Promise<DepartmentBudgetsResponse | null> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (fiscalYear !== undefined && fiscalYear !== null) {
    sp.set('fiscal_year', String(fiscalYear));
  }
  const qs = sp.toString();
  return fetchAuthSafe<DepartmentBudgetsResponse>(
    `${base}/analytics/finance/department-budgets/${qs ? `?${qs}` : ''}`,
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

/** Same list as {@link getIncomeCategories} but fails loudly on auth/network errors (forms). */
export async function getIncomeCategoriesStrict(): Promise<IncomeCategoryItem[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuth<IncomeCategoryItem[] | { results?: IncomeCategoryItem[] }>(
    `${base}/treasury/income-categories/`,
    { method: 'GET' }
  );
  return normalizeListResponse<IncomeCategoryItem>(raw);
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

/**
 * Active expense categories for forms — uses authenticated fetch so API/auth errors surface
 * (getExpenseCategories uses fetchAuthSafe and can return [] without indicating failure).
 * If `?is_active=true` returns nothing (common when nothing is seeded as “active”), falls back
 * to the full list and keeps categories that are active or unset.
 */
/** GET all expense categories (treasury manage screen). */
export async function fetchExpenseCategoriesAll(): Promise<ExpenseCategoryItem[]> {
  const base = getApiBaseUrl();
  const raw = await fetchAuth<ExpenseCategoryItem[] | { results?: ExpenseCategoryItem[] }>(
    `${base}/treasury/expense-categories/`,
    { method: 'GET' }
  );
  return normalizeListResponse<ExpenseCategoryItem>(raw);
}

/** POST /api/treasury/expense-categories/ — treasury / church-scoped category. */
export async function createExpenseCategory(body: {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}): Promise<ExpenseCategoryItem> {
  const base = getApiBaseUrl();
  return fetchAuth<ExpenseCategoryItem>(`${base}/treasury/expense-categories/`, {
    method: 'POST',
    body: JSON.stringify({
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      description: (body.description ?? '').trim(),
      is_active: body.is_active !== false,
    }),
  });
}

export async function fetchExpenseCategoriesActive(): Promise<ExpenseCategoryItem[]> {
  const base = getApiBaseUrl();
  const activeFirst = await fetchAuth<ExpenseCategoryItem[] | { results?: ExpenseCategoryItem[] }>(
    `${base}/treasury/expense-categories/?is_active=true`,
    { method: 'GET' }
  );
  let list = normalizeListResponse<ExpenseCategoryItem>(activeFirst);
  if (list.length > 0) {
    return list.filter((c) => c.is_active !== false);
  }
  const all = await fetchAuth<ExpenseCategoryItem[] | { results?: ExpenseCategoryItem[] }>(
    `${base}/treasury/expense-categories/`,
    { method: 'GET' }
  );
  list = normalizeListResponse<ExpenseCategoryItem>(all);
  return list.filter((c) => c.is_active !== false);
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
  body?: { reason?: string; rejection_reason?: string }
): Promise<unknown> {
  const base = getApiBaseUrl();
  const rejectionReason = body?.rejection_reason ?? body?.reason;
  return fetchAuth(`${base}/treasury/expense-requests/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify(rejectionReason ? { rejection_reason: rejectionReason } : {}),
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

/** Active pledges for a member when recording income (treasury). GET .../treasury/member-pledges/?member=uuid */
export interface TreasuryMemberPledgeRow {
  id: string;
  pledge_year: number;
  title: string;
  target_amount: string;
  amount_fulfilled: string;
  status: string;
  label: string;
}

export async function getTreasuryMemberPledges(
  memberId: string,
  options?: { includeAllStatuses?: boolean }
): Promise<TreasuryMemberPledgeRow[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams({ member: memberId });
  if (options?.includeAllStatuses) {
    sp.set('all', '1');
  }
  const raw = await fetchAuth<unknown>(`${base}/treasury/member-pledges/?${sp.toString()}`);
  return normalizeListResponse<TreasuryMemberPledgeRow>(raw);
}

/** All pledges for the church (treasury). GET /api/treasury/pledges/ */
export interface TreasuryChurchPledgeRow {
  id: string;
  member_id: string;
  member_name: string;
  pledge_year: number;
  title: string;
  target_amount: string;
  amount_fulfilled: string;
  amount_remaining: string;
  status: string;
  notes: string;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getTreasuryChurchPledges(params?: {
  status?: 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'ALL';
  pledge_year?: number;
}): Promise<TreasuryChurchPledgeRow[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') {
    sp.set('status', params.status);
  }
  if (params?.pledge_year !== undefined && Number.isFinite(params.pledge_year)) {
    sp.set('pledge_year', String(params.pledge_year));
  }
  const q = sp.toString();
  /** Django routes use a trailing slash; without it GET returns 404 (no redirect). */
  const url = q ? `${base}/treasury/pledges/?${q}` : `${base}/treasury/pledges/`;
  const raw = await fetchAuth<unknown>(url);
  return normalizeListResponse<TreasuryChurchPledgeRow>(raw);
}

/** POST /api/treasury/expense-transactions/ */
export async function createExpenseTransaction(body: Record<string, unknown>): Promise<unknown> {
  const base = getApiBaseUrl();
  return fetchAuth(`${base}/treasury/expense-transactions/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
