'use client';

import { useMemo, type CSSProperties } from 'react';
import { Loader2 } from 'lucide-react';
import AdminReportsHub from '@/components/admin/reports/AdminReportsHub';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDepartments } from '@/context/DepartmentsContext';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';

const skipDepartmentPortalFetch =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH === 'true';

export default function DepartmentReportsClient() {
  const { profile, portalIdentityLoaded } = useDepartmentProfile();
  const { loading: departmentsLoading } = useDepartments();
  const department = usePortalDepartment();

  const tokens = useMemo(() => {
    const isDark = profile.darkMode ?? profile.theme === 'dark';
    return {
      bg: isDark ? profile.darkBackgroundColor || '#0A1628' : profile.backgroundColor || '#F5F7FA',
      surface: isDark ? profile.darkSidebarColor || '#112240' : '#FFFFFF',
      border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      text: isDark ? '#E2E8F0' : '#1A202C',
      textMuted: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
      primary: isDark ? profile.darkPrimaryColor || '#1A3F6B' : profile.primaryColor || '#0B2A4A',
      accent: isDark ? profile.darkAccentColor || '#2FC4B2' : profile.accentColor || '#2FC4B2',
    };
  }, [profile]);

  const shellStyle = useMemo(
    () =>
      ({
        '--admin-bg': tokens.bg,
        '--admin-surface': tokens.surface,
        '--admin-border': tokens.border,
        '--admin-text': tokens.text,
        '--admin-text-muted': tokens.textMuted,
        '--color-primary': tokens.primary,
        '--color-accent': tokens.accent,
        backgroundColor: tokens.bg,
      }) as CSSProperties,
    [tokens]
  );

  if (!portalIdentityLoaded || (departmentsLoading && !department)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!department && !skipDepartmentPortalFetch) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        No department is linked to your account.
      </div>
    );
  }

  const deptId = department?.id ?? '';

  return (
    <div className="space-y-4">
      {department ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {department.name} · {department.code}
        </p>
      ) : null}

      <div
        className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm"
        style={shellStyle}
      >
        <AdminReportsHub variant="department" departmentId={deptId || undefined} />
      </div>
    </div>
  );
}
