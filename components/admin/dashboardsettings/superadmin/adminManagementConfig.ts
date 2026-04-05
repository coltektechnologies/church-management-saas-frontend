/**
 * Admin Management — UI constants aligned with backend seeds (`ROLES_SEED_DATA`, church groups).
 * Church group options normally come from GET /auth/church-groups/; `MOCK_CHURCH_GROUPS` is a fallback.
 */

export type StaffStatus = 'active' | 'suspended';

/** Matches `Role.name` from backend / `ROLES_SEED_DATA` */
export const STAFF_ROLE_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: 'Pastor', label: 'Pastor', hint: 'Full church access' },
  { value: 'First Elder', label: 'First Elder', hint: 'Governing elder access' },
  { value: 'Secretary', label: 'Secretary', hint: 'Members, announcements, communications' },
  { value: 'Treasurer', label: 'Treasurer', hint: 'Finance and reports' },
  { value: 'Department Head', label: 'Department Head', hint: 'Department operations' },
  { value: 'Elder in charge', label: 'Elder in charge', hint: 'Department oversight' },
  { value: 'Member', label: 'Member', hint: 'Portal — limited read access' },
  { value: 'Visitor', label: 'Visitor', hint: 'Guest access' },
];

/** Placeholder IDs — replace with API UUIDs when integrating */
export const MOCK_CHURCH_GROUPS: { id: string; name: string; roleHint: string }[] = [
  { id: 'mock-g-pastoral', name: 'Pastoral Leadership', roleHint: 'Pastor' },
  { id: 'mock-g-elder', name: 'Eldership', roleHint: 'First Elder' },
  { id: 'mock-g-secretariat', name: 'Secretariat', roleHint: 'Secretary' },
  { id: 'mock-g-treasury', name: 'Treasury', roleHint: 'Treasurer' },
  { id: 'mock-g-dept-heads', name: 'Department Heads', roleHint: 'Department Head' },
  { id: 'mock-g-elders-charge', name: 'Elders in Charge', roleHint: 'Elder in charge' },
  { id: 'mock-g-members', name: 'Members', roleHint: 'Member' },
  { id: 'mock-g-visitors', name: 'Visitors', roleHint: 'Visitor' },
];

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  username?: string;
  /** Backend `Role.name` */
  roleName: string;
  churchGroupIds: string[];
  status: StaffStatus;
  /** Account owner — cannot remove or suspend in UI */
  isOwner?: boolean;
}

export function staffDisplayName(m: Pick<StaffMember, 'first_name' | 'last_name' | 'email'>): string {
  const n = `${m.first_name} ${m.last_name}`.trim();
  return n || m.email.split('@')[0] || '—';
}

export type ChurchGroupOption = { id: string; name: string; roleHint?: string };

/** Resolve group names by id; uses API-backed `catalog` when provided, else mock IDs. */
export function groupLabels(ids: string[], catalog?: ChurchGroupOption[]): string[] {
  const src: ChurchGroupOption[] =
    catalog && catalog.length > 0 ? catalog : MOCK_CHURCH_GROUPS;
  return ids
    .map((id) => src.find((g) => g.id === id)?.name)
    .filter((x): x is string => Boolean(x));
}

/** Payload from Add Staff modal — maps 1:1 to future `UserCreate` + `user-roles` + group membership */
export interface InviteStaffPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  /** Empty = server auto-generates from name */
  username: string;
  role_name: string;
  notification_preference: 'email' | 'sms' | 'both';
  send_credentials: boolean;
  church_groups: string[];
  date_of_birth: string;
  gender: string;
  address: string;
  /** Empty = server generates password */
  password: string;
  password_confirm: string;
  is_active: boolean;
}
