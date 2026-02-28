/**
 * PricingCard Component
 * Fixed: Removed unselected blurness/opacity.
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
  isActive?: boolean;
  onClick: () => void;
}

const PricingCard = ({
  title,
  subtitle,
  price,
  currency = '₵',
  period = '/Year.',
  features,
  buttonText,
  isActive = false,
  onClick,
}: PricingCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`pricing-card relative flex flex-col p-8 rounded-[34px] cursor-pointer transition-all duration-500 shadow-xl overflow-hidden w-full border-2 ${
        isActive
          ? 'scale-105 z-10 border-[#17D7BE] min-h-[600px]'
          : 'min-h-[580px] border-transparent'
      }`}
      style={{
        background: 'linear-gradient(135deg, #00223A 0%, #001524 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Badge: Shows [Plan Name] only */}
      {isActive && (
        <div className="absolute top-4 right-6 bg-[#17D7BE] text-[#00223A] px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest animate-in fade-in zoom-in">
          {title}
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-6 pt-4">
        <h3 className="text-lg font-semibold font-poppins">
          {title} ({subtitle})
        </h3>
      </div>

      {/* PRICE */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-1">
          <span
            className="text-5xl font-bold font-poppins"
            style={{ color: isActive ? '#17D7BE' : '#FFFFFF' }}
          >
            {currency}
            {price}
          </span>
          <span className="text-xl font-medium opacity-80">{period}</span>
        </div>
      </div>

      {/* BUTTON */}
      <div className="mb-8">
        <Button
          className={`w-full h-[54px] rounded-full font-bold text-lg transition-all duration-300 ${
            isActive
              ? 'bg-[#17D7BE] text-[#00223A] hover:bg-[#13b39e]'
              : 'bg-[#17D7BE] text-[#00223A] hover:opacity-90'
          }`}
        >
          {buttonText}
        </Button>
      </div>

      {/* FEATURES */}
      <ul className="space-y-4 flex-grow border-t border-white/10 pt-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full border border-[#17D7BE] flex items-center justify-center mt-0.5">
              <Check className="h-3 w-3 text-[#17D7BE]" />
            </div>
            <span className="text-sm font-medium font-poppins">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
        <Lock className="h-3 w-3" />
        <span className="text-[10px] italic uppercase tracking-tighter">
          Encrypted data with secure login.
        </span>
      </div>
    </div>
  );
};

export default PricingCard;
