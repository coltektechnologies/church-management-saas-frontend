'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';

/**
 * Client-side guard for localStorage JWT + keeps session cookie in sync for middleware.
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
    if (!token) {
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
