'use client';

import { User, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Approval {
  id: string;
  name: string;
  description: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  linkedPage?: string;
}

interface PendingApprovalsProps {
  approvals?: Approval[];
  onApprove?: (id: string) => void;
  onDetails?: (id: string) => void;
}

const PendingApprovals = ({ approvals = [], onApprove, onDetails }: PendingApprovalsProps) => {
  if (approvals.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">Pending Approvals</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Items requiring your authorization
          </p>
        </div>
        <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
          {approvals.length} New
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvals.map((item) => (
          <div
            key={item.id}
            className="group border border-border rounded-2xl p-4 hover:border-primary/30 hover:bg-muted/5 transition-all duration-200"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0B2A4A]/5 flex items-center justify-center shrink-0">
                <User size={20} className="text-[#0B2A4A]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-[#0B2A4A] truncate">{item.name}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {item.role}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => onDetails?.(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Eye size={14} /> Details
                </button>
                <button
                  onClick={() => onApprove?.(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-white bg-[#0B2A4A] hover:opacity-90 transition-opacity"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper component for the status badge
const StatusBadge = ({ status }: { status: Approval['status'] }) => {
  const styles = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={cn(
        'text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shrink-0',
        styles[status]
      )}
    >
      {status}
    </span>
  );
};

export default PendingApprovals;
