'use client';

import dynamic from 'next/dynamic';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import WelcomeHeader from '@/components/treasurydashboard/dashboard/WelcomeHeader';
import KPICard from '@/components/treasurydashboard/dashboard/KPICard';
import {
  useIncomeBreakdown,
  useMemberContributions,
  useMonthlyTrend,
  useRecentTransactions,
  useTreasurySummary,
} from '@/hooks/useTreasury';
import { formatCurrency } from '@/services/treasuryService';

const TreasuryMonthlyTrendApi = dynamic(
  () => import('@/components/treasurydashboard/dashboard/TreasuryMonthlyTrendApi'),
  { ssr: false, loading: () => <ChartSkeleton height={340} /> }
);
const ThisMonthCard = dynamic(
  () => import('@/components/treasurydashboard/dashboard/ThisMonthCard'),
  { ssr: false, loading: () => <ChartSkeleton height={340} /> }
);
const IncomeExpenseChart = dynamic(
  () => import('@/components/treasurydashboard/dashboard/IncomeExpenseChart'),
  { ssr: false, loading: () => <ChartSkeleton height={400} /> }
);
const RecentTransactions = dynamic(
  () => import('@/components/treasurydashboard/dashboard/RecentTransactions'),
  { ssr: false, loading: () => <ChartSkeleton height={400} /> }
);

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: '16px',
        background:
          'linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

function autoText(hex: string): string {
  const h = (hex || '#ffffff').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

function IncomeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function BalanceIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
function ExpenseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}
function MembersIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function formatPct(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) {
    return '—';
  }
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export default function TreasuryDashboard() {
  const { profile, isReady } = useTreasuryProfile();

  /** Match admin treasury: `this_week` maps to month-start → today (MTD-style range in service). */
  const filters = { period: 'this_week' as const };

  const { data: summary, isLoading: loadingSummary } = useTreasurySummary(filters);
  const { data: monthlyTrend = [], isLoading: loadingTrend } = useMonthlyTrend(filters);
  const { data: recentTx = [], isLoading: loadingTx } = useRecentTransactions(filters);
  const { data: incomeBreakdown = [] } = useIncomeBreakdown(filters);
  const { data: members = [], isLoading: loadingMembers } = useMemberContributions(filters);

  const isDark = isReady ? profile.darkMode : false;
  const bgColor = isDark ? profile.darkBackgroundColor || '#0A1628' : '#F5F7FA';
  const textColor = autoText(bgColor);
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const cardBg = isDark ? profile.darkSidebarColor || '#0D1F36' : '#FFFFFF';

  const kpiList = [
    {
      title: 'Total Income (MTD)',
      value: loadingSummary ? '…' : formatCurrency(summary?.totalIncome ?? 0),
      badge: loadingSummary ? '…' : formatPct(summary?.incomeChangePercent),
      badgePositive: (summary?.incomeChangePercent ?? 0) >= 0,
      icon: <IncomeIcon />,
    },
    {
      title: 'Net Balance',
      value: loadingSummary ? '…' : formatCurrency(summary?.netBalance ?? 0),
      badge: loadingSummary ? '…' : formatPct(summary?.incomeChangePercent),
      badgePositive: (summary?.netBalance ?? 0) >= 0,
      icon: <BalanceIcon />,
    },
    {
      title: 'Total Expenses (MTD)',
      value: loadingSummary ? '…' : formatCurrency(summary?.totalExpenses ?? 0),
      badge: loadingSummary ? '…' : formatPct(summary?.expenseChangePercent),
      badgePositive: (summary?.expenseChangePercent ?? 0) <= 0,
      icon: <ExpenseIcon />,
    },
    {
      title: 'Contributors (period)',
      value: loadingMembers ? '…' : String(members.length),
      badge: members.length ? `${members.length} profiles` : '—',
      badgePositive: true,
      icon: <MembersIcon />,
    },
  ];

  const iecFromTrend = monthlyTrend.map((t) => ({
    month: t.month,
    income: t.income,
    expense: t.expenses,
  }));

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        .td-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 10px 0;
        }

        /* KPI grid: 4 equal columns on wide, 2 on medium, 1 on narrow */
        .td-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        /* Row 1 — MonthlyTrend (~65%) | ThisMonth (~35%) */
        .td-row {
          display: grid;
          gap: 20px;
          align-items: stretch;
        }
        .td-row-top {
          grid-template-columns: 1.85fr 1fr;
        }

        /* Row 2 — IncomeExpense (~60%) | RecentTransactions (~40%) */
        .td-row-bottom {
          grid-template-columns: 1.5fr 1fr;
        }

        @media (max-width: 1100px) {
          .td-kpi-grid       { grid-template-columns: repeat(2, 1fr); }
          .td-row-top,
          .td-row-bottom     { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .td-kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="td-container">
        {/* Welcome Header */}
        <WelcomeHeader />

        {/* KPI Cards */}
        <div className="td-kpi-grid">
          {kpiList.map((kpi, i) => (
            <KPICard
              key={i}
              index={i}
              {...kpi}
              accentColor={accentColor}
              textColor={textColor}
              cardBg={cardBg}
            />
          ))}
        </div>

        {/* Row 1: Monthly trend (API) + This month snapshot from income breakdown */}
        <div className="td-row td-row-top">
          <TreasuryMonthlyTrendApi data={monthlyTrend} isLoading={loadingTrend} />
          <ThisMonthCard
            incomeBreakdown={incomeBreakdown}
            monthlyTrend={monthlyTrend}
            isLoading={loadingSummary}
          />
        </div>

        {/* Row 2: Income vs Expense Chart + Recent Transactions */}
        <div className="td-row td-row-bottom">
          <IncomeExpenseChart apiMonthlySeries={iecFromTrend} isLoadingApi={loadingTrend} />
          <RecentTransactions apiTransactions={recentTx} isLoadingApi={loadingTx} />
        </div>
      </div>
    </>
  );
}
