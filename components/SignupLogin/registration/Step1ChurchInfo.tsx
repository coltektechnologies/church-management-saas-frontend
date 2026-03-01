'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/SignupLogin/CountrySelect';

interface StepChurchInfoProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const Step1ChurchInfo = ({ data, onChange, onNext }: StepChurchInfoProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = {
    formWrapper: 'relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500',
    responsiveGrid: 'grid gap-4 sm:grid-cols-2',
    inputGroup: 'space-y-2',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-11 rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all bg-white',
    errorText: 'text-red-500 text-[10px] mt-1 font-medium',
    subdomainWrapper: 'relative flex items-center',
    subdomainSuffix:
      'absolute right-3 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-[10px] border border-[#2FC4B2]',
    actionWrapper: 'flex justify-end pt-6',
    continueBtn:
      'bg-[#666666] hover:bg-black text-white rounded-[10px] w-full sm:w-[229px] h-[44px] font-poppins font-semibold transition-all',
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleValidation = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'churchName',
      'country',
      'churchEmail',
      'regionCity',
      'subdomain',
      'address',
    ];

    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (data.churchEmail && !validateEmail(data.churchEmail)) {
      newErrors.churchEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onNext();
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.responsiveGrid}>
        <div className={styles.inputGroup}>
          <Label htmlFor="churchName" className={styles.label}>
            Church name<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="churchName"
            placeholder="Enter your church name"
            value={data.churchName || ''}
            onChange={(e) => onChange('churchName', e.target.value)}
            className={`${styles.inputField} ${errors.churchName ? 'border-red-500' : ''}`}
          />
          {errors.churchName && <p className={styles.errorText}>{errors.churchName}</p>}
        </div>

        <div className={styles.inputGroup}>
          <Label htmlFor="country" className={styles.label}>
            Country<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <CountrySelect
            value={data.country || ''}
            onValueChange={(val) => onChange('country', val)}
            className={`${styles.inputField} ${errors.country ? 'border-red-500' : ''}`}
          />
          {errors.country && <p className={styles.errorText}>{errors.country}</p>}
        </div>
      </div>

      <div className={styles.responsiveGrid}>
        <div className={styles.inputGroup}>
          <Label htmlFor="churchEmail" className={styles.label}>
            Church email<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="churchEmail"
            type="email"
            placeholder="Enter your church email"
            value={data.churchEmail || ''}
            onChange={(e) => onChange('churchEmail', e.target.value)}
            className={`${styles.inputField} ${errors.churchEmail ? 'border-red-500' : ''}`}
          />
          {errors.churchEmail && <p className={styles.errorText}>{errors.churchEmail}</p>}
        </div>

        <div className={styles.inputGroup}>
          <Label htmlFor="regionCity" className={styles.label}>
            Region/City<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="regionCity"
            placeholder="Enter your region/city"
            value={data.regionCity || ''}
            onChange={(e) => onChange('regionCity', e.target.value)}
            className={`${styles.inputField} ${errors.regionCity ? 'border-red-500' : ''}`}
          />
          {errors.regionCity && <p className={styles.errorText}>{errors.regionCity}</p>}
        </div>
      </div>

      <div className={styles.responsiveGrid}>
        <div className={styles.inputGroup}>
          <Label htmlFor="subdomain" className={styles.label}>
            Preferred subdomain<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className={styles.subdomainWrapper}>
            <Input
              id="subdomain"
              placeholder="yourchurchname"
              value={data.subdomain || ''}
              onChange={(e) => onChange('subdomain', e.target.value)}
              className={`${styles.inputField} pr-32 ${errors.subdomain ? 'border-red-500' : ''}`}
            />
            <span className={styles.subdomainSuffix}>.opendoor.com</span>
          </div>
          {errors.subdomain && <p className={styles.errorText}>{errors.subdomain}</p>}
        </div>

        <div className={styles.inputGroup}>
          <Label htmlFor="address" className={styles.label}>
            Physical address<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="address"
            placeholder="Enter street code/postal code"
            value={data.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            className={`${styles.inputField} ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && <p className={styles.errorText}>{errors.address}</p>}
        </div>
      </div>

      <div className={styles.actionWrapper}>
        <Button onClick={handleValidation} className={styles.continueBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step1ChurchInfo;
