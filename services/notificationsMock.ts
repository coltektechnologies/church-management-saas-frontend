/**
 * Mock data aligned with backend:
 * - GET/retrieve: NotificationSerializer (notifications.Notification)
 * - POST create: NotificationCreateSerializer (user_id | member_id, title, message, priority, category, link, icon, scheduled_for)
 *
 * Wire to: /api/notifications/notifications/
 */

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/** Backend Notification.status */
export type NotificationStatus = 'PENDING' | 'SENT' | 'READ' | 'FAILED';

export type NotificationCategory =
  | 'ANNOUNCEMENT'
  | 'REMINDER'
  | 'EVENT'
  | 'BIRTHDAY'
  | 'FINANCE'
  | 'GENERAL'
  | 'PROGRAM';

/** UI-only: not on Notification model (delivery is separate); shown in list for demo */
export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS';

/** Mirrors NotificationSerializer + helpful display fields */
export interface MockNotificationItem {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  /** Serializer: category string */
  category: NotificationCategory | '';
  link?: string | null;
  /** Backend stores icon name e.g. "bell", "calendar" */
  icon?: string | null;
  status: NotificationStatus;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  scheduled_for?: string | null;
  sent_at?: string | null;
  /** Mock recipient summary (real API resolves user/member/visitor server-side) */
  recipient_type?: 'user' | 'member' | 'visitor';
  recipient_label?: string;
  recipient_id?: string;
  channels?: DeliveryChannel[];
  /** Optional wizard metadata (batch / schedule — maps to send-bulk, batches, recurring-schedules) */
  audience_mode?: 'single' | 'batch';
  batch_segment_ids?: string[];
  batch_summary?: string;
  recipient_count_estimate?: number;
  schedule_mode?: 'instant' | 'one_time' | 'recurring';
  recurring_pattern?: 'daily' | 'weekly' | 'monthly';
  recurring_time_local?: string;
  /** 0=Sun … 6=Sat (JS getDay) when pattern is weekly */
  recurring_weekdays?: number[];
  queue_as_batch_job?: boolean;
  respect_quiet_hours?: boolean;
  email_subject_line?: string;
  /** When admin picks specific departments in the wizard */
  department_ids?: string[];
}

/** Mock church users for create form (user_id) */
export const MOCK_NOTIFICATION_USERS: { id: string; label: string }[] = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001', label: 'Admin — ps.william@church.org' },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002', label: 'Secretary — secretary@church.org' },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003', label: 'Treasurer — finance@church.org' },
];

/**
 * Batch audience segments (mock). Each row is a saved group you can target.
 * In step 3 you still choose HOW to send (in-app / email / SMS).
 */
/** Quick presets (step 2). Departments list is separate — admin picks any ministry. */
export const MOCK_BATCH_SEGMENTS: {
  id: string;
  label: string;
  count: number;
  description: string;
}[] = [
  {
    id: 'all_members',
    label: 'All church members',
    count: 842,
    description: 'Everyone with an active membership record — same as “the whole congregation.”',
  },
  {
    id: 'workers',
    label: 'Department heads & workers',
    count: 124,
    description:
      'Leaders and helpers who run ministries (not every member). Good for leader-only notices.',
  },
  {
    id: 'youth',
    label: 'Youth ministry (one department)',
    count: 89,
    description:
      'Members linked to the Youth department only — not all young people in the church unless they’re enrolled in that ministry.',
  },
  {
    id: 'visitors',
    label: 'Visitors & guests',
    count: 48,
    description:
      'Guest check-ins, first-time visitors, and people on the visitor roll — useful for welcome follow-ups and event invites.',
  },
];

/** All ministries — use “Choose departments” in the wizard (mock; wire to GET /api/departments/) */
export const MOCK_DEPARTMENTS_FOR_NOTIFICATIONS: {
  id: string;
  name: string;
  memberCount: number;
}[] = [
  { id: 'dept-youth', name: 'Youth ministry', memberCount: 89 },
  { id: 'dept-choir', name: 'Choir & music', memberCount: 42 },
  { id: 'dept-usher', name: 'Ushers & hospitality', memberCount: 38 },
  { id: 'dept-women', name: "Women's ministry", memberCount: 156 },
  { id: 'dept-men', name: "Men's fellowship", memberCount: 98 },
  { id: 'dept-children', name: 'Children’s church', memberCount: 64 },
  { id: 'dept-evangelism', name: 'Evangelism & outreach', memberCount: 51 },
  { id: 'dept-media', name: 'Media & tech', memberCount: 22 },
  { id: 'dept-prayer', name: 'Intercessory prayer', memberCount: 73 },
  { id: 'dept-finance', name: 'Finance stewards', memberCount: 15 },
];

/** Mock members for create form (member_id) */
export const MOCK_NOTIFICATION_MEMBERS: { id: string; label: string }[] = [
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001', label: 'Grace Mensah (Member)' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb002', label: 'Kwame Asante (Member)' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb003', label: 'Ama Osei (Member)' },
];

/** Mock visitors / guests for single-recipient sends (visitor roll, check-in list) */
export const MOCK_NOTIFICATION_VISITORS: { id: string; label: string }[] = [
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccc0001', label: 'Maria S. — Guest (Sun 9am service)' },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccc0002', label: 'John D. — First-time visitor' },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccc0003',
    label: 'Youth visitor — registered at welcome desk',
  },
];

export const CATEGORY_OPTIONS: { value: NotificationCategory; label: string }[] = [
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'EVENT', label: 'Event' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'GENERAL', label: 'General' },
  { value: 'PROGRAM', label: 'Program' },
];

export const PRIORITY_OPTIONS: NotificationPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'Default (none)' },
  { value: 'bell', label: 'bell' },
  { value: 'calendar', label: 'calendar' },
  { value: 'megaphone', label: 'megaphone' },
  { value: 'heart', label: 'heart' },
  { value: 'wallet', label: 'wallet' },
];

export const MOCK_NOTIFICATIONS: MockNotificationItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'New announcement pending review',
    message:
      '“Easter Week Schedule” is awaiting your approval before it can be published to the congregation.',
    category: 'ANNOUNCEMENT',
    priority: 'HIGH',
    icon: 'megaphone',
    status: 'SENT',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    sent_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    link: '/admin/announcements',
    recipient_type: 'user',
    recipient_label: 'Ps Owusu William',
    recipient_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001',
    channels: ['IN_APP', 'EMAIL'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Reminder: Finance committee meeting',
    message: 'Tomorrow 6:00 PM — Conference Room A. Agenda attached in portal.',
    category: 'REMINDER',
    priority: 'MEDIUM',
    icon: 'calendar',
    status: 'SENT',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2.9).toISOString(),
    recipient_type: 'user',
    recipient_label: 'Treasurer — finance@church.org',
    recipient_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003',
    channels: ['IN_APP'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'SMS blast scheduled',
    message: 'Your Sunday service reminder will be sent to 842 members tonight at 7:00 PM.',
    category: 'GENERAL',
    priority: 'LOW',
    icon: 'bell',
    status: 'PENDING',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    scheduled_for: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    recipient_type: 'user',
    recipient_label: 'Admin — ps.william@church.org',
    recipient_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001',
    channels: ['SMS', 'IN_APP'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Birthday: Sister Grace Mensah',
    message: 'Automated greeting queued for tomorrow morning.',
    category: 'BIRTHDAY',
    priority: 'LOW',
    icon: 'heart',
    status: 'SENT',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    recipient_type: 'member',
    recipient_label: 'Grace Mensah',
    recipient_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001',
    channels: ['EMAIL'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Youth retreat registration closing',
    message: 'Registration closes this Friday. 12 spots remaining.',
    category: 'EVENT',
    priority: 'MEDIUM',
    icon: 'calendar',
    status: 'READ',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    link: '/admin/events',
    recipient_type: 'user',
    recipient_label: 'Secretary — secretary@church.org',
    recipient_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002',
    channels: ['IN_APP'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: 'Weekly giving summary',
    message: 'Last week’s tithes and offerings have been reconciled. View report.',
    category: 'FINANCE',
    priority: 'LOW',
    icon: 'wallet',
    status: 'SENT',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
    recipient_type: 'user',
    recipient_label: 'Treasurer — finance@church.org',
    recipient_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003',
    channels: ['IN_APP', 'EMAIL'],
  },
];
