/**
 * LandingFeatureSection Component
 * * Purpose: Main container for the features grid on the landing page.
 * Fonts: Poppins (heading + CTA)
 * Responsive: Uses a CSS grid that adjusts columns for mobile (1), tablet (2), and desktop (3).
 */

import { Users, Wallet, MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import LandingFeatureCard from './LandingFeatureCard';

// Centralized Feature data array for easy updates
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
      className="landing-features-root relative mx-auto py-12 md:py-20 px-4 md:px-8 max-w-[1200px]"
    >
      <div className="features-content-container w-full h-full">
        {/* ===== SECTION HEADER (Title & CTA Row) ===== */}
        <div className="section-header-row flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <h2
            className="main-section-title"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 40px)', // Scales smoothly between 32px and 40px
              lineHeight: '100%',
              letterSpacing: '0.03em',
              color: '#00223A',
              maxWidth: '530px',
            }}
          >
            All-in-One Ministry Tools
          </h2>

          {/* Navigation Link to Detailed Features Page */}
          <Link
            href="/features"
            className="features-cta-link group/features-cta cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              width: '100%',
              maxWidth: '287px',
              height: '56px',
              borderRadius: '31px',
              background: '#17D7BE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <span
              className="cta-text text-[#020202]"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
              }}
            >
              See all Features
            </span>
            <ChevronRight className="h-5 w-5 text-[#020202] transition-transform group-hover/features-cta:translate-x-1" />
          </Link>
        </div>

        {/* ===== FEATURE CARDS GRID (Mobile-First Responsive Layout) ===== */}
        <div className="feature-cards-grid-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[17px] justify-center">
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
