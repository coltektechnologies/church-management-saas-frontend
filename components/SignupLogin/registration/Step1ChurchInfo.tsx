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

/**
 * StepChurchInfo - Step 1: Church Information
 * Collects foundational church data including naming, location, and digital presence.
 * Optimized for Next.js and fully responsive across mobile, tablet, and desktop.
 */
interface StepChurchInfoProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const StepChurchInfo = ({ data, onChange, onNext }: StepChurchInfoProps) => {
  // Style groups for cleaner JSX and easier maintenance
  const styles = {
    formWrapper: 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500',
    responsiveGrid: 'grid gap-4 sm:grid-cols-2',
    inputGroup: 'space-y-2',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    requiredAsterisk: 'text-[#2FC4B2] ml-0.5',
    inputField:
      'h-11 rounded-lg border-gray-200 focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all',
    subdomainWrapper: 'relative flex items-center',
    subdomainSuffix:
      'absolute right-3 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded border',
    actionWrapper: 'flex justify-end pt-6',
    continueBtn:
      'bg-[#666666] hover:bg-black text-white rounded-full px-10 h-12 font-poppins font-semibold transition-all w-full sm:w-auto',
  };

  return (
    <div className={styles.formWrapper}>
      {/* Row 1: Church name + Country */}
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
            <SelectContent>
              <SelectItem value="ghana">Ghana</SelectItem>
              <SelectItem value="nigeria">Nigeria</SelectItem>
              <SelectItem value="kenya">Kenya</SelectItem>
              <SelectItem value="south-africa">South Africa</SelectItem>
              <SelectItem value="usa">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Church email + Region/City */}
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

      {/* Row 3: Preferred subdomain + Physical address */}
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

      {/* Row 4: Denomination + Church size */}
      <div className={styles.responsiveGrid}>
        <div className={styles.inputGroup}>
          <Label htmlFor="denomination" className={styles.label}>
            Denomination/Affiliation
          </Label>
          <Select
            value={data.denomination || ''}
            onValueChange={(val) => onChange('denomination', val)}
          >
            <SelectTrigger className={styles.inputField}>
              <SelectValue placeholder="Select your denomination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pentecostal">Pentecostal</SelectItem>
              <SelectItem value="adventist">Seventh Day Adventist</SelectItem>
              <SelectItem value="catholic">Catholic</SelectItem>
              <SelectItem value="methodist">Methodist</SelectItem>
              <SelectItem value="baptist">Baptist</SelectItem>
              <SelectItem value="non-denominational">Non-denominational</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={styles.inputGroup}>
          <Label htmlFor="churchSize" className={styles.label}>
            Church size<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            id="churchSize"
            placeholder="Enter church size"
            value={data.churchSize || ''}
            onChange={(e) => onChange('churchSize', e.target.value)}
            className={styles.inputField}
          />
        </div>
      </div>

      {/* Form Action */}
      <div className={styles.actionWrapper}>
        <Button onClick={onNext} className={styles.continueBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step1ChurchInfo;
