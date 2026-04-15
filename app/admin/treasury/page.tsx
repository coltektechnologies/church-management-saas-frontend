'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SummaryCards } from '@/components/treasury/SummaryCards';
import { QuickActions } from '@/components/treasury/QuickActions';
import { IncomeExpenseChart } from '@/components/treasury/IncomeExpenseChart';
import { RecentTransactions } from '@/components/treasury/RecentTransactions';
import { BreakdownCharts } from '@/components/treasury/BreakdownCharts';
import { MemberContributions } from '@/components/treasury/MemberContributions';
import { DepartmentBudgets } from '@/components/treasury/DepartmentBudgets';
import { PendingExpenseRequests } from '@/components/treasury/PendingExpenseRequests';
import {
  useApproveExpenseRequest,
  useDepartmentBudgets,
  useExpenseBreakdown,
  useIncomeBreakdown,
  useMemberContributions,
  useMonthlyTrend,
  usePendingExpenseRequests,
  useRecentTransactions,
  useRejectExpenseRequest,
  useTreasurySummary,
} from '@/hooks/useTreasury';
import type { PeriodFilter } from '@/services/treasuryService';
import { Landmark, PlusCircle, ArrowLeft } from 'lucide-react';
import { RecordIncomeModal } from '@/components/treasury/RecordIncomeModal';
import { useRouter } from 'next/navigation';

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'This Month', value: 'this_week' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
];

function defaultCustomDates() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return [start.toISOString().slice(0, 10), today.toISOString().slice(0, 10)] as const;
}

export default function TreasuryPage() {
  const [period, setPeriod] = useState<PeriodFilter>('this_year');
  const [customFrom, setCustomFrom] = useState(defaultCustomDates()[0]);
  const [customTo, setCustomTo] = useState(defaultCustomDates()[1]);
  const [isRecordIncomeModalOpen, setIsRecordIncomeModalOpen] = useState(false);

  const filters: { period: PeriodFilter; from?: string; to?: string } = { period };
  if (period === 'custom') {
    filters.from = customFrom;
    filters.to = customTo;
  }

  const router = useRouter();
  const approveMutation = useApproveExpenseRequest();
  const rejectMutation = useRejectExpenseRequest();

  /* ─── Data hooks ─── */
  const { data: summary, isLoading: loadingSummary } = useTreasurySummary(filters);
  const { data: trend, isLoading: loadingTrend } = useMonthlyTrend(filters);
  const { data: transactions, isLoading: loadingTxns } = useRecentTransactions(filters);
  const { data: incomeBreakdown, isLoading: loadingIncome } = useIncomeBreakdown(filters);
  const { data: expenseBreakdown, isLoading: loadingExpense } = useExpenseBreakdown(filters);
  const { data: memberContribs, isLoading: loadingMembers } = useMemberContributions(filters);
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
          className={`flex items-center gap-2 ${period !== 'custom' ? 'opacity-0 w-0 overflow-hidden scale-95' : 'opacity-100 scale-100'} ease-in-out duration-500`}
        >
          <input
            title="custom from"
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-5 py-1.5 rounded-md text-[13px] font-medium border transition-all cursor-pointer bg-background text-foreground border-border hover:border-foreground/30"
          />
          <span className="text-muted-foreground">–</span>
          <input
            title="custom to"
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-5 py-1.5 rounded-md text-[13px] font-medium border transition-all cursor-pointer bg-background text-foreground border-border hover:border-foreground/30"
          />
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <SummaryCards data={summary} isLoading={loadingSummary} />

      {/* ─── Quick Actions ─── */}
      <QuickActions onRecordIncome={() => setIsRecordIncomeModalOpen(true)} />

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
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id) => rejectMutation.mutate({ id })}
          onView={() => {}}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      </div>

      <RecordIncomeModal open={isRecordIncomeModalOpen} onOpenChange={setIsRecordIncomeModalOpen} />
    </div>
  );
}
