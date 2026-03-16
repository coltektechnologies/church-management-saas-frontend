'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { Landmark, FileText, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'This Month', value: 'this_week' }, // we keep the value to avoid breaking existing hooks, but change label to This Month
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
];

export default function TreasuryPage() {
  const [period, setPeriod] = useState<PeriodFilter>('this_year');
  const filters = { period };
  const router = useRouter();

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
      {/* ─── Top Right Actions (Back Button) ─── */}
      <div className="flex justify-end w-full">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="text-foreground hover:text-foreground/80 hidden sm:flex font-medium text-sm"
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
        </Button>
      </div>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#083344] dark:text-gray-100 tracking-tight flex items-center gap-2">
            <Landmark className="size-8 text-[#083344] dark:text-gray-100" /> Treasury Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Financial overview and management for Seventh-day Adventist Church
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button className="bg-[#10b981] hover:bg-[#10b981]/90 text-white gap-2 cursor-pointer font-medium rounded-md px-6 shadow-sm">
            <PlusCircle className="size-4" /> Generate Report
          </Button>
          <Button
            variant="default"
            className="bg-[#082f49] hover:bg-[#082f49]/90 text-white gap-2 cursor-pointer font-medium rounded-md px-6 shadow-sm"
          >
            <PlusCircle className="size-4" /> Create Budget
          </Button>
        </div>
      </div>

      {/* ─── Period Selector ─── */}
      <div className="flex flex-wrap items-center gap-2 transition-all duration-500 ">
        <span className="text-sm font-bold text-foreground mr-1">Period:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-5 py-1.5 rounded-md text-[13px] font-medium border transition-all cursor-pointer ${
              period === opt.value
                ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                : 'bg-background text-foreground border-border hover:border-foreground/30'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <div
          className={`${period !== 'custom' ? 'opacity-0 w-0 overflow-hidden scale-95' : 'opacity-100 scale-100'} ease-in-out duration-500  `}
        >
          <input
            placeholder="_"
            type="date"
            className={`px-5 py-1.5 rounded-md text-[13px] font-medium border transition-all cursor-pointer bg-background text-foreground border-border hover:border-foreground/30`}
          />
          <span>-</span>
          <input
            placeholder="_"
            type="date"
            className={`px-5 py-1.5 rounded-md text-[13px] font-medium border transition-all cursor-pointer bg-background text-foreground border-border hover:border-foreground/30`}
          />
        </div>

        <Button
          size="sm"
          className="rounded-md text-[13px] font-medium transition-all duration-150 h-8 px-5 ml-1 cursor-pointer bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none"
        >
          Apply Filter
        </Button>
      </div>

      {/* ─── Summary Cards ─── */}
      <SummaryCards data={summary} isLoading={loadingSummary} />

      {/* ─── Quick Actions ─── */}
      <QuickActions />

      {/* ─── Financial Overview Tab ─── */}
      <div className="space-y-6 mt-4">
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
          // eslint-disable-next-line no-console
          onApprove={(id) => console.log('Approve', id)}
          // eslint-disable-next-line no-console
          onReject={(id) => console.log('Reject', id)}
          // eslint-disable-next-line no-console
          onView={(id) => console.log('View', id)}
        />
      </div>
    </div>
  );
}
