'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StepChurchInfoProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const Step1ChurchInfo = ({ data, onChange, onNext }: StepChurchInfoProps) => {
  const styles = {
    formWrapper: 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500',
    responsiveGrid: 'grid gap-4 sm:grid-cols-2',
    inputGroup: 'space-y-2',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-11 rounded-[10px] border border-[#2FC4B2] focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all',
    subdomainWrapper: 'relative flex items-center',
    subdomainSuffix:
      'absolute right-3 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-[10px] border border-[#2FC4B2]',
    actionWrapper: 'flex justify-end pt-6',
    continueBtn:
      'bg-[#666666] hover:bg-black text-white rounded-[10px] w-[229px] h-[44px] font-poppins font-semibold transition-all',
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
            className={styles.inputField}
          />
        </div>
        <div className={styles.inputGroup}>
          <Label htmlFor="country" className={styles.label}>
            Country<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Select value={data.country || ''} onValueChange={(val) => onChange('country', val)}>
            <SelectTrigger className={styles.inputField}>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="rounded-[10px]">
              <SelectItem value="ghana">Ghana</SelectItem>
              <SelectItem value="nigeria">Nigeria</SelectItem>
              <SelectItem value="kenya">Kenya</SelectItem>
              <SelectItem value="usa">United States</SelectItem>
            </SelectContent>
          </Select>
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
            className={styles.inputField}
          />
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
            className={styles.inputField}
          />
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
              className={`${styles.inputField} pr-32`}
            />
            <span className={styles.subdomainSuffix}>.opendoor.com</span>
          </div>
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
            className={styles.inputField}
          />
        </div>
      </div>

      <div className={styles.actionWrapper}>
        <Button onClick={onNext} className={styles.continueBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step1ChurchInfo;
