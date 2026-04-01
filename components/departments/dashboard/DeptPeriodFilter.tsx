'use client';

import { useState } from 'react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

export type Period = 'this_month' | 'this_quarter' | 'this_year' | 'custom';

interface Props {
  period?: Period;
  onPeriodChange?: (p: Period) => void;
  onApply?: () => void;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'this_quarter', label: 'This Quarter' },
  { key: 'this_year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

export default function DeptPeriodFilter({
  period = 'this_month',
  onPeriodChange,
  onApply,
}: Props) {
  const [selected, setSelected] = useState<Period>(period);
  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const primaryColor = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const select = (k: Period) => {
    setSelected(k);
    onPeriodChange?.(k);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold text-muted-foreground">Period</span>
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(({ key, label }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              className="px-4 py-2 text-xs font-bold rounded-xl border transition-all"
              style={
                active
                  ? {
                      backgroundColor: accentColor,
                      color: '#FFFFFF',
                      borderColor: accentColor,
                      boxShadow: `0 2px 8px ${accentColor}40`,
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onApply}
        className="px-5 py-2 text-xs font-bold rounded-xl text-white transition-all active:scale-95"
        style={{ backgroundColor: primaryColor, boxShadow: `0 2px 8px ${primaryColor}30` }}
      >
        Apply Filter
      </button>
    </div>
  );
}
