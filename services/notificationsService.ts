/**
 * Notification list / create — bridges UI (`MockNotificationItem`) and `lib/notificationsApi.ts`.
 *
 * When `isMockNotificationsEnabled()` is true or there is no auth token, callers should use mock data.
 *
 * @module services/notificationsService
 */

import { getAccessToken } from '@/lib/api';
import { isMockNotificationsEnabled } from '@/lib/featureFlags';
import type { NotificationApiRow } from '@/lib/notificationsApi';
import {
  createNotificationApi,
  fetchNotificationsList,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  fetchUnreadNotificationCountApi,
  sendBulkNotificationApi,
} from '@/lib/notificationsApi';
import type {
  MockNotificationItem,
  NotificationCategory,
  NotificationPriority,
} from '@/services/notificationsMock';

function shouldUseLiveApi(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  if (isMockNotificationsEnabled()) {
    return false;
  }
  return !!getAccessToken();
}

function mapPriority(p: string): NotificationPriority {
  const u = (p || 'MEDIUM').toUpperCase();
  if (u === 'URGENT') {
    return 'URGENT';
  }
  if (u === 'HIGH') {
    return 'HIGH';
  }
  if (u === 'LOW') {
    return 'LOW';
  }
  return 'MEDIUM';
}

function mapCategory(c: string | null | undefined): NotificationCategory | '' {
  if (!c) {
    return 'GENERAL';
  }
  const up = c.toUpperCase();
  const allowed: NotificationCategory[] = [
    'ANNOUNCEMENT',
    'REMINDER',
    'EVENT',
    'BIRTHDAY',
    'FINANCE',
    'GENERAL',
    'PROGRAM',
  ];
  return (allowed.includes(up as NotificationCategory) ? up : 'GENERAL') as NotificationCategory;
}

/** Map DRF notification row → UI list item */
export function mapApiRowToMockItem(row: NotificationApiRow): MockNotificationItem {
  const st = (row.status || 'SENT').toUpperCase();
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    priority: mapPriority(row.priority),
    category: mapCategory(row.category),
    link: row.link ?? null,
    icon: row.icon ?? null,
    status:
      st === 'READ' ? 'READ' : st === 'FAILED' ? 'FAILED' : st === 'PENDING' ? 'PENDING' : 'SENT',
    is_read: row.is_read,
    read_at: row.read_at ?? null,
    created_at: row.created_at,
    scheduled_for: null,
    sent_at: row.created_at,
  };
}

export async function fetchNotificationsForUi(
  mailbox: 'inbox' | 'sent' = 'inbox'
): Promise<MockNotificationItem[]> {
  if (!shouldUseLiveApi()) {
    throw new Error('Use mock notifications when API is disabled');
  }
  const rows = await fetchNotificationsList({ page_size: 100, mailbox });
  return rows.map(mapApiRowToMockItem);
}

export async function markNotificationReadUi(id: string): Promise<MockNotificationItem> {
  const row = await markNotificationReadApi(id);
  return mapApiRowToMockItem(row);
}

export async function markAllNotificationsReadUi(): Promise<void> {
  await markAllNotificationsReadApi();
}

export async function getUnreadCountUi(): Promise<number> {
  const { unread_count } = await fetchUnreadNotificationCountApi();
  return unread_count;
}

export async function createNotificationFromWizard(payload: {
  user_id?: string;
  member_id?: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory | '';
  link?: string | null;
  icon?: string | null;
  scheduled_for?: string | null;
}): Promise<MockNotificationItem> {
  const row = await createNotificationApi({
    user_id: payload.user_id,
    member_id: payload.member_id,
    title: payload.title,
    message: payload.message,
    priority: payload.priority,
    category: payload.category || 'GENERAL',
    link: payload.link ?? null,
    icon: payload.icon && payload.icon !== 'none' ? payload.icon : null,
    scheduled_for: payload.scheduled_for ?? null,
  });
  return mapApiRowToMockItem(row);
}

export async function sendBulkFromWizard(body: {
  title: string;
  message: string;
  target: 'all_members' | 'departments' | 'specific';
  department_ids?: string[];
  member_ids?: string[];
  send_sms: boolean;
  send_email: boolean;
  send_in_app: boolean;
}): Promise<void> {
  await sendBulkNotificationApi(body);
}

export { shouldUseLiveApi as notificationsApiEnabled };
