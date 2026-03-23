/**
 * After login, redirect only to same-app paths (avoid open redirects).
 */
export function getSafeReturnPath(next: string | null): string {
  if (!next) {
    return '/dashboard';
  }
  try {
    const decoded = decodeURIComponent(next.trim());
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
      return decoded;
    }
  } catch {
    /* ignore malformed */
  }
  return '/dashboard';
}
