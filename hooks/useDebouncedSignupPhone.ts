'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSignupPhoneError } from '@/lib/signupValidation';

const DEBOUNCE_MS = 450;

/**
 * Debounced phone validation (libphonenumber via getSignupPhoneError), aligned with
 * useDebouncedRegistrationEmail: debounce, blur flush, Continue gate via canProceedPhone.
 */
export function useDebouncedSignupPhone(
  value: string | undefined,
  churchCountryIso: string | undefined
) {
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(0);

  const runValidate = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        setRemoteError(null);
        return;
      }
      setRemoteError(getSignupPhoneError(raw, churchCountryIso));
    },
    [churchCountryIso]
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
      queueMicrotask(() => {
        setRemoteError(null);
        setChecking(false);
      });
      return;
    }

    const seq = ++seqRef.current;
    queueMicrotask(() => {
      setChecking(true);
    });
    timerRef.current = setTimeout(() => {
      if (seq !== seqRef.current) {
        return;
      }
      runValidate(raw);
      setChecking(false);
      timerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, churchCountryIso, runValidate]);

  const flushVerify = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    seqRef.current += 1;
    const raw = value ?? '';
    const trimmed = raw.trim();
    if (!trimmed) {
      setRemoteError(null);
      setChecking(false);
      return;
    }
    setChecking(false);
    runValidate(raw);
  }, [value, runValidate]);

  const trimmed = (value ?? '').trim();
  const syncError = trimmed ? getSignupPhoneError(value ?? '', churchCountryIso) : null;

  const canProceedPhone = useMemo(() => {
    if (!trimmed) {
      return true;
    }
    if (checking) {
      return false;
    }
    return syncError === null;
  }, [trimmed, checking, syncError]);

  return { remoteError, checking, flushVerify, canProceedPhone };
}
