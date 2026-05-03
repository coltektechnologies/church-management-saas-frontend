'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebouncedRegistrationEmail } from '@/hooks/useDebouncedRegistrationEmail';
import { useDebouncedSignupPhone } from '@/hooks/useDebouncedSignupPhone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Info, Check, ChevronsUpDown } from 'lucide-react';
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
import type { RegistrationData } from './Step4Payment';
import { CountryCodeInput } from '@/components/SignupLogin/CountryCodeInput';
import { ClientOnly } from '@/components/ClientOnly';
import {
  checkRegistrationEmail,
  getRegistrationPositions,
  type RegistrationPosition,
} from '@/lib/api';
import {
  getSignupConfirmPasswordError,
  getSignupPasswordError,
  getSignupPhoneError,
  isValidSignupEmail,
  sanitizePersonNameInput,
} from '@/lib/signupValidation';

interface StepAdminDetailsProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const Step2AdminDetails = ({
  data,
  onChange,
  onNext,
  onBack,
  loading = false,
}: StepAdminDetailsProps) => {
  const adminEmailLive = useDebouncedRegistrationEmail(data.adminEmail, 'admin');
  const phoneLive = useDebouncedSignupPhone(data.phone, data.country);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openRole, setOpenRole] = useState(false);
  const [positions, setPositions] = useState<RegistrationPosition[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setRolesLoading(true);
      try {
        const rows = await getRegistrationPositions();
        if (!cancelled) {
          setPositions(rows);
        }
      } catch {
        if (!cancelled) {
          setPositions([]);
        }
      } finally {
        if (!cancelled) {
          setRolesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const passwordErr = useMemo(() => getSignupPasswordError(data.password || ''), [data.password]);
  const confirmErr = useMemo(
    () => getSignupConfirmPasswordError(data.password || '', data.confirmPassword || ''),
    [data.password, data.confirmPassword]
  );
  const passwordGateBlocked = Boolean(passwordErr) || Boolean(confirmErr);

  const adminEmailTrimmed = (data.adminEmail || '').trim();
  const phoneTrimmed = (data.phone || '').trim();

  const styles = {
    formWrapper: 'relative space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500',
    inputGroup: 'space-y-1',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-10 w-full rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all bg-white px-3 text-sm flex items-center justify-between',
    errorText: 'text-red-500 text-[10px] mt-0.5 font-medium flex items-start gap-1',
    passwordToggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
  };

  const handleValidation = async () => {
    const requiredFields: (keyof RegistrationData)[] = [
      'firstName',
      'lastName',
      'role',
      'adminEmail',
      'phone',
      'password',
      'confirmPassword',
    ];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const val = data[field];
      if (!val || String(val).trim() === '') {
        newErrors[field] = 'Required';
      }
    });

    const adminEmail = (data.adminEmail || '').trim();
    if (adminEmail && !isValidSignupEmail(adminEmail)) {
      newErrors.adminEmail = 'Enter a valid email address';
    }
    if (adminEmailLive.remoteError) {
      newErrors.adminEmail = adminEmailLive.remoteError;
    }

    const phoneRaw = (data.phone || '').trim();
    const phoneValidationMsg = getSignupPhoneError(data.phone || '', data.country);
    if (phoneRaw && phoneValidationMsg) {
      newErrors.phone = phoneValidationMsg;
    }

    const pwMsg = getSignupPasswordError(data.password || '');
    if (data.password && pwMsg) {
      newErrors.password = pwMsg;
    }
    const cfMsg = getSignupConfirmPasswordError(data.password || '', data.confirmPassword || '');
    if ((data.confirmPassword || '').trim() && cfMsg) {
      newErrors.confirmPassword = cfMsg;
    }

    const rid = (data.role || '').trim();
    if (!rolesLoading && positions.length > 0 && rid && !positions.some((p) => p.value === rid)) {
      newErrors.role = 'Select a role from the list';
    }
    if (!rolesLoading && positions.length === 0) {
      newErrors.role = 'Roles could not be loaded. Refresh the page or contact support.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setCheckingEmail(true);
    try {
      const remote = await checkRegistrationEmail(adminEmail, 'admin');
      if (!remote.ok) {
        setErrors({
          adminEmail:
            remote.message ||
            'This email cannot be used. It may already be registered or the domain may be invalid.',
        });
        return;
      }
      await Promise.resolve(onNext());
    } catch {
      setErrors({
        adminEmail: 'Could not verify email. Check your connection and try again.',
      });
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      {/*
        GRID LAYOUT:
        Mobile  (1 col): First Name, Role, Last Name, Email, Password, Confirm, Phone
        Desktop (2 col): First Name | Role
                         Last Name  | Password
                         Email      | Confirm
                         Phone (full width)
      */}
      <div className="grid gap-x-4 gap-y-3 grid-cols-1 sm:grid-cols-2">
        {/* First Name */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            First Name<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Enter first name"
            value={data.firstName || ''}
            onChange={(e) => onChange('firstName', sanitizePersonNameInput(e.target.value))}
            className={cn(styles.inputField, errors.firstName && 'border-red-500')}
          />
          {errors.firstName && <p className={styles.errorText}>{errors.firstName}</p>}
        </div>

        {/* Role — ClientOnly to avoid Radix hydration mismatch */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Role<span className={styles.requiredAsterisk}>*</span>
          </Label>
          {!rolesLoading && positions.length === 0 && (
            <p className="text-[11px] text-amber-800 mb-1 leading-snug">
              Could not load roles from the server. Ensure roles are seeded (`setup_initial_data`)
              and try refreshing.
            </p>
          )}
          <ClientOnly
            fallback={
              <Input
                readOnly
                value={data.role || ''}
                placeholder="Select or type role..."
                className={cn(styles.inputField, errors.role && 'border-red-500')}
              />
            }
          >
            <Popover open={openRole} onOpenChange={setOpenRole}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openRole}
                  disabled={rolesLoading || positions.length === 0}
                  className={cn(styles.inputField, 'font-normal', errors.role && 'border-red-500')}
                >
                  {rolesLoading
                    ? 'Loading roles…'
                    : positions.find((p) => p.value === data.role)?.label ||
                      data.roleLabel ||
                      'Select role…'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search roles..." />
                  <CommandList>
                    <CommandEmpty className="p-2 text-xs text-muted-foreground">
                      No matching role.
                    </CommandEmpty>
                    <CommandGroup>
                      {positions.map((role) => (
                        <CommandItem
                          key={role.value}
                          value={`${role.label} ${role.value}`}
                          onSelect={() => {
                            onChange('role', role.value);
                            onChange('roleLabel', role.label);
                            setOpenRole(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              data.role === role.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <span className="flex flex-col items-start gap-0">
                            <span>{role.label}</span>
                            {typeof role.level === 'number' && (
                              <span className="text-[10px] font-normal text-muted-foreground">
                                Level {role.level}
                              </span>
                            )}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </ClientOnly>
          {errors.role && <p className={styles.errorText}>{errors.role}</p>}
        </div>

        {/* Last Name */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Last Name<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Enter last name"
            value={data.lastName || ''}
            onChange={(e) => onChange('lastName', sanitizePersonNameInput(e.target.value))}
            className={cn(styles.inputField, errors.lastName && 'border-red-500')}
          />
          {errors.lastName && <p className={styles.errorText}>{errors.lastName}</p>}
        </div>

        {/*
          Email — on mobile shows here (after Last Name, before Password)
          On desktop sits in col 1 row 3 alongside Confirm Password
        */}
        <div className={cn(styles.inputGroup, 'sm:order-5')}>
          <Label className={styles.label}>
            Email address<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={data.adminEmail || ''}
            onChange={(e) => {
              onChange('adminEmail', e.target.value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.adminEmail;
                return next;
              });
            }}
            onBlur={() => adminEmailLive.flushVerify()}
            aria-invalid={!!(errors.adminEmail || adminEmailLive.remoteError)}
            className={cn(
              styles.inputField,
              (errors.adminEmail || adminEmailLive.remoteError) && 'border-red-500'
            )}
          />
          {adminEmailLive.checking && (
            <p className="text-[10px] mt-0.5 text-muted-foreground">Checking email…</p>
          )}
          {!adminEmailLive.checking &&
            adminEmailTrimmed &&
            isValidSignupEmail(adminEmailTrimmed) &&
            !adminEmailLive.canProceedEmail &&
            !adminEmailLive.remoteError && (
              <p className="text-[10px] mt-0.5 text-amber-800">
                Verifying with the server… Continue unlocks only after this passes.
              </p>
            )}
          {(errors.adminEmail || adminEmailLive.remoteError) && (
            <p className={styles.errorText}>{errors.adminEmail || adminEmailLive.remoteError}</p>
          )}
        </div>

        {/* Password — on mobile comes after email (order-4), on desktop col 2 row 2 */}
        <div className={cn(styles.inputGroup, 'order-4 sm:order-4')}>
          <Label className={styles.label}>
            Password<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter a strong password"
              value={data.password || ''}
              onChange={(e) => {
                onChange('password', e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }}
              aria-invalid={!!(errors.password || passwordErr)}
              className={cn(
                styles.inputField,
                (errors.password || passwordErr) && 'border-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {(errors.password || passwordErr) && (
            <p className={styles.errorText}>
              <Info size={12} className="mt-0.5 shrink-0" /> {errors.password || passwordErr}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className={cn(styles.inputGroup, 'sm:order-6')}>
          <Label className={styles.label}>
            Confirm Password<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={data.confirmPassword || ''}
              onChange={(e) => {
                onChange('confirmPassword', e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }}
              aria-invalid={!!(errors.confirmPassword || confirmErr)}
              className={cn(
                styles.inputField,
                (errors.confirmPassword || confirmErr) && 'border-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={styles.passwordToggle}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {(errors.confirmPassword || confirmErr) && (
            <p className={styles.errorText}>{errors.confirmPassword || confirmErr}</p>
          )}
        </div>

        {/* Phone — full width */}
        <div className={cn(styles.inputGroup, 'sm:col-span-2 sm:order-7')}>
          <Label className={styles.label}>
            Phone number<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="sm:w-1/2">
            <CountryCodeInput
              value={data.phone || ''}
              onChange={(val) => {
                onChange('phone', val);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.phone;
                  return next;
                });
              }}
              onBlur={() => phoneLive.flushVerify()}
              defaultCountryIso={data.country || undefined}
              error={!!(errors.phone || phoneLive.remoteError)}
              placeholder="000 000 0000"
            />
          </div>
          {phoneLive.checking && phoneTrimmed && (
            <p className="text-[10px] mt-0.5 text-muted-foreground">Checking phone number…</p>
          )}
          {(errors.phone || phoneLive.remoteError) && (
            <p className={styles.errorText}>
              <Info size={12} className="mt-0.5 shrink-0" /> {errors.phone || phoneLive.remoteError}
            </p>
          )}
        </div>
      </div>

      {/* Buttons — Continue first on mobile, Back last */}
      <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-end gap-3 pt-4">
        <Button
          onClick={onBack}
          className="w-full sm:w-[236px] h-[44px] rounded-[10px] bg-[#D9D9D9] hover:bg-[#CCCCCC] text-black font-semibold transition-all"
        >
          Back
        </Button>
        <Button
          onClick={() => void handleValidation()}
          className="w-full sm:w-[236px] h-[44px] bg-[#666666] hover:bg-[#444444] text-white rounded-[10px] font-poppins font-semibold transition-all shadow-sm"
          disabled={
            loading ||
            checkingEmail ||
            rolesLoading ||
            positions.length === 0 ||
            adminEmailLive.checking ||
            !!adminEmailLive.remoteError ||
            !adminEmailLive.canProceedEmail ||
            phoneLive.checking ||
            !!phoneLive.remoteError ||
            !phoneLive.canProceedPhone ||
            passwordGateBlocked
          }
        >
          {checkingEmail || adminEmailLive.checking
            ? 'Verifying email...'
            : phoneLive.checking && phoneTrimmed
              ? 'Checking phone number...'
              : loading
                ? 'Saving...'
                : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step2AdminDetails;
