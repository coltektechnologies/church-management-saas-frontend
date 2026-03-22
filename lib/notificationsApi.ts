/**
 * In-app notifications REST API — `notifications` app.
 *
 * Router registers `notifications` → base list path is:
 * `{NEXT_PUBLIC_API_URL}/notifications/notifications/`
 *
 * @module lib/notificationsApi
 */

import { getApiBaseUrl, getAccessToken } from './api';

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(), ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      extractFieldError(data) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function extractFieldError(data: Record<string, unknown>): string | null {
  for (const v of Object.values(data)) {
    if (typeof v === 'string') {
      return v;
    }
    if (Array.isArray(v) && v[0] && typeof v[0] === 'string') {
      return v[0];
    }
  }
  return null;
}

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return Array.isArray(r) ? (r as T[]) : [];
  }
  return [];
}

/** Prefix for all notification ViewSet routes */
function notificationsRoot(): string {
  return `${getApiBaseUrl()}/notifications/notifications`;
}

export interface NotificationApiRow {
  id: string;
  title: string;
  message: string;
  priority: string;
  priority_display?: string;
  category: string | null;
  link?: string | null;
  icon?: string | null;
  status: string;
  status_display?: string;
  is_read: boolean;
  read_at?: string | null;
  time_ago?: string;
  created_at: string;
}

export interface NotificationCreateBody {
  user_id?: string;
  member_id?: string;
  title: string;
  message: string;
  priority: string;
  category?: string | null;
  link?: string | null;
  icon?: string | null;
  scheduled_for?: string | null;
}

export interface SendBulkBody {
  title: string;
  message: string;
  target: 'all_members' | 'departments' | 'specific';
  department_ids?: string[];
  member_ids?: string[];
  send_sms?: boolean;
  send_email?: boolean;
  send_in_app?: boolean;
}

export async function fetchNotificationsList(params?: {
  page_size?: number;
  is_read?: boolean;
}): Promise<NotificationApiRow[]> {
  const q = new URLSearchParams();
  q.set('page_size', String(params?.page_size ?? 100));
  if (params?.is_read !== undefined) {
    q.set('is_read', String(params.is_read));
  }
  const url = `${notificationsRoot()}/?${q.toString()}`;
  const data = await fetchAuth<unknown>(url, { method: 'GET' });
  return normalizeList<NotificationApiRow>(data);
}

export async function createNotificationApi(
  body: NotificationCreateBody
): Promise<NotificationApiRow> {
  const url = `${notificationsRoot()}/`;
  return fetchAuth<NotificationApiRow>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** PUT …/notifications/notifications/{id}/read/ */
export async function markNotificationReadApi(id: string): Promise<NotificationApiRow> {
  const url = `${notificationsRoot()}/${id}/read/`;
  return fetchAuth<NotificationApiRow>(url, { method: 'PUT', body: '{}' });
}

/** PUT …/notifications/notifications/mark_all_read/ */
export async function markAllNotificationsReadApi(): Promise<{ message?: string }> {
  const url = `${notificationsRoot()}/mark_all_read/`;
  return fetchAuth<{ message?: string }>(url, { method: 'PUT', body: '{}' });
}

/** GET …/unread_count/ */
export async function fetchUnreadNotificationCountApi(): Promise<{ unread_count: number }> {
  const url = `${notificationsRoot()}/unread_count/`;
  return fetchAuth<{ unread_count: number }>(url, { method: 'GET' });
}

/** POST …/notifications/send-bulk/ */
export async function sendBulkNotificationApi(body: SendBulkBody): Promise<{
  message?: string;
  batch_id?: string;
  status?: string;
}> {
  const url = `${getApiBaseUrl()}/notifications/send-bulk/`;
  return fetchAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** GET …/accounts/users/ — staff users for targeting */
export interface AccountUserRow {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export async function fetchAccountUsers(): Promise<AccountUserRow[]> {
  const url = `${getApiBaseUrl()}/accounts/users/?page_size=200`;
  const data = await fetchAuth<unknown>(url, { method: 'GET' });
  return normalizeList<AccountUserRow>(data);
}
