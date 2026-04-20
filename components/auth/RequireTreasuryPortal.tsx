'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getStoredUser } from '@/lib/settingsApi';
import {
  defaultHomePathForUser,
  userHasTreasuryPortalAccess,
  type PostLoginUser,
} from '@/lib/postLoginRedirect';

function storedUserToPostLogin(raw: ReturnType<typeof getStoredUser>): PostLoginUser | null {
  if (!raw) {
    return null;
  }
  const rolesUnknown = raw.roles;
  const roles = Array.isArray(rolesUnknown) ? (rolesUnknown as PostLoginUser['roles']) : [];
  const is_platform_admin = raw.is_platform_admin === true;
  return { roles, is_platform_admin };
}

/**
 * After JWT auth: only treasurer/treasury roles (or platform admin) may use `/treasury`.
 * Matches {@link userHasTreasuryPortalAccess}.
 */
export function RequireTreasuryPortal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = storedUserToPostLogin(getStoredUser());
    if (!userHasTreasuryPortalAccess(user)) {
      router.replace(defaultHomePathForUser(user));
      return;
    }
    const id = requestAnimationFrame(() => setAllowed(true));
    return () => cancelAnimationFrame(id);
  }, [router]);

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
