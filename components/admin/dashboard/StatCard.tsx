'use client';

import { useSyncExternalStore } from 'react';
import { LucideIcon } from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  /** @deprecated kept for backwards compat */
  iconBgClass?: string;
  onViewDetail?: () => void;
  empty?: boolean;
}

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const StatCard = ({
  title,
  value,
  subtitle = 'Last month',
  icon: Icon,
  onViewDetail,
  empty = false,
}: StatCardProps) => {
  const { profile } = useChurchProfile();
  const pc = profile.primaryColor || '#0B2A4A';

  const mounted = useIsMounted();
  const dark = mounted ? (profile.darkMode ?? false) : false;

  const cardBg = dark ? '#112240' : '#FDFEFE';
  const txtMain = dark ? '#FFFFFF' : '#0B2A4A';
  const txtMuted = dark ? 'rgba(255,255,255,0.45)' : 'rgba(11,42,74,0.55)';
  const hrColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(11,42,74,0.12)';
  const iconColor = dark ? '#FFFFFF' : '#1E124A';

  return (
    <button
      onClick={onViewDetail}
      className="flex flex-col min-w-0 text-left hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group w-full"
      style={{
        backgroundColor: cardBg,
        border: dark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        boxShadow: dark ? '0px 1px 6px 0px rgba(0,0,0,0.4)' : '0px 0px 0.5px 0px #2FC4B2',
        borderRadius: '5px',
        outline: 'none',
        padding: '16px',
      }}
    >
      {/* Title + icon */}
      <div className="flex items-center justify-between w-full">
        <p
          style={{
            fontFamily: 'OV Soge, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '100%',
            letterSpacing: '0%',
            color: txtMain,
          }}
        >
          {title}
        </p>
        <Icon
          size={20}
          strokeWidth={2}
          style={{ color: iconColor, opacity: empty ? 0.35 : 1, flexShrink: 0 }}
        />
      </div>

      {/* Full-width divider */}
      <div className="-mx-4 my-3" style={{ borderBottom: `1px solid ${hrColor}` }} />

      {/* Value */}
      <p
        style={{
          fontFamily: 'OV Soge, sans-serif',
          fontWeight: 600,
          fontSize: '22px',
          lineHeight: '1.2',
          color: txtMain,
          opacity: empty ? 0.3 : 1,
        }}
      >
        {value}
      </p>

      {/* Subtitle + view detail */}
      <div className="flex items-center justify-between mt-2">
        <span
          style={{
            fontFamily: 'OV Soge, sans-serif',
            fontWeight: 400,
            fontSize: '11px',
            color: txtMuted,
          }}
        >
          {subtitle}
        </span>
        <span
          className="group-hover:underline"
          style={{
            fontFamily: 'OV Soge, sans-serif',
            fontWeight: 500,
            fontSize: '11px',
            color: pc,
          }}
        >
          View detail
        </span>
      </div>
    </button>
  );
};

export default StatCard;
