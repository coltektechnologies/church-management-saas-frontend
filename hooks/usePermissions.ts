import { useAuth } from '@/context/AuthContext';
import { Permission, ROLE_PERMISSIONS } from '@/lib/permissions';

export function usePermissions() {
  const { role } = useAuth();
  const permissions = ROLE_PERMISSIONS[role];

  const can = (permission: Permission): boolean => {
    return permissions?.[permission] ?? false;
  };

  return { can, role };
}
