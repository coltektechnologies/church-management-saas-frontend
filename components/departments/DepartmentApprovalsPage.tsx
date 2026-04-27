'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClipboardCheck, Loader2, RefreshCw } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';
import {
  fetchProgramsByStatus,
  reviewProgramApproval,
  type ProgramListItem,
} from '@/lib/departmentsApi';
import {
  approveExpenseRequestDeptHead,
  getExpenseRequests,
  rejectExpenseRequest,
  type ExpenseRequestItem,
} from '@/lib/treasuryApi';

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.length === 3 ? currency : 'GHS',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatShortDate(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value;
  }
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function parseApiError(e: unknown): string {
  if (e instanceof Error) {
    return e.message;
  }
  return 'Something went wrong';
}

export default function DepartmentApprovalsPage() {
  const { profile, isReady, portalIdentityLoaded } = useDepartmentProfile();
  const dept = usePortalDepartment();
  const currency = isReady ? profile.currency : 'GHS';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseRequestItem[]>([]);
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    kind: 'expense' | 'program';
    id: string;
    title: string;
  } | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const deptId = dept?.id;

  const loadAll = useCallback(async () => {
    if (!deptId) {
      setExpenses([]);
      setPrograms([]);
      return;
    }

    const [expRows, progSubmitted] = await Promise.all([
      getExpenseRequests({
        status: 'SUBMITTED',
        department_id: deptId,
        page_size: 200,
      }),
      fetchProgramsByStatus('SUBMITTED'),
    ]);

    setExpenses(expRows.filter((e) => String(e.status).toUpperCase() === 'SUBMITTED'));

    const pid = String(deptId);
    setPrograms(
      progSubmitted.filter((p) => String(p.department) === pid && String(p.status) === 'SUBMITTED')
    );
  }, [deptId]);

  useEffect(() => {
    if (!portalIdentityLoaded && process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH !== 'true') {
      return;
    }
    if (!deptId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadAll()
      .catch((e) => {
        toast.error('Could not load approvals', { description: parseApiError(e) });
      })
      .finally(() => setLoading(false));
  }, [loadAll, deptId, portalIdentityLoaded]);

  const refresh = useCallback(async () => {
    if (!deptId) {
      return;
    }
    setRefreshing(true);
    try {
      await loadAll();
      toast.success('Refreshed');
    } catch (e) {
      toast.error('Refresh failed', { description: parseApiError(e) });
    } finally {
      setRefreshing(false);
    }
  }, [loadAll, deptId]);

  const runAction = useCallback(
    async (key: string, fn: () => Promise<unknown>, ok: string): Promise<boolean> => {
      setBusyKey(key);
      try {
        await fn();
        toast.success(ok);
        await loadAll();
        return true;
      } catch (e) {
        const msg = parseApiError(e);
        const denied = /permission|forbidden|403|not allow|don't have permission/i.test(msg);
        toast.error(denied ? 'You are not allowed to perform this action' : 'Action failed', {
          description: msg,
        });
        return false;
      } finally {
        setBusyKey(null);
      }
    },
    [loadAll]
  );

  const openReject = (kind: 'expense' | 'program', id: string, title: string) => {
    setRejectNotes('');
    setRejectModal({ kind, id, title });
  };

  const confirmReject = async () => {
    if (!rejectModal) {
      return;
    }
    const reason = rejectNotes.trim();
    if (!reason) {
      toast.error('Please enter a reason');
      return;
    }
    const { kind, id } = rejectModal;
    const ok =
      kind === 'expense'
        ? await runAction(
            `rej-exp-${id}`,
            () => rejectExpenseRequest(id, { rejection_reason: reason }),
            'Request rejected'
          )
        : await runAction(
            `rej-prog-${id}`,
            () =>
              reviewProgramApproval(
                id,
                { action: 'REJECT', department: 'ELDER', notes: reason },
                'SUBMITTED'
              ),
            'Program rejected'
          );
    if (ok) {
      setRejectModal(null);
    }
  };

  if (!portalIdentityLoaded && process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH !== 'true') {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" aria-hidden />
      </div>
    );
  }

  if (!deptId) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-amber-900 text-sm">
        No department context is available. Open the department portal from your church account, or
        enable skip-auth mode for local development.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-teal-600" aria-hidden />
            Approvals
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Expense requests awaiting department head or elder-in-charge sign-off, and program
            proposals awaiting elder review for{' '}
            <span className="font-medium text-gray-800">{dept?.name ?? 'your department'}</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
          <Loader2 className="w-9 h-9 animate-spin" aria-hidden />
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4 flex flex-wrap items-center justify-between gap-2 bg-gray-50/80">
              <div>
                <h3 className="font-semibold text-gray-900">Expense requests</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Submitted requests for this department — approve to send forward, or reject with a
                  reason.
                </p>
              </div>
              <Link
                href="/departments/expenses"
                className="text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                New request →
              </Link>
            </div>
            {expenses.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-500">
                No expense requests waiting at this step.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {expenses.map((row) => {
                  const id = String(row.id);
                  const amt = parseFloat(String(row.amount_requested ?? 0));
                  const purpose =
                    (typeof row.purpose === 'string' && row.purpose.trim()) ||
                    String(row.category_name ?? 'Expense');
                  const busyApprove = busyKey === `ap-exp-${id}`;
                  return (
                    <li
                      key={id}
                      className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{purpose}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {row.request_number} · {formatMoney(amt, currency)}
                          {row.requested_by_name ? ` · ${row.requested_by_name}` : ''}
                          {row.required_by_date
                            ? ` · needed ${formatShortDate(row.required_by_date)}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={!!busyKey}
                          onClick={() =>
                            void runAction(
                              `ap-exp-${id}`,
                              () => approveExpenseRequestDeptHead(id, {}),
                              'Expense approved at department level'
                            )
                          }
                          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                          {busyApprove ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={!!busyKey}
                          onClick={() => openReject('expense', id, purpose)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4 bg-gray-50/80">
              <h3 className="font-semibold text-gray-900">Program proposals (elder review)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Programs in <strong>Submitted</strong> state for this department. The church API
                allows elder review by staff, <strong>Elder in charge</strong> for this department,
                or users in the Elder group.
              </p>
            </div>
            {programs.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-500">
                No program proposals awaiting elder review for this department.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {programs.map((p) => {
                  const id = String(p.id);
                  const busyAp = busyKey === `ap-prog-${id}`;
                  return (
                    <li
                      key={id}
                      className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.status_display ?? p.status}
                          {p.start_date ? ` · starts ${formatShortDate(p.start_date)}` : ''}
                          {p.location ? ` · ${p.location}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={!!busyKey}
                          onClick={() =>
                            void runAction(
                              `ap-prog-${id}`,
                              () =>
                                reviewProgramApproval(
                                  id,
                                  { action: 'APPROVE', department: 'ELDER' },
                                  'SUBMITTED'
                                ),
                              'Program approved (elder step)'
                            )
                          }
                          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                          {busyAp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={!!busyKey}
                          onClick={() => openReject('program', id, p.title)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {rejectModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="reject-dialog-title" className="font-semibold text-gray-900">
              Reject {rejectModal.kind === 'expense' ? 'expense request' : 'program'}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">{rejectModal.title}</p>
            <label className="block text-sm font-medium text-gray-700">
              Reason (required)
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Explain why this is being rejected…"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmReject()}
                disabled={!!busyKey}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {busyKey === `rej-exp-${rejectModal.id}` ||
                busyKey === `rej-prog-${rejectModal.id}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
