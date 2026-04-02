'use client';

import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

// ─── Soft-coded style constants ───────────────────────────────────────────────
const STYLE = {
  containerRadius: '10px', // Outer card corner radius
  containerBgLight: '#FFFFFF', // Card background light mode
  containerBgDark: '#1A2B45', // Card background dark mode
  containerBorderLight: '#E5E7EB', // Card border light mode
  containerBorderDark: '#2A3F5F', // Card border dark mode
  containerMinWidth: '320px', // Min width so title + button never squash
  labelColorLight: '#6B7280', // Sub-label text light
  labelColorDark: '#94A3B8', // Sub-label text dark
  valueColorLight: '#111111', // Value text light
  valueColorDark: '#F0F4F8', // Value text dark
  barTrackLight: '#E5E7EB', // Progress bar track light
  barTrackDark: '#2A3F5F', // Progress bar track dark
  barRadius: '999px', // Progress bar pill radius
  barHeight: '10px', // Progress bar height
  remainingLabelLight: '#111111', // Remaining value text light
  remainingLabelDark: '#F0F4F8', // Remaining value text dark
  titleFontSize: '24px', // Uniform title font size — matches other cards
  titleFontWeight: '700', // Title font weight
  // Button style
  btnBg: '#EEEEEF', // Button background
  btnBorder: '#A29D9D', // Button border
  btnRadius: '7px', // Button corner radius
  btnShadow: '0px 4px 4px rgba(0,0,0,0.25)', // Button shadow
  btnTextLight: '#111111', // Button text light
  btnTextDark: '#F0F4F8', // Button text dark
  btnFontSize: '13px', // Button font size
  // Bar thresholds
  barAmber: '#F59E0B', // Bar color 60–85% used
  barRed: '#EF4444', // Bar color >85% used
};

// Budget details route
const BUDGET_ROUTE = '/departments/budget';

// Dummy defaults — replace with live API data
const DUMMY_ALLOCATED = 8000;
const DUMMY_SPENT = 3750;

interface BudgetStatusProps {
  allocated?: number;
  spent?: number;
}

export default function DeptBudgetStatus({
  allocated = DUMMY_ALLOCATED,
  spent = DUMMY_SPENT,
}: BudgetStatusProps) {
  const router = useRouter();
  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const currency = isReady ? profile.currency || 'GHS' : 'GHS';
  // Currency symbol mapping — soft-coded for easy extension
  const currencySymbol =
    currency === 'GHS' ? 'GHS' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const remaining = allocated - spent;
  const pctUsed = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  // Bar color: accent < 60%, amber 60–85%, red > 85%
  const barColor = pctUsed < 60 ? accentColor : pctUsed < 85 ? STYLE.barAmber : STYLE.barRed;

  const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
  const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
  const labelColor = isDark ? STYLE.labelColorDark : STYLE.labelColorLight;
  const valueColor = isDark ? STYLE.valueColorDark : STYLE.valueColorLight;
  const barTrack = isDark ? STYLE.barTrackDark : STYLE.barTrackLight;
  const remainingColor = isDark ? STYLE.remainingLabelDark : STYLE.remainingLabelLight;
  const btnText = isDark ? STYLE.btnTextDark : STYLE.btnTextLight;
  const dividerColor = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;

  const detailsBtnStyle = {
    backgroundColor: STYLE.btnBg,
    border: `1px solid ${STYLE.btnBorder}`,
    borderRadius: STYLE.btnRadius,
    boxShadow: STYLE.btnShadow,
    color: btnText,
    fontSize: STYLE.btnFontSize,
    fontWeight: '600',
    flexShrink: 0, // Button never shrinks — title gets all remaining space
  };

  return (
    <div
      className="p-5 sm:p-6 flex flex-col gap-4 border w-full"
      style={{
        borderRadius: STYLE.containerRadius,
        backgroundColor: containerBg,
        borderColor: containerBorder,
        minWidth: STYLE.containerMinWidth, // Container expands to fit title + button on one line
      }}
    >
      {/* Header — title takes all available width, button fixed on right */}
      <div className="flex items-center justify-between gap-3">
        {/* Title wrapper grows to fill all space not taken by the button */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Wallet size={20} style={{ color: accentColor, flexShrink: 0 }} />
          <h3
            className="font-black whitespace-nowrap"
            style={{
              color: accentColor,
              fontSize: STYLE.titleFontSize, // 24px — same as other cards
              fontWeight: STYLE.titleFontWeight,
            }}
          >
            Budget Status
          </h3>
        </div>
        {/* Details button — never shrinks, always right-aligned */}
        <button
          onClick={() => router.push(BUDGET_ROUTE)}
          className="px-3 py-1.5 transition-colors"
          style={detailsBtnStyle}
        >
          Details
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: dividerColor }} />

      {/* Allocated vs Spent row */}
      <div className="flex justify-between gap-2 flex-wrap">
        <p style={{ color: labelColor, fontSize: '13px', fontWeight: '500' }}>
          Allocated:{' '}
          <span style={{ color: valueColor, fontWeight: '800' }}>
            {currencySymbol}
            {allocated.toLocaleString()}
          </span>
        </p>
        <p style={{ color: labelColor, fontSize: '13px', fontWeight: '500' }}>
          Spent:{' '}
          <span style={{ color: valueColor, fontWeight: '800' }}>
            {currencySymbol}
            {spent.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="w-full overflow-hidden"
          style={{
            height: STYLE.barHeight,
            backgroundColor: barTrack,
            borderRadius: STYLE.barRadius,
          }}
        >
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${Math.min(pctUsed, 100)}%`,
              backgroundColor: barColor,
              borderRadius: STYLE.barRadius,
            }}
          />
        </div>

        {/* Remaining + % used */}
        <div className="flex justify-between mt-2 gap-2 flex-wrap">
          <p style={{ color: labelColor, fontSize: '13px', fontWeight: '500' }}>
            Remaining:{' '}
            <span style={{ color: remainingColor, fontWeight: '800' }}>
              {currencySymbol}
              {remaining.toLocaleString()}
            </span>
          </p>
          <p style={{ color: barColor, fontSize: '13px', fontWeight: '700' }}>{pctUsed}% used</p>
        </div>
      </div>

      {/* Bottom full-width Details button */}
      <button
        onClick={() => router.push(BUDGET_ROUTE)}
        className="w-full py-2.5 transition-colors"
        style={{ ...detailsBtnStyle, fontWeight: '700', fontSize: '14px' }}
      >
        Details
      </button>
    </div>
  );
}
