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

type MemberRow = FilterableMemberRow;

const roleStyles: Record<string, string> = {
  Admin: 'bg-red-100 text-red-800',
  'Core Admin': 'bg-gray-100 text-gray-800',
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

function mapToRow(m: MemberListItem): MemberRow {
  const loc = m.location as { phone_primary?: string; email?: string } | undefined;
  return {
    id: m.id,
    name: m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || '—',
    memberId: m.id.slice(0, 8).toUpperCase(),
    phone: loc?.phone_primary || (m as { phone_primary?: string }).phone_primary || '—',
    email: loc?.email || (m as { email?: string }).email || '—',
    department: '—',
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
    filters || { search: '', status: 'all', department: 'all', dateRange: 'all' }
  );

  const filterKey = useMemo(
    () =>
      [
        filters?.search ?? '',
        filters?.status ?? '',
        filters?.department ?? '',
        filters?.dateRange ?? '',
      ].join('|'),
    [filters?.search, filters?.status, filters?.department, filters?.dateRange]
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

  const _handleView = (id: string) => router.push(`/admin/members/${id}`);
  const _handleEdit = (id: string) => router.push(`/admin/members/${id}/edit`);

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
      router.push(`/admin/members/${selectedMemberId}`);
    }
  };
  const handleBulkEdit = () => {
    if (selectedMemberId) {
      router.push(`/admin/members/${selectedMemberId}/edit`);
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

  return (
    <div className="space-y-4 w-full">
      {/* Dynamic action bar when members are selected */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white shadow-sm w-full">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {selectedMemberId && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleBulkView}>
                <Eye className="h-4 w-4" />
                View
              </Button>
            )}
            {selectedMemberId && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleBulkEdit}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleBulkSendMessage}
            >
              <MessageCircle className="h-4 w-4" />
              Send Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleBulkSendEmail}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
            <Button size="sm" className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              <Download className="h-4 w-4" />
              Export Selected
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Update Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleBulkDelete}
            >
              <UserMinus className="h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-gray-600 hover:text-gray-800"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      )}

      <div
        className="flex items-center justify-between px-4 w-full"
        style={{
          height: 67,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottom: '2px solid #F6F8FA',
          background: '#FFFFFF',
        }}
      >
        <h3 className="text-lg font-bold text-gray-900">All Members</h3>
        <div
          className="flex items-center justify-end gap-2 ml-auto rounded-[5px] shrink-0"
          style={{ height: 32 }}
        >
          <Button variant="outline" size="sm" className="rounded-[5px] h-8">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 bg-gray-50">
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 gap-1.5">
            CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 gap-1.5">
            PDF
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 gap-1.5">
            Excel
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow
              className="border-gray-200 hover:bg-transparent"
              style={{ height: 56, background: '#F6F8FA' }}
            >
              <TableHead className="w-12">
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
              <TableHead className="font-semibold text-gray-900">Member</TableHead>
              <TableHead className="font-semibold text-gray-900">Contact</TableHead>
              <TableHead className="font-semibold text-gray-900 min-w-[180px]">
                Department
              </TableHead>
              <TableHead className="font-semibold text-gray-900 min-w-[120px]">Role</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Member Since</TableHead>
              <TableHead className="font-semibold text-gray-900">Action</TableHead>
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
                  className="border-gray-200"
                  style={{ height: 70, borderBottom: '1px solid #e5e7eb' }}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-5 w-5 min-w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                      checked={selectedIds.has(member.id)}
                      onChange={() => toggleMember(member.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-green-100">
                        <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.memberId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[140px] max-w-[180px] break-words whitespace-normal leading-tight">
                    <div>
                      <p className="font-medium text-gray-900">{member.phone}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 min-w-[180px] max-w-[200px] break-words whitespace-normal leading-tight">
                    {member.department}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                        roleStyles[member.role] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusStyles[member.status] || 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {member.status?.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {member.memberSince ? format(new Date(member.memberSince), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/members/${member.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/members/${member.id}/edit`}>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
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
            className="h-9 rounded-none border border-gray-300 px-3 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
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
