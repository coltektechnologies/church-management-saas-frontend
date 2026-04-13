'use client';

import { useState, useEffect, useRef } from 'react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

export type Period = 'this_month' | 'this_quarter' | 'this_year' | 'custom';

interface Props {
  /** Syncs chip highlight with the period the dashboard is actually using (e.g. default month). */
  appliedPeriod?: Period | null;
  onPeriodChange?: (p: Period | null) => void;
  onApply?: (p: Period | null, dateRange?: { from: string; to: string }) => void;
}

// Soft-coded period filter options
const PERIODS: { key: Period; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'this_quarter', label: 'This Quarter' },
  { key: 'this_year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

// Soft-coded style constants
const STYLE = {
  activeColor: '#1D72CA', // Active filter and apply button background
  activeText: '#FFFFFF', // Text on active filter
  inactiveBg: '#FFFFFF', // Inactive filter background
  inactiveBorder: '#D1D5DB', // Inactive filter border
  inactiveText: '#374151', // Inactive filter text
  containerBg: '#FFFFFF', // Outer wrapper background
  containerBorder: '#E5E7EB', // Outer wrapper border
  containerRadius: '10px', // Outer wrapper border radius
  filterRadius: '7px', // Individual filter card border radius
  applyRadius: '7px', // Apply button border radius
  activeShadow: 'rgba(29,114,202,0.25)', // Active button shadow
  inputBorder: '#D1D5DB', // Date input border
  inputText: '#111827', // Date input text
  inputBg: '#F9FAFB', // Date input background
};

export default function DeptPeriodFilter({ appliedPeriod, onPeriodChange, onApply }: Props) {
  const [selected, setSelected] = useState<Period | null>(appliedPeriod ?? null);
  const [prevAppliedPeriod, setPrevAppliedPeriod] = useState(appliedPeriod);
  if (appliedPeriod !== prevAppliedPeriod) {
    setPrevAppliedPeriod(appliedPeriod);
    if (appliedPeriod !== undefined && appliedPeriod !== null) {
      setSelected(appliedPeriod);
    }
  }

  // Custom date range state — shown only when 'custom' is selected
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  // Ref on the whole container to detect outside clicks
  const containerRef = useRef<HTMLDivElement>(null);

  const { profile, isReady } = useDepartmentProfile();
  const isDark = isReady ? profile.darkMode : false;

  // Stable ref for onPeriodChange to avoid re-registering the listener every render
  const onPeriodChangeRef = useRef(onPeriodChange);
  useEffect(() => {
    onPeriodChangeRef.current = onPeriodChange;
  }, [onPeriodChange]);

  const appliedPeriodRef = useRef(appliedPeriod);
  useEffect(() => {
    appliedPeriodRef.current = appliedPeriod;
  }, [appliedPeriod]);

  // Click-outside: reset chip highlight to the dashboard’s applied period (never clear parent period).
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelected(appliedPeriodRef.current ?? null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const select = (k: Period) => {
    // Clicking an already-active filter deselects it
    const next = selected === k ? null : k;
    setSelected(next);
    onPeriodChange?.(next);
  };

  // Passes period + optional custom date range up to parent
  const handleApply = () => {
    if (selected === 'custom') {
      onApply?.(selected, { from: customFrom, to: customTo });
    } else {
      onApply?.(selected);
    }
  };

  return (
    // Outer container — clicking inside keeps selection alive
    <div
      ref={containerRef}
      className="flex flex-wrap items-center gap-2 px-4 py-3 border"
      style={{
        borderRadius: STYLE.containerRadius,
        backgroundColor: isDark ? '#1A2B45' : STYLE.containerBg,
        borderColor: isDark ? '#2A3F5F' : STYLE.containerBorder,
      }}
    >
      <span className="text-sm font-bold" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
        Period
      </span>

      <div className="flex flex-wrap gap-2 items-center">
        {PERIODS.map(({ key, label }) => {
          const active = selected === key;
          return (
            // Filter button — active uses #1D72CA, inactive is plain bordered
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              className="px-4 py-2 text-xs font-bold border transition-all"
              style={{
                borderRadius: STYLE.filterRadius,
                backgroundColor: active ? STYLE.activeColor : isDark ? '#243554' : STYLE.inactiveBg,
                color: active ? STYLE.activeText : isDark ? '#CBD5E1' : STYLE.inactiveText,
                borderColor: active ? STYLE.activeColor : isDark ? '#2A3F5F' : STYLE.inactiveBorder,
                boxShadow: active ? `0 2px 8px ${STYLE.activeShadow}` : 'none',
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Date range inputs — only visible when 'custom' is selected */}
        {selected === 'custom' && (
          <>
            {/* Start date — supports calendar picker and manual typing */}
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 text-xs font-bold border transition-all"
              style={{
                borderRadius: STYLE.filterRadius,
                borderColor: STYLE.inputBorder,
                backgroundColor: isDark ? '#1E3251' : STYLE.inputBg,
                color: isDark ? '#F0F4F8' : STYLE.inputText,
              }}
            />
            {/* End date — supports calendar picker and manual typing */}
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 text-xs font-bold border transition-all"
              style={{
                borderRadius: STYLE.filterRadius,
                borderColor: STYLE.inputBorder,
                backgroundColor: isDark ? '#1E3251' : STYLE.inputBg,
                color: isDark ? '#F0F4F8' : STYLE.inputText,
              }}
            />
          </>
        )}
      </div>

      {/* Apply button — always #1D72CA, dims when nothing selected */}
      <button
        type="button"
        onClick={handleApply}
        disabled={!selected}
        className="px-5 py-2 text-xs font-bold text-white transition-all active:scale-95"
        style={{
          backgroundColor: STYLE.activeColor,
          borderRadius: STYLE.applyRadius,
          boxShadow: `0 2px 8px ${STYLE.activeShadow}`,
          opacity: selected ? 1 : 0.5,
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
      >
        Apply Filter
      </button>
    </div>
  );
}
