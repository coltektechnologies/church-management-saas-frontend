'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Languages,
  HelpCircle,
  BookMarked,
  LogOut,
  ChevronUp,
  ChevronDown,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { performLogout } from '@/lib/churchSessionBrowser';

const AVATAR_COLORS = ['#0B2A4A', '#065F46', '#7C3AED', '#B45309', '#9D174D', '#1E40AF'];

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}
const MENU_ITEMS: MenuItem[] = [
  { icon: User, label: 'Your profile', href: '/treasury/settings?tab=profile' },
  { icon: Settings, label: 'Account settings', href: '/treasury/settings?tab=system' },
  { icon: Languages, label: 'Language', href: '/treasury/settings?tab=system' },
  { icon: Shield, label: 'Security', href: '/treasury/settings?tab=security' },
  { icon: HelpCircle, label: 'Get help', href: '#' },
  { icon: BookMarked, label: 'Learn more', href: '#' },
];

interface Props {
  triggerName?: string;
  initials?: string;
  avatarUrl?: string | null;
  accentColor?: string;
  iconColor?: string;
  hoverBg?: string;
  textColor?: string;
}

export default function UserDropdown({
  triggerName = 'User',
  initials = 'U',
  avatarUrl: _avatarUrl = null,
  accentColor: _accentColor = '#2FC4B2',
  iconColor: _iconColor = '#0B2A4A',
  hoverBg = 'rgba(0,0,0,0.06)',
  textColor = '#0B2A4A',
}: Props) {
  const router = useRouter();
  const { profile: church, isReady: churchReady } = useChurchProfile();
  const { profile: user, updateProfile: updateUser, isReady: userReady } = useTreasuryProfile();

  const [open, setOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const churchName = churchReady
    ? church.churchName || 'SDA Church - Adenta'
    : 'SDA Church - Adenta';
  const displayName = userReady ? user.adminName || 'User' : 'User';
  const displayRole = userReady ? user.adminRole || 'Treasurer' : 'Treasurer';
  const adminEmail = userReady ? user.adminEmail || '' : '';
  const currentUrl = userReady ? (user.avatarUrl ?? null) : null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => updateUser({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl border border-transparent transition-colors"
        style={{ color: textColor }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg;
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${textColor}20`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
        }}
      >
        <div
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white overflow-hidden flex-shrink-0"
          style={{ background: currentUrl ? 'transparent' : avatarColor }}
        >
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="avatar"
              width={30}
              height={30}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            initials
          )}
        </div>
        <span
          className="hidden lg:block text-[13px] font-normal max-w-[80px] truncate"
          style={{ color: textColor }}
        >
          {triggerName}
        </span>
        {open ? (
          <ChevronUp
            size={12}
            className="hidden md:block flex-shrink-0"
            style={{ color: `${textColor}80` }}
          />
        ) : (
          <ChevronDown
            size={12}
            className="hidden md:block flex-shrink-0"
            style={{ color: `${textColor}80` }}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.10)] z-50">
            {/* Header */}
            <div
              className="px-4 py-4 border-b border-border rounded-t-xl overflow-hidden"
              style={{ backgroundColor: `${church.primaryColor || '#0B2A4A'}0D` }}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0 group mt-0.5"
                  style={{ background: currentUrl ? 'transparent' : avatarColor }}
                  title="Change photo"
                >
                  {currentUrl ? (
                    <Image
                      src={currentUrl}
                      alt="avatar"
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    initials
                  )}
                  <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold text-foreground"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {displayName}
                  </p>
                  <p
                    className="text-[12px] text-muted-foreground mt-0.5"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {adminEmail}
                  </p>
                  <span
                    className="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      color: church.primaryColor || '#0B2A4A',
                      backgroundColor: `${church.primaryColor || '#0B2A4A'}18`,
                    }}
                  >
                    {displayRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar colour picker */}
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">
                Colour
              </span>
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                    avatarColor === c ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ background: c }}
                />
              ))}
              {currentUrl && (
                <button
                  type="button"
                  onClick={() => updateUser({ avatarUrl: null })}
                  className="text-[10px] text-destructive hover:underline ml-auto"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-accent transition-colors group"
                  >
                    <Icon
                      size={15}
                      className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0"
                    />
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Church card */}
            <div className="px-3 pb-3 pt-1">
              <div
                className="p-3 border border-border"
                style={{ background: '#FFFFFF', borderRadius: '8px' }}
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Church
                </p>
                <p
                  className="text-[13px] font-semibold text-foreground"
                  style={{ wordBreak: 'break-word' }}
                >
                  {churchName}
                </p>
              </div>
            </div>

            {/* Sign out */}
            <div className="py-1 border-t border-border rounded-b-xl overflow-hidden">
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await performLogout();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={15} className="flex-shrink-0" />
                <span className="text-[13px] font-semibold">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
