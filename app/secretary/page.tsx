'use client';

/**
 * Secretary home — analytics + approval previews load inside `SecretaryDashboardApiProvider`
 * (see `components/secretary/contexts/SecretaryDashboardApiContext.tsx`).
 */
import SecretaryDashboard from '@/components/secretary/dashboard/SecretaryDashboard';
import { SecretaryDashboardApiProvider } from '@/components/secretary/contexts/SecretaryDashboardApiContext';

export default function SecretaryPage() {
  return (
    <SecretaryDashboardApiProvider>
      <SecretaryDashboard />
    </SecretaryDashboardApiProvider>
  );
}
