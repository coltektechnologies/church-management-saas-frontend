'use client';

import { useState } from 'react';
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
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';

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

const getContrastColor = (hex: string): string => {
  if (!hex || hex.length < 7) {
    return '#0B2A4A';
  } // Default to dark for white/invalid
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#0B2A4A' : '#FFFFFF';
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { profile, isReady } = useChurchProfile();

  const primaryColor = profile.primaryColor || '#0B2A4A';
  const accentColor = profile.accentColor || '#2FC4B2';
  // FIXED: Set default sidebar background to white
  const sidebarBg = profile.sidebarColor || '#FFFFFF';
  const mainBg = profile.backgroundColor || '#FFFFFF';

  const sidebarText = getContrastColor(sidebarBg);
  const isLightSidebar = sidebarText === '#0B2A4A';
  const borderColor = isLightSidebar ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const mutedText = isLightSidebar ? 'rgba(11,42,74,0.55)' : 'rgba(255,255,255,0.45)';

  const churchName = profile.churchName || 'Your Church';
  const tagline = profile.tagline || "You don't have to have it all figured out to come to church.";
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl p-2.5 border shadow-lg"
        style={{ backgroundColor: mainBg, borderColor: `${primaryColor}20` }}
      >
        <Menu size={20} style={{ color: primaryColor }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] flex flex-col border-r shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: sidebarBg, borderColor: borderColor }}
      >
        {/* Church header */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: `1px solid ${borderColor}` }}
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: isLightSidebar ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  <Church size={20} style={{ color: sidebarText }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="truncate"
                style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.06em',
                  color: sidebarText,
                }}
              >
                {churchName}
              </p>
              <p className="mt-1 line-clamp-2" style={{ fontSize: '10px', color: mutedText }}>
                {tagline}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden ml-2 shrink-0 p-1"
            style={{ color: `${sidebarText}80` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-3 pr-4 transition-all duration-200 relative overflow-hidden"
                style={{
                  paddingLeft: '16px',
                  borderLeft: active ? `4px solid ${accentColor}` : '4px solid transparent',
                  borderRadius: '0px',
                  backgroundColor: active
                    ? isLightSidebar
                      ? 'rgba(11,42,74,0.05)'
                      : 'rgba(255,255,255,0.12)'
                    : 'transparent',
                }}
              >
                <Icon size={18} style={{ color: active ? accentColor : sidebarText }} />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: active ? (isLightSidebar ? primaryColor : '#FFFFFF') : sidebarText,
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 space-y-1" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{
              backgroundColor: isLightSidebar ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.08)',
            }}
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: accentColor, fontSize: '13px' }}
              >
                {initials || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                className="truncate"
                style={{ fontWeight: 600, fontSize: '13px', color: sidebarText }}
              >
                {adminName}
              </p>
              <p className="mt-0.5 truncate" style={{ fontSize: '11px', color: mutedText }}>
                {adminRole}
              </p>
            </div>
            <Link
              href="/admin/settings/superadmin"
              className="w-7 h-7 flex items-center justify-center"
              style={{ color: `${sidebarText}60` }}
            >
              <Settings size={14} />
            </Link>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
