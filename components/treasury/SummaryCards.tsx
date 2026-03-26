'use client';

import React from 'react';
import { formatCurrency, TreasurySummary } from '@/services/treasuryService';
import { Wallet } from 'lucide-react';

interface SummaryCardsProps {
  data?: TreasurySummary;
  isLoading: boolean;
}

const cards = [
  {
    key: 'totalIncome',
    label: 'Total income (MTs)',
    icon: Wallet,
    bg: 'bg-white border-l-4 border-l-[#10b981] shadow-sm',
    iconBg: 'bg-[#10b981]',
    textColor: 'text-foreground',
    changeKey: 'incomeChangePercent' as const,
    changeType: 'percent',
  },
  {
    key: 'netBalance',
    label: 'Net Balance',
    icon: Wallet,
    bg: 'bg-white border-l-4 border-l-[#3b82f6] shadow-sm',
    iconBg: 'bg-[#3b82f6]',
    textColor: 'text-foreground',
    changeKey: 'incomeChangePercent' as const,
    changeType: 'percent',
  },
  {
    key: 'totalExpenses',
    label: 'Total Expense (MTs)',
    icon: Wallet,
    bg: 'bg-white border-l-4 border-l-[#ef4444] shadow-sm',
    iconBg: 'bg-[#ef4444]',
    textColor: 'text-foreground',
    changeKey: 'expenseChangePercent' as const,
    changeType: 'percent',
  },
  {
    key: 'totalIncomeAllTime',
    label: 'Total income (MTs)',
    icon: Wallet,
    bg: 'bg-white border-l-4 border-l-[#f59e0b] shadow-sm',
    iconBg: 'bg-[#f59e0b]',
    textColor: 'text-foreground',
    changeKey: 'totalIncomeAllTimeChangePercent' as const,
    changeType: 'numeric',
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

        let formattedAmount = formatCurrency(amount);
        if (card.key === 'totalIncomeAllTime') {
          formattedAmount = amount.toString();
        }

        return (
          <div
            key={card.key}
            className={`${card.bg} rounded-[20px] p-5 border border-border/50 flex flex-col justify-center gap-3 transition-shadow hover:shadow-md min-h-[140px] relative`}
          >
            <div className="flex justify-between items-start">
              <div
                className={`${card.iconBg} size-[42px] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}
              >
                <card.icon className="size-5" />
              </div>

              {/* Change Indicator / Badge inside card top right equivalent area but placed below amount traditionally, adjusting to match mock layout below */}
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${card.textColor} tracking-tight`}>
                  {formattedAmount}
                </p>
                {changePercent !== null && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      changePercent >= 0
                        ? 'bg-[#10b981]/15 text-[#10b981]'
                        : 'bg-[#ef4444]/15 text-[#ef4444]'
                    }`}
                  >
                    {changePercent > 0 ? '+' : ''}
                    {changePercent} {card.changeType === 'percent' ? '%' : ''}
                  </span>
                )}
              </div>
              <p className="text-[13px] font-medium text-muted-foreground">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
