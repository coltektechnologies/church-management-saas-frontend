/**
 * LandingFeatureSection Component
 * * Main container for the features grid on the landing page.
 * Uses a 3-column flex layout with fixed dimensions.
 */

import { Users, Wallet, MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import LandingFeatureCard from './LandingFeatureCard';

// Feature data array for easy maintenance
const FEATURE_DATA = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Securely manage member profiles, attendance, and growth analytics in one place.',
  },
  {
    icon: Wallet,
    title: 'Financial Tracking',
    description: 'Automate tithe recording, track expenses and generate instant financial reports.',
  },
  {
    icon: MessageSquare,
    title: 'Automated Communications',
    description: 'Reach your congregation instantly via automated SMS and email notifications.',
  },
];

const LandingFeatureSection = () => {
  return (
    <section
      id="features"
      className="landing-features-root relative mx-auto py-20"
      style={{ width: '1171px', height: '499px' }}
    >
      <div className="features-content-container w-full h-full">
        {/* ===== SECTION HEADER (Title & CTA) ===== */}
        <div className="section-header-row flex items-center justify-between mb-12 px-4">
          <h2
            className="main-section-title"
            style={{
              width: '530px',
              height: '55px',
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 700,
              fontSize: '40px',
              lineHeight: '100%',
              letterSpacing: '3%',
              color: '#00223A',
            }}
          >
            All-in-One Ministry Tools
          </h2>

          {/* Navigation Link to Features page */}
          <Link
            href="/features"
            className="features-cta-link group transition-all duration-300 hover:scale-105"
            style={{
              width: '287px',
              height: '56px',
              borderRadius: '31px',
              background: '#17D7BE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              textDecoration: 'none',
            }}
          >
            <span
              className="cta-text"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
                color: '#020202',
              }}
            >
              See all Features
            </span>
            <ChevronRight className="h-5 w-5 text-[#020202] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ===== FEATURE CARDS GRID ===== */}
        <div className="feature-cards-grid-row flex gap-[17px] justify-center">
          {FEATURE_DATA.map((feature, index) => (
            <LandingFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatureSection;
