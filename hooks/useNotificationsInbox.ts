import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MockNotificationItem } from '@/services/notificationsMock';
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
  const inboxKey = notificationsListQueryKey('inbox');
  return useMutation({
    mutationFn: (id: string) => markNotificationReadUi(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
      const previous = qc.getQueryData<MockNotificationItem[]>(inboxKey);
      if (previous) {
        qc.setQueryData(
          inboxKey,
          previous.map((n) =>
            n.id === id ? { ...n, is_read: true, status: 'READ' as const } : n
          )
        );
      }
      const prevCount = qc.getQueryData<number>(NOTIFICATIONS_UNREAD_COUNT_KEY);
      if (typeof prevCount === 'number' && prevCount > 0) {
        qc.setQueryData(NOTIFICATIONS_UNREAD_COUNT_KEY, prevCount - 1);
      }
      return { previous, prevCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(inboxKey, context.previous);
      }
      if (context?.prevCount !== undefined) {
        qc.setQueryData(NOTIFICATIONS_UNREAD_COUNT_KEY, context.prevCount);
      }
    },
    onSuccess: () => {
      invalidateNotificationQueries(qc);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  const inboxKey = notificationsListQueryKey('inbox');
  return useMutation({
    mutationFn: () => markAllNotificationsReadUi(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
      const previous = qc.getQueryData<MockNotificationItem[]>(inboxKey);
      if (previous) {
        qc.setQueryData(
          inboxKey,
          previous.map((n) => ({ ...n, is_read: true, status: 'READ' as const }))
        );
      }
      const prevCount = qc.getQueryData<number>(NOTIFICATIONS_UNREAD_COUNT_KEY);
      qc.setQueryData(NOTIFICATIONS_UNREAD_COUNT_KEY, 0);
      return { previous, prevCount };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(inboxKey, context.previous);
      }
      if (context?.prevCount !== undefined) {
        qc.setQueryData(NOTIFICATIONS_UNREAD_COUNT_KEY, context.prevCount);
      }
    },
    onSuccess: () => {
      invalidateNotificationQueries(qc);
    },
  });
}
