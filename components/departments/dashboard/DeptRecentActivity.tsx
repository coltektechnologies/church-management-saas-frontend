'use client';

import { Activity } from 'lucide-react';
import { useDeptActivity } from '@/components/departments/contexts/DeptActivityContext';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

const STATIC_FALLBACK = [
  {
    id: '1',
    icon: '✅',
    label: 'Activity: Choir Practice',
    detail: '2024-08-20',
    timestamp: Date.now() - 86400000,
  },
  {
    id: '2',
    icon: '✅',
    label: 'Activity: Special Music Sabbath',
    detail: '2024-08-24',
    timestamp: Date.now() - 172800000,
  },
  {
    id: '3',
    icon: '📢',
    label: 'Announcement: Choir Practice Canceled',
    detail: 'pending',
    timestamp: Date.now() - 259200000,
  },
  {
    id: '4',
    icon: '📢',
    label: 'Announcement: New Hymnals Available',
    detail: 'approved',
    timestamp: Date.now() - 345600000,
  },
  {
    id: '5',
    icon: '💰',
    label: 'Request: New Microphones',
    detail: 'GHS600',
    timestamp: Date.now() - 432000000,
  },
];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  onViewAll?: () => void;
}

export default function DeptRecentActivity({ onViewAll }: Props) {
  const { activities, isReady } = useDeptActivity();
  const { profile } = useDepartmentProfile();

  const isDark = profile.darkMode;
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';

  const items = isReady && activities.length > 0 ? activities.slice(0, 8) : STATIC_FALLBACK;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} style={{ color: accentColor }} />
          <h3 className="text-base font-black text-foreground">Recent Activity</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted/30 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Activity rows */}
      <div className="space-y-0">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.label}
                  {item.detail && (
                    <span className="text-muted-foreground font-normal"> – {item.detail}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-[11px] text-muted-foreground">{timeAgo(item.timestamp)}</span>
              <button
                className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-border text-foreground hover:bg-muted/30 transition-colors"
                onClick={() => {}}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
