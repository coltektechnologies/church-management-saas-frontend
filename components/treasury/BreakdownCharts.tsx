'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { IncomeCategory, ExpenseCategory } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface BreakdownChartsProps {
  incomeData?: IncomeCategory[];
  expenseData?: ExpenseCategory[];
  isLoading: boolean;
}

function DonutChart({
  title,
  _totalLabel,
  data,
  isLoading,
}: {
  title: string;
  _totalLabel: string;
  data?: { name: string; value: number; color: string }[];
  isLoading: boolean;
}) {
  const total = data?.reduce((sum, d) => sum + d.value, 0) ?? 0;

  if (isLoading || !data) {
    return <div className="h-64 rounded-xl bg-muted animate-pulse" />;
  }

  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-sm font-bold text-foreground">{formatCurrency(total)}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground truncate">{item.name}</span>
              </div>
              <span className="font-medium text-foreground whitespace-nowrap ml-2">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BreakdownCharts({ incomeData, expenseData, isLoading }: BreakdownChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DonutChart
        title="💰 Income Breakdown"
        _totalLabel="Total Income"
        data={incomeData}
        isLoading={isLoading}
      />
      <DonutChart
        title="💸 Expense Breakdown"
        _totalLabel="Total Expenses"
        data={expenseData}
        isLoading={isLoading}
      />
    </div>
  );
}
