'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
  onViewDetail?: () => void;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const StatCard = ({
  title,
  value,
  subtitle = 'vs last month',
  icon: Icon,
  iconBgClass = 'bg-[#0B2A4A]/5',
  iconColorClass = 'text-[#0B2A4A]',
  onViewDetail,
  trend,
}: StatCardProps) => (
  <div className="bg-card rounded-2xl border border-border p-5 flex items-start justify-between group hover:shadow-md hover:border-primary/20 transition-all duration-300">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
        {title}
      </p>

      <h3 className="text-2xl font-black text-[#0B2A4A] tracking-tight truncate">{value}</h3>

      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span
            className={cn(
              'text-[10px] font-black px-1.5 py-0.5 rounded',
              trend.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}
          >
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}
        <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
          {subtitle}
        </span>
      </div>

      {onViewDetail && (
        <button
          onClick={onViewDetail}
          className="mt-3 text-[10px] font-black text-primary uppercase tracking-tighter hover:text-[#0B2A4A] transition-colors"
        >
          View Analytics →
        </button>
      )}
    </div>

    <div
      className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300',
        iconBgClass,
        iconColorClass
      )}
    >
      <Icon size={22} strokeWidth={2.5} />
    </div>
  </div>
);

export default StatCard;
