/**
 * recordIncomeData.ts
 */

// ── Member type ───────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  memberId: string;
}

// ── Dummy members (replace with a real API call in production) ────────────────
export const DUMMY_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Abena Mensah',
    phone: '0244123456',
    email: 'abena@example.com',
    memberId: 'MBR-001',
  },
  {
    id: '2',
    name: 'Kwame Asante',
    phone: '0201987654',
    email: 'kwame@example.com',
    memberId: 'MBR-002',
  },
  {
    id: '3',
    name: 'Ama Boateng',
    phone: '0277654321',
    email: 'ama@example.com',
    memberId: 'MBR-003',
  },
  {
    id: '4',
    name: 'Kofi Agyeman',
    phone: '0244789012',
    email: 'kofi@example.com',
    memberId: 'MBR-004',
  },
  {
    id: '5',
    name: 'Akosua Frimpong',
    phone: '0209876543',
    email: 'akosua@example.com',
    memberId: 'MBR-005',
  },
  {
    id: '6',
    name: 'Yaw Darko',
    phone: '0551234567',
    email: 'yaw@example.com',
    memberId: 'MBR-006',
  },
  {
    id: '7',
    name: 'Efua Acheampong',
    phone: '0261234567',
    email: 'efua@example.com',
    memberId: 'MBR-007',
  },
  {
    id: '8',
    name: 'Kweku Owusu',
    phone: '0241234567',
    email: 'kweku@example.com',
    memberId: 'MBR-008',
  },
  {
    id: '9',
    name: 'Adwoa Nyarko',
    phone: '0271234567',
    email: 'adwoa@example.com',
    memberId: 'MBR-009',
  },
  {
    id: '10',
    name: 'Nana Yeboah',
    phone: '0241111222',
    email: 'nana@example.com',
    memberId: 'MBR-010',
  },
  {
    id: '11',
    name: 'Maame Serwaa',
    phone: '0203456789',
    email: 'maame@example.com',
    memberId: 'MBR-011',
  },
  {
    id: '12',
    name: 'Osei Bonsu',
    phone: '0244567890',
    email: 'osei@example.com',
    memberId: 'MBR-012',
  },
  {
    id: '13',
    name: 'Esi Turkson',
    phone: '0207654321',
    email: 'esi@example.com',
    memberId: 'MBR-013',
  },
  {
    id: '14',
    name: 'Bright Amoah',
    phone: '0556789012',
    email: 'bright@example.com',
    memberId: 'MBR-014',
  },
  {
    id: '15',
    name: 'Grace Asiedu',
    phone: '0248765432',
    email: 'grace@example.com',
    memberId: 'MBR-015',
  },
];

// ── Static lookup arrays (kept for reference / exports) ──────────────────────
export const CURRENCIES = [
  { code: 'GHS', symbol: '₵', name: 'Ghana Cedis' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const INCOME_TYPES = [
  { value: 'tithe', label: 'Tithe' },
  { value: 'offering', label: 'Offering' },
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'harvest', label: 'Harvest & Pledge' },
  { value: 'welfare', label: 'Welfare' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'momo', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

export const MOMO_NETWORKS = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'telecel', label: 'Telecel Cash' },
  { value: 'airteltigo', label: 'AirtelTigo Money' },
];

export const BANK_TRANSFER_TYPES = [
  { value: 'cashier_check', label: 'Cashier Check' },
  { value: 'bank_system', label: 'Bank System Transfer' },
];

export const NOTIFICATION_TYPES = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both' },
];

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Generate a unique receipt number based on timestamp + random suffix */
export function makeReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const ms = now.getTime().toString().slice(-6);
  const rand = Math.floor(Math.random() * 90 + 10);
  return `RCP-${year}-${ms}${rand}`;
}

/** Today's date formatted as DD/MM/YYYY */
export function todayDMY(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${now.getFullYear()}`;
}

/** Current datetime as a short human-readable string */
export function nowString(): string {
  return new Date().toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Currency symbol lookup */
export function getCurrencySymbol(code: string): string {
  const map: Record<string, string> = { GHS: '₵', USD: '$', EUR: '€', GBP: '£' };
  return map[code] ?? code;
}

/** Format a number as currency string with symbol */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  return `${sym} ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── LocalStorage persistence helpers ─────────────────────────────────────────
import type { IncomeRecord } from './IncomeReceipt';

const RECORDS_KEY = 'treasury_income_records_v1';

/**
 * Load income records from localStorage.
 */
export function loadRecords(): IncomeRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as IncomeRecord[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persist all income records to localStorage.
 */
export function saveRecords(records: IncomeRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    /* quota exceeded — ignore */
  }
}
