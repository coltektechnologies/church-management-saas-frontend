'use client';

import { useState, useRef, useEffect } from 'react';
import PricingCard from './PricingCard';

export const PRICING_PLANS = [
  {
    id: 'free',
    title: 'Start Free',
    subtitle: 'The Entry Point',
    monthlyPrice: '0',
    yearlyPrice: '0',
    features: [
      'Core Member Directory',
      'Basic Tithe Recording',
      '1 Administrative User',
      'Full access for 14 days',
    ],
    buttonText: 'Start a Free Plan',
  },
  {
    id: 'basic',
    title: 'Basic',
    subtitle: 'The Growth Plan',
    monthlyPrice: '14',
    yearlyPrice: '140',
    features: [
      'Everything in Free Plan',
      'Full Treasury & Expense Tracking',
      '5 Department Admin Accounts',
      'Automated SMS Notifications',
    ],
    buttonText: 'Start Free Plan',
    isPopular: false,
  },
  {
    id: 'premium',
    title: 'Premium',
    subtitle: 'The Complete Solution',
    monthlyPrice: '20',
    yearlyPrice: '200',
    features: [
      'Everything in Basic Plan',
      'Advanced Analytics & Reporting',
      'Unlimited Admins & Staff Files',
      'Full Coordination Hub',
      'Priority 24/7 Support',
    ],
    buttonText: 'Choose Premium',
    isPopular: true,
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    subtitle: 'For Large Networks',
    monthlyPrice: '30',
    yearlyPrice: '300',
    features: [
      'Everything in Free trial',
      'Full Treasury & Expense Tracking',
      '5 Department Admin Accounts',
      'Automated SMS Notifications',
    ],
    buttonText: 'Get Started',
    isPopular: false,
  },
];

const DEFAULT_PRIMARY = '#00223A';
const DEFAULT_ACCENT = '#17D7BE';

// Read colors from localStorage once at module-init time (client only)
const readStoredColors = (): { primaryColor: string; accentColor: string } => {
  if (typeof window === 'undefined') {
    return { primaryColor: DEFAULT_PRIMARY, accentColor: DEFAULT_ACCENT };
  }
  try {
    const raw = localStorage.getItem('church_profile_v1');
    if (raw) {
      const p = JSON.parse(raw) as { primaryColor?: string; accentColor?: string };
      return {
        primaryColor: p.primaryColor || DEFAULT_PRIMARY,
        accentColor: p.accentColor || DEFAULT_ACCENT,
      };
    }
  } catch {
    /* ignore */
  }
  return { primaryColor: DEFAULT_PRIMARY, accentColor: DEFAULT_ACCENT };
};

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fix: lazy initialisers read localStorage synchronously — no setState in effect
  const [primaryColor, setPrimaryColor] = useState(() => readStoredColors().primaryColor);
  const [accentColor, setAccentColor] = useState(() => readStoredColors().accentColor);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sectionRef.current && (e.target as HTMLElement).id === 'pricing-container') {
        setSelectedIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep colours in sync if the user changes their theme while on this page
  useEffect(() => {
    const onStorage = () => {
      const { primaryColor: pc, accentColor: ac } = readStoredColors();
      setPrimaryColor(pc);
      setAccentColor(ac);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-white dark:bg-[#071629]">
      <div id="pricing-container" className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: '110%',
              letterSpacing: '0.03em',
              color: primaryColor,
            }}
          >
            Simple Pricing for Every Ministry.
          </h2>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              color: primaryColor,
            }}
          >
            Start with a 14-day free trial. No credit card required.
          </p>

          <div className="flex justify-center mt-10">
            <div
              className="relative flex items-center rounded-full p-1 w-[260px] h-[56px]"
              style={{ backgroundColor: primaryColor }}
            >
              <div
                className="absolute h-[46px] w-[126px] rounded-full transition-all duration-300 ease-in-out"
                style={{
                  backgroundColor: accentColor,
                  transform: isYearly ? 'translateX(126px)' : 'translateX(2px)',
                }}
              />
              <button
                onClick={() => setIsYearly(false)}
                className="relative z-10 w-1/2 text-center font-bold text-sm transition-colors"
                style={{
                  color: !isYearly ? primaryColor : '#fff',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className="relative z-10 w-1/2 text-center font-bold text-sm transition-colors"
                style={{
                  color: isYearly ? primaryColor : '#fff',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1440px] mx-auto items-stretch">
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              planId={plan.id}
              title={plan.title}
              subtitle={plan.subtitle}
              features={plan.features}
              buttonText={plan.buttonText}
              isActive={selectedIndex === i}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(i);
                localStorage.setItem('selected_plan_id', plan.id);
              }}
              period={isYearly ? '/Year.' : '/Month.'}
              price={isYearly ? plan.yearlyPrice : plan.monthlyPrice}
              currency="₵"
              primaryColor={primaryColor}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
