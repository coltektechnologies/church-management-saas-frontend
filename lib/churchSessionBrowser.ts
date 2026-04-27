import { logoutToServer } from '@/lib/api';
import { CHURCH_SESSION_COOKIE, CHURCH_SESSION_COOKIE_VALUE } from '@/lib/churchSessionConstants';

const WEEK_SEC = 60 * 60 * 24 * 7;

/** Marks browser as logged in for Edge middleware (localStorage is not visible there). */
export function setChurchSessionCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CHURCH_SESSION_COOKIE}=${CHURCH_SESSION_COOKIE_VALUE}; path=/; max-age=${WEEK_SEC}; SameSite=Lax${secure}`;
}

export function clearChurchSessionCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${CHURCH_SESSION_COOKIE}=; path=/; max-age=0`;
}

/**
 * Church UUID from the last login payload (`localStorage.user`), if present.
 * Used to scope treasury API calls when the JWT/request user has no `church` FK but the client
 * still knows the congregation (matches backend `?church_id=` for expense lists).
 */
export function getStoredSessionChurchId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    const u = JSON.parse(raw) as Record<string, unknown>;
    const topChurchId = u.church_id;
    if (typeof topChurchId === 'string' && topChurchId.trim()) {
      return topChurchId.trim();
    }
    if (typeof topChurchId === 'number' && Number.isFinite(topChurchId)) {
      return String(topChurchId);
    }
    const c = u.church;
    if (typeof c === 'string' && c.trim()) {
      return c.trim();
    }
    if (c && typeof c === 'object' && c !== null && 'id' in c) {
      const id = (c as { id?: unknown }).id;
      if (typeof id === 'string' && id.trim()) {
        return id.trim();
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Full sign-out: tokens + middleware cookie. */
export function clearClientAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  clearChurchSessionCookie();
}

/** Invalidate refresh token on the API, then clear local storage and session cookie. */
export async function performLogout(): Promise<void> {
  await logoutToServer();
  clearClientAuth();
}
