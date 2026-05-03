'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  STAFF_ROLE_OPTIONS,
  type ChurchGroupOption,
  type InviteStaffPayload,
} from './adminManagementConfig';

export type { InviteStaffPayload };

interface Props {
  open: boolean;
  onClose: () => void;
  /** Church groups from GET /auth/church-groups/ (ids must be real UUIDs for the API). */
  churchGroups: ChurchGroupOption[];
  groupsLoading?: boolean;
  onInvite: (payload: InviteStaffPayload) => Promise<void>;
}

const defaultPayload = (): InviteStaffPayload => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  username: '',
  role_name: 'Secretary',
  notification_preference: 'both',
  send_credentials: true,
  church_groups: [],
  date_of_birth: '',
  gender: '',
  address: '',
  password: '',
  password_confirm: '',
  is_active: true,
});

export default function AddAdminModal({
  open,
  onClose,
  churchGroups,
  groupsLoading,
  onInvite,
}: Props) {
  const [form, setForm] = useState<InviteStaffPayload>(defaultPayload);
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof InviteStaffPayload>(key: K, value: InviteStaffPayload[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const toggleGroup = (id: string) => {
    setForm((p) => {
      const has = p.church_groups.includes(id);
      return {
        ...p,
        church_groups: has ? p.church_groups.filter((g) => g !== id) : [...p.church_groups, id],
      };
    });
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) {
      e.first_name = 'Required';
    }
    if (!form.last_name.trim()) {
      e.last_name = 'Required';
    }
    if (!form.email.trim()) {
      e.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email';
    }
    if (form.password || form.password_confirm) {
      if (form.password.length < 8) {
        e.password = 'At least 8 characters';
      }
      if (form.password !== form.password_confirm) {
        e.password_confirm = 'Does not match';
      }
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    const payload: InviteStaffPayload = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      username: form.username.trim(),
      address: form.address.trim(),
    };
    setSubmitting(true);
    try {
      await onInvite(payload);
      setForm(defaultPayload());
      setShowProfile(false);
      setShowPassword(false);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invite failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-[28px] bg-[var(--admin-surface)] text-foreground border border-[var(--admin-border)] shadow-2xl p-6 sm:p-8 gap-0">
        <DialogHeader className="text-left space-y-1 pb-2">
          <DialogTitle className="text-2xl font-black text-[#0B2A4A]">
            Invite staff user
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium">
            Creates a user via the API, assigns the selected role, and adds optional church groups.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Identity
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  First name <span className="text-red-400">*</span>
                </Label>
                <Input
                  className={`h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)] ${errors.first_name ? 'ring-2 ring-red-400' : ''}`}
                  value={form.first_name}
                  onChange={(ev) => setField('first_name', ev.target.value)}
                  placeholder="Kwame"
                />
                {errors.first_name && (
                  <p className="text-[10px] text-red-500">{errors.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Last name <span className="text-red-400">*</span>
                </Label>
                <Input
                  className={`h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)] ${errors.last_name ? 'ring-2 ring-red-400' : ''}`}
                  value={form.last_name}
                  onChange={(ev) => setField('last_name', ev.target.value)}
                  placeholder="Mensah"
                />
                {errors.last_name && <p className="text-[10px] text-red-500">{errors.last_name}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="email"
                  className={`h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)] ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                  value={form.email}
                  onChange={(ev) => setField('email', ev.target.value)}
                  placeholder="staff@yourchurch.org"
                />
                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Phone
                </Label>
                <Input
                  className="h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)]"
                  value={form.phone}
                  onChange={(ev) => setField('phone', ev.target.value)}
                  placeholder="+233 …"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Username
                </Label>
                <Input
                  className="h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)]"
                  value={form.username}
                  onChange={(ev) => setField('username', ev.target.value)}
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-[10px] text-slate-400">
                  Optional — API can derive from first and last name.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Access</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Role
                </Label>
                <Select value={form.role_name} onValueChange={(v) => setField('role_name', v)}>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[280px]">
                    {STAFF_ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label} — {r.hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Credential delivery
                </Label>
                <Select
                  value={form.notification_preference}
                  onValueChange={(v) =>
                    setField(
                      'notification_preference',
                      v as InviteStaffPayload['notification_preference']
                    )
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="email">Email only</SelectItem>
                    <SelectItem value="sms">SMS only</SelectItem>
                    <SelectItem value="both">Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#0B2A4A]">Send credentials</p>
                  <p className="text-[10px] text-slate-500">Maps to send_credentials</p>
                </div>
                <Switch
                  checked={form.send_credentials}
                  onCheckedChange={(c) => setField('send_credentials', c)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/10 px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-bold text-[#0B2A4A]">Active account</p>
                  <p className="text-[10px] text-slate-500">Maps to is_active</p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(c) => setField('is_active', c)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
              Church groups (optional)
            </Label>
            <p className="text-xs text-slate-500 -mt-1 mb-2">
              Open the dropdown to choose one or more groups. They are sent as{' '}
              <code className="text-[10px] bg-muted dark:bg-white/10 px-1 rounded">church_groups</code> when the
              user is created.
            </p>
            {groupsLoading ? (
              <p className="text-sm text-slate-500 py-3">Loading groups…</p>
            ) : churchGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 rounded-xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.06] px-4">
                No church groups yet. Run{' '}
                <code className="text-[10px] bg-muted dark:bg-white/10 px-1 rounded">setup_initial_data</code> on
                the backend or create groups in church settings.
              </p>
            ) : (
              <div className="space-y-2">
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-xl border-[var(--admin-border)] bg-muted/40 dark:bg-white/5 font-medium text-left justify-between text-[#0B2A4A] hover:bg-muted dark:bg-white/10/80"
                    >
                      <span className="truncate">
                        {form.church_groups.length === 0
                          ? 'Select church groups…'
                          : `${form.church_groups.length} group${form.church_groups.length === 1 ? '' : 's'} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 rounded-xl border-[var(--admin-border)] shadow-lg w-[min(calc(100vw-2rem),28rem)]"
                    align="start"
                    sideOffset={6}
                  >
                    <div className="border-b border-[var(--admin-border)] px-3 py-2 text-[10px] font-black uppercase text-slate-400">
                      {churchGroups.length} group{churchGroups.length === 1 ? '' : 's'} available
                    </div>
                    <div className="max-h-[min(50vh,320px)] overflow-y-auto p-2 space-y-0.5">
                      {churchGroups.map((g) => (
                        <label
                          key={g.id}
                          className="flex items-start gap-3 rounded-lg px-2 py-2.5 cursor-pointer hover:bg-muted/40 dark:bg-white/5"
                        >
                          <Checkbox
                            checked={form.church_groups.includes(g.id)}
                            onCheckedChange={() => toggleGroup(g.id)}
                            className="mt-0.5"
                          />
                          <span className="min-w-0">
                            <span className="text-sm font-semibold text-[#0B2A4A] block">
                              {g.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Linked role: {g.roleHint ?? '—'}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {form.church_groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.church_groups.map((id) => {
                      const g = churchGroups.find((x) => x.id === id);
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="pl-2.5 pr-1 py-1 gap-1 text-[11px] font-semibold bg-muted dark:bg-white/10 text-slate-800"
                        >
                          <span className="max-w-[200px] truncate">{g?.name ?? 'Group'}</span>
                          <button
                            type="button"
                            className="rounded-md p-0.5 hover:bg-slate-200/80 text-slate-600"
                            onClick={() => toggleGroup(id)}
                            aria-label={`Remove ${g?.name ?? 'group'}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2 text-xs font-bold text-[#0B2A4A] hover:underline"
          >
            {showProfile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Profile (optional) — date of birth, gender, address
          </button>
          {showProfile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-[#2FC4B2]/40 ml-1">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Date of birth
                </Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)]"
                  value={form.date_of_birth}
                  onChange={(ev) => setField('date_of_birth', ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Gender</Label>
                <Select
                  value={form.gender || '__none__'}
                  onValueChange={(v) => setField('gender', v === '__none__' ? '' : v)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__">Not specified</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Address</Label>
                <Textarea
                  className="rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)] min-h-[80px] resize-none"
                  value={form.address}
                  onChange={(ev) => setField('address', ev.target.value)}
                  placeholder="Residential address (optional)"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="flex items-center gap-2 text-xs font-bold text-[#0B2A4A] hover:underline"
          >
            {showPassword ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Password (optional) — leave empty for auto-generated
          </button>
          {showPassword && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-slate-200 ml-1">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
                <Input
                  type="password"
                  className={`h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)] ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                  value={form.password}
                  onChange={(ev) => setField('password', ev.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
                {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Confirm</Label>
                <Input
                  type="password"
                  className={`h-11 rounded-xl bg-muted/40 dark:bg-white/5 border-[var(--admin-border)] ${errors.password_confirm ? 'ring-2 ring-red-400' : ''}`}
                  value={form.password_confirm}
                  onChange={(ev) => setField('password_confirm', ev.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                {errors.password_confirm && (
                  <p className="text-[10px] text-red-500">{errors.password_confirm}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl font-bold w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="bg-[#2FC4B2] hover:bg-[#28b0a0] text-white rounded-xl font-bold px-8 w-full sm:w-auto"
          >
            {submitting ? 'Inviting…' : 'Invite staff'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
