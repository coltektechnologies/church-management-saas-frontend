'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { ExpenseRequest } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

const panel =
  'bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10';

interface PendingExpenseRequestsProps {
  data?: ExpenseRequest[];
  isLoading: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function PendingExpenseRequests({
  data,
  isLoading,
  onApprove,
  onReject,
  onView,
  isApproving = false,
  isRejecting = false,
}: PendingExpenseRequestsProps) {
  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`${panel} p-5`}>
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        ⏳ Pending Expense Requests
      </h3>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {data.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[var(--admin-border)] hover:bg-muted/30 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{req.title}</p>
                <span className="text-red-500 dark:text-red-400 font-bold text-sm">
                  {formatCurrency(req.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req.department} · Requested by {req.requestedBy} ·{' '}
                {new Date(req.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[10px] text-muted-foreground">ID: {req.id}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                disabled={isApproving || isRejecting}
                className="h-7 px-3 text-[11px] font-medium bg-[#10b981] hover:bg-[#10b981]/90 text-white cursor-pointer rounded disabled:opacity-60"
                onClick={() => onApprove?.(req.id)}
              >
                {isApproving ? '...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                disabled={isApproving || isRejecting}
                className="h-7 px-3 text-[11px] font-medium bg-slate-500 hover:bg-slate-500/90 dark:bg-slate-600 dark:hover:bg-slate-600/90 text-white cursor-pointer rounded disabled:opacity-60"
                onClick={() => onView?.(req.id)}
              >
                View
              </Button>
              <Button
                size="sm"
                disabled={isApproving || isRejecting}
                className="h-7 px-3 text-[11px] font-medium bg-[#ef4444] hover:bg-[#ef4444]/90 text-white cursor-pointer rounded disabled:opacity-60"
                onClick={() => onReject?.(req.id)}
              >
                {isRejecting ? '...' : 'Reject'}
              </Button>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No pending requests 🎉</p>
        )}
      </div>
    </div>
  );
}
