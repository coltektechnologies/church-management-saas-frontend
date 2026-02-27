/**
 * PricingCard Component
 * * Displays a pricing tier with specific Navy to Dark Navy gradient.
 * Fonts: Poppins (SemiBold for headings/buttons, Medium for features)
 */

import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  currency?: string;
  period?: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

const PricingCard = ({
  title,
  subtitle,
  price,
  currency = '₵',
  period = '/Month.',
  features,
  buttonText,
  isPopular = false,
}: PricingCardProps) => {
  return (
    <div
      className={`pricing-card relative flex flex-col p-8 rounded-[34px] transition-all duration-300 shadow-xl overflow-hidden w-full ${
        isPopular
          ? 'lg:scale-105 z-10 border-2 border-[#17D7BE] min-h-[550px]'
          : 'min-h-[510px] mt-0 lg:mt-5'
      }`}
      style={{
        background: 'linear-gradient(135deg, #00223A 0%, #001524 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Popular Tag */}
      {isPopular && (
        <div
          className="absolute top-4 right-6 bg-[#17D7BE] text-[#00223A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Most Popular
        </div>
      )}

      {/* ===== CARD HEADER ===== */}
      <div className="pricing-header mb-6">
        <h3
          className="pricing-title text-2xl mb-1"
          style={{ color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
        >
          {title}
        </h3>
        <p
          className="pricing-subtitle text-sm opacity-70"
          style={{ color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
        >
          {subtitle}
        </p>
      </div>

      {/* ===== PRICE DISPLAY ===== */}
      <div className="pricing-amount mb-8 flex items-baseline gap-1">
        <span
          className="price-value text-5xl font-extrabold"
          style={{ color: '#17D7BE', fontFamily: 'Poppins, sans-serif' }}
        >
          {currency}
          {price}
        </span>
        <span
          className="price-period text-sm font-medium opacity-60"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {period}
        </span>
      </div>

      {/* ===== FEATURES LIST ===== */}
      <ul className="pricing-features space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="feature-item flex items-start gap-3">
            <div className="icon-container-sm shrink-0 w-5 h-5 rounded-full bg-[#17D7BE] flex items-center justify-center mt-0.5">
              <Check className="h-3.5 w-3.5 text-[#00223A] stroke-[3]" />
            </div>
            <span
              className="feature-text text-sm leading-relaxed opacity-90"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* ===== CTA BUTTON ===== */}
      <Button
        className={`pricing-cta w-full py-6 rounded-full transition-all duration-300 ${
          isPopular
            ? 'bg-[#17D7BE] hover:bg-[#13b39e] text-[#00223A] shadow-lg shadow-[#17D7BE]/20'
            : 'bg-transparent border-2 border-[#17D7BE] text-[#17D7BE] hover:bg-[#17D7BE] hover:text-[#00223A]'
        }`}
        style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.125rem' }}
      >
        {buttonText}
      </Button>

      {/* ===== SECURITY BADGE ===== */}
      <div className="pricing-security mt-6 flex items-center justify-center gap-2 opacity-40">
        <Lock className="security-icon h-3 w-3" />
        <span
          className="security-text text-[10px] uppercase tracking-tighter"
          style={{ fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}
        >
          Encrypted data with secure login.
        </span>
      </div>
    </div>
  );
};

export default PricingCard;
