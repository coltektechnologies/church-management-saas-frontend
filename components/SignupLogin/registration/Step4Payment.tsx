'use client';

import { useState } from 'react';
import { X, ImagePlus, ShieldCheck, Check, ChevronDown, Loader2 } from 'lucide-react';

/* --- Interfaces --- */
export interface RegistrationData {
  churchName: string;
  churchEmail: string;
  subdomain?: string;
  fullName: string;
  adminEmail: string;
  role: string;
  subscriptionPlan: string;
  paymentMethod: string;
}

interface Step4Props {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

/* --- Constants --- */
const planLabels: Record<string, string> = {
  free: 'Start Free',
  basic: 'Basic ($14 per month)',
  premium: 'Premium ($20 per month)',
  enterprise: 'Enterprise ($30 per month)',
};

const mobileProviders = ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'];

const paymentMethods = [
  { id: 'mobile_money', label: 'Mobile Money', description: 'MTN, Telecel, AirtelTigo' },
  { id: 'visa_mastercard', label: 'Visa / Mastercard', description: 'Credit or debit card' },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank payment' },
];

/* --- Main Component --- */
const Step4PaymentDetails = ({ data, onChange, onNext, onBack }: Step4Props) => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodClick = (methodId: string) => {
    onChange('paymentMethod', methodId);
    setActiveDialog(methodId);
  };

  const handlePay = async () => {
    setIsLoading(true);

    /* ============================================================
        INSERT YOUR API ROUTE HERE 
        Example: 
        const response = await fetch('/api/payments/process', {
          method: 'POST',
          body: JSON.stringify({ 
            method: data.paymentMethod, 
            plan: data.subscriptionPlan,
            email: data.churchEmail 
          }),
        });
        if (response.ok) { ... }
        ============================================================ */

    setTimeout(() => {
      setIsLoading(false);
      setActiveDialog(null);
      setShowSuccess(true);
    }, 1500);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onNext();
  };

  return (
    <div className="animate-fade-in w-full max-w-[492px] mx-auto">
      <h3 className="text-base font-semibold text-[#0B2A4A] mb-1">Step 4 of 5</h3>
      <p className="text-sm text-muted-foreground mb-8">Payment Details</p>

      <p className="text-base font-bold text-[#0B2A4A] mb-4">Select payment method*</p>

      {/* Payment Selection Cards */}
      <div className="flex flex-col gap-4">
        {paymentMethods.map((method) => {
          const isSelected = data.paymentMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodClick(method.id)}
              style={{ width: '100%', maxWidth: '492px', height: '70px' }}
              className={`flex items-center justify-between px-6 rounded-[10px] border-2 transition-all ${
                isSelected
                  ? 'bg-[#0B2A4A] border-[#2FC4B2] text-white'
                  : 'bg-transparent border-[#2FC4B2] text-[#0B2A4A] hover:bg-teal-50/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <PaymentMethodIcon methodId={method.id} isSelected={isSelected} />
                <div className="text-left">
                  <span className="block text-[16px] font-bold leading-tight">{method.label}</span>
                  <span className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                    {method.description}
                  </span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-white' : 'border-[#2FC4B2]'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Navigation */}
      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="bg-[#D9D9D9] text-black px-12 py-3 rounded-[10px] font-bold text-sm min-w-[140px] hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-[#666666] text-white px-12 py-3 rounded-[10px] font-bold text-sm min-w-[140px] hover:bg-[#555555] transition-colors"
        >
          Continue
        </button>
      </div>

      {/* --- Dialogs --- */}
      {activeDialog === 'mobile_money' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[400px]"
        >
          <div className="flex flex-col gap-4">
            <Field label="Network provider*">
              <Select placeholder="Select your network" options={mobileProviders} />
            </Field>
            <Field label="Mobile number*">
              <Input placeholder="+233 80 808 0808" />
            </Field>
            <Field label="Account name">
              <Input placeholder="Enter your account name" />
            </Field>
            <Field label="Subscription plan">
              <ReadOnly value={planLabels[data.subscriptionPlan] || 'Basic ($14 per month)'} />
            </Field>
            <PayButton onClick={handlePay} loading={isLoading} />
          </div>
        </DialogContainer>
      )}

      {activeDialog === 'visa_mastercard' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[540px]"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Card number*">
              <Input placeholder="080 808 080 000" />
            </Field>
            <Field label="Cardholder name">
              <Input placeholder="Enter cardholder name" />
            </Field>
            <Field label="Expiry date*">
              <Input placeholder="MM/YY" />
            </Field>
            <Field label="Billing country">
              <Select
                placeholder="Select your country"
                options={['Ghana', 'Nigeria', 'UK', 'USA']}
              />
            </Field>
            <Field label="CVV">
              <Input placeholder="080" />
            </Field>
            <Field label="Subscription plan">
              <ReadOnly value={planLabels[data.subscriptionPlan] || 'Basic ($14 per month)'} />
            </Field>
          </div>
          <div className="mt-8 flex justify-center">
            <PayButton onClick={handlePay} loading={isLoading} className="max-w-[320px]" />
          </div>
        </DialogContainer>
      )}

      {activeDialog === 'bank_transfer' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[420px]"
        >
          <div className="flex flex-col gap-4">
            <Field label="Bank name*">
              <Select
                placeholder="Select your bank"
                options={['GCB Bank', 'Ecobank', 'Stanbic Bank', 'Absa']}
              />
            </Field>
            <Field label="Account number*">
              <Input placeholder="000 000 000 000" />
            </Field>
            <Field label="Transaction reference">
              <Input placeholder="Enter transaction reference" />
            </Field>
            <Field label="Subscription plan">
              <ReadOnly value={planLabels[data.subscriptionPlan] || 'Basic ($14 per month)'} />
            </Field>
            <Field label="Upload Receipt">
              <label className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-[10px] border-2 border-dashed border-[#2FC4B2] cursor-pointer hover:bg-teal-50/50 transition-colors">
                <ImagePlus className="w-8 h-8 text-[#2FC4B2]" />
                <span className="text-[12px] text-[#2FC4B2] font-medium">
                  Click to upload receipt
                </span>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </Field>
            <PayButton onClick={handlePay} loading={isLoading} />
          </div>
        </DialogContainer>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[10px] p-12 max-w-[380px] w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-[#0B2A4A] flex items-center justify-center mx-auto mb-8">
              <Check className="w-10 h-10 text-white stroke-[4px]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0B2A4A] mb-8">Payment Successful</h3>
            <button
              onClick={handleSuccessContinue}
              className="bg-[#666666] text-white w-full py-3 rounded-[10px] font-bold text-sm hover:bg-[#555555] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- UI Sub-components --- */
const DialogContainer = ({ onClose, title, children, width }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] px-4">
    <div
      className={`bg-white rounded-[10px] p-10 w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${width}`}
    >
      <button
        onClick={onClose}
        className="absolute left-6 top-6 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
      >
        <X size={16} />
      </button>
      <h3 className="text-xl font-bold text-[#0B2A4A] text-center mb-8">{title}</h3>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-bold text-[#0B2A4A]">{label}</label>
    {children}
  </div>
);

const Input = (props: any) => (
  <input
    {...props}
    className="w-full h-11 px-4 rounded-[10px] border border-[#2FC4B2] text-sm outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-[#2FC4B2]"
  />
);

const Select = ({ placeholder, options }: any) => (
  <div className="relative">
    <select className="w-full h-11 px-4 rounded-[10px] border border-[#2FC4B2] text-sm outline-none appearance-none bg-white text-gray-500 cursor-pointer">
      <option value="" disabled selected>
        {placeholder}
      </option>
      {options.map((opt: string) => (
        <option key={opt} value={opt} className="text-[#0B2A4A]">
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2FC4B2] pointer-events-none"
      size={18}
    />
  </div>
);

const ReadOnly = ({ value }: { value: string }) => (
  <div className="w-full h-11 px-4 rounded-[10px] border border-[#2FC4B2] bg-gray-50 flex items-center text-sm text-[#0B2A4A] font-medium">
    {value}
  </div>
);

const PayButton = ({ onClick, loading, className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full h-12 bg-[#666666] text-white rounded-[10px] font-bold text-sm mt-2 hover:bg-[#555555] transition-colors flex items-center justify-center gap-2 ${className} disabled:opacity-70`}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {loading ? 'Processing...' : 'Pay now'}
  </button>
);

const PaymentMethodIcon = ({ methodId, isSelected }: { methodId: string; isSelected: boolean }) => {
  if (methodId === 'mobile_money') {
    return (
      <div className="flex -space-x-1">
        <div className="w-7 h-7 rounded-full bg-[#FFCC00] flex items-center justify-center text-[10px] font-black text-black border-2 border-white">
          M
        </div>
        <div className="w-7 h-7 rounded-full bg-[#E4002B] flex items-center justify-center text-[10px] font-black text-white border-2 border-white">
          T
        </div>
      </div>
    );
  }
  if (methodId === 'visa_mastercard') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="bg-[#1A1F71] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[4px]">
          VISA
        </div>
        <div className="bg-[#EB001B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[4px]">
          MC
        </div>
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-[10px] bg-gray-100 flex items-center justify-center">
      <Check size={14} className="text-[#0B2A4A]" />
    </div>
  );
};

export default Step4PaymentDetails;
