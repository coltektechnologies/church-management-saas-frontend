'use client';

import { useState } from 'react';
import PricingCard from './PricingCard';

const pricingPlans = [
  {
    id: 0,
    title: 'Start Free',
    subtitle: 'The Entry Point',
    price: '0',
    features: ['Core Member Directory', 'Basic Tithe Recording', '1 Administrative User'],
    buttonText: 'Start Free Plan',
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
    buttonText: 'Get Started',
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
    buttonText: 'Choose Premium',
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
    buttonText: 'Contact Sales',
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(2);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* ===== RESTORED HEADER ===== */}
        <div className="text-center mb-16">
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
              letterSpacing: '0%',
              color: 'rgba(0, 34, 58, 0.7)',
            }}
          >
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center mt-12">
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

        {/* 4 Column Grid - Removed Blurness/Opacity from unselected cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1440px] mx-auto items-start">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              {...plan}
              isActive={selectedIndex === plan.id}
              onClick={() => setSelectedIndex(plan.id)}
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
