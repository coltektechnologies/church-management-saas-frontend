'use client';

import { useMemo } from 'react';
import { Users, CalendarDays, Wallet, ClipboardList } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import type { Period } from '@/components/departments/dashboard/DeptPeriodFilter';

// ─── Soft-coded style constants ───────────────────────────────────────────────
const CARD_STYLE = {
  borderRadius: '10px', // Card corner radius
  iconRadius: '8px', // Icon container corner radius
  iconSize: 20, // Icon pixel size
  iconBoxSize: 'w-11 h-11', // Icon wrapper dimensions
  valueFontClass: 'text-lg font-black', // KPI number — uniform size fits all value lengths
  labelFontClass: 'text-xs font-semibold', // Card label typography
  subFontClass: 'text-[11px] font-medium', // Sub-label typography
  subDefaultColor: '#6B7280', // Neutral grey sub-label color
  budgetIconBg: '#1D72CA', // Solid blue for Budget card icon
  budgetIconColor: '#FFFFFF', // White icon on solid blue
  cardBgLight: '#FFFFFF', // Card background in light mode
  cardBgDark: '#1A2B45', // Card background in dark mode
  cardBorderLight: '#E5E7EB', // Card border in light mode
  cardBorderDark: '#2A3F5F', // Card border in dark mode
  valueColorLight: '#0B2A4A', // KPI number in light mode
  valueColorDark: '#F0F4F8', // KPI number in dark mode
  labelColorLight: '#6B7280', // Label text in light mode
  labelColorDark: '#94A3B8', // Label text in dark mode
  emptyValue: '—', // Placeholder shown when no period is selected
};

// ─── Dummy data per period — swap each block for real API data when ready ─────
const PERIOD_DATA: Record<Period, KpiData> = {
  this_month: {
    members: 2,
    membersChange: '+3 this month',
    activitiesThisMonth: 2,
    activitiesUpcoming: 4,
    budgetRemaining: 6800,
    budgetAllocated: 8000,
    pendingItems: 2,
    pendingAnnouncements: 2,
    pendingRequests: 1,
  },
  this_quarter: {
    members: 18,
    membersChange: '+7 this quarter',
    activitiesThisMonth: 9,
    activitiesUpcoming: 6,
    budgetRemaining: 22400,
    budgetAllocated: 30000,
    pendingItems: 5,
    pendingAnnouncements: 4,
    pendingRequests: 1,
  },
  this_year: {
    members: 47,
    membersChange: '+21 this year',
    activitiesThisMonth: 38,
    activitiesUpcoming: 12,
    budgetRemaining: 54000,
    budgetAllocated: 96000,
    pendingItems: 11,
    pendingAnnouncements: 8,
    pendingRequests: 3,
  },
  custom: {
    members: 5,
    membersChange: '+1 in range',
    activitiesThisMonth: 3,
    activitiesUpcoming: 2,
    budgetRemaining: 11200,
    budgetAllocated: 14000,
    pendingItems: 3,
    pendingAnnouncements: 2,
    pendingRequests: 1,
  },
};

export interface KpiData {
  members: number;
  membersChange: string;
  activitiesThisMonth: number;
  activitiesUpcoming: number;
  budgetRemaining: number;
  budgetAllocated: number;
  pendingItems: number;
  pendingAnnouncements: number;
  pendingRequests: number;
}

interface KpiCardsProps {
  data?: Partial<KpiData>;
  period?: Period | null; // null = no filter selected → cards show placeholder dashes
  /** True while fetching API metrics — avoids flashing dummy PERIOD_DATA. */
  loading?: boolean;
  /** After a failed fetch, show placeholders instead of dummy demo numbers. */
  failed?: boolean;
  /** Department roster size from context — shown for the Members card while live KPIs are still loading. */
  snapshotMemberCount?: number;
}

// Computes accessible text color (dark or white) against a given solid hex background
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

// Individual KPI card — icon left, value + label + sub right
function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor,
  cardBg,
  cardBorder,
  valueColor,
  labelColor,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor?: string;
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  cardBg: string; // Explicit card background — no Tailwind bg-card
  cardBorder: string; // Explicit border color — no Tailwind border-border
  valueColor: string; // Explicit KPI number color — no Tailwind text-foreground
  labelColor: string; // Explicit label color — no Tailwind text-muted-foreground
}) {
  const iconText = iconColor ?? autoText(iconBg);
  return (
    <div
      className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow w-full border"
      style={{
        borderRadius: CARD_STYLE.borderRadius,
        backgroundColor: cardBg,
        borderColor: cardBorder,
      }}
    >
      {/* Solid-color icon badge */}
      <div
        className={`${CARD_STYLE.iconBoxSize} flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: iconBg, borderRadius: CARD_STYLE.iconRadius }}
      >
        <Icon size={CARD_STYLE.iconSize} style={{ color: iconText }} />
      </div>

      {/* Text block: big value on top, label below, colored sub at bottom */}
      <div className="min-w-0 flex-1">
        <p className={`${CARD_STYLE.valueFontClass} leading-tight`} style={{ color: valueColor }}>
          {value}
        </p>
        <p className={`${CARD_STYLE.labelFontClass}`} style={{ color: labelColor }}>
          {label}
        </p>
        {sub && (
          <p
            className={`${CARD_STYLE.subFontClass} mt-0.5`}
            style={{ color: subColor || CARD_STYLE.subDefaultColor }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DeptKpiCards({
  data = {},
  period = null,
  loading = false,
  failed = false,
  snapshotMemberCount,
}: KpiCardsProps) {
  const { profile, isReady } = useDepartmentProfile();

  // Derive the live KPI data directly from props (no setState in effect)
  const liveData = useMemo<KpiData | null>(() => {
    if (!period) {
      return null; // No period selected → show dashes
    }
    if (loading || failed) {
      return null; // Fetching or error — show dashes until real data arrives
    }
    return { ...PERIOD_DATA[period], ...data };
  }, [period, data, loading, failed]);

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

  const currency = isReady ? profile.currency || 'GHS' : 'GHS';
  // Currency symbol mapping — soft-coded for easy extension
  const currencySymbol =
    currency === 'GHS' ? 'GHS' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  // Explicit surface colors — no Tailwind CSS variable dependency
  const cardBg = isDark ? CARD_STYLE.cardBgDark : CARD_STYLE.cardBgLight;
  const cardBorder = isDark ? CARD_STYLE.cardBorderDark : CARD_STYLE.cardBorderLight;
  const valueColor = isDark ? CARD_STYLE.valueColorDark : CARD_STYLE.valueColorLight;
  const labelColor = isDark ? CARD_STYLE.labelColorDark : CARD_STYLE.labelColorLight;

  // Shorthand — null when no period selected / loading / error
  const m = liveData;
  const E = CARD_STYLE.emptyValue;
  const membersValue =
    m?.members ??
    (typeof snapshotMemberCount === 'number' && snapshotMemberCount >= 0 ? snapshotMemberCount : E);

  // Card definitions — values fall back to '—' when liveData is null
  const cards = [
    {
      icon: Users,
      iconBg: accentColor, // Solid teal
      iconColor: '#FFFFFF',
      label: 'Department Members',
      value: membersValue,
      sub: m ? m.membersChange : undefined,
      subColor: accentColor,
    },
    {
      icon: CalendarDays,
      iconBg: primaryColor, // Solid dark navy
      iconColor: '#FFFFFF',
      label: 'Activities This Month',
      value: m ? m.activitiesThisMonth : E,
      sub: m ? `${m.activitiesUpcoming} upcoming` : undefined,
      subColor: accentColor,
    },
    {
      icon: Wallet,
      iconBg: CARD_STYLE.budgetIconBg, // Solid #1D72CA blue
      iconColor: CARD_STYLE.budgetIconColor,
      label: 'Budget Remaining',
      value: m ? `${currencySymbol}${m.budgetRemaining.toLocaleString()}` : E,
      sub: m ? `of ${currencySymbol}${m.budgetAllocated.toLocaleString()} allocated` : undefined,
      subColor: CARD_STYLE.subDefaultColor,
    },
    {
      icon: ClipboardList,
      iconBg: accentColor, // Solid teal
      iconColor: '#FFFFFF',
      label: 'Pending Items',
      value: m ? m.pendingItems : E,
      sub: m
        ? `${m.pendingAnnouncements} announcements, ${m.pendingRequests} request${m.pendingRequests === 1 ? '' : 's'}`
        : undefined,
      subColor: CARD_STYLE.subDefaultColor,
    },
  ];

  return (
    // Responsive grid: 1 col mobile → 2 col sm → 4 col xl
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => (
        <KpiCard
          key={i}
          {...card}
          cardBg={cardBg}
          cardBorder={cardBorder}
          valueColor={valueColor}
          labelColor={labelColor}
        />
      ))}
    </div>
  );
}
