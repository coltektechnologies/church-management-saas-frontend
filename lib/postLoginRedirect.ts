import { getSafeReturnPath } from '@/lib/safeReturnPath';

/** When the user has no dedicated portal, send them here instead of `/admin`. */
export const START_HUB_PATH = '/start';

/** Role objects returned on login from UserSerializer.get_roles */
export type LoginUserRole = { id?: string; name?: string; level?: number | string };

export type PostLoginUser = {
  is_platform_admin?: boolean;
  roles?: LoginUserRole[];
};

function roleLevel(r: LoginUserRole): number {
  const n = Number(r.level);
  return Number.isFinite(n) ? n : 99;
}

/** Backend may use "Secretary", "Church Secretary", etc. */
function isSecretaryRoleName(raw: string | undefined | null): boolean {
  const n = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!n) {
    return false;
  }
  if (n === 'secretary') {
    return true;
  }
  return /\bsecretary\b/.test(n);
}

/** "Treasurer", "Church Treasurer", etc. */
function isTreasurerRoleName(raw: string | undefined | null): boolean {
  const n = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!n) {
    return false;
  }
  if (n === 'treasurer') {
    return true;
  }
  return /\btreasurer\b/.test(n);
}

/**
 * Department portal (`/departments`): "Department Head", "Elder in charge", etc.
 * (Backend seed: level 3 — must not match level-1 "First Elder".)
 */
/** Exported for `/departments` route guard — must stay in sync with default home routing. */
export function isDepartmentPortalRoleName(raw: string | undefined | null): boolean {
  const n = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!n) {
    return false;
  }
  if (/\bdepartment[\s-]+head\b/.test(n) || n === 'department head') {
    return true;
  }
  /* Match "Elder in charge", "Elder-in-charge", "Elder In Charge", minor spacing variants */
  if (/\belder[\s-]+in[\s-]+charge\b/.test(n) || n === 'elder in charge') {
    return true;
  }
  return false;
}

/**
 * Department portal access from the API (`GET /departments/my-portal/`), which uses
 * `Member.system_user_id` + department head / elder-in-charge assignment — not JWT `UserRole`
 * rows. Call this when role-based routing would otherwise send the user to `/start`.
 */
export async function canAccessDepartmentPortalViaApi(): Promise<boolean> {
  try {
    const { fetchDepartmentMyPortal } = await import('@/lib/departmentsApi');
    await fetchDepartmentMyPortal();
    return true;
  } catch {
    return false;
  }
}

/** True if the signed-in user has at least one department-portal role (any level). */
export function userHasDepartmentPortalAccess(user: PostLoginUser | null | undefined): boolean {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((r) => isDepartmentPortalRoleName(r.name));
}

/** Role names like "Treasury", "Treasury Committee", etc. (broader than treasurer-only). */
function isTreasuryTeamRoleName(raw: string | undefined | null): boolean {
  const n = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!n) {
    return false;
  }
  if (n === 'treasury') {
    return true;
  }
  return /\btreasury\b/.test(n);
}

/**
 * Standalone `/treasury` app — treasurer/treasury roles or platform admin.
 * (The admin shell still links to `/admin/treasury` for pastors/staff without these roles.)
 */
export function userHasTreasuryPortalAccess(user: PostLoginUser | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.is_platform_admin) {
    return true;
  }
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((r) => isTreasurerRoleName(r.name) || isTreasuryTeamRoleName(r.name));
}

/**
 * After login, choose home URL when `next` is not provided.
 * Uses JWT `user.roles` from church **UserRole** rows (see backend `UserSerializer.get_roles`).
 * Department head assignment must grant the "Department Head" (or elder in charge) UserRole
 * or this function will not send them to `/departments`.
 *
 * Dedicated portal roles are evaluated **across all roles**, not only the lowest-`level` tier.
 * Otherwise a Level-1 role (Pastor / First Elder, etc.) would win first and send users who are
 * also Department Head (typically Level 3) to `/admin` instead of `/departments`.
 *
 * Priority: treasury → secretary → department portal → admin shell (level ≤ 1 only) → `Start` hub.
 * Users without a mapped app no longer default to `/admin` (see START_HUB_PATH).
 */
export function canAccessAdminShell(user: PostLoginUser | null | undefined): boolean {
  if (user?.is_platform_admin) {
    return true;
  }
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.length === 0) {
    return false;
  }
  const minLevel = Math.min(...roles.map(roleLevel));
  return minLevel <= 1;
}

export function defaultHomePathForUser(user: PostLoginUser | null | undefined): string {
  if (user?.is_platform_admin) {
    return '/admin';
  }
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.length === 0) {
    return START_HUB_PATH;
  }

  if (roles.some((r) => isTreasurerRoleName(r.name) || isTreasuryTeamRoleName(r.name))) {
    return '/treasury';
  }
  if (roles.some((r) => isSecretaryRoleName(r.name))) {
    return '/secretary';
  }
  if (roles.some((r) => isDepartmentPortalRoleName(r.name))) {
    return '/departments';
  }

  if (canAccessAdminShell(user)) {
    return '/admin';
  }

  return START_HUB_PATH;
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
