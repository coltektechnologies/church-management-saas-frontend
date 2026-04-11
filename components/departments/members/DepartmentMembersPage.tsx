'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { departmentMembersPortal } from '@/lib/departmentMembersPortal';
import { useDepartments } from '@/context/DepartmentsContext';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useLogDeptMember } from '@/components/departments/contexts/DeptActivityContext';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import {
  fetchDepartmentMembers,
  fetchMemberDepartments,
  removeMemberFromDepartment,
} from '@/lib/departmentsApi';
import {
  mapDepartmentMemberApiRow,
  indexAssignmentsByMember,
} from '@/components/departments/members/mapDepartmentMembersApi';

import MembersFilterBar, { type MembersFilterValues } from './MembersFilterBar';
import MembersTableHeader, { type ViewMode } from './MembersTableHeader';
import MembersTable from './MembersTable';
import MembersGridView from './MembersGridView';
import DepartmentAssignMembersPage from './DepartmentAssignMembersPage';
import RemoveFromDepartmentDialog from './RemoveFromDepartmentDialog';
import { toast } from 'sonner';

import type { DepartmentMember } from './membersDummyData';

// ─────────────────────────────────────────────────────────────────────────────
// Draft localStorage (form only — not synced to API)
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY_DRAFTS = 'dept_drafts_v1';

function readPersistedDrafts(): DepartmentMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFTS);
    return raw ? (JSON.parse(raw) as DepartmentMember[]) : [];
  } catch {
    return [];
  }
}

function persistDrafts(drafts: DepartmentMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
  } catch {
    /* ignore */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DepartmentMembersPage() {
  const router = useRouter();
  const { loading: departmentsLoading } = useDepartments();
  const department = usePortalDepartment();
  const departmentId = department?.id ?? '';

  const { profile, isReady, portalIdentityLoaded } = useDepartmentProfile();
  const memberActivityLog = useLogDeptMember();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const [remoteMembers, setRemoteMembers] = useState<DepartmentMember[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  /** Session-only rows from Add Member form (not persisted; not on server). */
  const [optimisticMembers, setOptimisticMembers] = useState<DepartmentMember[]>([]);

  const [drafts, setDrafts] = useState<DepartmentMember[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    return readPersistedDrafts();
  });

  useEffect(() => {
    persistDrafts(drafts);
  }, [drafts]);

  const loadRemoteMembers = useCallback(async () => {
    if (!departmentId) {
      setRemoteMembers([]);
      setListError(null);
      setListLoading(false);
      return;
    }
    setListError(null);
    setListLoading(true);
    try {
      const [apiMembers, assignments] = await Promise.all([
        fetchDepartmentMembers(departmentId),
        fetchMemberDepartments(),
      ]);
      const byMember = indexAssignmentsByMember(assignments, departmentId);
      const mapped = apiMembers.map((r) =>
        mapDepartmentMemberApiRow(r, byMember.get(String(r.id)))
      );
      setRemoteMembers(mapped);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load members');
      setRemoteMembers([]);
    } finally {
      setListLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    void loadRemoteMembers();
  }, [loadRemoteMembers]);

  const [filters, setFilters] = useState<MembersFilterValues>({
    search: '',
    status: 'All',
    role: 'All',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [showAddMember, setShowAddMember] = useState(false);
  const [exportTrigger, setExportTrigger] = useState<'csv' | 'pdf' | 'excel' | null>(null);

  const [removeDialogMembers, setRemoveDialogMembers] = useState<DepartmentMember[] | null>(null);
  const bulkRemoveResolversRef = useRef<(() => void)[]>([]);

  const flushBulkRemoveWaiters = useCallback(() => {
    const waiters = bulkRemoveResolversRef.current.splice(0);
    waiters.forEach((r) => r());
  }, []);

  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  /** Already in this department, plus primary department head (not assignable as a regular add). */
  const assignExcludedMemberIds = useMemo(() => {
    const s = new Set(remoteMembers.map((m) => String(m.id)));
    const headId = department?.headMemberId;
    if (headId) {
      s.add(String(headId));
    }
    return s;
  }, [remoteMembers, department?.headMemberId]);

  const allTableMembers = useMemo<DepartmentMember[]>(
    () => [...drafts, ...optimisticMembers, ...remoteMembers],
    [drafts, optimisticMembers, remoteMembers]
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return allTableMembers.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.departments.some((d) => d.toLowerCase().includes(q));
      const matchStatus = filters.status === 'All' || m.status === filters.status;
      const matchRole =
        filters.role === 'All' || m.role.toLowerCase().includes(filters.role.toLowerCase());
      return matchSearch && matchStatus && matchRole;
    });
  }, [allTableMembers, filters]);

  const closeAssignFlow = useCallback(() => {
    setShowAddMember(false);
    void loadRemoteMembers();
  }, [loadRemoteMembers]);

  const handleView = useCallback(
    (m: DepartmentMember) => {
      router.push(`${departmentMembersPortal.membersBasePath}/${m.id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (m: DepartmentMember) => {
      router.push(`${departmentMembersPortal.membersBasePath}/${m.id}/edit`);
    },
    [router]
  );

  const runRemoval = useCallback(
    async (members: DepartmentMember[]) => {
      for (const m of members) {
        if (m.assignmentId) {
          await removeMemberFromDepartment(m.assignmentId);
        }
        setOptimisticMembers((prev) => prev.filter((x) => x.id !== m.id));
        setDrafts((prev) => prev.filter((d) => d.id !== m.id));
      }
      await loadRemoteMembers();
    },
    [loadRemoteMembers]
  );

  const handleBulkRemoveMembers = useCallback(async (selected: DepartmentMember[]) => {
    if (selected.length === 0) {
      return;
    }
    return new Promise<void>((resolve) => {
      bulkRemoveResolversRef.current.push(resolve);
      setRemoveDialogMembers(selected);
    });
  }, []);

  const handleMessage = useCallback((m: DepartmentMember) => {
    alert(`Message: ${m.name}\n${m.phone}`);
  }, []);

  const handleRemove = useCallback((m: DepartmentMember) => {
    setRemoveDialogMembers([m]);
  }, []);

  const onRemoveDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setRemoveDialogMembers(null);
      flushBulkRemoveWaiters();
    }
  }, [flushBulkRemoveWaiters]);

  const handleConfirmRemove = useCallback(
    async (members: DepartmentMember[]) => {
      await runRemoval(members);
      for (const m of members) {
        memberActivityLog.logRemoved(m.name);
      }
      toast.success(
        members.length > 1
          ? `${members.length} people removed from this department.`
          : `${members[0]?.name ?? 'Member'} removed from this department.`
      );
    },
    [runRemoval, memberActivityLog]
  );

  const handleAssignRole = useCallback((m: DepartmentMember) => {
    alert(`Assign Role to: ${m.name}\nCurrent: ${m.role}`);
  }, []);

  const cardBg = isDark ? '#0D1F36' : '#FFFFFF';
  const borderClr = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  if (showAddMember && department) {
    return (
      <DepartmentAssignMembersPage
        departmentId={departmentId}
        departmentName={department.name}
        excludedMemberIds={assignExcludedMemberIds}
        onClose={closeAssignFlow}
      />
    );
  }

  if (!portalIdentityLoaded || (departmentsLoading && !department)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-8">
        <p className="text-gray-400 text-sm animate-pulse">Loading members…</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-8">
        <p className="text-gray-500 text-sm text-center max-w-md">
          No department is linked to your account.
        </p>
      </div>
    );
  }

  return (
    <>
      <RemoveFromDepartmentDialog
        open={removeDialogMembers !== null && removeDialogMembers.length > 0}
        members={removeDialogMembers ?? []}
        departmentName={department.name}
        isDark={isDark}
        accentColor={accentColor}
        onOpenChange={onRemoveDialogOpenChange}
        onRemove={handleConfirmRemove}
      />

      <MembersFilterBar
        values={filters}
        onChange={setFilters}
        onAddMember={() => setShowAddMember(true)}
      />

      {listError && (
        <div
          className="mt-3 px-4 py-2 rounded-lg text-sm border"
          style={{
            background: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
            borderColor: isDark ? 'rgba(248,113,113,0.35)' : '#FECACA',
            color: isDark ? '#FCA5A5' : '#B91C1C',
          }}
        >
          {listError}
        </div>
      )}

      <div
        className="mt-4 overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${borderClr}`, borderRadius: '4px' }}
      >
        <MembersTableHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={filtered.length}
          onExport={(fmt) => setExportTrigger(fmt)}
        />

        {listLoading && remoteMembers.length === 0 && !listError ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse">
            Loading members…
          </div>
        ) : viewMode === 'table' ? (
          <MembersTable
            members={filtered}
            onView={handleView}
            onEdit={handleEdit}
            onMessage={handleMessage}
            onRemoveMember={handleRemove}
            onBulkRemoveMembers={handleBulkRemoveMembers}
            exportTrigger={exportTrigger}
            onExportDone={() => setExportTrigger(null)}
          />
        ) : (
          <MembersGridView
            members={filtered}
            onView={handleView}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAssignRole={handleAssignRole}
          />
        )}
      </div>
    </>
  );
}
