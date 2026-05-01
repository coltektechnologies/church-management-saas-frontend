'use client';

// import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
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
// import MembershipTopbar from '@/components/membership/MembershipTopbar';

// --- MOCK DATA ---
const KPI_DATA = {
  memberStatus: 'Active',
  memberSince: '2021',
  departmentsJoined: 3,
  upcomingEvents: 5,
  ytdGiving: 'GH₵ 2,450.00',
};

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

const UPCOMING_EVENTS = [
  {
    id: '1',
    title: 'Youth Choir Rehearsal',
    date: 'May 5, 2026',
    time: '6:00 PM',
    department: 'Youth Ministry',
    status: 'Upcoming',
  },
  {
    id: '2',
    title: 'Outreach Program Planning',
    date: 'May 12, 2026',
    time: '3:30 PM',
    department: 'Evangelism',
    status: 'Upcoming',
  },
  {
    id: '4',
    title: 'Worship Team Auditions',
    date: 'May 1, 2026',
    time: '10:00 AM',
    department: 'Music Ministry',
    status: 'Ongoing',
  },
];

const RECENT_ANNOUNCEMENTS = [
  { id: '1', title: 'Upcoming Youth Convention', date: '2 days ago', isNew: true },
  { id: '2', title: 'Mid-Year Fasting & Prayer', date: '5 days ago', isNew: false },
];

const RECENT_GIVING = [
  { id: '1', type: 'Tithe', amount: 'GH₵ 500.00', date: 'Apr 28, 2026' },
  { id: '2', type: 'Offering', amount: 'GH₵ 100.00', date: 'Apr 25, 2026' },
  { id: '3', type: 'Building Fund', amount: 'GH₵ 200.00', date: 'Apr 18, 2026' },
];
// ------------------

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

export default function MembershipDashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2E46]">
            Welcome back, John!
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {today}
          </p>
        </div>
        <div className="bg-[#2FC4B2]/18 text-[#0A2E46] px-4 py-2 rounded-lg border border-[#2FC4B2]/40 shadow-sm">
          <p className="text-[13px] font-medium italic">
            "I was glad when they said unto me, Let us go into the house of the LORD." - Psalm 122:1
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
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
            <div className="text-2xl font-bold text-[#0A2E46]">{KPI_DATA.memberStatus}</div>
            <p className="text-[13px] text-slate-600 mt-1">Since {KPI_DATA.memberSince}</p>
          </div>
        </Card>

        {/* Departments */}
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
            <div className="text-2xl font-bold text-[#0A2E46]">{KPI_DATA.departmentsJoined}</div>
            <p className="text-[13px] text-slate-600 mt-1">Active enrollments</p>
          </div>
        </Card>

        {/* Events */}
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
            <div className="text-2xl font-bold text-[#0A2E46]">{KPI_DATA.upcomingEvents}</div>
            <p className="text-[13px] text-slate-600 mt-1">Scheduled activities</p>
          </div>
        </Card>

        {/* Giving */}
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
            <div className="text-2xl font-bold text-[#0A2E46]">{KPI_DATA.ytdGiving}</div>
            <p className="text-[13px] text-slate-600 mt-1">Tithes & Offerings</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
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
                <span className="text-[14px] font-medium text-[#0A2E46]">
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Upcoming Events */}
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
            {UPCOMING_EVENTS.map((event) => (
              <Card
                key={event.id}
                className="p-4 bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-shadow rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex flex-col items-center justify-center bg-sky-100 w-12 h-12 rounded-lg border border-sky-200/80">
                    <span className="text-[10px] font-bold uppercase text-sky-800">
                      {event.date.split(' ')[0]}
                    </span>
                    <span className="text-[16px] font-bold text-sky-950 leading-none">
                      {event.date.split(' ')[1].replace(',', '')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[#0A2E46]">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" /> {event.date} • {event.time}
                      </span>
                      <span className="hidden sm:inline-block">•</span>
                      <span className="flex items-center gap-1 text-[#2FC4B2] font-medium">
                        <Shield className="w-3 h-3" /> {event.department}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className={activityStatusBadgeClass(event.status)}>
                  {event.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Announcements & Giving */}
        <div className="space-y-6">
          {/* Announcements */}
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
                {RECENT_ANNOUNCEMENTS.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-white hover:bg-sky-50/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-[14px] text-[#0A2E46] group-hover:text-[#2FC4B2] transition-colors">
                        {announcement.title}
                      </h3>
                      {announcement.isNew && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-600 mt-1.5">{announcement.date}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Giving */}
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
                {RECENT_GIVING.map((giving) => (
                  <div
                    key={giving.id}
                    className="flex items-center justify-between rounded-lg bg-teal-50/90 border border-teal-100/90 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <HeartHandshake className="w-4 h-4 text-amber-800" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#0A2E46]">
                          {giving.type}
                        </p>
                        <p className="text-[11px] text-slate-600">{giving.date}</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold text-[#0A2E46]">
                      {giving.amount}
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
