'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  memberModalContentClassName,
  memberModalListClassName,
} from '@/components/admin/membership/memberDialogStyles';
import { AlertTriangle } from 'lucide-react';

export interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  names: string[];
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  names,
  loading,
  onConfirm,
}: DeleteMemberDialogProps) {
  const count = names.length;
  const title = count === 1 ? 'Remove this member?' : `Remove ${count} members?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', memberModalContentClassName)}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden />
          </div>
          <DialogTitle className="text-center text-lg text-slate-900 dark:text-slate-50">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-600 dark:text-slate-300">
            They will be removed from your directory (soft delete). Contact support if you need to
            restore a record.
          </DialogDescription>
          {names.length > 0 ? (
            <ul
              className={cn(
                'max-h-32 overflow-y-auto rounded-lg px-3 py-2 text-left text-sm text-slate-800 dark:text-slate-100',
                memberModalListClassName
              )}
            >
              {names.map((n, i) => (
                <li key={`${i}-${n}`} className="truncate py-0.5">
                  {n}
                </li>
              ))}
            </ul>
          ) : null}
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 sm:w-auto"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full bg-[#0B2A4A] text-white hover:bg-[#0B2A4A]/90 dark:bg-teal-600 dark:hover:bg-teal-600/90 sm:w-auto"
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
