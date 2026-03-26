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
