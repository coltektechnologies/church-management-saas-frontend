'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Clock3, FileCheck2, Megaphone, ShieldAlert, XCircle } from 'lucide-react';
import {
  approveAnnouncementApi,
  fetchAnnouncementsList,
  rejectAnnouncementApi,
  type AnnouncementListItemApi,
} from '@/lib/announcementsApi';
import {
  fetchProgramsByStatus,
  reviewProgramApproval,
  type ProgramApprovalStatus,
  type ProgramListItem,
} from '@/lib/departmentsApi';
import {
  approveExpenseRequestDeptHead,
  approveExpenseRequestFirstElder,
  approveExpenseRequestTreasurer,
  getExpenseRequests,
  rejectExpenseRequest,
  type ExpenseRequestItem,
} from '@/lib/treasuryApi';

const PROGRAM_PENDING_STATUSES: ProgramApprovalStatus[] = [
  'SUBMITTED',
  'ELDER_APPROVED',
  'SECRETARIAT_APPROVED',
];

const EXPENSE_PENDING_STATUSES = ['SUBMITTED', 'DEPT_HEAD_APPROVED', 'FIRST_ELDER_APPROVED'] as const;

function fmtDate(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value;
  }
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function friendlyStatus(status?: string): string {
  if (!status) {
    return 'Unknown';
  }
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementListItemApi[]>([]);
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRequestItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    const [annRows, programRows, expenseRows] = await Promise.all([
      fetchAnnouncementsList({ status: 'PENDING_REVIEW', page_size: 200 }),
      Promise.all(PROGRAM_PENDING_STATUSES.map((s) => fetchProgramsByStatus(s))).then((groups) =>
        groups.flat()
      ),
      Promise.all(EXPENSE_PENDING_STATUSES.map((s) => getExpenseRequests({ status: s, page_size: 200 }))).then(
        (groups) => groups.flat()
      ),
    ]);

    // Keep only items requiring approval; hide already approved/rejected.
    setAnnouncements(annRows.filter((a) => a.status === 'PENDING_REVIEW'));
    setPrograms(
      programRows.filter((p) =>
        ['SUBMITTED', 'ELDER_APPROVED', 'SECRETARIAT_APPROVED'].includes(String(p.status))
      )
    );
    setExpenses(
      expenseRows.filter((e) =>
        ['SUBMITTED', 'DEPT_HEAD_APPROVED', 'FIRST_ELDER_APPROVED'].includes(String(e.status))
      )
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAll()
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load approvals'))
      .finally(() => setLoading(false));
  }, [loadAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAll();
      toast.success('Approvals refreshed');
    } catch (e) {
      toast.error('Failed to refresh approvals', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  const totalPending = useMemo(
    () => announcements.length + programs.length + expenses.length,
    [announcements.length, programs.length, expenses.length]
  );

  const handleApiAction = useCallback(
    async (key: string, fn: () => Promise<unknown>, successText: string) => {
      setBusyKey(key);
      try {
        await fn();
        toast.success(successText);
        await loadAll();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Action failed';
        const denied = /permission|forbidden|not allow|not authorized|403/i.test(msg);
        toast.error(denied ? 'You are not allowed to approve this item' : 'Action failed', {
          description: msg,
        });
      } finally {
        setBusyKey(null);
      }
    },
    [loadAll]
  );

  return (
    <div className="space-y-6 pb-10">
      <section
        className="rounded-2xl border px-5 py-4 sm:px-6 sm:py-5"
        style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
              Approval Center
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              Review only pending approvals across Announcements, Program Proposals, and Treasury
              Expense Requests.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--color-primary)' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
            color: 'var(--color-primary)',
          }}
        >
          <Clock3 className="w-4 h-4" />
          {totalPending} pending approval{totalPending === 1 ? '' : 's'}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            borderColor: 'rgba(220, 38, 38, 0.35)',
            color: '#b91c1c',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border p-10 text-center text-sm"
          style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
        >
          Loading approvals...
        </div>
      ) : (
        <div className="space-y-5">
          {/* Announcements */}
          <section className="rounded-2xl border p-4 sm:p-5"
            style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                Announcements
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
              >
                {announcements.length} pending
              </span>
            </div>
            {announcements.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                No announcement approvals pending.
              </p>
            ) : (
              <div className="space-y-2">
                {announcements.map((a) => {
                  const key = `ann-${a.id}`;
                  const isBusy = busyKey === key;
                  return (
                    <div key={a.id} className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--admin-text)' }}>{a.title}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                            Status: {friendlyStatus(a.status)} • Created: {fmtDate(a.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleApiAction(
                                key,
                                () => approveAnnouncementApi(a.id),
                                'Announcement approved'
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleApiAction(
                                key,
                                () => rejectAnnouncementApi(a.id, 'Rejected from approval center'),
                                'Announcement rejected'
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Program approvals */}
          <section className="rounded-2xl border p-4 sm:p-5"
            style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                Department Program Proposals
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
              >
                {programs.length} pending
              </span>
            </div>
            {programs.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                No program proposal approvals pending.
              </p>
            ) : (
              <div className="space-y-2">
                {programs.map((p) => {
                  const key = `prog-${p.id}`;
                  const isBusy = busyKey === key;
                  return (
                    <div key={p.id} className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--admin-text)' }}>{p.title}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                            {p.department_name || 'Department'} • Status: {friendlyStatus(p.status)}
                            {' '}• Submitted: {fmtDate(p.submitted_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleApiAction(
                                key,
                                () =>
                                  reviewProgramApproval(
                                    p.id,
                                    { action: 'APPROVE', notes: 'Approved via approval center' },
                                    p.status
                                  ),
                                'Program proposal approved'
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleApiAction(
                                key,
                                () =>
                                  reviewProgramApproval(
                                    p.id,
                                    { action: 'REJECT', notes: 'Rejected from approval center' },
                                    p.status
                                  ),
                                'Program proposal rejected'
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Treasury approvals */}
          <section className="rounded-2xl border p-4 sm:p-5"
            style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                Treasury Expense Requests
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
              >
                {expenses.length} pending
              </span>
            </div>
            {expenses.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                No treasury expense approvals pending.
              </p>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => {
                  const key = `exp-${e.id}`;
                  const isBusy = busyKey === key;
                  const amount = Number.parseFloat(String(e.amount_requested || 0));
                  return (
                    <div key={e.id} className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                            {e.request_number} • {e.department_name}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                            Amount: {Number.isFinite(amount) ? amount.toLocaleString() : e.amount_requested}
                            {' '}• Status: {friendlyStatus(e.status)} • Requested: {fmtDate(e.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleApiAction(
                                key,
                                () => {
                                  if (e.status === 'SUBMITTED') {
                                    return approveExpenseRequestDeptHead(e.id);
                                  }
                                  if (e.status === 'DEPT_HEAD_APPROVED') {
                                    return approveExpenseRequestFirstElder(e.id);
                                  }
                                  return approveExpenseRequestTreasurer(e.id);
                                },
                                'Expense request approved'
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleApiAction(
                                key,
                                () =>
                                  rejectExpenseRequest(e.id, {
                                    rejection_reason: 'Rejected from approval center',
                                  }),
                                'Expense request rejected'
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            <XCircle className="w-3.5 h-3.5 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
