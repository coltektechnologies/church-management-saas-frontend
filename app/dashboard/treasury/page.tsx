'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SummaryCards } from '@/components/treasury/SummaryCards';
import { QuickActions } from '@/components/treasury/QuickActions';
import { IncomeExpenseChart } from '@/components/treasury/IncomeExpenseChart';
import { RecentTransactions } from '@/components/treasury/RecentTransactions';
import { BreakdownCharts } from '@/components/treasury/BreakdownCharts';
import { MemberContributions } from '@/components/treasury/MemberContributions';
import { DepartmentBudgets } from '@/components/treasury/DepartmentBudgets';
import { PendingExpenseRequests } from '@/components/treasury/PendingExpenseRequests';
import {
  useTreasurySummary,
  useMonthlyTrend,
  useRecentTransactions,
  useIncomeBreakdown,
  useExpenseBreakdown,
  useMemberContributions,
  useDepartmentBudgets,
  usePendingExpenseRequests,
} from '@/hooks/useTreasury';
import type { PeriodFilter } from '@/services/treasuryService';
import { FileText, PlusCircle } from 'lucide-react';

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'This Week', value: 'this_week' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
];

export default function TreasuryPage() {
  const [period, setPeriod] = useState<PeriodFilter>('this_year');
  const filters = { period };

  /* ─── Data hooks ─── */
  const { data: summary, isLoading: loadingSummary } = useTreasurySummary(filters);
  const { data: trend, isLoading: loadingTrend } = useMonthlyTrend(filters);
  const { data: transactions, isLoading: loadingTxns } = useRecentTransactions(filters);
  const { data: incomeBreakdown, isLoading: loadingIncome } = useIncomeBreakdown(filters);
  const { data: expenseBreakdown, isLoading: loadingExpense } = useExpenseBreakdown(filters);
  const { data: memberContribs, isLoading: loadingMembers } = useMemberContributions();
  const { data: deptBudgets, isLoading: loadingBudgets } = useDepartmentBudgets();
  const { data: expenseRequests, isLoading: loadingRequests } = usePendingExpenseRequests();

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#083344] dark:text-gray-100 tracking-tight flex items-center gap-2">
            💰 Treasury Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Financial overview and transparency for Seventh Day Adventist Church
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white gap-2 cursor-pointer">
            <FileText className="size-4" /> Generate Report
          </Button>
          <Button variant="default" className="gap-2 cursor-pointer">
            <PlusCircle className="size-4" /> Create Budget
          </Button>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = '/dashboard')}
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <span className="mr-2">◄</span> Back to Dashboard
          </Button>
        </div>
      </div>

      {/* ─── Period Selector ─── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-1">Period:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              period === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs h-7 px-4 ml-1 cursor-pointer"
        >
          Apply Filter
        </Button>
      </div>

      {/* ─── Summary Cards ─── */}
      <SummaryCards data={summary} isLoading={loadingSummary} />

      {/* ─── Quick Actions ─── */}
      <QuickActions />

      {/* ─── Financial Overview Tab ─── */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">📊 Financial Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Chart + Recent Transactions row */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
            <IncomeExpenseChart data={trend} isLoading={loadingTrend} />
            <RecentTransactions data={transactions} isLoading={loadingTxns} />
          </div>

          {/* Breakdown Donut Charts */}
          <BreakdownCharts
            incomeData={incomeBreakdown}
            expenseData={expenseBreakdown}
            isLoading={loadingIncome || loadingExpense}
          />

          {/* Member Contributions */}
          <MemberContributions data={memberContribs} isLoading={loadingMembers} />

          {/* Department Budget Overview */}
          <DepartmentBudgets data={deptBudgets} isLoading={loadingBudgets} />

          {/* Pending Expense Requests */}
          <PendingExpenseRequests
            data={expenseRequests}
            isLoading={loadingRequests}
            onApprove={(id) => console.log('Approve', id)}
            onReject={(id) => console.log('Reject', id)}
            onView={(id) => console.log('View', id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
