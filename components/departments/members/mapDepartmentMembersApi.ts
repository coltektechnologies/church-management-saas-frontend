import type { DepartmentMember, MemberRole, MemberStatus } from './membersDummyData';
import type {
  DepartmentMemberApiRow,
  MemberDepartmentRow,
} from '@/lib/departmentsApi';

function mapMembershipStatus(api: string | undefined): MemberStatus {
  const u = (api || 'ACTIVE').toUpperCase();
  if (u === 'INACTIVE') {
    return 'Inactive';
  }
  if (u === 'VISITOR' || u === 'NEW_CONVERT' || u === 'TRANSFER') {
    return 'Pending';
  }
  return 'Active';
}

function mapDeptRole(role: string | undefined | null): MemberRole {
  const r = (role || '').toLowerCase();
  if (r.includes('head') || r.includes('lead') || r.includes('chair')) {
    return 'Departmental Head';
  }
  if (r.includes('core')) {
    return 'Core Admin';
  }
  if (r.includes('admin')) {
    return 'Admin';
  }
  return 'Member';
}

function displayName(row: DepartmentMemberApiRow): string {
  const parts = [row.first_name, row.middle_name, row.last_name].filter(Boolean) as string[];
  const joined = parts.join(' ').trim();
  return joined || 'Member';
}

function shortMemberRef(uuid: string): string {
  const s = String(uuid).replace(/-/g, '');
  return s.length >= 8 ? s.slice(0, 8).toUpperCase() : uuid.slice(0, 8).toUpperCase();
}

/**
 * Map API member + optional MemberDepartment row into UI model.
 */
export function mapDepartmentMemberApiRow(
  row: DepartmentMemberApiRow,
  assignment?: MemberDepartmentRow
): DepartmentMember {
  const loc = row.location;
  const email = (loc?.email ?? '').trim();
  const phone = (loc?.phone_primary ?? '').trim();
  const since = row.member_since ? String(row.member_since).slice(0, 10) : '';
  const photo = row.profile_photo?.trim();
  const avatarUrl =
    photo && (photo.startsWith('http') || photo.startsWith('data:')) ? photo : null;

  return {
    id: String(row.id),
    assignmentId: assignment ? String(assignment.id) : undefined,
    name: displayName(row),
    memberId: `MEM-${shortMemberRef(row.id)}`,
    avatarUrl,
    phone: phone || '—',
    email: email || '—',
    departments: Array.isArray(row.department_names) ? [...row.department_names] : [],
    role: mapDeptRole(assignment?.role_in_department),
    status: mapMembershipStatus(row.membership_status),
    memberSince: since || '—',
  };
}

export function indexAssignmentsByMember(
  rows: MemberDepartmentRow[],
  departmentId: string
): Map<string, MemberDepartmentRow> {
  const map = new Map<string, MemberDepartmentRow>();
  for (const r of rows) {
    if (String(r.department) === departmentId) {
      map.set(String(r.member), r);
    }
  }
  return map;
}
