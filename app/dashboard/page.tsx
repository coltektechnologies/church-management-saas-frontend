'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultHomePathForUser, type PostLoginUser } from '@/lib/postLoginRedirect';

/**
 * Role-aware home: proxy and legacy links send everyone here first; then we route
 * Secretary → /secretary, others → /admin (was hard-coded admin only).
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    let user: PostLoginUser | null = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        user = JSON.parse(raw) as PostLoginUser;
      }
    } catch {
      /* ignore */
    }
    router.replace(defaultHomePathForUser(user));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 text-sm">
      Redirecting…
    </div>
  );
}
