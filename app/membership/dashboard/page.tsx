'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Shield,
  CalendarDays,
  HeartHandshake,
  ArrowRight,
  Megaphone,
  CreditCard,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAccessToken,
  getCurrentMemberProfile,
  getMemberGivingSummary,
  type MemberDetail,
  type MemberGivingSummary,
} from '@/lib/api';
import {
  deriveActivityDisplayStatus,
  fetchDepartmentActivities,
  fetchMemberDepartments,
  type DepartmentActivityRow,
  type MemberDepartmentRow,
} from '@/lib/departmentsApi';
import { fetchAnnouncementsList, type AnnouncementListItemApi } from '@/lib/announcementsApi';
import {
  displayMemberName,
  formatDateLong,
  formatEnumLabel,
} from '@/components/membership/memberProfileDisplay';

const QUICK_ACTIONS = [
  {
    label: 'Give Offering',
    icon: CreditCard,
    href: '/membership/giving',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
  },
  {
    label: 'View Profile',
    icon: User,
    href: '/membership/profile',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  {
    label: 'All Events',
    icon: CalendarDays,
    href: '/membership/events',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
  {
    label: 'Announcements',
    icon: Megaphone,
    href: '/membership/announcements',
    color: 'text-amber-800',
    bg: 'bg-amber-100',
  },
];

function activityStatusBadgeClass(phase: string): string {
  const base = 'border-none font-medium px-2 py-0.5 text-[11px] rounded-full pointer-events-none';
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

function formatTime12h(hhmm: string | null | undefined): string {
  const part = (hhmm || '00:00:00').trim().slice(0, 5);
  const [hs, ms] = part.split(':');
  const h = parseInt(hs ?? '0', 10);
  const m = parseInt(ms ?? '0', 10);
  if (!Number.isFinite(h)) {
    return hhmm || '';
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function formatGhs(amount: string): string {
  const n = parseFloat(amount);
  if (!Number.isFinite(n)) {
    return `GH₵ ${amount}`;
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function activitySortTime(row: DepartmentActivityRow): number {
  const day = row.start_date || '';
  const t = (row.start_time || '00:00:00').slice(0, 8);
  const d = new Date(`${day}T${t.slice(0, 5)}:00`);
  const ts = d.getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function formatLongUs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatRelativePublished(iso: string | null): string {
  if (!iso) {
    return '';
  }
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) {
    return '';
  }
  const diffMs = Date.now() - then.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return '1 day ago';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isAnnouncementNew(a: AnnouncementListItemApi): boolean {
  const raw = a.publish_at || a.created_at;
  if (!raw) {
    return false;
  }
  const d = new Date(raw);
  const diff = Date.now() - d.getTime();
  return diff >= 0 && diff < 7 * 86400000;
}

function sessionFallbackName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    const u = JSON.parse(raw) as { first_name?: string; email?: string };
    const fn = (u.first_name || '').trim();
    if (fn) {
      return fn;
    }
    const email = (u.email || '').trim();
    if (email.includes('@')) {
      return email.split('@')[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function MembershipDashboard() {
  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [upcomingActivities, setUpcomingActivities] = useState<DepartmentActivityRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementListItemApi[]>([]);
  const [givingSummary, setGivingSummary] = useState<MemberGivingSummary | null>(null);
  const [departmentEnrollmentCount, setDepartmentEnrollmentCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (!getAccessToken()) {
        setMember(null);
        setUpcomingActivities([]);
        setAnnouncements([]);
        setGivingSummary(null);
        setDepartmentEnrollmentCount(0);
        setLoadError('Sign in to load your membership dashboard.');
        return;
      }

      const [memberRes, annList] = await Promise.all([
        getCurrentMemberProfile().catch(() => null),
        fetchAnnouncementsList({ page_size: 8 }).catch(() => [] as AnnouncementListItemApi[]),
      ]);

      setMember(memberRes);
      setAnnouncements(Array.isArray(annList) ? annList : []);

      if (!memberRes?.id) {
        setUpcomingActivities([]);
        setGivingSummary(null);
        setDepartmentEnrollmentCount(0);
        return;
      }

      const mid = memberRes.id;
      const [assignmentRows, givingRes] = await Promise.all([
        fetchMemberDepartments({ maxPages: 8 }).catch(() => [] as MemberDepartmentRow[]),
        getMemberGivingSummary().catch(() => null),
      ]);

      setGivingSummary(givingRes);

      const mine = assignmentRows.filter((r) => r.member === mid);
      setDepartmentEnrollmentCount(new Set(mine.map((r) => r.department)).size);
      const deptIds = [...new Set(mine.map((r) => r.department))];
      const activityLists =
        deptIds.length > 0
          ? await Promise.all(
              deptIds.map((deptId) =>
                fetchDepartmentActivities(deptId, 'upcoming').catch(() => [] as DepartmentActivityRow[])
              )
            )
          : [];

      const byId = new Map<string, DepartmentActivityRow>();
      for (const list of activityLists) {
        for (const row of list) {
          if (!byId.has(row.id)) {
            byId.set(row.id, row);
          }
        }
      }
      const merged = [...byId.values()].sort((a, b) => activitySortTime(a) - activitySortTime(b));
      setUpcomingActivities(merged);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load dashboard');
      setMember(null);
      setUpcomingActivities([]);
      setAnnouncements([]);
      setGivingSummary(null);
      setDepartmentEnrollmentCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const welcomeName = useMemo(() => {
    if (member) {
      return displayMemberName(member);
    }
    return sessionFallbackName();
  }, [member]);

  const membershipLabel = useMemo(
    () => (member?.membership_status ? formatEnumLabel(member.membership_status) : '—'),
    [member]
  );

  const activeEventCount = useMemo(() => {
    return upcomingActivities.filter((a) => {
      const s = deriveActivityDisplayStatus(a);
      return s === 'Upcoming' || s === 'Ongoing';
    }).length;
  }, [upcomingActivities]);

  const ytdDisplay = useMemo(() => {
    if (!givingSummary) {
      return '—';
    }
    return formatGhs(givingSummary.ytd_total);
  }, [givingSummary]);

  const displayEvents = useMemo(() => upcomingActivities.slice(0, 8), [upcomingActivities]);
  const displayAnnouncements = useMemo(() => announcements.slice(0, 4), [announcements]);
  const displayGiving = useMemo(() => (givingSummary?.recent ?? []).slice(0, 4), [givingSummary]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      {loadError && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2E46]">
            {loading ? (
              <span className="inline-block h-9 w-64 animate-pulse rounded bg-slate-200" />
            ) : (
              <>Welcome back{welcomeName ? `, ${welcomeName}` : ''}!</>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {today}
          </p>
        </div>
        <div className="bg-[#2FC4B2]/18 text-[#0A2E46] px-4 py-2 rounded-lg border border-[#2FC4B2]/40 shadow-sm">
          <p className="text-[13px] font-medium italic">
            &quot;I was glad when they said unto me, Let us go into the house of the LORD.&quot; - Psalm
            122:1
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-center bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-shadow rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-slate-600 uppercase tracking-wider">
              Membership
            </h3>
            <div className="bg-emerald-100 p-2 rounded-md">
              <UserCheck className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-8 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-36 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#0A2E46]">{membershipLabel}</div>
                <p className="text-[13px] text-slate-600 mt-1">
                  Since {member?.member_since ? formatDateLong(member.member_since) : '—'}
                </p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-center bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-shadow rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-slate-600 uppercase tracking-wider">
              Departments
            </h3>
            <div className="bg-blue-100 p-2 rounded-md">
              <Shield className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-8 w-12 bg-slate-200 rounded" />
                <div className="h-4 w-40 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#0A2E46]">{departmentEnrollmentCount}</div>
                <p className="text-[13px] text-slate-600 mt-1">Active enrollments</p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-center bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-shadow rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-slate-600 uppercase tracking-wider">
              Upcoming Events
            </h3>
            <div className="bg-purple-100 p-2 rounded-md">
              <CalendarDays className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-8 w-12 bg-slate-200 rounded" />
                <div className="h-4 w-44 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#0A2E46]">{activeEventCount}</div>
                <p className="text-[13px] text-slate-600 mt-1">Across your departments</p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-center bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-shadow rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-slate-600 uppercase tracking-wider">
              YTD Giving
            </h3>
            <div className="bg-amber-100 p-2 rounded-md">
              <HeartHandshake className="w-5 h-5 text-amber-800" />
            </div>
          </div>
          <div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-8 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-36 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#0A2E46]">{ytdDisplay}</div>
                <p className="text-[13px] text-slate-600 mt-1">Recorded tithes &amp; offerings</p>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="py-2">
        <h2 className="text-[14px] font-semibold text-slate-600 uppercase tracking-wider mb-3 px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, idx) => (
            <Link key={idx} href={action.href}>
              <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center gap-3 hover:border-[#2FC4B2]/50 transition-colors cursor-pointer group shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_14px_-6px_rgba(15,23,42,0.12)]">
                <div
                  className={cn(
                    'p-2.5 rounded-lg transition-transform group-hover:scale-105',
                    action.bg,
                    action.color
                  )}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[14px] font-medium text-[#0A2E46]">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[16px] font-bold text-[#0A2E46]">My Upcoming Events</h2>
            <Link href="/membership/events">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[13px] text-[#2FC4B2] hover:text-[#2FC4B2] hover:bg-[#2FC4B2]/10 px-2"
              >
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {loading && (
              <Card className="p-8 rounded-xl border border-slate-200/90 animate-pulse bg-slate-50" />
            )}
            {!loading && displayEvents.length === 0 && (
              <Card className="p-6 text-center text-[13px] text-slate-600 border border-slate-200/90 rounded-xl">
                {member
                  ? 'No upcoming department activities found. When your departments add events, they will appear here.'
                  : 'Link a member profile to your account to see department activities here.'}
              </Card>
            )}
            {!loading &&
              displayEvents.map((event) => {
                const phase = deriveActivityDisplayStatus(event);
                const start = new Date(event.start_date);
                const monthShort = Number.isNaN(start.getTime())
                  ? ''
                  : start.toLocaleDateString('en-US', { month: 'short' });
                const dayNum = Number.isNaN(start.getTime()) ? '' : String(start.getDate());
                const deptLabel = event.department_name?.trim() || 'Department';
                return (
                  <Card
                    key={event.id}
                    className="p-4 bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-shadow rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex flex-col items-center justify-center bg-sky-100 w-12 h-12 rounded-lg border border-sky-200/80">
                        <span className="text-[10px] font-bold uppercase text-sky-800">{monthShort}</span>
                        <span className="text-[16px] font-bold text-sky-950 leading-none">{dayNum}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-[15px] text-[#0A2E46]">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[12px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formatLongUs(event.start_date)} • {formatTime12h(event.start_time)}
                          </span>
                          <span className="hidden sm:inline-block">•</span>
                          <span className="flex items-center gap-1 text-[#2FC4B2] font-medium">
                            <Shield className="w-3 h-3" /> {deptLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={activityStatusBadgeClass(phase)}>
                      {phase}
                    </Badge>
                  </Card>
                );
              })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] font-bold text-[#0A2E46]">Recent Announcements</h2>
              <Link href="/membership/announcements">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[13px] text-[#2FC4B2] hover:text-[#2FC4B2] hover:bg-[#2FC4B2]/10 px-2"
                >
                  All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <Card className="bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] rounded-xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {loading && (
                  <div className="p-6 animate-pulse bg-slate-50">
                    <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                  </div>
                )}
                {!loading && displayAnnouncements.length === 0 && (
                  <div className="p-6 text-[13px] text-slate-600 text-center">No announcements yet.</div>
                )}
                {!loading &&
                  displayAnnouncements.map((a) => (
                    <Link key={a.id} href="/membership/announcements" className="block">
                      <div className="p-4 bg-white hover:bg-sky-50/60 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-[14px] text-[#0A2E46] group-hover:text-[#2FC4B2] transition-colors">
                            {a.title}
                          </h3>
                          {isAnnouncementNew(a) && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-slate-600 mt-1.5">
                          {formatRelativePublished(a.publish_at || a.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] font-bold text-[#0A2E46]">Recent Contributions</h2>
              <Link href="/membership/giving">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[13px] text-[#2FC4B2] hover:text-[#2FC4B2] hover:bg-[#2FC4B2]/10 px-2"
                >
                  History <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <Card className="bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] rounded-xl p-4">
              <div className="space-y-3">
                {loading && (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-14 bg-slate-100 rounded-lg" />
                    <div className="h-14 bg-slate-100 rounded-lg" />
                  </div>
                )}
                {!loading && displayGiving.length === 0 && (
                  <p className="text-[13px] text-slate-600 text-center py-2">
                    {member
                      ? 'No giving recorded for your profile yet this year.'
                      : 'Sign in with a linked member account to see your contributions.'}
                  </p>
                )}
                {!loading &&
                  displayGiving.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-lg bg-teal-50/90 border border-teal-100/90 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-amber-100 p-2 rounded-full shrink-0">
                          <HeartHandshake className="w-4 h-4 text-amber-800" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#0A2E46] truncate">
                            {row.category_name || 'Giving'}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {formatDateLong(row.transaction_date)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[14px] font-bold text-[#0A2E46] shrink-0 ml-2">
                        {formatGhs(row.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
