/**
 * Settings API Integration
 *
 * Centralized API client for admin settings: church profile, user profile,
 * notifications, security, and subscription data.
 *
 * @module lib/settingsApi
 */

import { getApiBaseUrl, getAccessToken } from './api';

const DEFAULT_PRIMARY = '#0B2A4A';
const DEFAULT_ACCENT = '#2FC4B2';
const DEFAULT_SIDEBAR = '#0B2A4A';
const DEFAULT_BG = '#F8FAFC';

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...getAuthHeaders(), ...init?.headers } });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (data?.error as string) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/** PUT church with multipart form (for `logo` file). Do not set Content-Type (browser sets boundary). */
async function fetchAuthMultipart<T>(url: string, form: FormData): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { method: 'PUT', headers, body: form });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (data?.error as string) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function appendIfDefined(form: FormData, key: string, value: string | undefined): void {
  if (value !== undefined && value !== null && value !== '') {
    form.append(key, value);
  }
}

/** Stored user from login */
export interface StoredUser {
  id: string;
  email?: string;
  church?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
  church_name?: string;
  [key: string]: unknown;
}

/** Church API response */
export interface ChurchApiResponse {
  id: string;
  name: string;
  email?: string;
  subdomain?: string;
  denomination?: string;
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
  tagline?: string;
  mission?: string;
  church_size?: string;
  logo?: string;
  logo_url?: string;
  timezone?: string;
  currency?: string;
  status?: string;
  subscription_status?: string;
  subscription_plan?: string;
  billing_cycle?: string;
  trial_ends_at?: string;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  next_billing_date?: string;
  is_trial_active?: boolean;
  is_subscription_active?: boolean;
  days_until_expiry?: number;
  plan_price?: number;
  max_users?: number;
  user_count?: number;
  primary_color?: string;
  accent_color?: string;
  sidebar_color?: string;
  background_color?: string;
  dark_mode?: boolean;
  service_times?: { id: string; day: string; time: string; label: string }[];
  [key: string]: unknown;
}

function normalizeSubscriptionStatus(church: ChurchApiResponse): 'trial' | 'active' | 'inactive' {
  const fromExplicit = String(church.subscription_status ?? church.status ?? '')
    .trim()
    .toLowerCase();

  if (fromExplicit) {
    if (['trial', 'in_trial', 'trialing', 'on_trial'].includes(fromExplicit)) {
      return 'trial';
    }
    if (['active', 'subscribed', 'paid', 'current', 'live', 'enabled'].includes(fromExplicit)) {
      return 'active';
    }
    if (
      ['inactive', 'expired', 'suspended', 'cancelled', 'canceled', 'disabled'].includes(
        fromExplicit
      )
    ) {
      return 'inactive';
    }
  }

  if (church.is_trial_active === true) {
    return 'trial';
  }
  if (church.is_subscription_active === true) {
    return 'active';
  }
  if (church.is_subscription_active === false) {
    return 'inactive';
  }

  return 'trial';
}

/** User API response */
export interface UserApiResponse {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image?: string;
  profile_image_url?: string;
  church?: string;
  church_name?: string;
  full_name?: string;
  [key: string]: unknown;
}

/** Notification preferences API */
export interface NotificationPreferenceResponse {
  enable_in_app?: boolean;
  enable_email?: boolean;
  enable_sms?: boolean;
  announcements?: boolean;
  reminders?: boolean;
  birthdays?: boolean;
  events?: boolean;
  finance?: boolean;
  digest_mode?: boolean;
  digest_frequency?: string;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

/** Get stored user from localStorage (from login) */
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/** Get church ID from stored user */
export function getChurchId(): string | null {
  const user = getStoredUser();
  if (!user) {
    return null;
  }
  const church = user.church;
  return church ? String(church) : null;
}

/** Fetch church by ID */
export async function getChurch(churchId: string): Promise<ChurchApiResponse | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  try {
    const base = getApiBaseUrl();
    return await fetchAuth<ChurchApiResponse>(`${base}/auth/churches/${churchId}/`);
  } catch {
    return null;
  }
}

export type UpdateChurchOptions = {
  /** When set, sends multipart/form-data so the logo is persisted on the server (and Cloudinary if configured). */
  logoFile?: File | null;
};

/**
 * Update church (JSON). For a new logo file, pass `options.logoFile` — uses multipart PUT with `logo`.
 */
export async function updateChurch(
  churchId: string,
  data: Partial<ChurchApiResponse>,
  options?: UpdateChurchOptions
): Promise<ChurchApiResponse> {
  const base = getApiBaseUrl();
  const url = `${base}/auth/churches/${churchId}/`;

  if (options?.logoFile) {
    const form = new FormData();
    appendIfDefined(form, 'name', data.name);
    appendIfDefined(form, 'tagline', data.tagline);
    appendIfDefined(form, 'address', data.address);
    appendIfDefined(form, 'mission', data.mission);
    appendIfDefined(form, 'website', data.website);
    appendIfDefined(form, 'denomination', data.denomination);
    appendIfDefined(form, 'country', data.country);
    appendIfDefined(form, 'region', data.region);
    appendIfDefined(form, 'city', data.city);
    appendIfDefined(form, 'phone', data.phone);
    appendIfDefined(form, 'primary_color', data.primary_color);
    appendIfDefined(form, 'accent_color', data.accent_color);
    appendIfDefined(form, 'sidebar_color', data.sidebar_color);
    appendIfDefined(form, 'background_color', data.background_color);
    if (typeof data.dark_mode === 'boolean') {
      form.append('dark_mode', data.dark_mode ? 'true' : 'false');
    }
    form.append('logo', options.logoFile);
    return fetchAuthMultipart<ChurchApiResponse>(url, form);
  }

  return fetchAuth<ChurchApiResponse>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Fetch current user by ID */
export async function getUser(userId: string): Promise<UserApiResponse | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  try {
    const base = getApiBaseUrl();
    return await fetchAuth<UserApiResponse>(`${base}/auth/users/${userId}/`);
  } catch {
    return null;
  }
}

/** Update user */
export async function updateUser(
  userId: string,
  data: Partial<UserApiResponse>
): Promise<UserApiResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<UserApiResponse>(`${base}/auth/users/${userId}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Get notification preferences */
export async function getNotificationPreferences(): Promise<NotificationPreferenceResponse | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  try {
    const base = getApiBaseUrl();
    return await fetchAuth<NotificationPreferenceResponse>(`${base}/notifications/preferences/`);
  } catch {
    return null;
  }
}

/** Update notification preferences */
export async function updateNotificationPreferences(
  data: Partial<NotificationPreferenceResponse>
): Promise<NotificationPreferenceResponse> {
  const base = getApiBaseUrl();
  return fetchAuth<NotificationPreferenceResponse>(`${base}/notifications/preferences/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Change password */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  newPasswordConfirm: string
): Promise<void> {
  const base = getApiBaseUrl();
  await fetchAuth<unknown>(`${base}/auth/change-password/`, {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });
}

/** Church defaults for theme */
export const churchDefaults = {
  primaryColor: DEFAULT_PRIMARY,
  accentColor: DEFAULT_ACCENT,
  sidebarColor: DEFAULT_SIDEBAR,
  backgroundColor: DEFAULT_BG,
};

/** Map church API to ChurchProfile shape */
export function mapChurchToProfile(church: ChurchApiResponse | null): Record<string, unknown> {
  if (!church) {
    return {};
  }
  return {
    churchName: church.name ?? '',
    tagline: church.tagline ?? '',
    logoUrl: church.logo_url ?? null,
    primaryColor: church.primary_color ?? DEFAULT_PRIMARY,
    accentColor: church.accent_color ?? DEFAULT_ACCENT,
    sidebarColor: church.sidebar_color ?? DEFAULT_SIDEBAR,
    backgroundColor: church.background_color ?? DEFAULT_BG,
    address: church.address ?? '',
    mission: church.mission ?? '',
    website: church.website ?? '',
    subscriptionStatus: normalizeSubscriptionStatus(church),
    darkMode: church.dark_mode ?? false,
    theme: church.dark_mode ? 'dark' : 'light',
  };
}

/** Map church API to ChurchContext ChurchSetupData services */
export function mapChurchToServices(
  church: ChurchApiResponse | null
): { id: string; day: string; time: string; label: string }[] {
  if (!church?.service_times || !Array.isArray(church.service_times)) {
    return [];
  }
  return church.service_times.map((s) => ({
    id: s.id ?? crypto.randomUUID(),
    day: s.day ?? 'Sunday',
    time: s.time ?? '09:00',
    label: s.label ?? '',
  }));
}
