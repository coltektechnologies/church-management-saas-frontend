// components/admin/TopNavbar.tsx
'use client';

export default function TopNavbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left */}
      <div className="text-lg font-semibold text-gray-800">Dashboard</div>

      {/* Right */}
      <div className="flex items-center space-x-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Toggle Placeholder */}
        <div className="w-10 h-5 bg-gray-300 rounded-full"></div>

        {/* Notification */}
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>

        {/* Profile */}
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  );
}
