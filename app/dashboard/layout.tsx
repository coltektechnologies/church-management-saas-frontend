'use client';

import React from 'react';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts';
import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import { DepartmentsProvider } from '@/context/DepartmentsContext';
import AdminSidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChurchProfileProvider>
      <AppDataProvider>
        <DepartmentsProvider>
          <div className="flex h-screen bg-gray-100">
            {/* Sidebar — must be inside ChurchProfileProvider */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col">
              {/* TopNavbar — must be inside ChurchProfileProvider */}
              <TopNavbar />

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </DepartmentsProvider>
      </AppDataProvider>
    </ChurchProfileProvider>
  );
}
