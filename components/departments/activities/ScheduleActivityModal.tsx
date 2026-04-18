'use client';

import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, 'Activity Name is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface ScheduleActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FormValues;
  isEditing?: boolean;
}

export function ScheduleActivityModal({
  open,
  onOpenChange,
  initialData,
  isEditing = false,
}: ScheduleActivityModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      date: '',
      time: '',
      location: '',
      description: '',
    },
  });

  // Effect to update form when initialData changes (e.g., when editing different items)
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: '',
        date: '',
        time: '',
        location: '',
        description: '',
      });
    }
  }, [initialData, form, open]);

  const onSubmit = (data: FormValues) => {
    console.log('Submitted activity data ready for backend:', data);
    // TODO: Connect to backend sequence
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">
        {isEditing ? 'Edit Activity' : 'Schedule Activity'}
      </DialogTitle>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-[1.25rem] bg-card"
      >
        <div className="flex flex-col text-slate-700 dark:text-slate-200">
          <div className="px-7 pt-7 pb-4">
            <div className="flex items-center gap-3">
              <div className="text-primary/90">
                <Image
                  src="/activities/schedule-activity.svg"
                  alt="Schedule Activity"
                  width={25}
                  height={25}
                />
              </div>
              <h2 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {isEditing ? 'Edit Activity' : 'Schedule Activity'}
              </h2>
            </div>
            <Separator className="mt-4 bg-border/80" />
          </div>

          <div className="px-7 pb-7 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[15px] font-medium text-slate-600 dark:text-slate-300">
                        Activity Name <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Activity className="h-[20px] w-[20px]" strokeWidth={1.5} />
                          </div>
                          <Input
                            placeholder="Activity Name"
                            className="pl-11 pr-4 h-12 bg-background border-slate-300 dark:border-slate-700 rounded-[10px] text-[15px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[13px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex text-[15px] font-medium text-slate-600 dark:text-slate-300">
                        Date <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            placeholder="dd/mm/yy"
                            className="pl-4 pr-11 h-12 bg-background border-slate-300 dark:border-slate-700 rounded-[10px] text-[15px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                            <CalendarDays className="h-[20px] w-[20px]" strokeWidth={1.75} />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[13px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[15px] font-medium text-slate-600 dark:text-slate-300">
                        Time
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="time"
                            placeholder="--/--"
                            className="pl-4 pr-11 h-12 bg-background border-slate-300 dark:border-slate-700 rounded-[10px] text-[15px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                            <Clock className="h-[20px] w-[20px]" strokeWidth={1.75} />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[13px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[15px] font-medium text-slate-600 dark:text-slate-300">
                        Location
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder=""
                            className="pl-4 pr-11 h-12 bg-background border-slate-300 dark:border-slate-700 rounded-[10px] text-[15px] focus-visible:ring-1 ring-primary/40 border-primary/40"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                            <MapPin
                              className="h-[20px] w-[20px] fill-slate-500 text-white dark:fill-slate-400 dark:text-background"
                              strokeWidth={1}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[13px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[15px] font-medium text-slate-600 dark:text-slate-300">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=""
                          className="min-h-[120px] resize-none bg-background border-slate-300 dark:border-slate-700 rounded-[10px] text-[15px] p-4 ring-1 ring-primary/40 border-primary/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[13px]" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3.5 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="bg-[#DDE4EE] text-[#1c2c44] hover:bg-[#c9d4e5] hover:text-[#1c2c44] font-semibold text-[15px] h-11 px-8 rounded-[8px]"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#1c3c5a] text-white hover:bg-[#142d45] font-semibold text-[15px] h-11 px-8 rounded-[8px] shadow-md border border-[#142d45]/20"
                  >
                    {isEditing ? 'Save Changes' : 'Schedule Activity'}
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
