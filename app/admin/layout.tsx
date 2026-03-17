'use client';

import { DepartmentsProvider } from '@/context/DepartmentsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DepartmentsProvider>
      <main className="min-h-screen bg-gray-100 p-6">{children}</main>
    </DepartmentsProvider>
  );
}
