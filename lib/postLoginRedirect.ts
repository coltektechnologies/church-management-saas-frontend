import { getSafeReturnPath } from '@/lib/safeReturnPath';

/** Role objects returned on login from UserSerializer.get_roles */
export type LoginUserRole = { id?: string; name?: string; level?: number };

export type PostLoginUser = {
  is_platform_admin?: boolean;
  roles?: LoginUserRole[];
};

/**
 * After login, choose home URL when `next` is not provided.
 * Uses the same "primary role" idea as the API: lowest `level` wins (1 = highest privilege).
 */
export function defaultHomePathForUser(user: PostLoginUser | null | undefined): string {
  if (user?.is_platform_admin) {
    return '/admin';
  }
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.length === 0) {
    return '/admin';
  }

  const primary = roles.reduce((best, r) => {
    const lv = typeof r.level === 'number' ? r.level : 99;
    const bestLv = typeof best.level === 'number' ? best.level : 99;
    return lv < bestLv ? r : best;
  });

  const name = String(primary?.name ?? '').trim().toLowerCase();

  if (name === 'secretary') {
    return '/secretary';
  }

  return '/admin';
}

/**
 * `next` from query wins when present and safe; otherwise role-based home.
 */
export function resolvePostLoginPath(
  next: string | null | undefined,
  user: PostLoginUser | null | undefined
): string {
  const trimmed = next === undefined || next === null ? '' : String(next).trim();
  if (trimmed !== '') {
    return getSafeReturnPath(next ?? null);
  }
  return defaultHomePathForUser(user);
}
