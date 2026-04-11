'use client';

import { Suspense } from 'react';
import TreasurySettingsPage from '@/components/treasurydashboard/settings/SettingsPage';

export default function SettingsPage() {
  return (
    // Suspense required because TreasurySettingsPage uses useSearchParams()
    <Suspense>
      <TreasurySettingsPage />
    </Suspense>
  );
}
