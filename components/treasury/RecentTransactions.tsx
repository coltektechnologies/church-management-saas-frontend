'use client';

import React from 'react';
import type { Transaction } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface RecentTransactionsProps {
  data?: Transaction[];
  isLoading: boolean;
}

const panel =
  'bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10';

export function RecentTransactions({ data, isLoading }: RecentTransactionsProps) {
  if (isLoading || !data) {
    return (
      <div className={`${panel} p-5 space-y-4`}>
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className={`${panel} p-5 flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          🧾 Recent Transactions
        </h3>
        <button
          type="button"
          className="text-xs font-medium text-[color:var(--accent-brand)] hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto max-h-[320px] pr-1">
        {data.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 dark:hover:bg-white/5 transition-colors group"
          >
            <span className="text-xl shrink-0">{txn.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
              <p className="text-xs text-muted-foreground">
                {txn.category} ·{' '}
                {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <span
              className={`text-sm font-semibold whitespace-nowrap ${txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
            >
              {txn.type === 'income' ? '+' : '-'}
              {formatCurrency(txn.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
