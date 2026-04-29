'use client';

import * as React from 'react';
import Flag from 'react-world-flags';
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

interface CountryCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** ISO alpha-2 from church country (step 1) — default dial code for this field */
  defaultCountryIso?: string;
  className?: string;
  placeholder?: string;
  error?: boolean;
}

export const dialCountries = [
  { name: 'Afghanistan', code: 'AF', dial: '+93' },
  { name: 'Albania', code: 'AL', dial: '+355' },
  { name: 'Algeria', code: 'DZ', dial: '+213' },
  { name: 'Angola', code: 'AO', dial: '+244' },
  { name: 'Argentina', code: 'AR', dial: '+54' },
  { name: 'Armenia', code: 'AM', dial: '+374' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'Austria', code: 'AT', dial: '+43' },
  { name: 'Azerbaijan', code: 'AZ', dial: '+994' },
  { name: 'Bahrain', code: 'BH', dial: '+973' },
  { name: 'Bangladesh', code: 'BD', dial: '+880' },
  { name: 'Belarus', code: 'BY', dial: '+375' },
  { name: 'Belgium', code: 'BE', dial: '+32' },
  { name: 'Benin', code: 'BJ', dial: '+229' },
  { name: 'Bolivia', code: 'BO', dial: '+591' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dial: '+387' },
  { name: 'Botswana', code: 'BW', dial: '+267' },
  { name: 'Brazil', code: 'BR', dial: '+55' },
  { name: 'Bulgaria', code: 'BG', dial: '+359' },
  { name: 'Burkina Faso', code: 'BF', dial: '+226' },
  { name: 'Burundi', code: 'BI', dial: '+257' },
  { name: 'Cambodia', code: 'KH', dial: '+855' },
  { name: 'Cameroon', code: 'CM', dial: '+237' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Chad', code: 'TD', dial: '+235' },
  { name: 'Chile', code: 'CL', dial: '+56' },
  { name: 'China', code: 'CN', dial: '+86' },
  { name: 'Colombia', code: 'CO', dial: '+57' },
  { name: 'Congo (Kinshasa)', code: 'CD', dial: '+243' },
  { name: 'Costa Rica', code: 'CR', dial: '+506' },
  { name: 'Croatia', code: 'HR', dial: '+385' },
  { name: 'Cuba', code: 'CU', dial: '+53' },
  { name: 'Cyprus', code: 'CY', dial: '+357' },
  { name: 'Czech Republic', code: 'CZ', dial: '+420' },
  { name: 'Denmark', code: 'DK', dial: '+45' },
  { name: 'Dominican Republic', code: 'DO', dial: '+1-809' },
  { name: 'Ecuador', code: 'EC', dial: '+593' },
  { name: 'Egypt', code: 'EG', dial: '+20' },
  { name: 'El Salvador', code: 'SV', dial: '+503' },
  { name: 'Ethiopia', code: 'ET', dial: '+251' },
  { name: 'Finland', code: 'FI', dial: '+358' },
  { name: 'France', code: 'FR', dial: '+33' },
  { name: 'Gabon', code: 'GA', dial: '+241' },
  { name: 'Gambia', code: 'GM', dial: '+220' },
  { name: 'Georgia', code: 'GE', dial: '+995' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Ghana', code: 'GH', dial: '+233' },
  { name: 'Greece', code: 'GR', dial: '+30' },
  { name: 'Guatemala', code: 'GT', dial: '+502' },
  { name: 'Guinea', code: 'GN', dial: '+224' },
  { name: 'Haiti', code: 'HT', dial: '+509' },
  { name: 'Honduras', code: 'HN', dial: '+504' },
  { name: 'Hungary', code: 'HU', dial: '+36' },
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'Indonesia', code: 'ID', dial: '+62' },
  { name: 'Iran', code: 'IR', dial: '+98' },
  { name: 'Iraq', code: 'IQ', dial: '+964' },
  { name: 'Ireland', code: 'IE', dial: '+353' },
  { name: 'Israel', code: 'IL', dial: '+972' },
  { name: 'Italy', code: 'IT', dial: '+39' },
  { name: 'Ivory Coast', code: 'CI', dial: '+225' },
  { name: 'Jamaica', code: 'JM', dial: '+1-876' },
  { name: 'Japan', code: 'JP', dial: '+81' },
  { name: 'Jordan', code: 'JO', dial: '+962' },
  { name: 'Kazakhstan', code: 'KZ', dial: '+7' },
  { name: 'Kenya', code: 'KE', dial: '+254' },
  { name: 'Kuwait', code: 'KW', dial: '+965' },
  { name: 'Laos', code: 'LA', dial: '+856' },
  { name: 'Latvia', code: 'LV', dial: '+371' },
  { name: 'Lebanon', code: 'LB', dial: '+961' },
  { name: 'Liberia', code: 'LR', dial: '+231' },
  { name: 'Libya', code: 'LY', dial: '+218' },
  { name: 'Lithuania', code: 'LT', dial: '+370' },
  { name: 'Luxembourg', code: 'LU', dial: '+352' },
  { name: 'Madagascar', code: 'MG', dial: '+261' },
  { name: 'Malawi', code: 'MW', dial: '+265' },
  { name: 'Malaysia', code: 'MY', dial: '+60' },
  { name: 'Mali', code: 'ML', dial: '+223' },
  { name: 'Malta', code: 'MT', dial: '+356' },
  { name: 'Mauritania', code: 'MR', dial: '+222' },
  { name: 'Mauritius', code: 'MU', dial: '+230' },
  { name: 'Mexico', code: 'MX', dial: '+52' },
  { name: 'Moldova', code: 'MD', dial: '+373' },
  { name: 'Mongolia', code: 'MN', dial: '+976' },
  { name: 'Montenegro', code: 'ME', dial: '+382' },
  { name: 'Morocco', code: 'MA', dial: '+212' },
  { name: 'Mozambique', code: 'MZ', dial: '+258' },
  { name: 'Myanmar', code: 'MM', dial: '+95' },
  { name: 'Namibia', code: 'NA', dial: '+264' },
  { name: 'Nepal', code: 'NP', dial: '+977' },
  { name: 'Netherlands', code: 'NL', dial: '+31' },
  { name: 'New Zealand', code: 'NZ', dial: '+64' },
  { name: 'Nicaragua', code: 'NI', dial: '+505' },
  { name: 'Niger', code: 'NE', dial: '+227' },
  { name: 'Nigeria', code: 'NG', dial: '+234' },
  { name: 'Norway', code: 'NO', dial: '+47' },
  { name: 'Oman', code: 'OM', dial: '+968' },
  { name: 'Pakistan', code: 'PK', dial: '+92' },
  { name: 'Palestine', code: 'PS', dial: '+970' },
  { name: 'Panama', code: 'PA', dial: '+507' },
  { name: 'Paraguay', code: 'PY', dial: '+595' },
  { name: 'Peru', code: 'PE', dial: '+51' },
  { name: 'Philippines', code: 'PH', dial: '+63' },
  { name: 'Poland', code: 'PL', dial: '+48' },
  { name: 'Portugal', code: 'PT', dial: '+351' },
  { name: 'Qatar', code: 'QA', dial: '+974' },
  { name: 'Romania', code: 'RO', dial: '+40' },
  { name: 'Russia', code: 'RU', dial: '+7' },
  { name: 'Rwanda', code: 'RW', dial: '+250' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'Senegal', code: 'SN', dial: '+221' },
  { name: 'Serbia', code: 'RS', dial: '+381' },
  { name: 'Sierra Leone', code: 'SL', dial: '+232' },
  { name: 'Singapore', code: 'SG', dial: '+65' },
  { name: 'Slovakia', code: 'SK', dial: '+421' },
  { name: 'Slovenia', code: 'SI', dial: '+386' },
  { name: 'Somalia', code: 'SO', dial: '+252' },
  { name: 'South Africa', code: 'ZA', dial: '+27' },
  { name: 'South Korea', code: 'KR', dial: '+82' },
  { name: 'South Sudan', code: 'SS', dial: '+211' },
  { name: 'Spain', code: 'ES', dial: '+34' },
  { name: 'Sri Lanka', code: 'LK', dial: '+94' },
  { name: 'Sudan', code: 'SD', dial: '+249' },
  { name: 'Sweden', code: 'SE', dial: '+46' },
  { name: 'Switzerland', code: 'CH', dial: '+41' },
  { name: 'Syria', code: 'SY', dial: '+963' },
  { name: 'Taiwan', code: 'TW', dial: '+886' },
  { name: 'Tanzania', code: 'TZ', dial: '+255' },
  { name: 'Thailand', code: 'TH', dial: '+66' },
  { name: 'Togo', code: 'TG', dial: '+228' },
  { name: 'Trinidad and Tobago', code: 'TT', dial: '+1-868' },
  { name: 'Tunisia', code: 'TN', dial: '+216' },
  { name: 'Turkey', code: 'TR', dial: '+90' },
  { name: 'Uganda', code: 'UG', dial: '+256' },
  { name: 'Ukraine', code: 'UA', dial: '+380' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'Uruguay', code: 'UY', dial: '+598' },
  { name: 'Uzbekistan', code: 'UZ', dial: '+998' },
  { name: 'Venezuela', code: 'VE', dial: '+58' },
  { name: 'Vietnam', code: 'VN', dial: '+84' },
  { name: 'Yemen', code: 'YE', dial: '+967' },
  { name: 'Zambia', code: 'ZM', dial: '+260' },
  { name: 'Zimbabwe', code: 'ZW', dial: '+263' },
].sort((a, b) => a.name.localeCompare(b.name));

function matchDialPrefix(
  full: string,
  countries: typeof dialCountries
): { code: string; local: string } {
  const t = full.trim();
  if (!t) {
    return { code: 'GH', local: '' };
  }
  const sorted = [...countries].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (t.startsWith(c.dial)) {
      const rest = t.slice(c.dial.length).trim().replace(/^[\s\-]+/, '');
      return { code: c.code, local: rest };
    }
  }
  const digitsOnly = t.replace(/\D/g, '');
  return { code: 'GH', local: digitsOnly };
}

export function CountryCodeInput({
  value,
  onChange,
  defaultCountryIso,
  className,
  placeholder = '000 000 0000',
  error = false,
}: CountryCodeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState(() => {
    const iso = defaultCountryIso?.trim().toUpperCase();
    if (iso && dialCountries.some((d) => d.code === iso)) {
      return iso;
    }
    return 'GH';
  });
  const [localNumber, setLocalNumber] = React.useState('');

  const selectedCountry = dialCountries.find((c) => c.code === selectedCode);

  React.useEffect(() => {
    const iso = defaultCountryIso?.trim().toUpperCase();
    if (!iso || !dialCountries.some((d) => d.code === iso)) {
      return;
    }
    setSelectedCode(iso);
  }, [defaultCountryIso]);

  React.useEffect(() => {
    const v = (value || '').trim();
    if (!v) {
      setLocalNumber('');
      return;
    }
    const parsed = matchDialPrefix(value, dialCountries);
    setSelectedCode(parsed.code);
    setLocalNumber(parsed.local);
  }, [value]);

  // When user picks a country from dropdown
  const handleCountrySelect = (code: string) => {
    const country = dialCountries.find((c) => c.code === code);
    setSelectedCode(code);
    setOpen(false);
    // Keep existing local number, just swap the dial prefix
    onChange(`${country?.dial ?? ''} ${localNumber}`.trim());
  };

  // User types in the number field — they only type digits after the code
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits, spaces, dashes, parentheses — no + needed since code is shown separately
    const cleaned = e.target.value.replace(/[^\d\s\-()]/g, '');
    setLocalNumber(cleaned);
    onChange(`${selectedCountry?.dial ?? ''} ${cleaned}`.trim());
  };

  return (
    <div
      className={cn(
        'flex h-10 w-full rounded-[10px] border overflow-hidden transition-all bg-white',
        error
          ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-300'
          : 'border-[#2FC4B2] focus-within:ring-1 focus-within:ring-[#2FC4B2]',
        className
      )}
    >
      {/* Country Code Dropdown Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 bg-gray-50 border-r border-[#2FC4B2] hover:bg-[#f0fdfb] transition-colors shrink-0"
          >
            {selectedCountry ? (
              <Flag
                code={selectedCountry.code}
                style={{
                  width: 20,
                  height: 14,
                  objectFit: 'cover',
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div className="w-5 h-3.5 bg-gray-200 rounded" />
            )}
            <span className="text-[12px] font-bold text-[#0B2A4A] whitespace-nowrap">
              {selectedCountry?.dial ?? '+??'}
            </span>
            <ChevronsUpDown className="h-3 w-3 text-[#2FC4B2] opacity-70 shrink-0" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[290px] p-0 shadow-2xl z-[9999] rounded-[10px] border border-[#2FC4B2]/30"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search country or +code..." className="h-10 text-sm" />
            <CommandList className="max-h-[250px]">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {dialCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dial}`}
                    onSelect={() => handleCountrySelect(country.code)}
                    className="cursor-pointer text-sm py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Flag
                        code={country.code}
                        style={{
                          width: 24,
                          height: 16,
                          objectFit: 'cover',
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <span className="font-medium text-[#0B2A4A]">{country.name}</span>
                      <span className="text-xs text-gray-400">{country.dial}</span>
                    </div>
                    <Check
                      className={cn(
                        'h-4 w-4 text-[#2FC4B2] shrink-0',
                        selectedCode === country.code ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Number input — user only types digits, no need to retype the code */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1 px-3 text-sm bg-white outline-none text-[#0B2A4A] placeholder:text-gray-300 min-w-0"
      />
    </div>
  );
}

export default CountryCodeInput;
