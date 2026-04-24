'use client';

// /components/treasurydashboard/approvals/DepartmentBudgetSection.tsx

import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import type { DepartmentBudget } from './approvalsData';

function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

type Props = { budgets: DepartmentBudget[] };

// Gradient: #09A30C (green, 0%) → #F56666 (red, 100%) — exactly as shown in design image
const BAR_GRADIENT = 'linear-gradient(to right, #09A30C 0%, #F56666 100%)';
const BAR_TRACK_LIGHT = '#E5E7EB';
const BAR_TRACK_DARK = 'rgba(255,255,255,0.1)';

export default function DepartmentBudgetSection({ budgets }: Props) {
  const { profile, isReady } = useTreasuryProfile();
  const isDark = isReady ? profile.darkMode : false;

  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const bgColor = isDark
    ? profile.darkBackgroundColor || '#0A1628'
    : profile.backgroundColor || '#F5F7FA';
  const sidebarColor = isDark
    ? profile.darkSidebarColor || '#0D1F36'
    : profile.sidebarColor || '#FFFFFF';

  const outerBorderCol = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const cardBorderCol = isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB';
  const bodyText = isDark ? 'rgba(255,255,255,0.9)' : '#1F2937';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : '#6B7280';
  const sectionBg = isDark ? `${primaryColor}18` : bgColor;
  const cardBg = isDark ? `${primaryColor}25` : '#FFFFFF';
  const trackColor = isDark ? BAR_TRACK_DARK : BAR_TRACK_LIGHT;

  return (
    <div
      style={{
        backgroundColor: sectionBg,
        borderRadius: '10px',
        border: `1px solid ${outerBorderCol}`,
        padding: '20px 16px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="w-6 h-6 flex items-center justify-center" style={{ color: bodyText }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect
              x="1"
              y="1"
              width="16"
              height="16"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M4 6h10M4 9h7M4 12h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="text-sm sm:text-base font-black" style={{ color: bodyText }}>
          Department Budget Overview
        </h2>
      </div>

      {/* Grid — responsive: 1 col mobile, 2 col sm, 3 col md, 5 col xl */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {budgets.map((dept) => {
          const pct = Math.min(100, Math.round((dept.utilized / dept.allocated) * 100));

          return (
            <div
              key={dept.name}
              className="p-3 sm:p-4 space-y-2.5"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorderCol}`,
                borderRadius: '10px',
              }}
            >
              {/* Dept name */}
              <p className="text-xs sm:text-sm font-bold truncate" style={{ color: bodyText }}>
                {dept.name}
              </p>

              {/* Progress bar — gradient with clipped fill */}
              <div className="relative">
                {/* Track */}
                <div
                  className="w-full h-2 overflow-hidden"
                  style={{ backgroundColor: trackColor, borderRadius: '999px' }}
                >
                  {/* Gradient fill — we clip the full-width gradient bar */}
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      // Use a background-size trick so the gradient always shows green→red proportionally
                      background: BAR_GRADIENT,
                      backgroundSize: `${(100 / pct) * 100}% 100%`,
                      borderRadius: '999px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>

              {/* Amounts row */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: mutedText }}>
                  {dept.currency}
                  {(dept.utilized / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] sm:text-xs font-semibold" style={{ color: bodyText }}>
                  {dept.currency}
                  {(dept.allocated / 1000).toFixed(0)}K
                </p>
              </div>

              {/* Utilization % */}
              <p className="text-[10px] sm:text-xs font-bold" style={{ color: '#2BAF2E' }}>
                {pct}% utilized
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
