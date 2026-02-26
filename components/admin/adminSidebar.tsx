// components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Ps William</p>
          <p className="text-xs">Admin</p>
        </div>
      </div>
    </aside>
  );
}
