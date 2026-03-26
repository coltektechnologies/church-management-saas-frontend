/**
 * Feature flags for mock vs live API (announcements, notifications, etc.).
 *
 * Set in `.env.local`:
 * - `NEXT_PUBLIC_USE_MOCK_ANNOUNCEMENTS=true` — use localStorage mock announcements
 * - `NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS=true` — use mock notification center data
 *
 * When unset/false and the user is authenticated, services call the Django API.
 */

/** Not a React hook — safe to call from services. */
export function isMockAnnouncementsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_ANNOUNCEMENTS === 'true';
}

/** Not a React hook — safe to call from services. */
export function isMockNotificationsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS === 'true';
}
