'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Search, UserPlus } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useLogDeptMember } from '@/components/departments/contexts/DeptActivityContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import { getMembers, type MemberListItem } from '@/lib/api';
import { assignMemberToDepartment } from '@/lib/departmentsApi';
import { toast } from 'sonner';

const ROLE_IN_DEPARTMENT_OPTIONS = [
  'Member',
  'Secretary',
  'Treasurer',
  'Assistant',
  'Coordinator',
  'Department head',
] as const;

function displayName(m: MemberListItem): string {
  const fn = m.full_name?.trim();
  if (fn) {
    return fn;
  }
  const parts = [m.first_name, m.last_name].filter(Boolean);
  return parts.length ? parts.join(' ').trim() : 'Member';
}

export interface DepartmentAssignMembersPageProps {
  departmentId: string;
  departmentName: string;
  /**
   * Member UUIDs who must not appear in the picker: already in this department,
   * and the department’s primary head (even if not listed as a regular member).
   */
  excludedMemberIds: ReadonlySet<string>;
  onClose: () => void;
}

export default function DepartmentAssignMembersPage({
  departmentId,
  departmentName,
  excludedMemberIds,
  onClose,
}: DepartmentAssignMembersPageProps) {
  const { profile, isReady } = useDepartmentProfile();
  const memberActivityLog = useLogDeptMember();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const accent = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [churchMembers, setChurchMembers] = useState<MemberListItem[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [roleByMember, setRoleByMember] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setListError(null);
      try {
        const rows = await getMembers();
        if (!cancelled) {
          setChurchMembers(Array.isArray(rows) ? rows : []);
        }
      } catch {
        if (!cancelled) {
          setListError('Could not load church members.');
          setChurchMembers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const available = useMemo(
    () => churchMembers.filter((m) => m.id && !excludedMemberIds.has(String(m.id))),
    [churchMembers, excludedMemberIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return available;
    }
    return available.filter((m) => {
      const name = displayName(m).toLowerCase();
      const phone = (m.location?.phone_primary || '').toLowerCase();
      const email = (m.location?.email || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [available, query]);

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([id]) => id),
    [selected]
  );

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setRole = useCallback((memberId: string, role: string) => {
    setRoleByMember((prev) => ({ ...prev, [memberId]: role }));
  }, []);

  const toggleAllVisible = useCallback(() => {
    const allOn = filtered.every((m) => selected[m.id]);
    setSelected((prev) => {
      const next = { ...prev };
      for (const m of filtered) {
        next[m.id] = !allOn;
      }
      return next;
    });
  }, [filtered, selected]);

  const handleSubmit = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.message('Select at least one member.');
      return;
    }
    setSubmitting(true);
    let ok = 0;
    let failed = 0;
    for (const memberId of selectedIds) {
      const role = roleByMember[memberId]?.trim() || ROLE_IN_DEPARTMENT_OPTIONS[0];
      try {
        await assignMemberToDepartment({
          member: memberId,
          department: departmentId,
          role_in_department: role,
        });
        ok += 1;
        const row = churchMembers.find((x) => x.id === memberId);
        memberActivityLog.logAdded(row ? displayName(row) : 'Member');
      } catch (e) {
        failed += 1;
        const msg = e instanceof Error ? e.message : 'Request failed';
        if (msg.toLowerCase().includes('already assigned')) {
          const row = churchMembers.find((x) => x.id === memberId);
          toast.message(`${row ? displayName(row) : 'Member'} is already in this department.`);
        }
      }
    }
    setSubmitting(false);
    if (ok > 0) {
      toast.success(`Added ${ok} member(s) to ${departmentName}.`);
    }
    if (failed > 0 && ok === 0) {
      toast.error('No members were added. Check duplicates or try again.');
    } else if (failed > 0) {
      toast.message(`${failed} assignment(s) could not be completed.`);
    }
    if (ok > 0) {
      onClose();
    }
  }, [
    selectedIds,
    roleByMember,
    departmentId,
    departmentName,
    churchMembers,
    onClose,
    memberActivityLog,
  ]);

  const cardBg = isDark ? '#0D1F36' : '#FFFFFF';
  const borderClr = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const text = isDark ? '#E2E8F0' : '#1f2937';
  const muted = isDark ? '#94A3B8' : '#6B7280';

  return (
    <div className="max-w-4xl mx-auto pb-10" style={{ color: text }}>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm mb-4 hover:opacity-90"
        style={{ color: muted }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to members
      </button>

      <div
        className="rounded-lg p-5 sm:p-6 mb-5"
        style={{ background: cardBg, border: `1px solid ${borderClr}` }}
      >
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: text }}>
          Add members to {departmentName}
        </h1>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: muted }}>
          Choose people who are already in your church directory. The department head and anyone
          already in this department are not shown. Each person can have a role in this department.
        </p>
      </div>

      <div
        className="rounded-lg p-4 sm:p-5"
        style={{ background: cardBg, border: `1px solid ${borderClr}` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: muted }}
            />
            <input
              type="search"
              placeholder="Search by name, phone, or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                border: `1px solid ${borderClr}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
                color: text,
              }}
            />
          </div>
          <button
            type="button"
            onClick={toggleAllVisible}
            disabled={filtered.length === 0}
            className="text-sm font-medium px-3 py-2 rounded-lg shrink-0 disabled:opacity-40"
            style={{ border: `1px solid ${borderClr}`, color: muted }}
          >
            {filtered.length > 0 && filtered.every((m) => selected[m.id])
              ? 'Clear visible'
              : 'Select visible'}
          </button>
        </div>

        {listError && (
          <p className="text-sm text-red-500 mb-3" role="alert">
            {listError}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2" style={{ color: muted }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading church members…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm py-10 text-center" style={{ color: muted }}>
            {available.length === 0
              ? 'Everyone in the directory is already in this department, or the directory is empty.'
              : 'No members match your search.'}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderClr}` }}>
                  <th className="text-left py-2.5 px-2 w-10" />
                  <th className="text-left py-2.5 px-2 font-medium" style={{ color: muted }}>
                    Name
                  </th>
                  <th className="text-left py-2.5 px-2 font-medium" style={{ color: muted }}>
                    Phone
                  </th>
                  <th className="text-left py-2.5 px-2 font-medium" style={{ color: muted }}>
                    Email
                  </th>
                  <th
                    className="text-left py-2.5 px-2 font-medium min-w-[140px]"
                    style={{ color: muted }}
                  >
                    Role in department
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const id = String(m.id);
                  const isSel = !!selected[id];
                  const roleVal = roleByMember[id] || ROLE_IN_DEPARTMENT_OPTIONS[0];
                  return (
                    <tr key={id} style={{ borderBottom: `1px solid ${borderClr}` }}>
                      <td className="py-2.5 px-2">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleOne(id)}
                          className="h-4 w-4 rounded cursor-pointer"
                          aria-label={`Select ${displayName(m)}`}
                        />
                      </td>
                      <td className="py-2.5 px-2 font-medium">{displayName(m)}</td>
                      <td className="py-2.5 px-2" style={{ color: muted }}>
                        {(m.location?.phone_primary || '—').toString()}
                      </td>
                      <td className="py-2.5 px-2 truncate max-w-[180px]" style={{ color: muted }}>
                        {(m.location?.email || '—').toString()}
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={roleVal}
                          disabled={!isSel}
                          onChange={(e) => setRole(id, e.target.value)}
                          className="w-full max-w-[200px] py-1.5 px-2 rounded-md text-xs sm:text-sm cursor-pointer disabled:opacity-45"
                          style={{
                            border: `1px solid ${borderClr}`,
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                            color: text,
                          }}
                        >
                          {ROLE_IN_DEPARTMENT_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4"
          style={{ borderTop: `1px solid ${borderClr}` }}
        >
          <span className="text-xs sm:text-sm mr-auto" style={{ color: muted }}>
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ border: `1px solid ${borderClr}`, color: muted }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || selectedIds.length === 0}
            onClick={() => void handleSubmit()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-45"
            style={{ backgroundColor: accent }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Add to department
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
