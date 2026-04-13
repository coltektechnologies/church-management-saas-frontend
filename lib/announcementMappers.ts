/**
 * Maps Django REST announcement payloads to the UI `Announcement` model.
 * @see lib/announcementsApi.ts
 * @see services/announcements.mock.ts
 */

import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementStatus,
  PriorityLevel,
} from '@/services/announcements.mock';
import type { AnnouncementDetailApi, AnnouncementListItemApi } from './announcementsApi';

const UI_CATEGORIES: AnnouncementCategory[] = [
  'Thanksgiving',
  'Prayer Request',
  'Birthday Wishes',
  'Funeral/Bereavements',
  'General Church',
  'Events & Programs',
  'Baptism Celebration',
  'Weddings',
  'Departmental Updates',
  'Community Outreach',
  'Health and Wellness',
  'Youth Activities',
];

/** Map backend category name (or nested object) to UI category enum. */
export function mapBackendCategoryName(raw: string | null | undefined): AnnouncementCategory {
  if (!raw || !String(raw).trim()) {
    return 'General Church';
  }
  const n = String(raw).trim();
  const lower = n.toLowerCase();
  for (const c of UI_CATEGORIES) {
    if (c.toLowerCase() === lower) {
      return c;
    }
  }
  if (lower.includes('event') || lower.includes('program')) {
    return 'Events & Programs';
  }
  if (lower.includes('prayer')) {
    return 'Prayer Request';
  }
  if (lower.includes('youth')) {
    return 'Youth Activities';
  }
  if (lower.includes('wedding')) {
    return 'Weddings';
  }
  if (lower.includes('baptism')) {
    return 'Baptism Celebration';
  }
  if (lower.includes('thank')) {
    return 'Thanksgiving';
  }
  if (lower.includes('funeral') || lower.includes('bereave')) {
    return 'Funeral/Bereavements';
  }
  if (lower.includes('birthday')) {
    return 'Birthday Wishes';
  }
  if (lower.includes('department')) {
    return 'Departmental Updates';
  }
  if (lower.includes('outreach') || lower.includes('community')) {
    return 'Community Outreach';
  }
  if (lower.includes('health')) {
    return 'Health and Wellness';
  }
  return 'General Church';
}

export function mapBackendPriority(p: string | null | undefined): PriorityLevel {
  const u = (p || 'MEDIUM').toUpperCase();
  if (u === 'LOW') {
    return 'Low';
  }
  if (u === 'HIGH' || u === 'URGENT') {
    return 'High';
  }
  return 'Medium';
}

/** Map backend status to filter chips / cards (UI uses a smaller set). */
export function mapBackendStatus(s: string | null | undefined): AnnouncementStatus {
  const u = (s || 'DRAFT').toUpperCase();
  switch (u) {
    case 'DRAFT':
    case 'PENDING_REVIEW':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'PUBLISHED':
      return 'Approved';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return 'Pending';
  }
}

function categoryFromDetail(d: AnnouncementDetailApi): string {
  const c = d.category;
  if (typeof c === 'object' && c && 'name' in c) {
    return (c as { name?: string }).name || '';
  }
  return typeof c === 'string' ? c : '';
}

export function mapListItemToAnnouncement(
  row: AnnouncementListItemApi,
  contentFallback = ''
): Announcement {
  const catName =
    typeof row.category === 'string'
      ? row.category
      : (row.category as { name?: string })?.name || '';
  const body =
    typeof row.content === 'string' && row.content.trim() !== ''
      ? row.content.trim()
      : contentFallback;
  return {
    id: row.id,
    category: mapBackendCategoryName(catName),
    priority: mapBackendPriority(row.priority),
    title: row.title || '',
    content: body,
    status: mapBackendStatus(row.status),
    author: typeof row.created_by === 'string' ? row.created_by : '—',
    authorRole: '—',
    date: (row.publish_at || row.created_at || new Date().toISOString()) as string,
    audience: ['Everyone'],
    publish_at: row.publish_at ?? null,
    expires_at: row.expires_at ?? null,
  };
}

export function mapDetailToAnnouncement(d: AnnouncementDetailApi): Announcement {
  const catName = categoryFromDetail(d);
  const createdBy =
    typeof d.created_by === 'string'
      ? d.created_by
      : (d.created_by as { email?: string })?.email || '—';
  return {
    id: d.id,
    category: mapBackendCategoryName(catName),
    priority: mapBackendPriority(d.priority),
    title: d.title || '',
    content: d.content || '',
    status: mapBackendStatus(d.status),
    author: createdBy,
    authorRole: '—',
    date: (d.publish_at || d.created_at || new Date().toISOString()) as string,
    audience: ['Everyone'],
    publish_at: d.publish_at ?? null,
    expires_at: d.expires_at ?? null,
  };
}

/** UI / form priority → API */
export function uiPriorityToApi(p: PriorityLevel | string): string {
  const s = String(p).toUpperCase();
  if (s === 'LOW') {
    return 'LOW';
  }
  if (s === 'HIGH') {
    return 'HIGH';
  }
  if (s === 'MEDIUM') {
    return 'MEDIUM';
  }
  const map: Record<string, string> = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH' };
  return map[p as string] || 'MEDIUM';
}
