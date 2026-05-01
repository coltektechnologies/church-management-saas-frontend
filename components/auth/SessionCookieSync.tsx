'use client';

import { useEffect } from 'react';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';
import { isAccessTokenExpired } from '@/lib/jwtExpiry';

/**
 * Keeps `church_session` aligned with a valid JWT after cold loads or cookie clears.
 * {@link proxy} only reads cookies; this avoids “logged in” client state without a session cookie.
 */
export function SessionCookieSync() {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !isAccessTokenExpired(token)) {
      setChurchSessionCookie();
    }
  }, []);
  return null;
}
