import type { LucideIcon } from 'lucide-react';
import { User, LayoutDashboard, Megaphone, CalendarDays, HeartHandshake } from 'lucide-react';

export interface MembershipMainNavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export const MEMBERSHIP_MAIN_NAV: MembershipMainNavItem[] = [
  { title: 'My Profile', path: '/membership/profile', icon: User },
  { title: 'Dashboard', path: '/membership/dashboard', icon: LayoutDashboard },
  { title: 'Announcements', path: '/membership/announcements', icon: Megaphone },
  { title: 'Events', path: '/membership/events', icon: CalendarDays },
  { title: 'My Giving', path: '/membership/giving', icon: HeartHandshake },
];
