'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegistrationData } from './Step4Payment';
import Link from 'next/link';

interface StepReviewProps {
  data: RegistrationData;
  onBack: () => void;
  onFinish: () => void;
}

const Step5Review = ({ data, onBack, onFinish }: StepReviewProps) => {
  const [agreed, setAgreed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mapping the data for a clean display
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
    setIsSuccess(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center w-full">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-[#2FC4B2] w-5 h-5" />
          <p className="text-sm font-bold text-[#0B2A4A] uppercase tracking-widest">Final Review</p>
        </div>

        {/* Review Table */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-8 bg-white">
          {reviewRows.map((row, idx) => (
            <div
              key={idx}
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
            <span className="text-[#2FC4B2] underline cursor-pointer">Privacy Policy</span>. I
            understand that my subscription will automatically renew.
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
            disabled={!agreed}
            onClick={handleSubmit}
            className="flex-[2] h-[50px] rounded-xl bg-[#0B2A4A] hover:bg-black text-white font-bold transition-all disabled:opacity-40 shadow-xl shadow-[#0B2A4A]/20"
          >
            Complete Registration
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2A4A]/70 backdrop-blur-md px-4">
          <div className="bg-white rounded-[32px] p-10 max-w-[440px] w-full text-center shadow-2xl animate-in zoom-in-90 duration-300 border border-white/20">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#2FC4B2]/20 rounded-full animate-ping opacity-25" />
              <div className="relative w-24 h-24 rounded-full bg-[#2FC4B2]/10 flex items-center justify-center mx-auto">
                <Check className="w-12 h-12 text-[#2FC4B2] stroke-[4px]" />
              </div>
            </div>

            <h3 className="text-[28px] font-black text-[#0B2A4A] mb-3 leading-tight">
              Welcome Aboard!
            </h3>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed px-4">
              Your account is ready. Let&apos;s take a quick moment to personalize your church
              workspace settings.
            </p>

            <div className="space-y-4">
              <Link href="/QuickSetupPage" className="w-full block">
                <Button
                  onClick={onFinish}
                  className="w-full h-[60px] bg-[#0B2A4A] hover:bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 group transition-all shadow-xl shadow-[#0B2A4A]/30 active:scale-[0.98]"
                >
                  Start Quick Setup
                  <Sparkles
                    size={22}
                    className="group-hover:rotate-12 transition-transform text-[#2FC4B2]"
                  />
                </Button>
              </Link>

              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full py-2 text-[11px] font-black text-gray-400 uppercase tracking-[2px] hover:text-[#0B2A4A] transition-colors flex items-center justify-center gap-2"
              >
                Skip to Dashboard <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Review;
