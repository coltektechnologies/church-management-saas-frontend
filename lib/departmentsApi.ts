/**
 * Departments API — list/create/update departments, members, and activities.
 * @module lib/departmentsApi
 */

import { getApiBaseUrl, getAccessToken } from './api';
import type { ThemeColor } from '@/constants/departments';
import type { Department } from '@/types/Department';
import type { Activity } from '@/types/activity';

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(), ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      extractFirstFieldError(data) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function extractFirstFieldError(data: Record<string, unknown>): string | null {
  for (const v of Object.values(data)) {
    if (typeof v === 'string') {
      return v;
    }
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') {
      return v[0];
    }
  }
  return null;
}

function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

const THEME_COLORS: ThemeColor[] = ['navy', 'pink', 'yellow', 'green', 'blue', 'purple'];

export function parseThemeColor(raw: string | null | undefined): ThemeColor {
  if (!raw) {
    return 'navy';
  }
  const s = String(raw).toLowerCase().trim();
  if (THEME_COLORS.includes(s as ThemeColor)) {
    return s as ThemeColor;
  }
  return 'navy';
}

/** Backend list row */
export interface DepartmentListRow {
  id: string;
  name: string;
  code: string;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  member_count?: number;
  head_name?: string | null;
  elder_in_charge_name?: string | null;
  upcoming_programs_count?: number;
  past_programs_count?: number;
}

export interface DepartmentDetailResponse {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  member_count?: number;
  /** Present on some API shapes; list/detail may omit when `heads` is populated */
  head_name?: string | null;
  heads?: {
    id: string;
    name: string;
    assigned_at?: string;
    /** API: HEAD | ASSISTANT; omit for legacy rows */
    head_role?: string;
  }[];
  elder_in_charge?: string | null;
  elder_in_charge_name?: string | null;
  current_budget?: {
    allocated?: string;
    spent?: string;
    remaining?: string;
    utilization?: string;
  } | null;
  upcoming_programs_count?: number;
  past_programs_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MemberDepartmentRow {
  id: string;
  member: string;
  member_name?: string;
  department: string;
  department_name?: string;
  role_in_department?: string | null;
  assigned_at?: string;
}

export interface DepartmentActivityRow {
  id: string;
  department: string;
  title: string;
  description?: string | null;
  status: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  /** ISO timestamps when present (activity feed / sorting). */
  created_at?: string;
  updated_at?: string;
  /** From API serializer when present; derive display status from dates when absent. */
  is_upcoming?: boolean;
}

/** Badge label for department activities (stored `status` defaults to UPCOMING and is not auto-updated). */
export type ActivityDisplayStatus = 'Past' | 'Ongoing' | 'Upcoming';

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseHmOnDate(ymd: string, hhmmss: string): number | null {
  const part = hhmmss.trim().slice(0, 5);
  const [hs, ms] = part.split(':');
  const h = parseInt(hs ?? '', 10);
  const m = parseInt(ms ?? '', 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return null;
  }
  const [y, mo, d] = ymd.split('-').map((x) => parseInt(x, 10));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return null;
  }
  return new Date(y, mo - 1, d, h, m, 0, 0).getTime();
}

/**
 * Derive Past / Ongoing / Upcoming from calendar dates and times.
 * Aligns with API time_filter / list filters using `end_date` vs today, not the stored `status` field.
 */
export function deriveActivityDisplayStatus(
  row: DepartmentActivityRow,
  now = new Date()
): ActivityDisplayStatus {
  const sd = row.start_date;
  const ed = row.end_date;
  if (!sd || !ed) {
    const u = (row.status || '').toUpperCase();
    if (u === 'PAST') {
      return 'Past';
    }
    if (u === 'ONGOING') {
      return 'Ongoing';
    }
    return 'Upcoming';
  }

  const today = formatLocalYmd(now);

  if (ed < today) {
    return 'Past';
  }
  if (sd > today) {
    return 'Upcoming';
  }

  // Today lies within [sd, ed] (inclusive)
  if (ed === today && row.end_time?.trim()) {
    const endMs = parseHmOnDate(ed, row.end_time);
    if (endMs !== null && now.getTime() > endMs) {
      return 'Past';
    }
  }

  if (sd === today && row.start_time?.trim()) {
    const startMs = parseHmOnDate(sd, row.start_time);
    if (startMs !== null && now.getTime() < startMs) {
      return 'Upcoming';
    }
  }

  const u = (row.status || '').toUpperCase();
  if (u === 'ONGOING') {
    return 'Ongoing';
  }
  return 'Ongoing';
}

function numFromBudget(s: string | undefined): number {
  if (s === undefined || s === null) {
    return 0;
  }
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Map API list row → UI Department (counts refreshed after detail/activities load). */
export function mapListRowToDepartment(row: DepartmentListRow): Department {
  const themeColor = parseThemeColor(row.color);
  const icon =
    row.icon && row.icon.length <= 50 && !row.icon.startsWith('data:') ? row.icon : 'prayer';

  return {
    id: String(row.id),
    name: row.name,
    code: row.code,
    description: '',
    members: row.member_count ?? 0,
    activities: (row.upcoming_programs_count ?? 0) + (row.past_programs_count ?? 0),
    budgetUsed: 0,
    annualBudget: 0,
    status: row.is_active ? 'active' : 'inactive',
    themeColor,
    icon,
    dateEstablished: new Date().toISOString(),
    settings: {
      autoApprovalThreshold: 5,
      requiresElderApproval: true,
      weeklySummary: true,
      canSubmitAnnouncements: true,
    },
  };
}

/** Merge detail into UI department (description, budget, dates). */
export function mergeDepartmentDetail(
  base: Department,
  detail: DepartmentDetailResponse,
  activityCount?: number
): Department {
  const themeColor = parseThemeColor(detail.color);
  const icon =
    detail.icon && detail.icon.length <= 50 && !detail.icon.startsWith('data:')
      ? detail.icon
      : base.icon;

  const cb = detail.current_budget;
  const budgetUsed = cb ? numFromBudget(cb.spent) : base.budgetUsed;
  const annualBudget = cb ? numFromBudget(cb.allocated) : base.annualBudget;

  const est = detail.created_at
    ? new Date(detail.created_at).toLocaleDateString()
    : base.dateEstablished;

  const heads = detail.heads ?? [];
  const primaryHead = heads.find((h) => (h.head_role ?? 'HEAD') === 'HEAD') ?? heads[0];
  const assistantHead = heads.find((h) => h.head_role === 'ASSISTANT');
  return {
    ...base,
    name: detail.name,
    code: detail.code,
    description: detail.description?.trim() ?? '',
    members: detail.member_count ?? base.members,
    activities: activityCount !== undefined ? activityCount : base.activities,
    budgetUsed,
    annualBudget,
    status: detail.is_active ? 'active' : 'inactive',
    themeColor,
    icon,
    dateEstablished: est,
    headMemberId: primaryHead?.id ?? null,
    headDisplayName: primaryHead?.name ?? null,
    assistantHeadMemberId: assistantHead?.id ?? null,
    assistantHeadDisplayName: assistantHead?.name ?? null,
    elderInChargeMemberId: detail.elder_in_charge ?? null,
    elderInChargeDisplayName: detail.elder_in_charge_name ?? null,
  };
}

export function mapActivityRowToActivity(row: DepartmentActivityRow): Activity {
  const datePart = row.start_date;
  const timePart = row.start_time ? row.start_time.slice(0, 8) : '00:00:00';
  const scheduled = `${datePart}T${timePart}`;
  let scheduledAt: string;
  try {
    scheduledAt = new Date(scheduled).toISOString();
  } catch {
    scheduledAt = new Date(row.start_date).toISOString();
  }

  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? '',
    scheduledAt,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export type DepartmentMemberUI = {
  id: string;
  assignmentId: string;
  name: string;
  role: string;
  joinedAt: string;
};

export function mapMemberDepartmentRow(row: MemberDepartmentRow): DepartmentMemberUI {
  return {
    id: String(row.member),
    assignmentId: String(row.id),
    name: row.member_name ?? 'Member',
    role: row.role_in_department?.trim() || 'Member',
    joinedAt: row.assigned_at ?? new Date().toISOString(),
  };
}

export function normalizeIconForApi(icon: string): string {
  if (!icon || icon.startsWith('data:')) {
    return 'prayer';
  }
  return icon.slice(0, 50);
}

export async function fetchDepartmentsList(): Promise<DepartmentListRow[]> {
  const base = getApiBaseUrl();
  const data = await fetchAuth<unknown>(`${base}/departments/`, { method: 'GET' });
  return normalizeListResponse<DepartmentListRow>(data);
}

/** GET /api/departments/for-program/ — departments with primary head contact for budget step 1 */
export interface DepartmentForProgramRow {
  id: string;
  name: string;
  code?: string;
  head_name: string | null;
  head_email: string | null;
  head_phone: string | null;
  elder_in_charge_name?: string | null;
  is_current_user_head?: boolean;
}

export async function fetchDepartmentsForProgram(): Promise<DepartmentForProgramRow[]> {
  const base = getApiBaseUrl();
  const data = await fetchAuth<unknown>(`${base}/departments/for-program/`, { method: 'GET' });
  return Array.isArray(data) ? data : normalizeListResponse<DepartmentForProgramRow>(data);
}

export async function fetchDepartmentDetail(id: string): Promise<DepartmentDetailResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentDetailResponse>(`${base}/departments/${id}/`, { method: 'GET' });
}

export type DepartmentPortalRole = 'department_head' | 'elder_in_charge';

/** Signed-in user’s department portal (primary head or elder in charge). */
export interface DepartmentMyPortalResponse {
  portal_role: DepartmentPortalRole;
  department: DepartmentDetailResponse;
  viewer_member: Record<string, unknown>;
}

export async function fetchDepartmentMyPortal(): Promise<DepartmentMyPortalResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentMyPortalResponse>(`${base}/departments/my-portal/`, {
    method: 'GET',
  });
}

export interface CreateDepartmentBody {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  head_member_id?: string;
}

export async function createDepartment(
  body: CreateDepartmentBody
): Promise<DepartmentDetailResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentDetailResponse>(`${base}/departments/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** PATCH body; `elder_in_charge` is member UUID or null to clear (update only). */
export type UpdateDepartmentBody = Partial<CreateDepartmentBody> & {
  elder_in_charge?: string | null;
};

export async function updateDepartment(
  id: string,
  body: UpdateDepartmentBody
): Promise<DepartmentDetailResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentDetailResponse>(`${base}/departments/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Assign department head (`member_id` = church member UUID). */
export async function setDepartmentHead(departmentId: string, memberId: string): Promise<void> {
  const base = getApiBaseUrl();
  await fetchAuth<unknown>(`${base}/departments/${departmentId}/head/`, {
    method: 'PUT',
    body: JSON.stringify({ member_id: memberId }),
  });
}

/** Assign assistant head, or pass `null` to remove. */
export async function setDepartmentAssistantHead(
  departmentId: string,
  memberId: string | null
): Promise<void> {
  const base = getApiBaseUrl();
  await fetchAuth<unknown>(`${base}/departments/${departmentId}/assistant-head/`, {
    method: 'PUT',
    body: JSON.stringify({ member_id: memberId }),
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/departments/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(
      (typeof data?.detail === 'string' ? data.detail : null) || `Request failed: ${res.status}`
    );
  }
}

const DEFAULT_MEMBER_DEPARTMENT_PAGE_SIZE = 50;

/** Single page of member–department rows (`?page=` when page > 1). */
export async function fetchMemberDepartmentsPage(page?: number): Promise<MemberDepartmentRow[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (page !== undefined && page !== null && page > 1) {
    sp.set('page', String(page));
  }
  const qs = sp.toString();
  const url = `${base}/member-departments/${qs ? `?${qs}` : ''}`;
  const data = await fetchAuth<unknown>(url, { method: 'GET' });
  return normalizeListResponse<MemberDepartmentRow>(data);
}

/**
 * Walk all pages until a partial page (DRF default PAGE_SIZE = 50).
 * `maxPages` is a safety cap; if the last page is still full, a console warning is logged.
 */
export async function fetchMemberDepartmentsAllPages(options?: {
  maxPages?: number;
}): Promise<MemberDepartmentRow[]> {
  const maxPages = options?.maxPages ?? 200;
  const all: MemberDepartmentRow[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const chunk = await fetchMemberDepartmentsPage(page > 1 ? page : undefined);
    all.push(...chunk);
    if (chunk.length < DEFAULT_MEMBER_DEPARTMENT_PAGE_SIZE) {
      break;
    }
    if (page === maxPages) {
      console.warn(
        '[departmentsApi] fetchMemberDepartmentsAllPages reached maxPages; increase maxPages if assignments are missing.'
      );
      break;
    }
  }
  return all;
}

/** All member–department rows for current church (fully paginated; filter client-side by department). */
export async function fetchMemberDepartments(options?: {
  maxPages?: number;
}): Promise<MemberDepartmentRow[]> {
  return fetchMemberDepartmentsAllPages(options);
}

/**
 * GET /api/departments/{id}/members/ — church members in this department (MemberSerializer).
 * Join with `fetchMemberDepartments()` for assignment id + role in this department.
 */
export interface DepartmentMemberApiRow {
  id: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string | null;
  membership_status?: string;
  member_since?: string | null;
  profile_photo?: string | null;
  location?: {
    phone_primary?: string | null;
    email?: string | null;
  } | null;
  department_names?: string[];
}

export async function fetchDepartmentMembers(
  departmentId: string
): Promise<DepartmentMemberApiRow[]> {
  const base = getApiBaseUrl();
  const data = await fetchAuth<unknown>(`${base}/departments/${departmentId}/members/`, {
    method: 'GET',
  });
  return normalizeListResponse<DepartmentMemberApiRow>(data);
}

export async function assignMemberToDepartment(payload: {
  member: string;
  department: string;
  role_in_department?: string;
}): Promise<MemberDepartmentRow> {
  const base = getApiBaseUrl();
  return fetchAuth<MemberDepartmentRow>(`${base}/member-departments/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeMemberFromDepartment(assignmentId: string): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/member-departments/${assignmentId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(
      (typeof data?.detail === 'string' ? data.detail : null) || `Request failed: ${res.status}`
    );
  }
}

export async function fetchDepartmentActivities(
  departmentId: string,
  timeFilter?: 'upcoming' | 'past'
): Promise<DepartmentActivityRow[]> {
  const base = getApiBaseUrl();
  const search = timeFilter ? `?time_filter=${encodeURIComponent(timeFilter)}` : '';
  const data = await fetchAuth<unknown>(
    `${base}/departments/${departmentId}/activities/${search}`,
    { method: 'GET' }
  );
  return normalizeListResponse<DepartmentActivityRow>(data);
}

/** Per-department stats from GET /api/departments/{id}/statistics/ */
export interface DepartmentStatisticsResponse {
  total_members?: number;
  current_program?: {
    title?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    total_income?: number;
    total_expenses?: number;
    net_budget?: number;
  } | null;
  /** Count of programs starting in the next 30 days (backend definition). */
  upcoming_programs?: number;
}

export async function fetchDepartmentStatistics(
  departmentId: string
): Promise<DepartmentStatisticsResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentStatisticsResponse>(
    `${base}/departments/${departmentId}/statistics/`,
    { method: 'GET' }
  );
}

export async function fetchDepartmentActivitiesPage(
  departmentId: string,
  opts?: { time_filter?: 'upcoming' | 'past'; page?: number }
): Promise<DepartmentActivityRow[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  if (opts?.page !== undefined && opts?.page !== null && opts.page > 1) {
    sp.set('page', String(opts.page));
  }
  if (opts?.time_filter) {
    sp.set('time_filter', opts.time_filter);
  }
  const qs = sp.toString();
  const url = `${base}/departments/${departmentId}/activities/${qs ? `?${qs}` : ''}`;
  const data = await fetchAuth<unknown>(url, { method: 'GET' });
  return normalizeListResponse<DepartmentActivityRow>(data);
}

const DEFAULT_ACTIVITY_PAGE_SIZE = 50;

/** Walk pages until a short page or maxPages (backend default page size = 50). */
export async function fetchDepartmentActivitiesAllPages(
  departmentId: string,
  options?: { time_filter?: 'upcoming' | 'past'; maxPages?: number }
): Promise<DepartmentActivityRow[]> {
  const maxPages = options?.maxPages ?? 8;
  const tf = options?.time_filter;
  const all: DepartmentActivityRow[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const chunk = await fetchDepartmentActivitiesPage(departmentId, {
      time_filter: tf,
      page: page > 1 ? page : undefined,
    });
    all.push(...chunk);
    if (chunk.length < DEFAULT_ACTIVITY_PAGE_SIZE) {
      break;
    }
  }
  return all;
}

export interface CreateActivityBody {
  title: string;
  description?: string;
  status: 'UPCOMING' | 'ONGOING' | 'PAST';
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
}

/** Map UI activity (single scheduled datetime) to backend activity create body. */
export function buildCreateActivityBodyFromScheduledAt(input: {
  title: string;
  description: string;
  scheduledAt: string;
}): CreateActivityBody {
  const date = new Date(input.scheduledAt);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const startDate = `${y}-${m}-${day}`;
  return {
    title: input.title,
    description: input.description,
    status: 'UPCOMING',
    start_date: startDate,
    end_date: startDate,
    start_time: date.toTimeString().slice(0, 8),
    end_time: null,
    location: null,
  };
}

export async function createDepartmentActivity(
  departmentId: string,
  body: CreateActivityBody
): Promise<DepartmentActivityRow> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentActivityRow>(`${base}/departments/${departmentId}/activities/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateDepartmentActivity(
  departmentId: string,
  activityId: string,
  body: Partial<CreateActivityBody>
): Promise<DepartmentActivityRow> {
  const base = getApiBaseUrl();
  return fetchAuth<DepartmentActivityRow>(
    `${base}/departments/${departmentId}/activities/${activityId}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
}

export async function deleteDepartmentActivity(
  departmentId: string,
  activityId: string
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/departments/${departmentId}/activities/${activityId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(
      (typeof data?.detail === 'string' ? data.detail : null) || `Request failed: ${res.status}`
    );
  }
}

export type ProgramApprovalStatus =
  | 'SUBMITTED'
  | 'ELDER_APPROVED'
  | 'SECRETARIAT_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRAFT';

export type ProgramApprovalDepartment = 'ELDER' | 'SECRETARIAT' | 'TREASURY';
export type ProgramApprovalAction = 'APPROVE' | 'REJECT';

export interface ProgramListItem {
  id: string;
  title: string;
  department: string;
  department_name?: string;
  status: ProgramApprovalStatus;
  status_display?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  submission_type?: string;
  submitted_at?: string | null;
  approved_at?: string | null;
  requires_approval?: string[];
}

function inferProgramApprovalDepartment(
  status: ProgramApprovalStatus
): ProgramApprovalDepartment | null {
  if (status === 'SUBMITTED') {
    return 'ELDER';
  }
  if (status === 'ELDER_APPROVED') {
    return 'SECRETARIAT';
  }
  if (status === 'SECRETARIAT_APPROVED') {
    return 'TREASURY';
  }
  return null;
}

/** GET /api/programs/{id}/ — for deep links (notification → department context). */
export async function fetchProgramDetail(programId: string): Promise<ProgramListItem> {
  const base = getApiBaseUrl();
  return fetchAuth<ProgramListItem>(`${base}/programs/${programId}/`, { method: 'GET' });
}

/** GET /api/programs/?status= */
export async function fetchProgramsByStatus(
  status: ProgramApprovalStatus
): Promise<ProgramListItem[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  sp.set('status', status);
  sp.set('page_size', '200');
  const data = await fetchAuth<unknown>(`${base}/programs/?${sp.toString()}`, { method: 'GET' });
  return normalizeListResponse<ProgramListItem>(data);
}

/** POST /api/programs/{id}/review/ */
export async function reviewProgramApproval(
  programId: string,
  opts: { action: ProgramApprovalAction; department?: ProgramApprovalDepartment; notes?: string },
  currentStatus?: ProgramApprovalStatus
): Promise<unknown> {
  const base = getApiBaseUrl();
  const department =
    opts.department ?? (currentStatus ? inferProgramApprovalDepartment(currentStatus) : null);
  if (!department) {
    throw new Error('Program is not in a reviewable approval stage.');
  }
  return fetchAuth(`${base}/programs/${programId}/review/`, {
    method: 'POST',
    body: JSON.stringify({
      department,
      action: opts.action,
      notes: opts.notes ?? '',
    }),
  });
}

/** GET /api/departments/{id}/member-messages/ — in-app batch history for department portal. */
export interface DepartmentMemberMessageHistoryItem {
  id: string;
  title: string;
  content: string;
  type: 'in_app';
  recipientCount: number;
  recipientIds: string[];
  status: string;
  sentAt: string | null;
}

export async function fetchDepartmentMemberMessages(
  departmentId: string
): Promise<DepartmentMemberMessageHistoryItem[]> {
  const base = getApiBaseUrl();
  const data = await fetchAuth<unknown>(`${base}/departments/${departmentId}/member-messages/`, {
    method: 'GET',
  });
  return Array.isArray(data) ? (data as DepartmentMemberMessageHistoryItem[]) : [];
}

export interface SendDepartmentMemberMessageResponse {
  success: boolean;
  message_id: string;
  sent: number;
  skipped_member_ids?: string[];
  errors?: string[];
  detail?: string;
}

/** POST bulk email, SMS, or in-app message to department members (head / elder in charge only). */
export async function sendDepartmentMemberMessage(
  departmentId: string,
  payload: {
    channel: 'email' | 'sms' | 'in_app';
    subject: string;
    body: string;
    member_ids: string[];
  }
): Promise<SendDepartmentMemberMessageResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<SendDepartmentMemberMessageResponse>(
    `${base}/departments/${departmentId}/member-messages/`,
    {
      method: 'POST',
      body: JSON.stringify({
        channel: payload.channel,
        subject: payload.subject,
        body: payload.body,
        member_ids: payload.member_ids,
      }),
    }
  );
}
