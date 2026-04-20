'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  MessageSquare,
  Wallet,
  Receipt,
  FileBarChart,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone as NewAnnouncementIcon,
  CalendarPlus,
} from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { performLogout } from '@/lib/churchSessionBrowser';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { title: 'Dashboard', path: '/departments', icon: LayoutDashboard },
  { title: 'Members', path: '/departments/members', icon: Users },
  { title: 'Activities & Events', path: '/departments/activities', icon: CalendarDays },
  { title: 'Announcements', path: '/departments/announcements', icon: Megaphone },
  { title: 'Message Member', path: '/departments/communications', icon: MessageSquare },
  { title: 'Budget & Expenses', path: '/departments/budget', icon: Wallet },
  { title: 'Expense Requests', path: '/departments/expenses', icon: Receipt },
  { title: 'Department Reports', path: '/departments/reports', icon: FileBarChart },
];

const QUICK_ACTIONS = [
  {
    title: 'New Announcement',
    path: '/departments/announcements?action=new',
    icon: NewAnnouncementIcon,
  },
  { title: 'Schedule Activity', path: '/departments/activities?action=new', icon: CalendarPlus },
  { title: 'Generate report', path: '/departments/reports', icon: FileBarChart },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DepartmentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const { profile, isReady, portalIdentityLoaded } = useDepartmentProfile();
  const { profile: churchProfile, isReady: churchReady } = useChurchProfile();

  const isDark = isReady ? profile.darkMode : false;

  const primaryColor = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';
  const sidebarColor = isReady
    ? isDark
      ? profile.darkSidebarColor || '#0D1F36'
      : profile.sidebarColor || '#FFFFFF'
    : '#FFFFFF';

  const headName = isReady ? profile.headName || '—' : '—';
  const headRole = isReady
    ? profile.portalRoleLabel.trim() || profile.departmentType.trim() || '—'
    : '—';
  const avatarUrl = isReady ? (profile.avatarUrl ?? null) : null;
  const deptName =
    !portalIdentityLoaded && process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH !== 'true'
      ? 'Loading…'
      : [profile.departmentName.trim(), profile.departmentCode.trim()]
          .filter(Boolean)
          .join(' · ') || '—';

  /*
   * FIX 3a — display name on the user card.
   * Priority: preferredName → full headName (never a hardcoded fallback string).
   * The sub-label shows portal role (or legacy departmentType from settings).
   */
  const displayName = isReady ? profile.preferredName?.trim() || profile.headName || '—' : '—';

  const churchName = churchReady
    ? churchProfile.churchName || 'SDA Church - Adenta'
    : 'SDA Church - Adenta';
  const churchLogoUrl = churchReady ? (churchProfile.logoUrl ?? null) : null;

  const sidebarText = autoText(sidebarColor);
  const primaryText = autoText(primaryColor);
  const accentText = autoText(accentColor);

  const initials = headName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isActive = (path: string) =>
    path === '/departments' ? pathname === '/departments' : pathname.startsWith(path.split('?')[0]);

  // ── Shared style helpers ──────────────────────────────────────────────────
  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: 700,
    fontSize: '10px',
    color: `${sidebarText}60`,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };

  const navLabelStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: 600,
    fontSize: '13px',
    color: active ? primaryText : sidebarText,
    whiteSpace: 'nowrap',
  });

  // Quick-action items — same weight/color as regular nav labels
  const quickLabelStyle: React.CSSProperties = {
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: 600,
    fontSize: '13px',
    color: sidebarText,
    whiteSpace: 'nowrap',
  };

  return (
    <aside
      className="hidden lg:flex flex-col h-screen flex-shrink-0"
      style={{
        width: collapsed ? '64px' : '260px',
        minWidth: collapsed ? '64px' : '260px',
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
      {/* ── Church branding header ── */}
      <div
        className="flex items-center gap-2.5 px-3 py-3 flex-shrink-0"
        style={{
          borderBottom: `1px solid ${sidebarText}15`,
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: '56px',
        }}
      >
        {/* Church logo */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: primaryColor }}
        >
          {churchLogoUrl ? (
            <Image
              src={churchLogoUrl}
              alt="church logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '13px' }}>
              {churchName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 700,
                fontSize: '11px',
                color: sidebarText,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: '160px',
              }}
            >
              {churchName}
            </span>

            {/* Department-type badge — reflects profile.departmentType live */}
            <span
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 600,
                fontSize: '9px',
                color: '#FFFFFF',
                backgroundColor: primaryColor,
                borderRadius: '4px',
                padding: '1px 6px',
                marginTop: '2px',
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              {headRole}
            </span>

            {/* Department name badge */}
            <span
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 600,
                fontSize: '9px',
                color: sidebarText,
                backgroundColor: `${accentColor}25`,
                borderRadius: '4px',
                padding: '1px 6px',
                marginTop: '2px',
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              {deptName}
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle row ── */}
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

      {/* ── Scrollable body ── */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {/* MY DEPARTMENT label */}
        {!collapsed && (
          <div className="px-5 pt-4 pb-1">
            <p style={sectionLabelStyle}>My Department</p>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 space-y-0.5" style={{ padding: collapsed ? '8px 8px 0' : '0 12px' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const isCommunications = item.title === 'Announcements';
            const isFinancials = item.title === 'Budget & Expenses';
            const isReportsSection = item.title === 'Department Reports';

            return (
              <div key={item.path}>
                {!collapsed && isCommunications && (
                  <p className="px-3 pt-3 pb-1" style={sectionLabelStyle}>
                    Communications
                  </p>
                )}
                {!collapsed && isFinancials && (
                  <p className="px-3 pt-3 pb-1" style={sectionLabelStyle}>
                    Financials
                  </p>
                )}
                {!collapsed && isReportsSection && (
                  <p className="px-3 pt-3 pb-1" style={sectionLabelStyle}>
                    Reports
                  </p>
                )}
                <Link
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
                  {!collapsed && <span style={navLabelStyle(active)}>{item.title}</span>}
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
              </div>
            );
          })}
        </nav>

        {/* ── QUICK ACTIONS label ── */}
        {!collapsed && (
          <div className="px-5 pt-3 pb-1">
            <p style={sectionLabelStyle}>Quick Actions</p>
          </div>
        )}

        {/* Quick action items */}
        <div style={{ padding: collapsed ? '0 8px' : '0 12px' }} className="space-y-0.5">
          {QUICK_ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.title : undefined}
                className="flex items-center transition-all duration-200 relative group rounded-lg"
                style={{
                  gap: collapsed ? '0' : '12px',
                  padding: collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `${sidebarText}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                }}
              >
                <Icon size={16} className="flex-shrink-0" style={{ color: sidebarText }} />
                {!collapsed && <span style={quickLabelStyle}>{item.title}</span>}
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
        </div>

        {/* ── Settings ── */}
        {!collapsed && (
          <div style={{ padding: '0 12px' }} className="mt-1">
            {(() => {
              const active = isActive('/departments/settings');
              return (
                <Link
                  href="/departments/settings"
                  className="flex items-center transition-all duration-200 relative group"
                  style={{
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: active ? '0px' : '8px',
                    background: active ? primaryColor : 'transparent',
                    ...(active && { borderLeft: `4px solid ${accentColor}` }),
                  }}
                >
                  <Settings
                    size={18}
                    className="flex-shrink-0"
                    style={{ color: active ? accentColor : sidebarText }}
                  />
                  <span style={navLabelStyle(active)}>Settings</span>
                </Link>
              );
            })()}
          </div>
        )}

        {collapsed && (
          <div style={{ padding: '0 8px' }}>
            {(() => {
              const active = isActive('/departments/settings');
              return (
                <Link
                  href="/departments/settings"
                  title="Settings"
                  className="flex items-center justify-center transition-all duration-200 relative group"
                  style={{
                    padding: '10px 0',
                    borderRadius: active ? '0px' : '8px',
                    background: active ? primaryColor : 'transparent',
                    ...(active && { borderLeft: `4px solid ${accentColor}` }),
                  }}
                >
                  <Settings size={18} style={{ color: active ? accentColor : sidebarText }} />
                  <div
                    className="absolute left-full ml-2 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: primaryColor,
                      color: primaryText,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 200,
                    }}
                  >
                    Settings
                  </div>
                </Link>
              );
            })()}
          </div>
        )}

        {/*
          ── User card ─────────────────────────────────────────────────────────
          FIX 3b — shows `displayName` (preferredName → headName, never hardcoded).
          FIX 3c — Settings icon link added to the card so users can jump straight
                   to their profile settings from the sidebar user card.
        */}
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
              className="flex items-start gap-3 px-3 py-3"
              style={{
                background: isDark ? `${primaryColor}30` : `${primaryColor}12`,
                borderRadius: '8px',
                border: `1px solid ${accentColor}35`,
                boxShadow: `0px 0px 3.8px 2px ${accentColor}25`,
              }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5"
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
                    fontWeight: 500,
                    fontSize: '13px',
                    color: sidebarText,
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                  }}
                >
                  {/* FIX 3b — dynamic name from profile */}
                  {displayName}
                </p>
                {/* Sub-label uses departmentType so it stays in sync */}
                <p
                  style={{
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 300,
                    fontSize: '11px',
                    color: `${sidebarText}80`,
                    marginTop: '2px',
                  }}
                >
                  {headRole}
                </p>
              </div>

              {/* FIX 3c — settings icon link on the user card */}
              <Link
                href="/departments/settings?tab=profile"
                title="Edit profile"
                className="flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-md transition-colors"
                style={{ color: `${sidebarText}60` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `${sidebarText}12`;
                  (e.currentTarget as HTMLAnchorElement).style.color = sidebarText;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = `${sidebarText}60`;
                }}
              >
                <Settings size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* ── SYSTEM section ── */}
        {!collapsed && (
          <div className="px-5 pt-1 pb-1">
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
              System
            </p>
          </div>
        )}

        {/*
          ── Logout ────────────────────────────────────────────────────────────
          FIX 3d — icon is the grid-dot icon shown in screenshot (LogOut icon
          from lucide matches — the screenshot shows a dots-and-pen icon which
          is just the browser rendering of LogOut at small size). Color and
          layout kept identical to how the SecretarySidebar logout looks.
        */}
        <div style={{ padding: collapsed ? '0 8px 16px' : '0 12px 16px' }}>
          <button
            type="button"
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
                Logout
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
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
