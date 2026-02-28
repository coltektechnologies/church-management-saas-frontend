'use client';

import { useState, useEffect, useRef } from 'react';
import PricingCard from './PricingCard';

// Pricing plans data with "Start [Plan Name]" buttons
const pricingPlans = [
  {
    id: 0,
    title: 'Start Free',
    subtitle: 'The Entry Point',
    price: '0',
    features: ['Core Member Directory', 'Basic Tithe Recording', '1 Administrative User'],
    buttonText: 'Start a Free Plan',
  },
  {
    id: 1,
    title: 'Basic',
    subtitle: 'The Growth Plan',
    price: '29',
    features: [
      'Everything in Free Trial',
      'Full Treasury & Expense Tracking',
      '5 Department Admin Accounts',
      'Automated SMS Notifications',
    ],
    buttonText: 'Start a Basic Plan',
  },
  {
    id: 2,
    title: 'Premium',
    subtitle: 'The Complete Solution',
    price: '79',
    features: [
      'Everything in the Basic Plan',
      'Advanced Analytics & Reporting',
      'Unlimited Admin & Staff Roles',
      'Full Departmental Coordination Hub',
    ],
    buttonText: 'Start a Premium Plan',
  },
  {
    id: 3,
    title: 'Enterprise',
    subtitle: 'For Large Networks',
    price: '149',
    features: [
      'Multi-Campus Management',
      'Custom API Integrations',
      'Dedicated Account Manager',
      'White-label Mobile App',
    ],
    buttonText: 'Start an Enterprise Plan',
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(2);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Close active card immediately when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && (event.target as HTMLElement).id === 'pricing-container') {
        setSelectedIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-white">
      <div id="pricing-container" className="container mx-auto px-4">
        {/* ===== HEADER ===== */}
        <div className="text-center mb-16 pointer-events-none">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 700,
              fontSize: '40px',
              lineHeight: '100%',
              letterSpacing: '0.03em',
              color: '#00223A',
            }}
          >
            Simple Pricing for Every Ministry.
          </h2>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '131%',
              color: 'rgba(0, 34, 58, 0.7)',
            }}
          >
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center mt-12 pointer-events-auto">
            <div className="relative flex items-center bg-[#00223A] rounded-full p-1 w-[280px] h-[60px]">
              <div
                className={`absolute h-[50px] w-[135px] bg-[#17D7BE] rounded-full transition-all duration-300 ease-in-out ${isYearly ? 'translate-x-[135px]' : 'translate-x-0'}`}
              />
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 w-1/2 text-center font-bold text-sm transition-colors ${!isYearly ? 'text-[#00223A]' : 'text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 w-1/2 text-center font-bold text-sm transition-colors ${isYearly ? 'text-[#00223A]' : 'text-white'}`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1440px] mx-auto items-start">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              {...plan}
              isActive={selectedIndex === plan.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(plan.id);
              }}
              period={isYearly ? '/Year.' : '/Month.'}
              price={isYearly ? String(Math.round(Number(plan.price) * 10)) : plan.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
