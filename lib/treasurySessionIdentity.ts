/**
 * Fill treasury UI profile fields from the auth session (`localStorage.user`)
 * when theme/settings storage has no name yet — same source as login response.
 */

function parseStoredSessionUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export type TreasurySessionIdentityPatch = Partial<{
  adminName: string;
  adminEmail: string;
  avatarUrl: string | null;
  adminRole: string;
}>;

/** Identity fields derived from POST /auth/login/ user payload (UserSerializer). */
export function treasuryPatchFromSessionUser(): TreasurySessionIdentityPatch | null {
  const u = parseStoredSessionUser();
  if (!u) {
    return null;
  }

  const email = typeof u.email === 'string' ? u.email.trim() : '';

  let fullName = '';
  if (typeof u.full_name === 'string' && u.full_name.trim()) {
    fullName = u.full_name.trim();
  } else {
    const fn = typeof u.first_name === 'string' ? u.first_name.trim() : '';
    const ln = typeof u.last_name === 'string' ? u.last_name.trim() : '';
    fullName = [fn, ln].filter(Boolean).join(' ').trim();
  }
  if (!fullName && typeof u.username === 'string' && u.username.trim()) {
    fullName = u.username.trim();
  }

  let avatarUrl: string | null = null;
  if (typeof u.profile_image_url === 'string' && u.profile_image_url.trim()) {
    avatarUrl = u.profile_image_url.trim();
  }

  const roles = Array.isArray(u.roles) ? u.roles : [];
  let roleLabel = '';
  for (const r of roles) {
    if (!r || typeof r !== 'object') {
      continue;
    }
    const name = String((r as { name?: string }).name ?? '').trim();
    if (!name) {
      continue;
    }
    if (/\btreasurer\b|\btreasury\b/i.test(name)) {
      roleLabel = name;
      break;
    }
  }
  if (!roleLabel && roles.length > 0) {
    const first = roles[0];
    if (first && typeof first === 'object' && 'name' in first) {
      roleLabel = String((first as { name?: string }).name ?? '').trim();
    }
  }

  const patch: TreasurySessionIdentityPatch = {};
  if (fullName) {
    patch.adminName = fullName;
  }
  if (email) {
    patch.adminEmail = email;
  }
  if (avatarUrl) {
    patch.avatarUrl = avatarUrl;
  }
  if (roleLabel) {
    patch.adminRole = roleLabel;
  }

  return Object.keys(patch).length ? patch : null;
}

/** Merge session identity into stored treasury profile — only fills empty slots. */
export function mergeTreasuryProfileWithSession<
  T extends TreasurySessionIdentityPatch & Record<string, unknown>,
>(base: T): T {
  const patch = treasuryPatchFromSessionUser();
  if (!patch) {
    return base;
  }
  return {
    ...base,
    adminName: base.adminName?.trim() || patch.adminName || base.adminName,
    adminEmail: base.adminEmail?.trim() || patch.adminEmail || base.adminEmail,
    adminRole: base.adminRole?.trim() || patch.adminRole || base.adminRole,
    avatarUrl: base.avatarUrl ?? patch.avatarUrl ?? base.avatarUrl,
  };
}
