'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/* * StepSubscription - Step 3: Subscription Plan
 * Monthly/Yearly toggle + 4 pricing cards (Start Free, Basic, Premium, Enterprise)
 */
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
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Full access for 14 days to explore Open Door',
  },
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 14,
    yearlyPrice: 140,
    description: 'Finance tracking, SMS clients, and 5 admin accounts.',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 20,
    yearlyPrice: 200,
    description: 'Advanced analytics, unlimited admins and full coordination.',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 30,
    yearlyPrice: 300,
    description: 'Custom features, enterprise security, and priority support.',
  },
];

const Step3Subscription = ({ data, onChange, onNext, onBack }: StepSubscriptionProps) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(
    (data.billing as 'monthly' | 'yearly') || 'monthly'
  );

  const styles = {
    billingToggle: 'flex justify-center mb-8',
    toggleWrapper: 'inline-flex bg-gray-100 p-1 rounded-full border border-gray-200',
    toggleBtn: (active: boolean) =>
      cn(
        'px-6 py-2 rounded-full text-xs font-bold transition-all',
        active ? 'bg-white text-black shadow-sm' : 'text-gray-500'
      ),
    planGrid: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
    planCard: (selected: boolean) =>
      cn(
        'p-5 rounded-2xl border-2 text-left transition-all h-full flex flex-col',
        selected ? 'border-[#2FC4B2] bg-[#2FC4B2]/5' : 'border-gray-100 hover:border-gray-200'
      ),
    planTitle: 'text-sm font-bold text-gray-800 mb-2',
    priceText: 'text-2xl font-bold text-black',
    priceSub: 'text-[10px] text-gray-400 uppercase',
    buttonGroup: 'flex justify-end gap-4 pt-10',
  };

  const handleBilling = (val: 'monthly' | 'yearly') => {
    setBilling(val);
    onChange('billing', val);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className={styles.billingToggle}>
        <div className={styles.toggleWrapper}>
          <button
            onClick={() => handleBilling('monthly')}
            className={styles.toggleBtn(billing === 'monthly')}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBilling('yearly')}
            className={styles.toggleBtn(billing === 'yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className={styles.planGrid}>
        {plans.map((plan) => {
          const isSelected = data.subscriptionPlan === plan.id;
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <button
              key={plan.id}
              onClick={() => onChange('subscriptionPlan', plan.id)}
              className={styles.planCard(isSelected)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={styles.planTitle}>{plan.name}</span>
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    isSelected ? 'border-[#2FC4B2]' : 'border-gray-300'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 bg-[#2FC4B2] rounded-full" />}
                </div>
              </div>
              <div className="mb-4">
                <span className={styles.priceText}>${price}</span>
                <span className={styles.priceSub}>/{billing === 'yearly' ? 'yr' : 'mo'}</span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed">{plan.description}</p>
            </button>
          );
        })}
      </div>

      <div className={styles.buttonGroup}>
        <Button variant="outline" onClick={onBack} className="rounded-full px-8">
          Back
        </Button>
        <Button onClick={onNext} className="rounded-full px-10 bg-[#666666] text-white">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step3Subscription;
