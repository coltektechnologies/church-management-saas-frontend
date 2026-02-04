/**
 * LandingFeatureCard Component
 * * Displays an individual feature with an icon, title, and description.
 * Styled with a deep navy background and teal accents.
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
      className="feature-card-wrapper transition-all duration-300 hover:translate-y-[-5px]"
      style={{
        width: '379px',
        height: '391px',
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
      {/* ===== FEATURE TITLE (Top Left) ===== */}
      <h3
        className="feature-card-title text-white"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          fontSize: '24px',
          marginBottom: '20px',
        }}
      >
        {title}
      </h3>

      {/* ===== ICON CONTAINER (Centered Section) ===== */}
      <div className="icon-section-container flex-grow flex items-center justify-left w-full">
        {/* Outer Glow Ring */}
        <div
          className="outer-icon-ring relative flex items-center justify-center rounded-full"
          style={{
            width: '120px',
            height: '120px',
            background: 'rgba(23, 215, 190, 0.05)',
          }}
        >
          {/* Inner Circle background */}
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

      {/* ===== FEATURE DESCRIPTION (Bottom Section) ===== */}
      <p
        className="feature-card-description"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '1.4',
          color: 'rgba(255, 255, 255, 0.9)',
          marginTop: 'auto',
        }}
      >
        {description}
      </p>
    </div>
  );
};

export default LandingFeatureCard;
