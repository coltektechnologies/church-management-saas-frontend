'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';
import { getSafeReturnPath } from '@/lib/safeReturnPath';
import { isAccessTokenExpired } from '@/lib/jwtExpiry';

/**
 * If a non-expired access token exists, sync the session cookie and leave auth routes.
 * Use inside a `<Suspense>` boundary (required for useSearchParams).
 */
export function useRedirectIfAuthenticated(): void {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || isAccessTokenExpired(token)) {
      return;
    }
    setChurchSessionCookie();
    const next = searchParams.get('next');
    router.replace(getSafeReturnPath(next));
  }, [router, searchParams]);
}
