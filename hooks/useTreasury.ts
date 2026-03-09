import { useQuery } from '@tanstack/react-query';
import type { TreasuryFilters } from '@/services/treasuryService';
import {
  fetchTreasurySummary,
  fetchMonthlyTrend,
  fetchRecentTransactions,
  fetchIncomeBreakdown,
  fetchExpenseBreakdown,
  fetchMemberContributions,
  fetchDepartmentBudgets,
  fetchPendingExpenseRequests,
} from '@/services/treasuryService';

export function useTreasurySummary(filters?: TreasuryFilters) {
  return useQuery({
    queryKey: ['treasury', 'summary', filters],
    queryFn: () => fetchTreasurySummary(filters),
  });
}

export function useMonthlyTrend(filters?: TreasuryFilters) {
  return useQuery({
    queryKey: ['treasury', 'monthly-trend', filters],
    queryFn: () => fetchMonthlyTrend(filters),
  });
}

export function useRecentTransactions(filters?: TreasuryFilters) {
  return useQuery({
    queryKey: ['treasury', 'recent-transactions', filters],
    queryFn: () => fetchRecentTransactions(filters),
  });
}

export function useIncomeBreakdown(filters?: TreasuryFilters) {
  return useQuery({
    queryKey: ['treasury', 'income-breakdown', filters],
    queryFn: () => fetchIncomeBreakdown(filters),
  });
}

export function useExpenseBreakdown(filters?: TreasuryFilters) {
  return useQuery({
    queryKey: ['treasury', 'expense-breakdown', filters],
    queryFn: () => fetchExpenseBreakdown(filters),
  });
}

export function useMemberContributions() {
  return useQuery({
    queryKey: ['treasury', 'member-contributions'],
    queryFn: fetchMemberContributions,
  });
}

export function useDepartmentBudgets() {
  return useQuery({
    queryKey: ['treasury', 'department-budgets'],
    queryFn: fetchDepartmentBudgets,
  });
}

export function usePendingExpenseRequests() {
  return useQuery({
    queryKey: ['treasury', 'pending-expense-requests'],
    queryFn: fetchPendingExpenseRequests,
  });
}
