'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import MembershipSidebar from '@/components/membership/MembershipSidebar';

/** Local `next dev`: skip JWT gate so you can preview membership pages without logging in. */
const skipAuth =
  process.env.NEXT_PUBLIC_SKIP_MEMBERSHIP_AUTH === 'true' || process.env.NODE_ENV === 'development';

export default function MembershipLayout({ children }: { children: ReactNode }) {
  const tree = (
    <AuthProvider defaultRole="admin">
      <ChurchProfileProvider>
        <div className="flex min-h-screen bg-[#F8FAFC]">
          <div className="sticky top-0 h-screen z-20">
            <MembershipSidebar />
          </div>
          <main className="flex-1 min-w-0 overflow-y-auto bg-[#F8FAFC] h-screen">{children}</main>
        </div>
      </ChurchProfileProvider>
    </AuthProvider>
  );

  if (skipAuth) {
    return tree;
  }
  return <RequireAuth>{tree}</RequireAuth>;
}
