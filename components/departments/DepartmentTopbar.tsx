'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Church,
  HelpCircle,
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  MessageSquare,
  Wallet,
  Receipt,
  ClipboardCheck,
  FileBarChart,
  Settings,
  BookOpen,
  LifeBuoy,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import DeptNotificationsDropdown from '@/components/departments/DeptNotificationsDropdown';
import DeptUserDropdown from '@/components/departments/DeptUserDropdown';

const mobileNavItems = [
  { title: 'Dashboard', path: '/departments', icon: LayoutDashboard },
  { title: 'Members', path: '/departments/members', icon: Users },
  { title: 'Activities & Events', path: '/departments/activities', icon: CalendarDays },
  { title: 'Announcements', path: '/departments/announcements', icon: Megaphone },
  { title: 'Message Member', path: '/departments/communications', icon: MessageSquare },
  { title: 'Budget & Expenses', path: '/departments/budget', icon: Wallet },
  { title: 'Approvals', path: '/departments/approvals', icon: ClipboardCheck },
  { title: 'Expense Requests', path: '/departments/expenses', icon: Receipt },
  { title: 'Department Reports', path: '/departments/reports', icon: FileBarChart },
  { title: 'Settings', path: '/departments/settings', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  '/departments': 'Department Dashboard',
  '/departments/members': 'Department Members',
  '/departments/activities': 'Activities & Events',
  '/departments/announcements': 'Announcements',
  '/departments/communications': 'Message Member',
  '/departments/budget': 'Budget & Expenses',
  '/departments/approvals': 'Approvals',
  '/departments/expenses': 'Expense Requests',
  '/departments/reports': 'Department Reports',
  '/departments/settings': 'Settings',
};

const HELP_LINKS = [
  { icon: BookOpen, label: 'Documentation', desc: 'Guides & feature docs', href: '#' },
  { icon: LifeBuoy, label: 'Support Center', desc: 'Get help from our team', href: '#' },
  { icon: MessageCircle, label: 'Send Feedback', desc: 'Report issues or suggestions', href: '#' },
];

function autoText(hex: string): '#0B2A4A' | '#FFFFFF' {
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

function DarkModePill({
  isDark,
  onToggle,
  onColor,
  offColor,
}: {
  isDark: boolean;
  onToggle: () => void;
  onColor: string;
  offColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex-shrink-0 focus:outline-none"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: isDark ? onColor : offColor,
        transition: 'background-color 0.25s ease',
      }}
    >
      <span
        className="absolute bg-white rounded-full shadow"
        style={{
          top: '3px',
          width: '18px',
          height: '18px',
          left: isDark ? '23px' : '3px',
          transition: 'left 0.25s ease',
        }}
      />
    </button>
  );
}

function HelpPopover({
  open,
  onClose,
  accentColor,
  textColor,
  cardBg,
}: {
  open: boolean;
  onClose: () => void;
  accentColor: string;
  textColor: string;
  cardBg: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-50"
      style={{
        width: '240px',
        background: cardBg,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${textColor}12`,
        overflow: 'hidden',
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${textColor}10` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `${accentColor}20` }}
          >
            <HelpCircle size={13} style={{ color: accentColor }} />
          </div>
          <span
            style={{
              fontFamily: "'OV Soge', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              color: textColor,
            }}
          >
            Help & Support
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded"
          style={{ color: `${textColor}60` }}
        >
          <X size={13} />
        </button>
      </div>

      <div className="py-2">
        {HELP_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors"
              style={{ textDecoration: 'none' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `${accentColor}10`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}15` }}
              >
                <Icon size={14} style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 600,
                    fontSize: '12px',
                    color: textColor,
                    lineHeight: '1.2',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 400,
                    fontSize: '10px',
                    color: `${textColor}60`,
                    marginTop: '1px',
                  }}
                >
                  {item.desc}
                </p>
              </div>
              <ExternalLink size={11} style={{ color: `${textColor}40`, flexShrink: 0 }} />
            </a>
          );
        })}
      </div>

      <div className="px-4 py-2.5" style={{ borderTop: `1px solid ${textColor}10` }}>
        <p
          style={{
            fontFamily: "'OV Soge', sans-serif",
            fontWeight: 400,
            fontSize: '10px',
            color: `${textColor}50`,
            textAlign: 'center',
          }}
        >
          SDA Church Management System
        </p>
      </div>
    </div>
  );
}

export default function DepartmentTopbar() {
  const { resolvedTheme, setTheme, mounted } = useDeptTheme();
  const { profile, isReady, portalIdentityLoaded } = useDepartmentProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const pathname = usePathname();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  /*
   * Light mode: profile.topbarColor (defaults white, but changes with theme tab)
   * Dark mode:  profile.darkTopbarColor
   * The outer strip is transparent in light so the page bg shows through,
   * and matches the dark card color in dark so there's no gap around the card.
   */
  const cardBg = isReady
    ? isDark
      ? profile.darkTopbarColor || '#0D1F36'
      : profile.topbarColor || '#FFFFFF'
    : '#FFFFFF';

  // Outer strip is transparent in light (page bg shows), matches card in dark
  const stripBg = isDark ? cardBg : 'transparent';

  const textColor = autoText(cardBg);
  const hoverBg = `${textColor}10`;
  const pillOffBg = `${textColor}20`;

  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const deptName = !isReady
    ? '—'
    : !portalIdentityLoaded && process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH !== 'true'
      ? 'Loading…'
      : [profile.departmentName.trim(), profile.departmentCode.trim()]
          .filter(Boolean)
          .join(' · ') || '—';
  const avatarUrl = isReady ? (profile.avatarUrl ?? null) : null;
  const headName = isReady ? profile.headName || '—' : '—';
  const triggerName = isReady
    ? profile.preferredName?.trim() || headName.split(' ').filter(Boolean).slice(-1)[0] || '—'
    : '—';
  const initials = headName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const matchedPath = Object.keys(PAGE_TITLES)
    .filter((p) => pathname === p || pathname.startsWith(p + '/'))
    .sort((a, b) => b.length - a.length)[0];
  const pageTitle = matchedPath ? PAGE_TITLES[matchedPath] : 'Department Dashboard';

  const isActive = (path: string) =>
    path === '/departments' ? pathname === '/departments' : pathname.startsWith(path);

  return (
    <>
      {/*
        Outer strip — uses same horizontal padding as <main> in layout.tsx
        (px-4 sm:px-6 lg:px-8) so the card's left edge lines up with page content.
        Height is NEVER set here — only the inner card has a fixed height.
      */}
      <div
        className="w-full flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
        style={{ backgroundColor: stripBg }}
      >
        {/*
          Inner card — fixed height 64px always (no conditional height logic).
          Background is always profile.topbarColor / profile.darkTopbarColor,
          so changing the colour theme tab immediately updates the topbar.
        */}
        <div
          className="w-full flex items-center justify-between px-3 sm:px-5 gap-2"
          style={{
            minHeight: '64px',
            height: 'auto',
            background: cardBg,
            borderRadius: '8px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
            // Smooth colour transition when theme changes
            transition: 'background-color 0.25s ease',
          }}
        >
          {/* Left: hamburger (mobile) + bold page title + teal breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1 rounded-md transition-colors flex-shrink-0"
              style={{ color: textColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1
                className="overflow-hidden text-ellipsis truncate text-xs sm:text-sm md:text-base lg:text-lg font-black"
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  color: textColor,
                  lineHeight: '1.2',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                }}
              >
                {pageTitle}
              </h1>
              <p
                className="mt-1 text-[10px] sm:text-xs md:text-sm font-medium overflow-hidden text-ellipsis truncate"
                style={{
                  color: `${textColor}70`,
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em',
                }}
              >
                <span style={{ color: accentColor, fontWeight: 600, marginRight: '0.25rem' }}>
                  {deptName}
                </span>
                / {pageTitle}
              </p>
            </div>
          </div>

          {/* Right: dark mode toggle + help + notifications + user */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <DarkModePill
              isDark={isDark}
              onToggle={() => setTheme(isDark ? 'light' : 'dark')}
              onColor={accentColor}
              offColor={pillOffBg}
            />

            {/* Help button with popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setHelpOpen((o) => !o)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                style={{
                  color: textColor,
                  backgroundColor: helpOpen ? hoverBg : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => {
                  if (!helpOpen) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                aria-label="Help"
              >
                <HelpCircle size={18} />
              </button>
              <HelpPopover
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
                accentColor={accentColor}
                textColor={textColor}
                cardBg={cardBg}
              />
            </div>

            <DeptNotificationsDropdown
              iconColor={textColor}
              hoverBg={hoverBg}
              badgeBg={accentColor}
            />

            <DeptUserDropdown
              triggerName={triggerName}
              initials={initials}
              avatarUrl={avatarUrl}
              accentColor={accentColor}
              iconColor={textColor}
              hoverBg={hoverBg}
              textColor={textColor}
            />
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 lg:hidden" style={{ zIndex: 60 }}>
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-card shadow-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <Church className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {deptName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded hover:bg-accent text-foreground flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
