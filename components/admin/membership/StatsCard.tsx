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
  return (
    <div
      className="flex flex-col p-4 w-full max-w-[232px] min-h-[135px] min-w-0 shrink-0"
      style={{
        background: '#FFFFFF',
        borderRadius: 10,
        borderTop: `3px solid ${borderTopColor}`,
        boxShadow: '0px 0px 12.3px 0px #00000017',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={`p-2.5 rounded-xl ${
            iconColor === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {icon}
        </div>
        {change && (
          <span
            className={`text-sm font-semibold ${changePositive ? 'text-blue-600' : 'text-red-500'}`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
