'use client';

import React from 'react';
import { formatCurrency, TreasurySummary } from '@/services/treasuryService';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface SummaryCardsProps {
  data?: TreasurySummary;
  isLoading: boolean;
}

const cards = [
  {
    key: 'totalIncome',
    label: 'Total Income',
    subtitle: 'current income (GH₵)',
    icon: TrendingUp,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    changeKey: 'incomeChangePercent' as const,
    positive: true,
  },
  {
    key: 'netBalance',
    label: 'Net Balance',
    subtitle: 'net balance',
    icon: Wallet,
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    changeKey: null,
    positive: true,
  },
  {
    key: 'totalExpenses',
    label: 'Total Expenses',
    subtitle: 'total expenses (GH₵)',
    icon: TrendingDown,
    bg: 'bg-red-50 dark:bg-red-950/30',
    iconBg: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-400',
    changeKey: 'expenseChangePercent' as const,
    positive: false,
  },
  {
    key: 'totalIncomeAllTime',
    label: 'Total Income (Total)',
    subtitle: 'total income (total)',
    icon: DollarSign,
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    iconBg: 'bg-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    changeKey: null,
    positive: true,
  },
] as const;

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const amount = data[card.key as keyof TreasurySummary] as number;
        const changePercent = card.changeKey ? (data[card.changeKey] as number) : null;

        return (
          <div
            key={card.key}
            className={`${card.bg} rounded-xl p-4 border border-border/50 flex items-center gap-4 transition-shadow hover:shadow-md`}
          >
            <div
              className={`${card.iconBg} size-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}
            >
              <card.icon className="size-6" />
            </div>
            <div className="min-w-0">
              <p className={`text-xl font-bold ${card.textColor} truncate`}>
                {formatCurrency(amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{card.subtitle}</p>
              {changePercent !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {changePercent >= 0 ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {Math.abs(changePercent)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
