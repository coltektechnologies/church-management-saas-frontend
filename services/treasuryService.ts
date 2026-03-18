/* ──────────────────────────────────────────────────────────
   Treasury Service
   Switch USE_MOCK to false and implement the real API calls
   once the backend endpoints are ready.
   ────────────────────────────────────────────────────────── */

import {
  MOCK_SUMMARY,
  MOCK_MONTHLY_TREND,
  MOCK_TRANSACTIONS,
  MOCK_INCOME_BREAKDOWN,
  MOCK_EXPENSE_BREAKDOWN,
  MOCK_MEMBER_CONTRIBUTIONS,
  MOCK_DEPARTMENT_BUDGETS,
  MOCK_EXPENSE_REQUESTS,
} from './treasury.mock';

const USE_MOCK = true;

/* ─── Types ─── */

export type TransactionType = 'income' | 'expense';
export type PeriodFilter = 'this_week' | 'this_quarter' | 'this_year' | 'custom';

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
}

/* ─── Helpers ─── */

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/* ─── Service ─── */

export async function fetchTreasurySummary(_filters?: TreasuryFilters): Promise<TreasurySummary> {
  if (USE_MOCK) {
    await delay();
    return MOCK_SUMMARY;
  }
  throw new Error('Not implemented');
}

export async function fetchMonthlyTrend(_filters?: TreasuryFilters): Promise<MonthlyTrend[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_MONTHLY_TREND;
  }
  throw new Error('Not implemented');
}

export async function fetchRecentTransactions(_filters?: TreasuryFilters): Promise<Transaction[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_TRANSACTIONS;
  }
  throw new Error('Not implemented');
}

export async function fetchIncomeBreakdown(_filters?: TreasuryFilters): Promise<IncomeCategory[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_INCOME_BREAKDOWN;
  }
  throw new Error('Not implemented');
}

export async function fetchExpenseBreakdown(
  _filters?: TreasuryFilters
): Promise<ExpenseCategory[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_EXPENSE_BREAKDOWN;
  }
  throw new Error('Not implemented');
}

export async function fetchMemberContributions(): Promise<MemberContribution[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_MEMBER_CONTRIBUTIONS;
  }
  throw new Error('Not implemented');
}

export async function fetchDepartmentBudgets(): Promise<DepartmentBudget[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_DEPARTMENT_BUDGETS;
  }
  throw new Error('Not implemented');
}

export async function fetchPendingExpenseRequests(): Promise<ExpenseRequest[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_EXPENSE_REQUESTS;
  }
  throw new Error('Not implemented');
}
