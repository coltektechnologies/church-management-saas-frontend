'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/components/secretary/contexts/EventsContext';

const fmt12 = (t: string) => {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export function UpcomingEvents() {
  const router = useRouter();
  const { events, isReady } = useEvents();
  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingEvents = useMemo(() => {
    if (!isReady) {
      return [];
    }
    return events
      .filter((e) => e.status === 'upcoming' && e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [events, isReady, todayStr]);

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isReady || upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
        ) : (
          upcomingEvents.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-9 w-9 rounded-lg ${e.color} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-[10px] font-bold">📅</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{e.name}</p>
                    {e.reminders?.length > 0 && (
                      <span
                        title={`${e.reminders.length} reminder(s) set`}
                        className="flex-shrink-0"
                      >
                        <Bell size={11} className="text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {fmt12(e.time)}
                  </p>
                </div>
              </div>
              <ExternalLink
                className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0"
                onClick={() => router.push('/secretary/settings?tab=events')}
              />
            </div>
          ))
        )}
        <p
          onClick={() => router.push('/secretary/settings?tab=events')}
          className="text-right text-xs text-primary cursor-pointer hover:underline"
        >
          Manage events
        </p>
      </CardContent>
    </Card>
  );
}
