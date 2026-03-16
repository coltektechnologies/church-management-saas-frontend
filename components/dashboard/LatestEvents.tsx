'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface LatestEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  department?: string;
}

const LatestEvents = ({
  events = [],
  departments = [],
}: {
  events?: LatestEvent[];
  departments?: string[];
}) => {
  const [filterDept, setFilterDept] = useState('All');
  const [page, setPage] = useState(0);
  const perPage = 3;

  const allDepts = ['All', ...new Set(departments)];
  const filtered =
    filterDept === 'All' ? events : events.filter((e) => e.department === filterDept);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const maxPage = Math.max(0, Math.ceil(filtered.length / perPage) - 1);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CalendarDays size={18} />
          </div>
          <h3 className="text-base font-black text-[#0B2A4A] tracking-tight">Latest Events</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setPage(0);
            }}
            className="text-[10px] font-bold border border-border rounded-lg px-3 py-1.5 bg-muted/30 outline-none"
          >
            {allDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
            <CalendarDays size={32} strokeWidth={1} />
            <p className="text-xs font-bold mt-2">No events scheduled</p>
          </div>
        ) : (
          paged.map((event) => (
            <div
              key={event.id}
              className="group bg-muted/30 hover:bg-muted/50 transition-all rounded-xl p-4 border border-transparent hover:border-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[#0B2A4A] leading-tight mb-1">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>{event.date}</span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full opacity-30" />
                    <span>{event.time}</span>
                  </div>
                </div>
                {event.department && (
                  <span className="shrink-0 text-[9px] font-black bg-primary/10 text-primary px-2 py-1 rounded-md uppercase tracking-tighter">
                    {event.department}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LatestEvents;
