'use client';

import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

// ─── Soft-coded style constants ───────────────────────────────────────────────
const STYLE = {
  containerRadius: '10px',
  containerBgLight: '#FFFFFF',
  containerBgDark: '#1A2B45',
  containerBorderLight: '#E5E7EB',
  containerBorderDark: '#2A3F5F',
  labelColorLight: '#6B7280',
  labelColorDark: '#94A3B8',
  valueColorLight: '#111111',
  valueColorDark: '#F0F4F8',
  barTrackLight: '#E5E7EB',
  barTrackDark: '#2A3F5F',
  barRadius: '999px',
  barHeight: '10px',
  remainingLabelLight: '#111111',
  remainingLabelDark: '#F0F4F8',
  titleFontSize: '24px',
  titleFontWeight: '700',
  // Button style — updated to 8px radius
  btnBg: '#EEEEEF',
  btnRadius: '8px',
  btnShadow: '0px 1px 3px rgba(15,23,42,0.08)',
  btnTextLight: '#111111',
  btnTextDark: '#F0F4F8',
  btnFontSize: '13px',
  btnMinWidth: '80px',
  headerBtnMarginLeft: 'auto',
  // Bar thresholds
  barAmber: '#F59E0B',
  barRed: '#EF4444',
};

const BUDGET_ROUTE = '/departments/budget';
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
  const currencySymbol =
    currency === 'GHS' ? 'GHS' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const remaining = allocated - spent;
  const pctUsed = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
  const barColor = pctUsed < 60 ? accentColor : pctUsed < 85 ? STYLE.barAmber : STYLE.barRed;

  const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
  const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
  const labelColor = isDark ? STYLE.labelColorDark : STYLE.labelColorLight;
  const valueColor = isDark ? STYLE.valueColorDark : STYLE.valueColorLight;
  const barTrack = isDark ? STYLE.barTrackDark : STYLE.barTrackLight;
  const remainingColor = isDark ? STYLE.remainingLabelDark : STYLE.remainingLabelLight;
  const btnText = isDark ? STYLE.btnTextDark : STYLE.btnTextLight;
  const dividerColor = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;

  const detailsBtnStyle: React.CSSProperties = {
    backgroundColor: STYLE.btnBg,
    borderRadius: STYLE.btnRadius,
    boxShadow: STYLE.btnShadow,
    color: btnText,
    fontSize: STYLE.btnFontSize,
    fontWeight: '500',
    fontFamily: 'Poppins',
    flexShrink: 0,
    minWidth: STYLE.btnMinWidth,
    marginLeft: '12px',
    border: 'none',
    padding: '6px 18px',
  };

  return (
    <div
      className="p-5 sm:p-6 flex flex-col gap-4 border w-full"
      style={{
        borderRadius: STYLE.containerRadius,
        backgroundColor: containerBg,
        borderColor: containerBorder,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full overflow-hidden">
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div style={{ color: accentColor, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Wallet size={26} strokeWidth={2.5} />
          </div>
          <h3
            className="whitespace-nowrap"
            style={{
              color: accentColor,
              fontSize: STYLE.titleFontSize,
              fontWeight: STYLE.titleFontWeight,
              fontFamily: 'Poppins',
              lineHeight: '1',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Budget Status
          </h3>
        </div>

        <button
          onClick={() => router.push(BUDGET_ROUTE)}
          className="transition-all duration-200 hover:brightness-95 cursor-pointer flex-shrink-0"
          style={detailsBtnStyle}
        >
          Details
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: dividerColor }} />

      {/* Allocated vs Spent row */}
      <div className="flex justify-between gap-2 flex-wrap">
        <p
          style={{ color: labelColor, fontSize: '13px', fontWeight: '400', fontFamily: 'Poppins' }}
        >
          Allocated:{' '}
          <span style={{ color: valueColor, fontWeight: '500' }}>
            {currencySymbol}
            {allocated.toLocaleString()}
          </span>
        </p>
        <p
          style={{ color: labelColor, fontSize: '13px', fontWeight: '400', fontFamily: 'Poppins' }}
        >
          Spent:{' '}
          <span style={{ color: valueColor, fontWeight: '500' }}>
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
          <p
            style={{
              color: labelColor,
              fontSize: '13px',
              fontWeight: '400',
              fontFamily: 'Poppins',
            }}
          >
            Remaining:{' '}
            <span style={{ color: remainingColor, fontWeight: '500' }}>
              {currencySymbol}
              {remaining.toLocaleString()}
            </span>
          </p>
          <p
            style={{ color: barColor, fontSize: '13px', fontWeight: '300', fontFamily: 'Poppins' }}
          >
            {pctUsed}% used
          </p>
        </div>
      </div>

      {/* Bottom full-width Details button */}
      <button
        onClick={() => router.push(BUDGET_ROUTE)}
        className="w-full py-2.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        style={{
          backgroundColor: STYLE.btnBg,
          borderRadius: STYLE.btnRadius, // Now 8px
          boxShadow: STYLE.btnShadow,
          color: btnText,
          fontSize: STYLE.btnFontSize,
          fontWeight: '400',
          fontFamily: 'Poppins',
          border: 'none',
        }}
      >
        Details
      </button>
    </div>
  );
}
