'use client';

import { ChurchProfileProvider } from '@/components/admin/contexts/ChurchProfileContext';
import { DepartmentsProvider } from '@/context/DepartmentsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChurchProfileProvider>
      <DepartmentsProvider>
        <main className="min-h-screen bg-gray-100 p-6">{children}</main>
      </DepartmentsProvider>
    </ChurchProfileProvider>
  );
}
