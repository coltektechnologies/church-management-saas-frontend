'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText,
  Smartphone,
  Building2,
  Banknote,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createExpenseTransaction,
  createIncomeTransaction,
  getExpenseCategories,
  getIncomeCategories,
} from '@/lib/treasuryApi';
import type { IncomeCategoryItem, ExpenseCategoryItem } from '@/lib/treasuryApi';

const PAYMENT_MAP: Record<string, string> = {
  cash: 'CASH',
  cheque: 'CHEQUE',
  momo: 'MOBILE_MONEY',
  bank: 'BANK_TRANSFER',
};

export function TransactionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawType = searchParams?.get('type') || 'expense';
  const isIncome = rawType === 'income';

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [registration, setRegistration] = useState('');
  const [notes] = useState('');

  const [incomeCategories, setIncomeCategories] = useState<IncomeCategoryItem[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [inc, exp] = await Promise.all([getIncomeCategories(), getExpenseCategories()]);
      setIncomeCategories(inc);
      setExpenseCategories(exp);
      if (inc.length && isIncome) {
        setCategoryId(inc[0]?.id ?? '');
      }
      if (exp.length && !isIncome) {
        setCategoryId(exp[0]?.id ?? '');
      }
    })();
  }, [isIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (!categoryId || !date || !paymentMethod || Number.isNaN(amt) || amt <= 0) {
      setError(
        'Please fill in all required fields (Name, Date, Category, Amount, Payment Method).'
      );
      return;
    }
    if (paymentMethod === 'cheque' && !chequeNumber) {
      setError('Cheque number is required for cheque payments.');
      return;
    }
    if ((paymentMethod === 'momo' || paymentMethod === 'bank') && !transactionRef) {
      setError('Transaction reference is required for Mobile Money and Bank Transfer.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        category_id: categoryId,
        transaction_date: date,
        amount: String(amt),
        payment_method: PAYMENT_MAP[paymentMethod] ?? 'CASH',
        cheque_number: paymentMethod === 'cheque' ? chequeNumber : undefined,
        transaction_reference:
          paymentMethod === 'momo' || paymentMethod === 'bank' ? transactionRef : undefined,
        notes: notes || registration || undefined,
      };
      if (isIncome) {
        payload.contributor_name = name || undefined;
        await createIncomeTransaction(payload);
      } else {
        payload.paid_to = name;
        payload.description = registration || `Payment to ${name}`;
        payload.recipient_phone = phone || undefined;
        await createExpenseTransaction(payload);
      }
      router.push('/admin/treasury');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  // Theming based on transaction type
  const theme = {
    color: isIncome ? 'bg-[#10b981]' : 'bg-[#f59e0b]',
    colorText: isIncome ? 'text-[#10b981]' : 'text-[#f59e0b]',
    colorBgLight: isIncome ? 'bg-[#10b981]/10' : 'bg-[#f59e0b]/10',
    colorBorder: isIncome ? 'border-[#10b981]' : 'border-[#f59e0b]',
    headerTitle: isIncome ? 'Record Income' : 'Record Expense',
    headerId: isIncome ? 'Income ID: INC-2934-8157' : 'Expense ID: EXP-2934-8156',
    headerDesc: isIncome
      ? 'Record and track church income streams with detailed documentation'
      : 'Record and track church expenses with detailed documentation and budget monitoring',
    section1Icon: <FileText className="w-5 h-5 text-white" />,
    section1Title: isIncome ? 'Source Information' : 'Recipient Information',
    section1Desc: isIncome ? 'Who provided the funds' : 'Who received the payment',
    section2Icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    section2Title: 'Authentication',
    section2Desc: 'Amount and payment information',

    // Fields specifics
    nameLabel: isIncome ? 'Received From' : 'Paid To',
    namePlaceholder: isIncome ? 'Name of donor or member' : 'Name of vendor or person',
    idLabel: isIncome ? 'Member ID' : 'ID Number',
    idPlaceholder: isIncome ? 'For registered members' : 'For individual recipient',
    registrationLabel: isIncome ? 'Organization Registration' : 'Vendor Registration',
    registrationPlaceholder: isIncome ? 'For corporate donations' : 'For company / vendor',
  };

  const paymentOptions = [
    { id: 'cash', label: 'Cash', icon: <Banknote className="w-6 h-6" /> },
    { id: 'cheque', label: 'Cheque', icon: <FileText className="w-6 h-6" /> },
    { id: 'momo', label: 'Mobile Money', icon: <Smartphone className="w-6 h-6" /> },
    { id: 'bank', label: 'Bank Transfer', icon: <Building2 className="w-6 h-6" /> },
  ];

  const categories = isIncome ? incomeCategories : expenseCategories;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto shadow-sm rounded-xl border border-slate-200 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* ─── Top Header Banner ─── */}
      <div
        className={`${theme.color} px-8 py-6 text-center text-white relative flex flex-col items-center justify-center`}
      >
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-6 h-6 opacity-90" />
          <h2 className="text-2xl font-bold tracking-tight">{theme.headerTitle}</h2>
        </div>
        <p className="text-[11px] font-medium tracking-wide uppercase opacity-90 mb-3">
          {theme.headerId}
        </p>
        <p className="text-sm font-medium opacity-90 max-w-md mx-auto">{theme.headerDesc}</p>
      </div>

      <div className="p-8 space-y-10">
        {/* ─── SECTION 1: Recipient / Source Info ─── */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div
              className={`w-10 h-10 rounded-lg ${theme.color} flex items-center justify-center shadow-inner`}
            >
              {theme.section1Icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B2A4A]">{theme.section1Title}</h3>
              <p className="text-sm text-slate-500">{theme.section1Desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {theme.nameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={theme.namePlaceholder}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Phone Number {!isIncome && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Recipient phone number"
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">{theme.idLabel}</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder={theme.idPlaceholder}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {theme.registrationLabel}
              </label>
              <input
                type="text"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder={theme.registrationPlaceholder}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: Authentication ─── */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div
              className={`w-10 h-10 rounded-lg ${theme.color} flex items-center justify-center shadow-inner`}
            >
              {theme.section2Icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B2A4A]">{theme.section2Title}</h3>
              <p className="text-sm text-slate-500">{theme.section2Desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1 md:col-span-2 border border-yellow-200 p-4 rounded-xl relative">
              <span className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold text-yellow-600 uppercase tracking-widest border border-yellow-200 rounded-full">
                Golden Rule
              </span>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                This UI uses a slightly adapted version from constraints to accommodate styling
                efficiently.
              </p>
            </div>

            {error && (
              <div className="md:col-span-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                {isIncome ? 'Income Category' : 'Expense Type'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                title="select category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-slate-600 appearance-none cursor-pointer"
              >
                <option value="">Select {isIncome ? 'Category' : 'Expense Type'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Amount (GH₵) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-slate-600"
              />
            </div>

            {(paymentMethod === 'cheque' ||
              paymentMethod === 'momo' ||
              paymentMethod === 'bank') && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  {paymentMethod === 'cheque' ? 'Cheque Number' : 'Transaction Reference'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paymentMethod === 'cheque' ? chequeNumber : transactionRef}
                  onChange={(e) =>
                    paymentMethod === 'cheque'
                      ? setChequeNumber(e.target.value)
                      : setTransactionRef(e.target.value)
                  }
                  placeholder={paymentMethod === 'cheque' ? 'Cheque number' : 'Reference number'}
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400"
                />
              </div>
            )}

            <div className="space-y-3 md:col-span-2 mt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Payment Method <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentOptions.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`flex flex-col items-center justify-center p-4 h-24 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? `${theme.colorBorder} ${theme.colorBgLight} shadow-sm relative scale-[1.02]`
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`mb-2 ${isSelected ? theme.colorText : 'text-slate-600'}`}>
                        {opt.icon}
                      </div>
                      <span
                        className={`text-[11px] font-bold ${isSelected ? theme.colorText : 'text-slate-600'}`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/treasury')}
            className="h-11 px-6 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className={`h-11 px-8 font-semibold text-white ${theme.color} hover:brightness-110 flex items-center gap-2 disabled:opacity-60`}
          >
            {submitting ? 'Saving...' : 'Save Transaction'} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
