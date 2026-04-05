'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';

import MembersFilterBar, { type MembersFilterValues } from './MembersFilterBar';
import MembersTableHeader, { type ViewMode } from './MembersTableHeader';
import MembersTable from './MembersTable';
import MembersGridView from './MembersGridView';
import AddMemberPage from './AddMemberPage';

import { DUMMY_MEMBERS, type DepartmentMember } from './membersDummyData';

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY_ADDED = 'dept_members_added_v1';
const STORAGE_KEY_DRAFTS = 'dept_drafts_v1';

/** Read user-added members from localStorage and merge with baseline. */
function readPersistedMembers(): DepartmentMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADDED);
    if (!raw) {
      return DUMMY_MEMBERS;
    }
    const added: DepartmentMember[] = JSON.parse(raw);
    // Exclude any stored item whose id collides with a dummy member (safety guard)
    const dummyIds = new Set(DUMMY_MEMBERS.map((m) => m.id));
    const safeAdded = added.filter((m) => !dummyIds.has(m.id));
    // Added members appear first (top of list), dummy members always follow
    return [...safeAdded, ...DUMMY_MEMBERS];
  } catch {
    return DUMMY_MEMBERS;
  }
}

function readPersistedDrafts(): DepartmentMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFTS);
    return raw ? (JSON.parse(raw) as DepartmentMember[]) : [];
  } catch {
    return [];
  }
}

/** Save only user-added members (not dummy baseline) to keep storage lean. */
function persistMembers(members: DepartmentMember[]) {
  try {
    const dummyIds = new Set(DUMMY_MEMBERS.map((m) => m.id));
    const added = members.filter((m) => !dummyIds.has(m.id));
    localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(added));
  } catch {
    /* quota exceeded or private browsing — ignore */
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
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // ── Lazy initialisers: read localStorage once on first render ─────────────
  // This is the canonical pattern — no useEffect + setState needed.
  const [members, setMembers] = useState<DepartmentMember[]>(() => {
    if (typeof window === 'undefined') {
      return DUMMY_MEMBERS;
    }
    return readPersistedMembers();
  });

  const [drafts, setDrafts] = useState<DepartmentMember[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    return readPersistedDrafts();
  });

  // ── Persist whenever state changes ────────────────────────────────────────
  // These effects only write to external storage — no setState inside, so no
  // cascading renders and no lint violation.
  useEffect(() => {
    persistMembers(members);
  }, [members]);
  useEffect(() => {
    persistDrafts(drafts);
  }, [drafts]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<MembersFilterValues>({
    search: '',
    status: 'All',
    role: 'All',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [exportTrigger, setExportTrigger] = useState<'csv' | 'pdf' | 'excel' | null>(null);

  // ── Combined list: drafts first (Pending badge), then active members ──────
  const allTableMembers = useMemo<DepartmentMember[]>(
    () => [...drafts, ...members],
    [drafts, members]
  );

  // ── Filtered list ─────────────────────────────────────────────────────────
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

  // ── onSubmit ───────────────────────────────────────────────────────────────
  // Called by AddMemberPage BEFORE showing the success screen.
  // We update + persist state but do NOT close the form — AddMemberPage owns that.
  const handleAddMember = useCallback(
    (data: Omit<DepartmentMember, 'id'>) => {
      if (editingMember) {
        const wasDraft = drafts.some((d) => d.id === editingMember.id);
        if (wasDraft) {
          // Promote draft → active member
          setDrafts((prev) => prev.filter((d) => d.id !== editingMember.id));
          setMembers((prev) => [{ ...data, id: `added-${Date.now()}` }, ...prev]);
        } else {
          // Update existing active member in-place
          setMembers((prev) =>
            prev.map((m) => (m.id === editingMember.id ? { ...m, ...data } : m))
          );
        }
        setEditingMember(null);
      } else {
        // New member → prepend with a unique id
        setMembers((prev) => [{ ...data, id: `added-${Date.now()}` }, ...prev]);
      }
      // ⚠️ Do NOT call setShowAddMember(false) — AddMemberPage shows success screen
    },
    [editingMember, drafts]
  );

  // ── onSaveDraft ────────────────────────────────────────────────────────────
  // Persists draft. Does NOT close form — AddMemberPage shows toast then calls onCancel.
  const handleSaveDraft = useCallback(
    (data: Omit<DepartmentMember, 'id'>) => {
      if (editingMember) {
        const wasDraft = drafts.some((d) => d.id === editingMember.id);
        if (wasDraft) {
          setDrafts((prev) =>
            prev.map((d) => (d.id === editingMember.id ? { ...d, ...data, status: 'Pending' } : d))
          );
        }
      } else {
        setDrafts((prev) => [{ ...data, id: `draft-${Date.now()}`, status: 'Pending' }, ...prev]);
      }
      // ⚠️ Do NOT close — AddMemberPage handles toast + navigation
    },
    [editingMember, drafts]
  );

  // ── closeForm — called by AddMemberPage when it wants to navigate back ────
  const closeForm = useCallback(() => {
    setShowAddMember(false);
    setEditingMember(null);
  }, []);

  // ── Table handlers ────────────────────────────────────────────────────────
  const handleView = useCallback((m: DepartmentMember) => {
    alert(`Viewing: ${m.name}\n${m.email}\n${m.phone}`);
  }, []);

  const handleEdit = useCallback((m: DepartmentMember) => {
    setEditingMember(m);
    setShowAddMember(true);
  }, []);

  const handleMessage = useCallback((m: DepartmentMember) => {
    alert(`Message: ${m.name}\n${m.phone}`);
  }, []);

  const handleRemove = useCallback((m: DepartmentMember) => {
    if (window.confirm(`Remove ${m.name}?`)) {
      setDrafts((prev) => prev.filter((d) => d.id !== m.id));
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
    }
  }, []);

  const handleAssignRole = useCallback((m: DepartmentMember) => {
    alert(`Assign Role to: ${m.name}\nCurrent: ${m.role}`);
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const cardBg = isDark ? '#0D1F36' : '#FFFFFF';
  const borderClr = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const headName = isReady
    ? profile.preferredName?.trim() || profile.headName || 'Department Head'
    : 'Department Head';

  // ── Render: form ──────────────────────────────────────────────────────────
  if (showAddMember) {
    return (
      <AddMemberPage
        onSubmit={handleAddMember}
        onSaveDraft={handleSaveDraft}
        onCancel={closeForm}
        editMember={editingMember}
        addedByName={headName}
      />
    );
  }

  // ── Render: members table ─────────────────────────────────────────────────
  return (
    <>
      <MembersFilterBar
        values={filters}
        onChange={setFilters}
        onAddMember={() => {
          setEditingMember(null);
          setShowAddMember(true);
        }}
      />

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

        {viewMode === 'table' ? (
          <MembersTable
            members={filtered}
            onView={handleView}
            onEdit={handleEdit}
            onMessage={handleMessage}
            onRemoveMember={handleRemove}
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
