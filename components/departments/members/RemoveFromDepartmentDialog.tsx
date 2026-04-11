'use client';

import { useState, useCallback } from 'react';
import { UserMinus, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DepartmentMember } from './membersDummyData';

export interface RemoveFromDepartmentDialogProps {
  open: boolean;
  /** Members to remove (one or many); empty closes without action. */
  members: DepartmentMember[];
  departmentName: string;
  isDark: boolean;
  accentColor: string;
  onOpenChange: (open: boolean) => void;
  /** Perform API + local cleanup; throw to show error in dialog. */
  onRemove: (members: DepartmentMember[]) => Promise<void>;
}

export default function RemoveFromDepartmentDialog({
  open,
  members,
  departmentName,
  isDark,
  accentColor,
  onOpenChange,
  onRemove,
}: RemoveFromDepartmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = members.length;
  const isBulk = count > 1;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && loading) {
        return;
      }
      if (!next) {
        setError(null);
      }
      onOpenChange(next);
    },
    [loading, onOpenChange]
  );

  const handleConfirm = useCallback(async () => {
    if (count === 0 || loading) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onRemove(members);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      return;
    } finally {
      setLoading(false);
    }
    onOpenChange(false);
  }, [count, loading, members, onOpenChange, onRemove]);

  const muted = isDark ? 'text-slate-400' : 'text-slate-600';
  const listBg = isDark ? 'bg-white/[0.04]' : 'bg-slate-50';
  const listBorder = isDark ? 'border-white/10' : 'border-slate-200';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!loading}
        className={
          isDark
            ? 'border-white/10 bg-[#0D1F36] text-slate-100 sm:max-w-md'
            : 'sm:max-w-md'
        }
        onPointerDownOutside={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(239,68,68,0.1)',
                color: isDark ? '#FCA5A5' : '#DC2626',
              }}
            >
              <UserMinus className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1 pt-0.5">
              <DialogTitle className="text-left text-base sm:text-lg leading-snug">
                {isBulk ? `Remove ${count} people` : 'Remove from department'}
              </DialogTitle>
              <DialogDescription className={`text-left ${muted}`}>
                {isBulk
                  ? `They will be removed from ${departmentName} only. Their church membership and other departments are not affected.`
                  : `${members[0]?.name ?? 'This member'} will be removed from ${departmentName} only. They remain in the church directory and other departments.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isBulk && count <= 12 && (
          <ul
            className={`max-h-40 overflow-y-auto rounded-lg border px-3 py-2 text-sm ${listBg} ${listBorder}`}
          >
            {members.map((m) => (
              <li key={m.id} className="truncate py-1 border-b border-white/5 last:border-0">
                {m.name}
              </li>
            ))}
          </ul>
        )}

        {isBulk && count > 12 && (
          <p className={`text-sm ${muted}`}>
            Including {members
              .slice(0, 3)
              .map((m) => m.name)
              .join(', ')}
            {count > 3 ? ` and ${count - 3} others` : ''}.
          </p>
        )}

        {error ? (
          <div
            className="flex gap-2 rounded-lg border px-3 py-2.5 text-sm"
            style={{
              borderColor: isDark ? 'rgba(248,113,113,0.35)' : '#FECACA',
              background: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
              color: isDark ? '#FCA5A5' : '#B91C1C',
            }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => handleOpenChange(false)}
            className={isDark ? 'border-white/15 bg-transparent text-slate-200 hover:bg-white/5' : ''}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || count === 0}
            className="inline-flex items-center justify-center gap-2 text-white font-semibold shadow-md"
            style={{ backgroundColor: accentColor }}
            onClick={() => void handleConfirm()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Removing…
              </>
            ) : isBulk ? (
              `Remove ${count}`
            ) : (
              'Remove'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
