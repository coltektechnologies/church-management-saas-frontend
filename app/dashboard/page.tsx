'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  resolvePostLoginDestinationWithDepartmentProbe,
  type PostLoginUser,
} from '@/lib/postLoginRedirect';

/**
 * Role-aware home: proxy sends session users here first; then we route by role
 * (treasury / secretary / departments / admin shell / **member portal** / **`/start`** hub).
 * Uses the same API probes as login (`/departments/my-portal/`, `/members/members/me/`) so
 * JWT lag does not strand department heads or linked members on `/start`.
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let user: PostLoginUser | null = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        user = JSON.parse(raw) as PostLoginUser;
      }
    } catch {
      /* ignore */
    }
    void (async () => {
      const dest = await resolvePostLoginDestinationWithDepartmentProbe(null, user);
      if (!cancelled) {
        router.replace(dest);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 text-sm">
      Redirecting…
    </div>
  );
}
