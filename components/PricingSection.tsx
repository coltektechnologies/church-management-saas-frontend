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
    buttonText: 'Start a Basic Plan',
  },
  {
    id: 'premium',
    title: 'Premium',
    subtitle: 'The Complete Solution',
    monthlyPrice: '20',
    yearlyPrice: '200',
    features: [
      'Everything in the Basic Plan',
      'Advanced Analytics & Reporting',
      'Unlimited Admin & Staff Roles',
      'Full Departmental Coordination Hub',
    ],
    buttonText: 'Start a Premium Plan',
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    subtitle: 'For Large Networks',
    monthlyPrice: '30',
    yearlyPrice: '300',
    features: [
      'Multi-Campus Management',
      'Custom API Integrations',
      'Dedicated Account Manager',
      'White-label Mobile App',
    ],
    buttonText: 'Start an Enterprise Plan',
  },
];

// Canonical defaults
const DEFAULT_PRIMARY = '#0B2A4A';
const DEFAULT_ACCENT = '#2FC4B2';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem('church_profile_v1');
        if (raw) {
          const p = JSON.parse(raw) as { primaryColor?: string; accentColor?: string };
          if (p.primaryColor) {
            setPrimaryColor(p.primaryColor);
          }
          if (p.accentColor) {
            setAccentColor(p.accentColor);
          }
        }
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sync colours when theme changes on another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'church_profile_v1') {
        return;
      }
      try {
        const p = JSON.parse(e.newValue ?? '') as { primaryColor?: string; accentColor?: string };
        if (p.primaryColor) {
          setPrimaryColor(p.primaryColor);
        }
        if (p.accentColor) {
          setAccentColor(p.accentColor);
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sectionRef.current && (e.target as HTMLElement).id === 'pricing-container') {
        setSelectedIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-white dark:bg-[#071629]">
      <div id="pricing-container" className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className="mb-4"
            style={{
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
                type="button"
                onClick={() => setIsYearly(false)}
                className="relative z-10 w-1/2 cursor-pointer text-center font-bold text-sm transition-colors"
                style={{
                  color: !isYearly ? primaryColor : '#fff',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className="relative z-10 w-1/2 cursor-pointer text-center font-bold text-sm transition-colors"
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
