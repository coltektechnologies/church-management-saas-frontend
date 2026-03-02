'use client';

import { useState, useMemo } from 'react';
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

interface StepAdminDetailsProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2AdminDetails = ({ data, onChange, onNext, onBack }: StepAdminDetailsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openRole, setOpenRole] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');

  const roles = [
    { label: 'Administrator', value: 'Administrator' },
    { label: 'Pastor', value: 'Pastor' },
    { label: 'Secretary', value: 'Secretary' },
    { label: 'Accountant', value: 'Accountant' },
  ];

  // List of common country codes for the auto-select logic
  const countryCodes = useMemo(
    () => [
      { code: '+233', country: 'GH' },
      { code: '+234', country: 'NG' },
      { code: '+1', country: 'US' },
      { code: '+44', country: 'UK' },
    ],
    []
  );

  const styles = {
    formWrapper: 'relative space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500',
    responsiveGrid: 'grid gap-x-4 gap-y-3 sm:grid-cols-2',
    inputGroup: 'space-y-1',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-10 w-full rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all bg-white px-3 text-sm flex items-center justify-between',
    errorText: 'text-red-500 text-[10px] mt-0.5 font-medium flex items-start gap-1',
    passwordToggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
    actionWrapper: 'flex flex-col sm:flex-row justify-center sm:justify-end gap-3 pt-4',
    backBtn:
      'w-full sm:w-[236px] h-[44px] rounded-[10px] bg-[#D9D9D9] hover:bg-[#CCCCCC] text-black font-semibold transition-all',
    continueBtn:
      'bg-[#666666] hover:bg-[#444444] text-white rounded-[10px] w-full sm:w-[236px] h-[44px] font-poppins font-semibold transition-all shadow-sm',
  };

  const handlePhoneChange = (val: string) => {
    // Strip non-numeric characters except '+'
    const cleaned = val.replace(/[^\d+]/g, '');
    onChange('phone', cleaned);
  };

  const handleValidation = () => {
    const requiredFields = [
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
      if (!data[field] || data[field].trim() === '') {
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
      <div className={styles.responsiveGrid}>
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

        {/* Role (Combobox style: Select or Type) */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Role<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Popover open={openRole} onOpenChange={setOpenRole}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openRole}
                className={cn(styles.inputField, 'font-normal', errors.role && 'border-red-500')}
              >
                {data.role ? data.role : 'Select or type role...'}
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
                      Use "{roleSearch}" as role
                    </Button>
                  </CommandEmpty>
                  <CommandGroup>
                    {roles.map((role) => (
                      <CommandItem
                        key={role.value}
                        value={role.value}
                        onSelect={(currentValue) => {
                          onChange('role', currentValue);
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

        {/* Password */}
        <div className={styles.inputGroup}>
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
              <Info size={12} className="mt-0.5" /> {errors.password}
            </p>
          )}
        </div>

        {/* Email */}
        <div className={styles.inputGroup}>
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

        {/* Confirm Password */}
        <div className={styles.inputGroup}>
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

        {/* Phone number with Country Code logic */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Phone number<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative flex">
            <Input
              placeholder="+233 123 4567"
              value={data.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cn(styles.inputField, errors.phone && 'border-red-500')}
            />
          </div>
          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
        </div>
      </div>

      <div className={styles.actionWrapper}>
        <Button onClick={onBack} className={styles.backBtn}>
          Back
        </Button>
        <Button onClick={handleValidation} className={styles.continueBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step2AdminDetails;
