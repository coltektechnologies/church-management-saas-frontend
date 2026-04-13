'use client';

import { useEffect, useMemo, useState } from 'react';
import { Department } from '@/types/Department';
import { usePermissions } from '@/hooks/usePermissions';
import type { MemberListItem } from '@/lib/api';
import type { DepartmentMemberUI } from '@/lib/departmentsApi';
import {
  setDepartmentAssistantHead,
  setDepartmentHead,
  updateDepartment,
} from '@/lib/departmentsApi';
import { fetchRolesList, fetchUserRolesForRole, type RoleRow } from '@/lib/rolesApi';

function memberDisplayName(m: MemberListItem): string {
  const full = m.full_name?.trim();
  if (full) {
    return full;
  }
  const parts = [m.first_name, m.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Member';
}

function sortMembers(list: MemberListItem[]): MemberListItem[] {
  return [...list].sort((a, b) =>
    memberDisplayName(a).localeCompare(memberDisplayName(b), undefined, { sensitivity: 'base' })
  );
}

function optionsWithSelectedMember(
  list: MemberListItem[],
  churchMembers: MemberListItem[],
  selectedMemberId: string
): MemberListItem[] {
  if (!selectedMemberId) {
    return list;
  }
  if (list.some((m) => m.id === selectedMemberId)) {
    return list;
  }
  const extra = churchMembers.find((m) => m.id === selectedMemberId);
  return extra ? sortMembers([...list, extra]) : list;
}

/** Members who have `system_user_id` assigned under the given role (church user–roles). */
function membersForUserRoleIds(
  churchMembers: MemberListItem[],
  userIds: Set<string>
): MemberListItem[] {
  return sortMembers(
    churchMembers.filter((m) => m.system_user_id && userIds.has(String(m.system_user_id)))
  );
}

interface Props {
  department: Department;
  onUpdateDepartment: (updated: Department) => void;
  churchMembers: MemberListItem[];
  departmentMembers: DepartmentMemberUI[];
  onLeadershipSaved: () => Promise<void>;
}

export default function SettingsTab({
  department,
  onUpdateDepartment,
  churchMembers,
  departmentMembers: _departmentMembers,
  onLeadershipSaved,
}: Props) {
  const { can } = usePermissions();
  const canEdit = can('canEditSettings');
  const canLeadership = can('canEditDepartment');

  const settings = department.settings;

  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [threshold, setThreshold] = useState(settings.autoApprovalThreshold);
  const [requiresElderApproval, setRequiresElderApproval] = useState(
    settings.requiresElderApproval
  );
  const [weeklySummary, setWeeklySummary] = useState(settings.weeklySummary);
  const [canSubmitAnnouncements, setCanSubmitAnnouncements] = useState(
    settings.canSubmitAnnouncements
  );

  const [rolesCatalog, setRolesCatalog] = useState<RoleRow[]>([]);
  const [rolesLoadError, setRolesLoadError] = useState<string | null>(null);

  const [showHeadDialog, setShowHeadDialog] = useState(false);
  const [showAsstDialog, setShowAsstDialog] = useState(false);
  const [showElderDialog, setShowElderDialog] = useState(false);
  const [pickHeadId, setPickHeadId] = useState('');
  const [pickAsstId, setPickAsstId] = useState('');
  const [pickElderId, setPickElderId] = useState('');
  const [leadershipError, setLeadershipError] = useState<string | null>(null);
  const [leadershipBusy, setLeadershipBusy] = useState(false);

  const [headRoleFilter, setHeadRoleFilter] = useState('');
  const [headShowAllMembers, setHeadShowAllMembers] = useState(false);
  const [headUserIds, setHeadUserIds] = useState<Set<string>>(() => new Set());
  const [headUsersLoading, setHeadUsersLoading] = useState(false);

  const [asstRoleFilter, setAsstRoleFilter] = useState('');
  const [asstShowAllMembers, setAsstShowAllMembers] = useState(false);
  const [asstUserIds, setAsstUserIds] = useState<Set<string>>(() => new Set());
  const [asstUsersLoading, setAsstUsersLoading] = useState(false);

  const [elderRoleFilter, setElderRoleFilter] = useState('');
  const [elderShowAllMembers, setElderShowAllMembers] = useState(false);
  const [elderUserIds, setElderUserIds] = useState<Set<string>>(() => new Set());
  const [elderUsersLoading, setElderUsersLoading] = useState(false);

  useEffect(() => {
    if (!showHeadDialog && !showAsstDialog && !showElderDialog) {
      return;
    }
    let cancelled = false;
    setRolesLoadError(null);
    fetchRolesList()
      .then((rows) => {
        if (!cancelled) {
          setRolesCatalog(rows);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setRolesLoadError(e instanceof Error ? e.message : 'Could not load roles');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showHeadDialog, showAsstDialog, showElderDialog]);

  useEffect(() => {
    if (!showHeadDialog || headShowAllMembers || !headRoleFilter) {
      setHeadUserIds(new Set());
      setHeadUsersLoading(false);
      return;
    }
    let cancelled = false;
    setHeadUsersLoading(true);
    fetchUserRolesForRole(headRoleFilter)
      .then((rows) => {
        if (!cancelled) {
          setHeadUserIds(new Set(rows.map((r) => String(r.user))));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeadUserIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHeadUsersLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showHeadDialog, headRoleFilter, headShowAllMembers]);

  useEffect(() => {
    if (!showAsstDialog || asstShowAllMembers || !asstRoleFilter) {
      setAsstUserIds(new Set());
      setAsstUsersLoading(false);
      return;
    }
    let cancelled = false;
    setAsstUsersLoading(true);
    fetchUserRolesForRole(asstRoleFilter)
      .then((rows) => {
        if (!cancelled) {
          setAsstUserIds(new Set(rows.map((r) => String(r.user))));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAsstUserIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAsstUsersLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showAsstDialog, asstRoleFilter, asstShowAllMembers]);

  useEffect(() => {
    if (!showElderDialog || elderShowAllMembers || !elderRoleFilter) {
      setElderUserIds(new Set());
      setElderUsersLoading(false);
      return;
    }
    let cancelled = false;
    setElderUsersLoading(true);
    fetchUserRolesForRole(elderRoleFilter)
      .then((rows) => {
        if (!cancelled) {
          setElderUserIds(new Set(rows.map((r) => String(r.user))));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setElderUserIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setElderUsersLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showElderDialog, elderRoleFilter, elderShowAllMembers]);

  const headPickerMembers = useMemo(() => {
    if (headShowAllMembers) {
      return sortMembers(churchMembers);
    }
    if (headRoleFilter) {
      return membersForUserRoleIds(churchMembers, headUserIds);
    }
    return [];
  }, [churchMembers, headShowAllMembers, headRoleFilter, headUserIds]);

  const elderPickerMembers = useMemo(() => {
    if (elderShowAllMembers) {
      return sortMembers(churchMembers);
    }
    if (elderRoleFilter) {
      return membersForUserRoleIds(churchMembers, elderUserIds);
    }
    return [];
  }, [churchMembers, elderShowAllMembers, elderRoleFilter, elderUserIds]);

  const headSelectOptions = useMemo(
    () => optionsWithSelectedMember(headPickerMembers, churchMembers, pickHeadId),
    [headPickerMembers, churchMembers, pickHeadId]
  );

  const asstPickerMembers = useMemo(() => {
    if (asstShowAllMembers) {
      return sortMembers(churchMembers);
    }
    if (asstRoleFilter) {
      return membersForUserRoleIds(churchMembers, asstUserIds);
    }
    return [];
  }, [churchMembers, asstShowAllMembers, asstRoleFilter, asstUserIds]);

  const asstSelectOptions = useMemo(
    () => optionsWithSelectedMember(asstPickerMembers, churchMembers, pickAsstId),
    [asstPickerMembers, churchMembers, pickAsstId]
  );

  const elderSelectOptions = useMemo(
    () => optionsWithSelectedMember(elderPickerMembers, churchMembers, pickElderId),
    [elderPickerMembers, churchMembers, pickElderId]
  );

  const openHeadDialog = () => {
    setLeadershipError(null);
    setHeadRoleFilter('');
    setHeadShowAllMembers(false);
    setPickHeadId(department.headMemberId ?? '');
    setHeadUserIds(new Set());
    setShowHeadDialog(true);
  };

  const openAsstDialog = () => {
    setLeadershipError(null);
    setAsstRoleFilter('');
    setAsstShowAllMembers(false);
    setPickAsstId(department.assistantHeadMemberId ?? '');
    setAsstUserIds(new Set());
    setShowAsstDialog(true);
  };

  const openElderDialog = () => {
    setLeadershipError(null);
    setElderRoleFilter('');
    setElderShowAllMembers(false);
    setPickElderId(department.elderInChargeMemberId ?? '');
    setElderUserIds(new Set());
    setShowElderDialog(true);
  };

  const handleSave = () => {
    onUpdateDepartment({
      ...department,
      settings: {
        autoApprovalThreshold: threshold,
        requiresElderApproval,
        weeklySummary,
        canSubmitAnnouncements,
      },
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelEdit = () => {
    setThreshold(settings.autoApprovalThreshold);
    setRequiresElderApproval(settings.requiresElderApproval);
    setWeeklySummary(settings.weeklySummary);
    setCanSubmitAnnouncements(settings.canSubmitAnnouncements);
    setIsEditing(false);
  };

  const handleArchive = () => {
    onUpdateDepartment({ ...department, status: 'inactive' });
    setShowArchiveConfirm(false);
  };

  const saveHead = async () => {
    if (!pickHeadId) {
      setLeadershipError('Select a member.');
      return;
    }
    setLeadershipBusy(true);
    setLeadershipError(null);
    try {
      await setDepartmentHead(department.id, pickHeadId);
      await onLeadershipSaved();
      setShowHeadDialog(false);
      setPickHeadId('');
    } catch (e) {
      setLeadershipError(e instanceof Error ? e.message : 'Could not assign department head');
    } finally {
      setLeadershipBusy(false);
    }
  };

  const saveAsst = async (clear: boolean) => {
    if (!clear && !pickAsstId) {
      setLeadershipError('Select a member or use Remove assistant head.');
      return;
    }
    setLeadershipBusy(true);
    setLeadershipError(null);
    try {
      await setDepartmentAssistantHead(department.id, clear ? null : pickAsstId);
      await onLeadershipSaved();
      setShowAsstDialog(false);
      setPickAsstId('');
    } catch (e) {
      setLeadershipError(
        e instanceof Error ? e.message : 'Could not update assistant department head'
      );
    } finally {
      setLeadershipBusy(false);
    }
  };

  const saveElder = async (clear: boolean) => {
    if (!clear && !pickElderId) {
      setLeadershipError('Select a member or use Remove elder.');
      return;
    }
    setLeadershipBusy(true);
    setLeadershipError(null);
    try {
      await updateDepartment(department.id, {
        elder_in_charge: clear ? null : pickElderId,
      });
      await onLeadershipSaved();
      setShowElderDialog(false);
      setPickElderId('');
    } catch (e) {
      setLeadershipError(e instanceof Error ? e.message : 'Could not update elder in charge');
    } finally {
      setLeadershipBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Department Settings</h3>
          {!canEdit && (
            <p className="text-sm text-gray-400 mt-0.5">
              You have read-only access to these settings.
            </p>
          )}
        </div>
        {saveSuccess && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            ✓ Settings saved successfully
          </p>
        )}
      </div>

      {/* Leadership — API-backed department head & elder in charge */}
      {canLeadership && (
        <div className="border border-gray-200 rounded-xl p-6 space-y-4 bg-slate-50/80">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Leadership</h4>
            <p className="text-sm text-gray-600 mt-1">
              Pick a <strong>church role</strong> (e.g. Department Head, Assistant Head, Elder in
              charge) to list members who have that role and portal access, or show all members.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openHeadDialog}
              className="bg-[#0B2A4A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              {department.headDisplayName ? 'Change department head' : 'Assign department head'}
            </button>
            <button
              type="button"
              onClick={openAsstDialog}
              className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              {department.assistantHeadDisplayName
                ? 'Change assistant head'
                : 'Assign assistant head'}
            </button>
            <button
              type="button"
              onClick={openElderDialog}
              className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              {department.elderInChargeDisplayName
                ? 'Change elder in charge'
                : 'Assign elder in charge'}
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <span className="text-gray-500">Department head:</span>{' '}
              <span className="font-medium">
                {department.headDisplayName?.trim() || 'Not assigned'}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Assistant head:</span>{' '}
              <span className="font-medium">
                {department.assistantHeadDisplayName?.trim() || 'Not assigned'}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Elder in charge:</span>{' '}
              <span className="font-medium">
                {department.elderInChargeDisplayName?.trim() || 'Not assigned'}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Auto-approval Threshold */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Auto-approval Threshold</p>
          {isEditing ? (
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border rounded-lg px-3 py-1.5 w-32 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <p className="text-lg font-semibold mt-1">GHS {settings.autoApprovalThreshold}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Expense requests below this amount are automatically approved.
          </p>
        </div>

        {/* Requires Elder Approval */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Requires Elder Approval</p>
          {isEditing ? (
            <select
              value={requiresElderApproval ? 'yes' : 'no'}
              onChange={(e) => setRequiresElderApproval(e.target.value === 'yes')}
              className="border rounded-lg px-3 py-1.5 mt-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          ) : (
            <p className="text-lg font-semibold mt-1">
              {settings.requiresElderApproval ? 'Yes' : 'No'}
            </p>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Weekly Summary</p>
          {isEditing ? (
            <select
              value={weeklySummary ? 'enabled' : 'disabled'}
              onChange={(e) => setWeeklySummary(e.target.value === 'enabled')}
              className="border rounded-lg px-3 py-1.5 mt-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          ) : (
            <p className="text-lg font-semibold mt-1">
              {settings.weeklySummary ? 'Enabled' : 'Disabled'}
            </p>
          )}
        </div>

        {/* Can Submit Announcements */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Can Submit Announcements</p>
          {isEditing ? (
            <select
              value={canSubmitAnnouncements ? 'yes' : 'no'}
              onChange={(e) => setCanSubmitAnnouncements(e.target.value === 'yes')}
              className="border rounded-lg px-3 py-1.5 mt-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          ) : (
            <p className="text-lg font-semibold mt-1">
              {settings.canSubmitAnnouncements ? 'Yes' : 'No'}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons — only shown if user can edit */}
      {canEdit && (
        <div className="flex gap-4 pt-6">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Edit Settings
              </button>
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(true)}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Archive Department
              </button>
            </>
          )}
        </div>
      )}

      {/* Assign department head */}
      {showHeadDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => !leadershipBusy && setShowHeadDialog(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-900">Assign department head</h4>
            <p className="text-sm text-gray-600">
              Choose a church role to list members who have that role in the portal, or show all
              members. Only members linked to a user account appear when filtering by role.
            </p>
            {rolesLoadError && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {rolesLoadError}
              </p>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Church role</label>
              <select
                value={headRoleFilter}
                disabled={headShowAllMembers || leadershipBusy}
                onChange={(e) => setHeadRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— Select role —</option>
                {rolesCatalog.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={headShowAllMembers}
                disabled={leadershipBusy}
                onChange={(e) => setHeadShowAllMembers(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show all members
            </label>
            {!headShowAllMembers && headRoleFilter && headUsersLoading && (
              <p className="text-xs text-gray-500">Loading members for this role…</p>
            )}
            {!headShowAllMembers &&
              headRoleFilter &&
              !headUsersLoading &&
              headUserIds.size === 0 && (
                <p className="text-xs text-gray-500">
                  No users with this role, or none linked to a member record. Try &quot;Show all
                  members&quot; or another role.
                </p>
              )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Member</label>
              <select
                value={pickHeadId}
                disabled={
                  leadershipBusy || (!headShowAllMembers && !headRoleFilter) || headUsersLoading
                }
                onChange={(e) => setPickHeadId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Select member…</option>
                {headSelectOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberDisplayName(m)}
                  </option>
                ))}
              </select>
            </div>
            {!headShowAllMembers && !headRoleFilter && (
              <p className="text-xs text-gray-500">
                Select a role above or turn on Show all members.
              </p>
            )}
            {leadershipError && <p className="text-sm text-red-600">{leadershipError}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                disabled={leadershipBusy}
                onClick={() => setShowHeadDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={leadershipBusy}
                onClick={() => void saveHead()}
                className="px-4 py-2 text-sm bg-[#0B2A4A] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {leadershipBusy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign assistant department head */}
      {showAsstDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => !leadershipBusy && setShowAsstDialog(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-900">Assistant department head</h4>
            <p className="text-sm text-gray-600">
              Same picker as department head: filter by church role or show all members. The primary
              head cannot be selected as assistant.
            </p>
            {rolesLoadError && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {rolesLoadError}
              </p>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Church role</label>
              <select
                value={asstRoleFilter}
                disabled={asstShowAllMembers || leadershipBusy}
                onChange={(e) => setAsstRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— Select role —</option>
                {rolesCatalog.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={asstShowAllMembers}
                disabled={leadershipBusy}
                onChange={(e) => setAsstShowAllMembers(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show all members
            </label>
            {!asstShowAllMembers && asstRoleFilter && asstUsersLoading && (
              <p className="text-xs text-gray-500">Loading members for this role…</p>
            )}
            {!asstShowAllMembers &&
              asstRoleFilter &&
              !asstUsersLoading &&
              asstUserIds.size === 0 && (
                <p className="text-xs text-gray-500">
                  No users with this role, or none linked to a member record. Try &quot;Show all
                  members&quot; or another role.
                </p>
              )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Member</label>
              <select
                value={pickAsstId}
                disabled={
                  leadershipBusy || (!asstShowAllMembers && !asstRoleFilter) || asstUsersLoading
                }
                onChange={(e) => setPickAsstId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— None —</option>
                {asstSelectOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberDisplayName(m)}
                  </option>
                ))}
              </select>
            </div>
            {!asstShowAllMembers && !asstRoleFilter && (
              <p className="text-xs text-gray-500">
                Select a role above or turn on Show all members.
              </p>
            )}
            {leadershipError && <p className="text-sm text-red-600">{leadershipError}</p>}
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              {department.assistantHeadMemberId && (
                <button
                  type="button"
                  disabled={leadershipBusy}
                  onClick={() => void saveAsst(true)}
                  className="px-4 py-2 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Remove assistant head
                </button>
              )}
              <button
                type="button"
                disabled={leadershipBusy}
                onClick={() => setShowAsstDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={leadershipBusy}
                onClick={() => void saveAsst(false)}
                className="px-4 py-2 text-sm bg-[#0B2A4A] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {leadershipBusy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign elder in charge */}
      {showElderDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => !leadershipBusy && setShowElderDialog(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-900">Elder in charge</h4>
            <p className="text-sm text-gray-600">
              Oversight elder for this department. Filter by church role (e.g. Elder in charge) or
              show all members.
            </p>
            {rolesLoadError && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {rolesLoadError}
              </p>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Church role</label>
              <select
                value={elderRoleFilter}
                disabled={elderShowAllMembers || leadershipBusy}
                onChange={(e) => setElderRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— Select role —</option>
                {rolesCatalog.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={elderShowAllMembers}
                disabled={leadershipBusy}
                onChange={(e) => setElderShowAllMembers(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show all members
            </label>
            {!elderShowAllMembers && elderRoleFilter && elderUsersLoading && (
              <p className="text-xs text-gray-500">Loading members for this role…</p>
            )}
            {!elderShowAllMembers &&
              elderRoleFilter &&
              !elderUsersLoading &&
              elderUserIds.size === 0 && (
                <p className="text-xs text-gray-500">
                  No users with this role, or none linked to a member record. Try &quot;Show all
                  members&quot; or another role.
                </p>
              )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Member</label>
              <select
                value={pickElderId}
                disabled={
                  leadershipBusy || (!elderShowAllMembers && !elderRoleFilter) || elderUsersLoading
                }
                onChange={(e) => setPickElderId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— None —</option>
                {elderSelectOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberDisplayName(m)}
                  </option>
                ))}
              </select>
            </div>
            {!elderShowAllMembers && !elderRoleFilter && (
              <p className="text-xs text-gray-500">
                Select a role above or turn on Show all members.
              </p>
            )}
            {leadershipError && <p className="text-sm text-red-600">{leadershipError}</p>}
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              {department.elderInChargeMemberId && (
                <button
                  type="button"
                  disabled={leadershipBusy}
                  onClick={() => void saveElder(true)}
                  className="px-4 py-2 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Remove elder
                </button>
              )}
              <button
                type="button"
                disabled={leadershipBusy}
                onClick={() => setShowElderDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={leadershipBusy}
                onClick={() => void saveElder(false)}
                className="px-4 py-2 text-sm bg-[#0B2A4A] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {leadershipBusy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowArchiveConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Archive Department?</h4>
            <p className="text-sm text-gray-600">
              This will mark <span className="font-medium">{department.name}</span> as inactive.
              Members and data will be preserved but the department won&apos;t appear as active.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Yes, Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
