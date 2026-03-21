'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  FileBarChart,
  MessageSquare,
  ClipboardCheck,
  Settings,
  LogOut,
} from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

const navItems = [
  { title: 'Dashboard', path: '/secretary', icon: LayoutDashboard },
  { title: 'Members', path: '/secretary/members', icon: Users },
  { title: 'Departments', path: '/secretary/departments', icon: Building2 },
  { title: 'Announcements', path: '/secretary/announcements', icon: Megaphone },
  { title: 'Reports', path: '/secretary/reports', icon: FileBarChart },
  { title: 'Communications', path: '/secretary/communications', icon: MessageSquare },
  { title: 'Record Approval', path: '/secretary/record-approvals', icon: ClipboardCheck },
  { title: 'Settings', path: '/secretary/settings', icon: Settings },
];

// WCAG luminance — best readable text for any background
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

export default function SecretarySidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Church info — from admin settings (name + tagline only)
  const { profile: church, isReady: churchReady } = useChurchProfile();
  const churchName = churchReady
    ? church.churchName || 'SDA Church - Adenta'
    : 'SDA Church - Adenta';
  const tagline = churchReady
    ? church.tagline || "You don't have to have it all figured out to come to church."
    : "You don't have to have it all figured out to come to church.";

  // User + theme — secretary profile
  const { profile: user, isReady: userReady } = useSecretaryProfile();

  const userName = userReady ? user.adminName || 'Ps Owusu William' : 'Ps Owusu William';
  const userRole = userReady ? user.adminRole || 'Secretary' : 'Secretary';
  const avatarUrl = userReady ? (user.avatarUrl ?? null) : null;
  const isDark = userReady ? user.darkMode : false;

  // ── Strictly pick dark OR light palette — never mixed ────────────────
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
  // Light sidebar defaults to white; dark sidebar defaults to deep navy
  const sidebarColor = userReady
    ? isDark
      ? user.darkSidebarColor || '#0D1F36'
      : user.sidebarColor || '#FFFFFF'
    : '#FFFFFF';

  // Auto text colours — always readable regardless of sidebar bg
  const sidebarText = autoText(sidebarColor);
  const primaryText = autoText(primaryColor);
  const accentText = autoText(accentColor);

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isActive = (path: string) =>
    path === '/secretary' ? pathname === '/secretary' : pathname.startsWith(path);

  return (
    <aside
      className="hidden lg:flex flex-col w-[260px] h-screen"
      style={{
        background: sidebarColor,
        borderRight: `1px solid ${sidebarText}15`,
        boxShadow: '0px 4px 5.9px 5px rgba(0,0,0,0.08)',
        zIndex: 20,
        position: 'sticky',
        top: 0,
        transition: 'background 0.3s ease',
      }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto pt-14">
        {/* Divider */}
        <div className="mx-4" style={{ borderBottom: `1px solid ${sidebarText}15` }} />

        {/* Tagline card — fixed teal card, always readable */}
        <div className="px-4 mt-4">
          <div
            style={{
              width: '100%',
              background: '#BFF7EE',
              borderRadius: '8px',
              border: '1px solid #2FC4B2',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
              padding: '8px 12px',
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 600,
                fontSize: '11px',
                color: '#000000',
                letterSpacing: '0.05em',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
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
                color: '#000000',
                letterSpacing: '0.05em',
                lineHeight: '1.5',
                marginTop: '4px',
                marginBottom: 0,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                fontStyle: 'italic',
              }}
            >
              &ldquo;{tagline}&rdquo;
            </p>
          </div>
        </div>

        {/* Nav items — colours from active palette */}
        <nav className="flex-1 px-3 mt-4 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 px-3 py-2.5 transition-all duration-200"
                style={{
                  borderRadius: active ? '0px' : '8px',
                  background: active ? primaryColor : 'transparent',
                  ...(active && { borderLeft: `4px solid ${accentColor}` }),
                }}
              >
                <Icon
                  className="w-[18px] h-[18px] flex-shrink-0"
                  style={{ color: active ? accentColor : sidebarText }}
                />
                <span
                  style={{
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: active ? primaryText : sidebarText,
                    letterSpacing: '0px',
                  }}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User card — auto-matches selected theme */}
        <div className="px-3 pt-2 pb-1">
          <div
            className="flex items-start gap-3 px-3 py-3"
            style={{
              background: isDark ? `${primaryColor}30` : `${primaryColor}12`,
              borderRadius: '8px',
              border: `1px solid ${accentColor}35`,
              boxShadow: `0px 0px 3.8px 2px ${accentColor}25`,
              transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
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
                {userName}
              </p>
              <p
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  fontWeight: 300,
                  fontSize: '11px',
                  color: `${sidebarText}80`,
                  marginTop: '2px',
                  lineHeight: '1.3',
                  wordBreak: 'break-word',
                }}
              >
                {userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Management label */}
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

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#DC2626' }} />
            <span
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                color: '#DC2626',
              }}
            >
              Log out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
