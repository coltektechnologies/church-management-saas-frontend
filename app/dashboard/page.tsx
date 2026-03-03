'use client';

import { AppDataProvider } from '@/components/dashboard/contexts/AppDataContext';
import DashboardPage from '@/components/dashboard/DashboardPage';

export default function Page() {
  return (
    <AppDataProvider>
      <DashboardPage />
    </AppDataProvider>
  );
}
