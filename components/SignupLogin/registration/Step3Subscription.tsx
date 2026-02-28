'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StepSubscriptionProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Start Free',
    monthlyPrice: '0',
    yearlyPrice: '0',
    subPrice: 'for 14 days',
    description: 'Full access for 14 days to explore Open Door',
  },
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: '14',
    yearlyPrice: '140',
    subPrice: 'per month',
    description: 'Finance tracking, SMS alerts, and 5 admin accounts.',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: '20',
    yearlyPrice: '200',
    subPrice: 'per month',
    description: 'Advanced analytics, unlimited admins and full coordination',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: '30',
    yearlyPrice: '300',
    subPrice: 'per month',
    description: 'Custom features, enterprise security, and priority support',
  },
];

const Step3Subscription = ({ data, onChange, onNext, onBack }: StepSubscriptionProps) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(
    (data.billing as 'monthly' | 'yearly') || 'monthly'
  );

  const styles = {
    container: 'animate-in fade-in duration-500 font-poppins',
    billingToggle: 'flex justify-start mb-8',
    toggleWrapper: 'inline-flex bg-[#F2F2F2] p-1 rounded-full border border-[#BCBDBF]',
    toggleBtn: (active: boolean) =>
      cn(
        'px-6 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200',
        active ? 'bg-white text-black shadow-[0px_2px_4px_-2px_#00000040]' : 'text-[#666666]'
      ),
    planGrid: 'grid gap-4 grid-cols-1 sm:grid-cols-2',
    card: 'relative overflow-hidden rounded-[10px] border border-[#2FC4B2] flex flex-col h-full bg-white text-left transition-all',
    cardHeader: (selected: boolean) =>
      cn(
        'px-4 py-3 flex justify-between items-center transition-colors duration-200',
        selected ? 'bg-[#0B2A4A]' : 'bg-[#BFF7EE]'
      ),
    headerTitle: (selected: boolean) =>
      cn('text-[16px] font-medium leading-[100%]', selected ? 'text-white' : 'text-[#0B2A4A]'),
    radioOuter: (selected: boolean) =>
      cn(
        'w-4 h-4 rounded-full border flex items-center justify-center',
        selected ? 'border-white' : 'border-[#0B2A4A]'
      ),
    radioInner: (selected: boolean) =>
      cn('w-2 h-2 rounded-full', selected ? 'bg-white' : 'bg-[#0B2A4A]'),
    content: 'p-4 flex flex-col grow',
    priceRow: 'flex items-baseline gap-1 mb-2',
    price: 'text-[30px] font-semibold leading-[100%] text-[#000000]',
    subPrice: 'text-[12px] font-medium leading-[100%] text-[#1DAA99]',
    description: 'text-[12px] font-medium leading-[100%] text-[#000000]',
    buttonGroup: 'flex justify-center gap-2 pt-10',
    backBtn:
      'w-[229px] h-[44px] rounded-[10px] bg-[#D9D9D9] hover:bg-gray-300 text-[#000000] font-bold border-none transition-all',
    continueBtn:
      'w-[229px] h-[44px] rounded-[10px] bg-[#666666] hover:bg-black text-white font-bold transition-all',
  };

  return (
    <div className={styles.container}>
      <div className={styles.billingToggle}>
        <div className={styles.toggleWrapper}>
          <button
            onClick={() => {
              setBilling('monthly');
              onChange('billing', 'monthly');
            }}
            className={styles.toggleBtn(billing === 'monthly')}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              setBilling('yearly');
              onChange('billing', 'yearly');
            }}
            className={styles.toggleBtn(billing === 'yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className={styles.planGrid}>
        {plans.map((plan) => {
          const isSelected = data.subscriptionPlan === plan.id;
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const displaySubPrice =
            plan.id === 'free' ? plan.subPrice : billing === 'monthly' ? 'per month' : 'per year';

          return (
            <button
              key={plan.id}
              onClick={() => onChange('subscriptionPlan', plan.id)}
              className={styles.card}
            >
              <div className={styles.cardHeader(isSelected)}>
                <span className={styles.headerTitle(isSelected)}>{plan.name}</span>
                <div className={styles.radioOuter(isSelected)}>
                  {isSelected && <div className={styles.radioInner(isSelected)} />}
                </div>
              </div>

              <div className={styles.content}>
                <div className={styles.priceRow}>
                  <span className={styles.price}>${displayPrice}</span>
                  <span className={styles.subPrice}>{displaySubPrice}</span>
                </div>
                <p className={styles.description}>{plan.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.buttonGroup}>
        <Button onClick={onBack} className={styles.backBtn}>
          Back
        </Button>
        <Button onClick={onNext} className={styles.continueBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step3Subscription;
