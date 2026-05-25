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
import { AlertTriangle, Trash2, Archive } from 'lucide-react';

export interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  names: string[];
  loading?: boolean;
  hardLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onHardDelete: () => void | Promise<void>;
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  names,
  loading,
  hardLoading,
  onConfirm,
  onHardDelete,
}: DeleteMemberDialogProps) {
  const count = names.length;
  const title = count === 1 ? 'Remove this member?' : `Remove ${count} members?`;
  const busy = loading || hardLoading;

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
            Choose how to remove {count === 1 ? 'this member' : `these ${count} members`}.
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

        {/* Option cards */}
        <div className="space-y-3 pt-1">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start gap-3">
              <Archive className="h-5 w-5 mt-0.5 shrink-0 text-slate-500" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  Archive (soft delete)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hides the record from your directory. The data is preserved and can be recovered
                  by support if needed.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="mt-3 w-full bg-[#0B2A4A] text-white hover:bg-[#0B2A4A]/90 dark:bg-teal-600 dark:hover:bg-teal-600/90"
              disabled={busy}
              onClick={() => void onConfirm()}
            >
              {loading ? 'Archiving...' : 'Archive member'}
            </Button>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-red-700 dark:text-red-400">
                  Permanently delete
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
                  Removes the record from the database entirely. This cannot be undone — you can add
                  the person again as a new member afterwards.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="mt-3 w-full"
              disabled={busy}
              onClick={() => void onHardDelete()}
            >
              {hardLoading ? 'Deleting permanently...' : 'Permanently delete'}
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-1">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
