'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { DepartmentsProvider } from '@/context/DepartmentsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DepartmentsProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </DepartmentsProvider>
  );
}
