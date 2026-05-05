'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import MembershipSidebar from '@/components/membership/MembershipSidebar';
import MembershipMobileHeader from '@/components/membership/MembershipMobileHeader';
import { MembershipLayoutShell } from '@/components/membership/MembershipLayoutShell';
import { MembershipPortalBrandingProvider } from '@/components/membership/MembershipPortalBrandingContext';

/** Optional local preview without login — never enable in production. */
const skipAuth = process.env.NEXT_PUBLIC_SKIP_MEMBERSHIP_AUTH === 'true';

export default function MembershipLayout({ children }: { children: ReactNode }) {
  const tree = (
    <AuthProvider defaultRole="admin">
      <ChurchProfileProvider>
        <MembershipPortalBrandingProvider>
          <MembershipLayoutShell>
            <MembershipMobileHeader />
            <MembershipSidebar />
            <main className="flex-1 min-w-0 min-h-0 overflow-y-auto lg:h-screen transition-colors duration-300">
              {children}
            </main>
          </MembershipLayoutShell>
        </MembershipPortalBrandingProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );

  if (skipAuth) {
    return tree;
  }
  return <RequireAuth>{tree}</RequireAuth>;
}
