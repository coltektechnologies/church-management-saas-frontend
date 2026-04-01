'use client';

import { Wallet } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

interface BudgetStatusProps {
  allocated?: number;
  spent?: number;
  onDetails?: () => void;
}

export default function DeptBudgetStatus({
  allocated = 8000,
  spent = 3750,
  onDetails,
}: BudgetStatusProps) {
  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';
  const currency = isReady ? profile.currency || 'GHS' : 'GHS';

  const remaining = allocated - spent;
  const pctUsed = Math.round((spent / allocated) * 100);
  const currencySymbol =
    currency === 'GHS' ? 'GHS' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  // Colour the bar: green < 60%, amber 60–85%, red > 85%
  const barColor = pctUsed < 60 ? accentColor : pctUsed < 85 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet size={18} style={{ color: accentColor }} />
          <h3 className="text-base font-black text-foreground">Budget Status</h3>
        </div>
        <button
          onClick={onDetails}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted/30 transition-colors"
        >
          Details
        </button>
      </div>

      {/* Allocated vs Spent row */}
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Allocated</p>
          <p className="font-black text-foreground">
            {currencySymbol}
            {allocated.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium">Spent</p>
          <p className="font-black text-foreground">
            {currencySymbol}
            {spent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pctUsed}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-muted-foreground font-medium">
            Remaining:{' '}
            <span className="font-bold text-foreground">
              {currencySymbol}
              {remaining.toLocaleString()}
            </span>
          </span>
          <span className="font-bold" style={{ color: barColor }}>
            {pctUsed}% used
          </span>
        </div>
      </div>

      {/* Details button */}
      <button
        onClick={onDetails}
        className="w-full py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-muted/30 transition-colors"
      >
        Details
      </button>
    </div>
  );
}
