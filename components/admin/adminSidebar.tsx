'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';

const getContrastColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0B2A4A' : '#F8FAFC';
};

const menuItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Members', href: '/admin/members' },
  { name: 'Secretary', href: '/admin/secretary' },
  { name: 'Departments', href: '/admin/departments' },
  { name: 'Treasury', href: '/admin/treasury' },
  { name: 'Announcements', href: '/admin/announcements' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Record Approval', href: '/admin/approvals' },
  { name: 'Settings', href: '/admin/settings' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { profile, isReady } = useChurchProfile();

  const primaryColor = profile.primaryColor || '#0B2A4A';
  const accentColor = profile.accentColor || '#2FC4B2';
  // FIXED: Set default sidebar background to white
  const sidebarBg = profile.sidebarColor || '#FFFFFF';
  const mainBg = profile.backgroundColor || '#FFFFFF';

  const sidebarText = getContrastColor(sidebarBg);
  const isLightSidebar = sidebarText === '#0B2A4A';
  const borderColor = isLightSidebar ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const mutedText = isLightSidebar ? 'rgba(11,42,74,0.55)' : 'rgba(255,255,255,0.45)';

  const churchName = profile.churchName || 'Your Church';
  const tagline = profile.tagline || "You don't have to have it all figured out to come to church.";
  const adminName = profile.adminName || 'Admin User';
  const adminRole = profile.adminRole || 'Admin';
  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isActive = (item: (typeof menuItems)[0]) =>
    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-auto
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href; // ← original logic, untouched

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`block rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Ps William</p>
            <p className="text-xs">Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
}
