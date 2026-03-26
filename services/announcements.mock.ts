export type AnnouncementCategory =
  | 'All'
  | 'Thanksgiving'
  | 'Prayer Request'
  | 'Birthday Wishes'
  | 'Funeral/Bereavements'
  | 'General Church'
  | 'Events & Programs'
  | 'Baptism Celebration'
  | 'Weddings'
  | 'Departmental Updates'
  | 'Community Outreach'
  | 'Health and Wellness'
  | 'Youth Activities';

export type PriorityLevel = 'Low' | 'Medium' | 'High';

export type AnnouncementStatus = 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Archived';

export interface Announcement {
  id: string;
  category: AnnouncementCategory;
  priority: PriorityLevel;
  title: string;
  content: string;
  status: AnnouncementStatus;
  author: string;
  authorRole: string;
  date: string; // ISO String or readable string based on mock
  /** @deprecated UI-only legacy; not on backend Announcement model */
  audience?: string[];
  /** ISO — when the announcement becomes visible (null = when published, not scheduled) */
  publish_at?: string | null;
  /** ISO — when to stop showing */
  expires_at?: string | null;
  /** @deprecated use publish_at */
  scheduleType?: 'Instant' | 'SpecificDate';
  /** @deprecated use publish_at */
  scheduledDate?: string;
  /** @deprecated use expires_at */
  displayDurationType?: 'OneTime' | 'Duration';
  /** @deprecated */
  displayDurationDays?: number;
  targetDepartments?: string[];
  includeVisitors?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    category: 'Events & Programs',
    priority: 'Medium',
    title: 'Weekly Sabbath Service Reminder',
    content:
      'Join us this Sabbath for worship service at 9:00 AM. Theme: "Walking in Faith". Speaker: Pastor Williams.',
    status: 'Approved',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T09:00:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a2',
    category: 'Prayer Request',
    priority: 'High',
    title: 'Prayer Request for Sister Mary',
    content: 'Sister Mary is undergoing surgery this Friday. Please keep her in your prayers.',
    status: 'Pending',
    author: 'Ps Wills',
    authorRole: 'Pastor',
    date: '2024-01-18T10:30:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a3',
    category: 'Youth Activities',
    priority: 'Medium',
    title: 'Youth Camp Registration Open',
    content: 'Registration for the annual youth camp is now open. Limited slots available!',
    status: 'Approved',
    author: 'Youth Leader',
    authorRole: 'Leader',
    date: '2024-01-18T14:15:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a4',
    category: 'Thanksgiving',
    priority: 'Low',
    title: 'Thanksgiving Service This Sabbath',
    content: 'Special thanksgiving service for answered prayers. Bring your testimonies!',
    status: 'Scheduled',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T16:00:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a5',
    category: 'Events & Programs',
    priority: 'Medium',
    title: 'Weekly Sabbath Service Reminder',
    content:
      'Join us this Sabbath for worship service at 9:00 AM. Theme: "Walking in Faith". Speaker: Pastor Williams.',
    status: 'Approved',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T09:00:00Z',
    audience: ['Pastors'],
  },
  {
    id: 'a6',
    category: 'Events & Programs',
    priority: 'Medium',
    title: 'Weekly Sabbath Service Reminder',
    content:
      'Join us this Sabbath for worship service at 9:00 AM. Theme: "Walking in Faith". Speaker: Pastor Williams.',
    status: 'Rejected',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T09:00:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a7',
    category: 'Events & Programs',
    priority: 'Medium',
    title: 'Weekly Sabbath Service Reminder',
    content:
      'Join us this Sabbath for worship service at 9:00 AM. Theme: "Walking in Faith". Speaker: Pastor Williams.',
    status: 'Approved',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T09:00:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a8',
    category: 'Events & Programs',
    priority: 'Medium',
    title: 'Weekly Sabbath Service Reminder',
    content:
      'Join us this Sabbath for worship service at 9:00 AM. Theme: "Walking in Faith". Speaker: Pastor Williams.',
    status: 'Approved',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T09:00:00Z',
    audience: ['All Members'],
  },
  {
    id: 'a9',
    category: 'Events & Programs',
    priority: 'Medium',
    title: 'Weekly Sabbath Service Reminder',
    content:
      'Join us this Sabbath for worship service at 9:00 AM. Theme: "Walking in Faith". Speaker: Pastor Williams.',
    status: 'Approved',
    author: 'Secretary',
    authorRole: 'Admin',
    date: '2024-01-18T09:00:00Z',
    audience: ['All Members'],
  },
];
