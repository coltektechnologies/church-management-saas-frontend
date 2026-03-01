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

// Complete list of countries with their flags and dial codes
const countries = [
  { name: 'Afghanistan', code: 'AF', flag: '🇦🇫', dial: '+93' },
  { name: 'Albania', code: 'AL', flag: '🇦🇱', dial: '+355' },
  { name: 'Algeria', code: 'DZ', flag: '🇩🇿', dial: '+213' },
  { name: 'Andorra', code: 'AD', flag: '🇦🇩', dial: '+376' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴', dial: '+244' },
  { name: 'Antigua and Barbuda', code: 'AG', flag: '🇦🇬', dial: '+1-268' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷', dial: '+54' },
  { name: 'Armenia', code: 'AM', flag: '🇦🇲', dial: '+374' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dial: '+61' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹', dial: '+43' },
  { name: 'Azerbaijan', code: 'AZ', flag: '🇦🇿', dial: '+994' },
  { name: 'Bahamas', code: 'BS', flag: '🇧🇸', dial: '+1-242' },
  { name: 'Bahrain', code: 'BH', flag: '🇧🇭', dial: '+973' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', dial: '+880' },
  { name: 'Barbados', code: 'BB', flag: '🇧🇧', dial: '+1-246' },
  { name: 'Belarus', code: 'BY', flag: '🇧🇾', dial: '+375' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪', dial: '+32' },
  { name: 'Belize', code: 'BZ', flag: '🇧🇿', dial: '+501' },
  { name: 'Benin', code: 'BJ', flag: '🇧🇯', dial: '+229' },
  { name: 'Bhutan', code: 'BT', flag: '🇧🇹', dial: '+975' },
  { name: 'Bolivia', code: 'BO', flag: '🇧🇴', dial: '+591' },
  { name: 'Bosnia and Herzegovina', code: 'BA', flag: '🇧🇦', dial: '+387' },
  { name: 'Botswana', code: 'BW', flag: '🇧🇼', dial: '+267' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', dial: '+55' },
  { name: 'Brunei', code: 'BN', flag: '🇧🇳', dial: '+673' },
  { name: 'Bulgaria', code: 'BG', flag: '🇧🇬', dial: '+359' },
  { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', dial: '+226' },
  { name: 'Burundi', code: 'BI', flag: '🇧🇮', dial: '+257' },
  { name: 'Cabo Verde', code: 'CV', flag: '🇨🇻', dial: '+238' },
  { name: 'Cambodia', code: 'KH', flag: '🇰🇭', dial: '+855' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', dial: '+237' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dial: '+1' },
  { name: 'Central African Republic', code: 'CF', flag: '🇨🇫', dial: '+236' },
  { name: 'Chad', code: 'TD', flag: '🇹🇩', dial: '+235' },
  { name: 'Chile', code: 'CL', flag: '🇨🇱', dial: '+56' },
  { name: 'China', code: 'CN', flag: '🇨🇳', dial: '+86' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴', dial: '+57' },
  { name: 'Comoros', code: 'KM', flag: '🇰🇲', dial: '+269' },
  { name: 'Congo (Brazzaville)', code: 'CG', flag: '🇨🇬', dial: '+242' },
  { name: 'Congo (Kinshasa)', code: 'CD', flag: '🇨🇩', dial: '+243' },
  { name: 'Costa Rica', code: 'CR', flag: '🇨🇷', dial: '+506' },
  { name: 'Croatia', code: 'HR', flag: '🇭🇷', dial: '+385' },
  { name: 'Cuba', code: 'CU', flag: '🇨🇺', dial: '+53' },
  { name: 'Cyprus', code: 'CY', flag: '🇨🇾', dial: '+357' },
  { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿', dial: '+420' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰', dial: '+45' },
  { name: 'Djibouti', code: 'DJ', flag: '🇩🇯', dial: '+253' },
  { name: 'Dominica', code: 'DM', flag: '🇩🇲', dial: '+1-767' },
  { name: 'Dominican Republic', code: 'DO', flag: '🇩🇴', dial: '+1-809' },
  { name: 'Ecuador', code: 'EC', flag: '🇪🇨', dial: '+593' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', dial: '+20' },
  { name: 'El Salvador', code: 'SV', flag: '🇸🇻', dial: '+503' },
  { name: 'Equatorial Guinea', code: 'GQ', flag: '🇬🇶', dial: '+240' },
  { name: 'Eritrea', code: 'ER', flag: '🇪🇷', dial: '+291' },
  { name: 'Estonia', code: 'EE', flag: '🇪🇪', dial: '+372' },
  { name: 'Eswatini', code: 'SZ', flag: '🇸🇿', dial: '+268' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹', dial: '+251' },
  { name: 'Fiji', code: 'FJ', flag: '🇫🇯', dial: '+679' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮', dial: '+358' },
  { name: 'France', code: 'FR', flag: '🇫🇷', dial: '+33' },
  { name: 'Gabon', code: 'GA', flag: '🇬🇦', dial: '+241' },
  { name: 'Gambia', code: 'GM', flag: '🇬🇲', dial: '+220' },
  { name: 'Georgia', code: 'GE', flag: '🇬🇪', dial: '+995' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dial: '+49' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', dial: '+233' },
  { name: 'Greece', code: 'GR', flag: '🇬🇷', dial: '+30' },
  { name: 'Grenada', code: 'GD', flag: '🇬🇩', dial: '+1-473' },
  { name: 'Guatemala', code: 'GT', flag: '🇬🇹', dial: '+502' },
  { name: 'Guinea', code: 'GN', flag: '🇬🇳', dial: '+224' },
  { name: 'Guinea-Bissau', code: 'GW', flag: '🇬🇼', dial: '+245' },
  { name: 'Guyana', code: 'GY', flag: '🇬🇾', dial: '+592' },
  { name: 'Haiti', code: 'HT', flag: '🇭🇹', dial: '+509' },
  { name: 'Honduras', code: 'HN', flag: '🇭🇳', dial: '+504' },
  { name: 'Hungary', code: 'HU', flag: '🇭🇺', dial: '+36' },
  { name: 'Iceland', code: 'IS', flag: '🇮🇸', dial: '+354' },
  { name: 'India', code: 'IN', flag: '🇮🇳', dial: '+91' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', dial: '+62' },
  { name: 'Iran', code: 'IR', flag: '🇮🇷', dial: '+98' },
  { name: 'Iraq', code: 'IQ', flag: '🇮🇶', dial: '+964' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪', dial: '+353' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱', dial: '+972' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', dial: '+39' },
  { name: 'Ivory Coast', code: 'CI', flag: '🇨🇮', dial: '+225' },
  { name: 'Jamaica', code: 'JM', flag: '🇯🇲', dial: '+1-876' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', dial: '+81' },
  { name: 'Jordan', code: 'JO', flag: '🇯🇴', dial: '+962' },
  { name: 'Kazakhstan', code: 'KZ', flag: '🇰🇿', dial: '+7' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', dial: '+254' },
  { name: 'Kiribati', code: 'KI', flag: '🇰🇮', dial: '+686' },
  { name: 'Kosovo', code: 'XK', flag: '🇽🇰', dial: '+383' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼', dial: '+965' },
  { name: 'Kyrgyzstan', code: 'KG', flag: '🇰🇬', dial: '+996' },
  { name: 'Laos', code: 'LA', flag: '🇱🇦', dial: '+856' },
  { name: 'Latvia', code: 'LV', flag: '🇱🇻', dial: '+371' },
  { name: 'Lebanon', code: 'LB', flag: '🇱🇧', dial: '+961' },
  { name: 'Lesotho', code: 'LS', flag: '🇱🇸', dial: '+266' },
  { name: 'Liberia', code: 'LR', flag: '🇱🇷', dial: '+231' },
  { name: 'Libya', code: 'LY', flag: '🇱🇾', dial: '+218' },
  { name: 'Liechtenstein', code: 'LI', flag: '🇱🇮', dial: '+423' },
  { name: 'Lithuania', code: 'LT', flag: '🇱🇹', dial: '+370' },
  { name: 'Luxembourg', code: 'LU', flag: '🇱🇺', dial: '+352' },
  { name: 'Madagascar', code: 'MG', flag: '🇲🇬', dial: '+261' },
  { name: 'Malawi', code: 'MW', flag: '🇲🇼', dial: '+265' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', dial: '+60' },
  { name: 'Maldives', code: 'MV', flag: '🇲🇻', dial: '+960' },
  { name: 'Mali', code: 'ML', flag: '🇲🇱', dial: '+223' },
  { name: 'Malta', code: 'MT', flag: '🇲🇹', dial: '+356' },
  { name: 'Marshall Islands', code: 'MH', flag: '🇲🇭', dial: '+692' },
  { name: 'Mauritania', code: 'MR', flag: '🇲🇷', dial: '+222' },
  { name: 'Mauritius', code: 'MU', flag: '🇲🇺', dial: '+230' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', dial: '+52' },
  { name: 'Micronesia', code: 'FM', flag: '🇫🇲', dial: '+691' },
  { name: 'Moldova', code: 'MD', flag: '🇲🇩', dial: '+373' },
  { name: 'Monaco', code: 'MC', flag: '🇲🇨', dial: '+377' },
  { name: 'Mongolia', code: 'MN', flag: '🇲🇳', dial: '+976' },
  { name: 'Montenegro', code: 'ME', flag: '🇲🇪', dial: '+382' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', dial: '+212' },
  { name: 'Mozambique', code: 'MZ', flag: '🇲🇿', dial: '+258' },
  { name: 'Myanmar', code: 'MM', flag: '🇲🇲', dial: '+95' },
  { name: 'Namibia', code: 'NA', flag: '🇳🇦', dial: '+264' },
  { name: 'Nauru', code: 'NR', flag: '🇳🇷', dial: '+674' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵', dial: '+977' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', dial: '+31' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', dial: '+64' },
  { name: 'Nicaragua', code: 'NI', flag: '🇳🇮', dial: '+505' },
  { name: 'Niger', code: 'NE', flag: '🇳🇪', dial: '+227' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dial: '+234' },
  { name: 'North Korea', code: 'KP', flag: '🇰🇵', dial: '+850' },
  { name: 'North Macedonia', code: 'MK', flag: '🇲🇰', dial: '+389' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴', dial: '+47' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲', dial: '+968' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰', dial: '+92' },
  { name: 'Palau', code: 'PW', flag: '🇵🇼', dial: '+680' },
  { name: 'Palestine', code: 'PS', flag: '🇵🇸', dial: '+970' },
  { name: 'Panama', code: 'PA', flag: '🇵🇦', dial: '+507' },
  { name: 'Papua New Guinea', code: 'PG', flag: '🇵🇬', dial: '+675' },
  { name: 'Paraguay', code: 'PY', flag: '🇵🇾', dial: '+595' },
  { name: 'Peru', code: 'PE', flag: '🇵🇪', dial: '+51' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', dial: '+63' },
  { name: 'Poland', code: 'PL', flag: '🇵🇱', dial: '+48' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', dial: '+351' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦', dial: '+974' },
  { name: 'Romania', code: 'RO', flag: '🇷🇴', dial: '+40' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺', dial: '+7' },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼', dial: '+250' },
  { name: 'Saint Kitts and Nevis', code: 'KN', flag: '🇰🇳', dial: '+1-869' },
  { name: 'Saint Lucia', code: 'LC', flag: '🇱🇨', dial: '+1-758' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', flag: '🇻🇨', dial: '+1-784' },
  { name: 'Samoa', code: 'WS', flag: '🇼🇸', dial: '+685' },
  { name: 'San Marino', code: 'SM', flag: '🇸🇲', dial: '+378' },
  { name: 'São Tomé and Príncipe', code: 'ST', flag: '🇸🇹', dial: '+239' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', dial: '+966' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', dial: '+221' },
  { name: 'Serbia', code: 'RS', flag: '🇷🇸', dial: '+381' },
  { name: 'Seychelles', code: 'SC', flag: '🇸🇨', dial: '+248' },
  { name: 'Sierra Leone', code: 'SL', flag: '🇸🇱', dial: '+232' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', dial: '+65' },
  { name: 'Slovakia', code: 'SK', flag: '🇸🇰', dial: '+421' },
  { name: 'Slovenia', code: 'SI', flag: '🇸🇮', dial: '+386' },
  { name: 'Solomon Islands', code: 'SB', flag: '🇸🇧', dial: '+677' },
  { name: 'Somalia', code: 'SO', flag: '🇸🇴', dial: '+252' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', dial: '+27' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', dial: '+82' },
  { name: 'South Sudan', code: 'SS', flag: '🇸🇸', dial: '+211' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', dial: '+34' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', dial: '+94' },
  { name: 'Sudan', code: 'SD', flag: '🇸🇩', dial: '+249' },
  { name: 'Suriname', code: 'SR', flag: '🇸🇷', dial: '+597' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪', dial: '+46' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭', dial: '+41' },
  { name: 'Syria', code: 'SY', flag: '🇸🇾', dial: '+963' },
  { name: 'Taiwan', code: 'TW', flag: '🇹🇼', dial: '+886' },
  { name: 'Tajikistan', code: 'TJ', flag: '🇹🇯', dial: '+992' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', dial: '+255' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', dial: '+66' },
  { name: 'Timor-Leste', code: 'TL', flag: '🇹🇱', dial: '+670' },
  { name: 'Togo', code: 'TG', flag: '🇹🇬', dial: '+228' },
  { name: 'Tonga', code: 'TO', flag: '🇹🇴', dial: '+676' },
  { name: 'Trinidad and Tobago', code: 'TT', flag: '🇹🇹', dial: '+1-868' },
  { name: 'Tunisia', code: 'TN', flag: '🇹🇳', dial: '+216' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', dial: '+90' },
  { name: 'Turkmenistan', code: 'TM', flag: '🇹🇲', dial: '+993' },
  { name: 'Tuvalu', code: 'TV', flag: '🇹🇻', dial: '+688' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', dial: '+256' },
  { name: 'Ukraine', code: 'UA', flag: '🇺🇦', dial: '+380' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dial: '+971' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dial: '+44' },
  { name: 'United States', code: 'US', flag: '🇺🇸', dial: '+1' },
  { name: 'Uruguay', code: 'UY', flag: '🇺🇾', dial: '+598' },
  { name: 'Uzbekistan', code: 'UZ', flag: '🇺🇿', dial: '+998' },
  { name: 'Vanuatu', code: 'VU', flag: '🇻🇺', dial: '+678' },
  { name: 'Vatican City', code: 'VA', flag: '🇻🇦', dial: '+379' },
  { name: 'Venezuela', code: 'VE', flag: '🇻🇪', dial: '+58' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', dial: '+84' },
  { name: 'Yemen', code: 'YE', flag: '🇾🇪', dial: '+967' },
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
