'use client';

import React from 'react';
import type { DepartmentBudget } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface DepartmentBudgetsProps {
  data?: DepartmentBudget[];
  isLoading: boolean;
}

const panel =
  'bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10';

export function DepartmentBudgets({ data, isLoading }: DepartmentBudgetsProps) {
  if (isLoading || !data) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 w-48 rounded-xl bg-muted animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className={`${panel} p-5`}>
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        🏢 Department Budget Overview
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {data.map((dept) => {
          const utilPercent =
            dept.allocated > 0 ? Math.round((dept.utilized / dept.allocated) * 100) : 0;
          return (
            <div
              key={dept.id}
              className="min-w-[180px] max-w-[200px] shrink-0 border border-[var(--admin-border)] rounded-xl p-4 hover:shadow-md transition-shadow bg-muted/20 dark:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="size-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
              </div>

              {/* Progress bar */}
              <div className="h-[6px] bg-muted/50 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${utilPercent}%`, backgroundColor: dept.color }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium">{formatCurrency(dept.allocated)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Utilized</span>
                  <span className="font-medium">{formatCurrency(dept.utilized)}</span>
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  {utilPercent}% utilized
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
