'use client';

import { type ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';

// const skipAuth = process.env.NEXT_PUBLIC_SKIP_TREASURY_AUTH === 'true';

export default function TreasuryLayoutClient({ children }: { children: ReactNode }) {
  // if (skipAuth) return <>{children}</>;
  return <RequireAuth>{children}</RequireAuth>;
}
