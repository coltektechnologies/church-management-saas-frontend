/**
 * Admin staff directory — users, church groups, invite flow (create user + role + optional suspend).
 */

import { getApiBaseUrl, getAccessToken } from '@/lib/api';
import { messageFromApiErrorJson } from '@/lib/apiMessages';
import { createUserRole } from '@/lib/rolesApi';
import { updateUser } from '@/lib/settingsApi';
import type {
  InviteStaffPayload,
  StaffMember,
} from '@/components/admin/dashboardsettings/superadmin/adminManagementConfig';

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function fetchAuthJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (typeof data?.error === 'string' ? data.error : null) ||
      messageFromApiErrorJson(data, `Request failed: ${res.status}`);
    throw new Error(msg);
  }
  return data as T;
}

function normalizeList(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface StaffUserListItem {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  is_active?: boolean;
  primary_role_name?: string;
  church_group_ids?: string[];
}

export interface ChurchGroupSelectItem {
  id: string;
  name: string;
  role_name?: string;
}

export async function fetchStaffUserList(): Promise<StaffUserListItem[]> {
  const url = `${getApiBaseUrl()}/auth/users/?page_size=500`;
  const data = await fetchAuthJson<unknown>(url, { method: 'GET' });
  return normalizeList(data) as StaffUserListItem[];
}

export async function fetchChurchGroupsSelect(): Promise<ChurchGroupSelectItem[]> {
  const data = await fetchAuthJson<unknown>(`${getApiBaseUrl()}/auth/church-groups/`, {
    method: 'GET',
  });
  return (normalizeList(data) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ''),
    role_name: r.role_name !== undefined && r.role_name !== null ? String(r.role_name) : undefined,
  }));
}

export function mapApiUserToStaffMember(
  row: StaffUserListItem,
  currentUserId: string | null
): StaffMember {
  const isOwner = Boolean(currentUserId && row.id === currentUserId);
  return {
    id: row.id,
    first_name: row.first_name ?? '',
    last_name: row.last_name ?? '',
    email: row.email ?? '',
    phone: row.phone || undefined,
    username: row.username || undefined,
    roleName: (row.primary_role_name ?? '').trim() || 'Unassigned',
    churchGroupIds: Array.isArray(row.church_group_ids) ? row.church_group_ids : [],
    status: row.is_active === false ? 'suspended' : 'active',
    isOwner,
  };
}

/**
 * POST /auth/users/, then POST /auth/user-roles/, then optional PUT to deactivate.
 */
export async function inviteStaffUser(
  payload: InviteStaffPayload,
  roleId: string
): Promise<string> {
  const body: Record<string, unknown> = {
    email: payload.email,
    first_name: payload.first_name,
    last_name: payload.last_name,
    send_credentials: payload.send_credentials,
    notification_preference: payload.notification_preference,
  };
  if (payload.phone.trim()) {
    body.phone = payload.phone.trim();
  }
  if (payload.username.trim()) {
    body.username = payload.username.trim();
  }
  if (payload.date_of_birth) {
    body.date_of_birth = payload.date_of_birth;
  }
  if (payload.gender) {
    body.gender = payload.gender;
  }
  if (payload.address) {
    body.address = payload.address;
  }
  const groups = payload.church_groups.filter((id) => UUID_RE.test(id));
  if (groups.length > 0) {
    body.church_groups = groups;
  }
  if (payload.password) {
    body.password = payload.password;
    body.password_confirm = payload.password_confirm;
  }

  const created = await fetchAuthJson<{ id?: string }>(`${getApiBaseUrl()}/auth/users/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const userId = created.id !== undefined && created.id !== null ? String(created.id) : '';
  if (!userId) {
    throw new Error('Server did not return a user id.');
  }

  try {
    await createUserRole(userId, roleId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not assign role.';
    throw new Error(
      `${msg} The user was created; assign a role in Roles or remove the user and try again.`
    );
  }

  if (!payload.is_active) {
    await updateUser(userId, { is_active: false });
  }

  return userId;
}

export async function deleteStaffUser(userId: string): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/users/${userId}/`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 204 || res.ok) {
    return;
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  throw new Error(messageFromApiErrorJson(data, 'Could not remove user.'));
}
