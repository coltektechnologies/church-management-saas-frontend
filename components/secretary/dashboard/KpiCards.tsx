'use client';

/**
 * Secretary dashboard KPI strip — values from `SecretaryDashboardApiProvider` (live API).
 * Fallback subtitles when stats are missing; loading skeleton while `status === 'loading'`.
 */

import { Users, Megaphone, ClipboardCheck, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useSecretaryDashboardApi } from '@/components/secretary/contexts/SecretaryDashboardApiContext';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle: string;
  href: string;
  primaryColor: string;
  loading?: boolean;
}

function KpiCard({
  title,
  value,
  icon: Icon,
  subtitle,
  href,
  primaryColor,
  loading,
}: KpiCardProps) {
  return (
    <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <Icon className="h-4 w-4 flex-shrink-0" style={{ color: primaryColor }} />
        </div>
        <Separator />
        {loading ? (
          <div className="h-9 w-24 rounded-md bg-muted/60 animate-pulse" aria-hidden />
        ) : (
          <p className="text-2xl font-bold tabular-nums" style={{ color: primaryColor }}>
            {value}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{subtitle}</span>
          <Link
            href={href}
            className="text-[11px] text-muted-foreground hover:underline"
            style={{ color: primaryColor }}
          >
            View detail
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function fmtInt(n: number | null | undefined): string | number {
  if (n === null || n === undefined) {
    return '—';
  }
  return n.toLocaleString();
}

export function KpiCards() {
  const { profile, isReady } = useSecretaryProfile();
  const {
    status,
    kpiTotalMembers,
    kpiAnnouncementsTotal,
    kpiPendingApprovals,
    unreadNotificationCount,
    memberStats,
  } = useSecretaryDashboardApi();

  const isDark = isReady ? profile.darkMode : false;
  const primaryColor = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1E124A'
      : profile.primaryColor || '#1E124A'
    : '#1E124A';

  const loading = status === 'loading' || status === 'idle';

  const newMembersSubtitle =
    memberStats !== null && typeof memberStats.new_members_this_month === 'number'
      ? `${memberStats.new_members_this_month.toLocaleString()} new this month`
      : 'Church total';

  const cards: Omit<KpiCardProps, 'primaryColor' | 'loading'>[] = [
    {
      title: 'Total Members',
      value: fmtInt(kpiTotalMembers),
      icon: Users,
      subtitle: newMembersSubtitle,
      href: '/secretary/members',
    },
    {
      title: 'Announcements',
      value: fmtInt(kpiAnnouncementsTotal),
      icon: Megaphone,
      subtitle: 'All statuses',
      href: '/secretary/announcements',
    },
    {
      title: 'Pending Approvals',
      value: fmtInt(kpiPendingApprovals),
      icon: ClipboardCheck,
      subtitle: 'Reviews + programs',
      href: '/secretary/record-approvals',
    },
    {
      title: 'Unread Notifications',
      value: fmtInt(unreadNotificationCount),
      icon: Mail,
      subtitle: 'In-app inbox',
      href: '/secretary/communications',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} primaryColor={primaryColor} loading={loading} />
      ))}
    </div>
  );
}
