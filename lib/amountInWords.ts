/**
 * Spell amounts for payment vouchers (Ghana Cedi / US Dollar with minor units).
 */
const UNITS_20 = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
] as const;

const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
] as const;

function capitalizeFirst(s: string): string {
  if (!s) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function underThousand(n: number): string {
  if (n === 0) {
    return '';
  }
  if (n < 20) {
    return UNITS_20[n] ?? '';
  }
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    const part = TENS[t] ?? '';
    return o ? `${part} ${UNITS_20[o]}` : part;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hPart = `${UNITS_20[h]} hundred`;
  return rest ? `${hPart} ${underThousand(rest)}` : hPart;
}

/** Non-negative integer to English words; does not use "and" before minor units. */
function integerToWords(n: number): string {
  if (n === 0) {
    return 'zero';
  }
  if (n < 0) {
    return `negative ${integerToWords(-n)}`;
  }
  if (n >= 1_000_000_000) {
    const a = Math.floor(n / 1_000_000_000);
    const rest = n % 1_000_000_000;
    return `${underThousand(a)} billion${rest ? ` ${integerToWords(rest)}` : ''}`.trim();
  }
  if (n >= 1_000_000) {
    const a = Math.floor(n / 1_000_000);
    const rest = n % 1_000_000;
    return `${underThousand(a)} million${rest ? ` ${integerToWords(rest)}` : ''}`.trim();
  }
  if (n >= 1_000) {
    const a = Math.floor(n / 1_000);
    const rest = n % 1_000;
    return `${underThousand(a)} thousand${rest ? ` ${underThousand(rest)}` : ''}`.trim();
  }
  return underThousand(n);
}

const MINOR_GHS: [string, string] = ['pesewa', 'pesewas'];
const MINOR_USD: [string, string] = ['cent', 'cents'];
const MAJOR_GHS: [string, string] = ['Ghana cedi', 'Ghana cedis'];
const MAJOR_USD: [string, string] = ['U.S. dollar', 'U.S. dollars'];

/**
 * Convert a currency amount to a full English phrase for the voucher.
 * e.g. GHS 123.50 → "One hundred twenty-three Ghana cedis and fifty pesewas"
 */
export function amountToCurrencyWords(value: string, currency: string): string {
  const raw = String(value).replace(/,/g, '').trim();
  if (!raw) {
    return '';
  }
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n < 0) {
    return '';
  }
  // Avoid float drift for 2 d.p.
  const totalCents = Math.round(n * 100);
  if (!Number.isFinite(totalCents)) {
    return '';
  }
  const intPart = Math.floor(totalCents / 100);
  const minorVal = totalCents % 100;
  const cur = (currency || 'GHS').toUpperCase();
  const isUsd = cur === 'USD';
  const majorPair = isUsd ? MAJOR_USD : MAJOR_GHS;
  const minorPair = isUsd ? MINOR_USD : MINOR_GHS;

  const majorLabel = intPart === 1 ? majorPair[0] : majorPair[1];
  const majorText = integerToWords(intPart);
  const minorLabel = minorVal === 1 ? minorPair[0] : minorPair[1];
  const minorText = integerToWords(minorVal);

  if (intPart === 0 && minorVal > 0) {
    return `${capitalizeFirst(minorText)} ${minorLabel} only`;
  }
  if (minorVal === 0) {
    return `${capitalizeFirst(majorText)} ${majorLabel} only`;
  }
  return `${capitalizeFirst(majorText)} ${majorLabel} and ${minorText} ${minorLabel}`;
}
