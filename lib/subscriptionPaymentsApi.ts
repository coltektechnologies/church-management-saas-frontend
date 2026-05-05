/**
 * Authenticated Paystack checkout for subscription upgrades (billing settings).
 * POST /api/auth/payments/initialize/
 */

import { messageFromApiErrorJson } from '@/lib/apiMessages';
import { getApiBaseUrl, getAccessToken } from '@/lib/api';

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export type InitializePaystackPayload = {
  /** Amount in GHS (major units). Paystack receives pesewas from the backend. */
  amount: number;
  email: string;
  /** Path on your frontend origin, e.g. /admin/settings/superadmin/billing */
  redirect_path: string;
  metadata: {
    subscription_plan: string;
    billing_cycle: 'MONTHLY' | 'YEARLY';
    frontend_plan_id?: string;
  };
};

export type InitializePaystackResponse = {
  status: string;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  message?: string;
};

/** Start Paystack hosted checkout; browser should navigate to authorization_url. */
export async function initializePaystackCheckout(
  payload: InitializePaystackPayload
): Promise<{ authorization_url: string; reference?: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/payments/initialize/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      amount: payload.amount,
      email: payload.email,
      redirect_path: payload.redirect_path,
      metadata: payload.metadata,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as InitializePaystackResponse;
  if (!res.ok) {
    throw new Error(
      messageFromApiErrorJson(data as Record<string, unknown>, 'Could not start payment')
    );
  }
  if (data.status !== 'success' || !data.authorization_url) {
    throw new Error(data.message || 'Paystack did not return a checkout URL');
  }
  return { authorization_url: data.authorization_url, reference: data.reference };
}
