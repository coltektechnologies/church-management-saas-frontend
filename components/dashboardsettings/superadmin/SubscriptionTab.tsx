'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionTab = () => {
  const handleCancel = () => {
    toast.error('Please contact support to cancel your subscription', {
      icon: <AlertCircle className="text-red-500" />,
    });
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <CreditCard size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">Subscription Plan</h3>
          <p className="text-xs text-slate-400 font-medium">
            Manage your billing and account limits.
          </p>
        </div>
      </div>

      {/* Main Plan Card */}
      <div className="relative overflow-hidden border-2 border-primary/20 rounded-[24px] p-6 space-y-4 bg-primary/[0.02]">
        {/* Subtle background decoration */}
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
          <Zap size={120} className="text-primary" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-black text-[#0B2A4A] uppercase tracking-wider">
              Standard Plan
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Next billing: Oct 12, 2026
            </p>
          </div>
          <Badge className="bg-[#2FC4B2] text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-sm">
            Active
          </Badge>
        </div>

        <div className="relative z-10">
          <p className="text-4xl font-black text-[#0B2A4A]">
            GHS 50<span className="text-sm font-bold text-slate-400 tracking-normal"> /month</span>
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10">
          {[
            'Up to 500 members',
            'Unlimited departments',
            'Financial reports',
            'Email notifications',
            'Priority support',
            'SMS Integration ready',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <CheckCircle2 size={14} className="text-[#2FC4B2]" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Usage Indicator (Helpful for SaaS transparency) */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
          <span>Member Limit Usage</span>
          <span>342 / 500</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#2FC4B2] w-[68%] transition-all duration-1000" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-50">
        <Button className="w-full sm:w-auto bg-[#0B2A4A] hover:bg-[#081e36] text-white px-8 h-12 rounded-xl font-bold gap-2 shadow-lg shadow-[#0B2A4A]/20">
          <Zap size={16} /> Upgrade to Pro
        </Button>
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="w-full sm:w-auto text-red-400 hover:text-red-500 hover:bg-red-50 font-bold text-xs rounded-xl"
        >
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionTab;
