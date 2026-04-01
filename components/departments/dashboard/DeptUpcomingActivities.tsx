'use client';

import { CalendarDays } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

export interface DeptActivity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

const DEFAULT_ACTIVITIES: DeptActivity[] = [
  {
    id: '1',
    name: 'Choir Practice',
    date: '2026-08-20',
    time: '7:00 PM',
    location: 'Music Room',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Special Music Sabbath',
    date: '2024-08-24',
    time: '11:00 AM',
    location: 'Sanctuary',
    status: 'upcoming',
  },
];

interface Props {
  activities?: DeptActivity[];
  onViewAll?: () => void;
}

export default function DeptUpcomingActivities({
  activities = DEFAULT_ACTIVITIES,
  onViewAll,
}: Props) {
  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} style={{ color: accentColor }} />
          <h3 className="text-base font-black text-foreground">Upcoming Activities</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted/30 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Activities list */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays size={32} className="text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No upcoming activities</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:shadow-sm transition-all bg-muted/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                >
                  <CalendarDays size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{activity.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.date} at {activity.time} · {activity.location}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium flex-shrink-0 ml-2">
                {activity.date}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
