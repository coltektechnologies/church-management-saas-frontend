'use client';

import { Users, CalendarDays, Wallet, ClipboardList } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

interface KpiData {
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
}

const DEFAULT_DATA: KpiData = {
  members: 2,
  membersChange: '+3 this month',
  activitiesThisMonth: 2,
  activitiesUpcoming: 4,
  budgetRemaining: 6800,
  budgetAllocated: 8000,
  pendingItems: 2,
  pendingAnnouncements: 2,
  pendingRequests: 1,
};

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

function KpiCard({
  icon: Icon,
  iconBg,
  label,
  value,
  sub,
  subColor,
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
}) {
  const iconText = autoText(iconBg);
  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} style={{ color: iconText }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-2xl font-black text-foreground leading-tight">{value}</p>
        {sub && (
          <p className="text-[11px] font-medium mt-0.5" style={{ color: subColor || '#6B7280' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DeptKpiCards({ data = {} }: KpiCardsProps) {
  const merged = { ...DEFAULT_DATA, ...data };
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

  const currency = isReady ? profile.currency || 'GHS' : 'GHS';
  const currencySymbol =
    currency === 'GHS' ? 'GHS' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const cards = [
    {
      icon: Users,
      iconBg: `${accentColor}22`,
      label: 'Department Members',
      value: merged.members,
      sub: merged.membersChange,
      subColor: accentColor,
    },
    {
      icon: CalendarDays,
      iconBg: primaryColor,
      label: 'Activities This Month',
      value: merged.activitiesThisMonth,
      sub: `${merged.activitiesUpcoming} upcoming`,
      subColor: accentColor,
    },
    {
      icon: Wallet,
      iconBg: `${accentColor}22`,
      label: 'Budget Remaining',
      value: `${currencySymbol}${merged.budgetRemaining.toLocaleString()}`,
      sub: `of ${currencySymbol}${merged.budgetAllocated.toLocaleString()} allocated`,
      subColor: '#6B7280',
    },
    {
      icon: ClipboardList,
      iconBg: `${accentColor}22`,
      label: 'Pending Items',
      value: merged.pendingItems,
      sub: `${merged.pendingAnnouncements} announcements, ${merged.pendingRequests} request`,
      subColor: '#6B7280',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <KpiCard key={i} {...card} />
      ))}
    </div>
  );
}
