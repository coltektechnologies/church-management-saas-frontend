'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User } from 'lucide-react';
import { sendNotificationSms } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  memberModalContentClassName,
  memberModalListClassName,
} from '@/components/admin/membership/memberDialogStyles';
import { toast } from 'sonner';

export interface SmsRecipient {
  id: string;
  name: string;
  phone: string;
}

export interface SendSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: SmsRecipient[];
  onSent?: () => void;
}

function usablePhone(phone: string): string | null {
  const t = phone.replace(/\s/g, '').trim();
  if (!t || t === '—') {
    return null;
  }
  return t;
}

export function SendSmsDialog({ open, onOpenChange, recipients, onSent }: SendSmsDialogProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setMessage('');
    }
  }, [open]);

  const resolved = recipients.map((r) => ({
    ...r,
    dial: usablePhone(r.phone),
  }));
  const withPhone = resolved.filter((r) => r.dial);

  const handleSend = async () => {
    const body = message.trim();
    if (!body) {
      toast.error('Enter a message');
      return;
    }
    if (withPhone.length === 0) {
      toast.error('No valid phone numbers', {
        description: 'Selected members need a primary phone on file.',
      });
      return;
    }

    setSending(true);
    let ok = 0;
    let failed = 0;
    let lastError = '';

    for (const r of withPhone) {
      try {
        await sendNotificationSms({
          phone_number: r.dial!,
          message: body,
          member_id: r.id,
        });
        ok += 1;
      } catch (e) {
        failed += 1;
        lastError = e instanceof Error ? e.message : 'Error';
      }
    }

    setSending(false);

    const skippedNoPhone = recipients.length - withPhone.length;
    if (ok > 0) {
      const parts: string[] = [];
      if (failed > 0) {
        parts.push(`${failed} failed${lastError ? `: ${lastError}` : ''}`);
      }
      if (skippedNoPhone > 0) {
        parts.push(`${skippedNoPhone} skipped (no phone)`);
      }
      toast.success(ok === 1 ? 'SMS sent' : `${ok} SMS messages sent`, {
        description: parts.length ? parts.join(' · ') : undefined,
      });
      onOpenChange(false);
      onSent?.();
    } else {
      toast.error('Could not send SMS', { description: lastError || 'Try again.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-lg max-h-[min(90dvh,680px)] overflow-y-auto',
          memberModalContentClassName
        )}
      >
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15">
            <MessageCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <DialogTitle className="text-slate-900 dark:text-slate-50">Send SMS</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Message each selected member using your church SMS integration (mNotify / gateway).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-800 dark:text-slate-200">
              Recipients ({recipients.length})
            </Label>
            <div
              className={cn(
                'mt-2 max-h-36 divide-y overflow-y-auto rounded-lg',
                memberModalListClassName
              )}
            >
              {recipients.length === 0 ? (
                <p className="p-3 text-sm text-slate-500 dark:text-slate-400">
                  No members selected.
                </p>
              ) : (
                recipients.map((r) => {
                  const dial = usablePhone(r.phone);
                  return (
                    <div key={r.id} className="flex items-start gap-2 px-3 py-2 text-sm">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900 dark:text-slate-50">
                          {r.name}
                        </p>
                        <p
                          className={
                            dial
                              ? 'text-slate-600 dark:text-slate-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {dial || 'No phone on file'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sms-body" className="text-slate-800 dark:text-slate-200">
              Message
            </Label>
            <Textarea
              id="sms-body"
              className="mt-2 min-h-[120px] border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
              placeholder="Type your SMS..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={640}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{message.length}/640</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#0B2A4A] text-white hover:bg-[#0B2A4A]/90 dark:bg-teal-600 dark:hover:bg-teal-600/90"
            onClick={() => void handleSend()}
            disabled={sending || recipients.length === 0}
          >
            {sending ? 'Sending...' : `Send${withPhone.length ? ` (${withPhone.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
