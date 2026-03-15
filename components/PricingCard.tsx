/**
 * PricingCard Component
 */
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Props for the PricingCard component
interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  currency?: string;
  period?: string;
  features: string[];
  buttonText: string;
  isActive?: boolean;
  onClick: (e: React.MouseEvent) => void;
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
}: // Destructure props with default values for optional fields
PricingCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`pricing-card relative flex flex-col p-8 rounded-[34px] cursor-pointer shadow-xl overflow-hidden w-full border-2 ${
        isActive
          ? 'scale-105 z-10 border-[#17D7BE] min-h-[600px] transition-all duration-500'
          : 'min-h-[580px] border-transparent hover:border-[#17D7BE]/30 transition-colors duration-300 scale-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #00223A 0%, #001524 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Badge: [Plan Name] */}
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
            className="text-5xl font-bold font-poppins transition-colors duration-300"
            style={{ color: isActive ? '#17D7BE' : '#FFFFFF' }}
          >
            {currency}
            {price}
          </span>
          <span className="text-xl font-medium opacity-100">{period}</span>
        </div>
      </div>

      {/* BUTTON: Linked to Signup */}
      <div className="mb-8">
        <Link href="/signup" className="w-full block">
          <Button
            className={`w-full h-[54px] rounded-full font-bold text-lg transition-all duration-300 ${
              isActive
                ? 'bg-[#17D7BE] text-[#00223A] hover:bg-[#13b39e] shadow-[0_0_20px_rgba(23,215,190,0.3)]'
                : 'bg-[#17D7BE] text-[#00223A] hover:bg-[#17D7BE]/90'
            }`}
          >
            {buttonText}
          </Button>
        </Link>
      </div>

      {/* FEATURES */}
      <ul className="space-y-4 flex-grow border-t border-white/10 pt-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full border border-[#17D7BE] flex items-center justify-center mt-0.5">
              <Check className="h-3 w-3 text-[#17D7BE]" />
            </div>
            <span className="text-sm font-medium font-poppins text-white">{feature}</span>
          </li>
        ))}
      </ul>

      {/* FOOTER ENCRYPTION TAG */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <Lock className="h-3 w-3" />
        <span className="text-[10px] italic uppercase tracking-tighter">
          Encrypted data with secure login.
        </span>
      </div>
    </div>
  );
};

export default PricingCard;
