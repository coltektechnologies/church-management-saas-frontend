'use client';

/**
 * /treasury — Treasury dashboard home
 */

import { AppDataProvider } from '@/components/admin/dashboard/contexts/AppDataContext';
import { TreasuryDataProvider } from '@/components/treasurydashboard/contexts/TreasuryDataContext';
import TreasuryDashboard from '@/components/treasurydashboard/dashboard/TreasuryDashboard';

export default function TreasuryPage() {
  return (
    <AppDataProvider>
      <TreasuryDataProvider>
        <TreasuryDashboard />
      </TreasuryDataProvider>
    </AppDataProvider>
  );
}
