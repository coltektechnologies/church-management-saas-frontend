import { messageFromApiErrorJson } from '@/lib/apiMessages';

/**
 * API base URL for the church-management backend.
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:8000/api).
 */
export const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return url.replace(/\/$/, '');
};

export interface LoginCredentials {
  email: string;
  password: string;
  church_id?: string;
}

export interface LoginUser {
  id: string;
  email: string;
  username?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  user: LoginUser;
  tokens: {
    access: string;
    refresh: string;
  };
}

/** Call backend POST /api/auth/login/ and return user + tokens. */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      ...(credentials.church_id ? { church_id: credentials.church_id } : {}),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      messageFromApiErrorJson(data, 'Login failed. Please check your email and password.')
    );
  }

  return data as LoginResponse;
}

/**
 * Blacklist the refresh token on the server (POST /api/auth/logout/).
 * No-op if tokens are missing or API base URL is not configured.
 */
export async function logoutToServer(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  let base: string;
  try {
    base = getApiBaseUrl();
  } catch {
    return;
  }
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  if (!access || !refresh) {
    return;
  }

  try {
    await fetch(`${base}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // Network errors — caller still clears local session
  }
}

// ---------------------------------------------------------------------------
// Registration (multi-step church signup)
// ---------------------------------------------------------------------------

const REGISTRATION_SESSION_KEY = 'church_registration_session_id';

export function getStoredRegistrationSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(REGISTRATION_SESSION_KEY);
}

export function setStoredRegistrationSessionId(sessionId: string): void {
  localStorage.setItem(REGISTRATION_SESSION_KEY, sessionId);
}

export function clearStoredRegistrationSessionId(): void {
  localStorage.removeItem(REGISTRATION_SESSION_KEY);
}

// Draft: formData + currentStep + sessionId (survives refresh / back navigation within tab)
const REGISTRATION_DRAFT_KEY = 'church_registration_draft';

export interface RegistrationDraft {
  formData: Record<string, string>;
  currentStep: number;
  sessionId: string | null;
}

export function getRegistrationDraft(): RegistrationDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as RegistrationDraft;
    if (!parsed || typeof parsed.currentStep !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setRegistrationDraft(draft: RegistrationDraft): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota / private mode
  }
}

export function clearRegistrationDraft(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
}

/** Extract first error message from API error response. */
function apiErrorMessage(data: Record<string, unknown>, fallback: string): string {
  const errors = data?.errors as Record<string, unknown> | undefined;
  if (errors && typeof errors === 'object') {
    for (const v of Object.values(errors)) {
      const msg = Array.isArray(v) ? v[0] : typeof v === 'string' ? v : undefined;
      if (typeof msg === 'string') {
        return msg;
      }
    }
  }
  return (data?.message as string) || fallback;
}

/** Fetch subscription plans from backend (single source of truth for registration). */
export interface RegistrationPlan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  description: string;
  features: string[];
  requires_payment: boolean;
}

export async function getRegistrationPlans(): Promise<RegistrationPlan[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/registration/plans/`);
  if (!res.ok) {
    throw new Error('Failed to load plans');
  }
  const data = (await res.json()) as RegistrationPlan[];
  return Array.isArray(data) ? data : [];
}

/** Step 1: Church information. Returns session_id. */
export async function registrationStep1(payload: {
  church_name: string;
  church_email: string;
  subdomain: string;
  country: string;
  region: string;
  city: string;
  address?: string;
  denomination?: string;
  website?: string;
  church_size: string;
}): Promise<{ session_id: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/registration/step1/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, 'Invalid church information'));
  }
  if (data.status !== 'success' || !data.session_id) {
    throw new Error((data.message as string) || 'Step 1 failed');
  }
  return { session_id: data.session_id as string };
}

/** Step 2: Admin details. Requires session_id from step 1. */
export async function registrationStep2(
  sessionId: string,
  payload: {
    first_name: string;
    last_name: string;
    admin_email: string;
    phone_number: string;
    position: string;
    password: string;
    confirm_password: string;
  }
): Promise<{ session_id: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/registration/step2/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, ...payload }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, 'Invalid admin details'));
  }
  if (data.status !== 'success' || !data.session_id) {
    throw new Error((data.message as string) || 'Step 2 failed');
  }
  return { session_id: data.session_id as string };
}

/** Step 3: Subscription plan. Requires session_id from step 2. */
export async function registrationStep3(
  sessionId: string,
  payload: {
    subscription_plan: string;
    billing_cycle?: string;
  }
): Promise<{ session_id: string; plan_details?: Record<string, unknown> }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/registration/step3/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, ...payload }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, 'Invalid plan selection'));
  }
  if (data.status !== 'success' || !data.session_id) {
    throw new Error((data.message as string) || 'Step 3 failed');
  }
  return {
    session_id: data.session_id as string,
    plan_details: data.plan_details as Record<string, unknown> | undefined,
  };
}

export interface RegistrationCompleteResult {
  user: LoginUser;
  church: Record<string, unknown>;
  tokens: { access: string; refresh: string };
}

/** Step 4: Initialize payment. For FREE/TRIAL completes registration (201). For paid returns authorization_url (200). */
export async function registrationInitializePayment(sessionId: string): Promise<
  | {
      requires_payment: false;
      user: LoginUser;
      church: Record<string, unknown>;
      tokens: { access: string; refresh: string };
    }
  | { requires_payment: true; authorization_url: string; reference: string }
> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/registration/initialize-payment/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, 'Payment initialization failed'));
  }

  if (res.status === 201 && data.user && data.tokens) {
    return {
      requires_payment: false,
      user: data.user as LoginUser,
      church: (data.church as Record<string, unknown>) || {},
      tokens: data.tokens as { access: string; refresh: string },
    };
  }
  if (data.requires_payment && data.authorization_url) {
    return {
      requires_payment: true,
      authorization_url: data.authorization_url as string,
      reference: (data.reference as string) || '',
    };
  }
  throw new Error((data.message as string) || 'Invalid response from server');
}

/** Verify payment and complete registration (paid plans). */
/** Get stored access token for authenticated API calls. */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('access_token');
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export interface CreateMemberPayload {
  title: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE';
  date_of_birth: string;
  marital_status: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED';
  national_id: string;
  phone_number: string;
  email?: string;
  occupation: string;
  residential_address: string;
  city: string;
  region: string;
  custom_region?: string;
  emergency_contact: {
    full_name: string;
    relationship: string;
    phone_number: string;
  };
  member_since: string;
  membership_status: 'ACTIVE' | 'TRANSFER' | 'NEW_CONVERT' | 'VISITOR' | 'INACTIVE';
  baptism_status?: 'BAPTISED' | 'NOT_BAPTISED';
  education_level: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'GRADUATE' | 'POSTGRADUATE';
  interested_departments: string[];
  admin_notes?: string;
  send_credentials_via_email?: boolean;
  send_credentials_via_sms?: boolean;
}

export interface CreateMemberResponse {
  id: string;
  full_name: string;
  member_id: string;
  message: string;
  system_access_created?: boolean;
  email?: string;
  username?: string;
  password?: string;
  /** Omitted when delivery is async */
  email_sent?: boolean;
  sms_sent?: boolean;
  credentials_delivery_queued?: boolean;
  credentials_delivery_skipped_reason?: string;
  credentials_delivery_note?: string;
}

/** Create a new member. Requires authenticated user with church context. */
export async function createMember(payload: CreateMemberPayload): Promise<CreateMemberResponse> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to add a member');
  }

  const res = await fetch(`${base}/members/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(messageFromApiErrorJson(data, 'Failed to create member'));
  }

  return data as unknown as CreateMemberResponse;
}

export interface MemberListItem {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  membership_status: string;
  member_since: string;
  gender?: string;
  /** Present when member has portal login; matches `User.id` for role assignments. */
  system_user_id?: string | null;
  /** Active department assignments from `MemberDepartment` (GET list/detail). */
  department_names?: string[];
  location?: {
    phone_primary?: string;
    email?: string | null;
    address?: string;
    city?: string | null;
    region?: string | null;
  };
}

/** Get list of members for the current church. */
export async function getMembers(): Promise<MemberListItem[]> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    return [];
  }
  const res = await fetch(`${base}/members/members/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json().catch(() => [])) as MemberListItem[];
  return Array.isArray(data) ? data : [];
}

/** Visitor rows from GET /members/visitors/ (church-scoped). */
export interface VisitorListItem {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
}

export async function getVisitors(): Promise<VisitorListItem[]> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    return [];
  }
  const res = await fetch(`${base}/members/visitors/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return [];
  }
  const raw = (await res.json().catch(() => [])) as unknown;
  const data = Array.isArray(raw) ? raw : [];
  return data as VisitorListItem[];
}

export interface MemberLocationDetail {
  id?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string | null;
  address?: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
}

export interface MemberDetail extends Omit<MemberListItem, 'location'> {
  title?: string | null;
  middle_name?: string | null;
  date_of_birth?: string | null;
  marital_status?: string | null;
  national_id?: string | null;
  baptism_status?: string | null;
  education_level?: string | null;
  occupation?: string | null;
  employer?: string | null;
  notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  notification_preference?: string;
  is_active?: boolean;
  has_system_access?: boolean;
  location?: MemberLocationDetail;
}

/** Get member details by ID. */
export async function getMember(id: string): Promise<MemberDetail | null> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const res = await fetch(`${base}/members/members/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json().catch(() => null)) as MemberDetail;
}

/** Update member. */
export async function updateMember(id: string, data: Partial<MemberDetail>): Promise<MemberDetail> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to update a member');
  }
  const res = await fetch(`${base}/members/members/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(messageFromApiErrorJson(result, 'Failed to update member'));
  }
  return result as unknown as MemberDetail;
}

/** Delete member (soft delete). */
export async function deleteMember(id: string): Promise<void> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to delete a member');
  }
  const res = await fetch(`${base}/members/members/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(messageFromApiErrorJson(data, 'Failed to delete member'));
  }
}

export interface SendNotificationSmsPayload {
  phone_number: string;
  message: string;
  member_id?: string;
}

export interface SendNotificationEmailPayload {
  email_address: string;
  subject: string;
  message_html: string;
  member_id?: string;
}

/** POST /api/notifications/send-sms/ — church plan must allow SMS. */
export async function sendNotificationSms(payload: SendNotificationSmsPayload): Promise<void> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to send SMS');
  }
  const res = await fetch(`${base}/notifications/send-sms/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(messageFromApiErrorJson(data, 'Failed to send SMS'));
  }
}

/** POST /api/notifications/send-email/ — church plan must allow email. */
export async function sendNotificationEmail(payload: SendNotificationEmailPayload): Promise<void> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to send email');
  }
  const res = await fetch(`${base}/notifications/send-email/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(messageFromApiErrorJson(data, 'Failed to send email'));
  }
}

export interface MemberStats {
  total_members: number;
  total_change_percent: number;
  active_members: number;
  active_change_percent: number;
  inactive_members: number;
  inactive_change_percent: number;
  new_members_this_month: number;
  new_members_change_percent: number;
  pending_approvals: number;
}

const emptyMemberStats: MemberStats = {
  total_members: 0,
  total_change_percent: 0,
  active_members: 0,
  active_change_percent: 0,
  inactive_members: 0,
  inactive_change_percent: 0,
  new_members_this_month: 0,
  new_members_change_percent: 0,
  pending_approvals: 0,
};

/** Get member statistics for the current church. */
export type TitheOfferingStatsRequest =
  | number
  | {
      periodMonths?: number;
      calendarYear?: number;
      yearlyFrom?: number;
      yearlyTo?: number;
    };

export interface TitheOfferingStats {
  view?: string;
  calendar_year?: number;
  yearly_from?: number;
  yearly_to?: number;
  monthly_trend: { month: string; tithe: number; offering: number }[];
  yearly_trend: { year: string; tithe: number; offering: number }[];
  this_month: {
    tithe_total: string;
    offering_total: string;
    tithe_by_week: { name: string; value: number }[];
    offering_by_week: { name: string; value: number }[];
  };
}

function emptyTitheOfferingStats(): TitheOfferingStats {
  const w = [
    { name: 'W1', value: 0 },
    { name: 'W2', value: 0 },
    { name: 'W3', value: 0 },
    { name: 'W4', value: 0 },
  ];
  return {
    monthly_trend: [],
    yearly_trend: [],
    this_month: {
      tithe_total: '0',
      offering_total: '0',
      tithe_by_week: w,
      offering_by_week: w,
    },
  };
}

function num(v: unknown): number {
  if (v === null || v === undefined) {
    return 0;
  }
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Get tithe and offering statistics for the current church. */
export async function getTitheOfferingStats(
  arg: TitheOfferingStatsRequest = 9
): Promise<TitheOfferingStats> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    return emptyTitheOfferingStats();
  }

  const sp = new URLSearchParams();
  if (typeof arg === 'number') {
    sp.set('period_months', String(arg));
  } else if (arg.calendarYear !== null && arg.calendarYear !== undefined) {
    sp.set('calendar_year', String(arg.calendarYear));
  } else if (
    arg.yearlyFrom !== null &&
    arg.yearlyFrom !== undefined &&
    arg.yearlyTo !== null &&
    arg.yearlyTo !== undefined
  ) {
    sp.set('year_from', String(arg.yearlyFrom));
    sp.set('year_to', String(arg.yearlyTo));
  } else {
    sp.set('period_months', String(arg.periodMonths ?? 9));
  }

  try {
    const res = await fetch(`${base}/analytics/finance/tithe-offerings/?${sp.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return emptyTitheOfferingStats();
    }

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const trendRaw = (data.monthly_trend as Record<string, unknown>[]) ?? [];
    const trend = trendRaw.map((r) => ({
      month: String(r.month ?? ''),
      tithe: num(r.tithe),
      offering: num(r.offering),
    }));
    const yearlyRaw = (data.yearly_trend as Record<string, unknown>[]) ?? [];
    const yearly = yearlyRaw.map((r) => ({
      year: String(r.year ?? ''),
      tithe: num(r.tithe),
      offering: num(r.offering),
    }));
    const tm = (data.this_month as TitheOfferingStats['this_month']) ?? {
      tithe_total: '0',
      offering_total: '0',
      tithe_by_week: [],
      offering_by_week: [],
    };
    return {
      view: typeof data.view === 'string' ? data.view : undefined,
      calendar_year: typeof data.calendar_year === 'number' ? data.calendar_year : undefined,
      yearly_from: typeof data.yearly_from === 'number' ? data.yearly_from : undefined,
      yearly_to: typeof data.yearly_to === 'number' ? data.yearly_to : undefined,
      monthly_trend: trend,
      yearly_trend: yearly,
      this_month: {
        tithe_total: String(tm.tithe_total ?? '0'),
        offering_total: String(tm.offering_total ?? '0'),
        tithe_by_week: Array.isArray(tm.tithe_by_week) ? tm.tithe_by_week : [],
        offering_by_week: Array.isArray(tm.offering_by_week) ? tm.offering_by_week : [],
      },
    };
  } catch {
    return emptyTitheOfferingStats();
  }
}

export async function getMemberStats(): Promise<MemberStats> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!token) {
    return emptyMemberStats;
  }

  try {
    const res = await fetch(`${base}/analytics/members/stats/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return emptyMemberStats;
    }

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      total_members: (data.total_members as number) ?? 0,
      total_change_percent: (data.total_change_percent as number) ?? 0,
      active_members: (data.active_members as number) ?? 0,
      active_change_percent: (data.active_change_percent as number) ?? 0,
      inactive_members: (data.inactive_members as number) ?? 0,
      inactive_change_percent: (data.inactive_change_percent as number) ?? 0,
      new_members_this_month: (data.new_members_this_month as number) ?? 0,
      new_members_change_percent: (data.new_members_change_percent as number) ?? 0,
      pending_approvals: (data.pending_approvals as number) ?? 0,
    };
  } catch {
    return emptyMemberStats;
  }
}

export async function registrationVerifyPayment(
  sessionId: string,
  reference: string
): Promise<RegistrationCompleteResult> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/registration/verify-payment/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, reference }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, 'Payment verification failed'));
  }
  if (data.status !== 'success' || !data.user || !data.tokens) {
    throw new Error((data.message as string) || 'Verification failed');
  }
  return {
    user: data.user as LoginUser,
    church: (data.church as Record<string, unknown>) || {},
    tokens: data.tokens as { access: string; refresh: string },
  };
}
