'use client';

import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import {
  UserPlus,
  ArrowLeftRight,
  ShieldCheck,
  Megaphone,
  CalendarDays,
  Building2,
  Settings,
  Activity,
} from 'lucide-react';

const ICON_MAP: Record<string, { icon: typeof UserPlus; color: string }> = {
  member: { icon: UserPlus, color: '#2FC4B2' },
  transaction: { icon: ArrowLeftRight, color: '#10B981' },
  approval: { icon: ShieldCheck, color: '#F59E0B' },
  announcement: { icon: Megaphone, color: '#3B82F6' },
  event: { icon: CalendarDays, color: '#8B5CF6' },
  department: { icon: Building2, color: '#EC4899' },
  system: { icon: Settings, color: '#6B7280' },
};

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) {
    return 'just now';
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed() {
  const { activityLog } = useAppData();

  return (
    // border/shadow/radius applied by wrapper in DashboardPage
    <div className="bg-card p-4 sm:p-5 flex flex-col h-full">
      {/* ── Card title ── */}
      <h3 className="text-sm sm:text-base font-bold text-foreground shrink-0">Activity Feed</h3>

      {/* ── Horizontal rule after card title ── */}
      <div className="mt-3 mb-3 shrink-0" style={{ borderBottom: '1px solid #A9A9A9' }} />

      {activityLog.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Activity size={18} className="text-muted-foreground/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">No activity yet</p>
          <p className="text-[10px] text-muted-foreground/60">
            Actions across all modules will appear here
          </p>
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0
                        scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        >
          {activityLog.map((entry) => {
            const cfg = ICON_MAP[entry.type] ?? ICON_MAP.system;
            const Icon = cfg.icon;
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${cfg.color}18` }}
                >
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-foreground leading-snug truncate">
                    {entry.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {entry.subtitle}
                  </p>
                </div>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                  {relativeTime(entry.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
