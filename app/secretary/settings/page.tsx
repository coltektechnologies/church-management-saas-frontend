import { Suspense } from 'react';
import SettingsPage from '@/components/secretary/settings/SettingsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
