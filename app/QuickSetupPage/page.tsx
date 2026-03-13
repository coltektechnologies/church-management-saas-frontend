import { ChurchProfileProvider } from '@/components/admin/contexts/ChurchProfileContext';
import QuickSetupPage from '@/components/quicksetup/QuickSetupPage';

export default function Page() {
  return (
    <ChurchProfileProvider>
      <QuickSetupPage />
    </ChurchProfileProvider>
  );
}
