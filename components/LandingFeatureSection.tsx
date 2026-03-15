'use client'; // Add this to the very top!

import { Users, Wallet, MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import LandingFeatureCard from './LandingFeatureCard';

// Centralized Feature data array
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
        {/* ===== SECTION HEADER ===== */}
        <div className="section-header-row flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <h2
            className="main-section-title"
            style={{
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 40px)',
              lineHeight: '100%',
              letterSpacing: '0.03em',
              color: '#00223A',
              maxWidth: '530px',
            }}
          >
            All-in-One Ministry Tools
          </h2>

          <Link
            href="/features"
            className="features-cta-link group transition-all duration-300 ease-out"
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
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span
              className="cta-text text-[#020202] transition-transform duration-300 group-hover:-translate-x-1"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
              }}
            >
              See all Features
            </span>
            <ChevronRight className="h-6 w-6 text-[#020202] transition-transform duration-300 group-hover:translate-x-2" />

            <style jsx>{`
              .features-cta-link:hover {
                transform: translateY(-4px);
                box-shadow: 0 15px 30px -5px rgba(23, 215, 190, 0.4) !important;
              }
            `}</style>
          </Link>
        </div>

        {/* ===== FEATURE CARDS GRID ===== */}
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
