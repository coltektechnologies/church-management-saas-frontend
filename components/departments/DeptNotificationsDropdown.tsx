'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: '1', text: 'New member added to the department', time: '5 min ago', read: false },
  {
    id: '2',
    text: 'Expense request submitted: GHS 600 for microphones',
    time: '30 min ago',
    read: false,
  },
  {
    id: '3',
    text: 'Announcement approved: Choir Practice Cancelled',
    time: '2 hrs ago',
    read: false,
  },
  { id: '4', text: 'Monthly report is ready for review', time: 'Yesterday', read: true },
];

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

export default function DeptNotificationsDropdown({
  iconColor = '#0B2A4A',
  hoverBg = 'rgba(0,0,0,0.06)',
  badgeBg = '#2FC4B2',
}: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifs] = useState(INITIAL);

  const unread = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

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
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors',
                    !n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                  )}
                  onClick={() =>
                    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                  }
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
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border text-center">
              <button
                onClick={() => setOpen(false)}
                className="text-[12px] font-medium text-primary hover:underline"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
