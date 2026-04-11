'use client';

/**
 * MembersTable.tsx
 */

import { useState, useMemo, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  SquarePen,
  MessageSquareText,
  UserX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  MessageCircle,
  Mail,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import { SendSmsDialog } from '@/components/admin/membership/SendSmsDialog';
import { SendEmailDialog } from '@/components/admin/membership/SendEmailDialog';
import { departmentMembersPortal } from '@/lib/departmentMembersPortal';
import type { DepartmentMember, MemberRole, MemberStatus } from './membersDummyData';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_PRESETS = [10, 25, 50, 100] as const;
const PAGE_SIZE_MIN = 1;

const COLUMNS = [
  { key: 'member', label: 'Member' },
  { key: 'contact', label: 'Contact' },
  { key: 'department', label: 'Department' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'memberSince', label: 'Member Since' },
  { key: 'action', label: 'Action' },
] as const;

const ROLE_LIGHT: Record<MemberRole, { bg: string; text: string }> = {
  Admin: { bg: '#DBEAFE', text: '#1D4ED8' },
  'Core Admin': { bg: '#F3E8FF', text: '#7C3AED' },
  'Departmental Head': { bg: '#FEF3C7', text: '#D97706' },
  Member: { bg: '#D1FAE5', text: '#059669' },
};
const ROLE_DARK: Record<MemberRole, { bg: string; text: string }> = {
  Admin: { bg: '#1E3A5F', text: '#60A5FA' },
  'Core Admin': { bg: '#2D1B4E', text: '#C084FC' },
  'Departmental Head': { bg: '#3D2A00', text: '#FBBF24' },
  Member: { bg: '#064E3B', text: '#34D399' },
};

const STATUS_LIGHT: Record<MemberStatus, { bg: string; text: string; borderColor: string }> = {
  Active: { bg: '#F0FDF4', text: '#16A34A', borderColor: '#86EFAC' },
  Inactive: { bg: '#FEF2F2', text: '#DC2626', borderColor: '#FECACA' },
  Pending: { bg: '#FFFBEB', text: '#D97706', borderColor: '#FDE68A' },
};
const STATUS_DARK: Record<MemberStatus, { bg: string; text: string; borderColor: string }> = {
  Active: { bg: '#052E16', text: '#4ADE80', borderColor: '#166534' },
  Inactive: { bg: '#450A0A', text: '#F87171', borderColor: '#991B1B' },
  Pending: { bg: '#451A03', text: '#FCD34D', borderColor: '#92400E' },
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function runCSV(members: DepartmentMember[]) {
  const hdr = [
    'Name',
    'Member ID',
    'Phone',
    'Email',
    'Departments',
    'Role',
    'Status',
    'Member Since',
  ];
  const rows = members.map((m) => [
    `"${m.name}"`,
    m.memberId,
    m.phone,
    m.email,
    `"${m.departments.join('; ')}"`,
    m.role,
    m.status,
    m.memberSince,
  ]);
  const csv = [hdr, ...rows].map((r) => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'members.csv';
  a.click();
}

function runPDF(members: DepartmentMember[]) {
  const rows = members
    .map(
      (m) => `<tr>
    <td>${m.name}</td><td>${m.memberId}</td><td>${m.phone}</td><td>${m.email}</td>
    <td>${m.departments.join(', ')}</td><td>${m.role}</td><td>${m.status}</td><td>${fmtDate(m.memberSince)}</td>
  </tr>`
    )
    .join('');
  const win = window.open('', '_blank', 'width=1000,height=700');
  if (!win) {
    alert('Please allow pop-ups to export PDF.');
    return;
  }
  win.document.write(`<!DOCTYPE html><html><head><title>Members Export</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:10px;padding:24px;color:#111}
  h2{font-size:15px;margin-bottom:14px;color:#0B2A4A}table{border-collapse:collapse;width:100%}
  th{background:#0B2A4A;color:#fff;padding:7px 9px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.05em}
  td{padding:6px 9px;border-bottom:1px solid #E5E7EB;font-size:9px}tr:nth-child(even) td{background:#F8F9FA}
  .btn{display:inline-block;margin-top:18px;padding:8px 22px;background:#2FC4B2;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer}
  @media print{.btn{display:none}}</style></head><body><h2>Department Members</h2>
  <table><thead><tr><th>Name</th><th>Member ID</th><th>Phone</th><th>Email</th><th>Departments</th><th>Role</th><th>Status</th><th>Member Since</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <button class="btn" onclick="window.print()">🖨 Print / Save as PDF</button></body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

async function runExcel(members: DepartmentMember[]) {
  try {
    const XLSX = await import('xlsx');
    const data = [
      ['Name', 'Member ID', 'Phone', 'Email', 'Departments', 'Role', 'Status', 'Member Since'],
      ...members.map((m) => [
        m.name,
        m.memberId,
        m.phone,
        m.email,
        m.departments.join('; '),
        m.role,
        m.status,
        m.memberSince,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, 'members.xlsx');
  } catch {
    runCSV(members);
  }
}

interface MembersTableProps {
  members: DepartmentMember[];
  onView: (m: DepartmentMember) => void;
  onEdit: (m: DepartmentMember) => void;
  onMessage: (m: DepartmentMember) => void;
  onRemoveMember: (m: DepartmentMember) => void;
  /** Remove all selected from this department (API + local drafts); optional — hides bulk remove if omitted. */
  onBulkRemoveMembers?: (members: DepartmentMember[]) => void | Promise<void>;
  exportTrigger?: 'csv' | 'pdf' | 'excel' | null;
  onExportDone?: () => void;
}

function getRoleBadgeColors(role: string, isDark: boolean): { bg: string; text: string } {
  const preset = isDark ? ROLE_DARK[role as MemberRole] : ROLE_LIGHT[role as MemberRole];
  return (
    preset ?? (isDark ? { bg: '#1E3A5F', text: '#93C5FD' } : { bg: '#EFF6FF', text: '#2563EB' })
  );
}

function bulkActionBtnStyle(
  isDark: boolean,
  variant: 'default' | 'danger' | 'primary'
): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid',
    flex: '1 1 auto',
    justifyContent: 'center',
    minHeight: '32px',
  };
  if (variant === 'danger') {
    return {
      ...base,
      borderColor: isDark ? 'rgba(248,113,113,0.45)' : '#FECACA',
      color: isDark ? '#FCA5A5' : '#B91C1C',
      background: isDark ? 'rgba(127,29,29,0.25)' : '#FEF2F2',
    };
  }
  if (variant === 'primary') {
    return {
      ...base,
      borderColor: 'transparent',
      color: '#fff',
      background: '#16A34A',
    };
  }
  return {
    ...base,
    borderColor: isDark ? 'rgba(255,255,255,0.14)' : '#E5E7EB',
    color: isDark ? 'rgba(255,255,255,0.92)' : '#374151',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
  };
}

export default function MembersTable({
  members,
  onView,
  onEdit,
  onMessage,
  onRemoveMember,
  onBulkRemoveMembers,
  exportTrigger,
  onExportDone,
}: MembersTableProps) {
  const router = useRouter();
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

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
  const cardBg = isDark ? '#0D1F36' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#111827';
  const muted = isDark ? 'rgba(255,255,255,0.40)' : '#9CA3AF';
  const rowBorder = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6';
  const thBorder = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';
  const hoverBg = isDark ? 'rgba(255,255,255,0.025)' : '#FAFAFA';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB';

  const [sel, setSel] = useState<Set<string>>(new Set());
  const [smsOpen, setSmsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [smsRecipientIds, setSmsRecipientIds] = useState<string[]>([]);
  const [emailRecipientIds, setEmailRecipientIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPS] = useState<number>(DEFAULT_PAGE_SIZE);
  const [psOpen, setPsOpen] = useState(false);
  const [psInputVal, setPsInput] = useState<string>(String(DEFAULT_PAGE_SIZE));
  const psRef = useRef<HTMLDivElement | null>(null);

  const selectedMembers = useMemo(
    () => members.filter((m) => sel.has(m.id)),
    [members, sel]
  );
  const selectedCount = sel.size;
  const singleSelectedId = selectedCount === 1 ? selectedMembers[0]?.id ?? null : null;

  // ── Only reset page when list SHRINKS (remove) — not when it grows (add) ──
  const prevLengthRef = useRef(members.length);
  useEffect(() => {
    const prev = prevLengthRef.current;
    prevLengthRef.current = members.length;
    if (members.length < prev) {
      const newTotal = Math.max(1, Math.ceil(members.length / pageSize));
      if (page > newTotal) {
        setPage(1);
      }
      setSel((prev2) => {
        const valid = new Set(members.map((m) => m.id));
        const cleaned = new Set([...prev2].filter((id) => valid.has(id)));
        return cleaned.size !== prev2.size ? cleaned : prev2;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (psRef.current && !psRef.current.contains(e.target as Node)) {
        setPsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!exportTrigger) {
      return;
    }
    if (exportTrigger === 'csv') {
      runCSV(members);
    }
    if (exportTrigger === 'pdf') {
      runPDF(members);
    }
    if (exportTrigger === 'excel') {
      runExcel(members);
    }
    onExportDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTrigger]);

  const maxPageSize = Math.max(PAGE_SIZE_MIN, members.length);
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => members.slice((safePage - 1) * pageSize, safePage * pageSize),
    [members, safePage, pageSize]
  );

  const applyPageSize = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= PAGE_SIZE_MIN) {
      const clamped = Math.min(n, maxPageSize || DEFAULT_PAGE_SIZE);
      setPS(clamped);
      setPage(1);
      setPsInput(String(clamped));
    } else {
      setPsInput(String(pageSize));
    }
  };

  const visiblePresets = PAGE_SIZE_PRESETS.filter(
    (n) => n <= Math.max(maxPageSize, DEFAULT_PAGE_SIZE)
  );
  const showAllOption =
    members.length > 0 && !(PAGE_SIZE_PRESETS as readonly number[]).includes(members.length);

  const toggleAll = () =>
    setSel(sel.size === paginated.length ? new Set() : new Set(paginated.map((m) => m.id)));
  const toggleOne = (id: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  const clearSelection = () => setSel(new Set());

  const exportSelected = useCallback(
    (fmt: 'csv' | 'pdf' | 'excel') => {
      const rows = selectedMembers;
      if (rows.length === 0) {
        return;
      }
      if (fmt === 'csv') {
        runCSV(rows);
      } else if (fmt === 'pdf') {
        runPDF(rows);
      } else {
        void runExcel(rows);
      }
    },
    [selectedMembers]
  );

  const handleBulkView = () => {
    if (singleSelectedId) {
      router.push(`${departmentMembersPortal.membersBasePath}/${singleSelectedId}`);
    }
  };
  const handleBulkEdit = () => {
    if (singleSelectedId) {
      router.push(`${departmentMembersPortal.membersBasePath}/${singleSelectedId}/edit`);
    }
  };
  const handleBulkSendMessage = () => {
    setSmsRecipientIds(Array.from(sel));
    setSmsOpen(true);
  };
  const handleBulkSendEmail = () => {
    setEmailRecipientIds(Array.from(sel));
    setEmailOpen(true);
  };
  const handleBulkRemove = async () => {
    if (!onBulkRemoveMembers || selectedMembers.length === 0) {
      return;
    }
    await onBulkRemoveMembers(selectedMembers);
    clearSelection();
  };

  const smsRecipients = smsRecipientIds
    .map((rid) => members.find((m) => m.id === rid))
    .filter((m): m is DepartmentMember => Boolean(m))
    .map((m) => ({ id: m.id, name: m.name, phone: m.phone }));

  const emailRecipients = emailRecipientIds
    .map((rid) => members.find((m) => m.id === rid))
    .filter((m): m is DepartmentMember => Boolean(m))
    .map((m) => ({ id: m.id, name: m.name, email: m.email }));

  const roleBadge = (role: string) => {
    const c = getRoleBadgeColors(role, isDark);
    return (
      <span
        style={{
          display: 'inline-block',
          background: c.bg,
          color: c.text,
          fontWeight: 500,
          fontSize: '10px',
          padding: '2px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {role}
      </span>
    );
  };

  const statusPill = (s: MemberStatus) => {
    const c = isDark ? STATUS_DARK[s] : STATUS_LIGHT[s];
    return (
      <span
        style={{
          display: 'inline-block',
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.borderColor}`,
          fontWeight: 500,
          fontSize: '10px',
          padding: '2px 10px',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
        }}
      >
        {s}
      </span>
    );
  };

  const Avatar = ({ m }: { m: DepartmentMember }) => {
    const ini = m.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: m.avatarUrl ? 'transparent' : accent,
        }}
      >
        {m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.avatarUrl}
            alt={m.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontWeight: 700, fontSize: '11px', color: '#FFF' }}>{ini}</span>
        )}
      </div>
    );
  };

  const ActionIcon = ({
    icon: Icon,
    title: t,
    onClick: fn,
  }: {
    icon: React.ElementType;
    title: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      aria-label={t}
      title={t}
      onClick={fn}
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        color: muted,
        transition: 'color 0.12s, background 0.12s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.color = text;
        b.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6';
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.color = muted;
        b.style.background = 'transparent';
      }}
    >
      <Icon size={15} strokeWidth={1.6} />
    </button>
  );

  const CB = ({
    checked,
    indeterminate,
    onChange,
  }: {
    checked: boolean;
    indeterminate?: boolean;
    onChange: () => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) {
          el.indeterminate = !!indeterminate;
        }
      }}
      onChange={onChange}
      style={{
        width: '14px',
        height: '14px',
        accentColor: primary,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    />
  );

  const tdStyle: React.CSSProperties = { padding: '9px 12px', verticalAlign: 'middle' };
  const thStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: '12px',
    color: isDark ? 'rgba(255,255,255,0.80)' : '#111827',
    background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
    borderBottom: `1.5px solid ${thBorder}`,
    padding: '11px 12px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };

  const MobileCard = ({ m }: { m: DepartmentMember }) => {
    const isSel = sel.has(m.id);
    return (
      <div
        style={{
          background: isSel ? (isDark ? `${primary}28` : `${primary}07`) : cardBg,
          border: `1px solid ${thBorder}`,
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '8px',
          transition: 'background 0.1s',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}
        >
          <CB checked={isSel} onChange={() => toggleOne(m.id)} />
          <Avatar m={m} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: '13px',
                color: text,
                wordBreak: 'break-word',
                lineHeight: '1.3',
              }}
            >
              {m.name}
            </p>
            <p style={{ fontSize: '10px', color: muted, marginTop: '1px' }}>{m.memberId}</p>
          </div>
          {statusPill(m.status)}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 14px',
            marginBottom: '10px',
          }}
        >
          {[
            { label: 'Phone', value: m.phone, full: false },
            { label: 'Member Since', value: fmtDate(m.memberSince), full: false },
            { label: 'Email', value: m.email, full: true },
          ].map(({ label, value: v, full }) => (
            <div key={label} style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
              <p
                style={{
                  fontSize: '9px',
                  color: muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1px',
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: '11px', color: text, wordBreak: 'break-all' }}>{v}</p>
            </div>
          ))}
          <div>
            <p
              style={{
                fontSize: '9px',
                color: muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '3px',
              }}
            >
              Role
            </p>
            {roleBadge(m.role)}
          </div>
          <div>
            <p
              style={{
                fontSize: '9px',
                color: muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '3px',
              }}
            >
              Departments
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {m.departments.map((d) => (
                <span
                  key={d}
                  style={{
                    background: isDark ? `${accent}18` : `${accent}15`,
                    color: accent,
                    fontWeight: 500,
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            borderTop: `1px solid ${thBorder}`,
            paddingTop: '8px',
          }}
        >
          <ActionIcon icon={Eye} title="View member" onClick={() => onView(m)} />
          <ActionIcon icon={SquarePen} title="Edit member" onClick={() => onEdit(m)} />
          <ActionIcon
            icon={MessageSquareText}
            title="Message member"
            onClick={() => onMessage(m)}
          />
          <ActionIcon icon={UserX} title="Remove member" onClick={() => onRemoveMember(m)} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: cardBg }}>
      {selectedCount > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '12px 14px',
            borderBottom: `1px solid ${thBorder}`,
            background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: text }}>
              {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                fontWeight: 600,
                color: muted,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'stretch',
            }}
          >
            {singleSelectedId && (
              <button
                type="button"
                style={bulkActionBtnStyle(isDark, 'default')}
                onClick={handleBulkView}
              >
                <Eye size={14} />
                View
              </button>
            )}
            {singleSelectedId && (
              <button
                type="button"
                style={bulkActionBtnStyle(isDark, 'default')}
                onClick={handleBulkEdit}
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
            <button
              type="button"
              style={bulkActionBtnStyle(isDark, 'default')}
              onClick={handleBulkSendMessage}
            >
              <MessageCircle size={14} />
              Message
            </button>
            <button
              type="button"
              style={bulkActionBtnStyle(isDark, 'default')}
              onClick={handleBulkSendEmail}
            >
              <Mail size={14} />
              Email
            </button>
            <button
              type="button"
              style={bulkActionBtnStyle(isDark, 'primary')}
              onClick={() => exportSelected('csv')}
            >
              <Download size={14} />
              Export
            </button>
            <button
              type="button"
              style={bulkActionBtnStyle(isDark, 'default')}
              onClick={() =>
                toast.info('Update membership status in Admin → Members for now.')
              }
            >
              <RefreshCw size={14} />
              Update status
            </button>
            {onBulkRemoveMembers && (
              <button
                type="button"
                style={bulkActionBtnStyle(isDark, 'danger')}
                onClick={() => void handleBulkRemove()}
              >
                <UserX size={14} />
                Remove from dept
              </button>
            )}
          </div>
        </div>
      )}

      <SendSmsDialog
        open={smsOpen}
        onOpenChange={setSmsOpen}
        recipients={smsRecipients}
        onSent={clearSelection}
      />
      <SendEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        recipients={emailRecipients}
        onSent={clearSelection}
      />

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '36px' }}>
                <CB
                  checked={sel.size === paginated.length && paginated.length > 0}
                  indeterminate={sel.size > 0 && sel.size < paginated.length}
                  onChange={toggleAll}
                />
              </th>
              {COLUMNS.map((col) => (
                <th key={col.key} style={thStyle}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  style={{
                    ...tdStyle,
                    textAlign: 'center',
                    padding: '48px',
                    fontSize: '13px',
                    color: muted,
                  }}
                >
                  No members found.
                </td>
              </tr>
            )}
            {paginated.map((m, i) => {
              const isSel = sel.has(m.id);
              const isLast = i === paginated.length - 1;
              return (
                <tr
                  key={m.id}
                  style={{
                    background: isSel ? (isDark ? `${primary}28` : `${primary}07`) : 'transparent',
                    borderBottom: isLast ? 'none' : `1px solid ${rowBorder}`,
                    transition: 'background 0.10s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) {
                      (e.currentTarget as HTMLTableRowElement).style.background = hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                    }
                  }}
                >
                  <td style={tdStyle}>
                    <CB checked={isSel} onChange={() => toggleOne(m.id)} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar m={m} />
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: '12px',
                            color: text,
                            lineHeight: '1.3',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.name}
                        </p>
                        <p
                          style={{
                            fontSize: '10px',
                            color: muted,
                            marginTop: '1px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.memberId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <p style={{ fontSize: '11px', color: text, whiteSpace: 'nowrap' }}>{m.phone}</p>
                    <p
                      style={{
                        fontSize: '10px',
                        color: muted,
                        marginTop: '1px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.email}
                    </p>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {m.departments.map((d) => (
                        <span
                          key={d}
                          style={{
                            background: isDark ? `${accent}18` : `${accent}15`,
                            color: accent,
                            fontWeight: 500,
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle}>{roleBadge(m.role)}</td>
                  <td style={tdStyle}>{statusPill(m.status)}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '11px', color: text, whiteSpace: 'nowrap' }}>
                      {fmtDate(m.memberSince)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <ActionIcon icon={Eye} title="View member" onClick={() => onView(m)} />
                      <ActionIcon icon={SquarePen} title="Edit member" onClick={() => onEdit(m)} />
                      <ActionIcon
                        icon={MessageSquareText}
                        title="Message member"
                        onClick={() => onMessage(m)}
                      />
                      <ActionIcon
                        icon={UserX}
                        title="Remove member"
                        onClick={() => onRemoveMember(m)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden px-3 pt-3">
        {paginated.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              padding: '4px 2px',
            }}
          >
            <CB
              checked={sel.size === paginated.length && paginated.length > 0}
              indeterminate={sel.size > 0 && sel.size < paginated.length}
              onChange={toggleAll}
            />
            <span style={{ fontSize: '11px', color: muted }}>
              {sel.size > 0 ? `${sel.size} selected` : 'Select all'}
            </span>
          </div>
        )}
        {paginated.length === 0 && (
          <div
            style={{ textAlign: 'center', padding: '48px 16px', fontSize: '13px', color: muted }}
          >
            No members found.
          </div>
        )}
        {paginated.map((m) => (
          <MobileCard key={m.id} m={m} />
        ))}
      </div>

      {/* Pagination footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 16px',
          gap: '8px',
          borderTop: `1px solid ${thBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              border: `1px solid ${thBorder}`,
              color: safePage === 1 ? muted : text,
              opacity: safePage === 1 ? 0.4 : 1,
              background: 'transparent',
              cursor: safePage === 1 ? 'default' : 'pointer',
            }}
          >
            <ChevronLeft size={13} />
          </button>
          <span style={{ fontSize: '11px', color: text, opacity: 0.65, whiteSpace: 'nowrap' }}>
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              border: `1px solid ${thBorder}`,
              color: safePage === totalPages ? muted : text,
              opacity: safePage === totalPages ? 0.4 : 1,
              background: 'transparent',
              cursor: safePage === totalPages ? 'default' : 'pointer',
            }}
          >
            <ChevronRight size={13} />
          </button>
        </div>

        <div
          ref={psRef}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ fontSize: '11px', color: text, opacity: 0.6, whiteSpace: 'nowrap' }}>
            Show
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              min={PAGE_SIZE_MIN}
              max={maxPageSize}
              value={psInputVal}
              onChange={(e) => setPsInput(e.target.value)}
              onBlur={(e) => applyPageSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyPageSize((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              aria-label="Rows per page"
              style={{
                width: '52px',
                height: '28px',
                borderRadius: '5px 0 0 5px',
                borderTop: `1px solid ${thBorder}`,
                borderBottom: `1px solid ${thBorder}`,
                borderLeft: `1px solid ${thBorder}`,
                borderRight: 'none',
                background: inputBg,
                color: text,
                fontSize: '11px',
                paddingLeft: '8px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setPsOpen((o) => !o)}
              aria-label="Open page size options"
              style={{
                height: '28px',
                padding: '0 5px',
                borderRadius: '0 5px 5px 0',
                border: `1px solid ${thBorder}`,
                background: inputBg,
                color: text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronDown size={11} style={{ opacity: 0.6 }} />
            </button>
          </div>
          {psOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '4px',
                zIndex: 50,
                background: cardBg,
                border: `1px solid ${thBorder}`,
                borderRadius: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                minWidth: '80px',
              }}
            >
              {visiblePresets.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setPS(n);
                    setPage(1);
                    setPsInput(String(n));
                    setPsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 14px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: text,
                    background: n === pageSize ? thBorder : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = thBorder;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      n === pageSize ? thBorder : 'transparent';
                  }}
                >
                  {n}
                </button>
              ))}
              {showAllOption && (
                <button
                  type="button"
                  onClick={() => {
                    setPS(members.length);
                    setPage(1);
                    setPsInput(String(members.length));
                    setPsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 14px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: accent,
                    background: members.length === pageSize ? thBorder : 'transparent',
                    borderTop: `1px solid ${thBorder}`,
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = thBorder;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      members.length === pageSize ? thBorder : 'transparent';
                  }}
                >
                  All ({members.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
