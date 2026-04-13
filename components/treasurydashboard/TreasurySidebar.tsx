'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardCheck,
  Receipt,
  BarChart2,
  PlusCircle,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { performLogout } from '@/lib/churchSessionBrowser';

const navItems = [
  { title: 'Dashboard', path: '/treasury', icon: LayoutDashboard },
  { title: 'Members & Finance', path: '/treasury/members-finance', icon: Users },
  { title: 'Income Recording', path: '/treasury/income', icon: ArrowDownCircle },
  { title: 'Expense Recording', path: '/treasury/expenses', icon: ArrowUpCircle },
  { title: 'Pending Approvals', path: '/treasury/approvals', icon: ClipboardCheck },
  { title: 'Record Expense', path: '/treasury/record-expense', icon: Receipt },
  { title: 'Financial Reports', path: '/treasury/reports', icon: BarChart2 },
  { title: 'Record Income', path: '/treasury/record-income', icon: PlusCircle },
  { title: 'Settings', path: '/treasury/settings', icon: Settings },
];

function autoText(hex: string): string {
  const h = (hex || '#ffffff').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

// sidebar
export default function TreasurySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { profile: church, isReady: churchReady } = useChurchProfile();
  const { profile: user, isReady: userReady } = useTreasuryProfile();

  // ── Church info ────────────────────────────────────────────────────────────
  const churchName = churchReady
    ? church.churchName || 'SDA Church - Adenta'
    : 'SDA Church - Adenta';

  const tagline = churchReady
    ? church.tagline || "You don't have to have it all figured out to come to church."
    : "You don't have to have it all figured out to come to church.";

  // ── User info ──────────────────────────────────────────────────────────────
  const adminName = userReady ? user.adminName || '' : '';
  const preferredName = userReady ? user.preferredName || '' : '';
  const userRole = userReady ? user.adminRole || 'Admin' : 'Admin';
  // avatarUrl
  const avatarUrl = userReady ? (user.avatarUrl ?? null) : null;
  const isDark = userReady ? user.darkMode : false;

  // Preferred name if set, otherwise full name, otherwise fallback
  const displayName = preferredName.trim() || adminName.trim() || 'Ps Owusu William';

  // Initials always from full name
  const initials =
    adminName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'PW';

  // ── Theme colours ──────────────────────────────────────────────────────────
  const primaryColor = userReady
    ? isDark
      ? user.darkPrimaryColor || '#1A3F6B'
      : user.primaryColor || '#0B2A4A'
    : '#0B2A4A';

  const accentColor = userReady
    ? isDark
      ? user.darkAccentColor || '#2FC4B2'
      : user.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const sidebarColor = userReady
    ? isDark
      ? user.darkSidebarColor || '#0D1F36'
      : user.sidebarColor || '#FFFFFF'
    : '#FFFFFF';

  const sidebarText = autoText(sidebarColor);
  const primaryText = autoText(primaryColor);
  const accentText = autoText(accentColor);

  const isActive = (path: string) =>
    path === '/treasury' ? pathname === '/treasury' : pathname.startsWith(path);

  return (
    <aside
      className="hidden lg:flex flex-col h-screen flex-shrink-0"
      style={{
        width: collapsed ? '64px' : '220px',
        minWidth: collapsed ? '64px' : '220px',
        background: sidebarColor,
        borderRight: `1px solid ${sidebarText}15`,
        boxShadow: '0px 4px 5.9px 5px rgba(0,0,0,0.08)',
        zIndex: 20,
        position: 'sticky',
        top: 0,
        transition:
          'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Topbar spacer */}
      <div style={{ height: '20px', flexShrink: 0 }} />

      {/* Collapse toggle */}
      <div
        className="flex-shrink-0 flex items-center px-3 pb-2 pt-1"
        style={{
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${sidebarText}18`,
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontFamily: "'OV Soge', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              color: `${sidebarText}55`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Menu
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
          style={{ background: `${sidebarText}10`, color: sidebarText, flexShrink: 0 }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = `${sidebarText}22`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = `${sidebarText}10`;
          }}
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {/* Church card */}
        {!collapsed && (
          <div className="px-4 mt-4" style={{ animation: 'fadeIn 0.18s ease' }}>
            <div
              style={{
                background: '#BFF7EE',
                borderRadius: '8px',
                border: '1px solid #2FC4B2',
                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                padding: '8px 12px',
              }}
            >
              <p
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  fontWeight: 600,
                  fontSize: '11px',
                  color: '#000',
                  letterSpacing: '0.05em',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {churchName}
              </p>
              <p
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  fontWeight: 500,
                  fontSize: '10px',
                  color: '#000',
                  letterSpacing: '0.05em',
                  lineHeight: '1.5',
                  marginTop: '4px',
                  fontStyle: 'italic',
                  wordBreak: 'break-word',
                }}
              >
                &ldquo;{tagline}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav
          className="flex-1 mt-4 space-y-0.5"
          style={{ padding: collapsed ? '0 8px' : '0 12px' }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.title : undefined}
                className="flex items-center transition-all duration-200 relative group"
                style={{
                  gap: collapsed ? '0' : '12px',
                  padding: collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: active ? '0px' : '8px',
                  background: active ? primaryColor : 'transparent',
                  ...(active && { borderLeft: `4px solid ${accentColor}` }),
                }}
              >
                <Icon
                  size={18}
                  className="flex-shrink-0"
                  style={{ color: active ? accentColor : sidebarText }}
                />
                {!collapsed && (
                  <span
                    style={{
                      fontFamily: "'OV Soge', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: active ? primaryText : sidebarText,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </span>
                )}
                {collapsed && (
                  <div
                    className="absolute left-full ml-2 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: primaryColor,
                      color: primaryText,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 200,
                    }}
                  >
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── User card ─────────────────────────────────────────────────────── */}
        <div style={{ padding: collapsed ? '8px' : '8px 12px' }}>
          {collapsed ? (
            <div className="flex justify-center py-2" title={displayName}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: avatarUrl ? 'transparent' : accentColor }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span style={{ color: accentText, fontWeight: 700, fontSize: '12px' }}>
                    {initials}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-3"
              style={{
                background: isDark ? `${primaryColor}30` : `${primaryColor}12`,
                borderRadius: '8px',
                border: `1px solid ${accentColor}35`,
                boxShadow: `0px 0px 3.8px 2px ${accentColor}25`,
              }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: avatarUrl ? 'transparent' : accentColor }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span style={{ color: accentText, fontWeight: 700, fontSize: '12px' }}>
                    {initials}
                  </span>
                )}
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: sidebarText,
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 300,
                    fontSize: '11px',
                    color: `${sidebarText}80`,
                    marginTop: '2px',
                  }}
                >
                  {userRole}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Management label */}
        {!collapsed && (
          <div className="px-5 pt-3 pb-2">
            <p
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 400,
                fontSize: '10px',
                color: `${sidebarText}60`,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Management
            </p>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: collapsed ? '0 8px 16px' : '0 12px 16px' }}>
          <button
            onClick={async () => {
              await performLogout();
              router.push('/login');
            }}
            title={collapsed ? 'Log out' : undefined}
            className="w-full flex items-center rounded-lg transition-all duration-200 group relative"
            style={{
              gap: collapsed ? '0' : '12px',
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <LogOut size={18} className="flex-shrink-0" style={{ color: '#DC2626' }} />
            {!collapsed && (
              <span
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#DC2626',
                  whiteSpace: 'nowrap',
                }}
              >
                Log out
              </span>
            )}
            {collapsed && (
              <div
                className="absolute left-full ml-2 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 200,
                }}
              >
                Log out
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
