'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface LoadRequestAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

export function LoadRequestAlertModal({
  open,
  onOpenChange,
  requestId,
}: LoadRequestAlertModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">Load Request Notification</DialogTitle>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] p-8 overflow-hidden border-none shadow-2xl rounded-[1.5rem] bg-[#0c243c]"
      >
        <div className="flex flex-col">
          <h3 className="text-[#28c1a6] font-bold text-[16px] mb-4">Request Says.....</h3>

          <p className="text-white text-[15px] font-medium mb-8">
            Request {requestId || 'REQ-2024-001'} loaded. You can now review details before
            recording
          </p>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-transparent hover:bg-white/10 text-white font-bold text-[15px] h-11 px-8 rounded-full border-2 border-white"
            >
              OK.
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
