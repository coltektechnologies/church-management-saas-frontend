/**
 * Static UI options aligned with backend Notification model / serializers.
 * (Same values the API accepts.)
 */

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationCategory =
  | 'ANNOUNCEMENT'
  | 'REMINDER'
  | 'EVENT'
  | 'BIRTHDAY'
  | 'FINANCE'
  | 'GENERAL'
  | 'PROGRAM';

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
