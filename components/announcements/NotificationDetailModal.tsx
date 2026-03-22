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
import { format } from 'date-fns';
import type { MockNotificationItem } from '@/services/notificationsMock';
import { ExternalLink, User } from 'lucide-react';

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

interface NotificationDetailModalProps {
  item: MockNotificationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (id: string) => void;
}

export function NotificationDetailModal({
  item,
  open,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-left text-[#083344] dark:text-foreground">
              {item.title}
            </DialogTitle>
            {!item.is_read && (
              <Badge variant="default" className="text-[10px]">
                Unread
              </Badge>
            )}
          </div>
          <DialogDescription className="text-left">
            Notification detail (matches backend{' '}
            <code className="rounded bg-muted px-1 text-[10px]">NotificationSerializer</code>)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">{item.message}</p>
          </div>

          <dl className="grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="mt-0.5 font-mono text-[11px] text-foreground break-all">{item.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">priority</dt>
              <dd className="mt-0.5 text-foreground">
                {item.priority}{' '}
                <span className="text-muted-foreground">({labelPriority(item.priority)})</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">category</dt>
              <dd className="mt-0.5 text-foreground">{item.category || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">status</dt>
              <dd className="mt-0.5 text-foreground">
                {item.status}{' '}
                <span className="text-muted-foreground">({labelStatus(item.status)})</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">icon</dt>
              <dd className="mt-0.5 text-foreground">{item.icon || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">is_read / read_at</dt>
              <dd className="mt-0.5 text-foreground">
                {String(item.is_read)}
                {item.read_at && (
                  <span className="block text-muted-foreground">
                    {format(new Date(item.read_at), 'yyyy-MM-dd HH:mm')}
                  </span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">link</dt>
              <dd className="mt-0.5 break-all text-foreground">{item.link || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="mt-0.5 text-foreground">
                {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss')}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">sent_at</dt>
              <dd className="mt-0.5 text-foreground">
                {item.sent_at ? format(new Date(item.sent_at), 'yyyy-MM-dd HH:mm:ss') : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">scheduled_for</dt>
              <dd className="mt-0.5 text-foreground">
                {item.scheduled_for
                  ? format(new Date(item.scheduled_for), 'yyyy-MM-dd HH:mm:ss')
                  : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="flex items-center gap-1 font-medium text-muted-foreground">
                <User className="size-3.5" />
                recipient (mock — API uses user_id / member_id)
              </dt>
              <dd className="mt-0.5 text-foreground">
                {item.recipient_label ?? '—'}
                {item.recipient_type && (
                  <span className="ml-2 text-muted-foreground">({item.recipient_type})</span>
                )}
                {item.recipient_id && (
                  <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
                    {item.recipient_id}
                  </span>
                )}
              </dd>
            </div>
            {item.channels && item.channels.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">channels</dt>
                <dd className="mt-0.5 text-foreground">{item.channels.join(', ')}</dd>
              </div>
            )}
          </dl>
          {(item.audience_mode || item.batch_summary || item.schedule_mode) && (
            <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
              <p className="text-xs font-semibold text-foreground">Wizard / delivery (mock)</p>
              {item.audience_mode && (
                <p>
                  <span className="text-muted-foreground">audience_mode: </span>
                  {item.audience_mode}
                </p>
              )}
              {item.batch_summary && (
                <p>
                  <span className="text-muted-foreground">batch_summary: </span>
                  {item.batch_summary}
                </p>
              )}
              {typeof item.recipient_count_estimate === 'number' && (
                <p>
                  <span className="text-muted-foreground">recipient_count_estimate: </span>~
                  {item.recipient_count_estimate.toLocaleString()}
                </p>
              )}
              {item.schedule_mode && (
                <p>
                  <span className="text-muted-foreground">schedule_mode: </span>
                  {item.schedule_mode}
                </p>
              )}
              {item.recurring_pattern && (
                <p>
                  <span className="text-muted-foreground">recurring_pattern: </span>
                  {item.recurring_pattern}
                </p>
              )}
              {item.recurring_weekdays && item.recurring_weekdays.length > 0 && (
                <p>
                  <span className="text-muted-foreground">recurring_weekdays: </span>
                  {item.recurring_weekdays
                    .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d] ?? d)
                    .join(', ')}
                </p>
              )}
              {typeof item.queue_as_batch_job === 'boolean' && (
                <p>
                  <span className="text-muted-foreground">queue_as_batch_job: </span>
                  {String(item.queue_as_batch_job)}
                </p>
              )}
              {item.email_subject_line && (
                <p>
                  <span className="text-muted-foreground">email_subject_line: </span>
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
            {!item.is_read && (
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
