/* ──────────────────────────────────────────────────────────
   Treasury Service
   Wired to backend API. Uses lib/treasuryApi.ts.
   ────────────────────────────────────────────────────────── */

import * as treasuryApi from '@/lib/treasuryApi';

/* ─── Types (re-exported for consumers) ─── */
export type TransactionType = 'income' | 'expense';
export type PeriodFilter = 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'custom';

export interface TreasurySummary {
  totalIncome: number;
  netBalance: number;
  totalExpenses: number;
  totalIncomeAllTime: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  totalIncomeAllTimeChangePercent?: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  icon: string;
}

export interface IncomeCategory {
  name: string;
  value: number;
  color: string;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

export interface ContributionEntry {
  date: string;
  amount: number;
  type: string;
}

export interface MemberContribution {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalAmount: number;
  lastDate: string;
  contributions: ContributionEntry[];
}

export interface DepartmentBudget {
  id: string;
  name: string;
  allocated: number;
  utilized: number;
  color: string;
}

export type ExpenseRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ExpenseRequest {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  date: string;
  amount: number;
  status: ExpenseRequestStatus;
}

export interface TreasuryFilters {
  period?: PeriodFilter;
  from?: string;
  to?: string;
  /** Overrides default 15 for member-contributions list (e.g. members-finance page). */
  contributorsLimit?: number;
}

/* ─── Period to date range ─── */

const MONTH_ABBREV: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
};

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function periodToDateRange(filters?: TreasuryFilters): {
  start_date?: string;
  end_date?: string;
  date_from?: string;
  date_to?: string;
} {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  if (filters?.from && filters?.to) {
    return {
      start_date: filters.from,
      end_date: filters.to,
      date_from: filters.from,
      date_to: filters.to,
    };
  }

  switch (filters?.period) {
    case 'this_week': {
      // Monday → today (local time)
      const day = today.getDay(); // 0 Sun, 1 Mon...
      const diffToMonday = (day + 6) % 7;
      const weekStart = new Date(y, m, today.getDate() - diffToMonday);
      return {
        start_date: toLocalDateString(weekStart),
        end_date: toLocalDateString(today),
        date_from: toLocalDateString(weekStart),
        date_to: toLocalDateString(today),
      };
    }
    case 'this_month': {
      const monthStart = new Date(y, m, 1);
      return {
        start_date: toLocalDateString(monthStart),
        end_date: toLocalDateString(today),
        date_from: toLocalDateString(monthStart),
        date_to: toLocalDateString(today),
      };
    }
    case 'this_quarter': {
      const q = Math.floor(m / 3) + 1;
      const qStart = new Date(y, (q - 1) * 3, 1);
      return {
        start_date: toLocalDateString(qStart),
        end_date: toLocalDateString(today),
        date_from: toLocalDateString(qStart),
        date_to: toLocalDateString(today),
      };
    }
    case 'this_year': {
      const yearStart = new Date(y, 0, 1);
      return {
        start_date: toLocalDateString(yearStart),
        end_date: toLocalDateString(today),
        date_from: toLocalDateString(yearStart),
        date_to: toLocalDateString(today),
      };
    }
    default:
      return {};
  }
}

export function periodDaysForTrends(period?: PeriodFilter): number {
  switch (period) {
    case 'this_week':
      return 7;
    case 'this_month':
      return 31;
    case 'this_quarter':
      return 92;
    case 'this_year':
      return 365;
    default:
      return 365;
  }
}

/* ─── Color palette for charts ─── */

const INCOME_COLORS = ['#31C48D', '#0E9F6E', '#84E1BC', '#046C4E', '#0284C7'];
const EXPENSE_COLORS = ['#F05252', '#E3A008', '#FF8A4C', '#9061F9', '#E74694', '#A51D2D'];
const DEPT_COLORS = [
  '#10b981',
  '#ff8a4c',
  '#f59e0b',
  '#a855f7',
  '#3b82f6',
  '#ec4899',
  '#10b981',
  '#10b981',
];

/* ─── Helpers ─── */

export function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function parseFloatSafe(v: string | number | null | undefined): number {
  if (v === null || v === undefined) {
    return 0;
  }
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ─── Service ─── */

export async function fetchTreasurySummary(filters?: TreasuryFilters): Promise<TreasurySummary> {
  const range = periodToDateRange(filters);
  const [curr, prev] = await Promise.all([
    treasuryApi.getTreasuryStatistics({ start_date: range.start_date, end_date: range.end_date }),
    (async () => {
      if (!range.start_date || !range.end_date) {
        return null;
      }
      const start = new Date(range.start_date);
      const end = new Date(range.end_date);
      const diff = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - diff);
      return treasuryApi.getTreasuryStatistics({
        start_date: toLocalDateString(prevStart),
        end_date: toLocalDateString(prevEnd),
      });
    })(),
  ]);

  if (!curr) {
    return {
      totalIncome: 0,
      netBalance: 0,
      totalExpenses: 0,
      totalIncomeAllTime: 0,
      incomeChangePercent: 0,
      expenseChangePercent: 0,
    };
  }

  const totalIncome = parseFloatSafe(curr.total_income);
  const totalExpenses = parseFloatSafe(curr.total_expenses);
  const netBalance = totalIncome - totalExpenses;

  let incomeChangePercent = 0;
  let expenseChangePercent = 0;
  if (prev) {
    const prevIncome = parseFloatSafe(prev.total_income);
    const prevExpenses = parseFloatSafe(prev.total_expenses);
    if (prevIncome > 0) {
      incomeChangePercent = Math.round(((totalIncome - prevIncome) / prevIncome) * 1000) / 10;
    }
    if (prevExpenses > 0) {
      expenseChangePercent =
        Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 1000) / 10;
    }
  }

  return {
    totalIncome,
    netBalance,
    totalExpenses,
    totalIncomeAllTime: totalIncome,
    incomeChangePercent,
    expenseChangePercent,
    totalIncomeAllTimeChangePercent: incomeChangePercent,
  };
}

export async function fetchMonthlyTrend(filters?: TreasuryFilters): Promise<MonthlyTrend[]> {
  const days = periodDaysForTrends(filters?.period);
  const res = await treasuryApi.getFinanceTrends(days);
  if (!res) {
    return [];
  }

  const incomeMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();
  for (const r of res.income_by_month ?? []) {
    const key = r.month ?? '';
    if (key) {
      incomeMap.set(key, parseFloatSafe(r.total));
    }
  }
  for (const r of res.expenses_by_month ?? []) {
    const key = r.month ?? '';
    if (key) {
      expenseMap.set(key, parseFloatSafe(r.total));
    }
  }

  const months = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
  return [...months]
    .filter(Boolean)
    .sort()
    .map((month) => {
      const parts = month.split('-');
      const mon = parts[1];
      const yrPart = parts[0];
      const label =
        parts.length >= 2
          ? `${(mon && MONTH_ABBREV[mon]) ?? mon ?? ''} ${(yrPart ?? '').slice(2)}`
          : month;
      return {
        month: label,
        income: incomeMap.get(month) ?? 0,
        expenses: expenseMap.get(month) ?? 0,
      };
    });
}

export async function fetchRecentTransactions(filters?: TreasuryFilters): Promise<Transaction[]> {
  const range = periodToDateRange(filters);
  const [inc, exp] = await Promise.all([
    treasuryApi.getIncomeTransactions({
      start_date: range.start_date,
      end_date: range.end_date,
      page_size: 50,
    }),
    treasuryApi.getExpenseTransactions({
      start_date: range.start_date,
      end_date: range.end_date,
      page_size: 50,
    }),
  ]);

  const combined: Transaction[] = [
    ...inc.map((t) => ({
      id: t.id,
      description: t.contributor_display ?? t.receipt_number ?? 'Income',
      type: 'income' as const,
      amount: parseFloatSafe(t.amount),
      date: t.transaction_date,
      category: t.category_name ?? 'Income',
      icon: '↓',
    })),
    ...exp.map((t) => ({
      id: t.id,
      description: String(t.paid_to ?? t.description ?? t.voucher_number ?? 'Expense'),
      type: 'expense' as const,
      amount: parseFloatSafe(t.amount),
      date: t.transaction_date,
      category: t.category_name ?? t.department_name ?? 'Expense',
      icon: '↑',
    })),
  ];

  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return combined.slice(0, 20);
}

export async function fetchIncomeBreakdown(filters?: TreasuryFilters): Promise<IncomeCategory[]> {
  const range = periodToDateRange(filters);
  const res = await treasuryApi.getTreasuryStatistics({
    start_date: range.start_date,
    end_date: range.end_date,
  });
  if (!res?.income_by_category?.length) {
    return [];
  }

  return res.income_by_category
    .map((r, i) => ({
      name: r.category__name ?? 'Other',
      value: parseFloatSafe(r.total),
      color: INCOME_COLORS[i % INCOME_COLORS.length] ?? INCOME_COLORS[0] ?? '#31C48D',
    }))
    .filter((c) => c.value > 0);
}

export async function fetchExpenseBreakdown(filters?: TreasuryFilters): Promise<ExpenseCategory[]> {
  const range = periodToDateRange(filters);
  const res = await treasuryApi.getTreasuryStatistics({
    start_date: range.start_date,
    end_date: range.end_date,
  });
  if (!res?.expenses_by_category?.length) {
    return [];
  }

  return res.expenses_by_category
    .map((r, i) => ({
      name: r.category__name ?? 'Other',
      value: parseFloatSafe(r.total),
      color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] ?? EXPENSE_COLORS[0] ?? '#F05252',
    }))
    .filter((c) => c.value > 0);
}

export async function fetchMemberContributions(
  filters?: TreasuryFilters
): Promise<MemberContribution[]> {
  const range = periodToDateRange(filters);
  const res = await treasuryApi.getMemberContributions({
    limit: filters?.contributorsLimit ?? 15,
    date_from: range.date_from ?? range.start_date,
    date_to: range.date_to ?? range.end_date,
  });
  const rows = res.contributors ?? [];
  if (!rows.length) {
    return [];
  }

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar ?? '',
    phone: c.phone ?? '',
    status: (c.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
    totalAmount: Number(c.total_amount) ?? 0,
    lastDate: c.last_date ?? '',
    contributions: c.contributions ?? [],
  }));
}

export async function fetchDepartmentBudgets(fiscalYear?: number): Promise<DepartmentBudget[]> {
  const res = await treasuryApi.getDepartmentBudgets(fiscalYear);
  if (!res?.departments?.length) {
    return [];
  }

  return res.departments.map((d, i) => ({
    id: d.id,
    name: d.name,
    allocated: Number(d.allocated) ?? 0,
    utilized: Number(d.utilized) ?? 0,
    color: DEPT_COLORS[i % DEPT_COLORS.length] ?? DEPT_COLORS[0] ?? '#10b981',
  }));
}

const PENDING_STATUSES = new Set([
  'SUBMITTED',
  'DEPT_HEAD_APPROVED',
  'FIRST_ELDER_APPROVED',
  'TREASURER_APPROVED',
  'APPROVED',
]);

export async function fetchPendingExpenseRequests(): Promise<ExpenseRequest[]> {
  let items: Awaited<ReturnType<typeof treasuryApi.getExpenseRequests>>;
  try {
    items = await treasuryApi.getExpenseRequests({ page_size: 100 });
  } catch {
    return [];
  }
  return items
    .filter((r) => PENDING_STATUSES.has(r.status))
    .map((r) => ({
      id: r.id,
      title: r.purpose ?? r.request_number ?? 'Expense Request',
      department: r.department_name ?? '',
      requestedBy: r.requested_by_name ?? 'Unknown',
      date: r.required_by_date ?? r.created_at ?? '',
      amount: parseFloatSafe(r.amount_requested),
      status: 'pending' as const,
    }));
}

export async function approveExpenseRequest(id: string): Promise<void> {
  const req = await treasuryApi.getExpenseRequest(id);
  if (!req) {
    throw new Error('Request not found');
  }

  if (req.status === 'SUBMITTED') {
    await treasuryApi.approveExpenseRequestDeptHead(id);
  } else if (req.status === 'DEPT_HEAD_APPROVED') {
    await treasuryApi.approveExpenseRequestFirstElder(id);
  } else if (req.status === 'FIRST_ELDER_APPROVED') {
    await treasuryApi.approveExpenseRequestTreasurer(id);
  } else {
    throw new Error(`Cannot approve request in status: ${req.status}`);
  }
}

export async function rejectExpenseRequest(id: string, reason?: string): Promise<void> {
  await treasuryApi.rejectExpenseRequest(id, { reason });
}
