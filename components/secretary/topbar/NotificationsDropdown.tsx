'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NOTIFICATIONS_LIST_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_KEY,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsListQuery,
  useUnreadNotificationCountQuery,
} from '@/hooks/useNotificationsInbox';
import type { MockNotificationItem } from '@/services/notificationsMock';
import { notificationsApiEnabled } from '@/services/notificationsService';
import { normalizeNotificationLinkForSpa } from '@/lib/notificationLinks';

interface Props {
  iconColor?: string;
  hoverBg?: string;
  badgeBg?: string;
}

export default function NotificationsDropdown({
  iconColor = '#0B2A4A',
  hoverBg = 'rgba(0,0,0,0.06)',
  badgeBg = '#2FC4B2',
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const apiEnabled = notificationsApiEnabled();

  const [open, setOpen] = useState(false);
  const inboxQuery = useNotificationsListQuery('inbox', { enabled: apiEnabled });
  const unreadQuery = useUnreadNotificationCountQuery({ enabled: apiEnabled });
  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const items = useMemo(() => inboxQuery.data ?? [], [inboxQuery.data]);
  const unread = apiEnabled ? (unreadQuery.data ?? 0) : 0;

  useEffect(() => {
    if (!open || !apiEnabled) {
      return;
    }
    void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY });
  }, [open, apiEnabled, queryClient]);

  const handleRowClick = (item: MockNotificationItem) => {
    if (!item.is_read) {
      markOne.mutate(item.id);
    }
    const rawLink = item.link?.trim();
    if (rawLink) {
      const href = normalizeNotificationLinkForSpa(rawLink);
      if (href.startsWith('http')) {
        try {
          const url = new URL(href);
          if (typeof window !== 'undefined' && url.origin === window.location.origin) {
            router.push(`${url.pathname}${url.search}${url.hash}`);
          } else {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        } catch {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      } else {
        router.push(href.startsWith('/') ? href : `/${href}`);
      }
    }
    setOpen(false);
  };

  // Badge text colour — white or dark depending on badge bg
  function autoText(hex: string) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) || 0;
    const g = parseInt(h.substring(2, 4), 16) || 0;
    const b = parseInt(h.substring(4, 6), 16) || 0;
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        style={{ color: iconColor }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        title="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center leading-none"
            style={{ backgroundColor: badgeBg, color: autoText(badgeBg) }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.10)] overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {unread} unread
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                  className="text-[11px] font-medium text-primary hover:underline disabled:opacity-60"
                >
                  {markAll.isPending ? 'Updating…' : 'Mark all read'}
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {!apiEnabled && (
                <p className="px-4 py-8 text-xs text-muted-foreground text-center">
                  Enable live notifications in this environment to load your inbox.
                </p>
              )}
              {apiEnabled && inboxQuery.isLoading && (
                <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                  Loading notifications...
                </p>
              )}
              {apiEnabled && inboxQuery.isError && (
                <p className="px-4 py-8 text-sm text-destructive text-center">
                  Could not load notifications.
                </p>
              )}
              {apiEnabled && !inboxQuery.isLoading && !inboxQuery.isError && items.length === 0 && (
                <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                  No notifications yet.
                </p>
              )}
              {apiEnabled &&
                !inboxQuery.isLoading &&
                !inboxQuery.isError &&
                items.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors',
                      !n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                    )}
                    onClick={() => handleRowClick(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(n);
                      }
                    }}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {!n.is_read ? (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {n.message?.trim() && n.message !== n.title
                          ? `${n.title}: ${n.message}`
                          : n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border text-center">
              <Link
                href="/secretary/settings?tab=notifications"
                onClick={() => setOpen(false)}
                className="text-[12px] font-medium text-primary hover:underline inline-block"
              >
                Notification preferences
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
