'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  change?: string;
  changePositive?: boolean;
  iconColor?: 'blue' | 'gray';
  borderTopColor?: string;
}

export default function StatsCard({
  icon,
  value,
  label,
  change,
  changePositive = true,
  iconColor = 'blue',
  borderTopColor = '#0B2A4A',
}: StatsCardProps) {
  /**
   * Light mode: navy brand on a soft brand-tint well.
   * Dark mode: navy on dark blue-gray reads as “missing”; use accent (`--accent-brand`) for
   * Lucide `currentColor` and a slightly lighter well (`dark:bg-white/10`).
   */
  return (
    <div
      className="flex flex-col p-4 w-full min-h-[135px] min-w-0 shrink-0 md:max-w-[232px] rounded-[10px] dark:shadow-none dark:ring-1 dark:ring-white/10"
      style={{
        background: 'var(--admin-surface, #FFFFFF)',
        borderTop: `3px solid ${borderTopColor}`,
        boxShadow: '0px 0px 12.3px 0px #00000017',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={cn(
            'p-2.5 rounded-xl flex items-center justify-center shrink-0 [&_svg]:block [&_svg]:shrink-0',
            iconColor === 'blue'
              ? 'bg-[color-mix(in_srgb,var(--primary-brand,#0B2A4A)_14%,transparent)] dark:bg-white/10 text-[color:var(--primary-brand,#0B2A4A)] dark:text-[color:var(--accent-brand,#2FC4B2)]'
              : 'bg-[color-mix(in_srgb,var(--admin-text,#64748b)_10%,transparent)] dark:bg-white/10 text-[color:var(--admin-text-muted,#6b7280)] dark:text-slate-200'
          )}
        >
          {icon}
        </div>
        {change && (
          <span
            className={cn(
              'text-sm font-semibold',
              changePositive
                ? 'text-[color:var(--primary-brand,#0B2A4A)] dark:text-[color:var(--accent-brand,#2FC4B2)]'
                : 'text-red-500 dark:text-red-400'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-xl font-bold mb-0.5" style={{ color: 'var(--admin-text, #111827)' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--admin-text-muted, #6b7280)' }}>
        {label}
      </p>
    </div>
  );
}
