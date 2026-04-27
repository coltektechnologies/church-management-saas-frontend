'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Search,
  Eye,
  FileDown,
  Check,
  Hourglass,
  CheckCircle2,
  LayoutList,
  CheckSquare,
  CloudUpload,
  Banknote,
  FileText,
  Landmark,
  Smartphone,
  X,
  CalendarDays,
  Tag,
  ClipboardList,
  Building2,
  User,
  Phone,
  UserCheck,
  UserPen,
  Globe,
  DollarSign,
  Type,
  FileCheck2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RequestDetailsModal } from '@/components/treasury/RequestDetailsModal';
import { LoadRequestAlertModal } from '@/components/treasury/LoadRequestAlertModal';
import {
  fetchExpenseCategoriesActive,
  getExpenseRequests,
  getExpenseRequestStrict,
} from '@/lib/treasuryApi';
import { getDepartmentsListStrict } from '@/lib/dashboardApi';
import {
  submitTreasuryExpenseRecord,
  type RecordExpenseFormShape,
} from '@/services/recordExpenseSubmit';
import { amountToCurrencyWords } from '@/lib/amountInWords';
import { getSessionUserDisplayName } from '@/lib/treasurySessionIdentity';
import type { ExpenseApprovalChain } from '@/lib/treasuryApi';

const formSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    voucherNo: z.string().optional(),
    expenseType: z.string().min(1, 'Expense category is required'),
    department: z.string().min(1, 'Department is required'),
    description: z.string().min(1, 'Description is required'),
    amount: z.string().min(1, 'Amount is required'),
    currency: z.string().min(1, 'Currency is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    paidTo: z.string().min(1, 'Payee is required'),
    phoneNumber: z.string().optional(),
    receiptFile: z.any().optional(),
    chequeNumber: z.string().optional(),
    transactionRef: z.string().optional(),
    bankName: z.string().optional(),
    linkedExpenseRequestId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const pm = data.paymentMethod;
    if (pm === 'Cheque' && !(data.chequeNumber ?? '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cheque number is required',
        path: ['chequeNumber'],
      });
    }
    if ((pm === 'Bank' || pm === 'Mobile') && !(data.transactionRef ?? '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transaction reference is required',
        path: ['transactionRef'],
      });
    }
    if (pm === 'Bank' && !(data.bankName ?? '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bank name is required',
        path: ['bankName'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const EXPENSE_RECORD_DRAFT_KEY = 'treasury:expense-record-draft:v1';

type SubmitAfterAction = 'new' | 'print';

function readExpenseRecordDraft(): Partial<FormValues> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(EXPENSE_RECORD_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const pick = (k: keyof FormValues): string | undefined =>
      typeof parsed[k] === 'string' ? (parsed[k] as string) : undefined;
    return {
      date: pick('date'),
      voucherNo: pick('voucherNo'),
      expenseType: pick('expenseType'),
      department: pick('department'),
      description: pick('description'),
      amount: pick('amount'),
      currency: pick('currency'),
      paymentMethod: pick('paymentMethod'),
      paidTo: pick('paidTo'),
      phoneNumber: pick('phoneNumber'),
      chequeNumber: pick('chequeNumber'),
      transactionRef: pick('transactionRef'),
      bankName: pick('bankName'),
      linkedExpenseRequestId: pick('linkedExpenseRequestId'),
    };
  } catch {
    return null;
  }
}

function writeExpenseRecordDraft(values: FormValues) {
  if (typeof window === 'undefined') {
    return;
  }
  const { receiptFile: _rf, ...rest } = values;
  void _rf;
  try {
    localStorage.setItem(EXPENSE_RECORD_DRAFT_KEY, JSON.stringify(rest));
  } catch {
    /* quota / private mode */
  }
}

function clearExpenseRecordDraft() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(EXPENSE_RECORD_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** Row shown in the approved-requests sidebar (mapped from API). */
interface ExpenseRequestSidebarRow {
  id: string;
  requestNumber: string;
  title: string;
  dept: string;
  date: string;
  amount: string;
  status: string;
  /** From list API (requested_by / submitter) */
  requestedByName: string;
  /** Final sign-off: treasurer, from approval chain when present */
  approvedByName: string;
  purpose: string;
  approvalChain: ExpenseApprovalChain | null;
  amountRaw: string;
  amountInWords: string;
  treasurerApprovedAt: string | null;
}

export default function RecordExpensePage({ backLink = '' }: { backLink: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [, setPaymentMethod] = useState('Cash');

  // Modals state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ExpenseRequestSidebarRow | null>(null);
  const [loadedRequestId, setLoadedRequestId] = useState<string>('');
  const [linkedAttribution, setLinkedAttribution] = useState<{
    requestedBy: string;
    approvedBy: string;
  }>({ requestedBy: '', approvedBy: '' });
  const [recordedByName, setRecordedByName] = useState('—');

  const submitAfterActionRef = useRef<SubmitAfterAction>('print');
  const draftRestoredRef = useRef(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['treasury', 'expenses', 'categories'],
    queryFn: fetchExpenseCategoriesActive,
  });

  const { data: departments = [], isLoading: deptLoading } = useQuery({
    queryKey: ['treasury', 'expenses', 'departments'],
    queryFn: () => getDepartmentsListStrict(150),
  });

  const { data: expenseRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['treasury', 'expense-requests', 'expenses-page'],
    queryFn: () => getExpenseRequests({ page_size: 200 }),
  });

  React.useEffect(() => {
    setRecordedByName(getSessionUserDisplayName());
  }, []);

  const emptyFormDefaults = useMemo(
    (): FormValues => ({
      date: today,
      voucherNo: '',
      expenseType: '',
      department: '',
      description: '',
      amount: '',
      currency: 'GHS',
      paymentMethod: 'Cash',
      paidTo: '',
      phoneNumber: '',
      receiptFile: undefined,
      chequeNumber: '',
      transactionRef: '',
      bankName: '',
      linkedExpenseRequestId: '',
    }),
    [today]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormDefaults,
  });

  React.useEffect(() => {
    if (draftRestoredRef.current) {
      return;
    }
    const draft = readExpenseRecordDraft();
    if (!draft) {
      return;
    }
    draftRestoredRef.current = true;
    const cur = form.getValues();
    form.reset({
      ...cur,
      ...(Object.fromEntries(
        Object.entries(draft).filter(([, v]) => v !== undefined && v !== '')
      ) as Partial<FormValues>),
    });
    const pm = draft.paymentMethod ?? 'Cash';
    setPaymentMethod(pm);
    if (draft.linkedExpenseRequestId) {
      setLoadedRequestId(draft.linkedExpenseRequestId);
    }
    toast.message('Draft restored', {
      description: 'Previously saved fields were loaded from this browser.',
    });
    // Restore draft once on mount; `form` from useForm is stable for this component instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on mount
  }, []);

  const paymentMethodWatch = useWatch({ control: form.control, name: 'paymentMethod' }) ?? 'Cash';
  const amountWatch = useWatch({ control: form.control, name: 'amount' }) ?? '';
  const currencyWatch = useWatch({ control: form.control, name: 'currency' }) ?? 'GHS';
  const linkedIdWatch = useWatch({ control: form.control, name: 'linkedExpenseRequestId' }) ?? '';

  const amountInWordsDisplay = useMemo(
    () => amountToCurrencyWords(String(amountWatch), String(currencyWatch)),
    [amountWatch, currencyWatch]
  );

  React.useEffect(() => {
    if (!linkedIdWatch) {
      setLinkedAttribution({ requestedBy: '', approvedBy: '' });
    }
  }, [linkedIdWatch]);

  const pendingStatuses = useMemo(
    () =>
      new Set(['SUBMITTED', 'DEPT_HEAD_APPROVED', 'TREASURER_APPROVED', 'FIRST_ELDER_APPROVED']),
    []
  );

  const summaryCards = useMemo(() => {
    const total = expenseRequests.length;
    const pending = expenseRequests.filter((r) => pendingStatuses.has(r.status)).length;
    const approved = expenseRequests.filter((r) => r.status === 'APPROVED').length;
    const recorded = expenseRequests.filter((r) => r.status === 'DISBURSED').length;
    return [
      { label: 'Pending Requests', value: String(pending), icon: Hourglass, bg: 'bg-[#f59e0b]' },
      {
        label: 'Approved (ready)',
        value: String(approved),
        icon: CheckCircle2,
        bg: 'bg-[#10b981]',
      },
      { label: 'Total Requests', value: String(total), icon: LayoutList, bg: 'bg-[#3b82f6]' },
      { label: 'Disbursed', value: String(recorded), icon: CheckSquare, bg: 'bg-[#8b5cf6]' },
    ];
  }, [expenseRequests, pendingStatuses]);

  const approvedRequests = useMemo(() => {
    let rows = expenseRequests;
    if (activeTab === 'Approved') {
      rows = rows.filter((r) => r.status === 'APPROVED');
    } else if (activeTab === 'Recorded') {
      rows = rows.filter((r) => r.status === 'DISBURSED');
    } else {
      rows = rows.filter((r) => ['APPROVED', 'DISBURSED'].includes(r.status));
    }
    return rows.map((r) => {
      const amt = parseFloat(String(r.amount_requested ?? '0'));
      const chain = r.approval_chain;
      const treasurerName = chain?.treasurer?.approved_by?.trim() || '—';
      const rawAmt = String(r.amount_requested ?? '0');
      return {
        id: r.id,
        requestNumber: r.request_number,
        title: r.purpose ?? r.request_number,
        dept: r.department_name ?? '—',
        date: r.required_by_date ?? (r.created_at ? String(r.created_at).slice(0, 10) : ''),
        amount: `GHS ${amt.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`,
        status: r.status === 'DISBURSED' ? 'Recorded' : 'Approved',
        requestedByName: (r.requested_by_name ?? '—').trim() || '—',
        approvedByName: r.status === 'APPROVED' || r.status === 'DISBURSED' ? treasurerName : '—',
        purpose: (r.purpose ?? '').trim(),
        approvalChain: chain ?? null,
        amountRaw: rawAmt,
        amountInWords: amountToCurrencyWords(rawAmt, 'GHS'),
        treasurerApprovedAt: chain?.treasury?.approved_at
          ? String(chain.treasury.approved_at).slice(0, 10)
          : null,
      };
    });
  }, [expenseRequests, activeTab]);

  const dataLoading = catLoading || deptLoading;

  const onSubmit = async (data: FormValues) => {
    const after = submitAfterActionRef.current;
    const payload: RecordExpenseFormShape = {
      date: data.date,
      expenseType: data.expenseType,
      department: data.department,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      paidTo: data.paidTo,
      phoneNumber: data.phoneNumber,
      chequeNumber: data.chequeNumber,
      transactionRef: data.transactionRef,
      bankName: data.bankName,
      linkedExpenseRequestId: data.linkedExpenseRequestId,
    };
    try {
      const created = await submitTreasuryExpenseRecord(payload);
      queryClient.invalidateQueries({ queryKey: ['treasury'] });
      queryClient.invalidateQueries({ queryKey: ['treasury', 'expense-requests'] });
      queryClient.invalidateQueries({
        queryKey: ['treasury', 'expense-requests', 'expenses-page'],
      });

      const nextBase: FormValues = {
        ...emptyFormDefaults,
        date: today,
        voucherNo: '',
        receiptFile: undefined,
      };

      if (after === 'new') {
        form.reset({
          ...nextBase,
          currency: 'GHS',
          paymentMethod: 'Cash',
        });
        setPaymentMethod('Cash');
        setLoadedRequestId('');
        setLinkedAttribution({ requestedBy: '', approvedBy: '' });
        toast.success('Expense recorded', {
          description: `Voucher ${created.voucher_number} saved. Form cleared for a new entry.`,
        });
      } else {
        form.reset({
          ...nextBase,
          voucherNo: created.voucher_number,
          currency: 'GHS',
          paymentMethod: 'Cash',
        });
        setPaymentMethod('Cash');
        setLoadedRequestId('');
        setLinkedAttribution({ requestedBy: '', approvedBy: '' });
        toast.success('Expense recorded', {
          description: `Voucher ${created.voucher_number} saved.`,
        });
        if (after === 'print') {
          requestAnimationFrame(() => window.print());
        }
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      clearExpenseRecordDraft();
      submitAfterActionRef.current = 'print';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save expense.');
    }
  };

  const triggerSubmitWithAfter = (after: SubmitAfterAction) => {
    submitAfterActionRef.current = after;
    void form.handleSubmit(onSubmit)();
  };

  const handleSaveDraft = () => {
    writeExpenseRecordDraft(form.getValues());
    toast.success('Draft saved', {
      description:
        'You can continue later on this device. Receipt file is not stored in the draft.',
    });
  };

  const handleCancel = () => {
    if (backLink) {
      router.push(backLink);
      return;
    }
    form.reset(emptyFormDefaults);
    setPaymentMethod('Cash');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLoadedRequestId('');
    setLinkedAttribution({ requestedBy: '', approvedBy: '' });
  };

  const paymentMethodsRow = [
    { id: 'Cash', icon: Banknote },
    { id: 'Cheque', icon: FileText },
    { id: 'Bank', icon: Landmark },
    { id: 'Mobile', icon: Smartphone },
  ];

  const handlePreviewRequest = (req: ExpenseRequestSidebarRow) => {
    setSelectedRequest(req);
    setIsDetailsModalOpen(true);
  };

  const handleLoadRequest = async (req: { id: string; title?: string }) => {
    try {
      const d = await getExpenseRequestStrict(req.id);
      const ext = d as Record<string, unknown>;
      const deptObj = ext.department as { id?: string } | undefined;
      const catObj = ext.category as { id?: string } | undefined;
      if (catObj?.id) {
        form.setValue('expenseType', catObj.id);
      }
      if (deptObj?.id) {
        form.setValue('department', deptObj.id);
      }
      const amtApproved = ext.amount_approved as string | undefined;
      const amtReq = ext.amount_requested as string | undefined;
      const amt = amtApproved ?? amtReq;
      if (amt) {
        form.setValue('amount', String(amt).replace(/[^\d.]/g, ''));
      }
      const purpose = ext.purpose as string | undefined;
      if (purpose) {
        form.setValue('description', purpose);
      }
      form.setValue('linkedExpenseRequestId', req.id);
      setLoadedRequestId(req.id);
      const st = String((ext as { status?: string }).status ?? '');
      const ch = ext.approval_chain as ExpenseApprovalChain | null | undefined;
      const ap = ch?.treasurer?.approved_by?.trim() || '—';
      const rbn = (ext as { requested_by_name?: string | null }).requested_by_name;
      setLinkedAttribution({
        requestedBy: (typeof rbn === 'string' ? rbn : '')?.trim() || '—',
        approvedBy: st === 'APPROVED' || st === 'DISBURSED' ? ap : '—',
      });
      setIsAlertModalOpen(true);
      toast.success('Request details loaded into the form.');
    } catch {
      toast.error('Could not load this expense request.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue('receiptFile', file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4fcfb] dark:bg-transparent p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto mb-6">
        <Link href={backLink}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 font-semibold text-[#0f2846] dark:text-slate-100 hover:bg-[#e0f2f1] dark:hover:bg-slate-800/60 px-0 hover:px-3 text-[14px] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/90 rounded-xl p-4 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-600"
              >
                <div className={`${card.bg} text-white p-3 rounded-[10px]`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#0f2846] dark:text-slate-100 leading-tight">
                    {card.value}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-6">
          {/* Left Column: Form */}
          <div className="bg-white dark:bg-slate-900/90 rounded-[1.25rem] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-600 p-6 sm:p-8 relative">
            <h2 className="text-[18px] font-bold text-[#147e6b] dark:text-teal-400 mb-6">
              New Expense Entry
            </h2>

            {/* Link to Approved Request Box */}
            <div className="border-2 border-dashed border-[#28c1a6]/40 dark:border-teal-500/35 rounded-xl p-5 mb-8 relative bg-[#f1fcfb] dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#28c1a6]" />
                  <span className="text-[14px] font-bold text-[#147e6b] dark:text-teal-400">
                    Link to Approved Request
                  </span>
                </div>
                <span className="bg-[#28c1a6] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-3">
                Search for an approved expense request to auto-fill details
              </p>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by Request ID, Title or Department"
                  className="pl-10 h-11 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-600 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                />
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSubmitWithAfter('print');
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <CalendarDays className="w-3.5 h-3.5 text-[#28c1a6]" /> Date{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-11 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus-visible:ring-[#28c1a6] text-slate-700 dark:text-slate-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="voucherNo"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#28c1a6]" /> Voucher No{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            readOnly
                            placeholder="Assigned when saved"
                            className="h-11 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                            {...field}
                            value={field.value ? field.value : '(assigned when saved)'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="expenseType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <Tag className="w-3.5 h-3.5 text-[#28c1a6]" /> Expense Category{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          disabled={dataLoading || categories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/85 dark:text-slate-100 focus:ring-[#28c1a6]">
                              <SelectValue
                                placeholder={catLoading ? 'Loading categories…' : 'Select category'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <Building2 className="w-3.5 h-3.5 text-[#28c1a6]" /> Department{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          disabled={dataLoading || departments.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/85 dark:text-slate-100 focus:ring-[#28c1a6]">
                              <SelectValue
                                placeholder={
                                  deptLoading ? 'Loading departments…' : 'Select department'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                        <ClipboardList className="w-3.5 h-3.5 text-[#28c1a6]" /> Description /
                        Purpose <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px] border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6] resize-none"
                          placeholder=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <DollarSign className="w-3.5 h-3.5 text-[#28c1a6]" /> Amount{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                      <Type className="w-3.5 h-3.5 text-[#28c1a6]" /> Amount In Words
                    </Label>
                    <Textarea
                      readOnly
                      value={amountInWordsDisplay}
                      placeholder="Enter a valid amount above"
                      className="min-h-[5.5rem] text-[13px] leading-snug bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-default resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <Globe className="w-3.5 h-3.5 text-[#28c1a6]" /> Currency{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/85 dark:text-slate-100 focus:ring-[#28c1a6]">
                              <SelectValue placeholder="Ghana Cedi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GHS">Ghana Cedi</SelectItem>
                            <SelectItem value="USD">US Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <Banknote className="w-3.5 h-3.5 text-[#28c1a6]" /> Payment Method{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            {paymentMethodsRow.map((method) => {
                              const MethodIcon = method.icon;
                              const isSelected = field.value === method.id;
                              return (
                                <button
                                  key={method.id}
                                  type="button"
                                  onClick={() => {
                                    setPaymentMethod(method.id);
                                    field.onChange(method.id);
                                  }}
                                  className={`flex-1 flex flex-col items-center justify-center h-[54px] rounded-lg border transition-all ${
                                    isSelected
                                      ? 'border-[#28c1a6] bg-[#f1fcfb] dark:bg-teal-950/45 dark:border-teal-500 text-[#147e6b] dark:text-teal-300'
                                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300'
                                  }`}
                                >
                                  <MethodIcon className="w-5 h-5 mb-0.5" />
                                  <span className="text-[10px] sm:text-[11px] font-bold">
                                    {method.id}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(paymentMethodWatch === 'Cheque' ||
                  paymentMethodWatch === 'Bank' ||
                  paymentMethodWatch === 'Mobile') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 rounded-lg border border-slate-100 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                    {paymentMethodWatch === 'Cheque' && (
                      <FormField
                        control={form.control}
                        name="chequeNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5 sm:col-span-2">
                            <FormLabel className="text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                              Cheque number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {(paymentMethodWatch === 'Bank' || paymentMethodWatch === 'Mobile') && (
                      <>
                        <FormField
                          control={form.control}
                          name="transactionRef"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5 sm:col-span-2">
                              <FormLabel className="text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                                Transaction reference <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {paymentMethodWatch === 'Bank' && (
                          <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5 sm:col-span-2">
                                <FormLabel className="text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                                  Bank name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="paidTo"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <User className="w-3.5 h-3.5 text-[#28c1a6]" /> Paid to{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                          <Phone className="w-3.5 h-3.5 text-[#28c1a6]" /> Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#28c1a6]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                      <UserCheck className="w-3.5 h-3.5 text-[#28c1a6]" /> Requested By
                    </Label>
                    <Input
                      readOnly
                      value={linkedAttribution.requestedBy || '— (load an approved request)'}
                      className="h-11 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium cursor-default"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                      <UserCheck className="w-3.5 h-3.5 text-[#28c1a6]" /> Approved By
                    </Label>
                    <Input
                      readOnly
                      value={linkedAttribution.approvedBy || '— (treasurer after final approval)'}
                      className="h-11 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium cursor-default"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                      <UserPen className="w-3.5 h-3.5 text-[#28c1a6]" /> Recorded By
                    </Label>
                    <Input
                      readOnly
                      value={recordedByName}
                      className="h-11 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 text-[#0f2846] dark:text-slate-100 font-medium cursor-default"
                    />
                  </div>
                </div>

                {/* Upload Receipt/Invoice */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[#1c385c] dark:text-slate-200 font-medium text-[13px]">
                    <CloudUpload className="w-3.5 h-3.5 text-[#28c1a6]" /> Upload Receipt/Invoice
                  </Label>
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      title="upload file"
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#28c1a6]/10 flex items-center justify-center mb-3">
                          <FileCheck2 className="w-5 h-5 text-[#28c1a6]" />
                        </div>
                        <p className="text-[13px] font-bold text-[#28c1a6] truncate max-w-[200px] sm:max-w-[300px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-[#28c1a6]/10 transition-colors">
                          <CloudUpload className="w-5 h-5 text-[#28c1a6]" />
                        </div>
                        <p className="text-[13px] font-semibold text-[#0f2846] dark:text-slate-100">
                          Drag & drop files or click to browse
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                          PDF, JPG, PNG (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Budget note */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 mb-8 text-[12px] text-slate-600 dark:text-slate-300">
                  Budget utilization by department is available on the main treasury dashboard after
                  expenses are recorded.
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto bg-[#e11d48] hover:bg-[#be123c] text-white border-transparent px-6 h-11 text-[14px] font-bold"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none border-transparent bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155] px-6 h-11 text-[14px] font-bold"
                      onClick={handleSaveDraft}
                    >
                      <FileDown className="w-4 h-4 mr-2" /> Save Draft
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 sm:flex-none bg-[#99f6e4] hover:bg-[#5eead4] text-[#0f766e] px-6 h-11 text-[14px] font-bold shadow-sm"
                      disabled={dataLoading || categories.length === 0 || departments.length === 0}
                      title={
                        dataLoading || categories.length === 0 || departments.length === 0
                          ? 'Wait for categories and departments to load.'
                          : undefined
                      }
                      onClick={() => triggerSubmitWithAfter('new')}
                    >
                      <FileText className="w-4 h-4 mr-2" /> Save & New
                    </Button>
                    <Button
                      type="button"
                      disabled={dataLoading || categories.length === 0 || departments.length === 0}
                      title={
                        dataLoading || categories.length === 0 || departments.length === 0
                          ? 'Wait for categories and departments to load.'
                          : undefined
                      }
                      className="flex-1 sm:flex-none bg-[#28c1a6] hover:bg-[#21a48c] text-white px-6 h-11 text-[14px] font-bold shadow-sm disabled:opacity-50"
                      onClick={() => triggerSubmitWithAfter('print')}
                    >
                      <Check className="w-4 h-4 mr-2" /> Record & Print
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Column: List */}
          <div className="bg-[#f0fcfb]/50 dark:bg-transparent rounded-[1.25rem] p-0 sm:p-2 lg:p-0">
            <div className="bg-white dark:bg-slate-900/90 rounded-[1.25rem] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-600 p-5 sticky top-6">
              <h3 className="text-[16px] font-bold text-[#147e6b] dark:text-teal-400 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#28c1a6]" /> Approved Requests Ready to Record
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {['All', 'Approved', 'Recorded'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-1.5 px-2 rounded-[6px] text-[12px] font-bold border transition-colors ${
                      activeTab === tab
                        ? 'border-[#28c1a6] bg-[#e6fcf8] dark:bg-teal-950/50 dark:border-teal-500 text-[#147e6b] dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/70 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 max-h-[1400px] overflow-y-auto custom-scrollbar pr-1">
                {requestsLoading && (
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 py-6 text-center">
                    Loading requests…
                  </p>
                )}
                {!requestsLoading && approvedRequests.length === 0 && (
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 py-6 text-center">
                    No requests match this filter.
                  </p>
                )}
                {!requestsLoading &&
                  approvedRequests.map((req) => {
                    const isRecorded = req.status === 'Recorded';
                    return (
                      <div
                        key={req.id}
                        className="bg-[#f8fdfb] dark:bg-slate-800/50 border border-[#28c1a6]/20 dark:border-teal-700/35 rounded-xl p-4 flex flex-col hover:border-[#28c1a6] dark:hover:border-teal-500 transition-colors relative group"
                      >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isRecorded
                                ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                                : 'bg-[#bbf7d0] text-[#166534] dark:bg-emerald-900/55 dark:text-emerald-200'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-1 tracking-wide">
                          {req.requestNumber}
                        </span>
                        <h4 className="text-[14px] font-bold text-[#0f2846] dark:text-slate-100 mb-2">
                          {req.title}
                        </h4>

                        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Search className="w-3 h-3" /> {req.dept}
                          </div>
                          <div className="flex items-center gap-1">
                            <Search className="w-3 h-3" /> {req.date}
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-auto pt-2 border-t border-[#28c1a6]/10 dark:border-teal-800/40 leading-none">
                          <span className="text-[15px] font-bold text-[#28c1a6] dark:text-teal-400">
                            {req.amount}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title="view detail"
                              onClick={() => handlePreviewRequest(req)}
                              className="w-7 h-7 rounded-md bg-[#e6fcf8] dark:bg-teal-950/60 text-[#147e6b] dark:text-teal-300 flex items-center justify-center hover:bg-[#28c1a6] hover:text-white transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isRecorded ? (
                              <button
                                type="button"
                                title="already recorded"
                                className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center cursor-not-allowed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="load request"
                                onClick={() => handleLoadRequest(req)}
                                className="w-7 h-7 rounded-md bg-[#28c1a6] text-white flex items-center justify-center hover:bg-[#21a48c] transition-colors cursor-pointer"
                              >
                                <FileDown className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RequestDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        requestDetails={selectedRequest}
        onUseForRecording={() => {
          if (selectedRequest) {
            handleLoadRequest(selectedRequest);
          }
        }}
      />

      <LoadRequestAlertModal
        open={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
        requestId={loadedRequestId}
      />
    </div>
  );
}
