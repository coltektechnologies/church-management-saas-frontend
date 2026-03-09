'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Eye, X } from 'lucide-react';
import type { ExpenseRequest } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface PendingExpenseRequestsProps {
  data?: ExpenseRequest[];
  isLoading: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function PendingExpenseRequests({
  data,
  isLoading,
  onApprove,
  onReject,
  onView,
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
    <div className="bg-card border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        ⏳ Pending Expense Requests
      </h3>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {data.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{req.title}</p>
                <span className="text-red-500 font-bold text-sm">{formatCurrency(req.amount)}</span>
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
                variant="outline"
                className="h-7 px-2.5 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 cursor-pointer"
                onClick={() => onApprove?.(req.id)}
              >
                <Check className="size-3 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 cursor-pointer"
                onClick={() => onView?.(req.id)}
              >
                <Eye className="size-3 mr-1" /> View
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 cursor-pointer"
                onClick={() => onReject?.(req.id)}
              >
                <X className="size-3 mr-1" /> Reject
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
