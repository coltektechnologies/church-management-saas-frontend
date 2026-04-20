import type { MembersPortalConfig } from '@/components/admin/membership/MembersPortalContext';

/** Base path and breadcrumbs for member profile/edit under the department app. */
export const departmentMembersPortal: MembersPortalConfig = {
  membersBasePath: '/departments/members',
  appHomeHref: '/departments',
  appHomeLabel: 'Department',
  departmentsHref: '/departments',
  hideMemberLifecycleControls: true,
  memberProfilePresentation: 'department',
  hideRemoveFromChurchDirectory: true,
};
