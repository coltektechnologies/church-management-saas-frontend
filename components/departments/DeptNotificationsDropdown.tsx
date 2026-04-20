'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { MockNotificationItem } from '@/services/notificationsMock';
import { notificationsApiEnabled } from '@/services/notificationsService';
import {
  NOTIFICATIONS_LIST_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_KEY,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsListQuery,
  useUnreadNotificationCountQuery,
} from '@/hooks/useNotificationsInbox';
import { normalizeNotificationLinkForSpa } from '@/lib/notificationLinks';

interface Props {
  iconColor?: string;
  hoverBg?: string;
  badgeBg?: string;
}

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

function previewLine(item: MockNotificationItem): string {
  const msg = item.message?.trim();
  const title = item.title?.trim() || 'Notification';
  if (!msg || msg === title) {
    return title;
  }
  return `${title}: ${msg}`;
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

const LIST_LIMIT = 8;

export default function DeptNotificationsDropdown({
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
  /** Top bar shows unread only; read items drop out once opened (matches “clear from box”). */
  const unreadItems = useMemo(() => items.filter((n) => !n.is_read), [items]);
  const visibleItems = useMemo(() => unreadItems.slice(0, LIST_LIMIT), [unreadItems]);

  const unreadBadge = apiEnabled ? (unreadQuery.data ?? 0) : 0;

  /** Refresh list when opening the dropdown */
  useEffect(() => {
    if (!open || !apiEnabled) {
      return;
    }
    void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY });
  }, [open, apiEnabled, queryClient]);

  const handleRowClick = (item: MockNotificationItem) => {
    if (apiEnabled && !item.is_read) {
      markOne.mutate(item.id);
    }
    const rawLink = item.link?.trim();
    if (rawLink) {
      const href = normalizeNotificationLinkForSpa(rawLink);
      if (href.startsWith('http')) {
        try {
          const u = new URL(href);
          if (typeof window !== 'undefined' && u.origin === window.location.origin) {
            router.push(`${u.pathname}${u.search}${u.hash}`);
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

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!apiEnabled || unreadBadge <= 0) {
      return;
    }
    markAll.mutate();
  };

  const loading = apiEnabled && inboxQuery.isLoading;
  const failed = apiEnabled && inboxQuery.isError;

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
        {unreadBadge > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center leading-none"
            style={{ backgroundColor: badgeBg, color: autoText(badgeBg) }}
          >
            {unreadBadge > 99 ? '99+' : unreadBadge}
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
                {apiEnabled && unreadBadge > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {unreadBadge} unread
                  </span>
                )}
              </div>
              {apiEnabled && unreadBadge > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markAll.isPending}
                  className="text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {markAll.isPending ? 'Updating…' : 'Mark all read'}
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {!apiEnabled && (
                <p className="text-xs text-muted-foreground px-4 py-6 text-center leading-relaxed">
                  Sign in with notifications enabled (disable mock mode in env) to load your inbox
                  here.
                </p>
              )}
              {apiEnabled && loading && (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                  Loading…
                </div>
              )}
              {apiEnabled && failed && (
                <p className="text-xs text-destructive px-4 py-6 text-center">
                  Could not load notifications.
                </p>
              )}
              {apiEnabled &&
                !loading &&
                !failed &&
                visibleItems.length === 0 &&
                items.length > 0 && (
                  <p className="text-xs text-muted-foreground px-4 py-8 text-center">
                    You&apos;re all caught up — no unread notifications.
                  </p>
                )}
              {apiEnabled && !loading && !failed && items.length === 0 && (
                <p className="text-xs text-muted-foreground px-4 py-8 text-center">
                  No notifications yet.
                </p>
              )}
              {apiEnabled &&
                !loading &&
                !failed &&
                visibleItems.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(n);
                      }
                    }}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors',
                      !n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                    )}
                    onClick={() => handleRowClick(n)}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {!n.is_read ? (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/25" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{previewLine(n)}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border text-center">
              <Link
                href="/departments/settings?tab=notifications"
                className="text-[12px] font-medium text-primary hover:underline inline-block"
                onClick={() => setOpen(false)}
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
