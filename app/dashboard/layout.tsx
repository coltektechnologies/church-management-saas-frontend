'use client';
import Sidebar from '@/components/admin/adminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { AnnouncementsSidebar } from '@/components/announcements/AnnouncementsSidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAnnouncementsPage =
    pathname === '/dashboard/announcements' || pathname === '/admin/announcements';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {isAnnouncementsPage ? <AnnouncementsSidebar /> : <Sidebar />}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
