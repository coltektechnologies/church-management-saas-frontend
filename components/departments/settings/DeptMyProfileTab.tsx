'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import {
  useChurchProfile,
  type GrantedAdmin,
} from '@/components/admin/dashboard/contexts/ChurchProfileContext';
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
import { toast } from 'sonner';
import { Upload, X, User, Info, ShieldCheck, Link2 } from 'lucide-react';

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
 * Must stay in sync with CHURCH_LINKS in AddAdminModal so pre-filled
 * values match selectable options.
 */
const CHURCH_ROLES: string[] = [
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeptMyProfileTab() {
  const { profile, updateProfile } = useDepartmentProfile();
  const { getActiveAdmins } = useChurchProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const activeAdmins = getActiveAdmins();

  /**
   * Try to find a GrantedAdmin record whose email or full name matches the
   * currently saved department profile, so we can pre-fill fields.
   * churchLink on GrantedAdmin is the canonical source for userRole here.
   */
  const matchedGrant: GrantedAdmin | undefined = activeAdmins.find(
    (a) =>
      (profile.headEmail && a.email?.toLowerCase() === profile.headEmail.toLowerCase()) ||
      (profile.headName &&
        `${a.first_name} ${a.last_name}`.toLowerCase() === profile.headName.toLowerCase())
  );

  const [form, setForm] = useState({
    departmentName: profile.departmentName || matchedGrant?.department || '',
    departmentType: profile.departmentType || matchedGrant?.departmentType || 'Youth',
    /**
     * userRole is pre-filled from matchedGrant.churchLink — the official
     * church position set in AddAdminModal, not the system permission level.
     */
    userRole: profile.userRole || matchedGrant?.churchLink || '',
    headName:
      profile.headName ||
      (matchedGrant ? `${matchedGrant.first_name} ${matchedGrant.last_name}` : ''),
    preferredName: profile.preferredName || '',
    headEmail: profile.headEmail || matchedGrant?.email || '',
    headPhone: profile.headPhone || matchedGrant?.phone || '',
    avatarUrl: profile.avatarUrl ?? (null as string | null),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const initials = form.headName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const topbarPreview =
    form.preferredName.trim() || form.headName.split(' ').filter(Boolean).slice(-1)[0] || 'You';

  const handleSave = () => {
    /**
     * departmentType is the single source of truth for the sidebar role badge.
     * The sidebar reads profile.departmentType directly — no separate adminRole
     * field needed, so we only update the fields that exist on DepartmentProfile.
     */
    updateProfile({
      departmentName: form.departmentName,
      departmentType: form.departmentType,
      userRole: form.userRole,
      headName: form.headName,
      preferredName: form.preferredName,
      headEmail: form.headEmail,
      headPhone: form.headPhone,
      avatarUrl: form.avatarUrl,
    });
    toast.success('Profile updated successfully', {
      description: 'Your name and photo are now live across the sidebar and topbar.',
    });
  };

  return (
    <div className="bg-card rounded-[24px] border border-border p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div>
        <h3 className="text-lg font-black text-foreground">My Profile</h3>
        <p className="text-xs text-muted-foreground font-medium">
          Your personal info and department details — shown in the sidebar and topbar.
        </p>
      </div>

      {/* Pre-fill notice */}
      {matchedGrant && (
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <ShieldCheck size={15} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
              Your profile was pre-filled from your system access record granted on{' '}
              <span className="font-black">
                {new Date(matchedGrant.granted_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              .
            </p>
            {matchedGrant.churchLink && (
              <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <Link2 size={10} />
                Church link: <span className="font-black">{matchedGrant.churchLink}</span>
              </p>
            )}
            <p className="text-[11px] text-blue-500">You can update any field below.</p>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <div className="relative w-20 h-20">
              <Image
                src={form.avatarUrl}
                alt={form.headName}
                fill
                className="rounded-full object-cover border-2 border-border shadow"
                unoptimized
              />
              <button
                onClick={() => setForm((prev) => ({ ...prev, avatarUrl: null }))}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow hover:opacity-90"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl shadow"
              style={{ backgroundColor: profile.primaryColor || '#0B2A4A' }}
            >
              {initials || <User size={28} />}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted/30 transition-all flex items-center gap-2"
          >
            <Upload size={14} /> Upload Photo
          </button>
          <p className="text-[10px] text-muted-foreground mt-1.5">PNG or JPG, max 2MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Department Type */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Department / Ministry Type
          </Label>
          <Select
            value={form.departmentType}
            onValueChange={(v) => setForm({ ...form, departmentType: v })}
          >
            <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground ml-1">
            Also shown as your role badge in the sidebar.
          </p>
        </div>

        {/* Department Name */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Department / Ministry Name
          </Label>
          <Input
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.departmentName}
            placeholder="e.g. Adventist Youth Society"
            onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
          />
        </div>

        {/*
          Church Link / Role — pre-filled from matchedGrant.churchLink.
          Stored as profile.userRole — a separate concept from departmentType.
        */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Church Link / Position
          </Label>
          <Select value={form.userRole} onValueChange={(v) => setForm({ ...form, userRole: v })}>
            <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
              <SelectValue placeholder="e.g. Youth Director" />
            </SelectTrigger>
            <SelectContent>
              {CHURCH_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground ml-1">
            Your official position within the church.
          </p>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Full Name
          </Label>
          <Input
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.headName}
            placeholder="e.g. Bro. John Doe"
            onChange={(e) => setForm({ ...form, headName: e.target.value })}
          />
          <p className="text-[10px] text-muted-foreground ml-1">Shown in full on the sidebar.</p>
        </div>

        {/* Preferred Name */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Preferred Name{' '}
            <span className="ml-1 normal-case font-normal text-muted-foreground">(topbar)</span>
          </Label>
          <Input
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.preferredName}
            placeholder="e.g. John"
            onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
          />
          <div className="flex items-center gap-1.5 ml-1">
            <Info size={10} className="text-muted-foreground flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              Topbar will show: <span className="font-bold text-foreground">{topbarPreview}</span>
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Email Address
          </Label>
          <Input
            type="email"
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.headEmail}
            onChange={(e) => setForm({ ...form, headEmail: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Phone Number
          </Label>
          <Input
            type="tel"
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.headPhone}
            onChange={(e) => setForm({ ...form, headPhone: e.target.value })}
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="h-12 px-12 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        style={{ backgroundColor: profile.primaryColor || '#0B2A4A', color: '#ffffff' }}
      >
        Save Profile
      </Button>
    </div>
  );
}
