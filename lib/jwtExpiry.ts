/**
 * Client-side JWT exp check (signature is not verified; server still enforces auth).
 * Avoids keeping users on /admin when access JWT is expired but session cookie is still valid.
 */

const SKEW_MS = 60_000;

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const json = JSON.parse(atob(padded)) as Record<string, unknown>;
    return json && typeof json === 'object' ? json : null;
  } catch {
    return null;
  }
}

/** True if token is missing, malformed, or exp is in the past (with small clock skew). */
export function isAccessTokenExpired(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return true;
  }
  const payload = decodePayload(token.trim());
  if (!payload) {
    return true;
  }
  const exp = payload.exp;
  if (typeof exp !== 'number') {
    return true;
  }
  return exp * 1000 < Date.now() + SKEW_MS;
}
