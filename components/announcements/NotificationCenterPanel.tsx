'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellRing,
  Calendar,
  CheckCheck,
  ChevronRight,
  Gift,
  Megaphone,
  Plus,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MockNotificationItem, NotificationCategory } from '@/services/notificationsMock';
import { MOCK_NOTIFICATIONS } from '@/services/notificationsMock';
import { NotificationDetailModal } from '@/components/announcements/NotificationDetailModal';
import { CreateNotificationModal } from '@/components/announcements/CreateNotificationModal';
import { notificationsApiEnabled } from '@/services/notificationsService';
import {
  NOTIFICATIONS_LIST_QUERY_KEY,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsListQuery,
} from '@/hooks/useNotificationsInbox';
import { toast } from 'sonner';

interface NotificationCenterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
}

const categoryMeta: Record<
  NotificationCategory,
  { label: string; icon: typeof Megaphone; className: string }
> = {
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: Megaphone,
    className: 'bg-primary/15 text-primary',
  },
  REMINDER: {
    label: 'Reminder',
    icon: Bell,
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  EVENT: {
    label: 'Event',
    icon: Calendar,
    className: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  },
  BIRTHDAY: {
    label: 'Birthday',
    icon: Gift,
    className: 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
  },
  FINANCE: {
    label: 'Finance',
    icon: Wallet,
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  GENERAL: {
    label: 'General',
    icon: Sparkles,
    className: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  },
  PROGRAM: {
    label: 'Program',
    icon: Calendar,
    className: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  },
};

function categoryKey(c: MockNotificationItem['category']): NotificationCategory {
  if (c && c in categoryMeta) {
    return c as NotificationCategory;
  }
  return 'GENERAL';
}

function priorityDot(priority: MockNotificationItem['priority']) {
  switch (priority) {
    case 'URGENT':
      return 'bg-destructive';
    case 'HIGH':
      return 'bg-orange-500';
    case 'MEDIUM':
      return 'bg-amber-400';
    default:
      return 'bg-muted-foreground/40';
  }
}

export function NotificationCenterPanel({
  open,
  onOpenChange,
  onUnreadCountChange,
}: NotificationCenterPanelProps) {
  const queryClient = useQueryClient();
  const useApi = notificationsApiEnabled();

  const [mockItems, setMockItems] = useState<MockNotificationItem[]>(() => [...MOCK_NOTIFICATIONS]);
  /** Inbox tab = merged feed (to you + sent by you); Unread = inbox unread only; Sent = outbox only. */
  const [listTab, setListTab] = useState<'all' | 'unread' | 'sent'>('all');
  const [detailItem, setDetailItem] = useState<MockNotificationItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const inboxQuery = useNotificationsListQuery('inbox', { enabled: useApi && open });
  /** Load sent on Sent and on All so “All” can merge inbox + outbox (staff often only have sent). */
  const sentQuery = useNotificationsListQuery('sent', {
    enabled: useApi && open && (listTab === 'sent' || listTab === 'all'),
  });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const inboxItems = useMemo(
    () => (useApi ? (inboxQuery.data ?? []) : mockItems),
    [useApi, inboxQuery.data, mockItems]
  );

  const items = useMemo(() => {
    if (!useApi) {
      if (listTab === 'sent') {
        return mockItems.filter(
          (n) =>
            n.audience_mode === 'batch' ||
            (typeof n.recipient_count_estimate === 'number' && n.recipient_count_estimate > 1)
        );
      }
      return mockItems;
    }
    if (listTab === 'sent') {
      return sentQuery.data ?? [];
    }
    const inbox = inboxQuery.data ?? [];
    if (listTab === 'all') {
      const sent = sentQuery.data ?? [];
      if (inbox.length === 0 && sent.length === 0) {
        return [];
      }
      const byId = new Map<string, MockNotificationItem>();
      for (const n of inbox) {
        byId.set(n.id, { ...n, isComposerOutbox: false });
      }
      for (const n of sent) {
        if (!byId.has(n.id)) {
          byId.set(n.id, { ...n, isComposerOutbox: true });
        }
      }
      return [...byId.values()].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return inbox;
  }, [useApi, listTab, mockItems, inboxQuery.data, sentQuery.data]);

  useEffect(() => {
    if (!useApi || !open) {
      return;
    }
    const err =
      listTab === 'sent'
        ? sentQuery.error
        : listTab === 'all'
          ? (inboxQuery.error ?? sentQuery.error)
          : inboxQuery.error;
    if (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, [useApi, open, listTab, inboxQuery.error, sentQuery.error]);

  useEffect(() => {
    if (open && useApi) {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
    }
  }, [open, useApi, queryClient]);

  const unreadCount = useMemo(() => inboxItems.filter((n) => !n.is_read).length, [inboxItems]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const filtered = useMemo(() => {
    if (listTab === 'sent') {
      return items;
    }
    if (listTab === 'unread') {
      return items.filter((n) => !n.is_read);
    }
    return items;
  }, [items, listTab]);

  const isSentView = listTab === 'sent';
  const apiLoading =
    useApi &&
    (listTab === 'sent'
      ? sentQuery.isLoading
      : listTab === 'all'
        ? inboxQuery.isLoading || sentQuery.isLoading
        : inboxQuery.isLoading);

  const markRead = useCallback(
    (id: string) => {
      if (useApi) {
        markReadMutation.mutate(id, {
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not mark as read'),
        });
        return;
      }
      const now = new Date().toISOString();
      setMockItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: now, status: 'READ' as const } : n
        )
      );
    },
    [useApi, markReadMutation]
  );

  const markAllRead = useCallback(() => {
    if (useApi) {
      markAllMutation.mutate(undefined, {
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not mark all as read'),
      });
      return;
    }
    const now = new Date().toISOString();
    setMockItems((prev) =>
      prev.map((n) =>
        n.is_read ? n : { ...n, is_read: true, read_at: now, status: 'READ' as const }
      )
    );
  }, [useApi, markAllMutation]);

  const handleCreated = useCallback(
    (item: MockNotificationItem | null) => {
      if (useApi) {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
      } else if (item) {
        setMockItems((prev) => [item, ...prev]);
      }
    },
    [useApi, queryClient]
  );

  const modals = (
    <>
      {detailItem && (
        <NotificationDetailModal
          item={detailItem}
          open={!!detailItem}
          isSentView={isSentView || Boolean(detailItem.isComposerOutbox)}
          onOpenChange={(o) => {
            if (!o) {
              setDetailItem(null);
            }
          }}
          onMarkRead={markRead}
        />
      )}
      <CreateNotificationModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </>
  );

  if (!open) {
    return modals;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
        aria-label="Close notifications"
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl',
          'animate-in slide-in-from-right duration-300'
        )}
        role="dialog"
        aria-labelledby="notification-center-title"
        aria-modal="true"
      >
        <div className="flex shrink-0 flex-col gap-1 border-b border-border bg-gradient-to-br from-primary/[0.06] via-card to-card px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <BellRing className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2
                  id="notification-center-title"
                  className="text-lg font-semibold tracking-tight text-[#083344] dark:text-foreground"
                >
                  Notifications
                </h2>
                <p className="text-xs text-muted-foreground">
                  {useApi
                    ? 'Inbox: messages to you and ones you sent. Unread: only unread addressed to you. Sent: only what you created.'
                    : 'Demo inbox · set NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS=false for API'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-3.5" />
                Create
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setListTab('all')}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3',
                  listTab === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Inbox
              </button>
              <button
                type="button"
                onClick={() => setListTab('unread')}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3',
                  listTab === 'unread'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setListTab('sent')}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3',
                  listTab === 'sent'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sent
              </button>
            </div>
            {listTab !== 'sent' && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={markAllRead}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {useApi && apiLoading ? (
            <div className="flex flex-col gap-2 px-2 py-8 text-center text-sm text-muted-foreground">
              Loading notifications…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Bell className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">You&apos;re all caught up</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {listTab === 'sent'
                    ? 'No sent in-app notifications yet. They appear here when you create them for others.'
                    : listTab === 'unread'
                      ? 'No unread notifications in your inbox.'
                      : 'No notifications yet. Inbox includes items sent to you and items you sent.'}
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((n) => {
                const ck = categoryKey(n.category);
                const meta = categoryMeta[ck];
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => setDetailItem(n)}
                      className={cn(
                        'group w-full rounded-xl border text-left transition-colors',
                        'hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSentView || n.is_read || n.isComposerOutbox
                          ? 'border-border/60 bg-card'
                          : 'border-primary/25 bg-primary/[0.04] shadow-sm'
                      )}
                    >
                      <div className="flex gap-3 p-3.5">
                        <div
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-xl',
                            meta.className
                          )}
                        >
                          <Icon className="size-[18px]" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'pr-1 text-sm leading-snug',
                                isSentView || n.is_read || n.isComposerOutbox
                                  ? 'font-medium text-foreground'
                                  : 'font-semibold text-foreground'
                              )}
                            >
                              {n.title}
                            </p>
                            <div className="flex shrink-0 items-center gap-1">
                              {!isSentView && !n.is_read && !n.isComposerOutbox && (
                                <span
                                  className="mt-1.5 size-2 rounded-full bg-primary"
                                  title="Unread"
                                />
                              )}
                              <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {n.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <span
                                className={cn('size-1.5 rounded-full', priorityDot(n.priority))}
                                title={n.priority}
                              />
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                            <span className="text-border">·</span>
                            <span className="font-medium text-muted-foreground/90">
                              {meta.label}
                            </span>
                            <span className="text-border">·</span>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                              {n.status}
                            </span>
                            {n.channels && n.channels.length > 0 && (
                              <>
                                <span className="text-border">·</span>
                                <span className="text-muted-foreground/80">
                                  {n.channels.join(' · ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {modals}
    </>
  );
}
