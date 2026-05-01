/**
 * Church roles and user–role assignments (GET /api/auth/roles/, user-roles/).
 */

import { getApiBaseUrl, getAccessToken } from './api';

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (typeof data?.error === 'string' ? data.error : null) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

export interface RoleRow {
  id: string;
  name: string;
  level: number;
  description?: string | null;
}

export interface UserRoleRow {
  id: string;
  user: string;
  user_email?: string;
  user_name?: string;
  role: string;
  role_name?: string;
  is_active?: boolean;
}

export async function fetchRolesList(): Promise<RoleRow[]> {
  const base = getApiBaseUrl();
  const data = await fetchAuth<unknown>(`${base}/auth/roles/`, { method: 'GET' });
  return normalizeList<RoleRow>(data).sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export async function fetchUserRolesForRole(roleId: string): Promise<UserRoleRow[]> {
  const base = getApiBaseUrl();
  const q = new URLSearchParams({ role_id: roleId });
  const data = await fetchAuth<unknown>(`${base}/auth/user-roles/?${q}`, {
    method: 'GET',
  });
  return normalizeList<UserRoleRow>(data).filter((ur) => ur.is_active !== false);
}

/** GET …/auth/user-roles/?user_id= — assignments for one user (church-scoped on server). */
export async function fetchUserRolesForUser(userId: string): Promise<UserRoleRow[]> {
  const base = getApiBaseUrl();
  const q = new URLSearchParams({ user_id: userId });
  const data = await fetchAuth<unknown>(`${base}/auth/user-roles/?${q}`, {
    method: 'GET',
  });
  return normalizeList<UserRoleRow>(data).filter((ur) => ur.is_active !== false);
}

/** DELETE …/auth/user-roles/:id/ — remove an assignment. */
export async function deleteUserRoleAssignment(userRoleId: string): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/user-roles/${userRoleId}/`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 204 || res.ok) {
    return;
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const msg =
    (typeof data?.detail === 'string' ? data.detail : null) ||
    (typeof data?.error === 'string' ? data.error : null) ||
    `Request failed: ${res.status}`;
  throw new Error(msg);
}

/** POST …/auth/user-roles/ — assign a role within the signed-in user's church. */
export async function createUserRole(userId: string, roleId: string): Promise<UserRoleRow> {
  const base = getApiBaseUrl();
  return fetchAuth<UserRoleRow>(`${base}/auth/user-roles/`, {
    method: 'POST',
    body: JSON.stringify({ user: userId, role: roleId }),
  });
}
