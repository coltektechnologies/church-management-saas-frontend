'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/* * StepAdminDetails - Step 2: Primary Admin Details
 * Collects full name, role, email, password, phone, confirm password
 */
interface StepAdminDetailsProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2AdminDetails = ({ data, onChange, onNext, onBack }: StepAdminDetailsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const styles = {
    gridContainer: 'grid gap-5 sm:grid-cols-2',
    fieldStack: 'space-y-2',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    input: 'h-11 rounded-lg border-gray-200 focus:ring-[#2FC4B2] transition-all',
    passwordToggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
    buttonGroup: 'flex justify-end gap-4 pt-6 border-t mt-8',
    backBtn: 'rounded-full px-8 border-gray-200 text-gray-600 font-semibold h-11',
    nextBtn:
      'rounded-full px-10 bg-[#666666] hover:bg-black text-white font-semibold h-11 transition-all',
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-6">
        {/* Row: Full name + Role */}
        <div className={styles.gridContainer}>
          <div className={styles.fieldStack}>
            <Label htmlFor="fullName" className={styles.label}>
              Full name*
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={data.fullName || ''}
              onChange={(e) => onChange('fullName', e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldStack}>
            <Label htmlFor="role" className={styles.label}>
              Primary Role*
            </Label>
            <Input
              id="role"
              placeholder="e.g. Senior Pastor"
              value={data.role || ''}
              onChange={(e) => onChange('role', e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {/* Row: Email + Phone */}
        <div className={styles.gridContainer}>
          <div className={styles.fieldStack}>
            <Label htmlFor="adminEmail" className={styles.label}>
              Admin email*
            </Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="admin@example.com"
              value={data.adminEmail || ''}
              onChange={(e) => onChange('adminEmail', e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldStack}>
            <Label htmlFor="phone" className={styles.label}>
              Phone number*
            </Label>
            <Input
              id="phone"
              placeholder="+233..."
              value={data.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {/* Row: Password + Confirm */}
        <div className={styles.gridContainer}>
          <div className={styles.fieldStack}>
            <Label htmlFor="password" className={styles.label}>
              Password*
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={data.password || ''}
                onChange={(e) => onChange('password', e.target.value)}
                className={styles.input}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className={styles.fieldStack}>
            <Label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password*
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat password"
                value={data.confirmPassword || ''}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                className={styles.input}
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className={styles.passwordToggle}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <Button variant="outline" onClick={onBack} className={styles.backBtn}>
          Back
        </Button>
        <Button onClick={onNext} className={styles.nextBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step2AdminDetails;
