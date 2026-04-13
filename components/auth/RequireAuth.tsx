'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { clearClientAuth, setChurchSessionCookie } from '@/lib/churchSessionBrowser';
import { isAccessTokenExpired } from '@/lib/jwtExpiry';

/**
 * Client-side guard for localStorage JWT + keeps session cookie in sync for middleware.
 * Expired access tokens are cleared: the session cookie can outlive JWT (e.g. 7d vs 5h).
 */
export function RequireAuth({
  children,
  skip = false,
}: {
  children: React.ReactNode;
  skip?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(skip);

  useEffect(() => {
    if (skip) {
      // setAllowed(true);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token || isAccessTokenExpired(token)) {
      clearClientAuth();
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const pathWithQuery = `${pathname}${search}`;
      router.replace(`/login?next=${encodeURIComponent(pathWithQuery)}`);
      return;
    }
    setChurchSessionCookie();
    // Defer allow: avoids react-hooks/set-state-in-effect (sync setState in effect body).
    const id = requestAnimationFrame(() => setAllowed(true));
    return () => cancelAnimationFrame(id);
  }, [router, pathname, skip]);

  if (!allowed) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-9 animate-spin text-slate-400" strokeWidth={1.75} aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return <>{children}</>;
}
