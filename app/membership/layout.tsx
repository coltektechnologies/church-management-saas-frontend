'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import MembershipSidebar from '@/components/membership/MembershipSidebar';

export default function MembershipLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider defaultRole="admin">
      <ChurchProfileProvider>
        <div className="flex min-h-screen bg-[#F8FAFC]">
          <div className="sticky top-0 h-screen z-20">
            <MembershipSidebar />
          </div>
          <main className="flex-1 min-w-0 overflow-y-auto bg-[#F8FAFC] h-screen">
            {children}
          </main>
        </div>
      </ChurchProfileProvider>
    </AuthProvider>
  );
}
