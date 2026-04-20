/**
 * Display helpers for Treasury portal shell (sidebar + top bar).
 */

/** Preferred name first, then legal / full name — same idea as member-facing “display name”. */
export function treasuryDisplayName(preferredName: string, adminName: string): string {
  const p = preferredName.trim();
  const a = adminName.trim();
  return p || a;
}

/**
 * Treasury UI should read as finance staff. Backend may still send a generic `Admin` role string.
 */
export function treasuryPortalRoleLabel(adminRole: string): string {
  const r = adminRole.trim();
  if (!r || r.toLowerCase() === 'admin') {
    return 'Treasurer';
  }
  return r;
}

function initialsFromEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes('@')) {
    return null;
  }
  const local = trimmed.split('@')[0] || '';
  const segments = local.split(/[._+-]+/).filter(Boolean);
  if (segments.length >= 2) {
    const a = segments[0][0];
    const b = segments[segments.length - 1][0];
    if (a && b) {
      return `${a}${b}`.toUpperCase();
    }
  }
  const letters = local.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 2) {
    return letters.slice(0, 2).toUpperCase();
  }
  if (letters.length === 1) {
    return letters.toUpperCase();
  }
  return null;
}

/**
 * Avatar initials: name first; if names are missing, derive from email local part;
 * last resort `TR` (treasury) so we never show a lone "?".
 */
export function treasuryInitials(
  preferredName: string,
  adminName: string,
  adminEmail = ''
): string {
  const src = treasuryDisplayName(preferredName, adminName);
  if (src) {
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0][0];
      const b = parts[parts.length - 1][0];
      return `${a}${b}`.toUpperCase();
    }
    return src.slice(0, 2).toUpperCase();
  }
  return initialsFromEmail(adminEmail) || 'TR';
}
