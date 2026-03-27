'use client';

import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Megaphone,
  MessageSquare,
  CalendarPlus,
  FileText,
  ClipboardList,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
  { label: 'Add New Member', icon: UserPlus, href: '/secretary/members?action=add' },
  { label: 'Create Announcement', icon: Megaphone, href: '/secretary/announcements?action=add' },
  { label: 'Send Message', icon: MessageSquare, href: '/secretary/communications' },
  { label: 'Schedule Event', icon: CalendarPlus, href: '/secretary/settings?tab=events' },
  { label: 'Create Report', icon: FileText, href: '/secretary/reports' },
  { label: 'View Attendance', icon: ClipboardList, href: '/secretary/members?tab=attendance' },
  { label: 'Manage Departments', icon: Building2, href: '/secretary/departments' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Row 1 — 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
        {actions.slice(0, 5).map((action) => (
          <Card
            key={action.label}
            onClick={() => router.push(action.href)}
            className="bg-card hover:border-primary/40 cursor-pointer transition-colors group h-full"
          >
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 h-full min-h-[80px]">
              <action.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — 2 cards aligned to left columns of row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {actions.slice(5).map((action) => (
          <Card
            key={action.label}
            onClick={() => router.push(action.href)}
            className="bg-card hover:border-primary/40 cursor-pointer transition-colors group h-full"
          >
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 h-full min-h-[80px]">
              <action.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
