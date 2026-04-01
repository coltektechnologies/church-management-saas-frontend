import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationsForUi,
  getUnreadCountUi,
  markAllNotificationsReadUi,
  markNotificationReadUi,
  notificationsApiEnabled,
} from '@/services/notificationsService';

/** Prefix for React Query; invalidate with `['notifications', 'list']` to refresh all mailboxes. */
export const NOTIFICATIONS_LIST_QUERY_KEY = ['notifications', 'list'] as const;

export const NOTIFICATIONS_UNREAD_COUNT_KEY = ['notifications', 'unread_count'] as const;

export function notificationsListQueryKey(mailbox: 'inbox' | 'sent') {
  return [...NOTIFICATIONS_LIST_QUERY_KEY, mailbox] as const;
}

/** @deprecated use notificationsListQueryKey */
export const NOTIFICATIONS_INBOX_QUERY_KEY = notificationsListQueryKey('inbox');

export function useNotificationsListQuery(
  mailbox: 'inbox' | 'sent',
  options?: { enabled?: boolean }
) {
  const baseEnabled = notificationsApiEnabled();
  return useQuery({
    queryKey: notificationsListQueryKey(mailbox),
    queryFn: () => fetchNotificationsForUi(mailbox),
    enabled: (options?.enabled ?? true) && baseEnabled,
    staleTime: 30_000,
  });
}

/** Inbox only — convenience for simple callers */
export function useNotificationsInboxQuery() {
  return useNotificationsListQuery('inbox');
}

export function useUnreadNotificationCountQuery(options?: { enabled?: boolean }) {
  const baseEnabled = notificationsApiEnabled();
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY,
    queryFn: () => getUnreadCountUi(),
    enabled: (options?.enabled ?? true) && baseEnabled,
    staleTime: 30_000,
  });
}

function invalidateNotificationQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
  qc.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationReadUi(id),
    onSuccess: () => {
      invalidateNotificationQueries(qc);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsReadUi(),
    onSuccess: () => {
      invalidateNotificationQueries(qc);
    },
  });
}
