'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HeartHandshake,
  Download,
  CreditCard,
  History,
  TrendingUp,
  Banknote,
  Target,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MembershipTopbar from '@/components/membership/MembershipTopbar';
import { downloadMemberGivingStatementPdf } from '@/lib/memberGivingStatement';
import {
  cancelMyPledge,
  createMyPledge,
  getAccessToken,
  getCurrentMemberProfile,
  getMemberGivingSummary,
  getMyPledges,
  type MemberDetail,
  type MemberGivingSummary,
  type MemberPledge,
} from '@/lib/api';

type FilterType = 'All' | 'Tithe' | 'Offering' | 'Other';

function formatGhs(amount: string): string {
  const n = parseFloat(amount);
  if (!Number.isFinite(n)) {
    return `GH₵ ${amount}`;
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function classifyGivingCategory(categoryName: string): 'Tithe' | 'Offering' | 'Other' {
  const n = (categoryName || '').toLowerCase();
  if (n.includes('tithe')) {
    return 'Tithe';
  }
  if (n.includes('offer')) {
    return 'Offering';
  }
  return 'Other';
}

function formatHistoryDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

const emptySummary: MemberGivingSummary = {
  ytd_total: '0.00',
  ytd_tithe: '0.00',
  ytd_offering: '0.00',
  ytd_other: '0.00',
  recent: [],
  history: [],
};

function pledgeProgress(pledge: MemberPledge): number {
  const t = parseFloat(pledge.target_amount);
  const f = parseFloat(pledge.amount_fulfilled);
  if (!Number.isFinite(t) || t <= 0) {
    return 0;
  }
  if (!Number.isFinite(f) || f <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((f / t) * 100));
}

export default function MembershipGivingPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<MemberGivingSummary>(emptySummary);
  const [pledges, setPledges] = useState<MemberPledge[]>([]);
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false);
  const [pledgeYear, setPledgeYear] = useState(() => new Date().getFullYear());
  const [pledgeTitle, setPledgeTitle] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeNotes, setPledgeNotes] = useState('');
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [pledgeInlineError, setPledgeInlineError] = useState<string | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberDetail | null>(null);
  const [giveNowDialogOpen, setGiveNowDialogOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const onlineGivingUrl =
    typeof process.env.NEXT_PUBLIC_ONLINE_GIVING_URL === 'string'
      ? process.env.NEXT_PUBLIC_ONLINE_GIVING_URL.trim()
      : '';

  const memberDisplayName = useMemo(() => {
    const m = memberProfile;
    if (!m) {
      return 'Member';
    }
    const full = m.full_name?.trim();
    if (full) {
      return full;
    }
    const parts = [m.first_name, m.last_name].filter(Boolean).join(' ').trim();
    return parts || 'Member';
  }, [memberProfile]);

  const canUseGivingActions = !loading && !error && Boolean(getAccessToken());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionNotice(null);
    try {
      if (!getAccessToken()) {
        setSummary(emptySummary);
        setPledges([]);
        setMemberProfile(null);
        setError('Sign in to view your giving.');
        return;
      }
      const data = await getMemberGivingSummary().catch(() => null);
      const profile = await getCurrentMemberProfile().catch(() => null);
      setMemberProfile(profile);
      let pledgeList: MemberPledge[] | null = null;
      try {
        pledgeList = await getMyPledges();
      } catch {
        pledgeList = [];
      }
      if (!data) {
        setSummary(emptySummary);
        setPledges([]);
        setError(
          'No member profile is linked to your account, or giving could not be loaded. Your church can link your member record to enable this view.'
        );
        return;
      }
      setSummary(data);
      setPledges(Array.isArray(pledgeList) ? pledgeList : []);
    } catch (e) {
      setSummary(emptySummary);
      setPledges([]);
      setMemberProfile(null);
      setError(e instanceof Error ? e.message : 'Could not load giving.');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitNewPledge = async () => {
    setPledgeError(null);
    const amt = parseFloat(pledgeAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setPledgeError('Enter a valid pledge amount.');
      return;
    }
    setPledgeSubmitting(true);
    try {
      await createMyPledge({
        pledge_year: pledgeYear,
        title: pledgeTitle.trim() || undefined,
        target_amount: amt.toFixed(2),
        notes: pledgeNotes.trim() || undefined,
      });
      setPledgeDialogOpen(false);
      setPledgeTitle('');
      setPledgeAmount('');
      setPledgeNotes('');
      setPledgeYear(new Date().getFullYear());
      await load();
    } catch (e) {
      setPledgeError(e instanceof Error ? e.message : 'Could not save pledge.');
    } finally {
      setPledgeSubmitting(false);
    }
  };

  const handleCancelPledge = async (id: string) => {
    if (!window.confirm('Cancel this pledge? You can create a new one later if needed.')) {
      return;
    }
    setCancellingId(id);
    try {
      await cancelMyPledge(id);
      setPledgeInlineError(null);
      await load();
    } catch (e) {
      setPledgeInlineError(e instanceof Error ? e.message : 'Could not cancel pledge.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleGiveNow = () => {
    if (!canUseGivingActions) {
      return;
    }
    setActionNotice(null);
    if (onlineGivingUrl) {
      window.open(onlineGivingUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setGiveNowDialogOpen(true);
  };

  const handleStatement = () => {
    if (!canUseGivingActions) {
      return;
    }
    setActionNotice(null);
    try {
      downloadMemberGivingStatementPdf({
        summary,
        memberName: memberDisplayName,
        pledges,
      });
    } catch (e) {
      setActionNotice(e instanceof Error ? e.message : 'Could not create PDF.');
    }
  };

  useEffect(() => {
    void load();
  }, [load]);

  const summaries = useMemo(() => {
    return [
      { label: 'Tithes (YTD)', amount: formatGhs(summary.ytd_tithe), icon: TrendingUp },
      { label: 'Offerings (YTD)', amount: formatGhs(summary.ytd_offering), icon: HeartHandshake },
      { label: 'Other (YTD)', amount: formatGhs(summary.ytd_other), icon: Target },
      { label: 'Total (YTD)', amount: formatGhs(summary.ytd_total), icon: Banknote },
    ];
  }, [summary]);

  const historyRows = useMemo(() => {
    return summary.history.map((h) => ({
      ...h,
      displayDate: formatHistoryDate(h.transaction_date),
      filterType: classifyGivingCategory(h.category_name),
    }));
  }, [summary.history]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'All') {
      return historyRows;
    }
    return historyRows.filter((h) => h.filterType === activeFilter);
  }, [historyRows, activeFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <MembershipTopbar
            title="My Giving"
            subtitle="Tithes, offerings, and recorded contributions for your member profile"
            icon={<HeartHandshake className="text-[#2FC4B2]" size={24} />}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            type="button"
            disabled={!canUseGivingActions}
            title={
              onlineGivingUrl
                ? 'Open your church online giving page'
                : 'Opens online giving if configured, or instructions'
            }
            onClick={() => handleGiveNow()}
            className="bg-[#2FC4B2] hover:bg-[#2FC4B2]/90 text-white font-medium shadow-sm h-10 px-6 w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Give Now
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseGivingActions}
            title="Download a PDF of your recorded giving and pledges"
            onClick={() => handleStatement()}
            className="border-gray-200 text-[#0A2E46] font-medium h-10 px-4 w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4 mr-2" />
            Statement
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[13px] text-red-900"
          role="alert"
        >
          {actionNotice}
        </div>
      )}

      {error && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your giving…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaries.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className="p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden rounded-xl"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2FC4B2]" />
                  <div className="bg-[#0A2E46]/5 p-3 rounded-full">
                    <Icon className="w-5 h-5 text-[#0A2E46]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold text-[#2FC4B2] mt-0.5">{item.amount}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#0A2E46]" />
                    <h2 className="text-[16px] font-bold text-[#0A2E46]">Transaction history</h2>
                  </div>

                  <div className="flex bg-gray-100/80 p-1 rounded-lg self-start sm:self-auto">
                    {(['All', 'Tithe', 'Offering', 'Other'] as FilterType[]).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                          'px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors',
                          activeFilter === filter
                            ? 'bg-white text-[#0A2E46] shadow-sm'
                            : 'text-gray-500 hover:text-[#0A2E46]'
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-[12px] uppercase tracking-wider border-b border-gray-100">
                        <th className="px-5 py-3 font-semibold">Date &amp; receipt</th>
                        <th className="px-5 py-3 font-semibold">Type</th>
                        <th className="px-5 py-3 font-semibold">Method</th>
                        <th className="px-5 py-3 font-semibold text-right">Amount</th>
                        <th className="px-5 py-3 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-[#0A2E46] text-[14px]">{item.displayDate}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{item.receipt_number}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-gray-700 text-[13px]">
                              {item.category_name || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-gray-500 text-[13px]">{item.payment_method}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-[#0A2E46] text-[14px]">
                            {formatGhs(item.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[11px]">
                              Recorded
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {filteredHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-[14px]">
                            No transactions for this filter yet. Treasury entries must be linked to your
                            member profile to appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {summary.history.length >= 250 && (
                  <div className="p-3 border-t border-gray-100 text-center text-[12px] text-muted-foreground">
                    Showing the latest 250 transactions. Contact the church office for a full statement.
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#0A2E46]" />
                    <h2 className="text-[16px] font-bold text-[#0A2E46]">My pledges</h2>
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                  Create a pledge here; when you give in person or online, treasury can link the receipt to
                  this pledge so your progress updates automatically.
                </p>
                {pledgeInlineError && (
                  <div
                    className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-900"
                    role="alert"
                  >
                    {pledgeInlineError}
                  </div>
                )}
                <div className="space-y-3 mb-4 max-h-[320px] overflow-y-auto pr-1">
                  {pledges.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">
                      No pledges yet. Use the button below to add one for this year or a special project.
                    </p>
                  ) : (
                    pledges.map((p) => {
                      const pct = pledgeProgress(p);
                      return (
                        <div
                          key={p.id}
                          className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13px] font-semibold text-[#0A2E46]">
                                {p.title?.trim() || 'Giving pledge'} · {p.pledge_year}
                              </p>
                              <p className="text-[12px] text-muted-foreground mt-0.5">
                                {formatGhs(p.amount_fulfilled)} of {formatGhs(p.target_amount)}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                'border-none text-[10px] shrink-0',
                                p.status === 'FULFILLED' && 'bg-emerald-100 text-emerald-800',
                                p.status === 'ACTIVE' && 'bg-amber-100 text-amber-900',
                                p.status === 'CANCELLED' && 'bg-gray-200 text-gray-700'
                              )}
                            >
                              {p.status === 'ACTIVE'
                                ? 'In progress'
                                : p.status === 'FULFILLED'
                                  ? 'Fulfilled'
                                  : 'Cancelled'}
                            </Badge>
                          </div>
                          {p.status === 'ACTIVE' && (
                            <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#2FC4B2] transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                          {p.status === 'ACTIVE' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-[12px] text-muted-foreground"
                              disabled={cancellingId === p.id}
                              onClick={() => void handleCancelPledge(p.id)}
                            >
                              {cancellingId === p.id ? 'Cancelling…' : 'Cancel pledge'}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <Separator className="my-4" />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#2FC4B2] text-[#0A2E46] hover:bg-[#2FC4B2]/10"
                  disabled={loading || !!error}
                  onClick={() => {
                    setPledgeError(null);
                    setPledgeDialogOpen(true);
                  }}
                >
                  Make a new pledge
                </Button>
              </Card>

              <Card className="border-transparent shadow-sm rounded-xl p-5 bg-gradient-to-br from-[#0A2E46] to-[#124263] text-white">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="bg-white/10 p-3 rounded-full">
                    <HeartHandshake className="w-6 h-6 text-[#2FC4B2]" />
                  </div>
                  <h3 className="font-bold text-[16px]">Automate your giving</h3>
                  <p className="text-[13px] text-white/80 leading-relaxed">
                    Recurring gifts are not available in the portal yet. Ask your treasurer about standing
                    orders or mobile-money setups.
                  </p>
                  <Button
                    type="button"
                    disabled
                    className="mt-2 bg-[#2FC4B2]/50 text-white w-full font-medium cursor-not-allowed"
                  >
                    Set up auto-give
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      <Dialog open={pledgeDialogOpen} onOpenChange={setPledgeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New pledge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {pledgeError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-900">
                {pledgeError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="pledge-year">Year</Label>
              <Input
                id="pledge-year"
                type="number"
                min={2000}
                max={2100}
                value={pledgeYear}
                onChange={(e) => setPledgeYear(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pledge-title">Title (optional)</Label>
              <Input
                id="pledge-title"
                placeholder="e.g. Harvest, Building fund"
                value={pledgeTitle}
                onChange={(e) => setPledgeTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pledge-amt">Amount (GHS)</Label>
              <Input
                id="pledge-amt"
                inputMode="decimal"
                placeholder="0.00"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pledge-notes">Notes (optional)</Label>
              <Textarea
                id="pledge-notes"
                rows={3}
                placeholder="Anything your treasurer should know"
                value={pledgeNotes}
                onChange={(e) => setPledgeNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPledgeDialogOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              className="bg-[#2FC4B2] text-white hover:bg-[#2FC4B2]/90"
              disabled={pledgeSubmitting}
              onClick={() => void submitNewPledge()}
            >
              {pledgeSubmitting ? 'Saving…' : 'Save pledge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={giveNowDialogOpen} onOpenChange={setGiveNowDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Give now</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Payments are not processed inside this page. Use the method your church provides—mobile money,
            bank transfer, e-treasury, or offering during services. Your treasurer can share the correct
            numbers or links.
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            If your church has a single web page for online giving, your admin can configure it so this
            button opens that page automatically.
          </p>
          <DialogFooter>
            <Button type="button" onClick={() => setGiveNowDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
