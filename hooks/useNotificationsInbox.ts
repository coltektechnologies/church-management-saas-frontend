import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationsForUi,
  markAllNotificationsReadUi,
  markNotificationReadUi,
  notificationsApiEnabled,
} from '@/services/notificationsService';

export const NOTIFICATIONS_INBOX_QUERY_KEY = ['notifications', 'inbox'] as const;

export function useNotificationsInboxQuery() {
  const enabled = notificationsApiEnabled();
  return useQuery({
    queryKey: NOTIFICATIONS_INBOX_QUERY_KEY,
    queryFn: fetchNotificationsForUi,
    enabled,
    staleTime: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationReadUi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_INBOX_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsReadUi(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_INBOX_QUERY_KEY });
    },
  });
}
