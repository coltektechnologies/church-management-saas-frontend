'use client';

import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { User, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

export default function PendingApprovals() {
  const router = useRouter();
  const { approvals, approveItem, rejectItem } = useAppData();
  const { profile } = useChurchProfile();

  // ── Theme from context ──
  const pc = profile.primaryColor || '#0B2A4A';

  const pending = approvals.filter((a) => a.status === 'Pending');

  const handleDetails = (linkedPage?: string) => {
    router.push(linkedPage ? `/admin/${linkedPage}` : '/admin/approvals');
  };

  return (
    <div className="bg-card rounded-xl border border-border p-3 sm:p-4 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-foreground">
          Pending Approvals
        </h3>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <span
              className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
              style={{ backgroundColor: pc }}
            >
              {pending.length} pending
            </span>
          )}
          <button
            onClick={() => router.push('/admin/approvals')}
            className="text-[10px] font-medium hover:underline"
            style={{ color: pc }}
          >
            View all
          </button>
        </div>
      </div>

      {/* Empty state */}
      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ShieldCheck size={18} className="text-muted-foreground/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">No pending approvals</p>
          <p className="text-[10px] text-muted-foreground/60">Approval requests will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {pending.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-xl p-3 hover:border-primary/30 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User size={14} className="text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">{item.role}</span>
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => handleDetails(item.linkedPage)}
                    className="text-[9px] sm:text-[10px] font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => rejectItem(item.id)}
                    className="text-[9px] sm:text-[10px] font-medium bg-destructive/10 text-destructive px-2.5 py-1 rounded-full hover:bg-destructive/20 transition-colors flex items-center gap-1"
                  >
                    <XCircle size={10} /> Reject
                  </button>
                  <button
                    onClick={() => approveItem(item.id)}
                    className="text-[9px] sm:text-[10px] font-medium text-white px-2.5 py-1 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1"
                    style={{ backgroundColor: pc }}
                  >
                    <CheckCircle size={10} /> Approve
                  </button>
                </div>
              </div>

              {item.amount && (
                <div className="mt-1.5">
                  <span className="text-[9px] font-bold" style={{ color: pc }}>
                    ₵{item.amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
