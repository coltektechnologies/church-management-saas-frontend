'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import {
  getExpenseRequests,
  type ExpenseApprovalChain,
  type ExpenseRequestItem,
} from '@/lib/treasuryApi';
import { getStoredSessionChurchId } from '@/lib/churchSessionBrowser';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'DEPT_HEAD_APPROVED', label: 'Dept head approved' },
  { value: 'FIRST_ELDER_APPROVED', label: 'First elder approved' },
  { value: 'APPROVED', label: 'Approved (treasurer)' },
  { value: 'DISBURSED', label: 'Disbursed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function ChainLines({ chain }: { chain: ExpenseApprovalChain }) {
  const rows = [
    { k: 'dept_head' as const, label: 'Dept head / elder' },
    { k: 'first_elder' as const, label: 'First Elder' },
    { k: 'treasurer' as const, label: 'Treasurer' },
  ];
  return (
    <ul className="text-[11px] space-y-0.5 list-none p-0 m-0 opacity-90">
      {rows.map(({ k, label }) => {
        const s = chain[k];
        return (
          <li key={k}>
            <span className={s.approved ? 'text-emerald-600' : 'text-slate-400'}>
              {s.approved ? '✓' : '○'}
            </span>{' '}
            {label}:{' '}
            {s.approved ? <span className="font-medium">{s.approved_by ?? '—'}</span> : '—'}
          </li>
        );
      })}
    </ul>
  );
}

function fmtAmount(v: string | undefined): string {
  const n = Number.parseFloat(String(v ?? '0'));
  if (!Number.isFinite(n)) {
    return String(v ?? '—');
  }
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ExpenseRequestsOverviewPage() {
  const { profile, isReady } = useTreasuryProfile();
  const [rows, setRows] = useState<ExpenseRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isDark = isReady ? profile.darkMode : false;
  const surface = isDark ? profile.darkSidebarColor || '#0D1F36' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';
  const text = isDark ? '#FFFFFF' : '#0B2A4A';
  const muted = isDark ? 'rgba(255,255,255,0.58)' : 'rgba(11,42,74,0.58)';
  const primary = isDark ? profile.darkAccentColor || '#2FC4B2' : profile.accentColor || '#2FC4B2';

  const load = useCallback(async () => {
    setError(null);
    const churchId = getStoredSessionChurchId();
    const data = await getExpenseRequests({
      page_size: 500,
      ...(churchId ? { church_id: churchId } : {}),
    });
    setRows(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const filtered = useMemo(() => {
    if (!statusFilter) {
      return rows;
    }
    return rows.filter((r) => String(r.status) === statusFilter);
  }, [rows, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      <header
        className="rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-start justify-between gap-4"
        style={{ backgroundColor: surface, borderColor: border }}
      >
        <div className="flex items-start gap-3">
          <ClipboardList className="w-8 h-8 shrink-0 mt-0.5" style={{ color: primary }} />
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: text }}>
              Expense requests
            </h1>
            <p className="text-sm mt-1 max-w-2xl" style={{ color: muted }}>
              All requests for this church, with the current workflow step and who must act next:
              department head or elder in charge → First Elder or elder in charge → Treasurer (final
              approval) → disbursement.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium" style={{ color: muted }}>
            Status
            <select
              className="ml-2 mt-1 block rounded-lg border px-2 py-1.5 text-sm min-w-[11rem]"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
                borderColor: border,
                color: text,
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: border, color: primary }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

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

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: surface, borderColor: border }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}`, color: muted }}>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold min-w-[16rem]">
                  Who approved / who is next
                </th>
                <th className="px-4 py-3 font-semibold">Requested by</th>
                <th className="px-4 py-3 font-semibold">Due</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center" style={{ color: muted }}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center" style={{ color: muted }}>
                    No expense requests match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const step = r.pending_step as { label?: string } | undefined;
                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: `1px solid ${border}`, color: text }}
                      className="last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {r.request_number}
                      </td>
                      <td className="px-4 py-3" style={{ color: muted }}>
                        {r.department_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmtAmount(r.amount_requested)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.status_display || r.status}
                      </td>
                      <td className="px-4 py-3 align-top" style={{ color: text }}>
                        {r.approval_chain ? <ChainLines chain={r.approval_chain} /> : null}
                        <p
                          className="text-xs mt-2 font-semibold pt-2"
                          style={{ borderTop: `1px solid ${border}` }}
                        >
                          Next: {step?.label ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3" style={{ color: muted }}>
                        {r.requested_by_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: muted }}>
                        {r.required_by_date ?? '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
