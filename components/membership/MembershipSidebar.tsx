'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { KeyRound, LogOut, Moon, Users } from 'lucide-react';
import { performLogout } from '@/lib/churchSessionBrowser';
import ChangePasswordModal from '@/components/membership/ChangePasswordModal';
import { MEMBERSHIP_MAIN_NAV } from '@/components/membership/membershipNavConfig';
import { useMembershipPortalBrandingCtx } from '@/components/membership/MembershipPortalBrandingContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts';
import MembershipThemeToggle from '@/components/membership/MembershipThemeToggle';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function MembershipSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { mounted, headerLoading, churchTitle, logoUrl, memberLine } =
    useMembershipPortalBrandingCtx();
  const { profile } = useChurchProfile();
  const layoutMounted = useIsMounted();
  const isDark = layoutMounted ? (profile.darkMode ?? false) : false;
  const primaryColor = profile.primaryColor || '#0A2E46';
  const accentColor = profile.accentColor || '#2FC4B2';

  const sidebarBg = layoutMounted ? (isDark ? primaryColor : '#FFFFFF') : '#FFFFFF';
  const sidebarBorder = layoutMounted ? (isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB') : '#E5E7EB';
  const titleColor = layoutMounted ? (isDark ? '#FFFFFF' : '#0A2E46') : '#0A2E46';
  const mutedColor = layoutMounted ? (isDark ? 'rgba(255,255,255,0.55)' : '#6B7280') : '#6B7280';
  const sectionLabel = layoutMounted ? (isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF') : '#9CA3AF';

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside
      className="hidden lg:flex flex-col h-screen flex-shrink-0 transition-colors duration-300"
      style={{
        width: '240px',
        minWidth: '240px',
        background: sidebarBg,
        borderRight: `1px solid ${sidebarBorder}`,
        zIndex: 20,
        position: 'sticky',
        top: 0,
      }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
        <div
          className="flex items-center gap-3 px-6 py-6 border-b transition-colors duration-300"
          style={{
            borderColor: layoutMounted
              ? isDark
                ? 'rgba(255,255,255,0.12)'
                : '#F3F4F6'
              : '#F3F4F6',
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: accentColor }}
          >
            {mounted && logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- church logo URL from API / CDN
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Users size={20} className="text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className="font-bold text-[13px] truncate"
              style={{ color: titleColor }}
              title={churchTitle}
            >
              {!mounted || headerLoading ? (
                <span className="inline-block h-4 w-[140px] bg-gray-100 animate-pulse rounded" />
              ) : (
                churchTitle
              )}
            </h1>
            {!mounted || headerLoading ? (
              <div
                className="h-3 w-24 animate-pulse rounded mt-1.5"
                style={{
                  backgroundColor: layoutMounted
                    ? isDark
                      ? 'rgba(255,255,255,0.12)'
                      : '#F3F4F6'
                    : '#F3F4F6',
                }}
              />
            ) : memberLine ? (
              <p
                className="text-[11px] mt-1 truncate"
                style={{ color: mutedColor }}
                title={memberLine}
              >
                {memberLine}
              </p>
            ) : null}
            <span
              className="inline-block px-2 py-0.5 mt-1 text-white text-[10px] font-semibold rounded-full"
              style={{ backgroundColor: accentColor }}
            >
              Member portal
            </span>
          </div>
        </div>

        <div className="px-4 py-4">
          <h2
            className="text-[10px] font-semibold tracking-wider uppercase mb-3 px-2"
            style={{ color: sectionLabel }}
          >
            MAIN
          </h2>
          <nav className="space-y-1">
            {MEMBERSHIP_MAIN_NAV.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              const inactiveText = layoutMounted
                ? isDark
                  ? 'rgba(255,255,255,0.85)'
                  : '#374151'
                : '#374151';
              const inactiveIcon = layoutMounted
                ? isDark
                  ? 'rgba(255,255,255,0.55)'
                  : '#6B7280'
                : '#6B7280';
              const activeBg = layoutMounted
                ? isDark
                  ? 'rgba(255,255,255,0.15)'
                  : primaryColor
                : primaryColor;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors"
                  style={{
                    backgroundColor: active ? activeBg : 'transparent',
                    color: active ? '#FFFFFF' : inactiveText,
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: active ? accentColor : inactiveIcon,
                    }}
                  />
                  <span className="font-medium text-[13px]">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 mt-auto pb-6">
          <h2
            className="text-[10px] font-semibold tracking-wider uppercase mb-3 px-2"
            style={{ color: sectionLabel }}
          >
            SYSTEM
          </h2>
          <div className="space-y-1">
            <div
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-md"
              style={{
                color: layoutMounted ? (isDark ? 'rgba(255,255,255,0.9)' : '#374151') : '#374151',
              }}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Moon size={18} className="shrink-0 opacity-80" />
                <span className="font-medium text-[13px]">Theme</span>
              </span>
              <MembershipThemeToggle size="sm" />
            </div>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className={
                layoutMounted && isDark
                  ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left text-slate-100 hover:bg-white/10'
                  : 'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left text-gray-700 hover:bg-gray-50'
              }
            >
              <KeyRound
                size={18}
                className={layoutMounted && isDark ? 'text-white/55' : 'text-gray-500'}
              />
              <span className="font-medium text-[13px]">Change Password</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await performLogout();
                router.push('/login');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-red-500/10 text-red-500"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="font-medium text-[13px]">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </aside>
  );
}
