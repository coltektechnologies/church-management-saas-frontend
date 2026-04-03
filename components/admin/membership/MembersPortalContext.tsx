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
};

const defaultConfig: MembersPortalConfig = {
  membersBasePath: '/admin/members',
  appHomeHref: '/admin',
  appHomeLabel: 'Membership',
  departmentsHref: '/admin/departments',
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
