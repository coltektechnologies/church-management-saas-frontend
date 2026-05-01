'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { performLogout } from '@/lib/churchSessionBrowser';
import { useRouter } from 'next/navigation';
import ChangePasswordModal from '@/components/membership/ChangePasswordModal';

const mainNavItems = [
  { title: 'My Profile', path: '/membership', icon: User },
  { title: 'Dashboard', path: '/membership/dashboard', icon: LayoutDashboard },
  { title: 'Announcements', path: '/membership/announcements', icon: Megaphone },
  { title: 'Events', path: '/membership/events', icon: CalendarDays },
  { title: 'My Giving', path: '/membership/giving', icon: HeartHandshake },
];

export default function MembershipSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/membership' ? pathname === '/membership' : pathname.startsWith(path);

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
        {/* Church / Portal Identity */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#2FC4B2]">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[13px] text-[#0A2E46] whitespace-nowrap">
              SDA Church - Adenta
            </h1>
            <span className="inline-block px-2 py-0.5 mt-1 bg-[#2FC4B2] text-white text-[10px] font-semibold rounded-full">
              Member Profile
            </span>
          </div>
        </div>

        {/* MAIN Menu */}
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

        {/* SYSTEM Menu */}
        <div className="px-4 mt-auto pb-6">
          <h2 className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">
            SYSTEM
          </h2>
          <div className="space-y-1">
            {/* Change Password acts as a button, not a link */}
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-gray-50 text-gray-700"
            >
              <KeyRound size={18} className="text-gray-500" />
              <span className="font-medium text-[13px]">Change Password</span>
            </button>

            <button
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
