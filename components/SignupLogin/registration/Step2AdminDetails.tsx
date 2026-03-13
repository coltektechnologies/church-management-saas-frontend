'use client';

import { useState } from 'react';
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

interface StepAdminDetailsProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const roles = [
  { label: 'Administrator', value: 'Administrator' },
  { label: 'Pastor', value: 'Pastor' },
  { label: 'Secretary', value: 'Secretary' },
  { label: 'Accountant', value: 'Accountant' },
];

const Step2AdminDetails = ({
  data,
  onChange,
  onNext,
  onBack,
  loading = false,
}: StepAdminDetailsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openRole, setOpenRole] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');

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

  const handleValidation = () => {
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (data.password && !passwordRegex.test(data.password)) {
      newErrors.password = 'Must include: Uppercase, Lowercase, Number, and Symbol (@$!%*?&#)';
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
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
            onChange={(e) => onChange('firstName', e.target.value)}
            className={cn(styles.inputField, errors.firstName && 'border-red-500')}
          />
          {errors.firstName && <p className={styles.errorText}>{errors.firstName}</p>}
        </div>

        {/* Role — ClientOnly to avoid Radix hydration mismatch */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Role<span className={styles.requiredAsterisk}>*</span>
          </Label>
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
                  variant="outline"
                  role="combobox"
                  aria-expanded={openRole}
                  className={cn(styles.inputField, 'font-normal', errors.role && 'border-red-500')}
                >
                  {data.role || 'Select or type role...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search or type new role..."
                    onValueChange={(val) => setRoleSearch(val)}
                  />
                  <CommandList>
                    <CommandEmpty className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs italic"
                        onClick={() => {
                          onChange('role', roleSearch);
                          setOpenRole(false);
                        }}
                      >
                        Use &quot;{roleSearch}&quot; as role
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {roles.map((role) => (
                        <CommandItem
                          key={role.value}
                          value={role.value}
                          onSelect={(v) => {
                            onChange('role', v);
                            setOpenRole(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              data.role === role.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {role.label}
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
            onChange={(e) => onChange('lastName', e.target.value)}
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
            onChange={(e) => onChange('adminEmail', e.target.value)}
            className={cn(styles.inputField, errors.adminEmail && 'border-red-500')}
          />
          {errors.adminEmail && <p className={styles.errorText}>{errors.adminEmail}</p>}
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
              onChange={(e) => onChange('password', e.target.value)}
              className={cn(styles.inputField, errors.password && 'border-red-500')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className={styles.errorText}>
              <Info size={12} className="mt-0.5 shrink-0" /> {errors.password}
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
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              className={cn(styles.inputField, errors.confirmPassword && 'border-red-500')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={styles.passwordToggle}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
        </div>

        {/* Phone — full width */}
        <div className={cn(styles.inputGroup, 'sm:col-span-2 sm:order-7')}>
          <Label className={styles.label}>
            Phone number<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="sm:w-1/2">
            <CountryCodeInput
              value={data.phone || ''}
              onChange={(val) => onChange('phone', val)}
              error={!!errors.phone}
              placeholder="000 000 0000"
            />
          </div>
          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
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
          onClick={handleValidation}
          className="w-full sm:w-[236px] h-[44px] bg-[#666666] hover:bg-[#444444] text-white rounded-[10px] font-poppins font-semibold transition-all shadow-sm"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step2AdminDetails;
