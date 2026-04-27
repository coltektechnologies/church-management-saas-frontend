'use client';

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
  const iconBoxStyle =
    iconColor === 'blue'
      ? {
          background: 'color-mix(in srgb, var(--color-primary, #0B2A4A) 14%, transparent)',
          color: 'var(--color-primary, #2563eb)',
        }
      : {
          background: 'color-mix(in srgb, var(--admin-text, #1f2937) 8%, transparent)',
          color: 'var(--admin-text-muted, #6b7280)',
        };

  return (
    <div
      className="flex flex-col p-4 w-full min-h-[135px] min-w-0 shrink-0 md:max-w-[232px]"
      style={{
        background: 'var(--admin-surface, #FFFFFF)',
        borderRadius: 10,
        borderTop: `3px solid ${borderTopColor}`,
        boxShadow: '0px 0px 12.3px 0px #00000017',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2.5 rounded-xl" style={iconBoxStyle}>
          {icon}
        </div>
        {change && (
          <span
            className="text-sm font-semibold"
            style={{ color: changePositive ? 'var(--color-primary, #2563eb)' : '#ef4444' }}
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
