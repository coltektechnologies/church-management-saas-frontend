'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Church, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';
import NotificationsDropdown from '@/components/secretary/topbar/NotificationsDropdown';
import UserDropdown from '@/components/secretary/topbar/UserDropdown';
import type { SubscriptionStatus } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  FileBarChart,
  MessageSquare,
  ClipboardCheck,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { title: 'Dashboard', path: '/secretary', icon: LayoutDashboard },
  { title: 'Members', path: '/secretary/members', icon: Users },
  { title: 'Departments', path: '/secretary/departments', icon: Building2 },
  { title: 'Announcements', path: '/secretary/announcements', icon: Megaphone },
  { title: 'Reports', path: '/secretary/reports', icon: FileBarChart },
  { title: 'Communications', path: '/secretary/communications', icon: MessageSquare },
  { title: 'Record Approval', path: '/secretary/record-approvals', icon: ClipboardCheck },
  { title: 'Settings', path: '/secretary/settings', icon: Settings },
];

// ── Colour utilities ───────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  };
}

// WCAG auto text — returns readable colour for any background
function autoText(hex: string): '#0B2A4A' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

// Generates subscription badge colours that contrast with the topbar background
function subscriptionColours(status: SubscriptionStatus, topbarBg: string) {
  const textContrast = autoText(topbarBg);
  const isLight = textContrast === '#0B2A4A';

  if (status === 'trial') {
    return {
      text: isLight ? '#92400E' : '#FDE68A',
      bg: isLight ? '#FEF3C7' : 'rgba(251,191,36,0.20)',
    };
  }
  if (status === 'active') {
    return {
      text: isLight ? '#065F46' : '#6EE7B7',
      bg: isLight ? '#D1FAE5' : 'rgba(52,211,153,0.20)',
    };
  }
  return {
    text: isLight ? '#991B1B' : '#FCA5A5',
    bg: isLight ? '#FEE2E2' : 'rgba(248,113,113,0.20)',
  };
}

// ── Pill toggle ────────────────────────────────────────────────────────────────
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

// ── Inline subscription badge ──────────────────────────────────────────────────
function TopbarSubscriptionBadge({
  status,
  topbarBg,
}: {
  status: SubscriptionStatus;
  topbarBg: string;
}) {
  const { text, bg } = subscriptionColours(status, topbarBg);
  const labels: Record<SubscriptionStatus, string> = {
    trial: 'On Trial',
    active: 'Active',
    inactive: 'Inactive',
  };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 flex-shrink-0"
      style={{ color: text, backgroundColor: bg, borderRadius: '5px' }}
    >
      {labels[status] ?? 'On Trial'}
    </span>
  );
}

export default function SecretaryTopbar() {
  const { resolvedTheme, setTheme, mounted } = useTheme();
  const { profile: church, isReady: churchReady } = useChurchProfile();
  const { profile: user, isReady: userReady } = useSecretaryProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // Topbar background — from saved theme
  const topbarBg = userReady
    ? isDark
      ? user.darkTopbarColor || '#0D1F36'
      : user.topbarColor || '#FFFFFF'
    : '#FFFFFF';

  // All colours derive from topbarBg automatically
  const textColor = autoText(topbarBg);
  const subduedText = `${textColor}70`;
  const dividerColor = `${textColor}15`;
  const hoverBg = `${textColor}10`;
  const pillOffBg = `${textColor}20`;

  // Accent from profile
  const accentColor = userReady
    ? isDark
      ? user.darkAccentColor || '#2FC4B2'
      : user.accentColor || '#2FC4B2'
    : '#2FC4B2';

  // Logo bg — primary colour
  const logoBg = userReady
    ? isDark
      ? user.darkPrimaryColor || '#1A3F6B'
      : user.primaryColor || '#0B2A4A'
    : '#0B2A4A';

  // Church info
  const churchName = churchReady
    ? church.churchName || 'SDA Church - Adenta'
    : 'SDA Church - Adenta';
  const logoUrl = churchReady ? (church.logoUrl ?? null) : null;
  const subStatus = churchReady ? church.subscriptionStatus || 'trial' : 'trial';

  // Avatar info
  const avatarUrl = userReady ? (user.avatarUrl ?? null) : null;
  const adminName = userReady ? user.adminName || 'User' : 'User';
  const triggerName = userReady
    ? user.preferredName?.trim() || adminName.split(' ').filter(Boolean).slice(-1)[0] || 'User'
    : 'User';
  const initials = adminName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isActive = (path: string) =>
    path === '/secretary' ? pathname === '/secretary' : pathname.startsWith(path);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 md:px-6 transition-colors duration-300"
        style={{
          zIndex: 50,
          backgroundColor: topbarBg,
          borderBottom: `1px solid ${dividerColor}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: hamburger + logo + church name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md transition-colors flex-shrink-0"
            style={{ color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: logoBg }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="logo"
                width={32}
                height={32}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <Church className="w-4 h-4 text-white" />
            )}
          </div>

          <span
            className="hidden lg:block leading-tight"
            style={{
              fontFamily: "'OV Soge', sans-serif",
              fontWeight: 800,
              fontSize: '12px',
              color: textColor,
              maxWidth: '160px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {churchName}
          </span>
        </div>

        {/* Centre: church space pill */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
          style={{
            borderRadius: '8px',
            border: `1px solid ${dividerColor}`,
            backgroundColor: hoverBg,
            maxWidth: '300px',
          }}
        >
          <div className="text-left min-w-0">
            <p
              className="font-bold text-[12px] leading-snug"
              style={{
                color: textColor,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: '180px',
              }}
            >
              {churchName}
            </p>
            <p
              className="mt-0.5 uppercase hidden md:block text-[9px] font-medium"
              style={{ color: subduedText }}
            >
              CHURCH SPACE
            </p>
          </div>
          {churchReady && (
            <TopbarSubscriptionBadge status={subStatus as SubscriptionStatus} topbarBg={topbarBg} />
          )}
        </div>

        {/* Right: pill toggle + help + notifications + avatar */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Dark mode pill */}
          <DarkModePill
            isDark={isDark}
            onToggle={() => setTheme(isDark ? 'light' : 'dark')}
            onColor={accentColor}
            offColor={pillOffBg}
          />

          {/* Help button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Help"
          >
            <HelpCircle size={17} />
          </button>

          {/* Notifications */}
          <NotificationsDropdown iconColor={textColor} hoverBg={hoverBg} badgeBg={accentColor} />

          {/* User dropdown */}
          <UserDropdown
            triggerName={triggerName}
            initials={initials}
            avatarUrl={avatarUrl}
            accentColor={accentColor}
            iconColor={textColor}
            hoverBg={hoverBg}
            textColor={textColor}
          />
        </div>
      </header>

      <div className="h-14" aria-hidden="true" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 lg:hidden" style={{ zIndex: 60 }}>
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-card shadow-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg items-center justify-center overflow-hidden flex-shrink-0 flex"
                  style={{ background: logoBg }}
                >
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt="logo"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <Church className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {churchName}
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
