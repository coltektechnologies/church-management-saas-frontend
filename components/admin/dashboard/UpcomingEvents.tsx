'use client';

import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';
import { ExternalLink, CalendarPlus, Clock, MapPin } from 'lucide-react';

const CATEGORY_COLORS = ['#2FC4B2', '#0B2A4A', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

export default function UpcomingEvents() {
  const router = useRouter();
  const { events } = useAppData();
  const { profile } = useChurchProfile();

  // ── Theme from context ──
  const pc = profile.primaryColor || '#0B2A4A';

  const upcoming = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 h-full flex flex-col">
      <h3 className="text-sm sm:text-base font-bold text-foreground mb-4">Upcoming Events</h3>

      <div className="space-y-3 flex-1">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2 h-full">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <CalendarPlus size={18} className="text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">No upcoming events</p>
            <p className="text-[10px] text-muted-foreground/60">Schedule events to see them here</p>
            <button
              onClick={() => router.push('/admin/secretary')}
              className="mt-2 text-[10px] sm:text-xs text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: pc }}
            >
              Schedule Event
            </button>
          </div>
        ) : (
          upcoming.map((event, idx) => {
            const dotColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => router.push('/admin/secretary')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Coloured date block */}
                  <div
                    className="w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: dotColor }}
                  >
                    <span className="text-[7px] font-black uppercase leading-none">
                      {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className="text-[13px] font-black leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={9} />
                        {event.time}
                      </span>
                      {event.location && (
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 truncate">
                          <MapPin size={9} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {event.department && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${dotColor}18`, color: dotColor }}
                    >
                      {event.department}
                    </span>
                  )}
                  <ExternalLink size={13} className="text-muted-foreground hover:text-foreground" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {upcoming.length > 0 && (
        <button
          onClick={() => router.push('/admin/secretary')}
          className="text-xs font-medium mt-3 hover:underline w-full text-right"
          style={{ color: pc }}
        >
          Browse all
        </button>
      )}
    </div>
  );
}
