'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useMembershipPortalBranding } from '@/hooks/useMembershipPortalBranding';

type BrandingValue = ReturnType<typeof useMembershipPortalBranding>;

const MembershipPortalBrandingContext = createContext<BrandingValue | null>(null);

export function MembershipPortalBrandingProvider({ children }: { children: ReactNode }) {
  const value = useMembershipPortalBranding();
  return (
    <MembershipPortalBrandingContext.Provider value={value}>
      {children}
    </MembershipPortalBrandingContext.Provider>
  );
}

export function useMembershipPortalBrandingCtx(): BrandingValue {
  const v = useContext(MembershipPortalBrandingContext);
  if (!v) {
    throw new Error(
      'useMembershipPortalBrandingCtx must be used within MembershipPortalBrandingProvider'
    );
  }
  return v;
}
