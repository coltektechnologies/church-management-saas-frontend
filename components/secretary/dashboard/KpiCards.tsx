'use client';

import { Users, Megaphone, ClipboardCheck, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle: string;
  href: string;
  primaryColor: string;
}

function KpiCard({ title, value, icon: Icon, subtitle, href, primaryColor }: KpiCardProps) {
  return (
    <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 flex flex-col gap-1.5">
        {/* Title + Icon — no background on icon */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <Icon className="h-4 w-4 flex-shrink-0" style={{ color: primaryColor }} />
        </div>
        <Separator />
        {/* Value */}
        <p className="text-2xl font-bold" style={{ color: primaryColor }}>
          {value}
        </p>
        {/* Footer */}
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

export function KpiCards() {
  const { profile, isReady } = useSecretaryProfile();
  const isDark = isReady ? profile.darkMode : false;

  // Default #1E124A but overridden by saved theme colour
  const primaryColor = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1E124A'
      : profile.primaryColor || '#1E124A'
    : '#1E124A';

  const cards: Omit<KpiCardProps, 'primaryColor'>[] = [
    {
      title: 'Total Members',
      value: '1,000',
      icon: Users,
      subtitle: 'Last month',
      href: '/secretary/members',
    },
    {
      title: 'Announcements',
      value: '1,050',
      icon: Megaphone,
      subtitle: 'Last month',
      href: '/secretary/announcements',
    },
    {
      title: 'Pending Approvals',
      value: 8,
      icon: ClipboardCheck,
      subtitle: 'Last month',
      href: '/secretary/record-approvals',
    },
    {
      title: 'Unread Messages',
      value: 24,
      icon: Mail,
      subtitle: 'Last month',
      href: '/secretary/communications',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} primaryColor={primaryColor} />
      ))}
    </div>
  );
}
