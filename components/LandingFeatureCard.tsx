'use client';

import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LandingFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const LandingFeatureCard = ({ icon: Icon, title, description }: LandingFeatureCardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push('/features')}
      className="feature-card-wrapper group cursor-pointer w-full mx-auto"
      style={{
        maxWidth: '379px',
        minHeight: '391px',
        borderRadius: '34px',
        backgroundColor: '#002B48', // Initial Navy Background
        boxShadow: '0px 2px 4.6px 1px #002B4875',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
        transition: 'all 0.4s ease-in-out',
      }}
    >
      {/* Custom CSS for the hover state:
        1. Background flips to Teal (#17D7BE)
        2. Icon and inner circle flip to Navy (#002B48)
      */}
      <style jsx>{`
        .feature-card-wrapper:hover {
          background-color: #17d7be !important;
          transform: translateY(-8px);
        }

        /* Change title and description color to Navy on hover */
        .feature-card-wrapper:hover :global(.feature-card-title),
        .feature-card-wrapper:hover :global(.feature-card-description) {
          color: #002b48 !important;
        }

        /* Change the inner circle to Navy and Icon to Teal (or vice versa) */
        .feature-card-wrapper:hover :global(.inner-icon-bg) {
          background-color: #002b48 !important;
        }

        .feature-card-wrapper:hover :global(.feature-card-icon) {
          color: #17d7be !important;
        }

        /* Adjust the doughnut ring visibility on hover */
        .feature-card-wrapper:hover :global(.outer-icon-ring) {
          background-color: rgba(0, 43, 72, 0.1) !important;
        }
      `}</style>

      {/* ===== FEATURE TITLE ===== */}
      <h3
        className="feature-card-title text-white transition-colors duration-300"
        style={{
          fontFamily: 'OV Soge, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          marginBottom: '20px',
        }}
      >
        {title}
      </h3>

      {/* ===== ICON CONTAINER (Doughnut Shape) ===== */}
      <div className="icon-section-container flex-grow flex items-center justify-center lg:justify-start w-full">
        {/* Outer Ring (Doughnut) */}
        <div
          className="outer-icon-ring relative flex items-center justify-center rounded-full transition-all duration-500 ease-out group-hover:scale-125"
          style={{
            width: '120px',
            height: '120px',
            background: 'rgba(23, 215, 190, 0.08)', // Subtle idle state
          }}
        >
          {/* Inner Solid Circle */}
          <div
            className="inner-icon-bg flex items-center justify-center rounded-full transition-colors duration-300"
            style={{
              width: '80px',
              height: '80px',
              background: '#001D31',
            }}
          >
            <Icon
              className="feature-card-icon transition-colors duration-300"
              style={{ width: '40px', height: '40px', color: '#17D7BE' }}
            />
          </div>
        </div>
      </div>

      {/* ===== FEATURE DESCRIPTION ===== */}
      <p
        className="feature-card-description transition-colors duration-300"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '1.4',
          color: 'rgba(255, 255, 255, 0.9)',
          marginTop: 'auto',
          paddingTop: '20px',
        }}
      >
        {description}
      </p>
    </div>
  );
};

export default LandingFeatureCard;
