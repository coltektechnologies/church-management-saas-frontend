'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Users,
  Search,
  Shield,
  UserCog,
  Ban,
  UserCheck,
  Loader2,
  Pencil,
} from 'lucide-react';
import AddAdminModal from './AddAdminModal';
import EditStaffModal from './EditStaffModal';
import type { InviteStaffPayload } from './AddAdminModal';
import {
  groupLabels,
  staffDisplayName,
  type ChurchGroupOption,
  type StaffMember,
} from './adminManagementConfig';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/lib/settingsApi';
import { fetchRolesList } from '@/lib/rolesApi';
import { updateUser } from '@/lib/settingsApi';
import {
  deleteStaffUser,
  fetchChurchGroupsSelect,
  fetchStaffUserList,
  inviteStaffUser,
  mapApiUserToStaffMember,
} from '@/lib/adminStaffApi';

export type { StaffMember };

const ROLE_BADGE: Record<string, string> = {
  Pastor: 'bg-[#0B2A4A]/10 text-[#0B2A4A] border-[#0B2A4A]/25',
  'First Elder': 'bg-violet-50 text-violet-800 border-violet-200',
  Secretary: 'bg-sky-50 text-sky-800 border-sky-200',
  Treasurer: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Department Head': 'bg-amber-50 text-amber-800 border-amber-200',
  'Elder in charge': 'bg-teal-50 text-teal-800 border-teal-200',
  Member: 'bg-slate-50 text-slate-700 border-slate-200',
  Visitor: 'bg-stone-50 text-stone-600 border-stone-200',
  Unassigned: 'bg-slate-100 text-slate-600 border-slate-200',
};

function roleBadgeClass(roleName: string) {
  return ROLE_BADGE[roleName] ?? 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function AdminManagementTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [churchGroupCatalog, setChurchGroupCatalog] = useState<ChurchGroupOption[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [query, setQuery] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    setListLoading(true);
    setLoadError(null);
    const me = typeof window !== 'undefined' ? (getStoredUser()?.id ?? null) : null;
    try {
      const rows = await fetchStaffUserList();
      setStaff(rows.map((r) => mapApiUserToStaffMember(r, me)));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load team');
      setStaff([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const g = await fetchChurchGroupsSelect();
      setChurchGroupCatalog(g.map((x) => ({ id: x.id, name: x.name, roleHint: x.role_name })));
    } catch {
      setChurchGroupCatalog([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const teamOnly = useMemo(() => staff.filter((s) => !s.isOwner), [staff]);
  const owner = useMemo(() => staff.find((s) => s.isOwner), [staff]);
  const storedUser = typeof window !== 'undefined' ? getStoredUser() : null;

  const filteredTeam = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return teamOnly;
    }
    return teamOnly.filter((s) => {
      const name = staffDisplayName(s).toLowerCase();
      return (
        name.includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.roleName.toLowerCase().includes(q) ||
        groupLabels(s.churchGroupIds, churchGroupCatalog).some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [teamOnly, query, churchGroupCatalog]);

  const stats = useMemo(() => {
    const active = staff.filter((s) => s.status === 'active').length;
    const suspended = staff.filter((s) => s.status === 'suspended').length;
    return { active, suspended, total: staff.length };
  }, [staff]);

  const handleInvite = async (payload: InviteStaffPayload) => {
    const roles = await fetchRolesList();
    const role = roles.find((r) => r.name === payload.role_name);
    if (!role) {
      throw new Error(
        `Role "${payload.role_name}" was not found. Run backend seeding or create the role.`
      );
    }
    await inviteStaffUser(payload, role.id);
    toast.success(
      `${`${payload.first_name} ${payload.last_name}`.trim() || payload.email} was invited.`
    );
    await loadStaff();
  };

  const toggleSuspend = async (id: string) => {
    const target = staff.find((s) => s.id === id);
    if (!target || target.isOwner) {
      return;
    }
    const nextIsActive = target.status !== 'active';
    try {
      await updateUser(id, { is_active: nextIsActive });
      toast.message(nextIsActive ? 'User reactivated' : 'User suspended');
      await loadStaff();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update user');
    }
  };

  const handleRemove = async (id: string) => {
    const admin = staff.find((a) => a.id === id);
    if (!admin || admin.isOwner) {
      toast.error('This account cannot be removed here.');
      return;
    }
    if (
      !window.confirm(
        `Remove ${staffDisplayName(admin)}? They will lose access (soft delete on the server).`
      )
    ) {
      return;
    }
    try {
      await deleteStaffUser(id);
      toast.success('User removed');
      await loadStaff();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove user');
    }
  };

  return (
    <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A]">Admin management</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Invite staff, assign roles and church groups, and manage access. Data loads from your
            church&apos;s users and groups on the API.
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-[#2FC4B2] hover:bg-[#28b0a0] rounded-xl font-bold gap-2 shrink-0"
        >
          <Plus size={16} /> Invite staff
        </Button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-black uppercase text-slate-400">Total</p>
          <p className="text-xl font-black text-[#0B2A4A]">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-black uppercase text-slate-400">Active</p>
          <p className="text-xl font-black text-emerald-600">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-black uppercase text-slate-400">Suspended</p>
          <p className="text-xl font-black text-slate-500">{stats.suspended}</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-black uppercase text-slate-400">Team (excl. you)</p>
          <p className="text-xl font-black text-[#0B2A4A]">{teamOnly.length}</p>
        </div>
      </div>

      {(owner || storedUser) && (
        <div className="rounded-2xl border border-[#0B2A4A]/15 bg-gradient-to-br from-[#0B2A4A]/[0.04] to-[#2FC4B2]/[0.06] p-5">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#0B2A4A] text-white flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase text-[#0B2A4A]/70">Your account</p>
              <p className="font-black text-[#0B2A4A] text-lg truncate">
                {owner
                  ? staffDisplayName(owner)
                  : [storedUser?.first_name, storedUser?.last_name].filter(Boolean).join(' ') ||
                    storedUser?.email ||
                    '—'}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {(owner?.email || storedUser?.email) ?? '—'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {owner && (
                  <Badge
                    variant="outline"
                    className={cn('font-bold text-[10px]', roleBadgeClass(owner.roleName))}
                  >
                    {owner.roleName}
                  </Badge>
                )}
                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] font-bold">
                  Active
                </Badge>
              </div>
              {owner && owner.churchGroupIds.length > 0 && (
                <p className="text-[10px] text-slate-500 mt-2">
                  Groups: {groupLabels(owner.churchGroupIds, churchGroupCatalog).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0B2A4A]">
            <UserCog className="h-4 w-4 text-[#2FC4B2]" />
            Team directory
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role, group…"
              className="pl-9 h-10 rounded-xl bg-[var(--admin-surface)] border-[var(--admin-border)]"
            />
          </div>
        </div>

        {listLoading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[24px] border border-[var(--admin-border)] bg-muted/30 dark:bg-white/[0.03] gap-3">
            <Loader2 className="h-8 w-8 text-[#2FC4B2] animate-spin" />
            <p className="text-sm text-slate-600 font-medium">Loading team…</p>
          </div>
        ) : teamOnly.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 dark:bg-white/[0.03] rounded-[24px] border-2 border-dashed border-[var(--admin-border)]">
            <Users className="mx-auto text-slate-200 mb-4" size={40} />
            <p className="text-slate-600 font-bold">No additional staff yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Use <span className="font-semibold text-[#0B2A4A]">Invite staff</span> to add people.
              They will appear here after the invite succeeds.
            </p>
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-[var(--admin-border)] bg-muted/20 dark:bg-white/[0.03] text-sm text-muted-foreground">
            No matches for &quot;{query}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--admin-border)]">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 min-w-[180px]">
                    Name
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500">
                    Phone
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500">
                    Role
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 min-w-[140px]">
                    Groups
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 text-right min-w-[156px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeam.map((s) => (
                  <TableRow
                    key={s.id}
                    className={cn(
                      'hover:bg-slate-50/40',
                      s.status === 'suspended' && 'opacity-60 bg-slate-50/30'
                    )}
                  >
                    <TableCell>
                      <div className="font-bold text-sm text-[#0B2A4A]">{staffDisplayName(s)}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[220px]">
                        {s.email}
                      </div>
                      {s.username && (
                        <div className="text-[10px] text-slate-400">@{s.username}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {s.phone || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('font-bold text-[9px] border', roleBadgeClass(s.roleName))}
                      >
                        {s.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {s.churchGroupIds.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          groupLabels(s.churchGroupIds, churchGroupCatalog).map((g) => (
                            <Badge
                              key={g}
                              variant="secondary"
                              className="text-[9px] font-semibold bg-slate-100 text-slate-700"
                            >
                              {g}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          s.status === 'active'
                            ? 'bg-emerald-500 hover:bg-emerald-500 text-white text-[10px]'
                            : 'bg-slate-400 hover:bg-slate-400 text-white text-[10px]'
                        }
                      >
                        {s.status === 'active' ? 'Active' : 'Suspended'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-500 hover:text-[#0B2A4A]"
                          title="Edit user"
                          onClick={() => setEditStaff(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-500 hover:text-[#0B2A4A]"
                          title={s.status === 'active' ? 'Suspend' : 'Reactivate'}
                          onClick={() => void toggleSuspend(s.id)}
                        >
                          {s.status === 'active' ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleRemove(s.id)}
                          className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove user"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddAdminModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        churchGroups={churchGroupCatalog}
        groupsLoading={groupsLoading}
        onInvite={handleInvite}
      />

      {editStaff ? (
        <EditStaffModal
          open
          staff={editStaff}
          onClose={() => setEditStaff(null)}
          churchGroups={churchGroupCatalog}
          groupsLoading={groupsLoading}
          onSaved={loadStaff}
        />
      ) : null}
    </div>
  );
}
