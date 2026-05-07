'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { checkRegistrationEmail } from '@/lib/api';
import { isValidSignupEmail } from '@/lib/signupValidation';

const DEBOUNCE_MS = 450;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export type DebouncedRegistrationEmailOptions = {
  /** If the field still matches this saved email (normalized), skip uniqueness API (profile edit). */
  baselineVerifiedEmail?: string | null;
};

/**
 * Calls `/auth/registration/validate-email/` after typing pauses + on blur.
 * Continue stays disabled until the server returns OK for the **current** email (deliverability + uniqueness).
 */
export function useDebouncedRegistrationEmail(
  value: string | undefined,
  scope: 'church' | 'admin',
  options?: DebouncedRegistrationEmailOptions
) {
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  /** Normalized email that last received `ok: true` from API */
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const verifiedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(0);

  const baselineNorm = (options?.baselineVerifiedEmail ?? '').trim().toLowerCase();

  const normalized = normalizeEmail(value ?? '');

  const executeCheck = useCallback(
    async (raw: string, seq: number) => {
      const trimmed = raw.trim();
      const norm = normalizeEmail(trimmed);
      if (!trimmed || !isValidSignupEmail(trimmed)) {
        if (seq === seqRef.current) {
          setRemoteError(null);
          setVerifiedEmail(null);
          verifiedRef.current = null;
          setChecking(false);
        }
        return;
      }
      if (baselineNorm && norm === baselineNorm) {
        if (seq === seqRef.current) {
          verifiedRef.current = norm;
          setVerifiedEmail(norm);
          setRemoteError(null);
          setChecking(false);
        }
        return;
      }
      setChecking(true);
      setRemoteError(null);
      try {
        const r = await checkRegistrationEmail(trimmed, scope);
        if (seq !== seqRef.current) {
          return;
        }
        if (r.ok) {
          verifiedRef.current = norm;
          setVerifiedEmail(norm);
          setRemoteError(null);
        } else {
          verifiedRef.current = null;
          setVerifiedEmail(null);
          setRemoteError(r.message || 'This email cannot be used.');
        }
      } catch (e) {
        if (seq !== seqRef.current) {
          return;
        }
        verifiedRef.current = null;
        setVerifiedEmail(null);
        const rawMsg = e instanceof Error ? e.message : String(e);
        let msg = 'Could not verify email. Check your connection and try again.';
        if (rawMsg.includes('NEXT_PUBLIC_API_URL')) {
          msg = 'Email verification unavailable (missing NEXT_PUBLIC_API_URL).';
        }
        setRemoteError(msg);
      } finally {
        if (seq === seqRef.current) {
          setChecking(false);
        }
      }
    },
    [scope, baselineNorm]
  );

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const raw = value ?? '';
    const trimmed = raw.trim();

    if (!trimmed) {
      seqRef.current += 1;
      setRemoteError(null);
      setVerifiedEmail(null);
      verifiedRef.current = null;
      setChecking(false);
      return;
    }
    if (!isValidSignupEmail(trimmed)) {
      seqRef.current += 1;
      setRemoteError(null);
      setVerifiedEmail(null);
      verifiedRef.current = null;
      setChecking(false);
      return;
    }

    const norm = normalizeEmail(trimmed);
    if (baselineNorm && norm === baselineNorm) {
      seqRef.current += 1;
      verifiedRef.current = norm;
      setVerifiedEmail(norm);
      setRemoteError(null);
      setChecking(false);
      return;
    }
    if (verifiedRef.current === norm) {
      return;
    }

    const seq = ++seqRef.current;
    timerRef.current = setTimeout(() => {
      void executeCheck(raw, seq);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, executeCheck, baselineNorm]);

  const flushVerify = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const raw = value ?? '';
    const seq = ++seqRef.current;
    void executeCheck(raw, seq);
  }, [value, executeCheck]);

  const formatOk = Boolean(normalized && isValidSignupEmail(normalized));
  const canProceedEmail = !formatOk || (verifiedEmail === normalized && !remoteError);

  return { remoteError, checking, flushVerify, canProceedEmail };
}
