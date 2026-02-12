'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Smartphone, CreditCard, Building2 } from 'lucide-react';

/* * StepPayment - Step 4: Payment Details
 * Radio-style selection of payment method: Mobile Money, Visa/Mastercard, Bank Transfer
 */
interface StepPaymentProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const paymentMethods = [
  { id: 'mobile-money', label: 'Mobile Money', icon: Smartphone },
  { id: 'visa-mastercard', label: 'Visa/Mastercard', icon: CreditCard },
  { id: 'bank-transfer', label: 'Bank Transfer', icon: Building2 },
];

const StepPayment = ({ data, onChange, onNext, onBack }: StepPaymentProps) => {
  const selectedMethod = data.paymentMethod || '';

  const styles = {
    methodCard: (selected: boolean) =>
      cn(
        'flex items-center justify-between p-5 rounded-2xl border-2 transition-all w-full group',
        selected ? 'border-[#2FC4B2] bg-[#2FC4B2]/5' : 'border-gray-100 hover:border-gray-200'
      ),
    label: 'text-[15px] font-semibold text-gray-800',
    radio: (selected: boolean) =>
      cn(
        'w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
        selected ? 'border-[#2FC4B2]' : 'border-gray-300'
      ),
    radioInner: 'w-2.5 h-2.5 bg-[#2FC4B2] rounded-full',
  };

  return (
    <div className="animate-in fade-in duration-500">
      <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
        Select payment method*
      </p>

      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onChange('paymentMethod', method.id)}
              className={styles.methodCard(isSelected)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <method.icon size={20} className="text-gray-600" />
                </div>
                <span className={styles.label}>{method.label}</span>
              </div>
              <div className={styles.radio(isSelected)}>
                {isSelected && <div className={styles.radioInner} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-4 pt-10">
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

export default Step4Payment;
