'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';
import { resolvePostLoginPath, type PostLoginUser } from '@/lib/postLoginRedirect';
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
    let storedUser: PostLoginUser | null = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        storedUser = JSON.parse(raw) as PostLoginUser;
      }
    } catch {
      /* ignore */
    }
    router.replace(resolvePostLoginPath(next, storedUser));
  }, [router, searchParams]);
}
