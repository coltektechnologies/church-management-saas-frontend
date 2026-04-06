import type { Metadata } from 'next';
import FeatureNavbar from '@/components/FeatureNavbar';
import DevelopersSection from '@/components/DevelopersSection';
import FeatureFooter from '@/components/FeatureFooter';

export const metadata: Metadata = {
  title: 'Developers | Church Management',
  description:
    'Meet the engineers and product minds building our church management platform—roles, bios, and links.',
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#17D7BE]/30">
      <FeatureNavbar />
      <main>
        <DevelopersSection />
      </main>
      <FeatureFooter />
    </div>
  );
}
