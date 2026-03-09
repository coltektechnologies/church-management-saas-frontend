'use client';

import React from 'react';
import type { DepartmentBudget } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface DepartmentBudgetsProps {
  data?: DepartmentBudget[];
  isLoading: boolean;
}

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
    <div className="bg-card border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        🏢 Department Budget Overview
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {data.map((dept) => {
          const utilPercent = Math.round((dept.utilized / dept.allocated) * 100);
          return (
            <div
              key={dept.id}
              className="min-w-[180px] max-w-[200px] shrink-0 border rounded-xl p-4 hover:shadow-md transition-shadow bg-background"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="size-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
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
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Utilized</span>
                  <span className="font-medium">{formatCurrency(dept.utilized)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-right">
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
