'use client';

import { ChurchProfileProvider } from '@/components/admin/contexts/ChurchProfileContext';
import { DepartmentsProvider } from '@/context/DepartmentsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChurchProfileProvider>
      <DepartmentsProvider>{children}</DepartmentsProvider>
    </ChurchProfileProvider>
  );
}
