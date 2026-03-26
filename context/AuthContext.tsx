'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppRole } from '@/lib/permissions';

type AuthContextType = {
  role: AppRole;
  setRole: (role: AppRole) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getRoleFromPath(pathname: string): AppRole {
  if (pathname.startsWith('/secretary')) {
    return 'secretary';
  }
  if (pathname.startsWith('/treasury')) {
    return 'treasury';
  }
  if (pathname.startsWith('/elder')) {
    return 'elder';
  }
  if (pathname.startsWith('/department-head')) {
    return 'department_head';
  }
  return 'admin';
}

export function AuthProvider({
  children,
  defaultRole = 'admin',
}: {
  children: React.ReactNode;
  defaultRole?: AppRole;
}) {
  const pathname = usePathname();
  const role = getRoleFromPath(pathname);
  const [, setRoleState] = useState<AppRole>(defaultRole);

  const setRole = (r: AppRole) => setRoleState(r);

  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
