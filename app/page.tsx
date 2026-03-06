/**
 * Page - Landing Page
 * * Main entry point for The Open Door church management platform.
 * * Typography Strategy:
 * - Headlines: font-heading (Outfit) for high-impact geometric feel.
 * - Body/UI: font-sans (Inter) for maximum readability.
 */

import FeatureNavbar from '@/components/FeatureNavbar';
import LandingHero from '@/components/LandingHero';
import LandingFeatureSection from '@/components/LandingFeatureSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import FeatureFooter from '@/components/FeatureFooter';

const Page = () => {
  return (
    <div className="landing-page-root min-h-screen bg-white selection:bg-[#17D7BE]/30">
      {/* 1. STICKY NAVIGATION */}
      <FeatureNavbar />

      {/* 2. HERO SECTION 
          Using z-index to ensure it sits properly above background decorations */}
      <main className="relative">
        <LandingHero />

        {/* 3. FEATURES SECTION 
             use a relative container to handle the transition from the Hero gradient to white */}
        <section className="bg-white">
          <LandingFeatureSection />
        </section>

        {/* 4. PRICING SECTION
            Added 'id' for smooth scroll navigation from Navbar */}
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

export default Page;
