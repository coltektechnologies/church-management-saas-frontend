'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegistrationData } from './Step4Payment';

interface StepReviewProps {
  data: RegistrationData;
  onBack: () => void;
  onFinish: () => void | Promise<void>;
  loading?: boolean;
  /** When true, user must confirm summary then is sent to Paystack (paid plans). */
  requiresPayment?: boolean;
}

const Step5Review = ({
  data,
  onBack,
  onFinish,
  loading = false,
  requiresPayment = false,
}: StepReviewProps) => {
  const [agreed, setAgreed] = useState(false);

  const baseRows = [
    { label: 'Church Name', value: data.churchName },
    { label: 'Subdomain', value: data.subdomain ? `${data.subdomain}.opendoor.com` : '' },
    { label: 'Full Name', value: data.fullName },
    { label: 'Admin Email', value: data.adminEmail },
    {
      label: 'Primary Admin Role',
      value: data.roleLabel || (data.role ? '—' : ''),
    },
    { label: 'Subscription Plan', value: data.subscriptionPlan?.toUpperCase() },
  ];

  const paymentRow = requiresPayment
    ? [
        {
          label: 'Payment',
          value: 'Paystack (card, mobile money, bank) — after you confirm below',
        },
      ]
    : [];

  const reviewRows = [...baseRows, ...paymentRow];

  const handleSubmit = () => {
    if (!agreed) {
      return;
    }
    void onFinish();
  };

  const primaryLabel = requiresPayment
    ? loading
      ? 'Opening Paystack...'
      : 'Confirm & pay with Paystack'
    : loading
      ? 'Completing...'
      : 'Complete registration';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center w-full">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-[#2FC4B2] w-5 h-5" />
          <p className="text-sm font-bold text-[#0B2A4A] uppercase tracking-widest">Final Review</p>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {requiresPayment
            ? 'Check your details. When you confirm, you will be redirected to Paystack to complete payment securely.'
            : 'Check your details and complete registration. No payment is required for your plan.'}
        </p>

        {requiresPayment && (
          <div className="mb-6 flex gap-3 rounded-xl border border-[#2FC4B2]/40 bg-teal-50/50 px-4 py-3 text-sm text-[#0B2A4A]">
            <CreditCard className="w-5 h-5 shrink-0 text-[#2FC4B2]" />
            <p>
              <span className="font-bold">Paystack</span> handles card, mobile money, and bank
              options. You only leave this site after you click the button below.
            </p>
          </div>
        )}

        {/* Review Table */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-8 bg-white">
          {reviewRows.map((row, idx) => (
            <div
              key={row.label}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1 sm:gap-4 transition-colors hover:bg-gray-50/50',
                idx !== reviewRows.length - 1 && 'border-b border-gray-50'
              )}
            >
              <span className="w-32 shrink-0 text-[10px] font-black text-[#2FC4B2] uppercase tracking-tighter">
                {row.label}
              </span>
              <span className="text-[14px] font-semibold text-[#0B2A4A]">
                {row.value || <span className="text-gray-300 italic text-xs">Not provided</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Terms Checkbox */}
        <div className="flex gap-4 mb-10 p-4 bg-muted/20 rounded-xl border border-dashed border-gray-200">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1 border-[#2FC4B2] data-[state=checked]:bg-[#2FC4B2] h-5 w-5 rounded-md"
          />
          <label
            htmlFor="terms"
            className="text-[13px] leading-relaxed font-medium text-gray-600 cursor-pointer select-none"
          >
            I agree to the Open Door{' '}
            <span className="text-[#2FC4B2] underline cursor-pointer">Terms of Service</span> &{' '}
            <span className="text-[#2FC4B2] underline cursor-pointer">Privacy Policy</span>.
            {requiresPayment
              ? ' I authorise payment via Paystack for my selected plan.'
              : ' I understand that my subscription will automatically renew where applicable.'}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-[50px] rounded-xl border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all"
          >
            Back
          </Button>
          <Button
            disabled={!agreed || loading}
            onClick={handleSubmit}
            className="flex-[2] h-[50px] rounded-xl bg-[#0B2A4A] hover:bg-black text-white font-bold transition-all disabled:opacity-40 shadow-xl shadow-[#0B2A4A]/20"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step5Review;
