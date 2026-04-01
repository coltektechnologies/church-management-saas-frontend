'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import type { MockNotificationItem } from '@/services/notificationsMock';
import { CalendarClock, ExternalLink, Link2, UserRound } from 'lucide-react';

function labelPriority(p: MockNotificationItem['priority']) {
  const map: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return map[p] ?? p;
}

function labelStatus(s: MockNotificationItem['status']) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    SENT: 'Sent',
    READ: 'Read',
    FAILED: 'Failed',
  };
  return map[s] ?? s;
}

function labelCategory(c: MockNotificationItem['category']) {
  if (!c) {
    return 'General';
  }
  return c
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function recipientKindLabel(t: MockNotificationItem['recipient_type']) {
  if (!t) {
    return null;
  }
  const map: Record<string, string> = {
    user: 'Staff user',
    member: 'Member',
    visitor: 'Visitor',
  };
  return map[t] ?? t;
}

interface NotificationDetailModalProps {
  item: MockNotificationItem | null;
  open: boolean;
  /** Outgoing / “Sent” list — hide read actions */
  isSentView?: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (id: string) => void;
}

export function NotificationDetailModal({
  item,
  open,
  isSentView = false,
  onOpenChange,
  onMarkRead,
}: NotificationDetailModalProps) {
  if (!item) {
    return null;
  }

  const openLink = () => {
    if (!item.link) {
      return;
    }
    if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    } else {
      const path = item.link.startsWith('/') ? item.link : `/${item.link}`;
      window.location.href = path;
    }
  };

  const whenSent = item.sent_at ?? item.created_at;
  const recipientKind = recipientKindLabel(item.recipient_type);
  const showWizardMeta = Boolean(item.audience_mode || item.batch_summary || item.schedule_mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-left text-lg text-[#083344] dark:text-foreground">
              {item.title}
            </DialogTitle>
            {!isSentView && !item.is_read && (
              <Badge variant="default" className="text-[10px]">
                Unread
              </Badge>
            )}
            {isSentView && (
              <Badge variant="secondary" className="text-[10px]">
                You sent this
              </Badge>
            )}
          </div>
          <DialogDescription className="text-left text-sm text-muted-foreground">
            {labelCategory(item.category)}
            <span className="text-border"> · </span>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1 text-sm">
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">{item.message}</p>
          </div>

          <div className="space-y-3 rounded-xl border border-border/80 bg-card px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Details
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Priority</span>
                <span className="text-right font-medium text-foreground">
                  {labelPriority(item.priority)}
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Type</span>
                <span className="text-right font-medium text-foreground">
                  {labelCategory(item.category)}
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Delivery status</span>
                <span className="text-right font-medium text-foreground">
                  {labelStatus(item.status)}
                </span>
              </li>
              {!isSentView && (
                <li className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">In your inbox</span>
                  <span className="text-right font-medium text-foreground">
                    {item.is_read
                      ? item.read_at
                        ? `Read ${format(new Date(item.read_at), 'MMM d, yyyy · h:mm a')}`
                        : 'Read'
                      : 'Not read yet'}
                  </span>
                </li>
              )}
              <li className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Sent</span>
                <span className="text-right text-foreground">
                  {format(new Date(whenSent), 'MMM d, yyyy · h:mm a')}
                </span>
              </li>
              {item.scheduled_for && (
                <li className="flex items-start justify-between gap-4">
                  <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <CalendarClock className="size-3.5 opacity-70" aria-hidden />
                    Scheduled for
                  </span>
                  <span className="text-right text-foreground">
                    {format(new Date(item.scheduled_for), 'MMM d, yyyy · h:mm a')}
                  </span>
                </li>
              )}
              {item.icon && (
                <li className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Icon</span>
                  <span className="text-right capitalize text-foreground">{item.icon}</span>
                </li>
              )}
              {item.link && (
                <li className="flex items-start justify-between gap-4">
                  <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <Link2 className="size-3.5 opacity-70" aria-hidden />
                    Link
                  </span>
                  <span className="max-w-[65%] break-all text-right text-primary">{item.link}</span>
                </li>
              )}
              {(item.recipient_label || recipientKind) && (
                <li className="flex items-start justify-between gap-4">
                  <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <UserRound className="size-3.5 opacity-70" aria-hidden />
                    Recipient
                  </span>
                  <span className="text-right text-foreground">
                    {item.recipient_label ?? '—'}
                    {recipientKind && !item.recipient_label && (
                      <span className="text-muted-foreground"> ({recipientKind})</span>
                    )}
                    {recipientKind && item.recipient_label && (
                      <span className="block text-xs text-muted-foreground">{recipientKind}</span>
                    )}
                  </span>
                </li>
              )}
              {item.channels && item.channels.length > 0 && (
                <li className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Channels</span>
                  <span className="text-right text-foreground">
                    {item.channels.map((c) => c.replace('_', ' ')).join(', ')}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {showWizardMeta && (
            <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-3 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How it was sent
              </h3>
              {item.audience_mode && (
                <p>
                  <span className="text-muted-foreground">Audience: </span>
                  {item.audience_mode === 'batch' ? 'Group / batch' : 'Single recipient'}
                </p>
              )}
              {item.batch_summary && (
                <p>
                  <span className="text-muted-foreground">Summary: </span>
                  {item.batch_summary}
                </p>
              )}
              {typeof item.recipient_count_estimate === 'number' && (
                <p>
                  <span className="text-muted-foreground">About </span>
                  {item.recipient_count_estimate.toLocaleString()} recipients
                </p>
              )}
              {item.schedule_mode && (
                <p>
                  <span className="text-muted-foreground">Timing: </span>
                  {item.schedule_mode === 'instant'
                    ? 'Sent immediately'
                    : item.schedule_mode === 'one_time'
                      ? 'One-time schedule'
                      : item.schedule_mode === 'recurring'
                        ? 'Recurring'
                        : item.schedule_mode}
                </p>
              )}
              {item.recurring_pattern && (
                <p>
                  <span className="text-muted-foreground">Repeats: </span>
                  {item.recurring_pattern}
                </p>
              )}
              {item.recurring_weekdays && item.recurring_weekdays.length > 0 && (
                <p>
                  <span className="text-muted-foreground">On: </span>
                  {item.recurring_weekdays
                    .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d] ?? d)
                    .join(', ')}
                </p>
              )}
              {typeof item.queue_as_batch_job === 'boolean' && (
                <p className="text-muted-foreground">
                  {item.queue_as_batch_job ? 'Queued as a background job' : 'Processed immediately'}
                </p>
              )}
              {item.email_subject_line && (
                <p>
                  <span className="text-muted-foreground">Email subject: </span>
                  {item.email_subject_line}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {item.link && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={openLink}
              >
                <ExternalLink className="size-3.5" />
                Open link
              </Button>
            )}
            {!isSentView && !item.is_read && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onMarkRead(item.id);
                  onOpenChange(false);
                }}
              >
                Mark as read
              </Button>
            )}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
