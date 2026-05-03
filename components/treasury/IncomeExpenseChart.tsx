'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyTrend } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface IncomeExpenseChartProps {
  data?: MonthlyTrend[];
  isLoading: boolean;
}

const panel =
  'bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10';

export function IncomeExpenseChart({ data, isLoading }: IncomeExpenseChartProps) {
  if (isLoading || !data) {
    return <div className={`h-[300px] w-full rounded-xl ${panel} animate-pulse opacity-80`} />;
  }

  return (
    <div className={`${panel} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          📊 Income vs Expenses Trend
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }}
            stroke="var(--admin-border)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--admin-text-muted)' }}
            stroke="var(--admin-border)"
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--admin-surface)',
              borderColor: 'var(--admin-border)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--admin-text)',
            }}
            formatter={(value) => formatCurrency(value as number)}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ color: 'var(--admin-text)' }}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#incomeGrad)"
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#expenseGrad)"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
