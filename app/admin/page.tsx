'use client';

import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import DashboardPage from '@/components/admin/dashboard/DashboardPage';

export default function Page() {
  return (
    <AppDataProvider>
      <DashboardPage />
    </AppDataProvider>
  );
}
