'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Church, FileText, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getMember, updateMember, type MemberDetail } from '@/lib/api';
import { toast } from 'sonner';
import { useMembersPortal } from '@/components/admin/membership/MembersPortalContext';
import {
  parseEmergencyContactFromNotes,
  stripEmergencyContactBlockFromNotes,
} from '@/lib/memberNotesDisplay';

const TITLES = [
  { value: '', label: 'Select title' },
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Rev', label: 'Rev' },
  { value: 'Pastor', label: 'Pastor' },
  { value: 'Elder', label: 'Elder' },
  { value: 'Deacon', label: 'Deacon' },
  { value: 'Deaconess', label: 'Deaconess' },
];

const REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono East',
  'Bono',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western North',
  'Western',
  'Other',
];

const MARITAL = [
  { value: '', label: 'Select' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'DIVORCED', label: 'Divorced' },
];

const MEMBERSHIP = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'NEW_CONVERT', label: 'New Convert' },
  { value: 'VISITOR', label: 'Visitor' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const EDUCATION = [
  { value: '', label: 'Select' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary / High School' },
  { value: 'TERTIARY', label: 'Tertiary / College' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
];

const BAPTISM = [
  { value: '', label: 'Select' },
  { value: 'BAPTISED', label: 'Baptised' },
  { value: 'NOT_BAPTISED', label: 'Not baptised' },
];

const NOTIFY_PREF = [
  { value: 'EMAIL', label: 'Email only' },
  { value: 'SMS', label: 'SMS only' },
  { value: 'BOTH', label: 'Email and SMS' },
  { value: 'NONE', label: 'None' },
];

type FormState = {
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE' | '';
  date_of_birth: string;
  marital_status: string;
  national_id: string;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  address: string;
  city: string;
  region: string;
  custom_region: string;
  country: string;
  member_since: string;
  membership_status: string;
  baptism_status: string;
  education_level: string;
  occupation: string;
  employer: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  notes: string;
  notification_preference: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  title: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  marital_status: '',
  national_id: '',
  phone_primary: '',
  phone_secondary: '',
  email: '',
  address: '',
  city: '',
  region: '',
  custom_region: '',
  country: '',
  member_since: '',
  membership_status: 'ACTIVE',
  baptism_status: '',
  education_level: '',
  occupation: '',
  employer: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  notes: '',
  notification_preference: 'EMAIL',
  is_active: true,
};

function sliceDate(v: string | null | undefined): string {
  if (!v) {
    return '';
  }
  return v.slice(0, 10);
}

function memberToForm(m: MemberDetail): FormState {
  const loc = m.location || {};
  const regionVal = (loc.region as string) || '';
  const known = REGIONS.filter((r) => r !== 'Other');
  const isCustom = regionVal && !known.includes(regionVal);
  return {
    title: m.title || '',
    first_name: m.first_name || '',
    middle_name: m.middle_name || '',
    last_name: m.last_name || '',
    gender: (m.gender as 'MALE' | 'FEMALE') || '',
    date_of_birth: sliceDate(m.date_of_birth),
    marital_status: m.marital_status || '',
    national_id: m.national_id || '',
    phone_primary: loc.phone_primary || '',
    phone_secondary: loc.phone_secondary || '',
    email: (loc.email as string) || '',
    address: loc.address || '',
    city: loc.city || '',
    region: isCustom ? 'Other' : regionVal,
    custom_region: isCustom ? regionVal : '',
    country: loc.country || '',
    member_since: sliceDate(m.member_since),
    membership_status: m.membership_status || 'ACTIVE',
    baptism_status: m.baptism_status || '',
    education_level: m.education_level || '',
    occupation: m.occupation || '',
    employer: m.employer || '',
    emergency_contact_name: m.emergency_contact_name || '',
    emergency_contact_phone: m.emergency_contact_phone || '',
    emergency_contact_relationship: m.emergency_contact_relationship || '',
    notes: m.notes || '',
    notification_preference: m.notification_preference || 'EMAIL',
    is_active: m.is_active !== false,
  };
}

function buildUpdatePayload(form: FormState): Record<string, unknown> {
  const region = form.region === 'Other' ? form.custom_region.trim() || null : form.region || null;
  return {
    title: form.title.trim() || null,
    first_name: form.first_name.trim(),
    middle_name: form.middle_name.trim() || null,
    last_name: form.last_name.trim(),
    gender: form.gender || 'MALE',
    date_of_birth: form.date_of_birth || null,
    marital_status: form.marital_status || null,
    national_id: form.national_id.trim() || null,
    membership_status: form.membership_status,
    member_since: form.member_since,
    baptism_status: form.baptism_status || null,
    education_level: form.education_level || null,
    occupation: form.occupation.trim() || null,
    employer: form.employer.trim() || null,
    emergency_contact_name: form.emergency_contact_name.trim() || null,
    emergency_contact_phone: form.emergency_contact_phone.trim() || null,
    emergency_contact_relationship: form.emergency_contact_relationship.trim() || null,
    notes: form.notes.trim() || null,
    notification_preference: form.notification_preference,
    is_active: form.is_active,
    location: {
      phone_primary: form.phone_primary.trim(),
      phone_secondary: form.phone_secondary.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim(),
      city: form.city.trim() || null,
      region,
      country: form.country.trim() || null,
    },
  };
}

function CardSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const { memberProfilePresentation = 'default' } = useMembersPortal();
  if (memberProfilePresentation === 'department') {
    return (
      <div className="rounded-2xl border border-stone-200/90 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-gradient-to-r from-emerald-50/50 via-white to-stone-50/70">
          <Icon className="h-4 w-4 text-emerald-900/50 shrink-0" />
          <span className="text-sm font-semibold text-stone-800 tracking-tight">{title}</span>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    );
  }
  return (
    <div
      className="rounded-xl border overflow-hidden bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 text-white text-sm font-semibold"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <Icon className="h-4 w-4 opacity-90" />
        {title}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

const inputClass =
  'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] rounded-md';

export default function MemberEditPage() {
  const router = useRouter();
  const {
    membersBasePath,
    memberProfilePresentation = 'default',
    hideMemberLifecycleControls,
  } = useMembersPortal();
  const isDept = memberProfilePresentation === 'department';
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError('');
    getMember(id)
      .then((m) => {
        if (!m) {
          setError('Member not found');
          return;
        }
        const base = memberToForm(m);
        const parsed = parseEmergencyContactFromNotes(m.notes || '');
        if (parsed) {
          if (!base.emergency_contact_name.trim()) {
            base.emergency_contact_name = parsed.name;
          }
          if (!base.emergency_contact_relationship.trim()) {
            base.emergency_contact_relationship = parsed.relationship;
          }
          if (!base.emergency_contact_phone.trim()) {
            base.emergency_contact_phone = parsed.phone;
          }
        }
        base.notes = stripEmergencyContactBlockFromNotes(base.notes);
        setForm(base);
      })
      .catch(() => setError('Failed to load member'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error('First and last name are required');
      return;
    }
    if (!form.phone_primary.trim() || !form.address.trim()) {
      toast.error('Phone and address are required');
      return;
    }
    if (!form.member_since) {
      toast.error('Member since date is required');
      return;
    }
    if (form.region === 'Other' && !form.custom_region.trim()) {
      toast.error('Enter a region name when using Other');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = buildUpdatePayload(form);
      await updateMember(id, payload as unknown as Partial<MemberDetail>);
      toast.success('Member updated', { description: 'Your changes were saved.' });
      router.push(`${membersBasePath}/${id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      setError(msg);
      toast.error('Could not save member', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex min-h-[320px] items-center justify-center ${isDept ? 'text-stone-500' : 'text-[var(--admin-text-muted)]'}`}
      >
        Loading member...
      </div>
    );
  }

  if (error && !form.first_name && !form.last_name) {
    return (
      <div className="space-y-4">
        <Link
          href={membersBasePath}
          className="inline-flex items-center gap-2 text-sm text-[var(--admin-text-muted)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
        <div
          className="rounded-lg border p-6 text-center"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
        >
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pb-12 ${isDept ? 'max-w-5xl' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`${membersBasePath}/${id}`}
            className={`mb-2 inline-flex items-center gap-2 text-sm hover:underline ${isDept ? 'text-stone-500' : 'text-[var(--admin-text-muted)]'}`}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Member
          </Link>
          <h1
            className={`text-2xl font-bold ${isDept ? 'text-stone-900 font-semibold tracking-tight' : 'text-[var(--admin-text)]'}`}
          >
            {isDept ? 'Update member details' : 'Edit Member'}
          </h1>
          <p
            className={`mt-1 text-sm leading-relaxed max-w-xl ${isDept ? 'text-stone-500' : 'text-[var(--admin-text-muted)]'}`}
          >
            {isDept
              ? 'Keep contact and fellowship information accurate. Account access and official notices are managed by the church office.'
              : 'Update profile, contact, and membership details.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="border-[var(--admin-border)]"
            onClick={() => router.push(`${membersBasePath}/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="member-edit-form"
            className="text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form id="member-edit-form" onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CardSection title="Personal information" icon={User}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                >
                  {TITLES.map((t) => (
                    <option key={t.value || 'none'} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <div className="flex gap-4 pt-2">
                  {(['MALE', 'FEMALE'] as const).map((g) => (
                    <label key={g} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="gender"
                        checked={form.gender === g}
                        onChange={() => update('gender', g)}
                      />
                      {g === 'MALE' ? 'Male' : 'Female'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>First name *</Label>
                <Input
                  className={inputClass}
                  value={form.first_name}
                  onChange={(e) => update('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Middle name</Label>
                <Input
                  className={inputClass}
                  value={form.middle_name}
                  onChange={(e) => update('middle_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last name *</Label>
                <Input
                  className={inputClass}
                  value={form.last_name}
                  onChange={(e) => update('last_name', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  className={inputClass}
                  value={form.date_of_birth}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Marital status</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.marital_status}
                  onChange={(e) => update('marital_status', e.target.value)}
                >
                  {MARITAL.map((o) => (
                    <option key={o.value || 'x'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>National ID</Label>
              <Input
                className={inputClass}
                value={form.national_id}
                onChange={(e) => update('national_id', e.target.value)}
              />
            </div>
          </CardSection>

          <CardSection title="Contact & location" icon={Phone}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary phone *</Label>
                <Input
                  className={inputClass}
                  value={form.phone_primary}
                  onChange={(e) => update('phone_primary', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary phone</Label>
                <Input
                  className={inputClass}
                  value={form.phone_secondary}
                  onChange={(e) => update('phone_secondary', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Residential address *</Label>
              <Textarea
                className={`min-h-[80px] ${inputClass}`}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.region}
                  onChange={(e) => update('region', e.target.value)}
                >
                  <option value="">Select region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  className={inputClass}
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                />
              </div>
            </div>
            {form.region === 'Other' ? (
              <div className="space-y-2">
                <Label>Custom region *</Label>
                <Input
                  className={inputClass}
                  value={form.custom_region}
                  onChange={(e) => update('custom_region', e.target.value)}
                  placeholder="Enter region"
                />
              </div>
            ) : null}
          </CardSection>

          <CardSection title="Church & professional" icon={Church}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Member since *</Label>
                <Input
                  type="date"
                  className={inputClass}
                  value={form.member_since}
                  onChange={(e) => update('member_since', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Membership status</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.membership_status}
                  onChange={(e) => update('membership_status', e.target.value)}
                >
                  {MEMBERSHIP.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Baptism status</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.baptism_status}
                  onChange={(e) => update('baptism_status', e.target.value)}
                >
                  {BAPTISM.map((o) => (
                    <option key={o.value || 'b'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Education level</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.education_level}
                  onChange={(e) => update('education_level', e.target.value)}
                >
                  {EDUCATION.map((o) => (
                    <option key={o.value || 'e'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input
                  className={inputClass}
                  value={form.occupation}
                  onChange={(e) => update('occupation', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Employer</Label>
                <Input
                  className={inputClass}
                  value={form.employer}
                  onChange={(e) => update('employer', e.target.value)}
                />
              </div>
            </div>
          </CardSection>

          <CardSection title={isDept ? 'In case of emergency' : 'Emergency contact'} icon={Shield}>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                className={inputClass}
                value={form.emergency_contact_name}
                onChange={(e) => update('emergency_contact_name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  className={inputClass}
                  value={form.emergency_contact_relationship}
                  onChange={(e) => update('emergency_contact_relationship', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  className={inputClass}
                  value={form.emergency_contact_phone}
                  onChange={(e) => update('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>
          </CardSection>
        </div>

        {hideMemberLifecycleControls ? (
          <CardSection title="Notes" icon={FileText}>
            <p
              className={`text-xs leading-relaxed -mt-1 mb-1 ${isDept ? 'text-stone-500' : 'text-[var(--admin-text-muted)]'}`}
            >
              Optional. Duplicate emergency-contact lines in notes are discouraged; use the section
              above. Official messaging preferences and login access are set by church
              administration.
            </p>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                className={`min-h-[100px] ${inputClass}`}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Pastoral or department context…"
              />
            </div>
          </CardSection>
        ) : (
          <CardSection title="Preferences & notes" icon={FileText}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Notification preference</Label>
                <select
                  className={`h-10 w-full px-3 text-sm ${inputClass}`}
                  value={form.notification_preference}
                  onChange={(e) => update('notification_preference', e.target.value)}
                >
                  {NOTIFY_PREF.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  id="is_active"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--admin-border)]"
                  checked={form.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                />
                <Label htmlFor="is_active" className="cursor-pointer font-normal">
                  Member account active
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                className={`min-h-[100px] ${inputClass}`}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Internal notes..."
              />
            </div>
          </CardSection>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-[var(--admin-border)]"
            onClick={() => router.push(`${membersBasePath}/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
