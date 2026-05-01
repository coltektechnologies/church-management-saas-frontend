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
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    label: 'View Profile',
    icon: User,
    href: '/membership',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    label: 'All Events',
    icon: CalendarDays,
    href: '/membership/events',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    label: 'Announcements',
    icon: Megaphone,
    href: '/membership/announcements',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
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
      return cn(base, 'bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300');
    case 'Ongoing':
      return cn(base, 'bg-amber-500/18 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300');
    case 'Upcoming':
    default:
      return cn(base, 'bg-sky-500/15 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300');
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
    <div className="w-full bg-background flex-1 p-4 sm:p-6 lg:px-8 lg:py-6 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
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
        <div className="bg-[#2FC4B2]/10 text-[#0A2E46] px-4 py-2 rounded-lg border border-[#2FC4B2]/20">
          <p className="text-[13px] font-medium italic">
            "I was glad when they said unto me, Let us go into the house of the LORD." - Psalm 122:1
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <Card className="p-5 flex flex-col justify-center border-transparent shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              Membership
            </h3>
            <div className="bg-emerald-500/10 p-2 rounded-md">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{KPI_DATA.memberStatus}</div>
            <p className="text-[13px] text-muted-foreground mt-1">Since {KPI_DATA.memberSince}</p>
          </div>
        </Card>

        {/* Departments */}
        <Card className="p-5 flex flex-col justify-center border-transparent shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              Departments
            </h3>
            <div className="bg-blue-500/10 p-2 rounded-md">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{KPI_DATA.departmentsJoined}</div>
            <p className="text-[13px] text-muted-foreground mt-1">Active enrollments</p>
          </div>
        </Card>

        {/* Events */}
        <Card className="p-5 flex flex-col justify-center border-transparent shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              Upcoming Events
            </h3>
            <div className="bg-purple-500/10 p-2 rounded-md">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{KPI_DATA.upcomingEvents}</div>
            <p className="text-[13px] text-muted-foreground mt-1">Scheduled activities</p>
          </div>
        </Card>

        {/* Giving */}
        <Card className="p-5 flex flex-col justify-center border-transparent shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              YTD Giving
            </h3>
            <div className="bg-amber-500/10 p-2 rounded-md">
              <HeartHandshake className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{KPI_DATA.ytdGiving}</div>
            <p className="text-[13px] text-muted-foreground mt-1">Tithes & Offerings</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="py-2">
        <h2 className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, idx) => (
            <Link key={idx} href={action.href}>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group shadow-sm">
                <div
                  className={cn(
                    'p-2.5 rounded-lg transition-transform group-hover:scale-105',
                    action.bg,
                    action.color
                  )}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[14px] font-medium text-slate-700 dark:text-slate-200">
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
            <h2 className="text-[16px] font-bold text-foreground">My Upcoming Events</h2>
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
                className="p-4 border-transparent shadow-sm hover:shadow-md transition-shadow rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      {event.date.split(' ')[0]}
                    </span>
                    <span className="text-[16px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                      {event.date.split(' ')[1].replace(',', '')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-foreground">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted-foreground">
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
              <h2 className="text-[16px] font-bold text-foreground">Recent Announcements</h2>
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
            <Card className="border-transparent shadow-sm rounded-xl overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {RECENT_ANNOUNCEMENTS.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-[14px] text-slate-800 dark:text-slate-200 group-hover:text-[#2FC4B2] transition-colors">
                        {announcement.title}
                      </h3>
                      {announcement.isNew && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1.5">{announcement.date}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Giving */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] font-bold text-foreground">Recent Contributions</h2>
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
            <Card className="border-transparent shadow-sm rounded-xl p-4">
              <div className="space-y-3">
                {RECENT_GIVING.map((giving) => (
                  <div key={giving.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500/10 p-2 rounded-full">
                        <HeartHandshake className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-slate-800 dark:text-slate-200">
                          {giving.type}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{giving.date}</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold text-slate-700 dark:text-slate-300">
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
