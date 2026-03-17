'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  CheckCheck,
  X,
  User,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import {
  useChurchProfile,
  type SubscriptionStatus,
} from '@/components/admin/contexts/ChurchProfileContext';
import { mockNotifications, type MockNotification } from '@/components/admin/mock/mockData';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface AvatarProps {
  size: number;
  avatarUrl: string | null;
  adminName: string;
  primaryColor: string;
  isReady: boolean;
}

interface NotifRowProps {
  n: MockNotification;
  compact?: boolean;
  onMark: (id: string | number) => void;
  onDismiss: (id: string | number, e: React.MouseEvent) => void;
}

/* ─── Sub-components (defined OUTSIDE the parent — no recreate on render) ───── */

function NavAvatar({ size, avatarUrl, adminName, primaryColor, isReady }: AvatarProps) {
  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (isReady && avatarUrl) {
    return (
      <div
        className="relative shrink-0 rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image src={avatarUrl} alt={adminName} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center text-white font-bold select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: primaryColor,
        fontSize: Math.round(size * 0.35),
      }}
    >
      {initials || '?'}
    </div>
  );
}

function NotifRow({ n, compact, onMark, onDismiss }: NotifRowProps) {
  const NOTIF_DOT: Record<string, string> = {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onMark(n.id)}
      onKeyDown={(e) => e.key === 'Enter' && onMark(n.id)}
      className={[
        'w-full text-left flex items-start gap-3 px-4 transition-colors group relative cursor-pointer',
        compact ? 'py-2' : 'py-3',
        !n.read
          ? 'bg-blue-50/60 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10'
          : 'hover:bg-gray-50 dark:hover:bg-white/5',
      ].join(' ')}
    >
      <div className="mt-2 shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: n.read ? '#D1D5DB' : NOTIF_DOT[n.type] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] leading-snug truncate ${!n.read ? 'font-semibold text-[#0B2A4A] dark:text-white' : 'font-normal text-gray-400 dark:text-white/40'}`}
        >
          {n.title}
        </p>
        {!compact && (
          <p className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5 line-clamp-1">
            {(n as MockNotification & { description?: string; message?: string }).description ||
              (n as MockNotification & { message?: string }).message}
          </p>
        )}
        <p className="text-[10px] text-gray-300 dark:text-white/30 mt-0.5">
          {(n as MockNotification & { time?: string }).time}
        </p>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => onDismiss(n.id, e)}
        onKeyDown={(e) => e.key === 'Enter' && onDismiss(n.id, e as unknown as React.MouseEvent)}
        className="opacity-0 group-hover:opacity-100 shrink-0 mt-1 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center transition-opacity cursor-pointer"
      >
        <X size={10} className="text-gray-400" />
      </div>
    </div>
  );
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<
  SubscriptionStatus,
  { label: string; color: string; bg: string; darkBg: string }
> = {
  trial: { label: 'On Trial', color: '#B45309', bg: '#FEF3C7', darkBg: '#78350F' },
  active: { label: 'Active', color: '#065F46', bg: '#D1FAE5', darkBg: '#064E3B' },
  inactive: { label: 'Inactive', color: '#991B1B', bg: '#FEE2E2', darkBg: '#7F1D1D' },
};

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/members': 'Members',
  '/admin/secretary': 'Secretary',
  '/admin/treasury': 'Treasury',
  '/admin/departments': 'Departments',
  '/admin/announcements': 'Announcements',
  '/admin/reports': 'Reports',
  '/admin/approvals': 'Approvals',
  '/admin/settings/superadmin': 'Settings',
  '/admin/settings/superadmin/billing': 'Billing',
  '/admin/settings/superadmin/security': 'Security',
  '/admin/settings/superadmin/notifications': 'Notifications',
  '/admin/settings/superadmin/profile': 'Your Profile',
  '/admin/notifications': 'Notifications',
  '/admin/profile': 'Your Profile',
};

/* ─── Main component ─────────────────────────────────────────────────────────── */

import { Menu } from 'lucide-react';

interface Props {
  onMenuClick: () => void;
}

export default function TopNavbar({ onMenuClick }: Props) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          <Menu size={20} />
        </button>
        <div className="text-lg font-semibold text-gray-800">Dashboard</div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Toggle Placeholder */}
        <div className="w-10 h-5 bg-gray-300 rounded-full"></div>

        {/* Notification */}
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>

        {/* Profile */}
        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
      </div>
    </header>
  );
}
