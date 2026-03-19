'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react';

const CATEGORY_COLORS = ['#2FC4B2', '#0B2A4A', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

const PAGE_SIZE = 4;

export default function LatestEvents() {
  const router = useRouter();
  const { events, departments } = useAppData();
  const { profile } = useChurchProfile();

  // ── Theme & church name from context ──
  const pc = profile.primaryColor || '#0B2A4A';
  const churchName = profile.churchName || 'Church'; // <-- from account settings

  const [filterDept, setFilterDept] = useState('All');
  const [page, setPage] = useState(0);

  const deptNames = ['All', ...departments.map((d) => d.name)];

  const filtered = [...events]
    .filter((e) => filterDept === 'All' || e.department === filterDept)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Latest Events</h3>
          {/* Church name from account settings via ChurchProfileContext */}
          <p className="text-[10px] text-muted-foreground mt-0.5">{churchName}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setPage(0);
            }}
            className="text-xs border border-border rounded-full px-3 py-1 bg-card text-foreground cursor-pointer"
          >
            {deptNames.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="w-7 h-7 rounded-full text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: pc }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-3 flex-1">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <CalendarPlus size={18} className="text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {filterDept === 'All' ? 'No events yet' : `No events for ${filterDept}`}
            </p>
            <button
              onClick={() => router.push('/admin/secretary')}
              className="mt-1 text-[10px] sm:text-xs text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: pc }}
            >
              Add Event
            </button>
          </div>
        ) : (
          paged.map((event, idx) => {
            const colorIdx = departments.findIndex((d) => d.name === event.department);
            const dotColor =
              CATEGORY_COLORS[(colorIdx >= 0 ? colorIdx + 1 : idx) % CATEGORY_COLORS.length];
            const dateObj = new Date(event.date);
            const dayNum = dateObj.getDate();
            const month = dateObj.toLocaleDateString('en-GB', { month: 'short' });

            return (
              <div
                key={event.id}
                className="rounded-lg p-3 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: `${dotColor}12` }}
                onClick={() => router.push('/admin/secretary')}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0"
                    style={{ backgroundColor: `${dotColor}20` }}
                  >
                    <span className="text-[8px] font-black uppercase" style={{ color: dotColor }}>
                      {month}
                    </span>
                    <span
                      className="text-[15px] font-black leading-none"
                      style={{ color: dotColor }}
                    >
                      {dayNum}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {event.title}
                      </p>
                      {event.department && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${dotColor}20`, color: dotColor }}
                        >
                          {event.department}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.date} &nbsp; {event.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Page {currentPage + 1} of {totalPages}
        </p>
      )}
    </div>
  );
}
