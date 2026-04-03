import { Suspense } from 'react';
import DeptSettingsPage from '@/components/departments/settings/DeptSettingsPage';

export default function DepartmentSettingsPage() {
  return (
    <Suspense>
      <DeptSettingsPage />
    </Suspense>
  );
}
