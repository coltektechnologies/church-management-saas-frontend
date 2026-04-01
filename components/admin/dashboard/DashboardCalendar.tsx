'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const EVENT_DOT_COLORS = ['#2FC4B2', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#3B82F6'];

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Custom hook that drives a live clock without calling setState
// synchronously in an effect body.
function useClock(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return now;
}

export default function DashboardCalendar() {
  const { events } = useAppData();
  const { profile } = useChurchProfile();
  const pc = profile.primaryColor || '#0B2A4A';
  const churchName = profile.churchName || 'My Church';

  const mounted = useIsMounted();
  const clock = useClock();

  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const result: { day: number; current: boolean; isToday: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: prevDays - i, current: false, isToday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({
        day: d,
        current: true,
        isToday:
          d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
      });
    }
    while (result.length < 42) {
      result.push({
        day: result.length - firstDay - daysInMonth + 1,
        current: false,
        isToday: false,
      });
    }
    return result;
  }, [month, year, today]);

  const eventMap = useMemo(() => {
    const map: Record<number, string[]> = {};
    events.forEach((e, idx) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) {
          map[day] = [];
        }
        if (map[day].length < 3) {
          map[day].push(EVENT_DOT_COLORS[idx % EVENT_DOT_COLORS.length]);
        }
      }
    });
    return map;
  }, [events, year, month]);

  const prev = () => (month === 0 ? (setMonth(11), setYear((y) => y - 1)) : setMonth((m) => m - 1));
  const next = () => (month === 11 ? (setMonth(0), setYear((y) => y + 1)) : setMonth((m) => m + 1));

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
      {/* Live clock — hidden until client mounts to prevent hydration mismatch */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
        <Clock size={14} style={{ color: pc }} />
        <div>
          {mounted ? (
            <>
              <p className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                {clock.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {clock.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs sm:text-sm font-bold text-foreground tabular-nums opacity-0">
                00:00:00 AM
              </p>
              <p className="text-[10px] text-muted-foreground opacity-0">Loading...</p>
            </>
          )}
        </div>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button onClick={prev} className="hover:bg-muted rounded p-1 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs sm:text-sm font-semibold text-foreground w-32 text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={next} className="hover:bg-muted rounded p-1 transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>
        <span
          className="text-[10px] sm:text-xs text-white rounded-full px-3 py-1 font-medium truncate max-w-[110px]"
          style={{ backgroundColor: pc }}
        >
          {/* FIX: Use the mounted check here to ensure churchName 
            rendered on server matches the client's first render 
          */}
          {mounted ? churchName : 'My Church'}
        </span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs text-muted-foreground mb-1">
        {DAYS.map((d) => (
          <span key={d} className="py-1 font-medium">
            {d}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 text-center">
        {cells.map((c, i) => {
          const dots = c.current ? (eventMap[c.day] ?? []) : [];
          return (
            <div key={i} className="flex flex-col items-center py-1">
              <button
                className={[
                  'w-7 h-7 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-150',
                  !c.current ? 'text-muted-foreground/30' : 'text-foreground hover:bg-muted',
                  c.isToday ? 'font-bold text-white' : '',
                ].join(' ')}
                style={
                  c.isToday
                    ? { backgroundColor: pc, boxShadow: `0 0 0 2px white, 0 0 0 4px ${pc}` }
                    : {}
                }
              >
                {c.day}
              </button>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dots.map((color, di) => (
                    <span
                      key={di}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: c.isToday ? 'rgba(255,255,255,0.7)' : color }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event legend */}
      {Object.keys(eventMap).length > 0 && (
        <div className="mt-3 pt-2 border-t border-border space-y-1">
          {events
            .filter((e) => {
              const d = new Date(e.date);
              return d.getFullYear() === year && d.getMonth() === month;
            })
            .slice(0, 3)
            .map((e, idx) => (
              <div key={e.id} className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: EVENT_DOT_COLORS[idx % EVENT_DOT_COLORS.length] }}
                />
                <span className="text-[10px] text-muted-foreground truncate">{e.title}</span>
                <span className="text-[9px] text-muted-foreground/50 ml-auto shrink-0">
                  {new Date(e.date).getDate()}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
