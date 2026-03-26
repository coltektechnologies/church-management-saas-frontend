'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { RegistrationData } from './Step4Payment';
import { getRegistrationPlans, type RegistrationPlan } from '@/lib/api';

interface StepSubscriptionProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const Step3Subscription = ({
  data,
  onChange,
  onNext,
  onBack,
  loading = false,
}: StepSubscriptionProps) => {
  const [plans, setPlans] = useState<RegistrationPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(
    (data.billing as 'monthly' | 'yearly') || 'monthly'
  );
  const [planError, setPlanError] = useState(false);

  useEffect(() => {
    getRegistrationPlans()
      .then(setPlans)
      .catch(() => setPlansError('Could not load plans'))
      .finally(() => setPlansLoading(false));
  }, []);

  const handlePlanClick = (planId: string) => {
    if (data.subscriptionPlan === planId) {
      onChange('subscriptionPlan', '');
    } else {
      onChange('subscriptionPlan', planId);
      setPlanError(false);
    }
  };

  const handleContinue = () => {
    if (!data.subscriptionPlan) {
      setPlanError(true);
      return;
    }
    onNext();
  };

  const displaySubPrice = (plan: RegistrationPlan) => {
    if (!plan.requires_payment) {
      if (plan.id === 'FREE') {
        return 'free forever';
      }
      return 'trial';
    }
    return billing === 'monthly' ? 'per month' : 'per year';
  };

  if (plansLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-[#2FC4B2] animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading plans...</p>
      </div>
    );
  }

  if (plansError || plans.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{plansError || 'No plans available'}</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 font-poppins">
      {/* Billing Toggle */}
      <div className="flex justify-start mb-8">
        <div className="inline-flex bg-[#F2F2F2] p-1 rounded-full border border-[#BCBDBF]">
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              onClick={() => {
                setBilling(b);
                onChange('billing', b);
              }}
              className={cn(
                'px-6 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 capitalize',
                billing === b
                  ? 'bg-white text-black shadow-[0px_2px_4px_-2px_#00000040]'
                  : 'text-[#666666]'
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mb-4 font-medium">
        Click a plan to select it. Click again to unselect.
      </p>

      {/* Plans from API */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {plans.map((plan) => {
          const isSelected = data.subscriptionPlan === plan.id;
          const displayPrice = billing === 'monthly' ? plan.monthly_price : plan.yearly_price;
          const subPrice = displaySubPrice(plan);

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handlePlanClick(plan.id)}
              className={cn(
                'relative overflow-hidden rounded-[10px] border-2 flex flex-col h-full bg-white text-left transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-[#2FC4B2] shadow-lg shadow-[#2FC4B2]/20 scale-[1.02]'
                  : 'border-[#2FC4B2]/40 hover:border-[#2FC4B2] hover:shadow-md hover:scale-[1.01]'
              )}
            >
              <div
                className={cn(
                  'px-4 py-3 flex justify-between items-center transition-colors duration-200',
                  isSelected ? 'bg-[#0B2A4A]' : 'bg-[#BFF7EE]'
                )}
              >
                <span
                  className={cn(
                    'text-[16px] font-medium',
                    isSelected ? 'text-white' : 'text-[#0B2A4A]'
                  )}
                >
                  {plan.name}
                </span>
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-white bg-white/20' : 'border-[#0B2A4A]'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <div className="p-4 flex flex-col grow">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[30px] font-semibold text-[#000000]">${displayPrice}</span>
                  <span className="text-[12px] font-medium text-[#1DAA99]">{subPrice}</span>
                </div>
                <p className="text-[12px] font-medium text-[#000000]">{plan.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error prompt */}
      {planError && (
        <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-black">!</span>
          </div>
          <p className="text-red-600 text-sm font-medium">
            Please select a subscription plan to continue.
          </p>
        </div>
      )}

      {/* Buttons — Continue first on mobile */}
      <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-10">
        <Button
          onClick={onBack}
          className="w-full sm:w-[229px] h-[44px] rounded-[10px] bg-[#D9D9D9] hover:bg-gray-300 text-[#000000] font-bold border-none transition-all"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="w-full sm:w-[229px] h-[44px] rounded-[10px] bg-[#666666] hover:bg-black text-white font-bold transition-all"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step3Subscription;
