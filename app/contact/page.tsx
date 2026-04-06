import type { Metadata } from 'next';
import FeatureNavbar from '@/components/FeatureNavbar';
import ContactSection from '@/components/ContactSection';
import FeatureFooter from '@/components/FeatureFooter';

export const metadata: Metadata = {
  title: 'Contact Us | Church Management',
  description:
    'Reach the Open Door team for demos, pricing, support, and partnerships. Email, phone, and social links.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#17D7BE]/30">
      <FeatureNavbar />
      <main>
        <ContactSection />
      </main>
      <FeatureFooter />
    </div>
  );
}
