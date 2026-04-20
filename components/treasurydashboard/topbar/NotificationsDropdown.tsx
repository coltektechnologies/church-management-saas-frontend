'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { isMockNotificationsEnabled } from '@/lib/featureFlags';
import {
  fetchNotificationsList,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  fetchUnreadNotificationCountApi,
  type NotificationApiRow,
} from '@/lib/notificationsApi';

interface MockRow {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

const MOCK_INITIAL: MockRow[] = [
  {
    id: '1',
    text: 'Tithe collection of GHS 12,500 pending approval',
    time: '2 min ago',
    read: false,
  },
  { id: '2', text: 'Expense request submitted: Electricity Bill', time: '15 min ago', read: false },
  { id: '3', text: 'Monthly financial report ready for review', time: '1 hr ago', read: false },
  {
    id: '4',
    text: 'Budget variance alert: Utilities exceeded by 8%',
    time: 'Yesterday',
    read: true,
  },
];

function formatNotifTime(row: NotificationApiRow): string {
  if (row.time_ago?.trim()) {
    return row.time_ago.trim();
  }
  try {
    return formatDistanceToNow(new Date(row.created_at), { addSuffix: true });
  } catch {
    return '';
  }
}

function notificationBody(row: NotificationApiRow): string {
  const title = row.title?.trim();
  const msg = row.message?.trim();
  if (title && msg && title !== msg) {
    return `${title}: ${msg}`;
  }
  return title || msg || 'Notification';
}

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
  const mockMode = isMockNotificationsEnabled();

  const [open, setOpen] = useState(false);
  const [mockRows, setMockRows] = useState<MockRow[]>(MOCK_INITIAL);

  const [rows, setRows] = useState<NotificationApiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [unreadBadge, setUnreadBadge] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (mockMode) {
      return;
    }
    try {
      const { unread_count } = await fetchUnreadNotificationCountApi();
      setUnreadBadge(typeof unread_count === 'number' ? unread_count : 0);
    } catch {
      setUnreadBadge(0);
    }
  }, [mockMode]);

  const loadInbox = useCallback(async () => {
    if (mockMode) {
      return;
    }
    setLoading(true);
    setListError(null);
    try {
      const list = await fetchNotificationsList({ page_size: 40 });
      setRows(list);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Could not load notifications');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [mockMode]);

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (open && !mockMode) {
      void loadInbox();
      void refreshUnreadCount();
    }
  }, [open, mockMode, loadInbox, refreshUnreadCount]);

  const unreadLive = mockMode
    ? mockRows.filter((n) => !n.read).length
    : rows.filter((r) => !r.is_read).length;

  const badgeCount = mockMode ? unreadLive : unreadBadge;

  const markAllRead = async () => {
    if (mockMode) {
      setMockRows((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }
    try {
      await markAllNotificationsReadApi();
      setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
      await refreshUnreadCount();
    } catch {
      setListError('Could not mark all as read');
    }
  };

  const markOneReadMock = (id: string) => {
    setMockRows((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  const markOneReadApi = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)));
      await refreshUnreadCount();
    } catch {
      // still refresh to stay in sync
      await refreshUnreadCount();
    }
  };

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

  const showBadge = badgeCount > 0;
  const badgeLabel = badgeCount > 99 ? '99+' : String(badgeCount);

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
        {showBadge && (
          <span
            className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center leading-none"
            style={{ backgroundColor: badgeBg, color: autoText(badgeBg) }}
          >
            {badgeLabel}
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
                {unreadLive > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {unreadLive} unread
                  </span>
                )}
              </div>
              {unreadLive > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {mockMode ? (
                mockRows.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors',
                      !n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                    )}
                    onClick={() => markOneReadMock(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        markOneReadMock(n.id);
                      }
                    }}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {!n.read ? (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{n.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading…
                </div>
              ) : listError ? (
                <p className="px-4 py-6 text-sm text-red-600 dark:text-red-400">{listError}</p>
              ) : rows.length === 0 ? (
                <p className="px-4 py-8 text-sm text-center text-muted-foreground">
                  No notifications yet. Alerts for approvals and treasury activity will appear here.
                </p>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors',
                      !row.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                    )}
                    onClick={() => void markOneReadApi(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        void markOneReadApi(row.id);
                      }
                    }}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {!row.is_read ? (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {notificationBody(row)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatNotifTime(row)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-border text-center">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[12px] font-medium text-primary hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
