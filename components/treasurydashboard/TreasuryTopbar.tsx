'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Church, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/treasurydashboard/contexts/ThemeProvider';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import NotificationsDropdown from '@/components/treasurydashboard/topbar/NotificationsDropdown';
import UserDropdown from '@/components/treasurydashboard/topbar/UserDropdown';
import { treasuryDisplayName, treasuryInitials } from '@/lib/treasuryPortalDisplay';
import type { SubscriptionStatus } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  BarChart2,
  PlusCircle,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { title: 'Dashboard', path: '/treasury', icon: LayoutDashboard },
  { title: 'Members & Finance', path: '/treasury/members-finance', icon: Users },
  { title: 'Income Recording', path: '/treasury/income', icon: ArrowDownCircle },
  { title: 'Expense Recording', path: '/treasury/expenses', icon: ArrowUpCircle },
  { title: 'Pending Approvals', path: '/treasury/approvals', icon: Receipt },
  { title: 'Financial Reports', path: '/treasury/reports', icon: BarChart2 },
  { title: 'Record Income', path: '/treasury/record-income', icon: PlusCircle },
  { title: 'Settings', path: '/treasury/settings', icon: Settings },
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

function subscriptionColours(status: SubscriptionStatus, topbarBg: string) {
  const isLight = autoText(topbarBg) === '#0B2A4A';
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

function TreasurerBadge({ topbarBg }: { topbarBg: string }) {
  const isLight = autoText(topbarBg) === '#0B2A4A';
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-md flex-shrink-0"
      style={{
        color: isLight ? '#065F46' : '#6EE7B7',
        backgroundColor: isLight ? '#D1FAE5' : 'rgba(52,211,153,0.20)',
        border: `1px solid ${isLight ? '#A7F3D0' : 'rgba(52,211,153,0.35)'}`,
      }}
    >
      Treasurer
    </span>
  );
}

export default function TreasuryTopbar() {
  const { resolvedTheme, setTheme, mounted } = useTheme();
  const { profile: church, isReady: churchReady } = useChurchProfile();
  const { profile: user, isReady: userReady } = useTreasuryProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const topbarBg = userReady
    ? isDark
      ? user.darkTopbarColor || '#0D1F36'
      : user.topbarColor || '#FFFFFF'
    : '#FFFFFF';

  const textColor = autoText(topbarBg);
  const subduedText = `${textColor}70`;
  const dividerColor = `${textColor}15`;
  const hoverBg = `${textColor}10`;
  const pillOffBg = `${textColor}20`;

  const accentColor = userReady
    ? isDark
      ? user.darkAccentColor || '#2FC4B2'
      : user.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const logoBg = userReady
    ? isDark
      ? user.darkPrimaryColor || '#1A3F6B'
      : user.primaryColor || '#0B2A4A'
    : '#0B2A4A';

  const churchName = churchReady
    ? church.churchName || 'SDA Church - Adenta'
    : 'SDA Church - Adenta';
  const logoUrl = churchReady ? (church.logoUrl ?? null) : null;
  const subStatus = churchReady ? church.subscriptionStatus || 'trial' : 'trial';

  const avatarUrl = userReady ? (user.avatarUrl ?? null) : null;
  const preferredName = userReady ? user.preferredName || '' : '';
  const adminName = userReady ? user.adminName || '' : '';
  const triggerName = treasuryDisplayName(preferredName, adminName);
  const adminEmail = userReady ? user.adminEmail || '' : '';
  const initials = treasuryInitials(preferredName, adminName, adminEmail);

  const isActive = (path: string) =>
    path === '/treasury' ? pathname === '/treasury' : pathname.startsWith(path);

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
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md transition-colors flex-shrink-0"
            style={{ color: textColor }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
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
          <div className="hidden lg:flex flex-col leading-tight">
            <span
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
            <TreasurerBadge topbarBg={topbarBg} />
          </div>
        </div>

        {/* Centre */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
          style={{
            borderRadius: '8px',
            border: `1px solid ${dividerColor}`,
            backgroundColor: hoverBg,
            maxWidth: '320px',
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

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DarkModePill
            isDark={isDark}
            onToggle={() => setTheme(isDark ? 'light' : 'dark')}
            onColor={accentColor}
            offColor={pillOffBg}
          />
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ color: textColor }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
            title="Help"
          >
            <HelpCircle size={17} />
          </button>
          <NotificationsDropdown iconColor={textColor} hoverBg={hoverBg} badgeBg={accentColor} />
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
                <Church className="w-5 h-5 text-primary flex-shrink-0" />
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
