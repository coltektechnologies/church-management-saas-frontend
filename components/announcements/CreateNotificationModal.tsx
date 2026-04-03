'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '@/lib/notificationWizardOptions';
import type {
  MockNotificationItem,
  NotificationCategory,
  NotificationPriority,
  DeliveryChannel,
} from '@/services/notificationsMock';
import { toast } from 'sonner';
import type { DepartmentListRow } from '@/lib/departmentsApi';
import { fetchDepartmentsList } from '@/lib/departmentsApi';
import { fetchAccountUsers } from '@/lib/notificationsApi';
import {
  getAccessToken,
  getMember,
  getMembers,
  getVisitors,
  sendNotificationEmail,
  sendNotificationSms,
  type MemberListItem,
} from '@/lib/api';
import {
  createNotificationFromWizard,
  notificationsApiEnabled,
  sendBulkFromWizard,
} from '@/services/notificationsService';
import {
  Bell,
  CalendarClock,
  Layers,
  Loader2,
  Mail,
  Send,
  Smartphone,
  Users,
  User,
  UserPlus,
  Building2,
} from 'lucide-react';

interface CreateNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass `null` when the row was persisted via API (parent should refetch). */
  onCreated: (item: MockNotificationItem | null) => void;
}

const STEPS = [1, 2, 3, 4] as const;
const STEP_LABELS = ['Content', 'Audience', 'Delivery & schedule', 'Review'];

/** 0 = Sunday … 6 = Saturday (same as JavaScript Date.getDay()) */
const WEEKDAYS: { day: number; short: string }[] = [
  { day: 0, short: 'Sun' },
  { day: 1, short: 'Mon' },
  { day: 2, short: 'Tue' },
  { day: 3, short: 'Wed' },
  { day: 4, short: 'Thu' },
  { day: 5, short: 'Fri' },
  { day: 6, short: 'Sat' },
];

type ScheduleMode = 'instant' | 'one_time' | 'recurring';

const defaultForm = () => ({
  step: 1,
  category: 'GENERAL' as NotificationCategory,
  priority: 'MEDIUM' as NotificationPriority,
  title: '',
  message: '',
  link: '',
  icon: 'none',
  audienceMode: 'single' as 'single' | 'batch',
  recipientType: 'user' as 'user' | 'member' | 'visitor',
  userId: '',
  memberId: '',
  visitorId: '',
  /** Batch: only `all_members` is supported with the live send-bulk API (exclusive with departments). */
  batchSegmentIds: [] as string[],
  batchDepartmentIds: [] as string[],
  channelInApp: true,
  channelEmail: false,
  channelSms: false,
  emailSubject: '',
  scheduleMode: 'instant' as ScheduleMode,
  scheduledLocal: '',
  recurringPattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
  /** Selected weekdays for weekly/custom recurring (0=Sun … 6=Sat) */
  recurringWeekdays: [] as number[],
  recurringTime: '09:00',
  queueBatchJob: false,
  respectQuietHours: true,
});

export function CreateNotificationModal({
  open,
  onOpenChange,
  onCreated,
}: CreateNotificationModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [departmentPickerOpen, setDepartmentPickerOpen] = useState(false);
  const [apiDepartments, setApiDepartments] = useState<DepartmentListRow[] | null>(null);
  const [apiUsers, setApiUsers] = useState<
    { id: string; label: string; email?: string; phone?: string }[] | null
  >(null);
  const [apiMembers, setApiMembers] = useState<{ id: string; label: string }[] | null>(null);
  const [apiVisitors, setApiVisitors] = useState<{ id: string; label: string }[] | null>(null);
  /** `null` = still loading for this modal open; then arrays (possibly empty) from API */
  const [audienceReady, setAudienceReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setForm(defaultForm());
  }, []);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAudienceReady(false);
      setApiDepartments(null);
      setApiUsers(null);
      setApiMembers(null);
      setApiVisitors(null);
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setAudienceReady(true);
      setApiDepartments([]);
      setApiUsers([]);
      setApiMembers([]);
      setApiVisitors([]);
      return;
    }
    let cancelled = false;
    setAudienceReady(false);
    (async () => {
      try {
        const [deptR, userR, memR, visR] = await Promise.allSettled([
          fetchDepartmentsList(),
          fetchAccountUsers(),
          getMembers(),
          getVisitors(),
        ]);
        if (cancelled) {
          return;
        }

        const loadFailures: string[] = [];
        const depts =
          deptR.status === 'fulfilled' ? deptR.value : (loadFailures.push('departments'), []);
        const users =
          userR.status === 'fulfilled' ? userR.value : (loadFailures.push('staff users'), []);
        const membersRaw =
          memR.status === 'fulfilled' ? memR.value : (loadFailures.push('members'), []);
        const visitorsRaw =
          visR.status === 'fulfilled' ? visR.value : (loadFailures.push('visitors'), []);

        if (loadFailures.length > 0) {
          toast.error(`Could not load ${loadFailures.join(', ')} from the API.`);
        }

        setApiDepartments(depts);
        const userRows = users.map((u) => {
          const name =
            [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
            (u.full_name && String(u.full_name).trim()) ||
            'User';
          const email = u.email?.trim() || undefined;
          const phone = u.phone?.trim() || undefined;
          return {
            id: u.id,
            label: `${name}${email ? ` — ${email}` : ''}`,
            email,
            phone,
          };
        });
        setApiUsers(userRows);

        const memberRows = membersRaw.map((m: MemberListItem) => {
          const name =
            m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || 'Member';
          const email = m.location?.email;
          return {
            id: m.id,
            label: email && String(email).trim() ? `${name} — ${email}` : name,
          };
        });
        setApiMembers(memberRows);

        const visitorRows = visitorsRaw.map((v) => {
          const bits = [v.full_name, v.phone].filter(Boolean);
          if (v.email && String(v.email).trim()) {
            bits.push(String(v.email));
          }
          return { id: v.id, label: bits.join(' — ') };
        });
        setApiVisitors(visitorRows);

        setForm((f) => ({
          ...f,
          userId: users.some((u) => u.id === f.userId) ? f.userId : (users[0]?.id ?? ''),
          memberId: memberRows.some((r) => r.id === f.memberId)
            ? f.memberId
            : (memberRows[0]?.id ?? ''),
          visitorId: visitorRows.some((r) => r.id === f.visitorId)
            ? f.visitorId
            : (visitorRows[0]?.id ?? ''),
        }));
      } catch {
        if (!cancelled) {
          toast.error('Could not load audience data from the API.');
          setApiDepartments([]);
          setApiUsers([]);
          setApiMembers([]);
          setApiVisitors([]);
        }
      } finally {
        if (!cancelled) {
          setAudienceReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const departmentOptions = useMemo(() => {
    if (!apiDepartments?.length) {
      return [] as { id: string; name: string; memberCount: number }[];
    }
    return apiDepartments.map((d) => ({
      id: d.id,
      name: d.name,
      memberCount: d.member_count ?? 0,
    }));
  }, [apiDepartments]);

  const userOptions = useMemo(() => (apiUsers === null ? [] : apiUsers), [apiUsers]);

  const memberOptions = useMemo(() => (apiMembers === null ? [] : apiMembers), [apiMembers]);

  const visitorOptions = useMemo(() => (apiVisitors === null ? [] : apiVisitors), [apiVisitors]);

  /** Batch “segments” backed by send-bulk: all members (count from members API) only; departments are separate. */
  const batchSegments = useMemo(() => {
    const n = apiMembers === null ? 0 : apiMembers.length;
    return [
      {
        id: 'all_members',
        label: 'All church members',
        count: n,
        description:
          'Active members from GET /members/members/. Use departments below only if you want a subset — not both at once.',
      },
    ];
  }, [apiMembers]);

  const update = useCallback(
    <K extends keyof ReturnType<typeof defaultForm>>(
      key: K,
      value: ReturnType<typeof defaultForm>[K]
    ) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    []
  );

  const channelsList = useMemo((): DeliveryChannel[] => {
    const c: DeliveryChannel[] = [];
    if (form.channelInApp) {
      c.push('IN_APP');
    }
    if (form.channelEmail) {
      c.push('EMAIL');
    }
    if (form.channelSms) {
      c.push('SMS');
    }
    return c;
  }, [form.channelInApp, form.channelEmail, form.channelSms]);

  const batchSummary = useMemo(() => {
    if (form.audienceMode !== 'batch') {
      return null as null | { labels: string; est: number };
    }
    const segParts = batchSegments.filter((s) => form.batchSegmentIds.includes(s.id));
    const deptParts = departmentOptions.filter((d) => form.batchDepartmentIds.includes(d.id));
    if (segParts.length === 0 && deptParts.length === 0) {
      return null;
    }
    const segLabels = segParts.map((p) => p.label);
    const deptLabels = deptParts.map((d) => `${d.name} (~${d.memberCount})`);
    const labels = [...segLabels, ...deptLabels].join(' · ');
    const est =
      segParts.reduce((sum, p) => sum + p.count, 0) +
      deptParts.reduce((sum, d) => sum + d.memberCount, 0);
    return { labels, est };
  }, [
    form.audienceMode,
    form.batchSegmentIds,
    form.batchDepartmentIds,
    departmentOptions,
    batchSegments,
  ]);

  const validateStep = (s: number): string => {
    if (s === 1) {
      if (!form.title.trim()) {
        return 'Please enter a title.';
      }
      if (!form.message.trim()) {
        return 'Please enter a message.';
      }
    }
    if (s === 2) {
      if (!audienceReady) {
        return 'Loading audience data from the API…';
      }
      if (form.audienceMode === 'single') {
        if (form.recipientType === 'user' && !form.userId) {
          return 'Select a user.';
        }
        if (form.recipientType === 'user' && userOptions.length === 0) {
          return 'No staff users returned from GET /auth/users/.';
        }
        if (form.recipientType === 'member' && !form.memberId) {
          return 'Select a member.';
        }
        if (form.recipientType === 'member' && memberOptions.length === 0) {
          return 'No members found for your church.';
        }
        if (form.recipientType === 'visitor' && !form.visitorId) {
          return 'Select a visitor.';
        }
        if (form.recipientType === 'visitor' && visitorOptions.length === 0) {
          return 'No visitors found for your church.';
        }
      } else {
        if (form.batchSegmentIds.includes('all_members') && form.batchDepartmentIds.length > 0) {
          return 'Choose either all members or specific departments — not both (send-bulk API).';
        }
        if (form.batchSegmentIds.length === 0 && form.batchDepartmentIds.length === 0) {
          return 'Select “All church members” and/or one or more departments.';
        }
      }
    }
    if (s === 3) {
      if (!form.channelInApp && !form.channelEmail && !form.channelSms) {
        return 'Enable at least one channel (In-app, Email, or SMS).';
      }
      if (form.scheduleMode === 'one_time' && !form.scheduledLocal) {
        return 'Pick a date and time for scheduled send.';
      }
      if (form.channelEmail && !form.emailSubject.trim()) {
        return 'Add an email subject (used for batch email).';
      }
      if (form.scheduleMode === 'recurring' && form.recurringPattern === 'weekly') {
        if (form.recurringWeekdays.length === 0) {
          return 'Pick at least one day of the week for your recurring reminder.';
        }
      }
    }
    return '';
  };

  const goNext = () => {
    const err = validateStep(form.step);
    if (err) {
      toast.error(err);
      return;
    }
    if (form.step < 4) {
      setForm((f) => ({ ...f, step: f.step + 1 }));
    }
  };

  const goBack = () => {
    if (form.step > 1) {
      setForm((f) => ({ ...f, step: f.step - 1 }));
    }
  };

  const buildScheduledIso = (): { scheduled: string | null; summary: string } => {
    if (form.scheduleMode === 'instant') {
      return { scheduled: null, summary: 'Send immediately' };
    }
    if (form.scheduleMode === 'one_time' && form.scheduledLocal) {
      const iso = new Date(form.scheduledLocal).toISOString();
      return { scheduled: iso, summary: `One-time · ${form.scheduledLocal.replace('T', ' ')}` };
    }
    if (form.scheduleMode === 'recurring') {
      const t = form.recurringTime;
      let summary = '';
      if (form.recurringPattern === 'daily') {
        summary = `Every day @ ${t}`;
      } else if (form.recurringPattern === 'weekly') {
        const dayLabels = [...form.recurringWeekdays]
          .sort((a, b) => a - b)
          .map((d) => WEEKDAYS.find((w) => w.day === d)?.short ?? String(d))
          .join(', ');
        summary = dayLabels ? `${dayLabels} @ ${t}` : `Weekly @ ${t}`;
      } else {
        summary = `Monthly @ ${t} (same calendar day each month)`;
      }
      const next = new Date();
      next.setHours(parseInt(form.recurringTime.split(':')[0] ?? '9', 10));
      next.setMinutes(parseInt(form.recurringTime.split(':')[1] ?? '0', 10));
      if (next < new Date()) {
        next.setDate(next.getDate() + 1);
      }
      return { scheduled: next.toISOString(), summary: `Recurring: ${summary}` };
    }
    return { scheduled: null, summary: 'Send immediately' };
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    const err = validateStep(1) || validateStep(2) || validateStep(3);
    if (err) {
      toast.error(err);
      return;
    }

    const { scheduled, summary: scheduleSummary } = buildScheduledIso();

    if (notificationsApiEnabled()) {
      if (form.scheduleMode === 'recurring') {
        toast.error(
          'Recurring sends are not wired in this wizard yet. Use one-time or instant, or POST /notifications/recurring-schedules/.'
        );
        return;
      }
      if (form.audienceMode === 'single' && form.recipientType === 'visitor') {
        toast.error(
          'In-app POST /notifications/ supports user or member only — pick a staff user or member, or use SMS/email flows for visitors.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        if (form.audienceMode === 'single') {
          const title = form.title.trim();
          const body = form.message.trim();
          const emailSubject = form.emailSubject.trim() || title;
          const htmlBody = `<p>${body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;

          let sentSomething = false;

          if (form.channelInApp) {
            await createNotificationFromWizard({
              user_id: form.recipientType === 'user' ? form.userId : undefined,
              member_id: form.recipientType === 'member' ? form.memberId : undefined,
              title,
              message: body,
              priority: form.priority,
              category: form.category,
              link: form.link.trim() || null,
              icon: form.icon === 'none' ? null : form.icon,
              scheduled_for: scheduled,
            });
            sentSomething = true;
          }

          if (form.recipientType === 'member' && (form.channelSms || form.channelEmail)) {
            const detail = await getMember(form.memberId);
            const phone = detail?.location?.phone_primary?.trim();
            const email = detail?.location?.email?.trim();
            if (form.channelSms) {
              if (!phone) {
                toast.error('This member has no primary phone on file; cannot send SMS.');
              } else {
                await sendNotificationSms({
                  phone_number: phone,
                  message: body,
                  member_id: form.memberId,
                });
                sentSomething = true;
              }
            }
            if (form.channelEmail) {
              if (!email) {
                toast.error('This member has no email on file; cannot send email.');
              } else {
                await sendNotificationEmail({
                  email_address: email,
                  subject: emailSubject,
                  message_html: htmlBody,
                  member_id: form.memberId,
                });
                sentSomething = true;
              }
            }
          }

          if (form.recipientType === 'user' && (form.channelSms || form.channelEmail)) {
            const u = userOptions.find((row) => row.id === form.userId);
            if (form.channelSms) {
              const phone = u?.phone?.trim();
              if (!phone) {
                toast.error('This staff user has no phone on file; cannot send SMS.');
              } else {
                await sendNotificationSms({ phone_number: phone, message: body });
                sentSomething = true;
              }
            }
            if (form.channelEmail) {
              const email = u?.email?.trim();
              if (!email) {
                toast.error('This staff user has no email on file; cannot send email.');
              } else {
                await sendNotificationEmail({
                  email_address: email,
                  subject: emailSubject,
                  message_html: htmlBody,
                });
                sentSomething = true;
              }
            }
          }

          if (sentSomething) {
            toast.success(`Notification sent. ${scheduleSummary}`);
          }
        } else {
          const wantsAll = form.batchSegmentIds.includes('all_members');
          const deptIds = [...form.batchDepartmentIds];
          if (wantsAll && deptIds.length > 0) {
            toast.error(
              'Choose either all members or specific departments — not both (one send-bulk request).'
            );
            return;
          }
          if (!wantsAll && deptIds.length === 0) {
            toast.error('Select “All church members” or at least one department.');
            return;
          }
          const target: 'all_members' | 'departments' = wantsAll ? 'all_members' : 'departments';
          await sendBulkFromWizard({
            title: form.title.trim(),
            message: form.message.trim(),
            target,
            department_ids: target === 'departments' ? deptIds : undefined,
            send_sms: form.channelSms,
            send_email: form.channelEmail,
            send_in_app: form.channelInApp,
          });
          toast.success(`Bulk notification queued. ${scheduleSummary}`);
        }
        onCreated(null);
        reset();
        onOpenChange(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Request failed');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();

      let recipient_label = '';
      let recipient_id: string | undefined;
      let recipient_type: 'user' | 'member' | 'visitor' | undefined;

      if (form.audienceMode === 'single') {
        recipient_type = form.recipientType;
        if (form.recipientType === 'user') {
          recipient_id = form.userId;
          recipient_label = userOptions.find((u) => u.id === form.userId)?.label ?? form.userId;
        } else if (form.recipientType === 'member') {
          recipient_id = form.memberId;
          recipient_label =
            memberOptions.find((m) => m.id === form.memberId)?.label ?? form.memberId;
        } else {
          recipient_id = form.visitorId;
          recipient_label =
            visitorOptions.find((v) => v.id === form.visitorId)?.label ?? form.visitorId;
        }
      } else {
        recipient_type = 'user';
        recipient_id = userOptions[0]?.id;
        recipient_label = batchSummary
          ? `Batch: ${batchSummary.labels} (~${batchSummary.est.toLocaleString()} recipients)`
          : 'Batch audience';
      }

      const pending =
        scheduled !== null ||
        (form.audienceMode === 'batch' && form.queueBatchJob) ||
        form.scheduleMode === 'recurring';

      const item: MockNotificationItem = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority,
        category: form.category,
        link: form.link.trim() || null,
        icon: form.icon === 'none' ? null : form.icon,
        status: pending ? 'PENDING' : 'SENT',
        is_read: false,
        read_at: null,
        created_at: now,
        sent_at: pending ? null : now,
        scheduled_for: scheduled,
        recipient_type,
        recipient_id,
        recipient_label,
        channels: channelsList.length ? channelsList : ['IN_APP'],
        audience_mode: form.audienceMode,
        batch_segment_ids: form.audienceMode === 'batch' ? [...form.batchSegmentIds] : undefined,
        department_ids:
          form.audienceMode === 'batch' && form.batchDepartmentIds.length > 0
            ? [...form.batchDepartmentIds]
            : undefined,
        batch_summary:
          form.audienceMode === 'batch' && batchSummary ? batchSummary.labels : undefined,
        recipient_count_estimate:
          form.audienceMode === 'batch' && batchSummary ? batchSummary.est : 1,
        schedule_mode:
          form.scheduleMode === 'instant'
            ? 'instant'
            : form.scheduleMode === 'one_time'
              ? 'one_time'
              : 'recurring',
        recurring_pattern: form.scheduleMode === 'recurring' ? form.recurringPattern : undefined,
        recurring_time_local: form.scheduleMode === 'recurring' ? form.recurringTime : undefined,
        recurring_weekdays:
          form.scheduleMode === 'recurring' && form.recurringPattern === 'weekly'
            ? [...form.recurringWeekdays].sort((a, b) => a - b)
            : undefined,
        queue_as_batch_job: form.audienceMode === 'batch' ? form.queueBatchJob : false,
        respect_quiet_hours: form.respectQuietHours,
        email_subject_line: form.channelEmail ? form.emailSubject.trim() : undefined,
      };

      onCreated(item);
      toast.success(
        `Notification queued (mock). ${scheduleSummary}${
          form.audienceMode === 'batch' && form.queueBatchJob ? ' · Batch job' : ''
        }`
      );
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSegment = (id: string) => {
    setForm((f) => ({
      ...f,
      batchSegmentIds: f.batchSegmentIds.includes(id)
        ? f.batchSegmentIds.filter((x) => x !== id)
        : [...f.batchSegmentIds, id],
    }));
  };

  const toggleDepartment = (id: string) => {
    setForm((f) => ({
      ...f,
      batchDepartmentIds: f.batchDepartmentIds.includes(id)
        ? f.batchDepartmentIds.filter((x) => x !== id)
        : [...f.batchDepartmentIds, id],
    }));
  };

  const toggleWeekday = (day: number) => {
    setForm((f) => ({
      ...f,
      recurringWeekdays: f.recurringWeekdays.includes(day)
        ? f.recurringWeekdays.filter((x) => x !== day)
        : [...f.recurringWeekdays, day].sort((a, b) => a - b),
    }));
  };

  const selectedDeptPeople = useMemo(
    () =>
      departmentOptions
        .filter((d) => form.batchDepartmentIds.includes(d.id))
        .reduce((s, d) => s + d.memberCount, 0),
    [form.batchDepartmentIds, departmentOptions]
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (v) {
            setForm(defaultForm());
          } else {
            reset();
          }
          onOpenChange(v);
        }}
      >
        <DialogContent className="flex h-[90vh] max-h-[85vh] w-full max-w-[700px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px]">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-xl text-[var(--color-success)] md:text-2xl">
              Create New Notification
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Step-by-step wizard — audience from your church API, then channels (in-app / email /
              SMS) and scheduling. Submit uses POST /notifications/notifications/ and
              /notifications/send-bulk/ when live notifications are enabled.
            </p>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {/* Stepper — match QuickCreateModal */}
            <div className="relative mb-8 flex items-center justify-between rounded-full bg-muted/30 p-2">
              <div className="absolute top-1/2 right-6 left-6 z-0 h-[2px] -translate-y-1/2 bg-muted" />
              {STEPS.map((s) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full border-4 border-background text-sm font-bold transition-colors',
                      s === form.step
                        ? 'bg-chart-2 text-primary'
                        : s < form.step
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {s}
                  </div>
                  <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
                    {STEP_LABELS[s - 1]}
                  </span>
                </div>
              ))}
            </div>

            <div className="min-h-[280px]">
              {/* Step 1 — Content */}
              {form.step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.category}
                        onValueChange={(v) => update('category', v as NotificationCategory)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(v) => update('priority', v as NotificationPriority)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Short notification title"
                      value={form.title}
                      onChange={(e) => update('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="What should people read? (You’ll choose in-app / email / SMS in step 3.)"
                      rows={5}
                      className="resize-y"
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2 — Audience */}
              {form.step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                  {!audienceReady && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                      Loading staff users, members, visitors, and departments from the API…
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    <strong>Single</strong> = one staff user (GET /auth/users/), one member, or one
                    visitor (GET /members/visitors/). <strong>Batch</strong> = all members and/or
                    selected departments (send-bulk). Step 3 sets in-app / email / SMS.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, audienceMode: 'single', queueBatchJob: false }))
                      }
                      className={cn(
                        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-colors',
                        form.audienceMode === 'single'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <User className="mb-2 size-6 text-primary" />
                      <span className="font-semibold">Single recipient</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        One staff user, member, or visitor
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => update('audienceMode', 'batch')}
                      className={cn(
                        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-colors',
                        form.audienceMode === 'batch'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <Users className="mb-2 size-6 text-primary" />
                      <span className="font-semibold">Batch / broadcast</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        Segments · batch SMS · email blast
                      </span>
                    </button>
                  </div>

                  {form.audienceMode === 'single' && (
                    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={form.recipientType === 'user' ? 'default' : 'outline'}
                          onClick={() => update('recipientType', 'user')}
                          className="gap-1.5"
                        >
                          <User className="size-3.5" />
                          User
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={form.recipientType === 'member' ? 'default' : 'outline'}
                          onClick={() => update('recipientType', 'member')}
                          className="gap-1.5"
                        >
                          <Users className="size-3.5" />
                          Member
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={form.recipientType === 'visitor' ? 'default' : 'outline'}
                          onClick={() => update('recipientType', 'visitor')}
                          className="gap-1.5"
                        >
                          <UserPlus className="size-3.5" />
                          Visitor
                        </Button>
                      </div>
                      {form.recipientType === 'user' && (
                        <Select value={form.userId} onValueChange={(v) => update('userId', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {userOptions.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {form.recipientType === 'member' && (
                        <Select value={form.memberId} onValueChange={(v) => update('memberId', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {memberOptions.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {form.recipientType === 'visitor' && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Visitor or guest (welcome follow-up, event invite, etc.)
                          </Label>
                          <Select
                            value={form.visitorId}
                            onValueChange={(v) => update('visitorId', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a visitor" />
                            </SelectTrigger>
                            <SelectContent>
                              {visitorOptions.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {form.audienceMode === 'batch' && (
                    <div className="space-y-3">
                      <Label className="text-base">Who should receive this?</Label>
                      <p className="text-xs text-muted-foreground">
                        Member counts come from your directory. Do not select “All church members”
                        and departments together — pick one strategy per send.
                      </p>
                      <div className="grid gap-2">
                        {batchSegments.map((seg) => (
                          <label
                            key={seg.id}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/40"
                          >
                            <Checkbox
                              checked={form.batchSegmentIds.includes(seg.id)}
                              onCheckedChange={() => toggleSegment(seg.id)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-medium">{seg.label}</span>
                                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {seg.count} {seg.id === 'all_members' ? 'members' : 'people'}
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                                {seg.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="relative mt-4 border-t border-border pt-5">
                        <div className="rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-3">
                              <Building2 className="mt-0.5 size-5 shrink-0 text-primary" />
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">Other department(s)</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                  Use the button to open the full list of ministries and select any
                                  combination. Counts show how many members are linked to each
                                  department (demo data).
                                </p>
                                {form.batchDepartmentIds.length > 0 && (
                                  <p className="mt-2 text-sm text-foreground">
                                    <strong>{form.batchDepartmentIds.length}</strong> department
                                    {form.batchDepartmentIds.length !== 1 ? 's' : ''} selected · ~
                                    <strong>{selectedDeptPeople}</strong> people (sum of selected
                                    rows)
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              className="shrink-0 gap-2 self-start sm:self-center"
                              onClick={() => setDepartmentPickerOpen(true)}
                            >
                              <Building2 className="size-4" />
                              Choose departments
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 — Delivery */}
              {form.step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                  <div className="space-y-3">
                    <Label className="text-base">Channels</Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          key: 'channelInApp' as const,
                          label: 'In-app',
                          desc: 'Bell / notification center',
                          icon: Bell,
                        },
                        {
                          key: 'channelEmail' as const,
                          label: 'Email',
                          desc: 'Batch email / newsletter',
                          icon: Mail,
                        },
                        {
                          key: 'channelSms' as const,
                          label: 'SMS',
                          desc: 'Batch SMS / mNotify',
                          icon: Smartphone,
                        },
                      ].map(({ key, label, desc, icon: Icon }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-[11px] text-muted-foreground">{desc}</p>
                            </div>
                          </div>
                          <Switch checked={form[key]} onCheckedChange={(c) => update(key, c)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {form.channelEmail && (
                    <div className="space-y-2">
                      <Label>Email subject line *</Label>
                      <Input
                        placeholder="e.g. Sunday reminder — Grace Community Church"
                        value={form.emailSubject}
                        onChange={(e) => update('emailSubject', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <Label className="mb-3 flex items-center gap-2 text-base">
                      <CalendarClock className="size-4" />
                      Schedule
                    </Label>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          className="size-4 accent-primary"
                          checked={form.scheduleMode === 'instant'}
                          onChange={() => update('scheduleMode', 'instant')}
                        />
                        Send immediately (in-app + queued email/SMS)
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          className="size-4 accent-primary"
                          checked={form.scheduleMode === 'one_time'}
                          onChange={() => update('scheduleMode', 'one_time')}
                        />
                        One-time scheduled send
                      </label>
                      {form.scheduleMode === 'one_time' && (
                        <Input
                          type="datetime-local"
                          className="ml-7 max-w-xs"
                          value={form.scheduledLocal}
                          onChange={(e) => update('scheduledLocal', e.target.value)}
                        />
                      )}
                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          className="size-4 accent-primary"
                          checked={form.scheduleMode === 'recurring'}
                          onChange={() => update('scheduleMode', 'recurring')}
                        />
                        Recurring digest / reminder
                      </label>
                      {form.scheduleMode === 'recurring' && (
                        <div className="ml-0 space-y-4 border-l-2 border-primary/20 pl-4 sm:ml-7">
                          <div className="flex flex-wrap items-center gap-2">
                            <Select
                              value={form.recurringPattern}
                              onValueChange={(v) => {
                                const p = v as typeof form.recurringPattern;
                                setForm((f) => ({
                                  ...f,
                                  recurringPattern: p,
                                  recurringWeekdays: p === 'daily' ? [] : f.recurringWeekdays,
                                }));
                              }}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Every day</SelectItem>
                                <SelectItem value="weekly">Weekly — pick days</SelectItem>
                                <SelectItem value="monthly">Monthly (same day)</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                                Time
                              </Label>
                              <Input
                                type="time"
                                className="w-32"
                                value={form.recurringTime}
                                onChange={(e) => update('recurringTime', e.target.value)}
                              />
                            </div>
                          </div>

                          {form.recurringPattern === 'daily' && (
                            <p className="text-xs text-muted-foreground">
                              Sends every calendar day at the time above.
                            </p>
                          )}

                          {form.recurringPattern === 'weekly' && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">
                                Which days? <span className="text-destructive">*</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Tap to select one or more — e.g. only{' '}
                                <span className="font-medium text-foreground">Tue</span> and{' '}
                                <span className="font-medium text-foreground">Sun</span> for twice a
                                week.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map(({ day, short }) => {
                                  const on = form.recurringWeekdays.includes(day);
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => toggleWeekday(day)}
                                      className={cn(
                                        'min-w-[3rem] rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                                        on
                                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                      )}
                                    >
                                      {short}
                                    </button>
                                  );
                                })}
                              </div>
                              {form.recurringWeekdays.length > 0 && (
                                <p className="text-[11px] text-muted-foreground">
                                  Selected:{' '}
                                  {[...form.recurringWeekdays]
                                    .sort((a, b) => a - b)
                                    .map((d) => WEEKDAYS.find((w) => w.day === d)?.short)
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                          )}

                          {form.recurringPattern === 'monthly' && (
                            <p className="text-xs text-muted-foreground">
                              Sends once per month at the time above (same calendar date as the
                              first run — mock; production may use “day of month” settings).
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    {form.audienceMode === 'batch' && (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex items-start gap-2">
                          <Layers className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Send as a batch job</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              When many people get the same message, the server can send in{' '}
                              <strong>chunks</strong> (e.g. 200 at a time) instead of all at once.
                              Safer for SMS/email providers and easier to track. In production this
                              ties to your batch / queue API.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={form.queueBatchJob}
                          onCheckedChange={(c) => update('queueBatchJob', c)}
                          className="shrink-0"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        'flex items-start justify-between gap-3',
                        form.audienceMode === 'batch' && 'border-t border-border pt-3'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-medium">Don’t disturb at night (quiet hours)</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          If on, <strong>texts and emails</strong> are not sent between{' '}
                          <strong>22:00 and 07:00</strong> (people’s sleep time). In-app can still
                          appear when they open the app. Matches each user’s notification
                          preferences when wired to the API.
                        </p>
                      </div>
                      <Switch
                        checked={form.respectQuietHours}
                        onCheckedChange={(c) => update('respectQuietHours', c)}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Review */}
              {form.step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
                  <div className="rounded-xl border border-border bg-muted/15 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-[#083344] dark:text-foreground">
                      Message
                    </h4>
                    <p className="font-medium">{form.title || '—'}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {form.message || '—'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="text-xs font-medium text-muted-foreground">Audience</p>
                      <p className="mt-1">
                        {form.audienceMode === 'single'
                          ? `${form.recipientType === 'user' ? 'User' : form.recipientType === 'member' ? 'Member' : 'Visitor'} · ${
                              form.recipientType === 'user'
                                ? userOptions.find((u) => u.id === form.userId)?.label
                                : form.recipientType === 'member'
                                  ? memberOptions.find((m) => m.id === form.memberId)?.label
                                  : visitorOptions.find((v) => v.id === form.visitorId)?.label
                            }`
                          : batchSummary
                            ? `${batchSummary.labels} (~${batchSummary.est})`
                            : '—'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="text-xs font-medium text-muted-foreground">Channels</p>
                      <p className="mt-1">{channelsList.join(', ') || '—'}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-sm sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Schedule</p>
                      <p className="mt-1">{buildScheduledIso().summary}</p>
                      {form.audienceMode === 'batch' && form.queueBatchJob && (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                          Batch job queue · processed by worker
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {notificationsApiEnabled()
                      ? 'Submits to the notifications API (single create or send-bulk).'
                      : 'Preview only: enable live notifications (token + NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS=false) to POST to the API.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              {form.step > 1 && (
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {form.step < 4 ? (
                <Button type="button" onClick={goNext} disabled={isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  className="gap-2 min-w-[200px]"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                      Sending notification…
                    </>
                  ) : (
                    <>
                      <Send className="size-4 shrink-0" aria-hidden />
                      Create notification
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={departmentPickerOpen} onOpenChange={setDepartmentPickerOpen}>
        <DialogContent className="flex max-h-[min(85vh,620px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
            <DialogTitle className="text-[#083344] dark:text-foreground">
              Select departments
            </DialogTitle>
            <DialogDescription>
              Ministries from GET /departments/ for your church. Selected IDs are sent with
              send-bulk when you target departments only.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <ul className="space-y-1">
              {departmentOptions.map((d) => (
                <li key={d.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 transition-colors hover:bg-muted/60">
                    <Checkbox
                      checked={form.batchDepartmentIds.includes(d.id)}
                      onCheckedChange={() => toggleDepartment(d.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ~{d.memberCount} people
                      </span>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setDepartmentPickerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setDepartmentPickerOpen(false)}>
              Done ({form.batchDepartmentIds.length} selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
