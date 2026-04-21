'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Plus,
  Trash2,
  CloudUpload,
  FileText,
  X,
  CheckCircle,
  Save,
  Eye,
} from 'lucide-react';
import { Expense, ExpenseItem } from '@/types/expense';
import { Department } from '@/types/Department';
import { fetchExpenseCategoriesActive, type ExpenseCategoryItem } from '@/lib/treasuryApi';
import ExpenseDashboardHeader from './ExpenseDashboardHeader';

/** Row/expense ids in the browser; `randomUUID` is not available in some HTTP / older clients. */
function clientRandomId(): string {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

interface Props {
  department: Department;
  expenses: Expense[];
  onSubmit: (
    expense: Expense,
    options: { categoryId: string }
  ) => Promise<{ requestNumber: string; status: string }>;
}

const APPROVAL_CHAIN = [
  {
    initials: 'HD',
    role: 'Head of Department',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-600',
    track: 'bg-blue-500',
  },
  {
    initials: 'EL',
    role: 'Elder in Charge',
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    text: 'text-purple-600',
    track: 'bg-purple-500',
  },
  {
    initials: 'TR',
    role: 'Treasury',
    bg: 'bg-green-500',
    border: 'border-green-500',
    text: 'text-green-600',
    track: 'bg-green-500',
  },
  {
    initials: 'FE',
    role: 'First Elder',
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    text: 'text-orange-600',
    track: 'bg-orange-500',
  },
];

type Screen = 'form' | 'success';

export default function ExpenseFormPage({ department, expenses, onSubmit }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const draftKey = `expense_draft_${department.id}`;

  const [screen, setScreen] = useState<Screen>('form');
  const [submittedRef, setSubmittedRef] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [submitterName, setSubmitterName] = useState('');
  const [title, setTitle] = useState('');
  const [justification, setJustification] = useState('');
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: clientRandomId(), name: '', quantity: 1, unitCost: 0 },
  ]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryItem[]>([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [showExpenseCategoryHelp, setShowExpenseCategoryHelp] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fastTracked, setFastTracked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCategoriesError('');
    setShowExpenseCategoryHelp(false);
    void (async () => {
      try {
        const cats = await fetchExpenseCategoriesActive();
        if (cancelled) {
          return;
        }
        setExpenseCategories(cats);
        setShowExpenseCategoryHelp(cats.length === 0);
      } catch (e) {
        if (!cancelled) {
          setExpenseCategories([]);
          setCategoriesError(
            e instanceof Error ? e.message : 'Could not load expense categories from the server.'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (!saved) {
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      if (parsed.submitterName) {
        setSubmitterName(parsed.submitterName);
      }
      if (parsed.title) {
        setTitle(parsed.title);
      }
      if (parsed.justification) {
        setJustification(parsed.justification);
      }
      if (parsed.items?.length) {
        setItems(parsed.items);
      }
    } catch {
      /* corrupted draft — ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grandTotal = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  const qualifiesThreshold =
    grandTotal > 0 && grandTotal <= department.settings.autoApprovalThreshold;

  const addItem = () =>
    setItems((prev) => [...prev, { id: clientRandomId(), name: '', quantity: 1, unitCost: 0 }]);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof ExpenseItem, value: string | number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const addFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }
    setDocuments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) => setDocuments((prev) => prev.filter((_, i) => i !== index));
  const selectedCategory = expenseCategories.find((c) => c.id === categoryId);

  const handleSaveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify({ submitterName, title, justification, items }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async () => {
    setError('');
    if (!submitterName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an expense title.');
      return;
    }
    if (!categoryId) {
      setError('Please select an expense category.');
      return;
    }
    if (items.some((i) => !i.name.trim())) {
      setError('Please fill in all item names.');
      return;
    }
    if (grandTotal === 0) {
      setError('Total amount cannot be zero.');
      return;
    }
    if (!justification.trim()) {
      setError('Please provide a justification.');
      return;
    }

    const expense: Expense = {
      id: clientRandomId(),
      expenseRef: '',
      title,
      category: selectedCategory?.name ?? '',
      description: justification,
      submitterName,
      items,
      amount: grandTotal,
      documents: documents.map((f) => f.name),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      const result = await onSubmit(expense, { categoryId });
      localStorage.removeItem(draftKey);
      setSubmittedRef(result.requestNumber);
      setFastTracked(result.status === 'DEPT_HEAD_APPROVED');
      setScreen('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit expense request');
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <div className="min-h-full bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-6 max-w-md w-full shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Request Submitted!</h2>
            <p className="text-gray-500">
              Your expense request has been submitted and is pending approval.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-8 py-6 space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Reference Number</p>
            <p className="text-3xl font-bold text-blue-600 tracking-wider font-mono">
              {submittedRef}
            </p>
            <p className="text-xs text-gray-400">
              Keep this for tracking · Treasury uses this for reporting
            </p>
          </div>
          {fastTracked && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              ⚡ Submitted as department head/elder — first approval step recorded automatically.
            </p>
          )}
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition w-full"
          >
            Back to Departments
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-full bg-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {/* Header with stats */}
          <ExpenseDashboardHeader
            expenses={expenses}
            departmentName={department.name}
            departmentCode={department.code}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── LEFT: Main form ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Voucher card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-widest">Department</p>
                    <p className="text-2xl font-bold mt-0.5">{department.name}</p>
                    <p className="text-sm text-blue-200 mt-0.5">{department.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-200 uppercase tracking-widest">Date</p>
                    <p className="text-base font-semibold mt-0.5">
                      {new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name + Title */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Submitter Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pastor William Owusu"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Expense Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Youth Camp Materials"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Expense category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="">Select category</option>
                      {expenseCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {categoriesError && (
                      <p className="text-xs text-red-600 mt-1.5" role="alert">
                        {categoriesError}
                      </p>
                    )}
                    {!categoriesError && showExpenseCategoryHelp && (
                      <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mt-1.5 space-y-1.5 leading-relaxed">
                        <p>There are no expense categories for your church yet.</p>
                        <p>
                          Sign in with a <strong>treasury</strong> account and open{' '}
                          <Link
                            href="/treasury/expense-categories"
                            className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-950"
                          >
                            Treasury → Expense categories
                          </Link>{' '}
                          (
                          <span className="font-mono text-[11px]">
                            /treasury/expense-categories
                          </span>
                          ), or as <strong>church admin</strong> open{' '}
                          <Link
                            href="/admin/treasury/expense-categories"
                            className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-950"
                          >
                            Admin → Treasury → Expense categories
                          </Link>{' '}
                          (
                          <span className="font-mono text-[11px]">
                            /admin/treasury/expense-categories
                          </span>
                          ). Use name + short code (e.g. Utilities / UTIL).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Items <span className="text-red-500">*</span>
                  </h3>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-center">Unit Cost</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center"
                      >
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, 'quantity', Number(e.target.value))
                            }
                            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min={0}
                            value={item.unitCost}
                            onChange={(e) =>
                              updateItem(item.id, 'unitCost', Number(e.target.value))
                            }
                            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                          {(item.quantity * item.unitCost).toLocaleString()}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="text-gray-300 hover:text-red-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-t border-blue-100">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Total Requested
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      GHS {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justification + Documents */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Justification & Documents
                </h3>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Justification <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explain why this expense is necessary..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supporting Documents{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-8 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <CloudUpload size={26} className="text-gray-400" strokeWidth={1.5} />
                    <p className="text-sm text-gray-500">Click to upload files</p>
                    <p className="text-xs text-gray-400">PDF, Word, Excel, Images</p>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </div>
                  {documents.length > 0 && (
                    <div className="space-y-2 mt-1">
                      {documents.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  ⚠️ {error}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-8">
                {draftSaved ? (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                    ✓ Draft saved
                  </p>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Save size={15} /> Save Draft
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition"
                  >
                    <Eye size={15} /> Preview
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleSubmit()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Approval chain sidebar ── */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 sticky top-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Approval Chain</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your request goes through these approvals
                  </p>
                </div>
                <div className="space-y-0">
                  {APPROVAL_CHAIN.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full ${step.bg} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}
                        >
                          {step.initials}
                        </div>
                        {i < APPROVAL_CHAIN.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="pb-2 pt-1.5">
                        <p className={`text-sm font-semibold ${step.text}`}>
                          {step.initials === 'HD' ? department.name + ' Head' : step.role}
                        </p>
                        <p className="text-xs text-gray-400">{step.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-amber-700">⚡ Auto-Approval Threshold</p>
                  <p className="text-xs text-amber-600">
                    Requests of{' '}
                    <span className="font-bold">
                      GHS {department.settings.autoApprovalThreshold.toLocaleString()}
                    </span>{' '}
                    or below are approved automatically — no chain needed.
                  </p>
                  {qualifiesThreshold && (
                    <p className="text-xs text-green-700 bg-green-100 rounded-lg px-2 py-1 mt-1 font-medium">
                      ✓ Amount is within your department auto-approval threshold (if applicable)
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Requested</span>
                    <span className="text-lg font-bold text-blue-600">
                      GHS {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW MODAL ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Expense Preview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Read-only summary before submitting</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-200 uppercase tracking-widest">Department</p>
                  <p className="text-lg font-bold">{department.name}</p>
                  <p className="text-xs text-blue-200">{department.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-200 uppercase tracking-widest">Date</p>
                  <p className="text-sm font-semibold">
                    {new Date().toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Submitted By</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{submitterName || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Expense Title</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{title || '—'}</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Unit</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {items
                    .filter((i) => i.name.trim())
                    .map((item) => (
                      <div key={item.id} className="grid grid-cols-12 px-4 py-2.5 text-sm">
                        <div className="col-span-6 text-gray-800">{item.name}</div>
                        <div className="col-span-2 text-center text-gray-500">{item.quantity}</div>
                        <div className="col-span-2 text-center text-gray-500">
                          {item.unitCost.toLocaleString()}
                        </div>
                        <div className="col-span-2 text-right font-medium text-gray-800">
                          {(item.quantity * item.unitCost).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-t border-blue-100">
                  <span className="text-sm font-bold text-gray-700">TOTAL</span>
                  <span className="text-base font-bold text-blue-600">
                    GHS {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              {justification && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Justification
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{justification}</p>
                </div>
              )}
              {documents.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Documents ({documents.length})
                  </p>
                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <FileText size={13} className="text-blue-500" />
                      {doc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowPreview(false);
                  void handleSubmit();
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
