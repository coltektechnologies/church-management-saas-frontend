// components/departments/members/membersDummyData.ts
// Replace with real API calls when backend is ready.

export type MemberRole = 'Admin' | 'Core Admin' | 'Departmental Head' | 'Member';
export type MemberStatus = 'Active' | 'Inactive' | 'Pending';

export interface DepartmentMember {
  id: string;
  name: string;
  memberId: string;     // e.g. SDA2026-014
  avatarUrl: string | null;
  phone: string;
  email: string;
  departments: string[]; // can belong to multiple depts
  role: MemberRole;
  status: MemberStatus;
  memberSince: string;   // ISO date string
}

export const DUMMY_MEMBERS: DepartmentMember[] = [
  {
    id: '1',
    name: 'Ps Baah Owusu',
    memberId: 'SDA2026-001',
    avatarUrl: null,
    phone: '+233 596 038 258',
    email: 'owusu.william2344@gmail.com',
    departments: ['Treasury', 'Adventist Youth'],
    role: 'Admin',
    status: 'Active',
    memberSince: '2026-01-09',
  },
  {
    id: '2',
    name: 'Ama Boateng',
    memberId: 'SDA2026-002',
    avatarUrl: null,
    phone: '+233 244 123 456',
    email: 'ama.boateng@gmail.com',
    departments: ['Choir', 'Sabbath School'],
    role: 'Core Admin',
    status: 'Active',
    memberSince: '2026-01-09',
  },
  {
    id: '3',
    name: 'Kofi Mensah',
    memberId: 'SDA2026-003',
    avatarUrl: null,
    phone: '+233 501 987 654',
    email: 'kofi.mensah@church.org',
    departments: ['Adventist Youth'],
    role: 'Member',
    status: 'Pending',
    memberSince: '2026-01-09',
  },
  {
    id: '4',
    name: 'Abena Adjei',
    memberId: 'SDA2026-004',
    avatarUrl: null,
    phone: '+233 200 456 789',
    email: 'abena.adjei@gmail.com',
    departments: ['Health & Temperance', 'Sabbath School'],
    role: 'Departmental Head',
    status: 'Active',
    memberSince: '2026-01-09',
  },
  {
    id: '5',
    name: 'Kwame Asante',
    memberId: 'SDA2026-005',
    avatarUrl: null,
    phone: '+233 596 038 258',
    email: 'kwame.asante@church.org',
    departments: ['Treasury', 'Sabbath School'],
    role: 'Core Admin',
    status: 'Active',
    memberSince: '2026-01-09',
  },
  {
    id: '6',
    name: 'Efua Darko',
    memberId: 'SDA2026-006',
    avatarUrl: null,
    phone: '+233 596 038 258',
    email: 'efua.darko@gmail.com',
    departments: ['Adventist Youth', 'Sabbath School'],
    role: 'Core Admin',
    status: 'Active',
    memberSince: '2026-01-09',
  },
  {
    id: '7',
    name: 'Yaw Osei',
    memberId: 'SDA2026-007',
    avatarUrl: null,
    phone: '+233 302 876 543',
    email: 'yaw.osei@gmail.com',
    departments: ['Finance'],
    role: 'Member',
    status: 'Inactive',
    memberSince: '2025-11-15',
  },
  {
    id: '8',
    name: 'Akua Frimpong',
    memberId: 'SDA2026-008',
    avatarUrl: null,
    phone: '+233 244 333 222',
    email: 'akua.frimpong@church.org',
    departments: ['Women Ministry'],
    role: 'Departmental Head',
    status: 'Active',
    memberSince: '2025-10-01',
  },
  {
    id: '9',
    name: 'Nana Agyemang',
    memberId: 'SDA2026-009',
    avatarUrl: null,
    phone: '+233 501 654 321',
    email: 'nana.agyemang@gmail.com',
    departments: ['Pathfinder', 'Adventist Youth'],
    role: 'Member',
    status: 'Pending',
    memberSince: '2026-02-20',
  },
  {
    id: '10',
    name: 'Adwoa Sarpong',
    memberId: 'SDA2026-010',
    avatarUrl: null,
    phone: '+233 200 111 222',
    email: 'adwoa.sarpong@church.org',
    departments: ['Choir'],
    role: 'Admin',
    status: 'Active',
    memberSince: '2025-09-05',
  },
  {
    id: '11',
    name: 'Kweku Poku',
    memberId: 'SDA2026-011',
    avatarUrl: null,
    phone: '+233 244 777 888',
    email: 'kweku.poku@gmail.com',
    departments: ['Health & Temperance'],
    role: 'Member',
    status: 'Active',
    memberSince: '2026-03-01',
  },
  {
    id: '12',
    name: 'Maame Esi Bonsu',
    memberId: 'SDA2026-012',
    avatarUrl: null,
    phone: '+233 596 222 333',
    email: 'maame.bonsu@gmail.com',
    departments: ['Finance', 'Treasury'],
    role: 'Core Admin',
    status: 'Inactive',
    memberSince: '2025-07-12',
  },
];

// All unique departments extracted from dummy data
export const ALL_DEPARTMENTS = Array.from(
  new Set(DUMMY_MEMBERS.flatMap((m) => m.departments))
).sort();

export const ALL_ROLES: MemberRole[] = ['Admin', 'Core Admin', 'Departmental Head', 'Member'];
export const ALL_STATUSES: MemberStatus[] = ['Active', 'Inactive', 'Pending'];