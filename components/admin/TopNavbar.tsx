'use client';

import { Menu } from 'lucide-react';

interface Props {
  onMenuClick: () => void;
}

export default function TopNavbar({ onMenuClick }: Props) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          <Menu size={20} />
        </button>
        <div className="text-lg font-semibold text-gray-800">Dashboard</div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Toggle Placeholder */}
        <div className="w-10 h-5 bg-gray-300 rounded-full"></div>

        {/* Notification */}
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>

        {/* Profile */}
        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
      </div>
    </header>
  );
}
