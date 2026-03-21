'use client';

import type { SubscriptionStatus } from '@/components/admin/dashboard/contexts/ChurchProfileContext';

const STATUS_STYLES: Record<
  SubscriptionStatus,
  { label: string; color: string; bg: string; darkBg: string }
> = {
  trial: { label: 'On Trial', color: '#B45309', bg: '#FEF3C7', darkBg: '#78350F' },
  active: { label: 'Active', color: '#065F46', bg: '#D1FAE5', darkBg: '#064E3B' },
  inactive: { label: 'Inactive', color: '#991B1B', bg: '#FEE2E2', darkBg: '#7F1D1D' },
};

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
  dark?: boolean;
  className?: string;
}

export default function SubscriptionBadge({
  status,
  dark = false,
  className = '',
}: SubscriptionBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.trial;

  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 ${className}`}
      style={{
        color: style.color,
        backgroundColor: dark ? style.darkBg : style.bg,
        borderRadius: '5px',
      }}
    >
      {style.label}
    </span>
  );
}

export { STATUS_STYLES };
export type { SubscriptionBadgeProps };
