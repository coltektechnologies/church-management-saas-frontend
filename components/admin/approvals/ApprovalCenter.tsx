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
  type ProgramApprovalChain,
  type ProgramApprovalStatus,
  type ProgramListItem,
} from '@/lib/departmentsApi';
import { getStoredSessionChurchId } from '@/lib/churchSessionBrowser';
import {
  approveExpenseRequestDeptHead,
  approveExpenseRequestFirstElder,
  approveExpenseRequestTreasurer,
  getExpenseRequests,
  rejectExpenseRequest,
  type ExpenseApprovalChain,
  type ExpenseRequestItem,
} from '@/lib/treasuryApi';

function friendlySubmissionType(t?: string): string {
  if (!t) {
    return '';
  }
  if (t === 'BOTH') {
    return 'Elder → Secretariat → Treasury';
  }
  if (t === 'SECRETARIAT_ONLY') {
    return 'Elder → Secretariat';
  }
  if (t === 'TREASURY_ONLY') {
    return 'Elder → Treasury';
  }
  return t.replace(/_/g, ' ');
}

function ProgramApprovalChainLines({ program: p }: { program: ProgramListItem }) {
  const ch = p.approval_chain;
  if (!ch) {
    return null;
  }
  const rows: { k: keyof ProgramApprovalChain; label: string }[] = [
    { k: 'elder', label: 'Department elder' },
    { k: 'secretariat', label: 'Secretariat' },
    { k: 'treasury', label: 'Treasury' },
  ];
  return (
    <ul
      className="text-[11px] mt-2 space-y-0.5 list-none p-0 m-0"
      style={{ color: 'var(--admin-text-muted)' }}
    >
      {rows.map(({ k, label }) => {
        const s = ch[k];
        if (!s.required) {
          return (
            <li key={k}>
              <span style={{ color: '#94a3b8' }}>—</span> {label}: <em>Not in approval path</em>
            </li>
          );
        }
        if (!s.approved) {
          return (
            <li key={k}>
              <span style={{ color: '#94a3b8' }}>○</span> {label}: waiting
              {k === 'elder' && s.hint ? (
                <span style={{ color: 'var(--admin-text)' }}> ({s.hint})</span>
              ) : null}
            </li>
          );
        }
        return (
          <li key={k}>
            <span style={{ color: '#16a34a' }}>✓</span> {label}: done
            {s.approved_at ? <span className="opacity-80"> · {fmtDate(s.approved_at)}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function ExpenseApprovalChainLines({ chain }: { chain: ExpenseApprovalChain }) {
  const rows: { label: string; stage: ExpenseApprovalChain['dept_head'] }[] = [
    { label: 'Dept head / elder', stage: chain.dept_head },
    { label: 'First Elder', stage: chain.first_elder },
    { label: 'Treasurer', stage: chain.treasurer },
  ];
  return (
    <ul
      className="text-[11px] mt-2 space-y-0.5 list-none p-0 m-0"
      style={{ color: 'var(--admin-text-muted)' }}
    >
      {rows.map(({ label, stage }) => (
        <li key={label}>
          <span style={{ color: stage.approved ? '#16a34a' : '#94a3b8' }}>
            {stage.approved ? '✓' : '○'}
          </span>{' '}
          {label}:{' '}
          {stage.approved ? (
            <strong style={{ color: 'var(--admin-text)' }}>{stage.approved_by ?? '—'}</strong>
          ) : (
            'not yet'
          )}
        </li>
      ))}
    </ul>
  );
}

const PROGRAM_PENDING_STATUSES_ADMIN: ProgramApprovalStatus[] = [
  'SUBMITTED',
  'ELDER_APPROVED',
  'SECRETARIAT_APPROVED',
];

/** After elder approval; API expects POST review with department SECRETARIAT. */
const PROGRAM_SECRETARIAT_QUEUE_STATUS: ProgramApprovalStatus = 'ELDER_APPROVED';

const EXPENSE_PENDING_STATUSES = [
  'SUBMITTED',
  'DEPT_HEAD_APPROVED',
  'FIRST_ELDER_APPROVED',
] as const;

export type ApprovalCenterVariant = 'admin' | 'secretary' | 'treasury';

export type ApprovalCenterProps = {
  variant?: ApprovalCenterVariant;
};

function userCanActOnProgram(p: ProgramListItem, variant: ApprovalCenterVariant): boolean {
  const step = p.pending_step?.code;
  const rp = p.review_permissions;
  if (!rp || !step) {
    return false;
  }
  if (variant === 'secretary') {
    return step === 'SECRETARIAT' && rp.secretariat;
  }
  if (variant === 'treasury') {
    return step === 'TREASURY' && rp.treasury;
  }
  if (step === 'ELDER') {
    return rp.elder;
  }
  if (step === 'SECRETARIAT') {
    return rp.secretariat;
  }
  if (step === 'TREASURY') {
    return rp.treasury;
  }
  return false;
}

function userCanActOnExpense(e: ExpenseRequestItem, variant: ApprovalCenterVariant): boolean {
  const rp = e.review_permissions;
  if (!rp) {
    return false;
  }
  if (variant === 'treasury') {
    return e.status === 'FIRST_ELDER_APPROVED' && rp.treasurer;
  }
  const st = e.status;
  if (st === 'SUBMITTED') {
    return rp.dept_head;
  }
  if (st === 'DEPT_HEAD_APPROVED') {
    return rp.first_elder;
  }
  if (st === 'FIRST_ELDER_APPROVED') {
    return rp.treasurer;
  }
  return false;
}

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

export default function ApprovalCenter({ variant = 'admin' }: ApprovalCenterProps) {
  const isSecretary = variant === 'secretary';
  const isTreasury = variant === 'treasury';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementListItemApi[]>([]);
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRequestItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);

    const sessionChurchId = getStoredSessionChurchId();
    const expenseListOpts = {
      page_size: 500 as const,
      ...(sessionChurchId ? { church_id: sessionChurchId } : {}),
    };
    const programListOpts = sessionChurchId ? { church_id: sessionChurchId } : undefined;

    if (isSecretary) {
      const annRows = await fetchAnnouncementsList({ status: 'PENDING_REVIEW', page_size: 200 });
      const programRows = await fetchProgramsByStatus(
        PROGRAM_SECRETARIAT_QUEUE_STATUS,
        programListOpts
      );
      setAnnouncements(annRows.filter((a) => a.status === 'PENDING_REVIEW'));
      setPrograms(programRows.filter((p) => String(p.status) === 'ELDER_APPROVED'));
      setExpenses([]);
      return;
    }

    if (isTreasury) {
      /* Only items the treasurer role can act on in the API (not earlier workflow stages). */
      const programRows = await fetchProgramsByStatus('SECRETARIAT_APPROVED', programListOpts);
      const expenseRows = await getExpenseRequests({
        status: 'FIRST_ELDER_APPROVED',
        ...expenseListOpts,
      });
      setAnnouncements([]);
      setPrograms(programRows.filter((p) => String(p.status) === 'SECRETARIAT_APPROVED'));
      setExpenses(expenseRows.filter((e) => String(e.status) === 'FIRST_ELDER_APPROVED'));
      return;
    }

    const annRows = await fetchAnnouncementsList({ status: 'PENDING_REVIEW', page_size: 200 });
    const programRows = await Promise.all(
      PROGRAM_PENDING_STATUSES_ADMIN.map((s) => fetchProgramsByStatus(s, programListOpts))
    ).then((groups) => groups.flat());
    const expenseRows = await Promise.all(
      EXPENSE_PENDING_STATUSES.map((s) => getExpenseRequests({ status: s, ...expenseListOpts }))
    ).then((groups) => groups.flat());

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
  }, [isSecretary, isTreasury]);

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

  const totalPending = useMemo(() => {
    let n = announcements.length + programs.length;
    if (!isSecretary) {
      n += expenses.length;
    }
    return n;
  }, [announcements.length, programs.length, expenses.length, isSecretary]);

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

  const rejectAnnNote = isSecretary
    ? 'Rejected from secretariat approvals'
    : isTreasury
      ? 'Rejected from treasury approvals'
      : 'Rejected from approval center';

  const rejectExpenseNote = isTreasury
    ? 'Rejected from treasury approvals'
    : 'Rejected from approval center';

  const programApproveNote = isSecretary
    ? 'Approved via secretariat approvals'
    : isTreasury
      ? 'Approved via treasury approvals'
      : 'Approved via approval center';

  const programRejectNote = isSecretary
    ? 'Rejected from secretariat approvals'
    : isTreasury
      ? 'Rejected from treasury approvals'
      : 'Rejected from approval center';

  return (
    <div className="space-y-6 pb-10">
      <section
        className="rounded-2xl border px-5 py-4 sm:px-6 sm:py-5"
        style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: 'var(--admin-text)' }}
            >
              {isSecretary ? 'Approvals' : isTreasury ? 'Treasury approvals' : 'Approval Center'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              {isSecretary ? (
                <>
                  Announcements pending review and program proposals that have passed elder approval
                  and need secretariat sign-off. Treasury expense approvals stay in the admin
                  dashboard.
                </>
              ) : isTreasury ? (
                <>
                  Only items you can act on as treasury: expense requests after first elder
                  approval, and program proposals after secretariat approval. Earlier stages stay
                  with department head, elders, and secretariat.
                </>
              ) : (
                <>
                  Review only pending approvals across Announcements, Program Proposals, and
                  Treasury Expense Requests.
                </>
              )}
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
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
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
        <div
          className="rounded-xl border px-4 py-3 text-sm"
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
        <div
          className="rounded-2xl border p-10 text-center text-sm"
          style={{
            backgroundColor: 'var(--admin-surface)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-muted)',
          }}
        >
          Loading approvals...
        </div>
      ) : (
        <div className="space-y-5">
          {!isTreasury && (
            <section
              className="rounded-2xl border p-4 sm:p-5"
              style={{
                backgroundColor: 'var(--admin-surface)',
                borderColor: 'var(--admin-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                  Announcements
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
                >
                  {announcements.length} pending
                </span>
              </div>
              {!isSecretary && announcements.length > 0 && (
                <p
                  className="text-xs mb-3 rounded-lg border px-3 py-2"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
                >
                  Announcements use a{' '}
                  <strong style={{ color: 'var(--admin-text)' }}>single review step</strong> (no
                  multi-office chain). ○ = awaiting review; ✓ appears after you approve.
                </p>
              )}
              {announcements.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                  No announcement approvals pending.
                </p>
              ) : (
                <div className="space-y-2">
                  {announcements.map((a) => {
                    const key = `ann-${a.id}`;
                    const isBusy = busyKey === key;
                    const canActAnn = Boolean(a.can_approve);
                    return (
                      <div
                        key={a.id}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: 'var(--admin-border)',
                          backgroundColor: 'var(--admin-bg)',
                        }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                              {a.title}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'var(--admin-text-muted)' }}
                            >
                              Status: {friendlyStatus(a.status)} • Created: {fmtDate(a.created_at)}
                            </p>
                            {!isSecretary ? (
                              <p
                                className="text-[11px] mt-2"
                                style={{ color: 'var(--admin-text-muted)' }}
                              >
                                <span style={{ color: '#94a3b8' }}>○</span> Review: pending • One
                                approver action below completes this item
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {!canActAnn ? (
                              <p
                                className="text-[11px] max-w-[220px] text-right"
                                style={{ color: 'var(--admin-text-muted)' }}
                              >
                                You do not have secretariat approval permission for this church.
                              </p>
                            ) : null}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isBusy || !canActAnn}
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
                                disabled={isBusy || !canActAnn}
                                onClick={() =>
                                  void handleApiAction(
                                    key,
                                    () => rejectAnnouncementApi(a.id, rejectAnnNote),
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
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section
            className="rounded-2xl border p-4 sm:p-5"
            style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                Department Program Proposals
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
              >
                {programs.length} pending
              </span>
            </div>
            {isTreasury && (
              <p
                className="text-xs mb-3 rounded-lg border px-3 py-2"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
              >
                In-app notices that say &quot;Program Submitted for <strong>Secretariat</strong>{' '}
                Approval&quot; are for the secretariat queue (after elder approval). They appear
                here only after secretariat approves and the program reaches{' '}
                <strong>Secretariat approved</strong> (your treasury step).
              </p>
            )}
            {!isTreasury && !isSecretary && (
              <p
                className="text-xs mb-3 rounded-lg border px-3 py-2"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
              >
                <strong style={{ color: 'var(--admin-text)' }}>Tracking:</strong> ✓ = that office
                has approved. ○ = waiting. &quot;Not in path&quot; = this program was not submitted
                to that office (see submission route on each card).
              </p>
            )}
            {programs.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                {isSecretary
                  ? 'No program proposals awaiting secretariat approval.'
                  : isTreasury
                    ? 'No program proposals awaiting treasury approval.'
                    : 'No program proposal approvals pending.'}
              </p>
            ) : (
              <div className="space-y-2">
                {programs.map((p) => {
                  const key = `prog-${p.id}`;
                  const isBusy = busyKey === key;
                  const canActProg = userCanActOnProgram(p, variant);
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: 'var(--admin-border)',
                        backgroundColor: 'var(--admin-bg)',
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                            {p.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                            {p.department_name || 'Department'} • Status: {friendlyStatus(p.status)}{' '}
                            • Submitted: {fmtDate(p.submitted_at)}
                            {p.submission_type ? (
                              <> • Route: {friendlySubmissionType(p.submission_type)}</>
                            ) : null}
                          </p>
                          <ProgramApprovalChainLines program={p} />
                          {p.pending_step?.label ? (
                            <p
                              className="text-xs mt-2 font-semibold pt-2 border-t"
                              style={{
                                borderColor: 'var(--admin-border)',
                                color: 'var(--admin-text)',
                              }}
                            >
                              Who acts next: {p.pending_step.label}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {!canActProg ? (
                            <p
                              className="text-[11px] max-w-[240px] text-right"
                              style={{ color: 'var(--admin-text-muted)' }}
                            >
                              Your account is not in the office that acts at this step (see
                              &quot;Who acts next&quot;).
                            </p>
                          ) : null}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isBusy || !canActProg}
                              onClick={() =>
                                void handleApiAction(
                                  key,
                                  () =>
                                    reviewProgramApproval(
                                      p.id,
                                      {
                                        action: 'APPROVE',
                                        notes: programApproveNote,
                                      },
                                      p.status,
                                      p
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
                              disabled={isBusy || !canActProg}
                              onClick={() =>
                                void handleApiAction(
                                  key,
                                  () =>
                                    reviewProgramApproval(
                                      p.id,
                                      {
                                        action: 'REJECT',
                                        notes: programRejectNote,
                                      },
                                      p.status,
                                      p
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
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {!isSecretary && (
            <section
              className="rounded-2xl border p-4 sm:p-5"
              style={{
                backgroundColor: 'var(--admin-surface)',
                borderColor: 'var(--admin-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                  Treasury Expense Requests
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
                >
                  {expenses.length} pending
                </span>
              </div>
              {!isTreasury && expenses.length > 0 && (
                <p
                  className="text-xs mb-3 rounded-lg border px-3 py-2"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
                >
                  <strong style={{ color: 'var(--admin-text)' }}>Chain:</strong> department head or
                  elder in charge → First Elder or elder in charge → Treasurer. ✓ = done; ○ = still
                  waiting at that step.
                </p>
              )}
              {expenses.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                  {isTreasury
                    ? 'No expense requests awaiting treasurer approval (first elder must approve first).'
                    : 'No treasury expense approvals pending.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {expenses.map((e) => {
                    const key = `exp-${e.id}`;
                    const isBusy = busyKey === key;
                    const canActExp = userCanActOnExpense(e, variant);
                    const amount = Number.parseFloat(String(e.amount_requested || 0));
                    return (
                      <div
                        key={e.id}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: 'var(--admin-border)',
                          backgroundColor: 'var(--admin-bg)',
                        }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                              {e.request_number} • {e.department_name}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'var(--admin-text-muted)' }}
                            >
                              Amount:{' '}
                              {Number.isFinite(amount)
                                ? amount.toLocaleString()
                                : e.amount_requested}{' '}
                              • Status: {friendlyStatus(e.status)} • Requested:{' '}
                              {fmtDate(e.created_at)}
                            </p>
                            {e.approval_chain ? (
                              <ExpenseApprovalChainLines chain={e.approval_chain} />
                            ) : null}
                            {e.pending_step?.label ? (
                              <p
                                className="text-xs mt-2 font-semibold pt-2 border-t"
                                style={{
                                  borderColor: 'var(--admin-border)',
                                  color: 'var(--admin-text)',
                                }}
                              >
                                Who acts next: {e.pending_step.label}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {!canActExp ? (
                              <p
                                className="text-[11px] max-w-[240px] text-right"
                                style={{ color: 'var(--admin-text-muted)' }}
                              >
                                Your account is not the role that approves at this step.
                              </p>
                            ) : null}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isBusy || !canActExp}
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
                                disabled={isBusy || !canActExp}
                                onClick={() =>
                                  void handleApiAction(
                                    key,
                                    () =>
                                      rejectExpenseRequest(e.id, {
                                        rejection_reason: rejectExpenseNote,
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
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
