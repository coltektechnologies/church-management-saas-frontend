'use client';

import { useState } from 'react';
import { useDebouncedRegistrationEmail } from '@/hooks/useDebouncedRegistrationEmail';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/SignupLogin/CountrySelect';
import { ClientOnly } from '@/components/ClientOnly';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { RegistrationData } from './Step4Payment';
import { isValidSignupEmail } from '@/lib/signupValidation';
import { checkRegistrationEmail } from '@/lib/api';

interface StepChurchInfoProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void | Promise<void>;
  loading?: boolean;
}

const presetDenominations = [
  'Pentecostal',
  'Baptist',
  'Catholic',
  'Methodist',
  'Anglican',
  'Presbyterian',
  'Evangelical',
  'Charismatic',
  'Adventist',
  'Lutheran',
  'Orthodox',
];

const Step1ChurchInfo = ({ data, onChange, onNext, loading = false }: StepChurchInfoProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const churchEmailLive = useDebouncedRegistrationEmail(data.churchEmail, 'church');
  const [open, setOpen] = useState(false);
  const [denomTyped, setDenomTyped] = useState('');

  const styles = {
    formWrapper: 'relative space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500',
    responsiveGrid: 'grid gap-x-4 gap-y-3 sm:grid-cols-2',
    inputGroup: 'space-y-1',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-10 w-full rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all bg-white px-3 text-sm',
    errorText: 'text-red-500 text-[10px] mt-0.5 font-medium',
    subdomainWrapper: 'relative flex items-center w-full',
    subdomainSuffix:
      'absolute right-3 text-[10px] font-medium text-[#2FC4B2] bg-gray-50 px-2 py-0.5 rounded-md border border-[#2FC4B2]/30',
    actionWrapper: 'flex justify-center sm:justify-end pt-2',
    continueBtn:
      'bg-[#666666] hover:bg-[#444444] text-white rounded-[10px] w-full sm:w-[236px] h-[44px] font-poppins font-semibold transition-all shadow-sm',
  };

  const handleValidation = async () => {
    const newErrors: Record<string, string> = {};
    const checks: { field: keyof RegistrationData | string; label: string }[] = [
      { field: 'churchName', label: 'Church name' },
      { field: 'country', label: 'Country' },
      { field: 'churchEmail', label: 'Church email' },
      { field: 'regionCity', label: 'Region/City' },
      { field: 'subdomain', label: 'Subdomain' },
      { field: 'address', label: 'Address' },
      { field: 'denomination', label: 'Denomination' },
      { field: 'churchSize', label: 'Church size' },
    ];

    checks.forEach(({ field }) => {
      const val = (data as unknown as Record<string, string | undefined>)[field];
      if (!val || val.trim() === '') {
        newErrors[field] = 'Required';
      }
    });

    const ce = (data.churchEmail || '').trim();
    if (ce && !isValidSignupEmail(ce)) {
      newErrors.churchEmail = 'Enter a valid email address';
    }
    if (churchEmailLive.remoteError) {
      newErrors.churchEmail = churchEmailLive.remoteError;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setCheckingEmail(true);
    try {
      const remote = await checkRegistrationEmail(ce, 'church');
      if (!remote.ok) {
        setErrors({
          churchEmail:
            remote.message ||
            'This email cannot be used. It may already be registered or the domain may be invalid.',
        });
        return;
      }
      await Promise.resolve(onNext());
    } catch {
      setErrors({
        churchEmail: 'Could not verify email. Check your connection and try again.',
      });
    } finally {
      setCheckingEmail(false);
    }
  };

  // Filtered list based on what user has typed
  const filtered = denomTyped
    ? presetDenominations.filter((d) => d.toLowerCase().includes(denomTyped.toLowerCase()))
    : presetDenominations;

  const isCustomValue = data.denomination && !presetDenominations.includes(data.denomination);

  const churchEmailTrimmed = (data.churchEmail || '').trim();

  return (
    <div className={styles.formWrapper}>
      <div className={styles.responsiveGrid}>
        {/* Church Name */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Church name<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Enter church name"
            value={data.churchName || ''}
            onChange={(e) => onChange('churchName', e.target.value)}
            className={`${styles.inputField} ${errors.churchName ? 'border-red-500' : ''}`}
          />
          {errors.churchName && <p className={styles.errorText}>{errors.churchName}</p>}
        </div>

        {/* Country — ClientOnly to avoid Radix hydration mismatch (aria-controls IDs) */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Country<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <ClientOnly
            fallback={
              <Input
                readOnly
                value={data.country || ''}
                placeholder="Select country"
                className={cn(styles.inputField, errors.country ? 'border-red-500' : '')}
              />
            }
          >
            <CountrySelect
              value={data.country || ''}
              onValueChange={(val) => onChange('country', val)}
              className={errors.country ? 'border-red-500' : ''}
            />
          </ClientOnly>
          {errors.country && <p className={styles.errorText}>{errors.country}</p>}
        </div>

        {/* Church Email */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Church email<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            type="email"
            placeholder="church@example.com"
            value={data.churchEmail || ''}
            onChange={(e) => {
              onChange('churchEmail', e.target.value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.churchEmail;
                return next;
              });
            }}
            onBlur={() => churchEmailLive.flushVerify()}
            aria-invalid={!!(errors.churchEmail || churchEmailLive.remoteError)}
            className={`${styles.inputField} ${errors.churchEmail || churchEmailLive.remoteError ? 'border-red-500' : ''}`}
          />
          {churchEmailLive.checking && (
            <p className="text-[10px] mt-0.5 text-muted-foreground">Checking email…</p>
          )}
          {!churchEmailLive.checking &&
            churchEmailTrimmed &&
            isValidSignupEmail(churchEmailTrimmed) &&
            !churchEmailLive.canProceedEmail &&
            !churchEmailLive.remoteError && (
              <p className="text-[10px] mt-0.5 text-amber-800">
                Verifying with the server… Continue unlocks only after this passes.
              </p>
            )}
          {(errors.churchEmail || churchEmailLive.remoteError) && (
            <p className={styles.errorText}>{errors.churchEmail || churchEmailLive.remoteError}</p>
          )}
        </div>

        {/* Region/City */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Region/City<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Enter region/city"
            value={data.regionCity || ''}
            onChange={(e) => onChange('regionCity', e.target.value)}
            className={`${styles.inputField} ${errors.regionCity ? 'border-red-500' : ''}`}
          />
          {errors.regionCity && <p className={styles.errorText}>{errors.regionCity}</p>}
        </div>

        {/* Subdomain */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Subdomain<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className={styles.subdomainWrapper}>
            <Input
              placeholder="name"
              value={data.subdomain || ''}
              onChange={(e) => onChange('subdomain', e.target.value)}
              className={`${styles.inputField} pr-28 ${errors.subdomain ? 'border-red-500' : ''}`}
            />
            <span className={styles.subdomainSuffix}>.opendoor.com</span>
          </div>
          {errors.subdomain && <p className={styles.errorText}>{errors.subdomain}</p>}
        </div>

        {/* Address */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Address<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Street address"
            value={data.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            className={`${styles.inputField} ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && <p className={styles.errorText}>{errors.address}</p>}
        </div>

        {/* Denomination — ClientOnly to avoid Radix hydration mismatch (aria-controls IDs) */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Denomination<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <ClientOnly
            fallback={
              <Input
                readOnly
                value={data.denomination || ''}
                placeholder="Select or type denomination..."
                className={cn(styles.inputField, errors.denomination ? 'border-red-500' : '')}
              />
            }
          >
            <Popover
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  setDenomTyped('');
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'justify-between font-normal text-sm',
                    styles.inputField,
                    errors.denomination && 'border-red-500'
                  )}
                >
                  <span className={data.denomination ? 'text-[#0B2A4A]' : 'text-gray-400'}>
                    {data.denomination || 'Select or type denomination...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 z-[9999]"
                align="start"
              >
                <Command shouldFilter={false}>
                  <div className="flex items-center border-b border-gray-100 px-3">
                    <input
                      autoFocus
                      placeholder="Type to search or enter your own..."
                      value={denomTyped}
                      onChange={(e) => {
                        setDenomTyped(e.target.value);
                        onChange('denomination', e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && denomTyped.trim()) {
                          onChange('denomination', denomTyped.trim());
                          setOpen(false);
                          setDenomTyped('');
                        }
                      }}
                      className="flex-1 py-2.5 text-sm outline-none bg-transparent text-[#0B2A4A] placeholder:text-gray-400"
                    />
                  </div>

                  <CommandList className="max-h-[220px]">
                    <CommandGroup>
                      {filtered.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() => {
                            onChange('denomination', item);
                            setDenomTyped('');
                            setOpen(false);
                          }}
                          className="text-sm cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4 shrink-0',
                              data.denomination === item
                                ? 'opacity-100 text-[#2FC4B2]'
                                : 'opacity-0'
                            )}
                          />
                          {item}
                        </CommandItem>
                      ))}

                      {denomTyped.trim() &&
                        !presetDenominations
                          .map((d) => d.toLowerCase())
                          .includes(denomTyped.trim().toLowerCase()) && (
                          <CommandItem
                            value={denomTyped}
                            onSelect={() => {
                              onChange('denomination', denomTyped.trim());
                              setDenomTyped('');
                              setOpen(false);
                            }}
                            className="text-sm cursor-pointer text-[#2FC4B2] font-medium"
                          >
                            <Check className="mr-2 h-4 w-4 opacity-0 shrink-0" />
                            Use &quot;{denomTyped.trim()}&quot;
                          </CommandItem>
                        )}
                    </CommandGroup>
                  </CommandList>

                  <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-[10px] text-gray-400">
                      Not listed? Just type your denomination and press Enter or click
                      &quot;Use&quot;
                    </p>
                  </div>
                </Command>
              </PopoverContent>
            </Popover>
          </ClientOnly>

          {isCustomValue && (
            <p className="text-[10px] text-[#2FC4B2] mt-1 font-medium">
              ✓ Custom denomination saved: &quot;{data.denomination}&quot;
            </p>
          )}
          {errors.denomination && <p className={styles.errorText}>{errors.denomination}</p>}
        </div>

        {/* Church Size */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Church size<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="e.g. 500"
            type="number"
            value={data.churchSize || ''}
            onChange={(e) => onChange('churchSize', e.target.value)}
            className={`${styles.inputField} ${errors.churchSize ? 'border-red-500' : ''}`}
          />
          {errors.churchSize && <p className={styles.errorText}>{errors.churchSize}</p>}
        </div>
      </div>

      <div className={styles.actionWrapper}>
        <Button
          onClick={() => void handleValidation()}
          className={styles.continueBtn}
          disabled={
            loading ||
            checkingEmail ||
            churchEmailLive.checking ||
            !!churchEmailLive.remoteError ||
            !churchEmailLive.canProceedEmail
          }
        >
          {checkingEmail || churchEmailLive.checking
            ? 'Verifying email...'
            : loading
              ? 'Saving...'
              : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step1ChurchInfo;
