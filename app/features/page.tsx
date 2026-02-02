import Navbar from "@/components/FeatureNavbar";
import FeatureHero from "@/components/FeatureHero";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import FeatureFooter from "@/components/FeatureFooter";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <Navbar />
      <FeatureHero />

      <div className="bg-gradient-to-b from-teal-600/20 to-transparent">
        <FeaturesSection />
      </div>

      <CTASection />
      <FeatureFooter />
    </main>
  );
}
