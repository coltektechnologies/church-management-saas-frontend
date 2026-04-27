'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type TreasuryRequestPreview = {
  requestNumber: string;
  title: string;
  dept: string;
  date: string;
  amount: string;
  purpose: string;
  requestedByName: string;
  approvedByName: string;
  amountInWords: string;
  treasurerApprovedAt: string | null;
  items?: { desc: string; qty: number; cost: number; total: number }[];
};

export interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestDetails: TreasuryRequestPreview | null;
  onUseForRecording: () => void;
}

const dash = '—';

export function RequestDetailsModal({
  open,
  onOpenChange,
  requestDetails,
  onUseForRecording,
}: RequestDetailsModalProps) {
  if (!requestDetails) {
    return null;
  }

  const items =
    requestDetails.items && requestDetails.items.length > 0 ? requestDetails.items : null;
  const totalForTable = items
    ? items.reduce((s, it) => s + (Number.isFinite(it.total) ? it.total : 0), 0)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">Request details</DialogTitle>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[1rem] bg-white"
      >
        <div className="flex flex-col text-[#0f2846]">
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[18px] font-bold tracking-tight text-[#0f2846]">Request details</h2>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <h3 className="text-[16px] font-bold text-[#0f2846]">
                {requestDetails.title || dash}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium">
                {requestDetails.requestNumber || dash} • {requestDetails.dept}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#eaf4ef] rounded-lg p-3">
                <p className="text-[11px] text-[#147e6b] font-semibold mb-0.5">Requested by</p>
                <p className="text-[13px] font-bold text-[#0f2846]">
                  {requestDetails.requestedByName || dash}
                </p>
                <p className="text-[11px] text-[#0f2846]/70 mt-0.5">
                  Needed by {requestDetails.date || dash}
                </p>
              </div>
              <div className="bg-[#eaf4ef] rounded-lg p-3">
                <p className="text-[11px] text-[#147e6b] font-semibold mb-0.5">
                  Approved by (treasurer)
                </p>
                <p className="text-[13px] font-bold text-[#0f2846]">
                  {requestDetails.approvedByName || dash}
                </p>
                <p className="text-[11px] text-[#0f2846]/70 mt-0.5">
                  {requestDetails.treasurerApprovedAt
                    ? `Signed ${requestDetails.treasurerApprovedAt}`
                    : 'Pending or not on record'}
                </p>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-[14px] font-bold text-[#0f2846] mb-1.5">Purpose</h4>
              <p className="text-[13px] text-[#0f2846]">{requestDetails.purpose || dash}</p>
            </div>

            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-700">
              <span className="font-semibold text-[#147e6b]">Amount in words</span>
              <p className="mt-1 text-[#0f2846] font-medium leading-snug">
                {requestDetails.amountInWords || '—'}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-[14px] font-bold text-[#0f2846] mb-2">Line items</h4>
              <div className="bg-white border text-[13px] border-slate-100 rounded-lg overflow-hidden">
                {items ? (
                  <>
                    <div className="grid grid-cols-[1fr_50px_70px_70px] gap-2 bg-[#f1f5f9] p-2.5 font-bold text-[#0f2846]">
                      <div>Description</div>
                      <div className="text-center">Qty</div>
                      <div className="text-right">Unit</div>
                      <div className="text-right">Total</div>
                    </div>
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_50px_70px_70px] gap-2 p-2.5 font-medium border-t border-slate-100 text-[#0f2846]"
                      >
                        <div>{item.desc}</div>
                        <div className="text-center">{item.qty}</div>
                        <div className="text-right">GHS {item.cost}</div>
                        <div className="text-right">GHS {item.total}</div>
                      </div>
                    ))}
                    <div className="grid grid-cols-[1fr_70px] gap-2 p-3 font-bold border-t border-slate-200 text-[#0f2846]">
                      <div className="text-right">Total:</div>
                      <div className="text-right">GHS {totalForTable}</div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 font-medium text-[#0f2846] flex flex-col gap-1">
                    <span>
                      <span className="text-slate-500">Total requested: </span>
                      {requestDetails.amount}
                    </span>
                    <span className="text-[12px] text-slate-500">
                      No line-item breakdown on this request.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                onUseForRecording();
                onOpenChange(false);
              }}
              className="w-full bg-[#28c1a6] hover:bg-[#21a48c] text-white font-bold text-[15px] h-11 rounded-md"
            >
              Use for recording
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
