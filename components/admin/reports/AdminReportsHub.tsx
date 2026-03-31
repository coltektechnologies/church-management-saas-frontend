'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  Building2,
  CalendarRange,
  FileSpreadsheet,
  FileText,
  LineChart,
  Loader2,
  Megaphone,
  PieChart,
  Scale,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  downloadReportFile,
  fetchReportJson,
  fetchScheduledReports,
  type ReportExportFormat,
  type ReportQueryParams,
  type ScheduledReportRow,
} from '@/lib/reportsApi';

type ReportCategory = {
  id: string;
  label: string;
  description: string;
  items: ReportItem[];
};

type ReportItem = {
  key: string;
  path: string;
  title: string;
  description: string;
  icon: typeof Users;
  /** Show date range fields for this report (server still defaults if omitted). */
  showDateRange: boolean;
  membershipFilter?: boolean;
  announcementStatusFilter?: boolean;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatLabel(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString() : String(value);
  }
  if (typeof value === 'string') {
    const maybeDate = new Date(value);
    if (value.length >= 10 && !Number.isNaN(maybeDate.getTime()) && /[-T:]/.test(value)) {
      return maybeDate.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: value.includes('T') ? 'short' : undefined,
      });
    }
    return value;
  }
  return JSON.stringify(value);
}

function DataPreview({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <p style={{ color: 'var(--admin-text-muted)' }}>No data available.</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p style={{ color: 'var(--admin-text-muted)' }}>No rows found for this report.</p>;
    }
    const allObjects = value.every((row) => isObjectRecord(row));
    if (allObjects) {
      const rows = value as Record<string, unknown>[];
      const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
      return (
        <div
          className="overflow-x-auto rounded-xl border"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="text-left py-2.5 px-3 font-semibold whitespace-nowrap"
                    style={{ color: 'var(--admin-text)' }}
                  >
                    {formatLabel(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id ? String(row.id) : `row-${rowIndex}`}
                  style={{ borderBottom: '1px solid var(--admin-border)' }}
                  className="last:border-0"
                >
                  {columns.map((c) => {
                    const cell = row[c];
                    const simple =
                      cell === null ||
                      ['string', 'number', 'boolean', 'undefined'].includes(typeof cell);
                    return (
                      <td
                        key={`${rowIndex}-${c}`}
                        className="py-2.5 px-3 align-top"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        {simple ? (
                          formatPrimitive(cell)
                        ) : (
                          <code className="text-xs">{JSON.stringify(cell)}</code>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div
            key={`item-${idx}`}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--admin-border)',
              backgroundColor: 'var(--admin-bg)',
              color: 'var(--admin-text)',
            }}
          >
            {formatPrimitive(item)}
          </div>
        ))}
      </div>
    );
  }

  if (isObjectRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <p style={{ color: 'var(--admin-text-muted)' }}>No report details returned.</p>;
    }
    return (
      <div className="space-y-3">
        {entries.map(([key, fieldValue]) => {
          const simple =
            fieldValue === null ||
            ['string', 'number', 'boolean', 'undefined'].includes(typeof fieldValue);
          return (
            <div
              key={key}
              className="rounded-xl border p-3.5"
              style={{
                borderColor: 'var(--admin-border)',
                backgroundColor: 'var(--admin-bg)',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--admin-text-muted)' }}
              >
                {formatLabel(key)}
              </p>
              {simple ? (
                <p className="text-sm" style={{ color: 'var(--admin-text)' }}>
                  {formatPrimitive(fieldValue)}
                </p>
              ) : (
                <DataPreview value={fieldValue} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <p style={{ color: 'var(--admin-text)' }}>{formatPrimitive(value)}</p>;
}

const MEMBERSHIP_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'NEW_CONVERT', label: 'New convert' },
  { value: 'VISITOR', label: 'Visitor' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const ANNOUNCEMENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'members',
    label: 'Members',
    description: 'Roster, growth trends, and demographic breakdown for your church.',
    items: [
      {
        key: 'members',
        path: 'members/',
        title: 'Members roster',
        description:
          'Active directory-style list with membership status and join dates. Filter by status.',
        icon: Users,
        showDateRange: true,
        membershipFilter: true,
      },
      {
        key: 'members_growth',
        path: 'members/growth/',
        title: 'Members growth',
        description: 'New members by month and cumulative totals for the selected period.',
        icon: TrendingUp,
        showDateRange: true,
      },
      {
        key: 'members_demographics',
        path: 'members/demographics/',
        title: 'Demographics',
        description: 'Gender, marital status, baptism, and related member statistics.',
        icon: PieChart,
        showDateRange: true,
      },
    ],
  },
  {
    id: 'departments',
    label: 'Departments',
    description: 'Structure and membership across ministries and teams.',
    items: [
      {
        key: 'departments',
        path: 'departments/',
        title: 'Departments summary',
        description: 'Overview of departments, heads, and member assignments.',
        icon: Building2,
        showDateRange: false,
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Income, expenses, balance sheet, and cash flow for treasury oversight.',
    items: [
      {
        key: 'finance_income',
        path: 'finance/income/',
        title: 'Income',
        description: 'Recorded income transactions and categories in the date range.',
        icon: Wallet,
        showDateRange: true,
      },
      {
        key: 'finance_expenses',
        path: 'finance/expenses/',
        title: 'Expenses',
        description: 'Expense transactions and categories for the selected period.',
        icon: ArrowDownCircle,
        showDateRange: true,
      },
      {
        key: 'finance_balance_sheet',
        path: 'finance/balance-sheet/',
        title: 'Balance sheet',
        description: 'Income vs expenses summary for the period.',
        icon: Scale,
        showDateRange: true,
      },
      {
        key: 'finance_cash_flow',
        path: 'finance/cash-flow/',
        title: 'Cash flow',
        description: 'Cash movement summary derived from treasury activity.',
        icon: LineChart,
        showDateRange: true,
      },
    ],
  },
  {
    id: 'communications',
    label: 'Communications & compliance',
    description: 'Announcements activity and administrative audit trail.',
    items: [
      {
        key: 'announcements',
        path: 'announcements/',
        title: 'Announcements',
        description: 'Published and pipeline announcements with optional status filter.',
        icon: Megaphone,
        showDateRange: true,
        announcementStatusFilter: true,
      },
      {
        key: 'audit_trail',
        path: 'audit-trail/',
        title: 'Audit trail',
        description: 'Key actions and changes for accountability (date range applies).',
        icon: Shield,
        showDateRange: true,
      },
    ],
  },
];

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const iso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from: iso(from), to: iso(to) };
}

export default function AdminReportsHub() {
  const initialRange = useMemo(() => defaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState(initialRange.from);
  const [dateTo, setDateTo] = useState(initialRange.to);
  const [membershipStatus, setMembershipStatus] = useState('');
  const [announcementStatus, setAnnouncementStatus] = useState('');

  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<unknown | null>(null);
  const [previewJson, setPreviewJson] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showRawPreview, setShowRawPreview] = useState(false);

  const [downloadState, setDownloadState] = useState<{
    key: string;
    format: ReportExportFormat;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [scheduled, setScheduled] = useState<ScheduledReportRow[]>([]);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [scheduledError, setScheduledError] = useState<string | null>(null);

  const loadScheduled = useCallback(() => {
    setScheduledLoading(true);
    setScheduledError(null);
    fetchScheduledReports()
      .then(setScheduled)
      .catch((e) => setScheduledError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setScheduledLoading(false));
  }, []);

  useEffect(() => {
    void loadScheduled();
  }, [loadScheduled]);

  const buildParams = useCallback(
    (item: ReportItem): ReportQueryParams => {
      const p: ReportQueryParams = {};
      if (item.showDateRange) {
        p.date_from = dateFrom;
        p.date_to = dateTo;
      }
      if (item.membershipFilter && membershipStatus) {
        p.membership_status = membershipStatus;
      }
      if (item.announcementStatusFilter && announcementStatus) {
        p.status = announcementStatus;
      }
      return p;
    },
    [dateFrom, dateTo, membershipStatus, announcementStatus]
  );

  const handlePreview = async (item: ReportItem) => {
    setPreviewKey(item.key);
    setPreviewLabel(item.title);
    setPreviewLoading(true);
    setPreviewError(null);
    setShowRawPreview(false);
    setPreviewData(null);
    setPreviewJson(null);
    try {
      const data = await fetchReportJson(item.path, buildParams(item));
      setPreviewData(data);
      setPreviewJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (item: ReportItem, format: ReportExportFormat) => {
    setDownloadState({ key: item.key, format });
    setActionError(null);
    try {
      await downloadReportFile(item.path, format, buildParams(item));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloadState(null);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--admin-text)' }}
        >
          Reports
        </h1>
        <p className="text-sm max-w-3xl leading-relaxed" style={{ color: 'var(--admin-text-muted)' }}>
          Generate church-wide reports from live data. Choose a date range where applicable, preview
          results in the browser, or download PDF, Excel, or CSV. Exports use the same filters as
          the preview.
        </p>
      </div>

      {/* Global date range */}
      <section
        className="rounded-2xl border p-5 sm:p-6 shadow-sm"
        style={{
          backgroundColor: 'var(--admin-surface)',
          borderColor: 'var(--admin-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div
            className="flex items-center gap-2 text-sm font-medium shrink-0"
            style={{ color: 'var(--admin-text)' }}
          >
            <CalendarRange className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Report period
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--admin-text-muted)' }}>
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm min-w-[10rem]"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text)',
                }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--admin-text-muted)' }}>
              To
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm min-w-[10rem]"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text)',
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const d = defaultDateRange();
                setDateFrom(d.from);
                setDateTo(d.to);
              }}
              className="text-sm font-medium px-3 py-2 rounded-lg border transition hover:opacity-90"
              style={{
                borderColor: 'var(--admin-border)',
                color: 'var(--color-primary)',
                backgroundColor: 'transparent',
              }}
            >
              Reset to this month
            </button>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--admin-text-muted)' }}>
          Reports without dates (e.g. departments snapshot) ignore this range. Others default on the
          server if you clear dates—we recommend keeping a range for finance and membership.
        </p>
      </section>

      {actionError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            borderColor: 'rgba(220, 38, 38, 0.35)',
            color: '#b91c1c',
          }}
        >
          {actionError}
        </div>
      )}

      {/* Categories */}
      {REPORT_CATEGORIES.map((cat) => (
        <section key={cat.id} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
              {cat.label}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              {cat.description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cat.items.map((item) => {
              const Icon = item.icon;
              const rowBusy = downloadState?.key === item.key;
              return (
                <article
                  key={item.key}
                  className="rounded-2xl border p-5 flex flex-col gap-4 shadow-sm transition hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--admin-surface)',
                    borderColor: 'var(--admin-border)',
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--admin-text)' }}>
                        {item.title}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--admin-text-muted)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.membershipFilter && (
                    <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                      Membership status
                      <select
                        value={membershipStatus}
                        onChange={(e) => setMembershipStatus(e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm"
                        style={{
                          backgroundColor: 'var(--admin-bg)',
                          borderColor: 'var(--admin-border)',
                          color: 'var(--admin-text)',
                        }}
                      >
                        {MEMBERSHIP_OPTIONS.map((o) => (
                          <option key={o.value || 'all'} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {item.announcementStatusFilter && (
                    <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                      Announcement status
                      <select
                        value={announcementStatus}
                        onChange={(e) => setAnnouncementStatus(e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm"
                        style={{
                          backgroundColor: 'var(--admin-bg)',
                          borderColor: 'var(--admin-border)',
                          color: 'var(--admin-text)',
                        }}
                      >
                        {ANNOUNCEMENT_STATUS_OPTIONS.map((o) => (
                          <option key={o.value || 'all'} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {!item.showDateRange && (
                    <p className="text-[11px]" style={{ color: 'var(--admin-text-muted)' }}>
                      Snapshot report — date range above is not sent for this export.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    <button
                      type="button"
                      onClick={() => void handlePreview(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {previewLoading && previewKey === item.key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      Preview
                    </button>
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => void handleDownload(item, 'pdf')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition disabled:opacity-50"
                      style={{
                        borderColor: 'var(--admin-border)',
                        color: 'var(--admin-text)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      {rowBusy && downloadState?.format === 'pdf' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      PDF
                    </button>
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => void handleDownload(item, 'xlsx')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition disabled:opacity-50"
                      style={{
                        borderColor: 'var(--admin-border)',
                        color: 'var(--admin-text)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      {rowBusy && downloadState?.format === 'xlsx' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4" />
                      )}
                      Excel
                    </button>
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => void handleDownload(item, 'csv')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition disabled:opacity-50"
                      style={{
                        borderColor: 'var(--admin-border)',
                        color: 'var(--admin-text)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      {rowBusy && downloadState?.format === 'csv' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      CSV
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {/* Preview panel */}
      {(previewKey || previewLoading || previewJson || previewError) && (
        <section
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--admin-surface)',
            borderColor: 'var(--admin-border)',
          }}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 border-b"
            style={{ borderColor: 'var(--admin-border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
              Preview{previewLabel ? `: ${previewLabel}` : ''}
            </h3>
            <div className="flex items-center gap-2">
              {previewJson && (
                <button
                  type="button"
                  onClick={() => setShowRawPreview((v) => !v)}
                  className="text-xs font-medium px-2 py-1 rounded-md border"
                  style={{
                    color: 'var(--admin-text-muted)',
                    borderColor: 'var(--admin-border)',
                  }}
                >
                  {showRawPreview ? 'Show friendly view' : 'Show raw JSON'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setPreviewKey(null);
                  setPreviewData(null);
                  setPreviewJson(null);
                  setPreviewError(null);
                  setPreviewLabel('');
                  setShowRawPreview(false);
                }}
                className="text-xs font-medium px-2 py-1 rounded-md"
                style={{ color: 'var(--admin-text-muted)' }}
              >
                Close
              </button>
            </div>
          </div>
          <div className="p-4 max-h-[min(28rem,55vh)] overflow-auto">
            {previewLoading && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            )}
            {previewError && (
              <p className="text-sm text-red-600 dark:text-red-400">{previewError}</p>
            )}
            {previewData !== null && previewData !== undefined && !showRawPreview && (
              <DataPreview value={previewData} />
            )}
            {previewJson && showRawPreview && (
              <pre
                className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed"
                style={{ color: 'var(--admin-text)' }}
              >
                {previewJson}
              </pre>
            )}
          </div>
        </section>
      )}

      {/* Scheduled reports */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
              Scheduled deliveries
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              Reports configured to run on a recurring schedule (managed via API / admin).
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadScheduled()}
            className="text-sm font-medium px-4 py-2 rounded-lg border transition hover:opacity-90"
            style={{
              borderColor: 'var(--admin-border)',
              color: 'var(--color-primary)',
            }}
          >
            Refresh list
          </button>
        </div>
        <div
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--admin-surface)',
            borderColor: 'var(--admin-border)',
          }}
        >
          {scheduledLoading ? (
            <div className="p-8 flex justify-center" style={{ color: 'var(--admin-text-muted)' }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : scheduledError ? (
            <p className="p-6 text-sm text-red-600">{scheduledError}</p>
          ) : scheduled.length === 0 ? (
            <p className="p-6 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              No scheduled reports yet. Your team can register recurring exports with{' '}
              <code className="text-xs px-1 rounded" style={{ backgroundColor: 'var(--admin-bg)' }}>
                POST /api/reports/schedule/
              </code>
              .
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      Frequency
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      Format
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      Next run
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scheduled.map((row) => (
                    <tr
                      key={row.id}
                      style={{ borderBottom: '1px solid var(--admin-border)' }}
                      className="last:border-0"
                    >
                      <td className="py-3 px-4" style={{ color: 'var(--admin-text)' }}>
                        {row.name}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--admin-text-muted)' }}>
                        {row.report_type_display || row.report_type}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--admin-text-muted)' }}>
                        {row.frequency_display || row.frequency}
                      </td>
                      <td className="py-3 px-4 uppercase" style={{ color: 'var(--admin-text-muted)' }}>
                        {row.format}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--admin-text-muted)' }}>
                        {row.next_run_at
                          ? new Date(row.next_run_at).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: row.is_active
                              ? 'color-mix(in srgb, var(--color-accent) 20%, transparent)'
                              : 'var(--admin-bg)',
                            color: row.is_active ? 'var(--color-accent)' : 'var(--admin-text-muted)',
                          }}
                        >
                          {row.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
