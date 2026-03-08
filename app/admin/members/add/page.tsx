'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  Home,
  Building2,
  Globe,
  Church,
  Calendar,
  GraduationCap,
  FileText,
  Lock,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createMember, CreateMemberPayload, getMemberStats } from '@/lib/api';

const TITLES = [
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

const MARITAL_STATUSES = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'DIVORCED', label: 'Divorced' },
];

const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

const MEMBERSHIP_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'NEW_CONVERT', label: 'New Convert' },
  { value: 'VISITOR', label: 'Visitor' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const EDUCATION_LEVELS = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary/High School' },
  { value: 'TERTIARY', label: 'Tertiary/College' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
];

const BAPTISM_STATUSES = [
  { value: 'BAPTISED', label: 'Baptised' },
  { value: 'NOT_BAPTISED', label: 'Not Baptised' },
];

const DEPARTMENTS = [
  'Secretariat',
  'Treasury',
  'Deaconry',
  'Personal Ministry',
  'Sabbath School',
  'Adventist Youth',
];

const emptyForm = {
  title: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '' as '' | 'MALE' | 'FEMALE',
  date_of_birth: '',
  marital_status: '',
  national_id: '',
  emergency_contact_full_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
  phone_number: '',
  email: '',
  occupation: '',
  residential_address: '',
  city: '',
  region: '',
  custom_region: '',
  member_since: new Date().toISOString().slice(0, 10),
  membership_status: 'ACTIVE',
  education_level: '',
  baptism_status: '',
  interested_departments: [] as string[],
  admin_notes: '',
  send_credentials_via_sms: false,
  send_credentials_via_email: false,
};

type TouchedKeys = keyof Pick<
  typeof emptyForm,
  | 'title'
  | 'first_name'
  | 'last_name'
  | 'gender'
  | 'date_of_birth'
  | 'marital_status'
  | 'national_id'
  | 'emergency_contact_full_name'
  | 'emergency_contact_relationship'
  | 'emergency_contact_phone'
  | 'phone_number'
  | 'occupation'
  | 'residential_address'
  | 'city'
  | 'region'
  | 'custom_region'
  | 'education_level'
  | 'interested_departments'
>;

const REQUIRED_KEYS: TouchedKeys[] = [
  'title',
  'first_name',
  'last_name',
  'gender',
  'date_of_birth',
  'marital_status',
  'national_id',
  'emergency_contact_full_name',
  'emergency_contact_relationship',
  'emergency_contact_phone',
  'phone_number',
  'occupation',
  'residential_address',
  'city',
  'region',
  'education_level',
  'interested_departments',
];

function isFieldInvalid(
  key: TouchedKeys,
  form: typeof emptyForm,
  touched: Partial<Record<TouchedKeys, boolean>>
): boolean {
  if (!touched[key]) {
    return false;
  }
  if (key === 'custom_region') {
    return form.region === 'Other' && !form.custom_region.trim();
  }
  if (key === 'interested_departments') {
    return form.interested_departments.length === 0;
  }
  const val = form[key];
  if (typeof val === 'string') {
    return !val.trim();
  }
  return false;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<TouchedKeys, boolean>>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total_members: 0,
    new_members_this_month: 0,
    pending_approvals: 0,
    active_members: 0,
  });

  useEffect(() => {
    getMemberStats().then(setStats);
  }, []);

  const markTouched = (key: TouchedKeys) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const update = (key: keyof typeof form, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const invalid = (key: TouchedKeys) => isFieldInvalid(key, form, touched);
  const fieldClass = (key: TouchedKeys) =>
    invalid(key) ? 'border-red-500 focus:ring-red-500' : 'border-[#DDDDDD] focus:ring-blue-500';

  const toggleDepartment = (dept: string) => {
    markTouched('interested_departments');
    setForm((prev) => {
      const list = prev.interested_departments.includes(dept)
        ? prev.interested_departments.filter((d) => d !== dept)
        : [...prev.interested_departments, dept];
      return { ...prev, interested_departments: list };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const required = [
      form.title,
      form.first_name,
      form.last_name,
      form.gender,
      form.date_of_birth,
      form.marital_status,
      form.national_id,
      form.emergency_contact_full_name,
      form.emergency_contact_relationship,
      form.emergency_contact_phone,
      form.phone_number,
      form.occupation,
      form.residential_address,
      form.city,
      form.region,
      form.member_since,
      form.membership_status,
      form.education_level,
    ];
    if (required.some((v) => !v)) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.region === 'Other' && !form.custom_region.trim()) {
      setError('Please specify the region name when selecting "Other".');
      return;
    }
    if (form.interested_departments.length === 0) {
      setError('Please select at least one department.');
      return;
    }

    const payload: CreateMemberPayload = {
      title: form.title,
      first_name: form.first_name,
      middle_name: form.middle_name || undefined,
      last_name: form.last_name,
      gender: form.gender as 'MALE' | 'FEMALE',
      date_of_birth: form.date_of_birth,
      marital_status: form.marital_status as CreateMemberPayload['marital_status'],
      national_id: form.national_id,
      phone_number: form.phone_number,
      email: form.email || undefined,
      occupation: form.occupation,
      residential_address: form.residential_address,
      city: form.city,
      region: form.region,
      custom_region: form.region === 'Other' ? form.custom_region : undefined,
      emergency_contact: {
        full_name: form.emergency_contact_full_name,
        relationship: form.emergency_contact_relationship,
        phone_number: form.emergency_contact_phone,
      },
      member_since: form.member_since,
      membership_status: form.membership_status as CreateMemberPayload['membership_status'],
      baptism_status: form.baptism_status as CreateMemberPayload['baptism_status'] | undefined,
      education_level: form.education_level as CreateMemberPayload['education_level'],
      interested_departments: form.interested_departments,
      admin_notes: form.admin_notes || undefined,
      send_credentials_via_email: form.send_credentials_via_email,
      send_credentials_via_sms: form.send_credentials_via_sms,
    };

    setSubmitting(true);
    try {
      await createMember(payload);
      router.push('/admin/members');
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.push('/admin/members');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <h1
            style={{
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 600,
              fontSize: '24px',
              lineHeight: '100%',
              letterSpacing: 0,
              color: '#0B2A4A',
            }}
          >
            Add New Member
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '100%',
              letterSpacing: 0,
              color: '#666666',
            }}
          >
            Administrative panel for member registration
          </p>
        </div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 shrink-0 ml-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.total_members.toLocaleString() },
          { label: 'New Members This Month', value: stats.new_members_this_month.toLocaleString() },
          { label: 'Pending Approvals', value: stats.pending_approvals.toLocaleString() },
          {
            label: 'Active this Month',
            value: stats.active_members.toLocaleString(),
            highlight: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 flex flex-col justify-center items-start"
            style={{
              borderRadius: 15,
              borderLeft: '5px solid #0B2A4A',
              background: '#F8FAFC',
            }}
          >
            <p className="text-xs font-bold text-[#717171]">{stat.label}</p>
            <p
              className="mt-1 text-2xl font-bold"
              style={{ color: stat.highlight ? '#116CC9' : '#0B2A4A' }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="w-full max-w-full space-y-0">
        <div
          className="flex items-center justify-between text-white w-full"
          style={{
            height: 67,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            padding: '20px 30px',
            background: '#0B2A4A',
            marginBottom: 38,
          }}
        >
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'OV Soge, sans-serif' }}>
            Member Registration Form
          </h2>
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
            <Shield className="h-4 w-4" />
            Administrative Access Required
          </span>
        </div>

        {error && <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="block w-full">
          <div
            className="w-full grid overflow-hidden"
            style={{
              gridTemplateColumns: '638px minmax(394px, 1fr)',
              gridTemplateRows: 'auto auto 1fr',
              gap: '0 24px',
              minHeight: 1005,
              marginLeft: 25,
              marginRight: 25,
            }}
          >
            {/* Row 1 left: Personal Information */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA] rounded-tl-[10px]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <User className="h-5 w-5 text-gray-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <select
                        value={form.title}
                        onChange={(e) => update('title', e.target.value)}
                        onBlur={() => markTouched('title')}
                        className={`h-9 w-full rounded-none border px-3 text-sm focus:ring-2 outline-none ${fieldClass('title')}`}
                      >
                        <option value="">Select title</option>
                        {TITLES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {invalid('title') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                    <div className="space-y-2" onBlur={() => markTouched('gender')}>
                      <Label>Gender *</Label>
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="MALE"
                            checked={form.gender === 'MALE'}
                            onChange={() => update('gender', 'MALE')}
                            className="rounded-none"
                          />
                          <span className="text-sm">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="FEMALE"
                            checked={form.gender === 'FEMALE'}
                            onChange={() => update('gender', 'FEMALE')}
                            className="rounded-none"
                          />
                          <span className="text-sm">Female</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={(e) => update('first_name', e.target.value)}
                        onBlur={() => markTouched('first_name')}
                        className={`pl-9 ${invalid('first_name') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {invalid('first_name') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Middle Name</Label>
                      <Input
                        placeholder="Middle Name"
                        value={form.middle_name}
                        onChange={(e) => update('middle_name', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={(e) => update('last_name', e.target.value)}
                        onBlur={() => markTouched('last_name')}
                        className={`pl-9 ${invalid('last_name') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {invalid('last_name') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => update('date_of_birth', e.target.value)}
                        onBlur={() => markTouched('date_of_birth')}
                        className={`pl-9 ${invalid('date_of_birth') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {invalid('date_of_birth') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Marital Status *</Label>
                      <select
                        value={form.marital_status}
                        onChange={(e) => update('marital_status', e.target.value)}
                        onBlur={() => markTouched('marital_status')}
                        className={`h-9 w-full rounded-none border px-3 text-sm focus:ring-2 outline-none ${fieldClass('marital_status')}`}
                      >
                        <option value="">Marital Status</option>
                        {MARITAL_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {invalid('marital_status') && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>National ID Number *</Label>
                      <Input
                        placeholder="National ID"
                        value={form.national_id}
                        onChange={(e) => update('national_id', e.target.value)}
                        onBlur={() => markTouched('national_id')}
                        className={`pl-9 ${invalid('national_id') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {invalid('national_id') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Row 1 right: Emergency Contact */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA] rounded-tr-[10px]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <User className="h-5 w-5 text-gray-600" />
                  Emergency Contact
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="Full Name"
                      value={form.emergency_contact_full_name}
                      onChange={(e) => update('emergency_contact_full_name', e.target.value)}
                      onBlur={() => markTouched('emergency_contact_full_name')}
                      className={`pl-9 ${invalid('emergency_contact_full_name') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {invalid('emergency_contact_full_name') && (
                      <p className="text-xs text-red-600">Required</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship *</Label>
                    <select
                      value={form.emergency_contact_relationship}
                      onChange={(e) => update('emergency_contact_relationship', e.target.value)}
                      onBlur={() => markTouched('emergency_contact_relationship')}
                      className={`h-9 w-full rounded-none border px-3 text-sm focus:ring-2 outline-none ${fieldClass('emergency_contact_relationship')}`}
                    >
                      <option value="">Select Relationship</option>
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {invalid('emergency_contact_relationship') && (
                      <p className="text-xs text-red-600">Required</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      placeholder="Phone Number"
                      value={form.emergency_contact_phone}
                      onChange={(e) => update('emergency_contact_phone', e.target.value)}
                      onBlur={() => markTouched('emergency_contact_phone')}
                      className={`pl-9 ${invalid('emergency_contact_phone') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {invalid('emergency_contact_phone') && (
                      <p className="text-xs text-red-600">Required</p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Row 2 left: Contact Information */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Phone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="+233 596 038 258"
                          value={form.phone_number}
                          onChange={(e) => update('phone_number', e.target.value)}
                          onBlur={() => markTouched('phone_number')}
                          className={`pl-9 ${invalid('phone_number') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                      </div>
                      {invalid('phone_number') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="opendoor@gmail.com"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Occupation *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Senior Pastor"
                          value={form.occupation}
                          onChange={(e) => update('occupation', e.target.value)}
                          onBlur={() => markTouched('occupation')}
                          className={`pl-9 ${invalid('occupation') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                      </div>
                      {invalid('occupation') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Residential Address *</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Street Address"
                          value={form.residential_address}
                          onChange={(e) => update('residential_address', e.target.value)}
                          onBlur={() => markTouched('residential_address')}
                          className={`pl-9 ${invalid('residential_address') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                      </div>
                      {invalid('residential_address') && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => update('city', e.target.value)}
                          onBlur={() => markTouched('city')}
                          className={`pl-9 ${invalid('city') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                      </div>
                      {invalid('city') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Region *</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={form.region}
                          onChange={(e) => update('region', e.target.value)}
                          onBlur={() => markTouched('region')}
                          className={`h-9 w-full rounded-none border pl-9 pr-3 text-sm focus:ring-2 outline-none ${fieldClass('region')}`}
                        >
                          <option value="">Select Region</option>
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      {invalid('region') && <p className="text-xs text-red-600">Required</p>}
                    </div>
                    {form.region === 'Other' && (
                      <div className="space-y-2 col-span-3">
                        <Label>Specify Region Name *</Label>
                        <Input
                          placeholder="Enter region name"
                          value={form.custom_region}
                          onChange={(e) => update('custom_region', e.target.value)}
                          onBlur={() => markTouched('custom_region')}
                          className={`pl-9 ${invalid('custom_region') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                        {invalid('custom_region') && (
                          <p className="text-xs text-red-600">Required when Region is Other</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Row 2 right: System Access */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Lock className="h-5 w-5 text-gray-600" />
                  System Access
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Username</span>
                      <span className="text-xs font-normal text-gray-500">Auto-generated</span>
                    </Label>
                    <Input readOnly placeholder="username" className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-xs font-normal text-gray-500">Auto-generated</span>
                    </Label>
                    <Input type="password" readOnly value="••••••••••••" className="bg-gray-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={form.send_credentials_via_sms}
                        onChange={(e) => update('send_credentials_via_sms', e.target.checked)}
                        className="rounded-none border border-[#DDDDDD]"
                      />
                      Send credentials via SMS
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={form.send_credentials_via_email}
                        onChange={(e) => update('send_credentials_via_email', e.target.checked)}
                        className="rounded-none border border-[#DDDDDD]"
                      />
                      Send credentials via Email
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* Row 3 left: Church Information */}
            <div className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] bg-[#F8F9FA] rounded-bl-[10px] min-h-0">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Church className="h-5 w-5 text-gray-600" />
                  Church Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Member Since *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={form.member_since}
                          onChange={(e) => update('member_since', e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Membership Status *</Label>
                      <select
                        value={form.membership_status}
                        onChange={(e) => update('membership_status', e.target.value)}
                        className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {MEMBERSHIP_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Educational Level *</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={form.education_level}
                          onChange={(e) => update('education_level', e.target.value)}
                          onBlur={() => markTouched('education_level')}
                          className={`h-9 w-full rounded-none border pl-9 pr-3 text-sm focus:ring-2 outline-none ${fieldClass('education_level')}`}
                        >
                          <option value="">Select Education</option>
                          {EDUCATION_LEVELS.map((e) => (
                            <option key={e.value} value={e.value}>
                              {e.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {invalid('education_level') && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Are you Baptized</Label>
                    <select
                      value={form.baptism_status}
                      onChange={(e) => update('baptism_status', e.target.value)}
                      className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Status</option>
                      {BAPTISM_STATUSES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2" onBlur={() => markTouched('interested_departments')}>
                    <Label>Department Interest *</Label>
                    <div className="flex flex-wrap gap-2">
                      {DEPARTMENTS.map((dept) => {
                        const selected = form.interested_departments.includes(dept);
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => toggleDepartment(dept)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-sm transition-colors ${
                              selected
                                ? 'border-[#0B2A4A] bg-[#0B2A4A] text-white'
                                : 'border-[#DDDDDD] hover:bg-gray-50'
                            }`}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {dept}
                          </button>
                        );
                      })}
                    </div>
                    {form.interested_departments.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Selected: {form.interested_departments.join(', ')}
                      </p>
                    )}
                    {invalid('interested_departments') && (
                      <p className="text-xs text-red-600">Select at least one department</p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Row 3 right: Admin Notes */}
            <div className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] bg-[#F8F9FA] rounded-br-[10px] min-h-0">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Admin Notes
                </h3>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <textarea
                    value={form.admin_notes}
                    onChange={(e) => update('admin_notes', e.target.value)}
                    className="min-h-[80px] w-full rounded-none border border-[#DDDDDD] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Notes visible to only administrators....."
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              className="text-red-600 border-gray-300"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#0B2A4A] hover:bg-[#0B2A4A]/90 text-white disabled:opacity-50"
              style={{ fontFamily: 'OV Soge, sans-serif' }}
            >
              <User className="h-4 w-4 mr-2" />
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
