'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Landmark,
  Building2,
  Megaphone,
  BarChart3,
  ClipboardCheck,
  Settings,
  Menu,
  X,
  Church,
  LogOut,
} from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';

// useSyncExternalStore: server=false, client=true — no setState, no effects
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { key: 'members', label: 'Members', icon: Users, href: '/admin/members' },
  { key: 'secretary', label: 'Secretary', icon: FileText, href: '/admin/secretary' },
  { key: 'treasury', label: 'Treasury', icon: Landmark, href: '/admin/treasury' },
  { key: 'departments', label: 'Departments', icon: Building2, href: '/admin/departments' },
  { key: 'announcement', label: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
  { key: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { key: 'record-approval', label: 'Approvals', icon: ClipboardCheck, href: '/admin/approvals' },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings/superadmin' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { profile, isReady } = useChurchProfile();

  // mounted: false on server, true on client.
  // ALL values that differ between light/dark must be gated behind this so the
  // server render and the first client render produce identical HTML.
  const mounted = useIsMounted();

  const primaryColor = profile.primaryColor || '#0B2A4A';
  const accentColor = profile.accentColor || '#2FC4B2';

  const dark = mounted ? (profile.darkMode ?? false) : false;

  // ── Light mode ──────────────────────────────────────────────────────────
  //   Sidebar bg:   #FFFFFF  |  shadow: 0px 4px 5.9px 5px #0000001A
  //   Text: #000000  |  Icons: #0B2A4A
  //   Active: bg #0B2A4A, text #FFFFFF, border-left 4px solid #2FC4B2
  // ── Dark mode ───────────────────────────────────────────────────────────
  //   Sidebar bg: primaryColor  |  Text/icons: #FFFFFF
  //   Active: rgba(255,255,255,0.12), text #FFFFFF, border-left 4px solid #2FC4B2
  // ─────────────────────────────────────────────────────────────────────────

  // Server always renders light defaults; client swaps to dark after mount if needed
  const sidebarBg = mounted ? (dark ? primaryColor : '#FFFFFF') : '#FFFFFF';
  const sidebarShadow = mounted
    ? dark
      ? 'none'
      : '0px 4px 5.9px 5px #0000001A'
    : '0px 4px 5.9px 5px #0000001A';
  const navText = mounted ? (dark ? '#FFFFFF' : '#000000') : '#000000';
  const navIconColor = mounted ? (dark ? '#FFFFFF' : '#0B2A4A') : '#0B2A4A';
  const mutedText = mounted
    ? dark
      ? 'rgba(255,255,255,0.5)'
      : 'rgba(0,0,0,0.45)'
    : 'rgba(0,0,0,0.45)';
  const divider = mounted
    ? dark
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.06)'
    : 'rgba(0,0,0,0.06)';
  const hoverBg = mounted
    ? dark
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(11,42,74,0.04)'
    : 'rgba(11,42,74,0.04)';
  const activeItemBg = mounted ? (dark ? 'rgba(255,255,255,0.12)' : '#0B2A4A') : '#0B2A4A';

  // Mobile hamburger bg must also be stable on server — use white, which is
  // the sidebar colour in light mode, so it visually matches from first paint.
  const hamburgerBg = mounted ? (dark ? primaryColor : '#FFFFFF') : '#FFFFFF';
  const hamburgerBorder = `${primaryColor}20`;

  const churchName = profile.churchName || 'Your Church';
  const tagline = profile.tagline || "You don't have to have it all figured out.";
  const adminName = profile.adminName || 'Admin User';
  const adminRole = profile.adminRole || 'Admin';

  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isActive = (item: (typeof NAV_ITEMS)[0]) =>
    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile hamburger — uses stable server-safe values */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl p-2.5 border shadow-lg"
        style={{ backgroundColor: hamburgerBg, borderColor: hamburgerBorder }}
      >
        <Menu size={20} style={{ color: primaryColor }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] flex flex-col transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: sidebarBg, boxShadow: sidebarShadow }}
      >
        {/* Church header */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: `1px solid ${divider}` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0">
              {isReady && profile.logoUrl ? (
                <div className="relative w-10 h-10">
                  <Image
                    src={profile.logoUrl}
                    alt={churchName}
                    fill
                    className="rounded-xl object-contain shadow-sm"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: dark ? 'rgba(255,255,255,0.15)' : `${primaryColor}12` }}
                >
                  <Church size={20} style={{ color: navIconColor }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="truncate"
                style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  color: navText,
                }}
              >
                {churchName}
              </p>
              <p className="mt-0.5 line-clamp-2" style={{ fontSize: '10px', color: mutedText }}>
                {tagline}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="lg:hidden ml-2 shrink-0 p-1 rounded-lg"
            style={{ color: mutedText }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={close}
                className="sidebar-nav-link flex items-center gap-3 py-2.5 pr-4 transition-colors duration-150"
                style={{
                  paddingLeft: '14px',
                  borderLeft: `4px solid ${active ? accentColor : 'transparent'}`,
                  backgroundColor: active ? activeItemBg : 'transparent',
                  borderRadius: '0 6px 6px 0',
                }}
              >
                <Icon
                  size={17}
                  style={{ color: active ? '#FFFFFF' : navIconColor, flexShrink: 0 }}
                />
                <span
                  className="flex-1 truncate"
                  style={{
                    fontWeight: active ? 600 : 500,
                    fontSize: '13px',
                    color: active ? '#FFFFFF' : navText,
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${divider}` }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(11,42,74,0.04)' }}
          >
            {isReady && profile.avatarUrl ? (
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src={profile.avatarUrl}
                  alt={adminName}
                  fill
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ backgroundColor: accentColor, fontSize: '13px' }}
              >
                {initials || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate" style={{ fontWeight: 600, fontSize: '13px', color: navText }}>
                {adminName}
              </p>
              <p className="mt-0.5 truncate" style={{ fontSize: '11px', color: mutedText }}>
                {adminRole}
              </p>
            </div>
            <Link
              href="/admin/settings/superadmin"
              onClick={close}
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ color: mutedText }}
            >
              <Settings size={14} />
            </Link>
          </div>

          <button
            onClick={() => {
              close();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors hover:bg-red-500/10"
            style={{ color: '#EF4444' }}
          >
            <LogOut size={16} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Scoped hover — pure CSS, no JS handlers, keyed so it updates on mode change */}
      <style key={`sidebar-${String(dark)}`}>{`
        .sidebar-nav-link:hover {
          background-color: ${hoverBg} !important;
        }
      `}</style>
    </>
  );
}
