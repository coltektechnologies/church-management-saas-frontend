'use client';

import { useState } from 'react';
import {
  X,
  ImagePlus,
  Check,
  ChevronDown,
  Loader2,
  ShieldCheck,
  ChevronsUpDown,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

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
  bankName?: string;
}

interface Step4Props {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

/* --- Constants --- */
const planOptions = [
  { value: 'free', label: 'Start Free' },
  { value: 'basic', label: 'Basic ($14 per month)' },
  { value: 'premium', label: 'Premium ($20 per month)' },
  { value: 'enterprise', label: 'Enterprise ($30 per month)' },
];

const mobileProviders = ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'];
const bankOptions = ['GCB Bank', 'Ecobank', 'Stanbic Bank', 'Absa', 'Zenith Bank', 'Fidelity Bank'];

const paymentMethods = [
  { id: 'mobile_money', label: 'Mobile Money', description: 'MTN, Telecel, AirtelTigo' },
  { id: 'visa_mastercard', label: 'Visa / Mastercard', description: 'Credit or debit card' },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank payment' },
];

/* --- Main Component --- */
const Step4PaymentDetails = ({ data, onChange, onNext, onBack }: Step4Props) => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openBankList, setOpenBankList] = useState(false);

  const handleMethodClick = (methodId: string) => {
    onChange('paymentMethod', methodId);
    setActiveDialog(methodId);
  };

  // Triggered by "Pay now" inside the specific payment dialogs
  const handleInitiatePayment = () => {
    setShowConfirmPopup(true);
  };

  // Final confirmation logic
  const handleFinalConfirm = async () => {
    setShowConfirmPopup(false);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setActiveDialog(null);
      onNext(); // Proceed directly to Step 5
    }, 2000);
  };

  return (
    <div className="animate-fade-in w-full max-w-[492px] mx-auto">
      <h3 className="text-base font-semibold text-[#0B2A4A] mb-1">Step 4 of 5</h3>
      <p className="text-sm text-muted-foreground mb-8">Payment Details</p>

      <p className="text-base font-bold text-[#0B2A4A] mb-4">Select payment method*</p>

      <div className="flex flex-col gap-4">
        {paymentMethods.map((method) => {
          const isSelected = data.paymentMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodClick(method.id)}
              className={`flex items-center justify-between px-6 w-full h-[70px] rounded-[10px] border transition-all ${
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
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-white' : 'border-[#2FC4B2]'}`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-12">
        <button
          onClick={onBack}
          className="w-[229px] h-[44px] bg-[#D9D9D9] text-black rounded-[10px] font-bold text-sm"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="w-[229px] h-[44px] bg-[#666666] text-white rounded-[10px] font-bold text-sm"
        >
          Continue
        </button>
      </div>

      {/* Mobile Money Dialog */}
      {activeDialog === 'mobile_money' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[400px]"
        >
          <div className="flex flex-col gap-4">
            <Field label="Network provider*">
              <Select placeholder="Select network" options={mobileProviders} />
            </Field>
            <Field label="Mobile number*">
              <Input placeholder="+233 80 808 0808" />
            </Field>
            <Field label="Account name">
              <Input placeholder="Enter name" />
            </Field>
            <Field label="Subscription plan">
              <Select
                value={data.subscriptionPlan}
                onChange={(e: any) => onChange('subscriptionPlan', e.target.value)}
                rawOptions={planOptions}
              />
            </Field>
            <PayButton onClick={handleInitiatePayment} loading={isLoading} />
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* Visa/Mastercard Dialog */}
      {activeDialog === 'visa_mastercard' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[540px]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Card number*">
              <Input placeholder="080 808 080 000" />
            </Field>
            <Field label="Cardholder name">
              <Input placeholder="Enter name" />
            </Field>
            <Field label="Expiry date*">
              <Input placeholder="MM/YY" />
            </Field>
            <Field label="Billing country">
              <Select placeholder="Country" options={['Ghana', 'Nigeria', 'UK', 'USA']} />
            </Field>
            <Field label="CVV">
              <Input placeholder="080" />
            </Field>
            <Field label="Subscription plan">
              <Select
                value={data.subscriptionPlan}
                onChange={(e: any) => onChange('subscriptionPlan', e.target.value)}
                rawOptions={planOptions}
              />
            </Field>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <PayButton
              onClick={handleInitiatePayment}
              loading={isLoading}
              className="max-w-[320px]"
            />
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* Bank Transfer Dialog */}
      {activeDialog === 'bank_transfer' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[440px]"
        >
          <div className="flex flex-col gap-4">
            <Field label="Bank name*">
              <Popover open={openBankList} onOpenChange={setOpenBankList}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-between font-normal border-[#2FC4B2] rounded-[10px] text-[#0B2A4A]"
                  >
                    {data.bankName || 'Select or type bank name...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search or type your bank..."
                      onValueChange={(val) => onChange('bankName', val)}
                    />
                    <CommandList>
                      <CommandEmpty>Press enter to use "{data.bankName}"</CommandEmpty>
                      <CommandGroup>
                        {bankOptions.map((bank) => (
                          <CommandItem
                            key={bank}
                            onSelect={() => {
                              onChange('bankName', bank);
                              setOpenBankList(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                data.bankName === bank ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {bank}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
            <Field label="Account number*">
              <Input placeholder="000 000 000 000" />
            </Field>
            <Field label="Transaction reference">
              <Input placeholder="Reference" />
            </Field>
            <Field label="Subscription plan">
              <Select
                value={data.subscriptionPlan}
                onChange={(e: any) => onChange('subscriptionPlan', e.target.value)}
                rawOptions={planOptions}
              />
            </Field>
            <Field label="Upload Receipt">
              <label className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-[10px] border border-dashed border-[#2FC4B2] cursor-pointer hover:bg-teal-50/20 transition-all">
                <ImagePlus className="w-10 h-10 text-[#2FC4B2]" />
                <span className="text-[13px] text-[#2FC4B2] font-medium">
                  Click to upload receipt
                </span>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </Field>
            <PayButton onClick={handleInitiatePayment} loading={isLoading} />
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* Confirmation Review Popup (from Code A) */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-[400px] w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-[#0B2A4A]">
              <AlertCircle className="text-[#2FC4B2]" />
              <h3 className="text-lg font-bold">Confirm Your Details</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Church:</span>
                <span className="font-semibold">{data.churchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan:</span>
                <span className="font-semibold capitalize text-[#2FC4B2]">
                  {data.subscriptionPlan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-semibold capitalize">
                  {data.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6 text-center">
              By clicking "Confirm", you agree to authorize the payment for this subscription.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 h-11 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={handleFinalConfirm}
                className="flex-1 h-11 bg-[#0B2A4A] text-white rounded-lg font-bold text-sm hover:bg-black"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- UI Sub-components --- */
const DialogContainer = ({ onClose, title, children, width }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
    <div
      className={`bg-white rounded-[20px] shadow-2xl relative flex flex-col max-h-[95vh] w-full ${width}`}
    >
      <div className="p-6 pb-0">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400"
        >
          <X size={16} />
        </button>
        <h3 className="text-xl font-bold text-[#0B2A4A] text-center mb-6">{title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">{children}</div>
    </div>
  </div>
);

const EncryptionFooter = () => (
  <div className="flex items-center justify-center gap-2 text-gray-400 text-[12px] mt-4 pb-2">
    <ShieldCheck size={16} />
    <span>All your data are encrypted</span>
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

const Select = ({ placeholder, options, value, onChange, rawOptions }: any) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full h-11 px-4 rounded-[10px] border border-[#2FC4B2] text-sm outline-none appearance-none bg-white text-[#0B2A4A]"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {rawOptions
        ? rawOptions.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : options.map((opt: string) => (
            <option key={opt} value={opt}>
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

const PayButton = ({ onClick, loading, className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full h-12 bg-[#666666] text-white rounded-[10px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors ${className}`}
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
