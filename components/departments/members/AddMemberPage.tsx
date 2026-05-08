'use client';

/**
 * AddMemberPage.tsx
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  User,
  Phone,
  Building2,
  ShieldCheck,
  FileText,
  UserPlus,
  Save,
  XCircle,
  Lock,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import type { DepartmentMember, MemberRole, MemberStatus } from './membersDummyData';
import { ALL_DEPARTMENTS } from './membersDummyData';
import MemberRegistrationSuccess from './MemberRegistrationSuccess';
import {
  sanitizeAlphanumericIdInput,
  sanitizeCityNameInput,
  sanitizeNoDigits,
  sanitizePersonNameInput,
  sanitizePhoneStripLetters,
  isValidSignupEmail,
} from '@/lib/signupValidation';

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateMemberId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `SDA${year}-${num}`;
}

function generateUsername(first: string, last: string): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}`.replace(/[^a-z.]/g, '');
}

/**
 * Phone validation:
 * – Required
 * – Must contain at least 7 digits
 * – Only allows +, digits, spaces, hyphens, dots, parentheses
 */
function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && /^[+\d\s\-().]+$/.test(trimmed);
}

function isValidEmail(value: string): boolean {
  if (!value.trim()) {
    return true;
  }
  return isValidSignupEmail(value.trim());
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  gender: 'Male' | 'Female' | '';
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  maritalStatus: string;
  nationalId: string;
  phone: string;
  email: string;
  occupation: string;
  address: string;
  city: string;
  region: string;
  memberSince: string;
  membershipStatus: MemberStatus | '';
  educationalLevel: string;
  baptized: string;
  departments: string[];
  skills: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  username: string;
  adminNotes: string;
  role: MemberRole;
}

const EMPTY_FORM: FormState = {
  title: '',
  gender: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  maritalStatus: '',
  nationalId: '',
  phone: '',
  email: '',
  occupation: '',
  address: '',
  city: '',
  region: '',
  memberSince: new Date().toISOString().slice(0, 10),
  membershipStatus: '',
  educationalLevel: '',
  baptized: '',
  departments: [],
  skills: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  username: '',
  adminNotes: '',
  role: 'Member',
};

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Rev.', 'Elder', 'Bro.', 'Sis.', 'Ps.'];
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed'];
const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong-Ahafo',
  'Oti',
  'Savannah',
  'Ahafo',
  'Bono East',
  'North East',
  'Western North',
];
const EDU_LEVELS = [
  'Primary',
  'JHS / O-Level',
  'SHS / A-Level',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Professional Cert',
  'Other',
];
const RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Colleague', 'Other'];
const ROLES: MemberRole[] = ['Member', 'Departmental Head', 'Core Admin', 'Admin'];

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider({ color }: { color: string }) {
  return <div style={{ height: '1px', background: color, margin: '20px 0' }} />;
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  accent,
  text,
}: {
  icon: React.ElementType;
  label: string;
  accent: string;
  text: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: `${accent}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '15px', color: text, margin: 0 }}>{label}</h3>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'info' | 'draft' | 'error';

function Toast({ msg, type, onClose }: { msg: string; type: ToastType; onClose: () => void }) {
  const bg =
    type === 'success'
      ? '#10B981'
      : type === 'draft'
        ? '#F59E0B'
        : type === 'error'
          ? '#EF4444'
          : '#6366F1';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        background: bg,
        color: '#fff',
        borderRadius: '10px',
        padding: '14px 22px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: `0 8px 32px ${bg}66`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideUp 0.25s ease',
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AddMemberPageProps {
  onSubmit: (data: Omit<DepartmentMember, 'id'>) => void;
  onSaveDraft: (data: Omit<DepartmentMember, 'id'>) => void;
  onCancel: () => void; // closes the form / navigates back to list
  editMember?: DepartmentMember | null;
  addedByName?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddMemberPage({
  onSubmit,
  onSaveDraft,
  onCancel,
  editMember,
  addedByName = 'Department Head',
}: AddMemberPageProps) {
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();
  const router = useRouter();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const primary = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const accent = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  // ── Dark-mode-aware colour tokens (mirroring MemberRegistrationSuccess) ────
  const pageBg = isDark
    ? isReady
      ? profile.darkBackgroundColor || '#0A1628'
      : '#0A1628'
    : '#F5F7FA';
  const outerCardBg = isDark
    ? isReady
      ? profile.darkSidebarColor || '#0D1F36'
      : '#0D1F36'
    : '#FFFFFF';
  const outerBorder = isDark ? 'rgba(255,255,255,0.08)' : 'transparent';
  const outerShadow = isDark
    ? `0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px ${primary}40`
    : '0 2px 16px rgba(0,0,0,0.08)';

  const leftCardBg = isDark
    ? isReady
      ? profile.darkSidebarColor || '#0D1F36'
      : '#0D1F36'
    : '#F8F9FA';
  const rightCardBg = isDark ? `${primary}18` : '#FFFFFF';
  const rightBorder = isDark ? `1px solid ${primary}40` : '1px solid #DDDDDD';

  const text = isDark ? '#F1F5F9' : '#111827';
  const muted = isDark ? 'rgba(241,245,249,0.45)' : '#9CA3AF';
  const dividerClr = isDark ? 'rgba(255,255,255,0.08)' : '#DDDDDD';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : '#D1D5DB';
  const inputText = isDark ? '#F1F5F9' : '#111827';
  const labelColor = isDark ? 'rgba(241,245,249,0.70)' : '#374151';
  const readonlyBg = isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6';

  // ── Success screen: when non-null, render MemberRegistrationSuccess ────────
  const [successData, setSuccessData] = useState<{ memberId: string; memberName: string } | null>(
    null
  );

  // ── Toast state ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  // ── Toast auto-dismiss ─────────────────────────────────────────────────────
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback(
    (msg: string, type: ToastType, afterMs?: number, afterFn?: () => void) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ msg, type });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        if (afterFn) {
          afterFn();
        }
      }, afterMs ?? 3200);
    },
    []
  );

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(null);
  }, []);

  // ── Derive initial form ────────────────────────────────────────────────────
  const initialForm = useMemo<FormState>(() => {
    if (editMember) {
      const parts = editMember.name.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';
      const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
      return {
        ...EMPTY_FORM,
        firstName,
        middleName,
        lastName,
        phone: editMember.phone,
        email: editMember.email,
        memberSince: editMember.memberSince,
        departments: editMember.departments,
        role: editMember.role,
        membershipStatus: editMember.status,
        username: generateUsername(firstName, lastName),
      };
    }
    return { ...EMPTY_FORM, memberSince: new Date().toISOString().slice(0, 10) };
  }, [editMember]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const editKey = editMember?.id ?? 'new';
  const [form, setForm] = useState<FormState>(() => initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Reset form when editMember changes (no useEffect+setState pattern)
  const prevEditKeyRef = useRef<string>(editKey);
  if (prevEditKeyRef.current !== editKey) {
    prevEditKeyRef.current = editKey;
    setForm(initialForm);
    setErrors({});
  }

  // ── Field setters ──────────────────────────────────────────────────────────
  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    let nextValue: FormState[K] = value;
    if (
      (key === 'firstName' || key === 'middleName' || key === 'lastName') &&
      typeof value === 'string'
    ) {
      nextValue = sanitizePersonNameInput(value) as FormState[K];
    }
    if (key === 'nationalId' && typeof value === 'string') {
      nextValue = sanitizeAlphanumericIdInput(value) as FormState[K];
    }
    if (key === 'occupation' && typeof value === 'string') {
      nextValue = sanitizeNoDigits(value) as FormState[K];
    }
    if (key === 'city' && typeof value === 'string') {
      nextValue = sanitizeCityNameInput(value) as FormState[K];
    }
    if ((key === 'phone' || key === 'emergencyPhone') && typeof value === 'string') {
      nextValue = sanitizePhoneStripLetters(value) as FormState[K];
    }
    if (key === 'emergencyName' && typeof value === 'string') {
      nextValue = sanitizePersonNameInput(value) as FormState[K];
    }
    if (key === 'emergencyRelationship' && typeof value === 'string') {
      nextValue = sanitizeNoDigits(value) as FormState[K];
    }
    setForm((prev) => {
      const next = { ...prev, [key]: nextValue };
      if (key === 'firstName' || key === 'lastName') {
        const first = key === 'firstName' ? (nextValue as string) : prev.firstName;
        const last = key === 'lastName' ? (nextValue as string) : prev.lastName;
        if (first || last) {
          next.username = generateUsername(first || 'user', last || 'member');
        }
      }
      return next;
    });
    // Clear field-level error on change
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  const toggleDept = (d: string) =>
    setForm((prev) => ({
      ...prev,
      departments: prev.departments.includes(d)
        ? prev.departments.filter((x) => x !== d)
        : [...prev.departments, d],
    }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};

    if (!form.firstName.trim()) {
      e.firstName = 'First name is required';
    }
    if (!form.lastName.trim()) {
      e.lastName = 'Last name is required';
    }

    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!isValidPhone(form.phone)) {
      e.phone = 'Enter a valid phone number (e.g. +233 596 038 258)';
    }

    if (form.email.trim() && !isValidEmail(form.email)) {
      e.email = 'Enter a valid email address (e.g. name@example.com)';
    }

    if (!form.memberSince) {
      e.memberSince = 'Member since date is required';
    }
    if (!form.membershipStatus) {
      e.membershipStatus = 'Membership status is required';
    }
    if (form.departments.length === 0) {
      e.departments = 'Select at least one department';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build DepartmentMember data ────────────────────────────────────────────
  const buildData = (status: MemberStatus): Omit<DepartmentMember, 'id'> => {
    const fullName = [form.firstName.trim(), form.middleName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(' ');
    return {
      name: fullName,
      memberId: editMember?.memberId || generateMemberId(),
      avatarUrl: null,
      phone: form.phone,
      email: form.email,
      departments: form.departments.length > 0 ? form.departments : ['General'],
      role: form.role,
      status,
      memberSince: form.memberSince || new Date().toISOString().slice(0, 10),
    };
  };

  // ── SUBMIT → notify parent → show success screen ──────────────────────────
  const handleSubmit = () => {
    if (!validate()) {
      showToast('Please fix the highlighted errors before submitting.', 'error');
      return;
    }
    const data = buildData((form.membershipStatus as MemberStatus) || 'Active');

    onSubmit(data);

    const fullName = [form.firstName.trim(), form.middleName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(' ');

    setSuccessData({ memberId: data.memberId, memberName: fullName });
  };

  // ── SAVE AS DRAFT → notify parent → show toast → auto-return to list ──────
  const handleSaveDraft = () => {
    const data = buildData('Pending');
    onSaveDraft(data);
    showToast(
      '✓ Draft saved! You can edit or delete it from the members list.',
      'draft',
      3000,
      onCancel
    );
  };

  // ── CANCEL → confirm then close ───────────────────────────────────────────
  const handleCancel = () => {
    if (window.confirm('Discard changes and go back?')) {
      onCancel();
    }
  };

  // ── SUCCESS SCREEN callbacks ───────────────────────────────────────────────
  const handleAddAnother = () => {
    setSuccessData(null);
    setErrors({});
    setForm({ ...EMPTY_FORM, memberSince: new Date().toISOString().slice(0, 10) });
  };

  const handleDashboard = () => {
    onCancel();
    router.push('/departments/members');
  };

  // ── Style factories ────────────────────────────────────────────────────────

  const inputStyle = (hasError = false): React.CSSProperties => ({
    width: '100%',
    height: '38px',
    padding: '0 10px',
    fontSize: '12px',
    color: inputText,
    backgroundColor: inputBg,
    border: `1px solid ${hasError ? '#EF4444' : inputBorder}`,
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  });

  const chevronIcon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

  const selectStyle = (hasError = false): React.CSSProperties => ({
    ...inputStyle(hasError),
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: chevronIcon,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: 'auto',
    paddingRight: '28px',
    cursor: 'pointer',
    colorScheme: isDark ? 'dark' : 'light',
  });

  const labelStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: '11px',
    color: labelColor,
    marginBottom: '5px',
    display: 'block',
  };

  const errStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#EF4444',
    marginTop: '3px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  };

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 20px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    height: '38px',
    whiteSpace: 'nowrap' as const,
    border: `1px solid ${inputBorder}`,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    color: isDark ? '#CBD5E1' : '#374151',
  };

  // ── If success → render success card ──────────────────────────────────────
  if (successData) {
    return (
      <MemberRegistrationSuccess
        memberId={successData.memberId}
        memberName={successData.memberName}
        onAddAnother={handleAddAnother}
        onDashboard={handleDashboard}
      />
    );
  }

  // ── Render form ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .amp-form-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .amp-form-grid { grid-template-columns: 1fr; }
        }

        .amp-g3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 700px) {
          .amp-g3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .amp-g3 { grid-template-columns: 1fr; }
        }

        .amp-g2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 480px) {
          .amp-g2 { grid-template-columns: 1fr; }
        }

        .amp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        @media (max-width: 420px) {
          .amp-lock-label { display: none; }
        }

        .amp-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 18px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .amp-footer-left { display: flex; gap: 10px; flex-wrap: wrap; }
        @media (max-width: 480px) {
          .amp-footer        { flex-direction: column; align-items: stretch; }
          .amp-footer-left   { flex-direction: column; }
          .amp-footer button { width: 100% !important; }
        }

        .amp-outer {
          background: ${outerCardBg};
          border: 1px solid ${outerBorder};
          border-radius: 0 0 12px 12px;
          padding: 24px;
          box-shadow: ${outerShadow};
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        @media (max-width: 600px) {
          .amp-outer { padding: 14px; }
        }

        .amp-card { border-radius: 10px; padding: 24px; }
        @media (max-width: 480px) {
          .amp-card { padding: 14px; }
        }

        .amp-input:focus {
          border-color: ${accent} !important;
          box-shadow: 0 0 0 2px ${accent}22 !important;
        }

        .amp-sys-access-panel {
          background: ${isDark ? `${primary}20` : '#F8FAFC'};
          border: 1px solid ${isDark ? `${primary}40` : '#DDDDDD'};
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismissToast} />}

      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          backgroundColor: pageBg,
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div
          className="amp-header"
          style={{ backgroundColor: accent, borderRadius: '8px 8px 0 0', padding: '20px 28px' }}
        >
          <div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              {editMember ? 'Edit Member' : 'Member Registration Form'}
            </h2>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.20)',
              borderRadius: '20px',
              padding: '5px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              flexShrink: 0,
            }}
          >
            <Lock size={13} color="#FFFFFF" />
            <span
              className="amp-lock-label"
              style={{
                fontWeight: 400,
                fontSize: '12px',
                color: '#FFFFFF',
              }}
            >
              Administrative Access Required
            </span>
          </div>
        </div>

        <div style={{ height: '30px' }} />

        {/* ── OUTER CONTAINER ──────────────────────────────────────────────── */}
        <div className="amp-outer">
          <div className="amp-form-grid">
            {/* ── LEFT CARD ────────────────────────────────────────────────── */}
            <div className="amp-card" style={{ backgroundColor: leftCardBg }}>
              {/* Personal Information */}
              <SectionHeader icon={User} label="Personal Information" accent={accent} text={text} />

              <div className="amp-g2">
                <div>
                  <label style={labelStyle}>Title</label>
                  <select
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    style={selectStyle()}
                  >
                    <option value="">Select title</option>
                    {TITLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center',
                      height: '38px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {(['Male', 'Female'] as const).map((g) => (
                      <label
                        key={g}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: text,
                        }}
                      >
                        <input
                          type="radio"
                          name="pg-gender"
                          value={g}
                          checked={form.gender === g}
                          onChange={() => set('gender', g)}
                          style={{ accentColor: accent, width: '14px', height: '14px' }}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="amp-g3">
                {[
                  { key: 'firstName' as const, label: 'First Name', req: true },
                  { key: 'middleName' as const, label: 'Middle Name', req: false },
                  { key: 'lastName' as const, label: 'Last Name', req: true },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>
                      {f.label}
                      {f.req && <span style={{ color: '#EF4444' }}> *</span>}
                    </label>
                    <input
                      className="amp-input"
                      style={inputStyle(!!errors[f.key])}
                      value={form[f.key] as string}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.label}
                    />
                    {errors[f.key] && <p style={errStyle}>{errors[f.key]}</p>}
                  </div>
                ))}
              </div>

              <div className="amp-g3">
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    type="date"
                    className="amp-input"
                    style={{ ...inputStyle(), colorScheme: isDark ? 'dark' : 'light' }}
                    value={form.dateOfBirth}
                    onChange={(e) => set('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Marital Status</label>
                  <select
                    value={form.maritalStatus}
                    onChange={(e) => set('maritalStatus', e.target.value)}
                    style={selectStyle()}
                  >
                    <option value="">Marital Status</option>
                    {MARITAL.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>National ID Number</label>
                  <input
                    className="amp-input"
                    style={inputStyle()}
                    value={form.nationalId}
                    onChange={(e) => set('nationalId', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Divider color={dividerClr} />

              {/* Contact Information */}
              <SectionHeader icon={Phone} label="Contact Information" accent={accent} text={text} />

              <div className="amp-g3">
                {/* ── Phone number ── */}
                <div>
                  <label style={labelStyle}>
                    Primary Phone <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    className="amp-input"
                    type="tel"
                    inputMode="tel"
                    style={inputStyle(!!errors.phone)}
                    value={form.phone}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^\d+\s\-().]/g, '');
                      set('phone', filtered);
                    }}
                    placeholder="+233 596 038 258"
                  />
                  {errors.phone && <p style={errStyle}>{errors.phone}</p>}
                </div>

                {/* ── Email address ── */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    className="amp-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    style={inputStyle(!!errors.email)}
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="example@gmail.com"
                    onBlur={(e) => {
                      if (e.target.value.trim() && !isValidEmail(e.target.value)) {
                        setErrors((prev) => ({
                          ...prev,
                          email: 'Enter a valid email address (e.g. name@example.com)',
                        }));
                      }
                    }}
                  />
                  {errors.email && <p style={errStyle}>{errors.email}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Occupation</label>
                  <input
                    className="amp-input"
                    style={inputStyle()}
                    value={form.occupation}
                    onChange={(e) => set('occupation', e.target.value)}
                    placeholder="Senior Pastor"
                  />
                </div>
              </div>

              <div className="amp-g3">
                <div>
                  <label style={labelStyle}>Residential Address</label>
                  <input
                    className="amp-input"
                    style={inputStyle()}
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Street Address"
                  />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    className="amp-input"
                    style={inputStyle()}
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Region</label>
                  <select
                    value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                    style={selectStyle()}
                  >
                    <option value="">Select Region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Divider color={dividerClr} />

              {/* Church Information */}
              <SectionHeader
                icon={Building2}
                label="Church Information"
                accent={accent}
                text={text}
              />

              <div className="amp-g3" style={{ marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>
                    Member Since <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="amp-input"
                    style={{
                      ...inputStyle(!!errors.memberSince),
                      colorScheme: isDark ? 'dark' : 'light',
                    }}
                    value={form.memberSince}
                    onChange={(e) => set('memberSince', e.target.value)}
                  />
                  {errors.memberSince && <p style={errStyle}>{errors.memberSince}</p>}
                </div>
                <div>
                  <label style={labelStyle}>
                    Membership Status <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={form.membershipStatus}
                    onChange={(e) => set('membershipStatus', e.target.value as MemberStatus)}
                    style={selectStyle(!!errors.membershipStatus)}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.membershipStatus && <p style={errStyle}>{errors.membershipStatus}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Educational Level</label>
                  <select
                    value={form.educationalLevel}
                    onChange={(e) => set('educationalLevel', e.target.value)}
                    style={selectStyle()}
                  >
                    <option value="">Select Education</option>
                    {EDU_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="amp-g2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Are you Baptized?</label>
                  <select
                    value={form.baptized}
                    onChange={(e) => set('baptized', e.target.value)}
                    style={selectStyle()}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => set('role', e.target.value as MemberRole)}
                    style={selectStyle()}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Interest */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>
                  Department Interest <span style={{ color: '#EF4444' }}>*</span>
                  {errors.departments && (
                    <span style={{ color: '#EF4444', fontWeight: 400, marginLeft: '6px' }}>
                      — {errors.departments}
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_DEPARTMENTS.map((d) => {
                    const sel = form.departments.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDept(d)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '10px',
                          border: `1px solid ${sel ? accent : inputBorder}`,
                          backgroundColor: sel
                            ? `${accent}18`
                            : isDark
                              ? 'rgba(255,255,255,0.04)'
                              : '#FFFFFF',
                          color: sel ? accent : muted,
                          fontSize: '11px',
                          fontWeight: sel ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        {sel && <X size={10} />} {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills & Talents */}
              <div>
                <label style={labelStyle}>Skills &amp; Talents</label>
                <textarea
                  value={form.skills}
                  onChange={(e) => set('skills', e.target.value)}
                  placeholder="List skills, talents or areas of service."
                  style={{
                    ...inputStyle(),
                    height: '80px',
                    padding: '8px 10px',
                    resize: 'vertical',
                    lineHeight: '1.5',
                  }}
                />
              </div>
            </div>

            {/* ── RIGHT CARD ───────────────────────────────────────────────── */}
            <div className="amp-card" style={{ backgroundColor: rightCardBg, border: rightBorder }}>
              {/* Emergency Contact */}
              <SectionHeader icon={Phone} label="Emergency Contact" accent={accent} text={text} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    className="amp-input"
                    style={inputStyle()}
                    value={form.emergencyName}
                    onChange={(e) => set('emergencyName', e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Relationship</label>
                  <select
                    value={form.emergencyRelationship}
                    onChange={(e) => set('emergencyRelationship', e.target.value)}
                    style={selectStyle()}
                  >
                    <option value="">Select Relationship</option>
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    className="amp-input"
                    type="tel"
                    inputMode="tel"
                    style={inputStyle()}
                    value={form.emergencyPhone}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^\d+\s\-().]/g, '');
                      set('emergencyPhone', filtered);
                    }}
                    placeholder="+233 …"
                  />
                </div>
              </div>

              <Divider color={dividerClr} />

              {/* System Access */}
              <SectionHeader icon={ShieldCheck} label="System Access" accent={accent} text={text} />
              <div className="amp-sys-access-panel">
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <label style={labelStyle}>Username</label>
                    <span style={{ fontSize: '10px', color: accent, fontWeight: 600 }}>
                      Auto-generated
                    </span>
                  </div>
                  <input
                    style={{
                      ...inputStyle(),
                      backgroundColor: readonlyBg,
                      color: text,
                      fontWeight: 600,
                    }}
                    value={form.username || 'username'}
                    readOnly
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <label style={labelStyle}>Password</label>
                    <span style={{ fontSize: '10px', color: accent, fontWeight: 600 }}>
                      Auto-generated
                    </span>
                  </div>
                  <input
                    type="password"
                    style={{ ...inputStyle(), backgroundColor: readonlyBg, color: muted }}
                    value="••••••••••••••"
                    readOnly
                  />
                </div>
              </div>

              <Divider color={dividerClr} />

              {/* Admin Notes */}
              <SectionHeader icon={FileText} label="Admin Notes" accent={accent} text={text} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Internal Notes</label>
                  <textarea
                    value={form.adminNotes}
                    onChange={(e) => set('adminNotes', e.target.value)}
                    placeholder="Notes visible to administrators only…"
                    style={{
                      ...inputStyle(),
                      height: '90px',
                      padding: '8px 10px',
                      resize: 'vertical',
                      lineHeight: '1.5',
                      borderRadius: '10px',
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Added By</label>
                  <p style={{ fontSize: '12px', color: text, margin: 0, fontWeight: 600 }}>
                    {addedByName}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* end .amp-form-grid */}

          {/* ── FOOTER ────────────────────────────────────────────────────── */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ height: '1px', backgroundColor: dividerClr }} />
            <div className="amp-footer">
              <div className="amp-footer-left">
                {/* Cancel — confirm then close */}
                <button
                  type="button"
                  onClick={handleCancel}
                  style={btnBase}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.75';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  }}
                >
                  <XCircle size={14} /> Cancel
                </button>

                {/* Save as Draft — saves data, shows toast, then auto-returns */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  style={{
                    ...btnBase,
                    border: `1px solid #F59E0B`,
                    color: isDark ? '#FCD34D' : '#B45309',
                    background: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.78';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  }}
                >
                  <Save size={14} /> Save as Draft
                </button>
              </div>

              {/* Add Member — validates then shows success screen */}
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  ...btnBase,
                  padding: '10px 26px',
                  border: 'none',
                  background: primary,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  height: '40px',
                  boxShadow: `0 4px 14px ${primary}55`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                }}
              >
                <UserPlus size={15} />
                {editMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
        {/* end .amp-outer */}
      </div>
    </>
  );
}
