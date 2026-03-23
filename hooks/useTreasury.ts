import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TreasuryFilters } from '@/services/treasuryService';
import {
  approveExpenseRequest,
  fetchDepartmentBudgets,
  fetchExpenseBreakdown,
  fetchIncomeBreakdown,
  fetchMemberContributions,
  fetchMonthlyTrend,
  fetchPendingExpenseRequests,
  fetchRecentTransactions,
  fetchTreasurySummary,
  rejectExpenseRequest,
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

export function useMemberContributions(filters?: TreasuryFilters) {
  return useQuery({
    queryKey: ['treasury', 'member-contributions', filters],
    queryFn: () => fetchMemberContributions(filters),
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

export function useApproveExpenseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveExpenseRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treasury', 'pending-expense-requests'] });
      qc.invalidateQueries({ queryKey: ['treasury', 'summary'] });
    },
  });
}

export function useRejectExpenseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectExpenseRequest(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treasury', 'pending-expense-requests'] });
      qc.invalidateQueries({ queryKey: ['treasury', 'summary'] });
    },
  });
}
