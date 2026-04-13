/**
 * Same rules as getSafeReturnPath but returns null when missing/invalid (for Edge proxy).
 * Path only — query/hash stripped from the returned value.
 */
export function getSafeInternalPath(next: string | null | undefined): string | null {
  if (next === undefined || next === null) {
    return null;
  }
  const s = String(next).trim();
  if (!s) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(s);
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
      const pathOnly = decoded.split('?')[0]?.split('#')[0] ?? '';
      return pathOnly || null;
    }
  } catch {
    return null;
  }
  return null;
}

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
