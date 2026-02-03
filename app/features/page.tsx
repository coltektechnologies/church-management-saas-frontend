import Navbar from '@/components/FeatureNavbar';
import FeatureHero from '@/components/FeatureHero';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';
import FeatureFooter from '@/components/FeatureFooter';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <FeatureHero />

      {/* FEATURES SECTION ON WHITE */}
      <section className="bg-white">
        <FeaturesSection />
      </section>

      <CTASection />
      <FeatureFooter />
    </main>
  );
}
