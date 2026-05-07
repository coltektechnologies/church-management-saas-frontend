'use client';

import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useDebouncedRegistrationEmail } from '@/hooks/useDebouncedRegistrationEmail';
import { isValidSignupEmail } from '@/lib/signupValidation';
import { cn } from '@/lib/utils';

export type RegistrationEmailVerificationState = {
  canProceedEmail: boolean;
  checking: boolean;
  remoteError: string | null;
  flushVerify: () => void;
};

export interface RegistrationEmailFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  scope: 'church' | 'admin';
  /** Profile edit: same email as saved account skips uniqueness check. */
  baselineVerifiedEmail?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  'aria-invalid'?: boolean;
  /** For submit handlers: gate on `canProceedEmail` when format is valid. */
  onVerificationState?: (state: RegistrationEmailVerificationState) => void;
  pendingMessage?: string;
}

/**
 * Email input with the same server verification as signup / add member (deliverability + uniqueness).
 */
export function RegistrationEmailField({
  id,
  value,
  onChange,
  scope,
  baselineVerifiedEmail,
  disabled,
  readOnly,
  placeholder,
  autoComplete,
  className,
  inputClassName,
  'aria-invalid': ariaInvalid,
  onVerificationState,
  pendingMessage = 'Verifying with the server… Complete verification before continuing.',
}: RegistrationEmailFieldProps) {
  const { remoteError, checking, flushVerify, canProceedEmail } = useDebouncedRegistrationEmail(
    value,
    scope,
    { baselineVerifiedEmail }
  );

  useEffect(() => {
    onVerificationState?.({ canProceedEmail, checking, remoteError, flushVerify });
  }, [canProceedEmail, checking, remoteError, flushVerify, onVerificationState]);

  const trimmed = value.trim();
  const formatOk = Boolean(trimmed && isValidSignupEmail(trimmed));
  const showPending =
    !checking &&
    formatOk &&
    !canProceedEmail &&
    !remoteError &&
    trimmed.toLowerCase() !== (baselineVerifiedEmail ?? '').trim().toLowerCase();

  return (
    <div className={cn('space-y-1', className)}>
      <Input
        id={id}
        type="email"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid ?? !!(remoteError && formatOk)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => flushVerify()}
        className={inputClassName}
      />
      {checking && formatOk && (
        <p className="text-[10px] text-muted-foreground">Verifying email…</p>
      )}
      {showPending && (
        <p className="text-[10px] text-amber-800 dark:text-amber-200">{pendingMessage}</p>
      )}
      {remoteError && formatOk && <p className="text-[10px] text-red-600">{remoteError}</p>}
      {!checking && !remoteError && formatOk && canProceedEmail && (
        <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Email verified.</p>
      )}
    </div>
  );
}
