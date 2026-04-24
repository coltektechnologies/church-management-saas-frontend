'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CalendarDays, MapPin, FileEdit, Users, AreaChart, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  ScheduleActivityModal,
  type ScheduleActivityInitial,
} from '@/components/departments/activities/ScheduleActivityModal';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';
import { cn } from '@/lib/utils';
import {
  deriveActivityDisplayStatus,
  fetchDepartmentActivities,
  type ActivityDisplayStatus,
  type DepartmentActivityRow,
} from '@/lib/departmentsApi';

const ACTIVITIES_QUERY_KEY = 'department-activities';

type TabFilter = 'Upcoming' | 'Past' | 'All';

function formatTime12h(hhmm: string): string {
  const part = hhmm.slice(0, 5);
  const [hs, ms] = part.split(':');
  const h = parseInt(hs ?? '0', 10);
  const m = parseInt(ms ?? '0', 10);
  if (!Number.isFinite(h)) {
    return hhmm;
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

/** Distinct badge colors: Past (neutral), Upcoming (future), Ongoing (happening now / in progress). */
function activityStatusBadgeClass(phase: ActivityDisplayStatus): string {
  const base = 'border-none font-medium px-3.5 py-0.5 text-[12px] rounded-full pointer-events-none';
  switch (phase) {
    case 'Past':
      return cn(base, 'bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300');
    case 'Ongoing':
      return cn(base, 'bg-amber-500/18 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300');
    case 'Upcoming':
    default:
      return cn(base, 'bg-sky-500/15 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300');
  }
}

function rowToCardMeta(row: DepartmentActivityRow): {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  status: ActivityDisplayStatus;
  raw: DepartmentActivityRow;
} {
  const rawT = row.start_time?.trim();
  const hhmm = rawT && rawT.includes(':') ? rawT.slice(0, 5) : (rawT ?? '');
  const tp = hhmm ? formatTime12h(hhmm) : '';
  const dateLabel = tp ? `${row.start_date} at ${tp}` : row.start_date;
  return {
    id: row.id,
    title: row.title,
    dateLabel,
    location: row.location?.trim() || '—',
    status: deriveActivityDisplayStatus(row),
    raw: row,
  };
}

export default function ActivitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center gap-2 p-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading…</span>
        </div>
      }
    >
      <ActivitiesPageInner />
    </Suspense>
  );
}

function ActivitiesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const department = usePortalDepartment();

  const [activeTab, setActiveTab] = useState<TabFilter>('Upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInitial, setSelectedInitial] = useState<ScheduleActivityInitial | undefined>(
    undefined
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const timeFilter = useMemo<'upcoming' | 'past' | undefined>(() => {
    if (activeTab === 'Upcoming') {
      return 'upcoming';
    }
    if (activeTab === 'Past') {
      return 'past';
    }
    return undefined;
  }, [activeTab]);

  const departmentId = department?.id;

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, departmentId, timeFilter ?? 'all'],
    queryFn: () => {
      if (!departmentId) {
        throw new Error('departmentId required');
      }
      return fetchDepartmentActivities(departmentId, timeFilter);
    },
    enabled: !!departmentId,
  });

  const cards = useMemo(() => rows.map(rowToCardMeta), [rows]);

  const handleCreateActivity = useCallback(() => {
    setIsEditMode(false);
    setEditingActivityId(null);
    setSelectedInitial(undefined);
    setIsModalOpen(true);
  }, []);

  /** Open “new activity” modal when landing with ?action=new */
  useEffect(() => {
    if (searchParams.get('action') !== 'new') {
      return;
    }
    const t = window.setTimeout(() => {
      handleCreateActivity();
      router.replace('/departments/activities', { scroll: false });
    }, 0);
    return () => clearTimeout(t);
  }, [searchParams, router, handleCreateActivity]);

  const handleEditActivity = useCallback((row: DepartmentActivityRow) => {
    setIsEditMode(true);
    setEditingActivityId(row.id);
    const timeShort = row.start_time?.trim() ? row.start_time.slice(0, 5) : '';
    setSelectedInitial({
      name: row.title,
      date: row.start_date,
      time: timeShort,
      location: row.location ?? '',
      description: row.description ?? '',
    });
    setIsModalOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
  }, [queryClient]);

  const noDept = !departmentId;

  return (
    <div className="w-full bg-background flex-1 p-4 sm:p-6 lg:px-8 lg:py-6 space-y-5 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 mb-1">
        <div className="flex items-center gap-2.5 text-info">
          <AreaChart className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Department Activities</h1>
        </div>
        <Button
          onClick={handleCreateActivity}
          disabled={noDept}
          className="bg-linear-to-r from-[#0c2a44]  to-[#1c5a8a] text-white hover:opacity-90 w-full sm:w-auto font-medium shadow-sm transition-all rounded-md px-5 py-2 disabled:opacity-50"
        >
          + Schedule Activity
        </Button>
      </div>

      {noDept && (
        <p className="text-sm text-muted-foreground">
          Loading your department assignment… If this persists, open the department portal from your
          profile or contact an administrator.
        </p>
      )}

      <Separator className="bg-foreground/20 mt-5" />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['Upcoming', 'Past', 'All'] as const).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`rounded-[8px] px-5 py-1.5 h-9 transition-all duration-200 whitespace-nowrap text-[14px] ${
              activeTab === tab
                ? 'bg-muted-foreground/30 text-secondary-foreground hover:bg-secondary/90 font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {isLoading && departmentId && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading activities…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center space-y-3">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Could not load activities.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && departmentId && (
        <div className="flex flex-col gap-3.5 pt-1 pb-10">
          {isFetching && cards.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
            </p>
          )}

          {cards.length === 0 && (
            <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-12 text-center space-y-2">
              <p className="text-muted-foreground text-sm">No activities in this view yet.</p>
              <Button variant="secondary" size="sm" onClick={handleCreateActivity}>
                Schedule an activity
              </Button>
            </div>
          )}

          {cards.map((activity) => (
            <Card
              key={activity.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-muted-foreground/5 border-transparent shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:bg-muted-foreground/40 transition-all duration-300 rounded-xl"
            >
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[17px] font-bold text-foreground tracking-tight">
                  {activity.title}
                </h3>
                <div className="flex flex-col items-start text-[13px] font-medium text-slate-600 dark:text-slate-400">
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

              <div className="flex flex-row justify-between md:flex-col items-start md:items-end gap-3.5">
                <Badge variant="secondary" className={activityStatusBadgeClass(activity.status)}>
                  {activity.status}
                </Badge>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleEditActivity(activity.raw)}
                    className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md"
                    title="Edit Activity"
                  >
                    <FileEdit className="h-5 w-5" strokeWidth={1.75} />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button
                    type="button"
                    className="cursor-not-allowed opacity-40 p-1 rounded-md"
                    title="Members (coming soon)"
                    disabled
                  >
                    <Users className="h-5 w-5" strokeWidth={1.75} />
                    <span className="sr-only">View Members</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ScheduleActivityModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        isEditing={isEditMode}
        initialData={selectedInitial}
        departmentId={departmentId ?? null}
        editingActivityId={editingActivityId}
        onSaved={handleSaved}
      />
    </div>
  );
}
