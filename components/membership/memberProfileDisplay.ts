import type { MemberDetail } from '@/lib/api';

export function displayMemberName(m: MemberDetail | null): string {
  if (!m) {return '';}
  const t = (m.full_name || '').trim();
  if (t) {return t;}
  const parts = [m.first_name, m.middle_name, m.last_name].filter(Boolean) as string[];
  return parts.join(' ') || 'Member';
}

/** Turn `SINGLE`, `GREATER_ACCRA` into readable labels. */
export function formatEnumLabel(raw: string | null | undefined): string {
  if (!raw) {return '—';}
  return raw
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) {return '—';}
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {return String(iso);}
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ageFromDob(iso: string | null | undefined): string | null {
  if (!iso) {return null;}
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {return null;}
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) {age -= 1;}
  if (age < 0) {return null;}
  return `${age} year${age === 1 ? '' : 's'}`;
}

export function shortMemberRef(id: string | undefined): string {
  if (!id) {return '—';}
  const hex = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `M-${hex}`;
}

export function primarySecondaryDepartments(names: string[] | undefined): {
  primary: string;
  secondary: string;
} {
  const n = [...(names || [])].filter(Boolean);
  if (n.length === 0) {return { primary: '—', secondary: '—' };}
  if (n.length === 1) {return { primary: n[0], secondary: '—' };}
  return { primary: n[0], secondary: n.slice(1).join(', ') };
}
