'use client';

import { useMemo, useState } from 'react';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Short labels for month dropdown — matches mock “Jan”, “Feb”, … */
const MONTH_OPTIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DashboardCalendar() {
  const { events } = useAppData();
  const { profile } = useChurchProfile();
  const ac = profile.accentColor || '#2FC4B2';
  const pc = profile.primaryColor || '#0B2A4A';
  const churchName = profile.churchName?.trim() || 'Your church';

  const anchor = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(anchor.getMonth());
  const [year, setYear] = useState(anchor.getFullYear());

  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const result: { day: number; current: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: prevDays - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, current: true });
    }
    while (result.length < 42) {
      result.push({
        day: result.length - firstDay - daysInMonth + 1,
        current: false,
      });
    }
    return result;
  }, [month, year]);

  /** Days in this visible month that have at least one event */
  const daysWithEvents = useMemo(() => {
    const set = new Set<number>();
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [events, year, month]);

  const yearOptions = useMemo(() => {
    const y = anchor.getFullYear();
    return Array.from({ length: 15 }, (_, i) => y - 7 + i);
  }, [anchor]);

  const prev = () =>
    month === 0 ? (setMonth(11), setYear((yy) => yy - 1)) : setMonth((m) => m - 1);
  const next = () =>
    month === 11 ? (setMonth(0), setYear((yy) => yy + 1)) : setMonth((m) => m + 1);

  const monthEvents = useMemo(
    () =>
      events.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      }),
    [events, year, month]
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-sm">
      {/* Header — one horizontal line: ◀ month year ▶ … church */}
      <div className="mb-4 flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin]">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous month"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="relative shrink-0">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 appearance-none rounded-md border border-input bg-background py-1.5 pl-3 pr-9 text-xs font-medium text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[4.5rem]"
          >
            {MONTH_OPTIONS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-70" />
        </div>

        <div className="relative shrink-0">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 appearance-none rounded-md border border-input bg-background py-1.5 pl-3 pr-9 text-xs font-medium text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[4.75rem]"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-70" />
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next month"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs transition-colors hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>

        {/* Church — mint pill, stays on same row (ml-auto); narrow screens scroll horizontally */}
        <div
          className="ml-auto flex h-9 min-w-0 max-w-[245px] shrink items-center justify-between gap-2 rounded-md border px-3 text-xs font-semibold shadow-xs"
          style={{
            backgroundColor: `${ac}22`,
            borderColor: `${ac}55`,
            color: pc,
          }}
        >
          <span className="min-w-0 truncate">{churchName}</span>
          <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
        </div>
      </div>

      {/* Weekday labels */}
      <div className="mb-2 grid grid-cols-7 gap-y-1 text-center">
        {DAYS.map((d) => (
          <span key={d} className="py-1.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
            {d}
          </span>
        ))}
      </div>

      {/* Dates — rounded squares; ash = past events, deep = upcoming/today */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-0 text-center">
        {cells.map((c, i) => {
          const hasEvent = c.current && daysWithEvents.has(c.day);
          const cellDate = c.current ? startOfDay(new Date(year, month, c.day)) : null;
          const isPastDay = cellDate !== null && cellDate.getTime() < todayStart.getTime();
          const isUpcomingOrToday = cellDate !== null && cellDate.getTime() >= todayStart.getTime();

          let cellClass =
            'mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-medium sm:h-10 sm:w-10 sm:text-xs transition-colors';

          if (!c.current) {
            cellClass += ' text-muted-foreground/25';
          } else if (hasEvent && isPastDay) {
            /* Past events — ash */
            cellClass +=
              ' bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100';
          } else if (hasEvent && isUpcomingOrToday) {
            /* Upcoming / today — deep */
            cellClass += ' bg-neutral-900 text-white dark:bg-neutral-950';
          } else {
            cellClass += ' text-foreground hover:bg-muted/60';
          }

          return (
            <div
              key={i}
              className="flex min-h-[2.25rem] flex-col items-center justify-start sm:min-h-[2.5rem]"
            >
              <span className={cellClass}>{c.day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend + short list */}
      {(monthEvents.length > 0 || daysWithEvents.size > 0) && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded bg-neutral-200 dark:bg-neutral-600" />
              Past event
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded bg-neutral-900 dark:bg-neutral-950" />
              Upcoming event
            </span>
          </div>
          <div className="space-y-1.5">
            {monthEvents.slice(0, 4).map((e) => {
              const d = startOfDay(new Date(e.date));
              const past = d.getTime() < todayStart.getTime();
              return (
                <div key={e.id} className="flex items-center gap-2 text-[10px] sm:text-[11px]">
                  <span
                    className={`size-2 shrink-0 rounded-sm ${past ? 'bg-neutral-300 dark:bg-neutral-500' : 'bg-neutral-900 dark:bg-neutral-950'}`}
                  />
                  <span className="truncate text-foreground">{e.title}</span>
                  <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
                    {new Date(e.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
