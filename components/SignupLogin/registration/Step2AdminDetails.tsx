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

const Step2AdminDetails = ({ data, onChange, onNext, onBack }: StepAdminDetailsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = {
    formWrapper: 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500',
    gridContainer: 'grid gap-x-8 gap-y-5 sm:grid-cols-2',
    fieldStack: 'space-y-1.5',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    // Standard Height: 44px, Border: #2FC4B2
    input:
      'h-11 w-full rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] transition-all px-4 bg-white',
    inputError: 'border-red-500 focus:ring-red-500',
    errorText: 'text-red-500 text-[10px] mt-1 font-medium',
    passwordToggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
    buttonGroup: 'flex flex-col sm:flex-row justify-center sm:justify-end gap-4 pt-6 mt-8',
    // Standard Button Size: 236x44
    backBtn:
      'w-full sm:w-[236px] h-[44px] rounded-[10px] border border-gray-200 text-gray-600 font-bold transition-all hover:bg-gray-50',
    nextBtn:
      'w-full sm:w-[236px] h-[44px] rounded-[10px] bg-[#666666] hover:bg-[#444444] text-white font-bold transition-all shadow-sm',
  };

  const handleValidation = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'fullName',
      'role',
      'adminEmail',
      'phone',
      'password',
      'confirmPassword',
    ];

    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === '') {
        newErrors[field] = 'Required';
      }
    });

    if (data.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) {
      newErrors.adminEmail = 'Invalid email';
    }

    if (data.password && data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.gridContainer}>
        {/* Full Name */}
        <div className={styles.fieldStack}>
          <Label htmlFor="fullName" className={styles.label}>
            Full name<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={data.fullName || ''}
            onChange={(e) => onChange('fullName', e.target.value)}
            className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
          />
          {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
        </div>

        {/* Primary Role */}
        <div className={styles.fieldStack}>
          <Label htmlFor="role" className={styles.label}>
            Primary Role<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="role"
            placeholder="e.g. Senior Pastor"
            value={data.role || ''}
            onChange={(e) => onChange('role', e.target.value)}
            className={`${styles.input} ${errors.role ? styles.inputError : ''}`}
          />
          {errors.role && <p className={styles.errorText}>{errors.role}</p>}
        </div>

        {/* Admin Email */}
        <div className={styles.fieldStack}>
          <Label htmlFor="adminEmail" className={styles.label}>
            Admin email<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="adminEmail"
            type="email"
            placeholder="admin@example.com"
            value={data.adminEmail || ''}
            onChange={(e) => onChange('adminEmail', e.target.value)}
            className={`${styles.input} ${errors.adminEmail ? styles.inputError : ''}`}
          />
          {errors.adminEmail && <p className={styles.errorText}>{errors.adminEmail}</p>}
        </div>

        {/* Phone Number */}
        <div className={styles.fieldStack}>
          <Label htmlFor="phone" className={styles.label}>
            Phone number<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="phone"
            placeholder="+233..."
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
          />
          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className={styles.fieldStack}>
          <Label htmlFor="password" className={styles.label}>
            Password<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create password"
              value={data.password || ''}
              onChange={(e) => onChange('password', e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className={styles.errorText}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className={styles.fieldStack}>
          <Label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat password"
              value={data.confirmPassword || ''}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={styles.passwordToggle}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <Button variant="outline" onClick={onBack} className={styles.backBtn}>
          Back
        </Button>
        <Button onClick={handleValidation} className={styles.nextBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step2AdminDetails;
