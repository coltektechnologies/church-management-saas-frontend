'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Pencil,
  MessageCircle,
  UserMinus,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Mail,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getMembers, deleteMember, type MemberListItem } from '@/lib/api';
import { toast } from 'sonner';
import { DeleteMemberDialog } from '@/components/admin/membership/DeleteMemberDialog';
import { SendSmsDialog } from '@/components/admin/membership/SendSmsDialog';
import { SendEmailDialog } from '@/components/admin/membership/SendEmailDialog';
import {
  type MemberFilterState,
  applyMemberFilters,
  type FilterableMemberRow,
} from '@/lib/memberFilters';
import { useMembersPortal } from '@/components/admin/membership/MembersPortalContext';

type MemberRow = FilterableMemberRow;

const roleStyles: Record<string, string> = {
  Admin: 'bg-red-100 text-red-800',
  'Core Admin': 'bg-teal-100 text-teal-800',
  Member: 'bg-blue-100 text-blue-800',
  'Department Head': 'bg-amber-100 text-amber-800',
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'border-green-500 text-green-600 bg-white',
  INACTIVE: 'border-gray-400 text-gray-600 bg-gray-50',
  PENDING: 'border-amber-500 text-amber-600 bg-white',
  TRANSFER: 'border-blue-500 text-blue-600 bg-white',
  NEW_CONVERT: 'border-teal-500 text-teal-600 bg-white',
};

function formatDepartmentCell(names: string[] | undefined): string {
  if (!names?.length) {
    return '—';
  }
  return names.filter(Boolean).join(', ');
}

function mapToRow(m: MemberListItem): MemberRow {
  const loc = m.location as { phone_primary?: string; email?: string } | undefined;
  return {
    id: m.id,
    name: m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || '—',
    memberId: m.id.slice(0, 8).toUpperCase(),
    phone: loc?.phone_primary || (m as { phone_primary?: string }).phone_primary || '—',
    email: loc?.email || (m as { email?: string }).email || '—',
    department: formatDepartmentCell(m.department_names),
    role: 'Member',
    status: m.membership_status || 'ACTIVE',
    memberSince: m.member_since || '',
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export interface MembersTableProps {
  filters?: MemberFilterState;
}

export default function MembersTable({ filters }: MembersTableProps) {
  const router = useRouter();
  const { membersBasePath } = useMembersPortal();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [smsRecipientIds, setSmsRecipientIds] = useState<string[]>([]);
  const [emailRecipientIds, setEmailRecipientIds] = useState<string[]>([]);

  useEffect(() => {
    getMembers()
      .then((data) => setMembers(data.map(mapToRow)))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredMembers = applyMemberFilters(
    members,
    filters || {
      search: '',
      status: 'all',
      role: 'all',
      department: 'all',
      dateRange: 'all',
    }
  );

  const filterKey = useMemo(
    () =>
      [
        filters?.search ?? '',
        filters?.status ?? '',
        filters?.role ?? '',
        filters?.department ?? '',
        filters?.dateRange ?? '',
      ].join('|'),
    [filters?.search, filters?.status, filters?.role, filters?.department, filters?.dateRange]
  );

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / perPage));

  const [pagination, setPagination] = useState<{ key: string; page: number }>({
    key: '',
    page: 1,
  });

  const page =
    pagination.key === filterKey ? Math.min(Math.max(1, pagination.page), totalPages) : 1;

  const setPage = useCallback(
    (next: number | ((p: number) => number)) => {
      setPagination((prev) => {
        const base = prev.key === filterKey ? Math.min(Math.max(1, prev.page), totalPages) : 1;
        const resolved = typeof next === 'function' ? (next as (n: number) => number)(base) : next;
        const clamped = Math.max(1, Math.min(resolved, totalPages));
        return { key: filterKey, page: clamped };
      });
    },
    [filterKey, totalPages]
  );
  const paginated = filteredMembers.slice((page - 1) * perPage, page * perPage);
  const selectedCount = selectedIds.size;
  const isAllSelected = paginated.length > 0 && paginated.every((m) => selectedIds.has(m.id));
  const isSomeSelected = selectedIds.size > 0;
  const selectedMemberId = selectedCount === 1 ? Array.from(selectedIds)[0] : null;

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((m) => m.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const _handleView = (id: string) => router.push(`${membersBasePath}/${id}`);
  const _handleEdit = (id: string) => router.push(`${membersBasePath}/${id}/edit`);

  const handleSendMessage = (id: string) => {
    setSmsRecipientIds([id]);
    setSmsOpen(true);
  };
  const openDeleteForIds = (ids: string[]) => {
    setDeleteTargetIds(ids);
    setDeleteDialogOpen(true);
  };
  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    openDeleteForIds([id]);
  };

  const runDelete = async () => {
    const ids = deleteTargetIds;
    if (ids.length === 0) {
      return;
    }
    const isSingle = ids.length === 1;
    if (isSingle) {
      setDeletingId(ids[0]);
    } else {
      setBulkDeleteLoading(true);
    }
    let ok = 0;
    let failed = 0;
    for (const delId of ids) {
      try {
        await deleteMember(delId);
        setMembers((prev) => prev.filter((m) => m.id !== delId));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(delId);
          return next;
        });
        ok += 1;
      } catch {
        failed += 1;
      }
    }
    setDeletingId(null);
    setBulkDeleteLoading(false);
    setDeleteDialogOpen(false);
    setDeleteTargetIds([]);
    if (ok > 0) {
      toast.success(ok === 1 ? 'Member removed' : `${ok} members removed`, {
        description: 'Removed from your directory.',
      });
    }
    if (failed > 0) {
      toast.error(
        failed === 1 ? 'One member could not be deleted' : `${failed} members could not be deleted`
      );
    }
  };

  const handleBulkView = () => {
    if (selectedMemberId) {
      router.push(`${membersBasePath}/${selectedMemberId}`);
    }
  };
  const handleBulkEdit = () => {
    if (selectedMemberId) {
      router.push(`${membersBasePath}/${selectedMemberId}/edit`);
    }
  };
  const handleBulkSendMessage = () => {
    setSmsRecipientIds(Array.from(selectedIds));
    setSmsOpen(true);
  };
  const handleBulkSendEmail = () => {
    setEmailRecipientIds(Array.from(selectedIds));
    setEmailOpen(true);
  };
  const handleBulkDelete = () => {
    openDeleteForIds(Array.from(selectedIds));
  };

  const smsRecipients = smsRecipientIds
    .map((rid) => members.find((m) => m.id === rid))
    .filter((m): m is MemberRow => Boolean(m))
    .map((m) => ({ id: m.id, name: m.name, phone: m.phone }));

  const emailRecipients = emailRecipientIds
    .map((rid) => members.find((m) => m.id === rid))
    .filter((m): m is MemberRow => Boolean(m))
    .map((m) => ({ id: m.id, name: m.name, email: m.email }));

  const deleteDialogNames = deleteTargetIds.map((rid) => {
    const row = members.find((m) => m.id === rid);
    return row?.name ?? `Member ${rid.slice(0, 8)}`;
  });

  const deleteBusy = Boolean(deletingId) || bulkDeleteLoading;

  const renderRowActions = (member: MemberRow, compact?: boolean) => (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-1'
          : 'flex flex-nowrap items-center justify-center gap-0.5 sm:gap-1 shrink-0'
      }
    >
      <Link href={`${membersBasePath}/${member.id}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={`${membersBasePath}/${member.id}/edit`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:text-gray-700"
        title="Send Message"
        onClick={() => handleSendMessage(member.id)}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
        title="Delete"
        onClick={(e) => handleDeleteClick(member.id, e)}
        disabled={deleteBusy}
      >
        <UserMinus className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Dynamic action bar when members are selected */}
      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white shadow-sm w-full">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
            {selectedMemberId && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 flex-1 sm:flex-none"
                onClick={handleBulkView}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Button>
            )}
            {selectedMemberId && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 flex-1 sm:flex-none"
                onClick={handleBulkEdit}
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none"
              onClick={handleBulkSendMessage}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Send Message</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none"
              onClick={handleBulkSendEmail}
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Send Email</span>
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Selected</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Update Status</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleBulkDelete}
            >
              <UserMinus className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none text-gray-600 hover:text-gray-800"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden w-full min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-gray-100 bg-white">
          <h3
            className="text-lg font-bold shrink-0"
            style={{ color: 'var(--color-primary, #0B2A4A)' }}
          >
            All Members
          </h3>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-md border-gray-200 text-gray-500"
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-md border-[#0B2A4A] bg-[#0B2A4A] text-white hover:bg-[#0A2540] hover:text-white"
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md border-gray-200 text-xs"
            >
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md border-gray-200 text-xs"
            >
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md border-gray-200 text-xs"
            >
              Excel
            </Button>
          </div>
        </div>

        {/* Narrow screens: stacked cards */}
        <div className="md:hidden space-y-3 w-full min-w-0 px-4 pb-4 pt-2">
          {loading ? (
            <div className="rounded-lg border border-gray-100 bg-[#F6F8FA] py-12 text-center text-gray-500 text-sm">
              Loading members...
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-lg border border-gray-100 bg-[#F6F8FA] py-12 text-center text-gray-500 text-sm">
              No members found
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#F6F8FA] px-3 py-2">
                <input
                  type="checkbox"
                  className="h-5 w-5 min-w-5 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isSomeSelected && !isAllSelected;
                    }
                  }}
                  onChange={toggleAll}
                  aria-label="Select all members on this page"
                />
                <span className="text-sm text-gray-700">Select all on this page</span>
              </div>
              {paginated.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3 min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      className="h-5 w-5 min-w-5 shrink-0 mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                      checked={selectedIds.has(member.id)}
                      onChange={() => toggleMember(member.id)}
                      aria-label={`Select ${member.name}`}
                    />
                    <Avatar className="h-10 w-10 shrink-0 bg-green-100">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 break-words">{member.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{member.memberId}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                        statusStyles[member.status] || 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {member.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <dl className="grid grid-cols-1 gap-2 text-sm border-t border-gray-100 pt-3">
                    <div>
                      <dt className="text-gray-500 text-xs uppercase tracking-wide">Phone</dt>
                      <dd className="text-gray-900 break-all">{member.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 text-xs uppercase tracking-wide">Email</dt>
                      <dd className="text-gray-900 break-all">{member.email}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">
                          Department
                        </dt>
                        <dd className="text-gray-800 break-words">{member.department}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Role</dt>
                        <dd>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                              roleStyles[member.role] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {member.role}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">
                          Member since
                        </dt>
                        <dd className="text-gray-700">
                          {member.memberSince
                            ? format(new Date(member.memberSince), 'MMM d, yyyy')
                            : '—'}
                        </dd>
                      </div>
                    </div>
                  </dl>
                  <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-gray-100">
                    {renderRowActions(member, true)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* md+: fixed column layout so wide screens stay proportional */}
        <div className="hidden md:block w-full min-w-0 overflow-x-auto">
          <Table className="table-fixed w-full min-w-[980px]">
            <colgroup>
              <col style={{ width: '3rem' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11.5rem' }} />
            </colgroup>
            <TableHeader>
              <TableRow
                className="border-gray-200 hover:bg-transparent [&>th]:h-14 [&>th]:px-3 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide [&>th]:text-gray-500"
                style={{ background: 'var(--admin-bg, #F6F8FA)' }}
              >
                <TableHead className="w-12 align-middle">
                  <input
                    type="checkbox"
                    className="h-5 w-5 min-w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isSomeSelected && !isAllSelected;
                      }
                    }}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-gray-600">Member</TableHead>
                <TableHead className="text-gray-600">Contact</TableHead>
                <TableHead className="text-gray-600">Department</TableHead>
                <TableHead className="text-gray-600">Role</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600 whitespace-nowrap">Member Since</TableHead>
                <TableHead className="text-gray-600 text-center whitespace-nowrap w-[11.5rem] min-w-[11.5rem] max-w-[11.5rem]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-gray-200 hover:bg-gray-50/80"
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                  >
                    <TableCell className="align-middle px-3 py-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 min-w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        checked={selectedIds.has(member.id)}
                        onChange={() => toggleMember(member.id)}
                      />
                    </TableCell>
                    <TableCell className="align-middle px-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0 bg-green-100">
                          <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-semibold text-gray-900 truncate text-sm"
                            title={member.name}
                          >
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-mono">
                            {member.memberId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle px-3 py-3 whitespace-normal">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-gray-900 break-all leading-snug">
                          {member.phone}
                        </p>
                        <p className="text-xs text-gray-500 break-all leading-snug">
                          {member.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle px-3 py-3 text-sm text-gray-700 whitespace-normal">
                      <span className="line-clamp-3">{member.department}</span>
                    </TableCell>
                    <TableCell className="align-middle px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 rounded-md text-xs font-medium whitespace-normal text-center',
                          roleStyles[member.role] || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle px-3 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                          statusStyles[member.status] || 'border-gray-300 text-gray-600'
                        }`}
                      >
                        {member.status?.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm whitespace-nowrap align-middle px-3 py-3">
                      {member.memberSince
                        ? format(new Date(member.memberSince), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell className="align-middle px-2 py-3 whitespace-nowrap w-[11.5rem] min-w-[11.5rem] max-w-[11.5rem]">
                      {renderRowActions(member)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-gray-200"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-gray-200"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="h-9 min-w-[4.5rem] rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <DeleteMemberDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteTargetIds([]);
          }
        }}
        names={deleteDialogNames}
        loading={deleteBusy}
        onConfirm={runDelete}
      />
      <SendSmsDialog open={smsOpen} onOpenChange={setSmsOpen} recipients={smsRecipients} />
      <SendEmailDialog open={emailOpen} onOpenChange={setEmailOpen} recipients={emailRecipients} />
    </div>
  );
}
