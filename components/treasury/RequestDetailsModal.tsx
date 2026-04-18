'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestDetails: any; // We can type this later. Example: { id, title, dept, requestedBy... }
  onUseForRecording: () => void;
}

export function RequestDetailsModal({
  open,
  onOpenChange,
  requestDetails,
  onUseForRecording,
}: RequestDetailsModalProps) {
  if (!requestDetails) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">Request Details</DialogTitle>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[1rem] bg-white"
      >
        <div className="flex flex-col text-[#0f2846]">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[18px] font-bold tracking-tight text-[#0f2846]">Request Details</h2>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <h3 className="text-[16px] font-bold text-[#0f2846]">
                {requestDetails.title || 'Youth Camp Materials'}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium">
                {requestDetails.id || 'REQ-2024-002'} • {requestDetails.dept || 'Adventist Youth'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#eaf4ef] rounded-lg p-3">
                <p className="text-[11px] text-[#147e6b] font-semibold mb-0.5">Requested By</p>
                <p className="text-[13px] font-bold text-[#0f2846]">
                  {requestDetails.requestedBy || 'Samuel Wilson'}
                </p>
                <p className="text-[11px] text-[#0f2846]/70 mt-0.5">
                  {requestDetails.requestedDate || '2024-08-14'}
                </p>
              </div>
              <div className="bg-[#eaf4ef] rounded-lg p-3">
                <p className="text-[11px] text-[#147e6b] font-semibold mb-0.5">Approved By</p>
                <p className="text-[13px] font-bold text-[#0f2846]">
                  {requestDetails.approvedBy || 'Elder David Wilson'}
                </p>
                <p className="text-[11px] text-[#0f2846]/70 mt-0.5">
                  {requestDetails.approvedDate || '2024-08-15'}
                </p>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-[14px] font-bold text-[#0f2846] mb-1.5">Purpose</h4>
              <p className="text-[13px] text-[#0f2846]">
                {requestDetails.purpose || 'Camping supplies and food for youth retreat'}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-[14px] font-bold text-[#0f2846] mb-2">Requested Items</h4>
              <div className="bg-white border text-[13px] border-slate-100 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_50px_70px_70px] gap-2 bg-[#f1f5f9] p-2.5 font-bold text-[#0f2846]">
                  <div>Description</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Unit cost</div>
                  <div className="text-right">Total</div>
                </div>

                {(
                  requestDetails.items || [
                    { desc: 'Tents rental', qty: 1, cost: 100, total: 100 },
                    { desc: 'Food supplies', qty: 3, cost: 200, total: 600 },
                  ]
                ).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_50px_70px_70px] gap-2 p-2.5 font-medium border-t border-slate-100 text-[#0f2846]"
                  >
                    <div>{item.desc}</div>
                    <div className="text-center">{item.qty}</div>
                    <div className="text-right">Ghs{item.cost}</div>
                    <div className="text-right">Ghs{item.total}</div>
                  </div>
                ))}

                <div className="grid grid-cols-[1fr_70px] gap-2 p-3 font-bold border-t border-slate-200 text-[#0f2846]">
                  <div className="text-right">Total:</div>
                  <div className="text-right">Ghs{requestDetails.totalAmount || '700'}</div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                onUseForRecording();
                onOpenChange(false);
              }}
              className="w-full bg-[#28c1a6] hover:bg-[#21a48c] text-white font-bold text-[15px] h-11 rounded-md"
            >
              Use for Recording
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
