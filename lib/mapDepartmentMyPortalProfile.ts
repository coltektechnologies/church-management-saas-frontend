/**
 * Maps `GET /departments/my-portal/` into {@link DepartmentProfile} patches.
 */

import type { DepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { THEME_COLOR_HEX, type ThemeColor } from '@/constants/departments';
import {
  type DepartmentDetailResponse,
  type DepartmentMyPortalSuccess,
  parseThemeColor,
} from '@/lib/departmentsApi';

function memberFullName(v: Record<string, unknown>): string {
  const parts = [v.first_name, v.middle_name, v.last_name]
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
  return parts.join(' ').trim();
}

function portalRoleLabel(role: DepartmentMyPortalSuccess['portal_role']): string {
  return role === 'elder_in_charge' ? 'Elder in charge' : 'Department Head';
}

/** Apply when switching portal context from a department UUID (e.g. notification deep link). */
export function mapDepartmentDetailToProfilePatch(
  detail: DepartmentDetailResponse
): Partial<DepartmentProfile> {
  const themeKey = parseThemeColor(detail.color) as ThemeColor;
  const primaryHex = THEME_COLOR_HEX[themeKey];
  const name = typeof detail.name === 'string' ? detail.name.trim() : '';
  const code = typeof detail.code === 'string' ? detail.code.trim() : '';
  return {
    portalDepartmentId: typeof detail.id === 'string' ? detail.id : '',
    departmentName: name,
    departmentCode: code,
    ...(primaryHex ? { primaryColor: primaryHex, darkPrimaryColor: primaryHex } : {}),
  };
}

export function mapMyPortalToProfilePatch(
  data: DepartmentMyPortalSuccess
): Partial<DepartmentProfile> {
  const dept = data.department;
  const v = data.viewer_member ?? {};
  const loc =
    v.location && typeof v.location === 'object' && v.location !== null
      ? (v.location as Record<string, unknown>)
      : null;

  const photo = v.profile_photo;
  const avatarUrl =
    typeof photo === 'string' &&
    (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:'))
      ? photo
      : null;

  const themeKey = parseThemeColor(dept.color) as ThemeColor;
  const primaryHex = THEME_COLOR_HEX[themeKey];

  const email =
    typeof loc?.email === 'string'
      ? loc.email.trim()
      : typeof v.email === 'string'
        ? v.email.trim()
        : '';
  const phone =
    typeof loc?.phone_primary === 'string'
      ? loc.phone_primary.trim()
      : typeof v.phone === 'string'
        ? v.phone.trim()
        : '';

  const name = typeof dept.name === 'string' ? dept.name.trim() : '';
  const code = typeof dept.code === 'string' ? dept.code.trim() : '';

  return {
    portalDepartmentId: typeof dept.id === 'string' ? dept.id : '',
    departmentName: name,
    departmentCode: code,
    portalRoleLabel: portalRoleLabel(data.portal_role),
    headName: memberFullName(v) || '—',
    headEmail: email,
    headPhone: phone,
    avatarUrl,
    ...(primaryHex ? { primaryColor: primaryHex, darkPrimaryColor: primaryHex } : {}),
  };
}
