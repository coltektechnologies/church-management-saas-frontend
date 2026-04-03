import type { Metadata } from 'next';
import Link from 'next/link';
import FeatureNavbar from '@/components/FeatureNavbar';
import PricingPageIntro from '@/components/PricingPageIntro';
import PricingSection from '@/components/PricingSection';
import FeatureFooter from '@/components/FeatureFooter';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Pricing | Church Management',
  description:
    'Simple plans for every ministry—Free, Basic, Premium, and Enterprise. Monthly or yearly billing in cedis. Start your 14-day trial.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#17D7BE]/30">
      <FeatureNavbar />
      <main>
        <PricingPageIntro />
        <PricingSection />
        <section className="border-t border-slate-100 bg-slate-50/80 px-6 py-14 text-center">
          <p className="text-base text-slate-600">
            <span className="font-semibold text-[#1C3D72]">Still deciding?</span> Compare features
            on the{' '}
            <Link href={ROUTES.features} className="font-semibold text-[#2EC4B6] hover:underline">
              Features
            </Link>{' '}
            page or{' '}
            <Link href={ROUTES.contact} className="font-semibold text-[#2EC4B6] hover:underline">
              contact us
            </Link>{' '}
            for a walkthrough.
          </p>
        </section>
      </main>
      <FeatureFooter />
    </div>
  );
}
