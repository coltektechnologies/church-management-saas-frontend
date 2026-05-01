import type { DepartmentMyPortalEmpty } from '@/lib/departmentsApi';
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
export type DepartmentPortalProbe =
  | { ok: true }
  | {
      ok: false;
      kind: 'api_unreachable' | 'no_assignment' | 'forbidden' | 'unknown';
      detail?: string;
    };

/**
 * Distinguishes “API failed / wrong URL / CORS” from “user has no head/elder assignment”
 * so `/start` can show accurate guidance.
 */
export async function probeDepartmentPortalAccess(): Promise<DepartmentPortalProbe> {
  try {
    const { fetchDepartmentMyPortal, isDepartmentMyPortalSuccess } = await import(
      '@/lib/departmentsApi'
    );
    const data = await fetchDepartmentMyPortal();
    if (isDepartmentMyPortalSuccess(data)) {
      return { ok: true };
    }
    const empty = data as DepartmentMyPortalEmpty;
    return {
      ok: false,
      kind: 'no_assignment',
      detail: empty.detail ?? empty.reason ?? 'no portal',
    };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const msg = raw.toLowerCase();
    if (
      raw.includes('NEXT_PUBLIC_API_URL') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed') ||
      (msg.includes('fetch') && msg.includes('aborted'))
    ) {
      return { ok: false, kind: 'api_unreachable', detail: raw };
    }
    if (msg.includes('403') || msg.includes('church context')) {
      return { ok: false, kind: 'forbidden', detail: raw };
    }
    if (
      msg.includes('404') ||
      msg.includes('not linked') ||
      msg.includes('not assigned') ||
      msg.includes('no church member') ||
      msg.includes('department head or elder') ||
      msg.includes('not department head')
    ) {
      return { ok: false, kind: 'no_assignment', detail: raw };
    }
    return { ok: false, kind: 'unknown', detail: raw };
  }
}

export async function canAccessDepartmentPortalViaApi(): Promise<boolean> {
  const p = await probeDepartmentPortalAccess();
  return p.ok === true;
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

/** `/secretary` app — secretary roles or platform admin (same rule as {@link defaultHomePathForUser}). */
export function userHasSecretaryPortalAccess(user: PostLoginUser | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.is_platform_admin) {
    return true;
  }
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((r) => isSecretaryRoleName(r.name));
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

/**
 * Same as {@link resolvePostLoginPath}, then if the sync role map sends the user to `/start`,
 * check `GET /departments/my-portal/` (Member + department head / elder in charge). JWT roles
 * often omit "Department Head" until sync — without this probe, department leads land on `/start`.
 */
export async function resolvePostLoginDestinationWithDepartmentProbe(
  next: string | null | undefined,
  user: PostLoginUser | null | undefined
): Promise<string> {
  const dest = resolvePostLoginPath(next, user);
  if (dest === START_HUB_PATH) {
    try {
      if (await canAccessDepartmentPortalViaApi()) {
        return '/departments';
      }
    } catch {
      /* keep START_HUB_PATH */
    }
  }
  return dest;
}
