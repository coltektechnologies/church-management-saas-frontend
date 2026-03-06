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
    const first = (v: unknown) => (Array.isArray(v) ? v[0] : typeof v === 'string' ? v : undefined);
    const message =
      first(data?.email) ||
      first(data?.password) ||
      first(data?.non_field_errors) ||
      data?.detail ||
      'Login failed. Please check your email and password.';
    throw new Error(typeof message === 'string' ? message : 'Login failed');
  }

  return data as LoginResponse;
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
export async function registrationInitializePayment(
  sessionId: string
): Promise<
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
