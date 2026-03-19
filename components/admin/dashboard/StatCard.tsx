'use client';

import { LucideIcon } from 'lucide-react';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  /** @deprecated icon background is now derived from primaryColor — kept for backwards compat */
  iconBgClass?: string;
  onViewDetail?: () => void;
  empty?: boolean;
}

const StatCard = ({
  title,
  value,
  subtitle = 'Last month',
  icon: Icon,
  // iconBgClass is intentionally unused — colour comes from context
  onViewDetail,
  empty = false,
}: StatCardProps) => {
  const { profile } = useChurchProfile();
  const pc = profile.primaryColor || '#0B2A4A';

  return (
    <button
      onClick={onViewDetail}
      className="bg-card rounded-xl border border-border p-4 flex items-start justify-between min-w-0 text-left
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group w-full"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${pc}66`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '';
      }}
    >
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {title}
        </p>
        <p
          className={`text-xl sm:text-2xl font-bold mt-1 ${empty ? 'text-muted-foreground/30' : 'text-foreground'}`}
        >
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-muted-foreground">{subtitle}</span>
          <span className="text-[10px] font-medium group-hover:underline" style={{ color: pc }}>
            View detail
          </span>
        </div>
      </div>
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-opacity ${empty ? 'opacity-40' : 'opacity-100'}`}
        style={{ backgroundColor: `${pc}18` }}
      >
        <Icon size={18} style={{ color: pc }} />
      </div>
    </button>
  );
};

export default StatCard;
