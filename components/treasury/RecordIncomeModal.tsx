'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  incomeType: z.string().min(1, 'Income type is required'),
  member: z.string().min(1, 'Member selection is required'),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  receiptNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface RecordIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordIncomeModal({ open, onOpenChange }: RecordIncomeModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '',
      incomeType: '',
      member: '',
      amount: '',
      paymentMethod: '',
      receiptNumber: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.info('Record Income Data:', data);
    // Add logic to save & print receipt
    onOpenChange(false);
    form.reset();
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">Record Income</DialogTitle>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-[1rem] bg-card"
      >
        <div className="flex flex-col text-[#0f2846]">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center sm:text-left flex flex-col items-center">
            <h2 className="text-[22px] font-bold tracking-tight text-[#0f2846]">Record Income</h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Create, submit and print your individual or department records
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[14px] font-medium text-[#1c385c]">
                        Date <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            className="bg-transparent border-slate-200 rounded-[8px] h-11 text-[14px] pl-4 pr-11 focus-visible:ring-1 focus-visible:ring-[#28c1a6] focus-visible:border-[#28c1a6] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#0f2846]">
                            <CalendarDays className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incomeType"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[14px] font-medium text-[#1c385c]">
                        Income Type <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-slate-200 rounded-[8px] h-11 text-[14px] focus:ring-1 focus:ring-[#28c1a6] focus:border-[#28c1a6]">
                            <SelectValue placeholder="Select Income Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tithe">Tithe</SelectItem>
                          <SelectItem value="offering">Offering</SelectItem>
                          <SelectItem value="donation">Donation</SelectItem>
                          <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="member"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[14px] font-medium text-[#1c385c]">
                        Member <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-slate-200 rounded-[8px] h-11 text-[14px] focus:ring-1 focus:ring-[#28c1a6] focus:border-[#28c1a6]">
                            <SelectValue placeholder="Search or select member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member-1">Bro. John Doe</SelectItem>
                          <SelectItem value="member-2">Sis. Jane Smith</SelectItem>
                          <SelectItem value="anonymous">Anonymous</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[14px] font-medium text-[#1c385c]">
                        Amount <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder=""
                          className="bg-transparent border-slate-200 rounded-[8px] h-11 text-[14px] focus-visible:ring-1 focus-visible:ring-[#28c1a6] focus-visible:border-[#28c1a6]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[14px] font-medium text-[#1c385c]">
                        Payment Method <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-slate-200 rounded-[8px] h-11 text-[14px] focus:ring-1 focus:ring-[#28c1a6] focus:border-[#28c1a6]">
                            <SelectValue placeholder="Cash" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 pt-1">
                      <FormLabel className="flex text-[14px] font-medium text-[#1c385c]">
                        Receipt Number
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-slate-200 rounded-[8px] h-11 text-[14px] focus:ring-1 focus:ring-[#28c1a6] focus:border-[#28c1a6]">
                            <SelectValue placeholder="RCP-2024-0158" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RCP-2024-0158">RCP-2024-0158</SelectItem>
                          <SelectItem value="RCP-2024-0159">RCP-2024-0159</SelectItem>
                          <SelectItem value="RCP-2024-0160">RCP-2024-0160</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center sm:justify-center gap-4 pt-6 pb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="bg-[#bccucf] text-[#0f2846] hover:bg-[#b0bdc2] font-semibold text-[15px] h-12 px-8 rounded-[8px] min-w-[130px] bg-[#b9cfcc]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#28c1a6] text-white hover:bg-[#22a68e] font-semibold text-[15px] h-12 px-8 rounded-[8px] min-w-[200px]"
                  >
                    Record & Print Receipt
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
