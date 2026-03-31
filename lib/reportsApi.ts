/**
 * Church reports API — GET /api/reports/... with optional JSON preview or file export.
 */

import { getAccessToken, getApiBaseUrl } from '@/lib/api';

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  const h: Record<string, string> = {};
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

export type ReportExportFormat = 'pdf' | 'xlsx' | 'csv';

export interface ReportQueryParams {
  date_from?: string;
  date_to?: string;
  membership_status?: string;
  status?: string;
  department_id?: string;
}

function buildSearchParams(base: ReportQueryParams, format?: ReportExportFormat): string {
  const q = new URLSearchParams();
  if (base.date_from) {
    q.set('date_from', base.date_from);
  }
  if (base.date_to) {
    q.set('date_to', base.date_to);
  }
  if (base.membership_status) {
    q.set('membership_status', base.membership_status);
  }
  if (base.status) {
    q.set('status', base.status);
  }
  if (base.department_id) {
    q.set('department_id', base.department_id);
  }
  if (format) {
    q.set('format', format);
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Relative path under /api/reports/ (e.g. `members/` or `finance/income/`). */
export async function fetchReportJson(
  reportPath: string,
  params: ReportQueryParams
): Promise<unknown> {
  const base = getApiBaseUrl();
  const url = `${base}/reports/${reportPath.replace(/^\//, '')}${buildSearchParams(params)}`;
  const res = await fetch(url, { method: 'GET', headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (typeof (data as { detail?: string }).detail === 'string'
        ? (data as { detail: string }).detail
        : null) ||
      (typeof (data as { error?: string }).error === 'string'
        ? (data as { error: string }).error
        : null) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function downloadReportFile(
  reportPath: string,
  format: ReportExportFormat,
  params: ReportQueryParams
): Promise<void> {
  const base = getApiBaseUrl();
  const url = `${base}/reports/${reportPath.replace(/^\//, '')}${buildSearchParams(params, format)}`;
  const res = await fetch(url, { method: 'GET', headers: { ...authHeaders() } });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let msg = `Download failed: ${res.status}`;
    if (ct.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      msg =
        (typeof (data as { detail?: string }).detail === 'string'
          ? (data as { detail: string }).detail
          : null) ||
        (typeof (data as { error?: string }).error === 'string'
          ? (data as { error: string }).error
          : null) ||
        msg;
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('Downloaded file is empty. Please try again.');
  }
  const dispo = res.headers.get('Content-Disposition');
  const m = dispo?.match(/filename="?([^";]+)"?/i);
  const ext = format === 'xlsx' ? 'xlsx' : format;
  const filename = m?.[1]?.trim() || `report.${ext}`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Delay revoke to avoid race conditions in some browsers (commonly affects PDF downloads).
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export interface ScheduledReportRow {
  id: string;
  name: string;
  report_type: string;
  report_type_display?: string;
  frequency: string;
  frequency_display?: string;
  format: string;
  is_active: boolean;
  last_run_at?: string | null;
  next_run_at?: string | null;
  recipient_emails?: string[];
  created_at?: string;
}

export async function fetchScheduledReports(): Promise<ScheduledReportRow[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/reports/scheduled/`, {
    method: 'GET',
    headers: { ...authHeaders() },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    const msg =
      (typeof (data as { detail?: string }).detail === 'string'
        ? (data as { detail: string }).detail
        : null) ||
      (typeof (data as { error?: string }).error === 'string'
        ? (data as { error: string }).error
        : null) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return Array.isArray(data) ? (data as ScheduledReportRow[]) : [];
}
