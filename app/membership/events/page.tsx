'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, MapPin, Loader2, Calendar, Shield, Eye, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import MembershipTopbar from '@/components/membership/MembershipTopbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { getAccessToken, getCurrentMemberProfile, type MemberDetail } from '@/lib/api';
import {
  deriveActivityDisplayStatus,
  fetchDepartmentActivitiesAllPages,
  fetchMemberDepartments,
  type ActivityDisplayStatus,
  type DepartmentActivityRow,
  type MemberDepartmentRow,
} from '@/lib/departmentsApi';

type TabFilter = 'Upcoming' | 'Past' | 'All';

function activitySortTime(row: DepartmentActivityRow): number {
  const day = row.start_date || '';
  const t = (row.start_time || '00:00:00').slice(0, 8);
  const d = new Date(`${day}T${t.slice(0, 5)}:00`);
  const ts = d.getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function formatTime12h(hhmm: string | null | undefined): string {
  const part = (hhmm || '00:00:00').trim().slice(0, 5);
  const [hs, ms] = part.split(':');
  const h = parseInt(hs ?? '0', 10);
  const m = parseInt(ms ?? '0', 10);
  if (!Number.isFinite(h)) {
    return String(hhmm || '');
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function activityStatusBadgeClass(phase: ActivityDisplayStatus): string {
  const base = 'border-none font-medium px-3.5 py-0.5 text-[12px] rounded-full pointer-events-none';
  switch (phase) {
    case 'Past':
      return cn(base, 'bg-slate-200 text-slate-800');
    case 'Ongoing':
      return cn(base, 'bg-amber-200 text-amber-950');
    case 'Upcoming':
    default:
      return cn(base, 'bg-sky-200 text-sky-950');
  }
}

interface EventCardModel {
  row: DepartmentActivityRow;
  status: ActivityDisplayStatus;
  departmentLabel: string;
  dateLabel: string;
  location: string;
}

function toEventCard(row: DepartmentActivityRow): EventCardModel {
  const status = deriveActivityDisplayStatus(row);
  const rawT = row.start_time?.trim();
  const hhmm = rawT && rawT.includes(':') ? rawT.slice(0, 5) : (rawT ?? '');
  const tp = hhmm ? formatTime12h(hhmm) : '';
  const datePart = formatLongDate(row.start_date);
  const dateLabel = tp ? `${datePart} at ${tp}` : datePart;
  return {
    row,
    status,
    departmentLabel: row.department_name?.trim() || 'Department',
    dateLabel,
    location: row.location?.trim() || '—',
  };
}

function mergeActivities(lists: DepartmentActivityRow[][]): DepartmentActivityRow[] {
  const byId = new Map<string, DepartmentActivityRow>();
  for (const list of lists) {
    for (const row of list) {
      if (!byId.has(row.id)) {
        byId.set(row.id, row);
      }
    }
  }
  return [...byId.values()];
}

function sortForTab(rows: DepartmentActivityRow[], tab: TabFilter): DepartmentActivityRow[] {
  if (tab === 'Upcoming') {
    const sub = rows.filter((r) => {
      const p = deriveActivityDisplayStatus(r);
      return p === 'Upcoming' || p === 'Ongoing';
    });
    return sub.sort((a, b) => activitySortTime(a) - activitySortTime(b));
  }
  if (tab === 'Past') {
    const sub = rows.filter((r) => deriveActivityDisplayStatus(r) === 'Past');
    return sub.sort((a, b) => activitySortTime(b) - activitySortTime(a));
  }
  const future = rows
    .filter((r) => deriveActivityDisplayStatus(r) !== 'Past')
    .sort((a, b) => activitySortTime(a) - activitySortTime(b));
  const past = rows
    .filter((r) => deriveActivityDisplayStatus(r) === 'Past')
    .sort((a, b) => activitySortTime(b) - activitySortTime(a));
  return [...future, ...past];
}

export default function MembershipEventsPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>('Upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [allRows, setAllRows] = useState<DepartmentActivityRow[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<EventCardModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getAccessToken()) {
        setMember(null);
        setAllRows([]);
        setError('Sign in to view department events.');
        return;
      }

      const memberRes = await getCurrentMemberProfile().catch(() => null);
      setMember(memberRes);

      if (!memberRes?.id) {
        setAllRows([]);
        return;
      }

      const assignments = await fetchMemberDepartments({ maxPages: 10 }).catch(
        () => [] as MemberDepartmentRow[]
      );
      const mine = assignments.filter((r) => r.member === memberRes.id);
      const deptIds = [...new Set(mine.map((r) => r.department))];

      if (deptIds.length === 0) {
        setAllRows([]);
        return;
      }

      const perDept = await Promise.all(
        deptIds.map(async (deptId) => {
          try {
            const [up, past] = await Promise.all([
              fetchDepartmentActivitiesAllPages(deptId, { time_filter: 'upcoming', maxPages: 15 }),
              fetchDepartmentActivitiesAllPages(deptId, { time_filter: 'past', maxPages: 15 }),
            ]);
            return [...up, ...past];
          } catch {
            return [] as DepartmentActivityRow[];
          }
        })
      );

      setAllRows(mergeActivities(perDept));
    } catch (e) {
      setAllRows([]);
      setError(e instanceof Error ? e.message : 'Could not load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredEvents = useMemo(() => {
    const sorted = sortForTab(allRows, activeTab);
    return sorted.map(toEventCard);
  }, [allRows, activeTab]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-5 animate-in fade-in duration-500">
      <MembershipTopbar
        title="My Department Events"
        subtitle="Activities from departments you belong to"
        icon={<Calendar className="text-[#2FC4B2]" size={24} />}
      />

      {error && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['Upcoming', 'Past', 'All'] as const).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`rounded-[8px] px-5 py-1.5 h-9 transition-all duration-200 whitespace-nowrap text-[14px] ${
              activeTab === tab
                ? 'bg-white text-[#0A2E46] border border-slate-200 shadow-sm font-medium'
                : 'text-slate-600 hover:bg-white/80 hover:text-[#0A2E46] font-medium'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      <Separator className="bg-slate-200" />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading events…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 pt-1 pb-10">
          {!member && !error && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-[14px] text-slate-600 shadow-sm">
              No member profile is linked to your account. Ask your church administrator to connect
              portal access so your department events appear here.
            </div>
          )}

          {member && allRows.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-[14px] text-slate-600 shadow-sm">
              No department activities found yet. When your departments schedule events, they will
              show here.
            </div>
          )}

          {member && allRows.length > 0 && filteredEvents.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-[14px] text-slate-600 shadow-sm">
              No events in this view.
            </div>
          )}

          {filteredEvents.map((activity) => (
            <Card
              key={activity.row.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-all duration-300 rounded-xl"
            >
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[17px] font-bold text-[#0A2E46] tracking-tight">
                  {activity.row.title}
                </h3>
                <div className="flex flex-col items-start text-[13px] font-medium text-slate-600 dark:text-slate-400 gap-1.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#2FC4B2]" strokeWidth={1.75} />
                    <span className="text-[#0A2E46] font-semibold">{activity.departmentLabel}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="h-4 w-4 text-slate-700 dark:text-slate-300"
                        strokeWidth={1.75}
                      />
                      <span>{activity.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4 text-slate-700 dark:text-slate-300"
                        strokeWidth={1.75}
                      />
                      <span>{activity.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between md:flex-col items-center md:items-end gap-3.5">
                <Badge variant="secondary" className={activityStatusBadgeClass(activity.status)}>
                  {activity.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedEvent(activity);
                    setIsModalOpen(true);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={activityStatusBadgeClass(selectedEvent?.status || 'Upcoming')}
              >
                {selectedEvent?.status}
              </Badge>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2FC4B2] bg-[#2FC4B2]/10 px-2 py-0.5 rounded-full">
                <Shield className="h-3 w-3" />
                <span>{selectedEvent?.departmentLabel}</span>
              </div>
            </div>
            <DialogTitle className="text-xl">{selectedEvent?.row.title}</DialogTitle>
            <DialogDescription>Details for this department activity</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4 space-y-5">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                      Date &amp; time
                    </h4>
                    <p className="text-[14px] text-foreground font-medium mt-0.5">
                      {selectedEvent.dateLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                      Location
                    </h4>
                    <p className="text-[14px] text-foreground font-medium mt-0.5">
                      {selectedEvent.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-500">
                    <AlignLeft className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Description
                    </h4>
                    {selectedEvent.row.description?.trim() ? (
                      <div className="text-[14px] leading-relaxed text-foreground bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                        {selectedEvent.row.description}
                      </div>
                    ) : (
                      <p className="text-[14px] text-muted-foreground italic">
                        No description provided for this activity.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
