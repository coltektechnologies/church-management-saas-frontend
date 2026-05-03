'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getChurchId, getChurch, type ChurchApiResponse } from '@/lib/settingsApi';

const PLAN_LABELS: Record<string, string> = {
  TRIAL: 'Free Trial',
  FREE: 'Free Forever',
  BASIC: 'Basic',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
};

const SubscriptionTab = () => {
  const [church, setChurch] = useState<ChurchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const churchId = getChurchId();
    if (churchId) {
      getChurch(churchId).then((c) => {
        setChurch(c ?? null);
        setLoading(false);
      });
    } else {
      queueMicrotask(() => setLoading(false));
    }
  }, []);

  const handleCancel = () => {
    toast.error('Please contact support to cancel your subscription', {
      icon: <AlertCircle className="text-red-500" />,
    });
  };

  const plan = church?.subscription_plan ?? 'TRIAL';
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const price = church?.plan_price ?? 0;
  const isActive =
    church?.is_subscription_active ?? church?.is_trial_active ?? church?.status === 'ACTIVE';
  const nextBilling = church?.next_billing_date
    ? new Date(church.next_billing_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';
  const userCount = church?.user_count ?? 0;
  const maxUsers = church?.max_users ?? 50;
  const usagePct = maxUsers > 0 ? Math.min(100, Math.round((userCount / maxUsers) * 100)) : 0;

  if (loading) {
    return (
      <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 p-8 max-w-2xl animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CreditCard size={20} />
          </div>
          <p className="text-sm text-slate-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
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
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
          <Zap size={120} className="text-primary" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-black text-[#0B2A4A] uppercase tracking-wider">
              {planLabel}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Next billing: {nextBilling}
            </p>
          </div>
          <Badge className="bg-[#2FC4B2] text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-sm">
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="relative z-10">
          <p className="text-4xl font-black text-[#0B2A4A]">
            GHS {price}
            <span className="text-sm font-bold text-slate-400 tracking-normal">
              {' '}
              /{church?.billing_cycle === 'YEARLY' ? 'year' : 'month'}
            </span>
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10">
          {[
            `Up to ${maxUsers === 0 ? 'unlimited' : maxUsers} users`,
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

      {/* Usage Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
          <span>User Limit Usage</span>
          <span>
            {userCount} / {maxUsers === 0 ? '∞' : maxUsers}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2FC4B2] transition-all duration-1000"
            style={{ width: `${usagePct}%` }}
          />
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
