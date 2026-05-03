import type { IncomeRecord } from '@/components/treasurydashboard/recordIncome/IncomeReceipt';
import { createIncomeTransaction } from '@/lib/treasuryApi';

/** Converts DD/MM/YYYY from the income form to ISO date for the API. */
export function dmyToIsoDate(dmy: string): string {
  const parts = dmy.trim().split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid date — use DD/MM/YYYY');
  }
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);
  if (!d || !m || !y || m > 12 || d > 31) {
    throw new Error('Invalid date');
  }
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function extractTxRef(detail: string | undefined, fallback: string): string {
  if (!detail?.trim()) {
    return fallback;
  }
  const m = detail.match(/Tx:\s*([^·\n]+)/i);
  const ref = m?.[1]?.trim();
  return ref && ref.length > 0 ? ref : fallback;
}

function extractBank(detail: string): string | null {
  const m = detail.match(/Bank System ·\s*([^·]+)/i);
  return m?.[1]?.trim() ?? null;
}

function extractCheque(detail: string): string {
  const m = detail.match(/Check:\s*([^·]+)/i);
  return m?.[1]?.trim() ?? 'CHK';
}

/** Maps UI payment fields to Django `IncomeTransaction` payment_method + related columns. */
export function mapPaymentFields(record: IncomeRecord): {
  payment_method: string;
  cheque_number: string | null;
  transaction_reference: string | null;
  bank_name: string | null;
} {
  if (record.paymentMethod === 'cash') {
    return {
      payment_method: 'CASH',
      cheque_number: null,
      transaction_reference: null,
      bank_name: null,
    };
  }

  if (record.paymentMethod === 'momo') {
    return {
      payment_method: 'MOBILE_MONEY',
      cheque_number: null,
      transaction_reference: extractTxRef(record.paymentDetail, 'MOBILE-TX'),
      bank_name: null,
    };
  }

  if (record.paymentMethod === 'bank_transfer') {
    const d = record.paymentDetail ?? '';
    if (d.includes('Cashier Check') || d.includes('Check:')) {
      return {
        payment_method: 'CHEQUE',
        cheque_number: extractCheque(d),
        transaction_reference: null,
        bank_name: extractBank(d) ?? '',
      };
    }
    return {
      payment_method: 'BANK_TRANSFER',
      cheque_number: null,
      transaction_reference: extractTxRef(record.paymentDetail, 'BANK-TX'),
      bank_name: extractBank(d) ?? '',
    };
  }

  return {
    payment_method: 'OTHER',
    cheque_number: null,
    transaction_reference: 'n/a',
    bank_name: null,
  };
}

/** Builds POST body for `/api/treasury/income-transactions/`. `record.incomeType` must be income category UUID. */
export function mapIncomeRecordToApiPayload(record: IncomeRecord): Record<string, unknown> {
  const iso = dmyToIsoDate(record.date);
  const notesParts: string[] = [];
  if (record.incomeTypeDetail?.trim()) {
    notesParts.push(record.incomeTypeDetail.trim());
  }
  if (record.currency && record.currency !== 'GHS') {
    notesParts.push(`Recorded in UI currency: ${record.currency}`);
  }
  if (record.notification?.length) {
    notesParts.push(`Notifications: ${record.notification.join(', ')}`);
  }

  const pm = mapPaymentFields(record);
  const memberId = typeof record.memberId === 'string' ? record.memberId.trim() : '';
  const hasMember = memberId.length > 0;
  const contributor = (record.memberName ?? '').trim();

  const payload: Record<string, unknown> = {
    transaction_date: iso,
    category_id: record.incomeType,
    service_type: 'WALK_IN',
    amount: Number(record.amount).toFixed(2),
    payment_method: pm.payment_method,
    cheque_number: pm.cheque_number ?? '',
    transaction_reference: pm.transaction_reference ?? '',
    bank_name: pm.bank_name ?? '',
    member: hasMember ? memberId : null,
    is_anonymous: false,
    contributor_name: hasMember ? '' : contributor,
    notes: notesParts.join(' | '),
    amount_in_words: '',
  };
  if (hasMember && record.pledgeId?.trim()) {
    payload.pledge = record.pledgeId.trim();
  }
  return payload;
}

export interface CreatedIncomeTransaction {
  id: string;
  receipt_number: string;
}

/** Persists one income row and returns server id + receipt number (generated on backend). */
export async function submitTreasuryIncomeRecord(
  record: IncomeRecord
): Promise<CreatedIncomeTransaction> {
  const payload = mapIncomeRecordToApiPayload(record);
  const raw = await createIncomeTransaction(payload);
  const data = raw as Record<string, unknown>;
  const id = String(data.id ?? '');
  const receipt_number = String(data.receipt_number ?? '');
  if (!id || !receipt_number) {
    throw new Error('Unexpected response from server when saving income.');
  }
  return { id, receipt_number };
}
