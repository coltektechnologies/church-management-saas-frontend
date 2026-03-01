'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface StepAdminDetailsProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// Step 2: Admin Details
const Step2AdminDetails = ({ data, onChange, onNext, onBack }: StepAdminDetailsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = {
    formWrapper: 'relative space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500',
    responsiveGrid: 'grid gap-x-4 gap-y-3 sm:grid-cols-2',
    inputGroup: 'space-y-1',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-10 w-full rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all bg-white px-3 text-sm',
    errorText: 'text-red-500 text-[10px] mt-0.5 font-medium',
    passwordToggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
    actionWrapper: 'flex flex-col sm:flex-row justify-center sm:justify-end gap-3 pt-4',
    backBtn:
      'w-full sm:w-[236px] h-[44px] rounded-[10px] border border-gray-200 text-gray-600 font-semibold transition-all hover:bg-gray-50',
    continueBtn:
      'bg-[#666666] hover:bg-[#444444] text-white rounded-[10px] w-full sm:w-[236px] h-[44px] font-poppins font-semibold transition-all shadow-sm',
  };

  // Validation logic for the form fields
  const handleValidation = () => {
    const requiredFields = [
      'fullName',
      'role',
      'adminEmail',
      'phone',
      'password',
      'confirmPassword',
    ];
    const newErrors: Record<string, string> = {};

    // Check for empty required fields
    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === '') {
        newErrors[field] = 'Required';
      }
    });

    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  // Render the form fields and buttons
  return (
    <div className={styles.formWrapper}>
      <div className={styles.responsiveGrid}>
        {/* Full Name */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Full name<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Enter full name"
            value={data.fullName || ''}
            onChange={(e) => onChange('fullName', e.target.value)}
            className={`${styles.inputField} ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
        </div>

        {/* Primary Role */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Primary Role<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="e.g. Administrator"
            value={data.role || ''}
            onChange={(e) => onChange('role', e.target.value)}
            className={`${styles.inputField} ${errors.role ? 'border-red-500' : ''}`}
          />
          {errors.role && <p className={styles.errorText}>{errors.role}</p>}
        </div>

        {/* Admin Email */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Admin email<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            type="email"
            placeholder="admin@example.com"
            value={data.adminEmail || ''}
            onChange={(e) => onChange('adminEmail', e.target.value)}
            className={`${styles.inputField} ${errors.adminEmail ? 'border-red-500' : ''}`}
          />
          {errors.adminEmail && <p className={styles.errorText}>{errors.adminEmail}</p>}
        </div>

        {/* Phone Number */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Phone number<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            placeholder="Enter phone number"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`${styles.inputField} ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Password<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create password"
              value={data.password || ''}
              onChange={(e) => onChange('password', e.target.value)}
              className={`${styles.inputField} ${errors.password ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className={styles.errorText}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Confirm Password<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm password"
              value={data.confirmPassword || ''}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              className={`${styles.inputField} ${errors.confirmPassword ? 'border-red-500' : ''}`}
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
      </div>

      <div className={styles.actionWrapper}>
        <Button variant="ghost" onClick={onBack} className={styles.backBtn}>
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
