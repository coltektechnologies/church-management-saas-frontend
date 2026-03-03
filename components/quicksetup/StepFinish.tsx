'use client';

import { Check } from 'lucide-react';

const StepFinish = () => (
  <div className="flex flex-col items-center justify-center text-center py-8 animate-in zoom-in-95 duration-500">
    <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6 shadow-sm">
      <Check size={40} className="text-secondary stroke-[3px]" />
    </div>
    <h3 className="text-xl font-black text-[#0B2A4A] mb-3">You&apos;re All Set!</h3>
    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
      Your church workspace is ready. You can always update these settings later from the dashboard.
    </p>
  </div>
);

export default StepFinish;
