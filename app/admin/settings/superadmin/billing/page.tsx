'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import {
  ArrowLeft,
  Check,
  Zap,
  TrendingUp,
  Crown,
  CreditCard,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PRICING_PLANS } from '@/components/PricingSection';
import { initializePaystackCheckout } from '@/lib/subscriptionPaymentsApi';

/** Matches backend Church.subscription_plan codes */
const BACKEND_PLAN: Record<string, 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'> = {
  free: 'FREE',
  basic: 'BASIC',
  premium: 'PREMIUM',
  enterprise: 'ENTERPRISE',
};

function amountGhs(
  plan: (typeof PRICING_PLANS)[number],
  billingPeriod: 'monthly' | 'annual'
): number {
  if (plan.monthlyPrice === '0') {
    return 0;
  }
  if (billingPeriod === 'monthly') {
    return Number(plan.monthlyPrice);
  }
  const yearly = Number(plan.yearlyPrice);
  return Math.round(yearly * 0.8 * 100) / 100;
}

// Map plan id → display info (matches PRICING_PLANS exactly)
const PLAN_META: Record<string, { icon: typeof Zap; color: string }> = {
  free: { icon: Zap, color: '#6B7280' },
  basic: { icon: TrendingUp, color: '#2FC4B2' },
  premium: { icon: TrendingUp, color: '#0B2A4A' },
  enterprise: { icon: Crown, color: '#F59E0B' },
};

export default function BillingPage() {
  const { profile, updateProfile } = useChurchProfile();
  const pc = profile.primaryColor || '#0B2A4A';

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  // Current plan from profile (set during signup Step3)
  const currentPlanId = (profile as unknown as Record<string, string>).subscribedPlan || 'free';

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlanId) {
      return;
    }
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return;
    }

    const amt = amountGhs(plan, billing);
    const backendCode = BACKEND_PLAN[planId];

    // Free tier: no Paystack — update local profile only
    if (amt <= 0 || planId === 'free') {
      setLoading(planId);
      try {
        await new Promise((r) => setTimeout(r, 300));
        updateProfile({ subscribedPlan: planId } as Parameters<typeof updateProfile>[0]);
        toast.success('Plan updated', { description: `You are now on the ${plan.title} plan.` });
      } finally {
        setLoading(null);
      }
      return;
    }

    const email = profile.adminEmail?.trim();
    if (!email) {
      toast.error('Add your email in profile settings before paying.');
      return;
    }

    if (!backendCode) {
      toast.error('Unknown plan.');
      return;
    }

    setLoading(planId);
    try {
      const { authorization_url } = await initializePaystackCheckout({
        amount: amt,
        email,
        redirect_path: '/admin/settings/superadmin/billing',
        metadata: {
          subscription_plan: backendCode,
          billing_cycle: billing === 'monthly' ? 'MONTHLY' : 'YEARLY',
          frontend_plan_id: planId,
        },
      });
      toast.message('Redirecting to Paystack…', {
        description: 'Complete payment on the secure Paystack page.',
      });
      window.location.assign(authorization_url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open Paystack checkout');
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link
        href="/admin/settings/superadmin"
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-[color:var(--primary-brand)] dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={15} /> Back to Settings
      </Link>

      <div>
        <h2 className="text-2xl font-black text-[#0B2A4A] dark:text-white">Billing &amp; Plans</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription. Your current plan is highlighted.
        </p>
      </div>

      {/* Current plan banner */}
      <div
        className="rounded-2xl p-5 border flex items-center justify-between gap-4 flex-wrap"
        style={{ backgroundColor: `${pc}0D`, borderColor: `${pc}30` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: pc }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Current plan
            </p>
            <p className="text-lg font-black text-[#0B2A4A] dark:text-white capitalize">
              {PRICING_PLANS.find((p) => p.id === currentPlanId)?.title || 'Start Free'}
            </p>
            <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
              <Calendar size={12} />
              {currentPlanId === 'free' ? 'Trial — upgrade to keep access' : 'Active subscription'}
            </p>
          </div>
        </div>
        {currentPlanId === 'free' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <AlertCircle size={15} className="text-amber-500 shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400 font-semibold">
              Free trial — upgrade before it expires
            </p>
          </div>
        )}
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3">
        <p className="text-[13px] font-semibold text-muted-foreground">Billing:</p>
        <div className="flex bg-muted/80 dark:bg-white/10 rounded-xl p-1 gap-1">
          {(['monthly', 'annual'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${billing === b ? 'bg-white dark:bg-[var(--admin-surface)] text-[#0B2A4A] dark:text-white shadow dark:ring-1 dark:ring-white/10' : 'text-muted-foreground'}`}
            >
              {b}{' '}
              {b === 'annual' && (
                <span className="text-[10px] text-green-500 font-black ml-1">-20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards — same design as PricingSection, same features */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const monthPrice = plan.monthlyPrice;
          const annPrice = Math.round((Number(plan.yearlyPrice) * 0.8) / 12); // monthly equiv
          const price = billing === 'monthly' ? monthPrice : String(annPrice);
          const Meta = PLAN_META[plan.id] ?? PLAN_META.free;
          const Icon = Meta.icon;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300 bg-[var(--admin-surface)] ${
                isCurrent
                  ? 'border-[#2FC4B2] shadow-xl shadow-[#2FC4B2]/10'
                  : 'border-[var(--admin-border)] hover:border-[#2FC4B2]/40 dark:ring-1 dark:ring-white/10'
              }`}
              style={{
                background: isCurrent
                  ? `linear-gradient(135deg, ${pc} 0%, ${pc}EE 100%)`
                  : undefined,
              }}
            >
              {isCurrent && (
                <div
                  className="absolute top-0 left-0 right-0 text-center text-[10px] font-black uppercase tracking-widest py-1 text-white"
                  style={{ backgroundColor: '#2FC4B2' }}
                >
                  Current Plan
                </div>
              )}

              <div className={`p-5 flex-1 ${isCurrent ? 'pt-7' : ''}`}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                  style={{ backgroundColor: isCurrent ? 'rgba(255,255,255,0.2)' : Meta.color }}
                >
                  <Icon size={20} />
                </div>
                <h3
                  className={`text-[16px] font-black mb-1 ${isCurrent ? 'text-white' : 'text-[#0B2A4A] dark:text-white'}`}
                >
                  {plan.title}
                </h3>
                <div className="flex items-baseline gap-0.5 my-2">
                  {plan.monthlyPrice === '0' ? (
                    <span
                      className={`text-2xl font-black ${isCurrent ? 'text-white' : 'text-[#0B2A4A] dark:text-white'}`}
                    >
                      Free
                    </span>
                  ) : (
                    <>
                      <span
                        className={`text-[12px] font-bold ${isCurrent ? 'text-white/70' : 'text-gray-400'}`}
                      >
                        ₵
                      </span>
                      <span
                        className={`text-2xl font-black ${isCurrent ? 'text-white' : 'text-[#0B2A4A] dark:text-white'}`}
                      >
                        {price}
                      </span>
                      <span
                        className={`text-[11px] ${isCurrent ? 'text-white/60' : 'text-gray-400'}`}
                      >
                        /mo
                      </span>
                    </>
                  )}
                </div>

                {/* Features — same as PricingSection */}
                <ul className="space-y-2 mt-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-[12px]"
                      style={{
                        color: isCurrent ? 'rgba(255,255,255,0.85)' : undefined,
                      }}
                    >
                      <Check
                        size={12}
                        className={isCurrent ? 'text-[#2FC4B2]' : 'text-green-500'}
                        style={{ flexShrink: 0 }}
                      />{' '}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 pt-0">
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || isCurrent}
                  className="w-full h-10 rounded-xl font-bold text-[12px] transition-all active:scale-95"
                  style={{
                    backgroundColor: isCurrent
                      ? 'rgba(255,255,255,0.15)'
                      : plan.monthlyPrice === '0'
                        ? '#F1F5F9'
                        : pc,
                    color: isCurrent ? '#fff' : plan.monthlyPrice === '0' ? '#94A3B8' : '#fff',
                  }}
                >
                  {loading === plan.id
                    ? plan.monthlyPrice === '0'
                      ? 'Updating...'
                      : 'Opening Paystack...'
                    : isCurrent
                      ? 'Current Plan'
                      : plan.monthlyPrice === '0'
                        ? `Switch to ${plan.title}`
                        : `Pay with Paystack — ${plan.title}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment method strip */}
      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] p-6 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
        <h3 className="text-[15px] font-black text-[#0B2A4A] dark:text-white mb-4">
          Payment Method
        </h3>
        <div className="flex items-center gap-4 p-4 bg-muted/40 dark:bg-white/[0.04] rounded-xl border border-dashed border-[var(--admin-border)]">
          <CreditCard size={24} className="text-muted-foreground/50" />
          <div>
            <p className="text-[13px] font-bold text-[#0B2A4A] dark:text-white">
              No payment method added
            </p>
            <p className="text-[11px] text-muted-foreground">
              Add a mobile money or card to activate your plan
            </p>
          </div>
          <Button
            variant="outline"
            className="ml-auto text-[12px] font-bold h-9 rounded-xl px-4"
            onClick={() => toast.info('Payment setup coming soon')}
          >
            Add method
          </Button>
        </div>
      </div>
    </div>
  );
}
