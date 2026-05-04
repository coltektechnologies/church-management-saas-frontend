'use client';

import { useState, useRef } from 'react';
import { X, Plus, Trash2, CloudUpload, FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { Expense, ExpenseItem } from '@/types/expense';
import { Department } from '@/types/Department';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (expense: Expense) => void;
  department: Department;
}

const APPROVAL_CHAIN = [
  { initials: 'HD', role: 'Head of Department', name: 'Dept. Head', bg: 'bg-blue-500' },
  { initials: 'EL', role: 'Elder in Charge', name: 'Elder', bg: 'bg-purple-500' },
  { initials: 'TR', role: 'Treasury', name: 'Treasury', bg: 'bg-green-500' },
  { initials: 'FE', role: 'First Elder', name: 'First Elder', bg: 'bg-orange-500' },
];

function generateExpenseRef(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `EXP-${year}-${num}`;
}

type Step = 'form' | 'success';

export default function SubmitExpenseModal({ isOpen, onClose, onCreate, department }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [submittedRef, setSubmittedRef] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [title, setTitle] = useState('');
  const [justification, setJustification] = useState('');
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0 },
  ]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const grandTotal = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  const addItem = () =>
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0 }]);

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

  const handleSubmit = () => {
    setError('');
    if (!submitterName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an expense title.');
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

    const ref = generateExpenseRef();

    const expense: Expense = {
      id: crypto.randomUUID(),
      expenseRef: ref,
      title,
      description: justification,
      submitterName,
      items,
      amount: grandTotal,
      documents: documents.map((f) => f.name),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    onCreate(expense);
    setSubmittedRef(ref);
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setSubmitterName('');
    setTitle('');
    setJustification('');
    setItems([{ id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0 }]);
    setDocuments([]);
    setError('');
    setSubmittedRef('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-[var(--admin-surface)] text-foreground border border-[var(--admin-border)] w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* ── SUCCESS SCREEN ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center flex-1 p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Request Submitted!</h2>
              <p className="text-muted-foreground max-w-sm">
                Your expense request has been submitted and is awaiting approval from the approval
                chain.
              </p>
            </div>
            <div className="bg-muted/40 dark:bg-white/[0.04] border border-[var(--admin-border)] rounded-2xl px-8 py-6 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Reference Number
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wider font-mono">
                {submittedRef}
              </p>
              <p className="text-xs text-muted-foreground">
                Keep this number for tracking your request
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Treasury will use this reference when recording this expense.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Done
            </button>
          </div>
        )}

        {/* ── FORM ── */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.04] flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Expense Request Form</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fill in the details below to submit a new expense request
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Voucher header card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-widest">Department</p>
                    <p className="text-xl font-bold mt-0.5">{department.name}</p>
                    <p className="text-sm text-blue-200">{department.code}</p>
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

              {/* Name + title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pastor William Owusu"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Expense Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Youth Camp Materials"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Items <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div className="border border-[var(--admin-border)] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/40 dark:bg-white/[0.04] border-b border-[var(--admin-border)] text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-center">Unit Cost</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>

                  <div className="divide-y divide-[var(--admin-border)]">
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
                            className="w-full text-sm border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-muted-foreground dark:[color-scheme:dark]"
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
                            className="w-full text-sm border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-2.5 py-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none dark:[color-scheme:dark]"
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
                            className="w-full text-sm border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-2.5 py-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none dark:[color-scheme:dark]"
                          />
                        </div>
                        <div className="col-span-1 text-right text-sm font-medium text-foreground">
                          {(item.quantity * item.unitCost).toLocaleString()}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="text-muted-foreground/40 hover:text-red-500 dark:hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/35 border-t border-blue-100 dark:border-blue-900">
                    <span className="text-sm font-semibold text-foreground">TOTAL REQUESTED</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      GHS {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this expense is necessary..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground dark:[color-scheme:dark]"
                />
              </div>

              {/* Document upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Supporting Documents{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[var(--admin-border)] rounded-xl px-4 py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 transition"
                >
                  <CloudUpload size={24} className="text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">Click to upload files</p>
                  <p className="text-xs text-muted-foreground">PDF, Word, Excel, Images</p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>
                {documents.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {documents.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-muted/40 dark:bg-white/[0.04] border border-[var(--admin-border)] rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-blue-500" />
                          <span className="text-sm text-foreground">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-red-500 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approval chain */}
              <div className="border border-[var(--admin-border)] rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Approval Chain</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your request will go through the following approval process
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {APPROVAL_CHAIN.map((person, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-10 h-10 rounded-full ${person.bg} text-white flex items-center justify-center text-xs font-bold`}
                        >
                          {person.initials}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-foreground whitespace-nowrap">
                            {person.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {person.role}
                          </p>
                        </div>
                      </div>
                      {i < APPROVAL_CHAIN.length - 1 && (
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground/40 mb-4 flex-shrink-0"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-lg px-3 py-2">
                  ⚡ Requests at or below the auto-approval threshold (GHS{' '}
                  {department.settings.autoApprovalThreshold.toLocaleString()}) are approved
                  automatically.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3">
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--admin-border)] bg-muted/40 dark:bg-white/[0.04] flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 border border-[var(--admin-border)] rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition"
              >
                Submit Request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
