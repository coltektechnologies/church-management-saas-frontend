'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type MembersPortalConfig = {
  /** e.g. `/admin/members` or `/secretary/members` */
  membersBasePath: string;
  /** Breadcrumb home (admin dashboard or secretary dashboard) */
  appHomeHref: string;
  appHomeLabel: string;
  /** Link for “create departments” etc. */
  departmentsHref: string;
  /** Department coordinators: hide account active + notification fields on edit. */
  hideMemberLifecycleControls?: boolean;
  /** Calmer layout/copy for department member profile + edit. */
  memberProfilePresentation?: 'default' | 'department';
  /** Hide “delete member” from church directory (department portal). */
  hideRemoveFromChurchDirectory?: boolean;
};

const defaultConfig: MembersPortalConfig = {
  membersBasePath: '/admin/members',
  appHomeHref: '/admin',
  appHomeLabel: 'Membership',
  departmentsHref: '/admin/departments',
  hideMemberLifecycleControls: false,
  memberProfilePresentation: 'default',
  hideRemoveFromChurchDirectory: false,
};

const MembersPortalContext = createContext<MembersPortalConfig>(defaultConfig);

export function MembersPortalProvider({
  value,
  children,
}: {
  value: MembersPortalConfig;
  children: ReactNode;
}) {
  return <MembersPortalContext.Provider value={value}>{children}</MembersPortalContext.Provider>;
}

export function useMembersPortal() {
  return useContext(MembersPortalContext);
}
