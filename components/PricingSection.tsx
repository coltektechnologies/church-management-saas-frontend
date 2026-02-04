'use client';

/**
 * PricingSection Component
 * * Manages the layout for pricing tiers.
 * Typography matches the font styles in image_72218e.png.
 */

import { useState } from 'react';
import PricingCard from './PricingCard';

const pricingPlans = [
  {
    title: 'Free Forever',
    subtitle: 'The Entry Point',
    price: '0',
    features: [
      'Core Member Directory',
      'Basic Tithe Recording',
      '1 Administrator only',
      'Community Support',
    ],
    buttonText: 'Start Free Plan',
    isPopular: false,
  },
  {
    title: 'Premium',
    subtitle: 'The Complete Solution',
    price: '79',
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
    title: 'Basic',
    subtitle: 'The Growth Plan',
    price: '29',
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

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="pt-32 py-24 bg-[#FFFFFF]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section from image_72218e.png */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#00223A] mb-4 tracking-tight">
            Simple Pricing for Every Ministry.
          </h2>
          <p className="text-xl text-[#00223A]/70 font-medium">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-sm font-bold ${!isYearly ? 'text-[#00223A]' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-[#00223A] rounded-full p-1 transition-colors duration-300"
              aria-label="Toggle yearly pricing"
            >
              <div
                className={`w-5 h-5 bg-[#17D7BE] rounded-full transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}
              />
            </button>
            <span className={`text-sm font-bold ${isYearly ? 'text-[#00223A]' : 'text-gray-400'}`}>
              Yearly (Save 20%)
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              subtitle={plan.subtitle}
              price={isYearly ? String(Math.round(Number(plan.price) * 0.8)) : plan.price}
              features={plan.features}
              buttonText={plan.buttonText}
              isPopular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
