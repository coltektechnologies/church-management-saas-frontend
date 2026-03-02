'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/SignupLogin/CountrySelect';
import { Check, ChevronsUpDown } from 'lucide-react';
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

interface StepChurchInfoProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const Step1ChurchInfo = ({ data, onChange, onNext }: StepChurchInfoProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const denominations = [
    { label: 'Pentecostal', value: 'pentecostal' },
    { label: 'Baptist', value: 'baptist' },
    { label: 'Catholic', value: 'catholic' },
    { label: 'Methodist', value: 'methodist' },
  ];

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

  const handleValidation = () => {
    const requiredFields = [
      'churchName',
      'country',
      'churchEmail',
      'regionCity',
      'subdomain',
      'address',
      'denomination',
      'churchSize',
    ];
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === '') {
        newErrors[field] = 'Required';
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.responsiveGrid}>
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

        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Country<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <CountrySelect
            value={data.country || ''}
            onValueChange={(val) => onChange('country', val)}
            className={`${styles.inputField} ${errors.country ? 'border-red-500' : ''}`}
          />
          {errors.country && <p className={styles.errorText}>{errors.country}</p>}
        </div>

        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Church email<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Input
            type="email"
            placeholder="church@example.com"
            value={data.churchEmail || ''}
            onChange={(e) => onChange('churchEmail', e.target.value)}
            className={`${styles.inputField} ${errors.churchEmail ? 'border-red-500' : ''}`}
          />
          {errors.churchEmail && <p className={styles.errorText}>{errors.churchEmail}</p>}
        </div>

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

        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Subdomain<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <div className={styles.subdomainWrapper}>
            <Input
              placeholder="name"
              value={data.subdomain || ''}
              onChange={(e) => onChange('subdomain', e.target.value)}
              className={`${styles.inputField} pr-24 ${errors.subdomain ? 'border-red-500' : ''}`}
            />
            <span className={styles.subdomainSuffix}>.opendoor.com</span>
          </div>
          {errors.subdomain && <p className={styles.errorText}>{errors.subdomain}</p>}
        </div>

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

        <div className={styles.inputGroup}>
          <Label className={styles.label}>
            Denomination<span className={styles.requiredAsterisk}>*</span>
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'justify-between font-normal',
                  styles.inputField,
                  errors.denomination && 'border-red-500'
                )}
              >
                {data.denomination || 'Select or type...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder="Search denomination..."
                  onValueChange={(val) => onChange('denomination', val)}
                />
                <CommandList>
                  <CommandEmpty>No denomination found. Use typed value.</CommandEmpty>
                  <CommandGroup>
                    {denominations.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={(currentValue) => {
                          onChange('denomination', currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            data.denomination === item.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.denomination && <p className={styles.errorText}>{errors.denomination}</p>}
        </div>

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
        <Button onClick={handleValidation} className={styles.continueBtn}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step1ChurchInfo;
