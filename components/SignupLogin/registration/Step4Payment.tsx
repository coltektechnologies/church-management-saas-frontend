'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Check,
  ChevronDown,
  Loader2,
  ShieldCheck,
  ChevronsUpDown,
  AlertCircle,
  FileText,
  Trash2,
  Upload,
  Info,
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

export interface RegistrationData {
  churchName: string;
  churchEmail: string;
  subdomain?: string;
  country?: string;
  regionCity?: string;
  address?: string;
  denomination?: string;
  churchSize?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  adminEmail: string;
  role: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  subscriptionPlan: string;
  billing?: string;
  paymentMethod: string;
  bankName?: string;
  paymentCompleted?: boolean;
}

interface Step4Props {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean; // ← added: passed from signup.tsx, used to disable Continue while submitting
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

const planOptions = [
  { value: 'free', label: 'Start Free' },
  { value: 'basic', label: 'Basic (₵14 per month)' },
  { value: 'premium', label: 'Premium (₵20 per month)' },
  { value: 'enterprise', label: 'Enterprise (₵30 per month)' },
];

const mobileProviders = ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'];
const bankOptions = ['GCB Bank', 'Ecobank', 'Stanbic Bank', 'Absa', 'Zenith Bank', 'Fidelity Bank'];

const paymentMethods = [
  {
    id: 'paystack',
    label: 'Paystack',
    description: 'Card, mobile money & bank — secure checkout (Ghana)',
  },
  { id: 'mobile_money', label: 'Mobile Money', description: 'MTN, Telecel, AirtelTigo (manual)' },
  {
    id: 'visa_mastercard',
    label: 'Visa / Mastercard',
    description: 'Credit or debit card (manual)',
  },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank payment (manual)' },
];

const Step4PaymentDetails = ({ data, onChange, onNext, onBack, loading }: Step4Props) => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openBankList, setOpenBankList] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [continueError, setContinueError] = useState('');

  const [mobileProvider, setMobileProvider] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileAccountName, setMobileAccountName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCountry, setCardCountry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [payErrors, setPayErrors] = useState<Record<string, string>>({});
  const [payErrorSummary, setPayErrorSummary] = useState('');

  const handleMethodClick = (methodId: string) => {
    if (data.paymentMethod === methodId) {
      onChange('paymentMethod', '');
      setActiveDialog(null);
    } else {
      onChange('paymentMethod', methodId);
      setActiveDialog(methodId);
    }
    setPayErrors({});
    setPayErrorSummary('');
    setContinueError('');
  };

  const validateAndPay = () => {
    const errs: Record<string, string> = {};

    if (activeDialog === 'mobile_money') {
      if (!mobileProvider) {
        errs.mobileProvider = 'Required';
      }
      if (!mobileNumber.trim()) {
        errs.mobileNumber = 'Required';
      }
      if (!mobileAccountName.trim()) {
        errs.mobileAccountName = 'Required';
      }
      if (!data.subscriptionPlan) {
        errs.subscriptionPlan = 'Required';
      }
    }
    if (activeDialog === 'visa_mastercard') {
      if (!cardNumber.trim()) {
        errs.cardNumber = 'Required';
      }
      if (!cardHolder.trim()) {
        errs.cardHolder = 'Required';
      }
      if (!cardExpiry.trim()) {
        errs.cardExpiry = 'Required';
      }
      if (!cardCountry) {
        errs.cardCountry = 'Required';
      }
      if (!cardCvv.trim()) {
        errs.cardCvv = 'Required';
      }
      if (!data.subscriptionPlan) {
        errs.subscriptionPlan = 'Required';
      }
    }
    if (activeDialog === 'bank_transfer') {
      if (!data.bankName) {
        errs.bankName = 'Required';
      }
      if (!bankAccountNumber.trim()) {
        errs.bankAccountNumber = 'Required';
      }
      if (!data.subscriptionPlan) {
        errs.subscriptionPlan = 'Required';
      }
    }
    setPayErrors(errs);

    if (Object.keys(errs).length > 0) {
      const count = Object.keys(errs).length;
      setPayErrorSummary(
        `${count} required field${count > 1 ? 's' : ''} missing — please fill them in before paying.`
      );
      return;
    }

    setPayErrorSummary('');
    setShowConfirmPopup(true);
  };

  /** Paystack: no fake card/MoMo fields — gateway handles payment after review (step 5). */
  const confirmPaystackSelection = () => {
    if (!data.subscriptionPlan) {
      setPayErrors({ subscriptionPlan: 'Required' });
      setPayErrorSummary('Choose a subscription plan in step 3 first.');
      return;
    }
    setPayErrors({});
    setPayErrorSummary('');
    onChange('paymentMethod', 'paystack');
    onChange('paymentCompleted' as keyof RegistrationData, 'true');
    setActiveDialog(null);
    setContinueError('');
  };

  const handleFinalConfirm = async () => {
    setShowConfirmPopup(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveDialog(null);
      onChange('paymentMethod', data.paymentMethod);
      onChange('paymentCompleted' as keyof RegistrationData, 'true');
      setContinueError('');
    }, 2000);
  };

  const handleContinue = () => {
    if (!data.paymentCompleted) {
      if (!data.paymentMethod) {
        setContinueError('Please select a payment method and complete payment before continuing.');
      } else {
        setContinueError('Please complete the payment process before continuing.');
      }
      return;
    }
    onNext();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleRemoveAll = () => {
    uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setUploadedFiles([]);
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
                <PaymentMethodIcon methodId={method.id} />
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

      {/* Payment completed badge */}
      {data.paymentCompleted && (
        <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-[10px] px-4 py-3">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" />
          </div>
          <p className="text-green-700 text-sm font-semibold">
            Payment completed! You can continue.
          </p>
        </div>
      )}

      {/* Continue error */}
      {continueError && !data.paymentCompleted && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm font-medium">{continueError}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 mt-12">
        <button
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-[229px] h-[44px] bg-[#D9D9D9] text-black rounded-[10px] font-bold text-sm disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={loading}
          className={`w-full sm:w-[229px] h-[44px] rounded-[10px] font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            data.paymentCompleted
              ? 'bg-[#0B2A4A] text-white hover:bg-black disabled:opacity-50'
              : 'bg-[#666666] text-white cursor-pointer'
          }`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </div>

      {/* ── Paystack (real gateway — checkout opens after step 5 submit) ── */}
      {activeDialog === 'paystack' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Pay with Paystack"
          width="max-w-[440px]"
        >
          {payErrorSummary && <ErrorBanner msg={payErrorSummary} />}
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#4A5568] leading-relaxed">
              Subscriptions are collected through{' '}
              <strong className="text-[#0B2A4A]">Paystack</strong>. After you review your details on
              the next step and click <strong>Complete Registration</strong>, you will be redirected
              to Paystack to pay with a <strong>bank card</strong>, <strong>mobile money</strong>,
              or other methods Paystack offers for your plan.
            </p>
            <div className="rounded-[10px] border border-[#2FC4B2]/40 bg-teal-50/40 px-4 py-3 text-[12px] text-[#0B2A4A]">
              <p className="font-bold mb-1">Selected plan</p>
              <p className="text-muted-foreground">
                {data.subscriptionPlan
                  ? data.subscriptionPlan.replace(/_/g, ' ').toUpperCase()
                  : 'None — go back to step 3'}
              </p>
            </div>
            {payErrors.subscriptionPlan && <Err msg={payErrors.subscriptionPlan} />}
            <button
              type="button"
              onClick={confirmPaystackSelection}
              className="w-full h-12 bg-[#0B2A4A] text-white rounded-[10px] font-bold text-sm hover:bg-black transition-colors"
            >
              Continue — I’ll pay on Paystack after review
            </button>
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* ── Mobile Money Dialog ── */}
      {activeDialog === 'mobile_money' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[400px]"
        >
          {payErrorSummary && <ErrorBanner msg={payErrorSummary} />}
          <div className="flex flex-col gap-4">
            <Field label="Network provider*">
              <Select
                placeholder="Select network"
                options={mobileProviders}
                value={mobileProvider}
                onChange={(e) => setMobileProvider(e.target.value)}
              />
              {payErrors.mobileProvider && <Err msg={payErrors.mobileProvider} />}
            </Field>
            <Field label="Mobile number*">
              <Input
                placeholder="+233 80 808 0808"
                value={mobileNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMobileNumber(e.target.value)
                }
              />
              {payErrors.mobileNumber && <Err msg={payErrors.mobileNumber} />}
            </Field>
            <Field label="Account name*">
              <Input
                placeholder="Enter name"
                value={mobileAccountName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMobileAccountName(e.target.value)
                }
              />
              {payErrors.mobileAccountName && <Err msg={payErrors.mobileAccountName} />}
            </Field>
            <Field label="Subscription plan*">
              <Select
                value={data.subscriptionPlan}
                rawOptions={planOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onChange('subscriptionPlan', e.target.value)
                }
              />
              {payErrors.subscriptionPlan && <Err msg={payErrors.subscriptionPlan} />}
            </Field>
            <PayButton onClick={validateAndPay} loading={isLoading} />
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* ── Visa/Mastercard Dialog ── */}
      {activeDialog === 'visa_mastercard' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[540px]"
        >
          {payErrorSummary && <ErrorBanner msg={payErrorSummary} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Card number*">
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardNumber(e.target.value)}
              />
              {payErrors.cardNumber && <Err msg={payErrors.cardNumber} />}
            </Field>
            <Field label="Cardholder name*">
              <Input
                placeholder="Enter name"
                value={cardHolder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardHolder(e.target.value)}
              />
              {payErrors.cardHolder && <Err msg={payErrors.cardHolder} />}
            </Field>
            <Field label="Expiry date*">
              <Input
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardExpiry(e.target.value)}
              />
              {payErrors.cardExpiry && <Err msg={payErrors.cardExpiry} />}
            </Field>
            <Field label="Billing country*">
              <Select
                placeholder="Country"
                options={['Ghana', 'Nigeria', 'UK', 'USA']}
                value={cardCountry}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCardCountry(e.target.value)
                }
              />
              {payErrors.cardCountry && <Err msg={payErrors.cardCountry} />}
            </Field>
            <Field label="CVV*">
              <Input
                placeholder="000"
                value={cardCvv}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardCvv(e.target.value)}
              />
              {payErrors.cardCvv && <Err msg={payErrors.cardCvv} />}
            </Field>
            <Field label="Subscription plan*">
              <Select
                value={data.subscriptionPlan}
                rawOptions={planOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onChange('subscriptionPlan', e.target.value)
                }
              />
              {payErrors.subscriptionPlan && <Err msg={payErrors.subscriptionPlan} />}
            </Field>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <PayButton onClick={validateAndPay} loading={isLoading} className="max-w-[320px]" />
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* ── Bank Transfer Dialog ── */}
      {activeDialog === 'bank_transfer' && (
        <DialogContainer
          onClose={() => setActiveDialog(null)}
          title="Payment Details"
          width="max-w-[440px]"
        >
          {payErrorSummary && <ErrorBanner msg={payErrorSummary} />}
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
                      <CommandEmpty>Press enter to use &quot;{data.bankName}&quot;</CommandEmpty>
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
              {payErrors.bankName && <Err msg={payErrors.bankName} />}
            </Field>
            <Field label="Account number*">
              <Input
                placeholder="000 000 000 000"
                value={bankAccountNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBankAccountNumber(e.target.value)
                }
              />
              {payErrors.bankAccountNumber && <Err msg={payErrors.bankAccountNumber} />}
            </Field>
            <Field label="Transaction reference">
              <Input
                placeholder="Reference (optional)"
                value={bankRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankRef(e.target.value)}
              />
            </Field>
            <Field label="Subscription plan*">
              <Select
                value={data.subscriptionPlan}
                rawOptions={planOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onChange('subscriptionPlan', e.target.value)
                }
              />
              {payErrors.subscriptionPlan && <Err msg={payErrors.subscriptionPlan} />}
            </Field>
            <Field label="Upload Receipt">
              <label
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 w-full rounded-[10px] border-2 border-dashed border-[#2FC4B2] cursor-pointer hover:bg-teal-50/20 transition-all',
                  uploadedFiles.length === 0 ? 'py-6' : 'py-3'
                )}
              >
                <Upload className="w-6 h-6 text-[#2FC4B2]" />
                {uploadedFiles.length === 0 ? (
                  <>
                    <span className="text-[12px] text-[#2FC4B2] font-semibold">
                      Click to upload image or PDF
                    </span>
                    <span className="text-[10px] text-gray-400">
                      PNG, JPG, PDF · Multiple files allowed
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[12px] text-[#2FC4B2] font-semibold">Add more files</span>
                    <span className="inline-flex items-center gap-1 bg-[#2FC4B2]/10 text-[#2FC4B2] text-[11px] font-bold px-3 py-0.5 rounded-full border border-[#2FC4B2]/30">
                      {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}{' '}
                      uploaded
                    </span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFileUpload}
                />
              </label>
              {uploadedFiles.length > 0 && (
                <div className="mt-2 rounded-[10px] border border-[#2FC4B2]/30 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-[#0B2A4A]">
                      {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveAll}
                      className="text-[10px] text-red-400 hover:text-red-600 font-semibold"
                    >
                      Remove all
                    </button>
                  </div>
                  <div
                    className={cn(
                      'flex flex-col divide-y divide-gray-100',
                      uploadedFiles.length > 4 && 'max-h-[240px] overflow-y-auto'
                    )}
                  >
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-gray-50"
                      >
                        {file.type === 'application/pdf' ? (
                          <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                        ) : (
                          <div className="relative w-11 h-11 rounded-lg border border-gray-200 shrink-0 overflow-hidden">
                            <Image
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#0B2A4A] truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {file.type === 'application/pdf' ? 'PDF Document' : 'Image'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Field>
            <PayButton onClick={validateAndPay} loading={isLoading} />
            <EncryptionFooter />
          </div>
        </DialogContainer>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-[420px] w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-[#0B2A4A]">
              <AlertCircle className="text-[#2FC4B2]" />
              <h3 className="text-lg font-bold">Confirm Your Details</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 mb-6 space-y-3 text-sm">
              {[
                { label: 'Church', value: data.churchName },
                { label: 'Username', value: data.username || 'Not set' },
                { label: 'Email', value: data.adminEmail },
                { label: 'Phone', value: data.phone || 'Not set' },
                { label: 'Role', value: data.role },
                { label: 'Plan', value: data.subscriptionPlan?.toUpperCase() },
                {
                  label: 'Method',
                  value:
                    data.paymentMethod === 'paystack'
                      ? 'Paystack'
                      : data.paymentMethod.replace(/_/g, ' '),
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={cn(
                    'flex justify-between pb-2',
                    i < arr.length - 1 && 'border-b border-gray-100'
                  )}
                >
                  <span className="text-gray-500">{row.label}:</span>
                  <span
                    className={cn(
                      'font-semibold capitalize',
                      row.label === 'Plan' && 'text-[#2FC4B2]'
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mb-6 text-center leading-relaxed">
              By clicking &quot;Confirm &amp; Pay&quot;, you agree to authorize the selected payment
              method for this subscription.
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
                className="flex-1 h-11 bg-[#0B2A4A] text-white rounded-lg font-bold text-sm hover:bg-black active:scale-[0.98]"
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

/* ── Sub-components ── */
const ErrorBanner = ({ msg }: { msg: string }) => (
  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
    <Info size={15} className="text-red-500 shrink-0 mt-0.5" />
    <p className="text-red-600 text-[12px] font-semibold">{msg}</p>
  </div>
);

const DialogContainer = ({
  onClose,
  title,
  children,
  width,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width: string;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
    <div
      className={`bg-white rounded-[20px] shadow-2xl relative flex flex-col max-h-[95vh] w-full ${width}`}
    >
      <div className="p-6 pb-0">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"
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

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-bold text-[#0B2A4A]">{label}</label>
    {children}
  </div>
);

const Err = ({ msg }: { msg: string }) => (
  <p className="text-red-500 text-[10px] mt-0.5 font-medium">{msg}</p>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full h-11 px-4 rounded-[10px] border border-[#2FC4B2] text-sm outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-[#2FC4B2]"
  />
);

interface SelectProps {
  placeholder?: string;
  options?: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  rawOptions?: { value: string; label: string }[];
}

const Select = ({ placeholder, options, value, onChange, rawOptions }: SelectProps) => (
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
        ? rawOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : options?.map((opt) => (
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

const PayButton = ({
  onClick,
  loading,
  className = '',
}: {
  onClick: () => void;
  loading: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full h-12 bg-[#666666] text-white rounded-[10px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors ${className}`}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {loading ? 'Processing...' : 'Pay now'}
  </button>
);

const PaymentMethodIcon = ({ methodId }: { methodId: string }) => {
  if (methodId === 'paystack') {
    return (
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[11px] font-black text-white shrink-0"
        style={{ background: 'linear-gradient(135deg, #00C3F7 0%, #0B2A4A 100%)' }}
        title="Paystack"
      >
        PS
      </div>
    );
  }
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
