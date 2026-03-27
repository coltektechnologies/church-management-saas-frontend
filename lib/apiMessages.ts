/**
 * Turn Django / DRF JSON error payloads into a single string for toasts and Error messages.
 */
export function messageFromApiErrorJson(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }
  const o = data as Record<string, unknown>;

  const firstStringish = (v: unknown): string | undefined => {
    if (typeof v === 'string' && v.trim()) {
      return v;
    }
    if (Array.isArray(v) && v.length > 0) {
      const x = v[0];
      if (typeof x === 'string' && x.trim()) {
        return x;
      }
      if (x && typeof x === 'object' && x !== null && 'string' in x) {
        const s = (x as { string: unknown }).string;
        if (typeof s === 'string' && s.trim()) {
          return s;
        }
      }
    }
    return undefined;
  };

  const detail = o.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object' && item !== null && 'string' in item) {
          return String((item as { string: unknown }).string);
        }
        return '';
      })
      .filter(Boolean);
    if (parts.length) {
      return parts.join(' ');
    }
  }

  const direct =
    firstStringish(o.email) ||
    firstStringish(o.password) ||
    firstStringish(o.non_field_errors) ||
    firstStringish(o.church_id) ||
    firstStringish(o.refresh);
  if (direct) {
    return direct;
  }

  for (const val of Object.values(o)) {
    const f = firstStringish(val);
    if (f) {
      return f;
    }
  }

  return fallback;
}
