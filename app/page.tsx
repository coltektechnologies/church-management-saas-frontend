/**
 * Page - Landing Page
 * Logic: Serves as the high-level orchestrator for the homepage.
 * Reorganizes sections into a semantic <main> tag for SEO and accessibility.
 */

import FeatureNavbar from '@/components/FeatureNavbar';
import LandingHero from '@/components/LandingHero';
import LandingFeatureSection from '@/components/LandingFeatureSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import FeatureFooter from '@/components/FeatureFooter';

const LandingPage = () => {
  return (
    <div className="landing-page-root min-h-screen bg-white selection:bg-[#17D7BE]/30">
      {/* 1. STICKY NAVIGATION */}
      <FeatureNavbar />

      <main className="relative">
        {/* 2. HERO SECTION */}
        <LandingHero />

        {/* 3. FEATURES SECTION */}
        <section className="bg-white">
          <LandingFeatureSection />
        </section>

        {/* 4. PRICING SECTION - Anchor for Navbar smooth scroll */}
        <div id="pricing" className="border-t border-slate-50">
          <PricingSection />
        </div>

        {/* 5. SOCIAL PROOF */}
        <TestimonialsSection />

        {/* 6. CONVERSION AREA */}
        <CTASection />
      </main>

      {/* 7. GLOBAL FOOTER */}
      <FeatureFooter />
    </div>
  );
};

export default LandingPage;
