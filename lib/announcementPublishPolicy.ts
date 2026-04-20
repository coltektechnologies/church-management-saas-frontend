/**
 * Whether the current UI may run submit → approve → publish in one go.
 * Only the secretariat app surface is allowed to self-serve that full chain; all
 * other areas (admin, department, etc.) should only submit for review.
 */
export function canInstantPublishAnnouncementsFromUi(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.location.pathname.startsWith('/secretary');
}
