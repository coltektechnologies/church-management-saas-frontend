'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MemberDetail } from '@/lib/api';
import { updateCurrentMemberProfile } from '@/lib/api';
import { sanitizePersonNameInput } from '@/lib/signupValidation';
import { Loader2 } from 'lucide-react';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

const MARITAL = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'DIVORCED', label: 'Divorced' },
];

const EDUCATION = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary / High School' },
  { value: 'TERTIARY', label: 'Tertiary / College' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
];

const BAPTISM = [
  { value: 'BAPTISED', label: 'Baptised' },
  { value: 'NOT_BAPTISED', label: 'Not baptised' },
];

const NOTIFY = [
  { value: 'NONE', label: 'No notifications' },
  { value: 'EMAIL', label: 'Email only' },
  { value: 'SMS', label: 'SMS only' },
  { value: 'BOTH', label: 'Email and SMS' },
];

function isoDateToInput(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const d = String(iso).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}

function emptyLoc(m: MemberDetail | null) {
  const loc = m?.location;
  return {
    phone_primary: loc?.phone_primary ?? '',
    phone_secondary: loc?.phone_secondary ?? '',
    email: loc?.email ?? '',
    address: loc?.address ?? '',
    city: loc?.city ?? '',
    region: loc?.region ?? '',
    country: loc?.country ?? '',
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberDetail | null;
  onSaved: (m: MemberDetail) => void;
};

export default function MemberProfileEditDialog({ open, onOpenChange, member, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [first_name, setFirstName] = useState('');
  const [middle_name, setMiddleName] = useState('');
  const [last_name, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [date_of_birth, setDateOfBirth] = useState('');
  const [marital_status, setMaritalStatus] = useState('');
  const [national_id, setNationalId] = useState('');
  const [education_level, setEducationLevel] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employer, setEmployer] = useState('');
  const [baptism_status, setBaptismStatus] = useState('');
  const [notification_preference, setNotificationPreference] = useState('EMAIL');
  const [loc, setLoc] = useState(emptyLoc(null));
  const [emergency_contact_name, setEmergencyName] = useState('');
  const [emergency_contact_relationship, setEmergencyRel] = useState('');
  const [emergency_contact_phone, setEmergencyPhone] = useState('');

  useEffect(() => {
    if (!open || !member) {
      return;
    }
    setFirstName(member.first_name ?? '');
    setMiddleName(member.middle_name ?? '');
    setLastName(member.last_name ?? '');
    setGender(member.gender ?? '');
    setDateOfBirth(isoDateToInput(member.date_of_birth));
    setMaritalStatus(member.marital_status ?? '');
    setNationalId(member.national_id ?? '');
    setEducationLevel(member.education_level ?? '');
    setOccupation(member.occupation ?? '');
    setEmployer(member.employer ?? '');
    setBaptismStatus(member.baptism_status ?? '');
    setNotificationPreference(member.notification_preference ?? 'EMAIL');
    setLoc(emptyLoc(member));
    setEmergencyName(member.emergency_contact_name ?? '');
    setEmergencyRel(member.emergency_contact_relationship ?? '');
    setEmergencyPhone(member.emergency_contact_phone ?? '');
    setError(null);
  }, [open, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        first_name: first_name.trim(),
        middle_name: middle_name.trim() || undefined,
        last_name: last_name.trim(),
        gender: gender || undefined,
        date_of_birth: date_of_birth || undefined,
        marital_status: marital_status || undefined,
        national_id: national_id.trim() || undefined,
        education_level: education_level || undefined,
        occupation: occupation.trim() || undefined,
        employer: employer.trim() || undefined,
        baptism_status: baptism_status || undefined,
        notification_preference: notification_preference || 'EMAIL',
        emergency_contact_name: emergency_contact_name.trim() || undefined,
        emergency_contact_relationship: emergency_contact_relationship.trim() || undefined,
        emergency_contact_phone: emergency_contact_phone.trim() || undefined,
        location: {
          phone_primary: loc.phone_primary.trim() || '-',
          phone_secondary: loc.phone_secondary.trim() || undefined,
          email: loc.email.trim() || undefined,
          address: loc.address.trim() || '-',
          city: loc.city.trim() || undefined,
          region: loc.region.trim() || undefined,
          country: loc.country.trim() || undefined,
        },
      };
      const updated = await updateCurrentMemberProfile(payload);
      onSaved(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-900">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#0A2E46]">Personal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-first">First name</Label>
                <Input
                  id="m-first"
                  value={first_name}
                  onChange={(e) => setFirstName(sanitizePersonNameInput(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-middle">Middle name</Label>
                <Input
                  id="m-middle"
                  value={middle_name}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-last">Last name</Label>
                <Input
                  id="m-last"
                  value={last_name}
                  onChange={(e) => setLastName(sanitizePersonNameInput(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-gender">Gender</Label>
                <select
                  id="m-gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">—</option>
                  {GENDERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-dob">Date of birth</Label>
                <Input
                  id="m-dob"
                  type="date"
                  value={date_of_birth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-marital">Marital status</Label>
                <select
                  id="m-marital"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={marital_status}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                >
                  <option value="">—</option>
                  {MARITAL.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-nid">National ID</Label>
                <Input
                  id="m-nid"
                  value={national_id}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-edu">Education</Label>
                <select
                  id="m-edu"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={education_level}
                  onChange={(e) => setEducationLevel(e.target.value)}
                >
                  <option value="">—</option>
                  {EDUCATION.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-occ">Occupation</Label>
                <Input
                  id="m-occ"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-emp">Employer</Label>
                <Input id="m-emp" value={employer} onChange={(e) => setEmployer(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-bap">Baptism</Label>
                <select
                  id="m-bap"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={baptism_status}
                  onChange={(e) => setBaptismStatus(e.target.value)}
                >
                  <option value="">—</option>
                  {BAPTISM.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-notify">Notifications</Label>
                <select
                  id="m-notify"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={notification_preference}
                  onChange={(e) => setNotificationPreference(e.target.value)}
                >
                  {NOTIFY.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#0A2E46]">Contact & address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-phone">Phone</Label>
                <Input
                  id="m-phone"
                  value={loc.phone_primary}
                  onChange={(e) => setLoc((s) => ({ ...s, phone_primary: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-phone2">Phone (alternate)</Label>
                <Input
                  id="m-phone2"
                  value={loc.phone_secondary}
                  onChange={(e) => setLoc((s) => ({ ...s, phone_secondary: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="m-email">Email</Label>
                <Input
                  id="m-email"
                  type="email"
                  value={loc.email}
                  onChange={(e) => setLoc((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="m-addr">Address</Label>
                <Input
                  id="m-addr"
                  value={loc.address}
                  onChange={(e) => setLoc((s) => ({ ...s, address: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-city">City</Label>
                <Input
                  id="m-city"
                  value={loc.city}
                  onChange={(e) => setLoc((s) => ({ ...s, city: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-region">Region / state</Label>
                <Input
                  id="m-region"
                  value={loc.region}
                  onChange={(e) => setLoc((s) => ({ ...s, region: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-country">Country</Label>
                <Input
                  id="m-country"
                  value={loc.country}
                  onChange={(e) => setLoc((s) => ({ ...s, country: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#0A2E46]">Emergency contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-en">Name</Label>
                <Input
                  id="m-en"
                  value={emergency_contact_name}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-er">Relationship</Label>
                <Input
                  id="m-er"
                  value={emergency_contact_relationship}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="m-ep">Phone</Label>
                <Input
                  id="m-ep"
                  value={emergency_contact_phone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !member}
              className="bg-[#2FC4B2] hover:bg-[#28b0a0] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
