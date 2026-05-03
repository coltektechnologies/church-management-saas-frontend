import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import DepartmentDeepLinkSync from '@/components/departments/DepartmentDeepLinkSync';
import { DepartmentProfileProvider } from '@/components/departments/contexts/DepartmentProfileContext';
import { DeptActivityProvider } from '@/components/departments/contexts/DeptActivityContext';
import { DeptThemeProvider } from '@/components/departments/contexts/DeptThemeProvider';
import { ChurchProfileProvider } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import DepartmentSidebar from '@/components/departments/DepartmentSidebar';
import DepartmentTopbar from '@/components/departments/DepartmentTopbar';
import DepartmentLayoutClient from '@/components/departments/DepartmentLayoutClient';

export const metadata = {
  title: 'Department Dashboard',
  description: 'Church Department Management',
};

/**
 * Provider order matters:
 *   ChurchProfileProvider         — church name, logo, branding (set by admin)
 *   └─ DepartmentProfileProvider  — dept theme colours, head name (localStorage)
 *      └─ DeptThemeProvider       — reads darkMode from profile, provides setTheme()
 *         └─ DeptActivityProvider — activity log
 *            └─ layout shell      — sidebar + topbar + page content
 */
export default function DepartmentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider defaultRole="department_head">
      <ChurchProfileProvider>
        <DepartmentProfileProvider>
          <DeptThemeProvider>
            <DeptActivityProvider>
              <DepartmentLayoutClient>
                <DepartmentShell>{children}</DepartmentShell>
              </DepartmentLayoutClient>
            </DeptActivityProvider>
          </DeptThemeProvider>
        </DepartmentProfileProvider>
      </ChurchProfileProvider>
    </AuthProvider>
  );
}

/**
 * DepartmentShell — the visual skeleton.
 *
 * The sidebar is a sibling of the right column — NOT a parent of the topbar.
 * This means the topbar only occupies the right column width and never
 * overlaps the sidebar, regardless of whether the sidebar is expanded or
 * collapsed (the sidebar component handles its own width transition).
 */
function DepartmentShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-department-theme
      className="flex h-screen overflow-hidden bg-[var(--dept-main-bg,#F5F7FA)]"
      style={
        {
          fontFamily: 'var(--dept-font-family, Poppins, system-ui, sans-serif)',
          fontSize: 'var(--dept-font-size, 14px)',
        } as React.CSSProperties
      }
    >
      <Suspense fallback={null}>
        <DepartmentDeepLinkSync />
      </Suspense>
      {/*
        Sidebar — its own flex child.
        DepartmentSidebar manages its own collapsed/expanded width internally
      */}
      <DepartmentSidebar />

      {/*
        overflow-hidden here; the inner <main> handles scrolling
      */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar — full width of right column only */}
        <DepartmentTopbar />

        {/* Scrollable page content */}
        <main className="department-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
