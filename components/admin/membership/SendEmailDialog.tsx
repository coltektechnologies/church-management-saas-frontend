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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User } from 'lucide-react';
import { sendNotificationEmail } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  memberModalContentClassName,
  memberModalListClassName,
} from '@/components/admin/membership/memberDialogStyles';
import { toast } from 'sonner';

export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
}

export interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: EmailRecipient[];
  onSent?: () => void;
}

function usableEmail(email: string): string | null {
  const t = email.trim();
  if (!t || t === '—') {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
    return null;
  }
  return t;
}

function plainTextToHtml(text: string): string {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const withBreaks = esc.replace(/\r\n/g, '\n').split('\n').join('<br/>');
  return `<div style="font-family:system-ui,sans-serif;line-height:1.5">${withBreaks}</div>`;
}

export function SendEmailDialog({ open, onOpenChange, recipients, onSent }: SendEmailDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject('');
      setBody('');
    }
  }, [open]);

  const resolved = recipients.map((r) => ({
    ...r,
    addr: usableEmail(r.email),
  }));
  const withEmail = resolved.filter((r) => r.addr);
  const withoutEmail = resolved.filter((r) => !r.addr);

  const handleSend = async () => {
    const sub = subject.trim();
    const text = body.trim();
    if (!sub) {
      toast.error('Enter a subject');
      return;
    }
    if (!text) {
      toast.error('Enter a message');
      return;
    }
    if (withEmail.length === 0) {
      toast.error('No valid email addresses', {
        description: 'Selected members need an email on file.',
      });
      return;
    }

    const messageHtml = plainTextToHtml(text);
    setSending(true);
    let ok = 0;
    let failed = 0;
    let lastError = '';

    for (const r of withEmail) {
      try {
        await sendNotificationEmail({
          email_address: r.addr!,
          subject: sub,
          message_html: messageHtml,
          member_id: r.id,
        });
        ok += 1;
      } catch (e) {
        failed += 1;
        lastError = e instanceof Error ? e.message : 'Error';
      }
    }

    setSending(false);

    if (ok > 0) {
      const parts: string[] = [];
      if (failed > 0) {
        parts.push(`${failed} failed${lastError ? `: ${lastError}` : ''}`);
      }
      if (withoutEmail.length > 0) {
        parts.push(`${withoutEmail.length} skipped (no email)`);
      }
      toast.success(ok === 1 ? 'Email sent' : `${ok} emails sent`, {
        description: parts.length ? parts.join(' · ') : undefined,
      });
      onOpenChange(false);
      onSent?.();
    } else {
      toast.error('Could not send email', { description: lastError || 'Try again.' });
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
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2A4A]/10">
            <Mail className="h-5 w-5 text-[#0B2A4A] dark:text-teal-400" />
          </div>
          <DialogTitle className="text-slate-900 dark:text-slate-50">Send email</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Sends through your church email configuration. Each recipient gets their own message.
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
                  const addr = usableEmail(r.email);
                  return (
                    <div key={r.id} className="flex items-start gap-2 px-3 py-2 text-sm">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900 dark:text-slate-50">
                          {r.name}
                        </p>
                        <p
                          className={
                            addr
                              ? 'truncate text-slate-600 dark:text-slate-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {addr || 'No email on file'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email-subject" className="text-slate-800 dark:text-slate-200">
              Subject
            </Label>
            <Input
              id="email-subject"
              className="mt-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
              placeholder="e.g. Weekly bulletin"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="email-body" className="text-slate-800 dark:text-slate-200">
              Message
            </Label>
            <Textarea
              id="email-body"
              className="mt-2 min-h-[140px] border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
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
            {sending ? 'Sending...' : `Send${withEmail.length ? ` (${withEmail.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
