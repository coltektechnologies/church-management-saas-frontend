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
                className="h-7 px-3 text-[11px] font-medium bg-[#10b981] hover:bg-[#10b981]/90 text-white cursor-pointer rounded"
                onClick={() => onApprove?.(req.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                className="h-7 px-3 text-[11px] font-medium bg-[#9ca3af] hover:bg-[#9ca3af]/90 text-white cursor-pointer rounded"
                onClick={() => onView?.(req.id)}
              >
                View
              </Button>
              <Button
                size="sm"
                className="h-7 px-3 text-[11px] font-medium bg-[#ef4444] hover:bg-[#ef4444]/90 text-white cursor-pointer rounded"
                onClick={() => onReject?.(req.id)}
              >
                Reject
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
