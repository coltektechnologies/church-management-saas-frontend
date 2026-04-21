import { getSafeReturnPath } from '@/lib/safeReturnPath';

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
  if (/\bdepartment\s+head\b/.test(n) || n === 'department head') {
    return true;
  }
  if (/\belder\s+in\s+charge\b/.test(n) || n === 'elder in charge') {
    return true;
  }
  return false;
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
 * Department head assignment on a department must grant the "Department Head" UserRole
 * (and the member must have `system_user_id`) or this function will not send them to `/departments`.
 *
 * Uses roles at the user's **minimum** `level` (1 = highest privilege).
 * For that tier, picks a destination by **explicit role name** — not `reduce` tie-breaks,
 * so Treasurer+Secretary users get a stable rule: Treasurer routes to treasury first.
 */
export function defaultHomePathForUser(user: PostLoginUser | null | undefined): string {
  if (user?.is_platform_admin) {
    return '/admin';
  }
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.length === 0) {
    return '/admin';
  }

  const minLevel = Math.min(...roles.map(roleLevel));
  const atTier = roles.filter((r) => roleLevel(r) === minLevel);

  // Level 1 (Pastor / First Elder, etc.) — main admin shell
  if (minLevel <= 1) {
    return '/admin';
  }

  // Core staff (typically level 2): route by named role among this tier only
  if (atTier.some((r) => isTreasurerRoleName(r.name) || isTreasuryTeamRoleName(r.name))) {
    return '/treasury';
  }
  if (atTier.some((r) => isSecretaryRoleName(r.name))) {
    return '/secretary';
  }

  // Department heads / elders in charge (typically level 3) — dedicated app shell
  if (atTier.some((r) => isDepartmentPortalRoleName(r.name))) {
    return '/departments';
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
