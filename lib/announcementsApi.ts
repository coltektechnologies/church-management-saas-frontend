/**
 * Announcements REST API — church-management-saas-backend `announcements` app.
 *
 * Base path: `{NEXT_PUBLIC_API_URL}/announcements/`
 *
 * @module lib/announcementsApi
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

function announcementsBase(): string {
  return `${getApiBaseUrl()}/announcements`;
}

// ---------------------------------------------------------------------------
// Types (aligned with AnnouncementListSerializer / AnnouncementDetailSerializer)
// ---------------------------------------------------------------------------

export interface AnnouncementCategoryApi {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementListItemApi {
  id: string;
  title: string;
  /** Included for admin list cards / search; same field as detail. */
  content?: string;
  status: string;
  status_display?: string;
  priority: string;
  priority_display?: string;
  is_featured?: boolean;
  is_pinned?: boolean;
  publish_at: string | null;
  expires_at: string | null;
  created_at: string;
  category: string | { name?: string };
  created_by: string;
  attachment_count?: number;
  /** When false, the current user may not approve/reject this announcement (API-enforced). */
  can_approve?: boolean;
}

export interface AnnouncementDetailApi {
  id: string;
  title: string;
  content: string;
  status: string;
  status_display?: string;
  priority: string;
  priority_display?: string;
  is_featured?: boolean;
  is_pinned?: boolean;
  is_published?: boolean;
  allow_comments?: boolean;
  allow_sharing?: boolean;
  publish_at: string | null;
  expires_at: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  category: AnnouncementCategoryApi | string | null;
  category_id?: string | null;
  created_by: string | { email?: string };
  approved_by?: string | null;
  approved_at?: string | null;
  attachments?: unknown[];
}

export interface AnnouncementCreateBody {
  title: string;
  content: string;
  priority: string;
  category_id?: string | null;
  publish_at?: string | null;
  expires_at?: string | null;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  allow_sharing?: boolean;
  template_id?: string | null;
}

export async function fetchAnnouncementCategories(): Promise<AnnouncementCategoryApi[]> {
  const url = `${announcementsBase()}/categories/?page_size=500`;
  const data = await fetchAuth<unknown>(url, { method: 'GET' });
  return normalizeList<AnnouncementCategoryApi>(data);
}

export async function fetchAnnouncementsList(params?: {
  page_size?: number;
  page?: number;
  search?: string;
  status?: string;
  /** Department portal: only announcements created by the current user (backend `mine_only`). */
  mine_only?: boolean;
  /**
   * Secretariat pipeline (pending / approved / published) plus items authored by users with
   * `secretariat.create_announcement` for this church (backend `secretariat_feed`).
   */
  secretariat_feed?: boolean;
}): Promise<AnnouncementListItemApi[]> {
  const q = new URLSearchParams();
  q.set('page_size', String(params?.page_size ?? 100));
  if (params?.page && params.page > 1) {
    q.set('page', String(params.page));
  }
  if (params?.search) {
    q.set('search', params.search);
  }
  if (params?.status) {
    q.set('status', params.status);
  }
  if (params?.mine_only) {
    q.set('mine_only', 'true');
  }
  if (params?.secretariat_feed) {
    q.set('secretariat_feed', 'true');
  }
  const url = `${announcementsBase()}/?${q.toString()}`;
  const data = await fetchAuth<unknown>(url, { method: 'GET' });
  return normalizeList<AnnouncementListItemApi>(data);
}

/**
 * Walk DRF pages until a short page or `maxPages` (default 50 × page_size rows).
 * Omit `mine_only` for the member/church-wide published feed (plus the caller’s own non-published rows per backend rules).
 */
export async function fetchAnnouncementsListAllPages(options?: {
  search?: string;
  status?: string;
  mine_only?: boolean;
  secretariat_feed?: boolean;
  page_size?: number;
  maxPages?: number;
}): Promise<AnnouncementListItemApi[]> {
  /** Default matches DRF `PAGE_SIZE` when the client `page_size` query is ignored. */
  const pageSize = Math.min(Math.max(options?.page_size ?? 50, 1), 200);
  const maxPages = Math.min(Math.max(options?.maxPages ?? 60, 1), 200);
  const all: AnnouncementListItemApi[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const chunk = await fetchAnnouncementsList({
      page_size: pageSize,
      page: page > 1 ? page : undefined,
      search: options?.search?.trim() || undefined,
      status: options?.status,
      mine_only: options?.mine_only,
      secretariat_feed: options?.secretariat_feed,
    });
    if (chunk.length === 0) {
      break;
    }
    all.push(...chunk);
    if (chunk.length < pageSize) {
      break;
    }
  }
  return all;
}

export async function fetchAnnouncementDetail(id: string): Promise<AnnouncementDetailApi> {
  const url = `${announcementsBase()}/${id}/`;
  return fetchAuth<AnnouncementDetailApi>(url, { method: 'GET' });
}

export async function createAnnouncementApi(
  body: AnnouncementCreateBody
): Promise<AnnouncementDetailApi> {
  const url = `${announcementsBase()}/`;
  return fetchAuth<AnnouncementDetailApi>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function patchAnnouncementApi(
  id: string,
  body: Partial<AnnouncementCreateBody>
): Promise<AnnouncementDetailApi> {
  const url = `${announcementsBase()}/${id}/`;
  return fetchAuth<AnnouncementDetailApi>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAnnouncementApi(id: string): Promise<void> {
  const url = `${announcementsBase()}/${id}/`;
  await fetchAuth<unknown>(url, { method: 'DELETE' });
}

/** POST …/announcements/{id}/submit/ — DRAFT → PENDING_REVIEW */
export async function submitAnnouncementApi(id: string): Promise<void> {
  const url = `${announcementsBase()}/${id}/submit/`;
  await fetchAuth<unknown>(url, { method: 'POST', body: '{}' });
}

/** POST …/approve/ */
export async function approveAnnouncementApi(id: string): Promise<void> {
  const url = `${announcementsBase()}/${id}/approve/`;
  await fetchAuth<unknown>(url, { method: 'POST', body: '{}' });
}

/** POST …/publish/ */
export async function publishAnnouncementApi(id: string): Promise<void> {
  const url = `${announcementsBase()}/${id}/publish/`;
  await fetchAuth<unknown>(url, { method: 'POST', body: '{}' });
}

/** POST …/reject/ */
export async function rejectAnnouncementApi(id: string, reason: string): Promise<void> {
  const url = `${announcementsBase()}/${id}/reject/`;
  await fetchAuth<unknown>(url, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason: reason }),
  });
}
