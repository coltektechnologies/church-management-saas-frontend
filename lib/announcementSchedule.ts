/**
 * Helpers for announcement scheduling aligned with backend:
 * `publish_at` — when the announcement goes live (null = as soon as published, not date-scheduled)
 * `expires_at` — when to stop showing (null = no end date)
 */

export type SchedulePublish = 'immediate' | 'scheduled';
export type ExpiryMode = 'none' | 'until' | 'days';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Current local date/time as `YYYY-MM-DDTHH:mm` for `datetime-local` inputs. */
export function nowDatetimeLocalValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Parse `datetime-local` string as **local** wall-clock time.
 * Avoids `new Date(string)` quirks (Safari / ambiguous UTC vs local for some formats).
 */
export function parseDatetimeLocalToDate(local: string): Date | null {
  if (!local?.trim()) {
    return null;
  }
  const m = local.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) {
    const d = new Date(local);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, y, mo, day, h, min, sec] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(day),
    Number(h),
    Number(min),
    sec !== undefined && sec !== '' ? Number(sec) : 0,
    0
  );
}

/** Convert ISO / API datetime to `datetime-local` value (local timezone, minute precision). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const normalized = String(iso)
    .trim()
    .replace(/^(\d{4}-\d{2}-\d{2})[ T]/, '$1T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Parse `datetime-local` value to ISO string (UTC) for the API. */
export function datetimeLocalToIso(local: string): string {
  const d = parseDatetimeLocalToDate(local);
  if (!d || Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toISOString();
}

export interface BuildScheduleInput {
  schedulePublish: SchedulePublish;
  publishAtLocal: string;
  expiryMode: ExpiryMode;
  expiresAtLocal: string;
  expiresDaysAfterPublish: number;
}

export function buildPublishAndExpires(input: BuildScheduleInput): {
  publish_at: string | null;
  expires_at: string | null;
} {
  let publish_at: string | null = null;
  if (input.schedulePublish === 'scheduled' && input.publishAtLocal) {
    publish_at = datetimeLocalToIso(input.publishAtLocal);
  }

  let expires_at: string | null = null;
  if (input.expiryMode === 'until' && input.expiresAtLocal) {
    expires_at = datetimeLocalToIso(input.expiresAtLocal);
  } else if (input.expiryMode === 'days' && input.expiresDaysAfterPublish > 0) {
    const base = publish_at !== null ? new Date(publish_at) : new Date();
    const end = new Date(base);
    end.setDate(end.getDate() + input.expiresDaysAfterPublish);
    expires_at = end.toISOString();
  }

  if (publish_at && expires_at) {
    if (new Date(expires_at) <= new Date(publish_at)) {
      throw new Error('Stop showing must be after the publish time.');
    }
  }

  return { publish_at, expires_at };
}
