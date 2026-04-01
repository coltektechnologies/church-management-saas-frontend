'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShieldCheck,
  ShieldOff,
  Clock,
  Users,
  UserX,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import {
  useChurchProfile,
  type GrantedAdmin,
  type AdminPermission,
  type ChurchLink,
} from '@/components/admin/dashboard/contexts/ChurchProfileContext';

// ─── Options ──────────────────────────────────────────────────────────────────

const DEPT_TYPES: string[] = [
  'Youth',
  'Choir',
  'Finance',
  'Deacons',
  'Deaconess',
  'Pathfinders',
  'Adventurers',
  'Women',
  'Men',
  'Prayer',
  'Stewardship',
  'Community Service',
  'Communications',
  'Health',
  'Education',
  'Pastoral',
  'Other',
];

/**
 * Church links — the person's official position within the church structure.
 * Used as userRole in DeptMyProfileTab. NOT system permission levels.
 */
const CHURCH_LINKS: ChurchLink[] = [
  'Pastor',
  'Associate Pastor',
  'Elder',
  'Deacon',
  'Deaconess',
  'Church Secretary',
  'Treasurer',
  'Youth Director',
  'Choir Director',
  'Sabbath School Superintendent',
  'Community Services Director',
  'Head of Department',
  'Department Secretary',
  'Volunteer',
  'Other',
];

// ─── Payload type ─────────────────────────────────────────────────────────────

export interface AdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  /** System-level access permission */
  permission: AdminPermission;
  /** Official church position — becomes userRole in DeptMyProfileTab */
  churchLink: ChurchLink | string;
  department?: string;
  departmentType?: string;
  notification_preference: string;
  send_credentials: boolean;
  church_groups: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (admin: AdminPayload) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const permissionBadgeColor = (p: AdminPermission) => {
  if (p === 'Admin') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (p === 'Editor') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

// ─── Inline Confirm Dialog ────────────────────────────────────────────────────

interface ConfirmRevokeDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmRevokeDialog = ({ open, onCancel, onConfirm }: ConfirmRevokeDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(o) => {
      if (!o) {
        onCancel();
      }
    }}
  >
    <DialogContent className="max-w-sm rounded-[24px] border-none shadow-2xl p-7">
      <DialogHeader>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <DialogTitle className="text-[#0B2A4A] font-black text-lg">Revoke Access?</DialogTitle>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed pt-1">
          This admin will immediately lose system access. Their profile and history are preserved
          for reference. This action cannot be undone from here.
        </p>
      </DialogHeader>
      <DialogFooter className="gap-2 mt-4">
        <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white"
        >
          Yes, Revoke Access
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ─── Access History Panel ─────────────────────────────────────────────────────

const AccessHistoryPanel = () => {
  const { getAllAdmins, getActiveAdmins, revokeAdmin } = useChurchProfile();
  const [showRevoked, setShowRevoked] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const all = getAllAdmins();
  const active = getActiveAdmins();
  const revoked = all.filter((a: GrantedAdmin) => !!a.revoked_at);
  const displayed = showRevoked ? all : active;

  if (all.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 flex flex-col items-center gap-2 text-center">
        <Users size={28} className="text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No system admins granted access yet.</p>
        <p className="text-[11px] text-slate-400">
          Fill in the form above and click "Grant Access" to add one.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-[#0B2A4A]" />
          <span className="text-sm font-black text-[#0B2A4A]">Access Registry</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-[#0B2A4A]/10 text-[10px] font-black text-[#0B2A4A]">
            {active.length} active
          </span>
          {revoked.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-[10px] font-black text-red-500">
              {revoked.length} revoked
            </span>
          )}
        </div>
        {revoked.length > 0 && (
          <button
            onClick={() => setShowRevoked((s) => !s)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0B2A4A] transition-colors"
          >
            {showRevoked ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showRevoked ? 'Hide revoked' : 'Show revoked'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2.5 gap-3">
          <span>Admin</span>
          <span className="text-right">Church Link</span>
          <span className="text-right">Permission</span>
          <span className="text-right">Granted</span>
          <span className="text-right">Action</span>
        </div>

        {displayed.map((admin: GrantedAdmin, i: number) => {
          const isRevoked = !!admin.revoked_at;
          return (
            <div
              key={admin.id}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 gap-3 text-sm border-t border-slate-100 transition-colors ${
                isRevoked ? 'bg-red-50/40 opacity-70' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
              }`}
            >
              {/* Name + dept */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isRevoked ? (
                    <UserX size={13} className="text-red-400 shrink-0" />
                  ) : (
                    <UserCheck size={13} className="text-emerald-500 shrink-0" />
                  )}
                  <span className="font-bold text-[#0B2A4A] truncate">
                    {admin.first_name} {admin.last_name}
                  </span>
                </div>
                {(admin.department || admin.departmentType) && (
                  <p className="text-[10px] text-slate-400 font-medium ml-[18px] mt-0.5">
                    {admin.departmentType ? `${admin.departmentType} Dept` : admin.department}
                  </p>
                )}
                {isRevoked && admin.revoked_at && (
                  <p className="text-[10px] text-red-400 font-medium ml-[18px] mt-0.5 flex items-center gap-1">
                    <Clock size={9} />
                    Revoked {fmt(admin.revoked_at)}
                  </p>
                )}
              </div>

              {/* Church link badge */}
              <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 justify-end">
                <Link2 size={10} className="text-[#2FC4B2]" />
                {admin.churchLink || '—'}
              </div>

              {/* System permission badge */}
              <div className="flex justify-end">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${permissionBadgeColor(admin.permission)}`}
                >
                  {admin.permission}
                </span>
              </div>

              {/* Granted date */}
              <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium text-right">
                {fmt(admin.granted_at)}
              </span>

              {/* Action */}
              <div className="flex justify-end">
                {isRevoked ? (
                  <span className="text-[10px] text-red-400 font-bold whitespace-nowrap">
                    Revoked
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(admin.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors whitespace-nowrap"
                  >
                    <ShieldOff size={12} />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 mt-2 ml-1">
        Revoked admins remain in the registry for reference — their dashboard interface is preserved
        for historical records.
      </p>

      <ConfirmRevokeDialog
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            revokeAdmin(confirmId);
          }
          setConfirmId(null);
        }}
      />
    </>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────

const AddAdminModal = ({ open, onClose, onAdd }: Props) => {
  const { grantAdmin } = useChurchProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [permission, setPermission] = useState<AdminPermission>('Viewer');
  const [churchLink, setChurchLink] = useState<ChurchLink | string>('');
  const [department, setDepartment] = useState('');
  const [departmentType, setDepartmentType] = useState('');
  const [notifPref, setNotifPref] = useState('both');
  const [sendCredentials, setSendCredentials] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) {
      e.firstName = 'Required';
    }
    if (!lastName.trim()) {
      e.lastName = 'Required';
    }
    if (!email.trim()) {
      e.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Invalid email';
    }
    if (!username.trim()) {
      e.username = 'Required';
    }
    if (!churchLink) {
      e.churchLink = "Required — select the person's church position";
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    const payload: AdminPayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      permission,
      churchLink,
      department: department.trim() || undefined,
      departmentType: departmentType || undefined,
      notification_preference: notifPref,
      send_credentials: sendCredentials,
      church_groups: [],
    };

    // Persist to context so AccessHistoryPanel updates immediately
    grantAdmin({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      permission: payload.permission,
      churchLink: payload.churchLink,
      department: payload.department,
      departmentType: payload.departmentType,
      notification_preference: payload.notification_preference,
      send_credentials: payload.send_credentials,
      church_groups: payload.church_groups,
    });

    onAdd(payload);

    // Reset form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPermission('Viewer');
    setChurchLink('');
    setDepartment('');
    setDepartmentType('');
    setNotifPref('both');
    setSendCredentials(true);
    onClose();
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
      <DialogContent className="max-w-3xl rounded-[32px] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0B2A4A]">Add System Admin</DialogTitle>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Grant a church member access to manage the system. Their information is saved for
            reference even after they leave office.
          </p>
        </DialogHeader>

        {/* ── Form ── */}
        <div className="grid grid-cols-2 gap-5 py-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              First Name <span className="text-red-400">*</span>
            </Label>
            <Input
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.firstName ? 'ring-1 ring-red-400' : ''}`}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors((p) => ({ ...p, firstName: '' }));
              }}
              placeholder="e.g. Collins"
            />
            {errors.firstName && (
              <p className="text-[10px] text-red-400 ml-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Last Name <span className="text-red-400">*</span>
            </Label>
            <Input
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.lastName ? 'ring-1 ring-red-400' : ''}`}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrors((p) => ({ ...p, lastName: '' }));
              }}
              placeholder="e.g. Doe"
            />
            {errors.lastName && <p className="text-[10px] text-red-400 ml-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Email Address <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.email ? 'ring-1 ring-red-400' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: '' }));
              }}
              placeholder="e.g. admin@church.com"
            />
            {errors.email && <p className="text-[10px] text-red-400 ml-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Phone Number
            </Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +233xxxxxxxxx"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Username <span className="text-red-400">*</span>
            </Label>
            <Input
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.username ? 'ring-1 ring-red-400' : ''}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((p) => ({ ...p, username: '' }));
              }}
              placeholder="e.g. collins_admin"
            />
            {errors.username && <p className="text-[10px] text-red-400 ml-1">{errors.username}</p>}
          </div>

          {/* Church Link / Position — feeds DeptMyProfileTab.userRole */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Church Link / Position <span className="text-red-400">*</span>
            </Label>
            <Select
              value={churchLink}
              onValueChange={(v) => {
                setChurchLink(v);
                setErrors((p) => ({ ...p, churchLink: '' }));
              }}
            >
              <SelectTrigger
                className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.churchLink ? 'ring-1 ring-red-400' : ''}`}
              >
                <SelectValue placeholder="e.g. Treasurer, Elder…" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                {CHURCH_LINKS.map((cl) => (
                  <SelectItem key={cl} value={cl}>
                    {cl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.churchLink ? (
              <p className="text-[10px] text-red-400 ml-1">{errors.churchLink}</p>
            ) : (
              <p className="text-[10px] text-slate-400 ml-1">
                {'Their official position — auto-fills their department profile.'}
              </p>
            )}
          </div>

          {/* System Permission Level — separate from church link */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              System Permission Level
            </Label>
            <Select value={permission} onValueChange={(v) => setPermission(v as AdminPermission)}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="Admin">Admin — Full access</SelectItem>
                <SelectItem value="Editor">Editor — Content only</SelectItem>
                <SelectItem value="Viewer">Viewer — Read-only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400 ml-1">
              Controls what this person can do inside the system.
            </p>
          </div>

          {/* Department / Ministry Type */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Department / Ministry
            </Label>
            <Select value={departmentType} onValueChange={setDepartmentType}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="e.g. Youth" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                {DEPT_TYPES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Name (custom) */}
          <div className="space-y-2 col-span-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Department / Ministry Name{' '}
              <span className="normal-case font-normal text-slate-400">
                (optional — if different from type above)
              </span>
            </Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Adventist Youth Society, Dorcas Ministry…"
            />
          </div>

          {/* Notification Preference */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Notifications
            </Label>
            <Select value={notifPref} onValueChange={setNotifPref}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Send credentials */}
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="credentials"
              checked={sendCredentials}
              onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
            />
            <Label
              htmlFor="credentials"
              className="text-sm font-bold text-[#0B2A4A] cursor-pointer"
            >
              Send login credentials via email
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="ghost" onClick={handleClose} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-white rounded-xl font-bold px-8 shadow-lg shadow-primary/20"
          >
            Grant Access
          </Button>
        </DialogFooter>

        {/* ── Access History ── */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <AccessHistoryPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminModal;
