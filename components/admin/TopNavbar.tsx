'use client';

import { useState, useRef, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { formatDistanceToNow } from 'date-fns';
import { useChurchProfile, type SubscriptionStatus } from '@/components/admin/dashboard/contexts';
import {
  NOTIFICATIONS_LIST_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_KEY,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsListQuery,
  useUnreadNotificationCountQuery,
} from '@/hooks/useNotificationsInbox';
import type { MockNotificationItem } from '@/services/notificationsMock';
import { notificationsApiEnabled } from '@/services/notificationsService';
import { performLogout } from '@/lib/churchSessionBrowser';
import { getChurchId, updateChurch } from '@/lib/settingsApi';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface NavAvatarProps {
  size: number;
  avatarUrl: string | null;
  adminName: string;
  primaryColor: string;
  isReady: boolean;
}

function NavAvatar({ size, avatarUrl, adminName, primaryColor, isReady }: NavAvatarProps) {
  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
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

type NavbarNotifTone = 'info' | 'success' | 'warning' | 'error';

interface NavbarNotificationRow {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  read: boolean;
  tone: NavbarNotifTone;
}

function mapInboxItemToNavbarRow(n: MockNotificationItem): NavbarNotificationRow {
  let tone: NavbarNotifTone = 'info';
  if (n.priority === 'URGENT' || n.status === 'FAILED') {
    tone = 'error';
  } else if (n.priority === 'HIGH') {
    tone = 'warning';
  }
  const msg = (n.message || '').trim();
  return {
    id: n.id,
    title: n.title,
    subtitle: msg.length > 140 ? `${msg.slice(0, 137)}…` : msg,
    timeLabel: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
    read: n.is_read,
    tone,
  };
}

interface NotifRowProps {
  n: NavbarNotificationRow;
  compact?: boolean;
  showDismiss?: boolean;
  onMark: (id: string) => void;
  onDismiss?: (id: string, e: React.MouseEvent) => void;
}

function NotifRow({ n, compact, showDismiss = false, onMark, onDismiss }: NotifRowProps) {
  const DOT: Record<NavbarNotifTone, string> = {
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
          ? 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-950/35 dark:hover:bg-blue-950/50'
          : 'hover:bg-gray-50 dark:hover:bg-white/5',
      ].join(' ')}
    >
      <div className="mt-2 shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: n.read ? '#D1D5DB' : DOT[n.tone] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] leading-snug truncate ${!n.read ? 'font-semibold text-[#0B2A4A] dark:text-white' : 'font-normal text-gray-400 dark:text-slate-500'}`}
        >
          {n.title}
        </p>
        {!compact && n.subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 line-clamp-1">
            {n.subtitle}
          </p>
        )}
        <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-0.5">{n.timeLabel}</p>
      </div>
      {showDismiss && onDismiss && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => onDismiss(n.id, e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onDismiss(n.id, e as unknown as React.MouseEvent);
            }
          }}
          className="opacity-0 group-hover:opacity-100 shrink-0 mt-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center transition-opacity cursor-pointer"
        >
          <X size={10} className="text-gray-400" />
        </div>
      )}
    </div>
  );
}

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
  '/admin/settings/superadmin/profile': 'Profile',
  '/admin/notifications': 'Notifications',
  '/admin/profile': 'Profile',
};

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isReady, toggleDarkMode } = useChurchProfile();

  const mounted = useIsMounted();
  const dark = mounted ? (profile.darkMode ?? false) : false;

  const handleDarkModeToggle = useCallback(() => {
    const nextDark = !(profile.darkMode ?? false);
    toggleDarkMode();
    const churchId = getChurchId();
    if (churchId) {
      void updateChurch(churchId, { dark_mode: nextDark }).catch(() => {});
    }
  }, [profile.darkMode, toggleDarkMode]);

  // ── All profile-derived values guarded with mounted to prevent hydration mismatch ──
  const pc = mounted ? profile.primaryColor || '#0B2A4A' : '#0B2A4A';
  const churchName = mounted ? profile.churchName || 'Your Church' : 'Your Church';
  const adminName = mounted ? profile.adminName || 'Admin User' : 'Admin User';
  const adminEmail = mounted ? profile.adminEmail || '' : '';
  const adminRole = mounted ? profile.adminRole || 'Admin' : 'Admin';
  const statusKey = mounted ? profile.subscriptionStatus || 'trial' : 'trial';

  const statusStyle = STATUS_STYLES[statusKey];

  const pageTitle =
    PAGE_TITLES[pathname] ??
    (() => {
      const seg = pathname.split('/').filter(Boolean);
      const last = seg[seg.length - 1] || 'dashboard';
      return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    })();

  const [statusOpen, setStatusOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifHover, setNotifHover] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const queryClient = useQueryClient();
  const useLiveNotifs = notificationsApiEnabled();
  const inboxQuery = useNotificationsListQuery('inbox', { enabled: useLiveNotifs });
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const notifRows = useMemo(() => {
    if (!useLiveNotifs || !inboxQuery.data) {
      return [];
    }
    return inboxQuery.data.map(mapInboxItemToNavbarRow);
  }, [useLiveNotifs, inboxQuery.data]);

  const unread = useMemo(() => notifRows.filter((n) => !n.read), [notifRows]);
  const readNotifs = useMemo(() => notifRows.filter((n) => n.read), [notifRows]);
  const unreadCount = useLiveNotifs ? (unreadCountQuery.data ?? 0) : 0;
  const notifListLoading = useLiveNotifs && inboxQuery.isLoading;
  const notifListError = useLiveNotifs && inboxQuery.isError;

  const statusRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notifOpen && useLiveNotifs) {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY });
    }
  }, [notifOpen, useLiveNotifs, queryClient]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!statusRef.current?.contains(t)) {
        setStatusOpen(false);
      }
      if (!helpRef.current?.contains(t)) {
        setHelpOpen(false);
      }
      if (!notifRef.current?.contains(t)) {
        setNotifOpen(false);
      }
      if (!profileRef.current?.contains(t)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = useCallback(() => {
    setStatusOpen(false);
    setHelpOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, []);

  const toggle = useCallback(
    (panel: 'status' | 'help' | 'notif' | 'profile') => {
      const was = { status: statusOpen, help: helpOpen, notif: notifOpen, profile: profileOpen };
      closeAll();
      if (panel === 'status' && !was.status) {
        setStatusOpen(true);
      }
      if (panel === 'help' && !was.help) {
        setHelpOpen(true);
      }
      if (panel === 'notif' && !was.notif) {
        setNotifOpen(true);
      }
      if (panel === 'profile' && !was.profile) {
        setProfileOpen(true);
      }
    },
    [statusOpen, helpOpen, notifOpen, profileOpen, closeAll]
  );

  const markAll = () => {
    if (useLiveNotifs && unreadCount > 0) {
      markAllMutation.mutate();
    }
  };

  const markOne = (id: string) => {
    if (!useLiveNotifs) {
      return;
    }
    const row = notifRows.find((r) => r.id === id);
    if (row?.read) {
      return;
    }
    markReadMutation.mutate(id);
  };

  const DarkIcon = mounted ? (
    dark ? (
      <Moon size={10} className="text-white" />
    ) : (
      <Sun size={10} className="text-yellow-500" />
    )
  ) : null;

  const DarkIconSm = mounted ? (
    dark ? (
      <Moon size={9} className="text-white" />
    ) : (
      <Sun size={9} className="text-yellow-500" />
    )
  ) : null;

  return (
    <header className="h-14 md:h-16 bg-white dark:bg-[#253347] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-3 md:px-6 sticky top-0 z-20 transition-colors duration-300 gap-2">
      {/* Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 lg:hidden shrink-0" />
        <h1
          className="text-[13px] md:text-[15px] text-[#0B2A4A] dark:text-white truncate max-w-[100px] sm:max-w-none"
          style={{ fontWeight: 600, letterSpacing: '0.06em' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Church pill */}
      <div className="hidden sm:flex flex-1 justify-center">
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => toggle('status')}
            className="flex items-center gap-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl px-3 py-1.5 md:py-2 shadow-sm hover:shadow-md transition-all"
          >
            <div className="text-left min-w-0">
              <p
                className="text-[#0B2A4A] dark:text-white leading-none truncate max-w-[100px] md:max-w-[160px]"
                style={{ fontWeight: 700, fontSize: '12px' }}
              >
                {churchName}
              </p>
              <p
                className="text-gray-400 dark:text-white/40 mt-0.5 uppercase hidden md:block"
                style={{ fontWeight: 400, fontSize: '10px' }}
              >
                CHURCH SPACE
              </p>
            </div>
            {mounted && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 hidden md:inline"
                style={{
                  color: statusStyle.color,
                  backgroundColor: dark ? statusStyle.darkBg : statusStyle.bg,
                }}
              >
                {statusStyle.label}
              </span>
            )}
            <ChevronDown
              size={12}
              className={`text-gray-400 shrink-0 transition-transform ${statusOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {statusOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 bg-white dark:bg-[#253347] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-gray-400 dark:text-slate-500 uppercase text-[10px] font-semibold tracking-widest">
                Subscription
              </p>
              {(
                Object.entries(STATUS_STYLES) as [
                  SubscriptionStatus,
                  (typeof STATUS_STYLES)[SubscriptionStatus],
                ][]
              ).map(([key, val]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between px-4 py-2.5 ${statusKey === key ? 'bg-gray-50 dark:bg-white/5' : ''}`}
                >
                  <span className="text-[#0B2A4A] dark:text-white capitalize text-[13px] font-medium">
                    {key}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: val.color, backgroundColor: dark ? val.darkBg : val.bg }}
                  >
                    {val.label}
                  </span>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-white/10">
                <Link
                  href="/admin/settings/superadmin/billing"
                  onClick={() => setStatusOpen(false)}
                  className="flex items-center gap-2 text-[12px] font-semibold hover:underline"
                  style={{ color: pc }}
                >
                  <CreditCard size={13} /> Manage Subscription
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={handleDarkModeToggle}
          aria-label="Toggle dark mode"
          className="relative w-10 md:w-11 h-5 md:h-6 rounded-full transition-colors duration-300 shrink-0 hidden sm:flex items-center"
          style={{ backgroundColor: mounted ? (dark ? pc : '#E5E7EB') : '#E5E7EB' }}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 ${dark && mounted ? 'left-[22px]' : 'left-0.5'}`}
          >
            {DarkIcon}
          </span>
        </button>

        {/* Help */}
        <div className="relative hidden md:block" ref={helpRef}>
          <button
            onClick={() => toggle('help')}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <HelpCircle size={17} />
          </button>
          {helpOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-gray-400 dark:text-slate-500 uppercase text-[10px] font-semibold tracking-widest">
                Help & Support
              </p>
              {[
                { label: 'Getting Started', href: '#' },
                { label: 'FAQs', href: '#' },
                { label: 'Contact Support', href: '#' },
                { label: 'Video Tutorials', href: '#' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setHelpOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                  <ChevronRight size={13} className="text-gray-300 dark:text-slate-600" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => toggle('notif')}
            onMouseEnter={() => setNotifHover(true)}
            onMouseLeave={() => setNotifHover(false)}
            className="relative w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full text-white flex items-center justify-center"
                style={{ backgroundColor: pc, fontSize: '8px', fontWeight: 800 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifHover && !notifOpen && unread.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-64 md:w-72 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden pointer-events-none">
              <p className="px-4 py-2 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-white/10">
                {unreadCount} unread
              </p>
              {unread.slice(0, 3).map((n) => (
                <NotifRow key={n.id} n={n} compact onMark={markOne} />
              ))}
            </div>
          )}

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <p className="text-[#0B2A4A] dark:text-white font-bold text-[14px]">
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[10px]"
                      style={{ backgroundColor: pc }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    disabled={markAllMutation.isPending}
                    onClick={markAll}
                    className="flex items-center gap-1 text-[11px] font-semibold hover:underline disabled:opacity-50"
                    style={{ color: pc }}
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[340px] md:max-h-[380px] overflow-y-auto">
                {!useLiveNotifs && (
                  <div className="flex flex-col items-center justify-center px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                    <Bell size={28} className="mb-2 opacity-50" />
                    <p className="text-[13px]">Sign in to load your notifications.</p>
                  </div>
                )}
                {useLiveNotifs && notifListLoading && (
                  <div className="px-4 py-10 text-center text-[13px] text-gray-400 dark:text-slate-500">
                    Loading notifications…
                  </div>
                )}
                {useLiveNotifs && notifListError && (
                  <div className="px-4 py-10 text-center text-[13px] text-red-500 dark:text-red-400">
                    Could not load notifications.
                  </div>
                )}
                {useLiveNotifs && !notifListLoading && !notifListError && unread.length > 0 && (
                  <>
                    <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                      New
                    </p>
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                      {unread.map((n) => (
                        <NotifRow key={n.id} n={n} onMark={markOne} />
                      ))}
                    </div>
                  </>
                )}
                {useLiveNotifs && !notifListLoading && !notifListError && readNotifs.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-300 dark:text-slate-600 uppercase tracking-widest">
                      Earlier
                    </p>
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                      {readNotifs.map((n) => (
                        <NotifRow key={n.id} n={n} onMark={markOne} />
                      ))}
                    </div>
                  </>
                )}
                {useLiveNotifs &&
                  !notifListLoading &&
                  !notifListError &&
                  notifRows.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-300 dark:text-slate-500">
                      <Bell size={28} className="mb-2" />
                      <p className="text-[13px]">You&apos;re all caught up.</p>
                    </div>
                  )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
                <Link
                  href="/admin/announcements"
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-[12px] font-semibold hover:underline"
                  style={{ color: pc }}
                >
                  Open notification center
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-0.5 md:ml-1" ref={profileRef}>
          <button
            onClick={() => toggle('profile')}
            className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 md:py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            <NavAvatar
              size={30}
              avatarUrl={profile.avatarUrl}
              adminName={adminName}
              primaryColor={pc}
              isReady={isReady}
            />
            <span
              className="hidden lg:block text-[#0B2A4A] dark:text-white truncate max-w-[70px]"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '13px' }}
            >
              {adminName.split(' ').slice(-1)[0]}
            </span>
            <ChevronDown
              size={12}
              className={`hidden md:block text-gray-400 transition-transform shrink-0 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 md:w-72 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div
                className="px-4 py-4 border-b border-gray-100 dark:border-white/10 dark:bg-white/[0.04]"
                style={{ backgroundColor: dark ? undefined : `${pc}0D` }}
              >
                <div className="flex items-center gap-3">
                  <NavAvatar
                    size={44}
                    avatarUrl={profile.avatarUrl}
                    adminName={adminName}
                    primaryColor={pc}
                    isReady={isReady}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-[#0B2A4A] dark:text-white font-bold text-[14px] truncate"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {adminName}
                    </p>
                    <p className="text-gray-400 dark:text-slate-400 text-[12px] truncate">
                      {adminEmail}
                    </p>
                    <span
                      className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: pc, backgroundColor: `${pc}18` }}
                    >
                      {adminRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-1">
                {[
                  { label: 'Your Profile', href: '/admin/settings/superadmin/profile', icon: User },
                  { label: 'Account Settings', href: '/admin/settings/superadmin', icon: Settings },
                  {
                    label: 'Billing & Plans',
                    href: '/admin/settings/superadmin/billing',
                    icon: CreditCard,
                  },
                  { label: 'Security', href: '/admin/settings/superadmin/security', icon: Shield },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group"
                    >
                      <Icon
                        size={15}
                        className="text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors shrink-0"
                      />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile dark toggle */}
              <div className="px-4 py-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between sm:hidden">
                <span className="text-[12px] text-gray-500 dark:text-slate-400 font-medium">
                  {mounted && dark ? 'Dark mode' : 'Light mode'}
                </span>
                <button
                  onClick={handleDarkModeToggle}
                  className="relative w-10 h-5 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: mounted && dark ? pc : '#E5E7EB' }}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 ${mounted && dark ? 'left-[22px]' : 'left-0.5'}`}
                  >
                    {DarkIconSm}
                  </span>
                </button>
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
                  Church
                </p>
                <p className="text-[13px] font-semibold text-[#0B2A4A] dark:text-white truncate">
                  {churchName}
                </p>
                {mounted && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block"
                    style={{
                      color: statusStyle.color,
                      backgroundColor: dark ? statusStyle.darkBg : statusStyle.bg,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                )}
              </div>

              <div className="py-1 border-t border-gray-100 dark:border-white/10">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await performLogout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
