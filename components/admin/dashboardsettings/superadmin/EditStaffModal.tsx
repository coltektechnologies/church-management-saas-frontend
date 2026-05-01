'use client';

import { useEffect, useMemo, useState } from 'react';
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
  type StaffMember,
} from './adminManagementConfig';
import { getUser, updateUser } from '@/lib/settingsApi';
import { fetchRolesList } from '@/lib/rolesApi';
import { replaceUserPrimaryRole, syncUserChurchGroups } from '@/lib/adminStaffApi';

const UNASSIGNED = '__unassigned__';

function roleFieldValue(roleName: string): string {
  const n = (roleName ?? '').trim();
  if (!n || n === 'Unassigned') {
    return UNASSIGNED;
  }
  return n;
}

export interface EditStaffFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  role_name: string;
  church_groups: string[];
  date_of_birth: string;
  gender: string;
  address: string;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  staff: StaffMember;
  churchGroups: ChurchGroupOption[];
  groupsLoading?: boolean;
  onSaved: () => Promise<void>;
}

export default function EditStaffModal({
  open,
  onClose,
  staff,
  churchGroups,
  groupsLoading,
  onSaved,
}: Props) {
  const [form, setForm] = useState<EditStaffFormState>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
    role_name: UNASSIGNED,
    church_groups: [],
    date_of_birth: '',
    gender: '',
    address: '',
    is_active: true,
  });
  const [showProfile, setShowProfile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const roleOptions = useMemo(() => {
    const base = [...STAFF_ROLE_OPTIONS, { value: UNASSIGNED, label: 'Unassigned', hint: 'None' }];
    if (
      staff &&
      staff.roleName &&
      staff.roleName !== 'Unassigned' &&
      !base.some((o) => o.value === staff.roleName)
    ) {
      return [
        { value: staff.roleName, label: `${staff.roleName} (current)`, hint: 'From server' },
        ...base,
      ];
    }
    return base;
  }, [staff]);

  useEffect(() => {
    if (!open || !staff) {
      return;
    }
    setForm({
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      phone: staff.phone ?? '',
      username: staff.username ?? '',
      role_name: roleFieldValue(staff.roleName),
      church_groups: [...staff.churchGroupIds],
      date_of_birth: '',
      gender: '',
      address: '',
      is_active: staff.status === 'active',
    });
    setShowProfile(false);
    setErrors({});

    let cancelled = false;
    setDetailLoading(true);
    void getUser(staff.id)
      .then((u) => {
        if (cancelled || !u) {
          return;
        }
        const raw = u.date_of_birth;
        const dob = typeof raw === 'string' && raw.length >= 10 ? raw.slice(0, 10) : '';
        setForm((prev) => ({
          ...prev,
          date_of_birth: dob,
          gender: typeof u.gender === 'string' ? u.gender : '',
          address: typeof u.address === 'string' ? u.address : '',
        }));
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, staff]);

  const setField = <K extends keyof EditStaffFormState>(key: K, value: EditStaffFormState[K]) => {
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
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    if (!staff) {
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const roles = await fetchRolesList();
      let roleId: string | null = null;
      if (form.role_name !== UNASSIGNED) {
        const role = roles.find((r) => r.name === form.role_name);
        if (!role) {
          throw new Error(`Role "${form.role_name}" was not found.`);
        }
        roleId = role.id;
      }

      const body: Record<string, unknown> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        is_active: form.is_active,
      };
      const phone = form.phone.trim();
      if (phone) {
        body.phone = phone;
      }
      if (form.date_of_birth) {
        body.date_of_birth = form.date_of_birth;
      }
      if (form.gender && form.gender !== '__none__') {
        body.gender = form.gender;
      }
      const addr = form.address.trim();
      if (addr) {
        body.address = addr;
      }

      await updateUser(staff.id, body);
      await replaceUserPrimaryRole(staff.id, roleId);
      await syncUserChurchGroups(staff.id, staff.churchGroupIds, form.church_groups);

      toast.success(`${form.first_name.trim() || staff.email} updated`);
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
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
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-100 shadow-2xl p-6 sm:p-8 gap-0">
        <DialogHeader className="text-left space-y-1 pb-2">
          <DialogTitle className="text-2xl font-black text-[#0B2A4A]">Edit staff user</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium">
            Update profile, church role, and group memberships. Email change is not supported here.
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
                  className={`h-11 rounded-xl bg-slate-50 border-slate-100 ${errors.first_name ? 'ring-2 ring-red-400' : ''}`}
                  value={form.first_name}
                  onChange={(ev) => setField('first_name', ev.target.value)}
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
                  className={`h-11 rounded-xl bg-slate-50 border-slate-100 ${errors.last_name ? 'ring-2 ring-red-400' : ''}`}
                  value={form.last_name}
                  onChange={(ev) => setField('last_name', ev.target.value)}
                />
                {errors.last_name && <p className="text-[10px] text-red-500">{errors.last_name}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Email (read-only)
                </Label>
                <Input
                  type="email"
                  readOnly
                  className="h-11 rounded-xl bg-slate-100 border-slate-100 text-slate-600"
                  value={form.email}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Phone
                </Label>
                <Input
                  className="h-11 rounded-xl bg-slate-50 border-slate-100"
                  value={form.phone}
                  onChange={(ev) => setField('phone', ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-0.5">
                  Username
                </Label>
                <Input
                  readOnly
                  className="h-11 rounded-xl bg-slate-100 border-slate-100 text-slate-600"
                  value={form.username}
                  placeholder="—"
                />
                <p className="text-[10px] text-slate-400">Managed by the server account record.</p>
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
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[280px]">
                    {roleOptions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label} — {r.hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:col-span-2">
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
              Church groups
            </Label>
            {groupsLoading ? (
              <p className="text-sm text-slate-500 py-3">Loading groups…</p>
            ) : churchGroups.length === 0 ? (
              <p className="text-sm text-slate-500 py-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4">
                No church groups available.
              </p>
            ) : (
              <div className="space-y-2">
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-xl border-slate-100 bg-slate-50 font-medium text-left justify-between text-[#0B2A4A] hover:bg-slate-100/80"
                    >
                      <span className="truncate">
                        {form.church_groups.length === 0
                          ? 'No groups'
                          : `${form.church_groups.length} group${form.church_groups.length === 1 ? '' : 's'} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 rounded-xl border-slate-100 shadow-lg w-[min(calc(100vw-2rem),28rem)]"
                    align="start"
                    sideOffset={6}
                  >
                    <div className="max-h-[min(50vh,320px)] overflow-y-auto p-2 space-y-0.5">
                      {churchGroups.map((g) => (
                        <label
                          key={g.id}
                          className="flex items-start gap-3 rounded-lg px-2 py-2.5 cursor-pointer hover:bg-slate-50"
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
                          className="pl-2.5 pr-1 py-1 gap-1 text-[11px] font-semibold bg-slate-100 text-slate-800"
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
            Profile (optional)
            {detailLoading ? (
              <span className="text-[10px] font-normal text-slate-400">loading…</span>
            ) : null}
          </button>
          {showProfile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-[#2FC4B2]/40 ml-1">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Date of birth
                </Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl bg-slate-50 border-slate-100"
                  value={form.date_of_birth}
                  onChange={(ev) => setField('date_of_birth', ev.target.value)}
                  disabled={detailLoading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Gender</Label>
                <Select
                  value={form.gender || '__none__'}
                  onValueChange={(v) => setField('gender', v === '__none__' ? '' : v)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100">
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
                  className="rounded-xl bg-slate-50 border-slate-100 min-h-[80px] resize-none"
                  value={form.address}
                  onChange={(ev) => setField('address', ev.target.value)}
                  disabled={detailLoading}
                />
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
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
