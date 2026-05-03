'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  HeartHandshake,
  KeyRound,
  LogOut,
  Users,
} from 'lucide-react';
import { getStoredSessionChurchId, performLogout } from '@/lib/churchSessionBrowser';
import ChangePasswordModal from '@/components/membership/ChangePasswordModal';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { getAccessToken, getCurrentMemberProfile } from '@/lib/api';
import { displayMemberName } from '@/components/membership/memberProfileDisplay';
import { getChurch } from '@/lib/settingsApi';

const mainNavItems = [
  { title: 'My Profile', path: '/membership/profile', icon: User },
  { title: 'Dashboard', path: '/membership/dashboard', icon: LayoutDashboard },
  { title: 'Announcements', path: '/membership/announcements', icon: Megaphone },
  { title: 'Events', path: '/membership/events', icon: CalendarDays },
  { title: 'My Giving', path: '/membership/giving', icon: HeartHandshake },
];

export default function MembershipSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useChurchProfile();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  /** Avoid hydration mismatch: parent profile is DEFAULT on server but from localStorage on client. */
  const [mounted, setMounted] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [churchTitle, setChurchTitle] = useState('Your church');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [memberLine, setMemberLine] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const loadSidebarContext = useCallback(async () => {
    setHeaderLoading(true);
    try {
      const token = getAccessToken();
      const cid = getStoredSessionChurchId();

      if (token && cid) {
        const [memberRes, churchRes] = await Promise.all([
          getCurrentMemberProfile().catch(() => null),
          getChurch(cid).catch(() => null),
        ]);
        if (memberRes) {
          setMemberLine(displayMemberName(memberRes));
        } else {
          setMemberLine(null);
        }
        if (churchRes?.name?.trim()) {
          setChurchTitle(churchRes.name.trim());
        } else if (profile.churchName?.trim()) {
          setChurchTitle(profile.churchName.trim());
        } else {
          setChurchTitle('Your church');
        }
        if (churchRes?.logo_url) {
          setLogoUrl(churchRes.logo_url);
        } else if (profile.logoUrl) {
          setLogoUrl(profile.logoUrl);
        } else {
          setLogoUrl(null);
        }
      } else {
        setMemberLine(null);
        if (profile.churchName?.trim()) {
          setChurchTitle(profile.churchName.trim());
        }
        setLogoUrl(profile.logoUrl ?? null);
      }
    } finally {
      setHeaderLoading(false);
    }
  }, [profile.churchName, profile.logoUrl]);

  useEffect(() => {
    const p = profile;
    if (p.churchName?.trim()) {
      setChurchTitle(p.churchName.trim());
    }
    if (p.logoUrl) {
      setLogoUrl(p.logoUrl);
    }
    setMounted(true);
    void loadSidebarContext();
  }, [loadSidebarContext, profile.churchName, profile.logoUrl]);

  return (
    <aside
      className="hidden lg:flex flex-col h-screen flex-shrink-0"
      style={{
        width: '240px',
        minWidth: '240px',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        zIndex: 20,
        position: 'sticky',
        top: 0,
      }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#2FC4B2] overflow-hidden">
            {mounted && logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- church logo URL from API / CDN
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Users size={20} className="text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-[13px] text-[#0A2E46] truncate" title={churchTitle}>
              {!mounted || headerLoading ? (
                <span className="inline-block h-4 w-[140px] bg-gray-100 animate-pulse rounded" />
              ) : (
                churchTitle
              )}
            </h1>
            {!mounted || headerLoading ? (
              <div className="h-3 w-24 bg-gray-100 animate-pulse rounded mt-1.5" />
            ) : memberLine ? (
              <p className="text-[11px] text-gray-500 mt-1 truncate" title={memberLine}>
                {memberLine}
              </p>
            ) : null}
            <span className="inline-block px-2 py-0.5 mt-1 bg-[#2FC4B2] text-white text-[10px] font-semibold rounded-full">
              Member portal
            </span>
          </div>
        </div>

        <div className="px-4 py-4">
          <h2 className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">
            MAIN
          </h2>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors"
                  style={{
                    backgroundColor: active ? '#0A2E46' : 'transparent',
                    color: active ? '#FFFFFF' : '#4B5563',
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: active ? '#2FC4B2' : '#6B7280',
                    }}
                  />
                  <span
                    className="font-medium text-[13px]"
                    style={{ color: active ? '#FFFFFF' : '#374151' }}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 mt-auto pb-6">
          <h2 className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">
            SYSTEM
          </h2>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-gray-50 text-gray-700"
            >
              <KeyRound size={18} className="text-gray-500" />
              <span className="font-medium text-[13px]">Change Password</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await performLogout();
                router.push('/login');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-red-50 text-red-500"
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
