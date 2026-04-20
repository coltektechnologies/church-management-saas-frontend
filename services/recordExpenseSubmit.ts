import { createExpenseTransaction } from '@/lib/treasuryApi';

export interface RecordExpenseFormShape {
  date: string;
  expenseType: string;
  department: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  paidTo: string;
  phoneNumber?: string;
  idNumber?: string;
  vendorRegistration?: string;
  chequeNumber?: string;
  transactionRef?: string;
  bankName?: string;
  linkedExpenseRequestId?: string;
}

/** UI payment row ids → Django ExpenseTransaction.payment_method */
export function mapExpensePaymentMethod(ui: string): string {
  switch (ui) {
    case 'Cheque':
      return 'CHEQUE';
    case 'Bank':
      return 'BANK_TRANSFER';
    case 'Mobile':
      return 'MOBILE_MONEY';
    case 'Cash':
    default:
      return 'CASH';
  }
}

function buildNotes(data: RecordExpenseFormShape): string {
  const parts: string[] = [];
  if (data.vendorRegistration?.trim()) {
    parts.push(`Vendor reg: ${data.vendorRegistration.trim()}`);
  }
  if (data.currency && data.currency !== 'GHS') {
    parts.push(`Currency: ${data.currency}`);
  }
  return parts.join(' · ');
}

export function mapRecordExpenseToApiPayload(
  data: RecordExpenseFormShape
): Record<string, unknown> {
  const payment_method = mapExpensePaymentMethod(data.paymentMethod);
  const cheque_number = payment_method === 'CHEQUE' ? (data.chequeNumber ?? '').trim() || '' : '';
  const transaction_reference =
    payment_method === 'MOBILE_MONEY' || payment_method === 'BANK_TRANSFER'
      ? (data.transactionRef ?? '').trim() || ''
      : '';
  const bank_name = payment_method === 'BANK_TRANSFER' ? (data.bankName ?? '').trim() || '' : '';

  const notes = buildNotes(data);

  const payload: Record<string, unknown> = {
    transaction_date: data.date,
    category_id: data.expenseType,
    department_id: data.department,
    amount: Number(data.amount).toFixed(2),
    amount_in_words: '',
    payment_method,
    cheque_number,
    transaction_reference,
    bank_name,
    paid_to: data.paidTo.trim(),
    recipient_phone: (data.phoneNumber ?? '').trim(),
    recipient_id: (data.idNumber ?? '').trim(),
    description: data.description.trim(),
    notes: notes || '',
  };

  const reqId = data.linkedExpenseRequestId?.trim();
  if (reqId) {
    payload.expense_request = reqId;
  }

  return payload;
}

export interface CreatedExpenseTransaction {
  id: string;
  voucher_number: string;
}

export async function submitTreasuryExpenseRecord(
  data: RecordExpenseFormShape
): Promise<CreatedExpenseTransaction> {
  const payload = mapRecordExpenseToApiPayload(data);
  const raw = await createExpenseTransaction(payload);
  const row = raw as Record<string, unknown>;
  const id = String(row.id ?? '');
  const voucher_number = String(row.voucher_number ?? '');
  if (!id || !voucher_number) {
    throw new Error('Unexpected response when saving expense.');
  }
  return { id, voucher_number };
}
