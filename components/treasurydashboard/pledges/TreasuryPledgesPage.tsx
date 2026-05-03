'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTreasuryChurchPledges } from '@/lib/treasuryApi';

function formatGhs(s: string): string {
  const n = parseFloat(s);
  if (!Number.isFinite(n)) {
    return `GH₵ ${s}`;
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function statusBadgeClass(st: string): string {
  if (st === 'FULFILLED') {
    return 'bg-emerald-100 text-emerald-800 border-none';
  }
  if (st === 'CANCELLED') {
    return 'bg-gray-200 text-gray-700 border-none';
  }
  return 'bg-amber-100 text-amber-900 border-none';
}

export default function TreasuryPledgesPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'FULFILLED' | 'CANCELLED'>(
    'ALL'
  );
  const [yearInput, setYearInput] = useState('');

  const queryParams = useMemo(() => {
    const y = yearInput.trim();
    const yearNum = y.length === 4 && /^\d+$/.test(y) ? parseInt(y, 10) : NaN;
    const p: {
      status?: 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
      pledge_year?: number;
    } = {};
    if (statusFilter !== 'ALL') {
      p.status = statusFilter;
    }
    if (Number.isFinite(yearNum) && yearNum >= 1990 && yearNum <= 2100) {
      p.pledge_year = yearNum;
    }
    return p;
  }, [statusFilter, yearInput]);

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['treasury', 'church-pledges', queryParams],
    queryFn: () => getTreasuryChurchPledges(queryParams),
  });

  const loadError = isError
    ? error instanceof Error
      ? error.message
      : 'Could not load pledges.'
    : null;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#0A2E46]/10 p-3">
            <Target className="w-7 h-7 text-[#0A2E46]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0A2E46]">Member pledges</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Pledges submitted by members from My Giving. Link receipts when recording income to
              update progress.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </div>

      <Card className="p-4 md:p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div className="space-y-2 min-w-[180px]">
            <Label>Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as 'ALL' | 'ACTIVE' | 'FULFILLED' | 'CANCELLED')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full max-w-[140px]">
            <Label htmlFor="pledge-year-filter">Year (optional)</Label>
            <Input
              id="pledge-year-filter"
              placeholder="e.g. 2026"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
            />
          </div>
        </div>
      </Card>

      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-600 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Title / year</th>
                <th className="px-4 py-3 font-semibold text-right">Target</th>
                <th className="px-4 py-3 font-semibold text-right">Paid</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2 align-middle" />
                    Loading pledges…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-600">
                    {loadError}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No pledges match these filters yet.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-[#0A2E46]">{row.member_name || '—'}</div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {row.member_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div>{row.title?.trim() || 'Giving pledge'}</div>
                      <div className="text-xs text-muted-foreground">{row.pledge_year}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums">
                      {formatGhs(row.target_amount)}
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums">
                      {formatGhs(row.amount_fulfilled)}
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <Badge className={statusBadgeClass(row.status)}>{row.status}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 align-top text-muted-foreground max-w-[220px] truncate"
                      title={row.notes}
                    >
                      {row.notes?.trim() || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
