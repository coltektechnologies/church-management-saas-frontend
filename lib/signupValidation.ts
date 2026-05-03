import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { z } from 'zod';

/** Strips digits from given/family names (typing or paste). */
export function sanitizePersonNameInput(value: string): string {
  return value.replace(/\d/g, '');
}

const emailSchema = z.string().trim().email();

export function isValidSignupEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/**
 * Returns `null` if the phone is acceptable for the church country (ISO alpha-2 from step 1).
 * Uses libphonenumber for national/international parsing; parsed country must match church country.
 */
export function getSignupPhoneError(
  phone: string,
  churchCountryIsoAlpha2: string | undefined
): string | null {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return null;
  }

  const isoRaw = churchCountryIsoAlpha2?.trim();
  if (!isoRaw) {
    return 'Your church country (step 1) is required — go back and select it to validate this number.';
  }

  const iso = isoRaw.toUpperCase() as CountryCode;

  const primary = parsePhoneNumberFromString(trimmed, iso);
  const international = parsePhoneNumberFromString(trimmed);

  const candidate = primary?.isValid() ? primary : international?.isValid() ? international : null;

  if (!candidate) {
    return `Enter a valid phone number for ${iso} (correct length and digits for that country).`;
  }

  if (candidate.country && candidate.country !== iso) {
    return `Dial code must match your church country (${iso}). Open the flag dropdown next to the number or update country in step 1.`;
  }

  return null;
}

export function isValidSignupPhone(phone: string, countryIsoAlpha2: string | undefined): boolean {
  return getSignupPhoneError(phone, countryIsoAlpha2) === null;
}

/** Same rule as admin signup in Step2 (matches backend expectations). */
const SIGNUP_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

/**
 * Live validation for password field: returns `null` if empty or valid.
 */
export function getSignupPasswordError(password: string): string | null {
  const p = password ?? '';
  if (!p) {
    return null;
  }

  if (p.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/^[A-Za-z\d@$!%*?&#]+$/.test(p)) {
    return 'Use only letters, numbers, and these symbols: @$!%*?&#';
  }

  const missing: string[] = [];
  if (!/[a-z]/.test(p)) {
    missing.push('a lowercase letter');
  }
  if (!/[A-Z]/.test(p)) {
    missing.push('an uppercase letter');
  }
  if (!/\d/.test(p)) {
    missing.push('a number');
  }
  if (!/[@$!%*?&#]/.test(p)) {
    missing.push('a symbol (@$!%*?&#)');
  }
  if (missing.length > 0) {
    return `Add ${missing.join(', ')}.`;
  }

  return null;
}

export function getSignupConfirmPasswordError(
  password: string,
  confirmPassword: string
): string | null {
  const c = (confirmPassword ?? '').trim();
  if (!c) {
    return null;
  }
  if ((password ?? '') !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

export function isSignupPasswordValid(password: string): boolean {
  return SIGNUP_PASSWORD_REGEX.test(password ?? '');
}
