'use client';

import { useRouter } from 'next/navigation';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';
import {
  UserPlus,
  Megaphone,
  HandCoins,
  MessageSquare,
  CalendarPlus,
  FileBarChart,
  ClipboardList,
  Building2,
} from 'lucide-react';

const ACTIONS = [
  { id: 'add-member', label: 'Add New Member', icon: UserPlus, route: '/admin/members' },
  {
    id: 'announcement',
    label: 'Create Announcement',
    icon: Megaphone,
    route: '/admin/announcements',
  },
  { id: 'offerings', label: 'Record Offerings', icon: HandCoins, route: '/admin/treasury' },
  { id: 'message', label: 'Send Message', icon: MessageSquare, route: '/admin/announcements' },
  { id: 'event', label: 'Schedule Event', icon: CalendarPlus, route: '/admin/secretary' },
  { id: 'report', label: 'Create Report', icon: FileBarChart, route: '/admin/reports' },
  { id: 'attendance', label: 'View Attendance', icon: ClipboardList, route: '/admin/members' },
  { id: 'departments', label: 'Manage Departments', icon: Building2, route: '/admin/departments' },
];

export default function QuickActions() {
  const router = useRouter();
  const { profile } = useChurchProfile();

  // ── Theme from context ──
  const pc = profile.primaryColor || '#0B2A4A';

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
      <h3 className="text-sm sm:text-base font-bold text-foreground mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => router.push(action.route)}
              className="flex flex-col items-center gap-2 border border-border rounded-xl p-3 sm:p-4
                         hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-200 text-center group cursor-pointer bg-card"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `${pc}18` }}
              >
                <Icon size={18} style={{ color: pc }} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-foreground leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
