'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

// List of countries with their flags and dial codes
const countries = [
  { name: 'Afghanistan', code: 'AF', flag: '🇦🇫', dial: '+93' },
  { name: 'Albania', code: 'AL', flag: '🇦🇱', dial: '+355' },
  { name: 'Algeria', code: 'DZ', flag: '🇩🇿', dial: '+213' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴', dial: '+244' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷', dial: '+54' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dial: '+61' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹', dial: '+43' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪', dial: '+32' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', dial: '+55' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', dial: '+237' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dial: '+1' },
  { name: 'China', code: 'CN', flag: '🇨🇳', dial: '+86' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰', dial: '+45' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', dial: '+20' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹', dial: '+251' },
  { name: 'France', code: 'FR', flag: '🇫🇷', dial: '+33' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dial: '+49' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', dial: '+233' },
  { name: 'India', code: 'IN', flag: '🇮🇳', dial: '+91' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱', dial: '+972' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', dial: '+39' },
  { name: 'Jamaica', code: 'JM', flag: '🇯🇲', dial: '+1' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', dial: '+81' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', dial: '+254' },
  { name: 'Liberia', code: 'LR', flag: '🇱🇷', dial: '+231' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', dial: '+52' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', dial: '+31' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dial: '+234' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴', dial: '+47' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰', dial: '+92' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', dial: '+63' },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼', dial: '+250' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', dial: '+966' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', dial: '+27' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', dial: '+34' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭', dial: '+41' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', dial: '+255' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', dial: '+256' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dial: '+971' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dial: '+44' },
  { name: 'United States', code: 'US', flag: '🇺🇸', dial: '+1' },
  { name: 'Zambia', code: 'ZM', flag: '🇿🇲', dial: '+260' },
  { name: 'Zimbabwe', code: 'ZW', flag: '🇿🇼', dial: '+263' },
].sort((a, b) => a.name.localeCompare(b.name));

export function CountrySelect({ value, onValueChange, className }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCountry = countries.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal border-[#2FC4B2] h-11 rounded-[10px] bg-white text-left focus:ring-1 focus:ring-[#2FC4B2]',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedCountry ? (
              <>
                <span className="text-lg leading-none">{selectedCountry.flag}</span>
                <span className="truncate">{selectedCountry.name}</span>
                <span className="text-gray-400 text-[10px]">{selectedCountry.dial}</span>
              </>
            ) : (
              <span className="text-gray-400">Select country...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-[#2FC4B2]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-2xl z-[9999] rounded-[10px] border-[#2FC4B2]/20"
        align="start"
      >
        <Command className="rounded-[10px]">
          <CommandInput
            placeholder="Search country or dial code..."
            className="h-11 font-poppins"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dial}`}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                  className="cursor-pointer font-poppins text-sm py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none">{country.flag}</span>
                    <span className="font-medium">{country.name}</span>
                    <span className="text-xs text-gray-400">{country.dial}</span>
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 text-[#2FC4B2]',
                      value === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CountrySelect;
