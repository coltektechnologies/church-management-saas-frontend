'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* * StepReview - Step 5: Review & Submit
 * Shows a summary table of all collected info before submission
 */
interface StepReviewProps {
  data: Record<string, string>;
  onBack: () => void;
  onSubmit: () => void;
}

const Step5Review = ({ data, onBack, onSubmit }: StepReviewProps) => {
  const reviewRows = [
    { label: 'Church Name', value: data.churchName },
    { label: 'Subdomain', value: data.subdomain ? `${data.subdomain}.opendoor.com` : '' },
    { label: 'Full Name', value: data.fullName },
    { label: 'Admin Email', value: data.adminEmail },
    { label: 'Primary Admin Role', value: data.role },
    { label: 'Subscription Plan', value: data.subscriptionPlan?.toUpperCase() },
    { label: 'Billing Cycle', value: data.billing?.toUpperCase() },
    { label: 'Payment Method', value: data.paymentMethod?.split('-').join(' ').toUpperCase() },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
        Review your information
      </p>

      <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {reviewRows.map((row, idx) => (
          <div
            key={idx}
            className={cn(
              'flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1 sm:gap-4',
              idx !== reviewRows.length - 1 && 'border-b border-gray-50'
            )}
          >
            <span className="w-48 shrink-0 text-xs font-bold text-[#2FC4B2] uppercase">
              {row.label}
            </span>
            <span className="text-[15px] font-medium text-gray-800">{row.value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-10">
        <Button variant="outline" onClick={onBack} className="rounded-full px-8">
          Back
        </Button>
        <Button
          onClick={onSubmit}
          className="rounded-full px-12 bg-[#2FC4B2] hover:bg-[#28b1a1] text-white font-bold h-12"
        >
          Complete Registration
        </Button>
      </div>
    </div>
  );
};

export default Step5Review;
