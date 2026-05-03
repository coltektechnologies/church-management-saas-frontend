/**
 * LandingFeatureCard Component
 * * Purpose: Displays an individual feature with an icon, title, and description.
 * Fonts: OV Soge (Title), Poppins (Description)
 * Responsive: Fluid width with a max-width limit for desktop grid alignment.
 */

import { LucideIcon } from 'lucide-react';

interface LandingFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const LandingFeatureCard = ({ icon: Icon, title, description }: LandingFeatureCardProps) => {
  return (
    <div
      className="feature-card-wrapper isolate cursor-pointer transition-[transform,box-shadow] duration-300 hover:-translate-y-[5px] w-full mx-auto"
      style={{
        maxWidth: '379px',
        minHeight: '391px',
        borderRadius: '34px',
        background: '#002B48',
        boxShadow: '0px 2px 4.6px 1px #002B4875',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {/* ===== FEATURE TITLE (Top Left) - Font: OV Soge ===== */}
      <h3
        className="feature-card-title text-white"
        style={{
          fontFamily: 'OV Soge, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          marginBottom: '20px',
        }}
      >
        {title}
      </h3>

      {/* ===== ICON CONTAINER (Centered Section) ===== */}
      <div className="icon-section-container flex-grow flex items-center justify-center lg:justify-start w-full">
        {/* Outer Glow Ring with 5% Opacity */}
        <div
          className="outer-icon-ring relative flex items-center justify-center rounded-full"
          style={{
            width: '120px',
            height: '120px',
            background: 'rgba(23, 215, 190, 0.05)',
          }}
        >
          {/* Inner Circle Background - Solid Deep Navy */}
          <div
            className="inner-icon-bg flex items-center justify-center rounded-full"
            style={{
              width: '80px',
              height: '80px',
              background: '#001D31',
            }}
          >
            <Icon
              className="feature-card-icon"
              style={{ width: '40px', height: '40px', color: '#17D7BE' }}
            />
          </div>
        </div>
      </div>

      {/* ===== FEATURE DESCRIPTION (Bottom Section) - Font: Poppins ===== */}
      <p
        className="feature-card-description"
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
