'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepReviewProps {
  data: Record<string, string>;
  onBack: () => void;
  onFinish: () => void; // Call this to trigger your pre-quick setup
}

const Step5Review = ({ data, onBack, onFinish }: StepReviewProps) => {
  const [agreed, setAgreed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reviewRows = [
    { label: 'Church Name', value: data.churchName },
    { label: 'Subdomain', value: data.subdomain ? `${data.subdomain}.opendoor.com` : '' },
    { label: 'Full Name', value: data.fullName },
    { label: 'Admin Email', value: data.adminEmail },
    { label: 'Primary Admin Role', value: data.role },
    { label: 'Subscription Plan', value: data.subscriptionPlan?.toUpperCase() },
    { label: 'Payment Method', value: data.paymentMethod?.split('_').join(' ').toUpperCase() },
  ];

  const handleSubmit = () => {
    if (!agreed) {
      return;
    }
    // Trigger Success Modal
    setIsSuccess(true);
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col items-center">
      <div className="w-full max-w-[492px]">
        <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          Review your information
        </p>

        {/* Review Table */}
        <div className="rounded-[10px] border border-gray-100 overflow-hidden shadow-sm mb-8">
          {reviewRows.map((row, idx) => (
            <div
              key={idx}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1 sm:gap-4',
                idx !== reviewRows.length - 1 && 'border-b border-gray-50'
              )}
            >
              <span className="w-32 shrink-0 text-[10px] font-bold text-[#2FC4B2] uppercase">
                {row.label}
              </span>
              <span className="text-[14px] font-medium text-gray-800">{row.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Terms Checkbox */}
        <div className="flex gap-3 mb-10 w-[465px] h-[42px]">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1 border-[#2FC4B2] data-[state=checked]:bg-[#2FC4B2]"
          />
          <label
            htmlFor="terms"
            className="text-[14px] leading-[100%] font-medium font-poppins text-gray-700 cursor-pointer"
          >
            I agree to the Open Door Terms & Privacy Policy and acknowledge that paid plans will
            renew monthly unless cancelled.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-[229px] h-[44px] rounded-[10px] border-gray-200 text-gray-600 font-bold"
          >
            Back
          </Button>
          <Button
            disabled={!agreed}
            onClick={handleSubmit}
            className="w-[229px] h-[44px] rounded-[10px] bg-[#666666] hover:bg-black text-white font-bold transition-all disabled:opacity-50"
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[20px] p-10 max-w-[400px] w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-[#0B2A4A] flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white stroke-[3px]" />
            </div>
            <h3 className="text-[24px] font-bold text-[#0B2A4A] mb-8 font-poppins">
              Registration Successful
            </h3>
            <Button
              onClick={onFinish}
              className="w-full h-[50px] bg-[#666666] hover:bg-black text-white rounded-full font-bold text-lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Review;
