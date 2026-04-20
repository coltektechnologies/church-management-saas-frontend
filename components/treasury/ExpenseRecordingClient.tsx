'use client';

import React, { useState } from 'react';
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
  IdCard,
  UserCheck,
  UserPen,
  Globe,
  DollarSign,
  Type,
  FileCheck2,
} from 'lucide-react';
import Link from 'next/link';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RequestDetailsModal } from '@/components/treasury/RequestDetailsModal';
import { LoadRequestAlertModal } from '@/components/treasury/LoadRequestAlertModal';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  voucherNo: z.string().min(1, 'Voucher No is required'),
  expenseType: z.string().min(1, 'Expense type is required'),
  department: z.string().min(1, 'Department is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paidTo: z.string().optional(),
  phoneNumber: z.string().optional(),
  idNumber: z.string().optional(),
  vendorRegistration: z.string().optional(),
  receiptFile: z.any().optional(),

  // Mobile Money dynamic fields
  transactionId: z.string().optional(),
  momoNumber: z.string().optional(),
  momoName: z.string().optional(),

  // Cash dynamic fields
  cashRecipientName: z.string().optional(),
  recipientRole: z.string().optional(),

  // Cheque dynamic fields
  chequeNumber: z.string().optional(),
  chequeBankName: z.string().optional(),
  chequePayeeName: z.string().optional(),

  // Bank dynamic fields
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RecordExpensePage({ backLink = '' }: { backLink: string }) {
  const [activeTab, setActiveTab] = useState('All');

  // Modals state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loadedRequestId, setLoadedRequestId] = useState<string>('');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '2025-03-14',
      voucherNo: 'EXP-2024-0158',
      expenseType: '',
      department: '',
      description: '',
      amount: '',
      currency: 'GHS',
      paymentMethod: 'Cash',
      paidTo: '',
      phoneNumber: '',
      idNumber: '',
      vendorRegistration: '',
      receiptFile: undefined,
      transactionId: '',
      momoNumber: '',
      momoName: '',
      cashRecipientName: '',
      recipientRole: '',
      chequeNumber: '',
      chequeBankName: '',
      chequePayeeName: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Valid Form Submitted', data);
    // Integration logic here
  };

  const currentPaymentMethod = form.watch('paymentMethod');

  const summaryCards = [
    { label: 'Pending Requests', value: '8', icon: Hourglass, bg: 'bg-[#f59e0b]' },
    { label: 'Approved Requests', value: '12', icon: CheckCircle2, bg: 'bg-[#10b981]' },
    { label: 'Total Requests', value: '20', icon: LayoutList, bg: 'bg-[#3b82f6]' },
    { label: 'Already Recorded', value: '16', icon: CheckSquare, bg: 'bg-[#8b5cf6]' },
  ];

  const approvedRequests = [
    {
      id: 'REQ-2024-001',
      title: 'Sound System Repair',
      dept: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'Approved',
    },
    {
      id: 'REQ-2024-002',
      title: 'Sound System Repair',
      dept: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'Recorded',
    },
    {
      id: 'REQ-2024-003',
      title: 'Sound System Repair',
      dept: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'Approved',
    },
    {
      id: 'REQ-2024-004',
      title: 'Youth Camp Materials',
      dept: 'Adventist Youth',
      date: '2024-08-14',
      amount: 'GHS700',
      status: 'Approved',
    },
  ];

  const paymentMethodsRow = [
    { id: 'Cash', icon: Banknote },
    { id: 'Cheque', icon: FileText },
    { id: 'Bank', icon: Landmark },
    { id: 'Mobile', icon: Smartphone },
  ];

  const handlePreviewRequest = (req: any) => {
    setSelectedRequest(req);
    setIsDetailsModalOpen(true);
  };

  const handleLoadRequest = (req: any) => {
    // Mock autofill
    form.setValue('amount', req.amount.replace('GHS', ''));
    form.setValue('description', req.title);

    setLoadedRequestId(req.id);
    setIsAlertModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue('receiptFile', file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4fcfb] p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto mb-6">
        <Link href={backLink}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 font-semibold text-[#0f2846] hover:bg-[#e0f2f1] px-0 hover:px-3 text-[14px] transition-all"
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
                className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
              >
                <div className={`${card.bg} text-white p-3 rounded-[10px]`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#0f2846] leading-tight">
                    {card.value}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-6">
          {/* Left Column: Form */}
          <div className="bg-white rounded-[1.25rem] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 relative">
            <h2 className="text-[18px] font-bold text-[#147e6b] mb-6">New Expense Entry</h2>

            {/* Link to Approved Request Box */}
            <div className="border-2 border-dashed border-[#28c1a6]/40 rounded-xl p-5 mb-8 relative bg-[#f1fcfb]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#28c1a6]" />
                  <span className="text-[14px] font-bold text-[#147e6b]">
                    Link to Approved Request
                  </span>
                </div>
                <span className="bg-[#28c1a6] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <p className="text-[13px] text-slate-500 font-medium mb-3">
                Search for an approved expense request to auto-fill details
              </p>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by Request ID, Title or Department"
                  className="pl-10 h-11 bg-white border-slate-200 text-[14px] focus-visible:ring-[#28c1a6]"
                />
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                          <CalendarDays className="w-3.5 h-3.5 text-[#28c1a6]" /> Date{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-[#28c1a6] text-slate-700"
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
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#28c1a6]" /> Voucher No{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            readOnly
                            className="h-11 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-medium"
                            {...field}
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
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                          <Tag className="w-3.5 h-3.5 text-[#28c1a6]" /> Expense Type{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-200 focus:ring-[#28c1a6]">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="operational">Operational</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
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
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                          <Building2 className="w-3.5 h-3.5 text-[#28c1a6]" /> Department{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-200 focus:ring-[#28c1a6]">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="music">Music Ministry</SelectItem>
                            <SelectItem value="youth">Youth Ministry</SelectItem>
                            <SelectItem value="welfare">Welfare</SelectItem>
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
                      <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                        <ClipboardList className="w-3.5 h-3.5 text-[#28c1a6]" /> Description /
                        Purpose <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px] border-slate-200 focus-visible:ring-[#28c1a6] resize-none"
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
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                          <DollarSign className="w-3.5 h-3.5 text-[#28c1a6]" /> Amount{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                      <Type className="w-3.5 h-3.5 text-[#28c1a6]" /> Amount In Words
                    </Label>
                    <Input
                      readOnly
                      placeholder="Enter amount above"
                      className="h-11 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                          <Globe className="w-3.5 h-3.5 text-[#28c1a6]" /> Currency{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-200 focus:ring-[#28c1a6]">
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
                        <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
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
                                    field.onChange(method.id);
                                  }}
                                  className={`flex-1 flex flex-col items-center justify-center h-[54px] rounded-lg border transition-all ${
                                    isSelected
                                      ? 'border-[#28c1a6] bg-[#f1fcfb] text-[#147e6b]'
                                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
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

                {/* Dynamic Fields Based on Payment Method */}
                {currentPaymentMethod === 'Cash' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="cashRecipientName"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                            <User className="w-3.5 h-3.5 text-[#28c1a6]" /> Name of Individual
                          </FormLabel>
                          <FormControl>
                            <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recipientRole"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                            <IdCard className="w-3.5 h-3.5 text-[#28c1a6]" /> Their Role in Organisation
                          </FormLabel>
                          <FormControl>
                            <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentPaymentMethod === 'Mobile' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="transactionId"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <FileText className="w-3.5 h-3.5 text-[#28c1a6]" /> Transaction ID
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="momoNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <Phone className="w-3.5 h-3.5 text-[#28c1a6]" /> Number
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="momoName"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <User className="w-3.5 h-3.5 text-[#28c1a6]" /> Name
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {currentPaymentMethod === 'Cheque' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="chequeNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <FileText className="w-3.5 h-3.5 text-[#28c1a6]" /> Cheque Number
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="chequeBankName"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <Landmark className="w-3.5 h-3.5 text-[#28c1a6]" /> Bank Name
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="chequePayeeName"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <User className="w-3.5 h-3.5 text-[#28c1a6]" /> Payee Name
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {currentPaymentMethod === 'Bank' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <Landmark className="w-3.5 h-3.5 text-[#28c1a6]" /> Bank Name
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <User className="w-3.5 h-3.5 text-[#28c1a6]" /> Account Name
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                              <FileText className="w-3.5 h-3.5 text-[#28c1a6]" /> Account Number
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11 border-slate-200 focus-visible:ring-[#28c1a6]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                      <UserCheck className="w-3.5 h-3.5 text-[#28c1a6]" /> Requested By
                    </Label>
                    <Input
                      readOnly
                      value="Auto-filled from request"
                      className="h-11 bg-slate-50 border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                      <UserCheck className="w-3.5 h-3.5 text-[#28c1a6]" /> Approved By
                    </Label>
                    <Input
                      readOnly
                      value="Auto-filled from request"
                      className="h-11 bg-slate-50 border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                      <UserPen className="w-3.5 h-3.5 text-[#28c1a6]" /> Recorded By
                    </Label>
                    <Input
                      readOnly
                      value="Bro. Owusu William"
                      className="h-11 bg-slate-50 border-slate-200 text-[#0f2846] font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Upload Receipt/Invoice */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[#1c385c] font-medium text-[13px]">
                    <CloudUpload className="w-3.5 h-3.5 text-[#28c1a6]" /> Upload Receipt/Invoice
                  </Label>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden"
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
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-[#28c1a6]/10 transition-colors">
                          <CloudUpload className="w-5 h-5 text-[#28c1a6]" />
                        </div>
                        <p className="text-[13px] font-semibold text-[#0f2846]">
                          Drag & drop files or click to browse
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                          PDF, JPG, PNG (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Budget Impact */}
                <div className="bg-[#f0fcfa] border border-[#28c1a6]/30 rounded-xl p-5 mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#147e6b] text-[14px]">
                      Music Ministry Budget:
                    </span>
                    <span className="font-bold text-[#28c1a6] text-[14px]">GHS8,000</span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-3 border border-slate-200">
                    <div className="h-full bg-[#28c1a6] w-[45%]" />
                  </div>
                  <div className="flex items-center justify-between text-[12px] font-medium">
                    <span className="text-slate-600">Spent: GHS3,750</span>
                    <span className="text-slate-600">Remaining: GHS4,250</span>
                    <span className="text-red-500 font-bold">This expense: GHS850</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto bg-[#e11d48] hover:bg-[#be123c] text-white border-transparent px-6 h-11 text-[14px] font-bold"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none border-transparent bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155] px-6 h-11 text-[14px] font-bold"
                    >
                      <FileDown className="w-4 h-4 mr-2" /> Save Draft
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 sm:flex-none bg-[#99f6e4] hover:bg-[#5eead4] text-[#0f766e] px-6 h-11 text-[14px] font-bold shadow-sm"
                    >
                      <FileText className="w-4 h-4 mr-2" /> Save & New
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-none bg-[#28c1a6] hover:bg-[#21a48c] text-white px-6 h-11 text-[14px] font-bold shadow-sm"
                    >
                      <Check className="w-4 h-4 mr-2" /> Record & Print
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Column: List */}
          <div className="bg-[#f0fcfb]/50 rounded-[1.25rem] p-0 sm:p-2 lg:p-0">
            <div className="bg-white rounded-[1.25rem] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)] border border-slate-100 p-5 sticky top-6">
              <h3 className="text-[16px] font-bold text-[#147e6b] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#28c1a6]" /> Approved Requests Ready to Record
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {['All', 'Approved', 'Recorded'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-1.5 px-2 rounded-[6px] text-[12px] font-bold border transition-colors ${
                      activeTab === tab
                        ? 'border-[#28c1a6] bg-[#e6fcf8] text-[#147e6b]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 max-h-[1400px] overflow-y-auto custom-scrollbar pr-1">
                {approvedRequests.map((req, idx) => {
                  const isRecorded = req.status === 'Recorded';
                  return (
                    <div
                      key={idx}
                      className="bg-[#f8fdfb] border border-[#28c1a6]/20 rounded-xl p-4 flex flex-col hover:border-[#28c1a6] transition-colors relative group"
                    >
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isRecorded
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-[#bbf7d0] text-[#166534]'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <span className="text-[12px] font-bold text-slate-500 mb-1 tracking-wide">
                        {req.id}
                      </span>
                      <h4 className="text-[14px] font-bold text-[#0f2846] mb-2">{req.title}</h4>

                      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Search className="w-3 h-3" /> {req.dept}
                        </div>
                        <div className="flex items-center gap-1">
                          <Search className="w-3 h-3" /> {req.date}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-auto pt-2 border-t border-[#28c1a6]/10 leading-none">
                        <span className="text-[15px] font-bold text-[#28c1a6]">{req.amount}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="view detail"
                            onClick={() => handlePreviewRequest(req)}
                            className="w-7 h-7 rounded-md bg-[#e6fcf8] text-[#147e6b] flex items-center justify-center hover:bg-[#28c1a6] hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isRecorded ? (
                            <button
                              type="button"
                              title="already recorded"
                              className="w-7 h-7 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center cursor-not-allowed"
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
