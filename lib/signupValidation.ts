import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { z } from 'zod';

const emailSchema = z.string().trim().email();

export function isValidSignupEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

function digitCount(value: string): number {
  return (value.match(/\d/g) || []).length;
}

/**
 * Validates phone using libphonenumber when step-1 country (ISO alpha-2) is set.
 * Falls back to backend-style minimum digit length when country is missing.
 */
export function isValidSignupPhone(
  phone: string,
  countryIsoAlpha2: string | undefined
): boolean {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return false;
  }
  if (!countryIsoAlpha2?.trim()) {
    return digitCount(trimmed) >= 10;
  }
  try {
    const iso = countryIsoAlpha2.trim().toUpperCase() as CountryCode;
    const withRegion = parsePhoneNumberFromString(trimmed, iso);
    if (withRegion?.isValid()) {
      return true;
    }
    const any = parsePhoneNumberFromString(trimmed);
    return any?.isValid() ?? false;
  } catch {
    return digitCount(trimmed) >= 10;
  }
}
