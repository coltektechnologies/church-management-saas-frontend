'use client';

import { useState, useMemo } from 'react';
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

type TabFilter = 'Upcoming' | 'Past' | 'All';
type ActivityDisplayStatus = 'Past' | 'Ongoing' | 'Upcoming';

interface MockEvent {
  id: string;
  title: string;
  department: string;
  status: ActivityDisplayStatus;
  start_date: string;
  start_time: string;
  location: string;
  description?: string;
}

// Mock data representing events from departments the member belongs to
const MOCK_EVENTS: MockEvent[] = [
  {
    id: '1',
    title: 'Youth Choir Rehearsal',
    department: 'Youth Ministry',
    status: 'Upcoming',
    start_date: '2026-05-05',
    start_time: '18:00:00',
    location: 'Main Auditorium',
    description:
      'We will be rehearsing for the upcoming youth Sunday service. Please come prepared with your sheet music and practice the vocal parts we assigned last week.',
  },
  {
    id: '2',
    title: 'Outreach Program Planning',
    department: 'Evangelism',
    status: 'Upcoming',
    start_date: '2026-05-12',
    start_time: '15:30:00',
    location: 'Conference Room B',
    description:
      'Planning meeting for the community health screening outreach program next month. We need to finalize the volunteer schedules and the supplies needed.',
  },
  {
    id: '3',
    title: 'Joint Prayer Meeting',
    department: 'Prayer Band',
    status: 'Past',
    start_date: '2026-04-20',
    start_time: '19:00:00',
    location: 'Church Hall',
    description:
      'Monthly joint prayer meeting with the intercessory team. We will be praying for the church leadership, the upcoming convention, and the nation.',
  },
  {
    id: '4',
    title: 'Worship Team Auditions',
    department: 'Music Ministry',
    status: 'Ongoing',
    start_date: '2026-05-01',
    start_time: '10:00:00',
    location: 'Music Room',
    description:
      'Auditions for new instrumentalists and vocalists to join the main worship team. Please arrive 15 minutes early to set up.',
  },
  {
    id: '5',
    title: 'Youth Weekend Retreat',
    department: 'Youth Ministry',
    status: 'Past',
    start_date: '2026-03-15',
    start_time: '09:00:00',
    location: 'Camp Shalom',
    description:
      'A 3-day spiritual retreat for the youth ministry members focused on spiritual growth, team building, and leadership development.',
  },
];

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

function rowToCardMeta(row: MockEvent) {
  const rawT = row.start_time?.trim();
  const hhmm = rawT && rawT.includes(':') ? rawT.slice(0, 5) : (rawT ?? '');
  const tp = hhmm ? formatTime12h(hhmm) : '';
  const dateLabel = tp ? `${row.start_date} at ${tp}` : row.start_date;
  return {
    ...row,
    dateLabel,
    location: row.location?.trim() || '—',
  };
}

export default function MembershipEventsPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>('Upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ReturnType<typeof rowToCardMeta> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    let filtered = MOCK_EVENTS;
    if (activeTab === 'Upcoming') {
      filtered = MOCK_EVENTS.filter((e) => e.status === 'Upcoming' || e.status === 'Ongoing');
    } else if (activeTab === 'Past') {
      filtered = MOCK_EVENTS.filter((e) => e.status === 'Past');
    }
    return filtered.map(rowToCardMeta);
  }, [activeTab]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <MembershipTopbar
        title="My Department Events"
        subtitle="View upcoming and past activities from departments you are a member of"
        icon={<Calendar className="text-[#2FC4B2]" size={24} />}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['Upcoming', 'Past', 'All'] as const).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => {
              setIsLoading(true);
              setActiveTab(tab);
              // Simulate small delay for tab switching
              setTimeout(() => setIsLoading(false), 300);
            }}
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

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading events…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 pt-1 pb-10">
          {filteredEvents.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center space-y-2 shadow-sm">
              <p className="text-slate-600 text-sm">No events in this view yet.</p>
            </div>
          )}

          {filteredEvents.map((activity) => (
            <Card
              key={activity.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-all duration-300 rounded-xl"
            >
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[17px] font-bold text-[#0A2E46] tracking-tight">
                  {activity.title}
                </h3>
                <div className="flex flex-col items-start text-[13px] font-medium text-slate-600 dark:text-slate-400 gap-1.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#2FC4B2]" strokeWidth={1.75} />
                    <span className="text-[#0A2E46] font-semibold">{activity.department}</span>
                  </div>
                  <div className="flex items-center gap-4">
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

      {/* View Event Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant="secondary"
                className={activityStatusBadgeClass(selectedEvent?.status || 'Upcoming')}
              >
                {selectedEvent?.status}
              </Badge>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2FC4B2] bg-[#2FC4B2]/10 px-2 py-0.5 rounded-full">
                <Shield className="h-3 w-3" />
                <span>{selectedEvent?.department}</span>
              </div>
            </div>
            <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
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
                      Date & Time
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
                  <div className="flex-1">
                    <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Description
                    </h4>
                    {selectedEvent.description ? (
                      <div className="text-[14px] leading-relaxed text-foreground bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        {selectedEvent.description}
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
