'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  fetchDepartmentExpenseAllocations,
  saveDepartmentExpenseAllocations,
  type DepartmentExpenseAllocationRow,
} from '@/lib/departmentsApi';
import { formatCurrency } from '@/services/treasuryService';

function fiscalYearOptions(): number[] {
  const y = new Date().getFullYear();
  const out: number[] = [];
  for (let i = -3; i <= 5; i++) {
    out.push(y + i);
  }
  return out;
}

function displayEnvelope(
  r: DepartmentExpenseAllocationRow,
  overrides: Record<string, string>
): string {
  if (overrides[r.id] !== undefined) {
    return overrides[r.id];
  }
  return r.expense_budget_admin !== null && r.expense_budget_admin !== undefined
    ? String(r.expense_budget_admin)
    : '';
}

/** Build PUT payload: only rows that differ from server or clear admin override. */
function buildAllocationsPayload(
  rows: DepartmentExpenseAllocationRow[],
  overrides: Record<string, string>
): { department_id: string; expense_budget: number | null }[] {
  const list: { department_id: string; expense_budget: number | null }[] = [];
  for (const r of rows) {
    const raw = displayEnvelope(r, overrides).trim();
    const serverAdmin = r.expense_budget_admin;

    if (raw === '') {
      if (serverAdmin !== null && serverAdmin !== undefined) {
        list.push({ department_id: r.id, expense_budget: null });
      }
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`Invalid amount for ${r.name}`);
    }
    if (
      serverAdmin === null ||
      serverAdmin === undefined ||
      Math.abs(Number(serverAdmin) - n) > 1e-6
    ) {
      list.push({ department_id: r.id, expense_budget: n });
    }
  }
  return list;
}

function effectiveAllocated(
  r: DepartmentExpenseAllocationRow,
  overrides: Record<string, string>
): number {
  const raw = displayEnvelope(r, overrides).trim();
  if (raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  return r.expense_budget_admin ?? r.expense_budget_from_programs;
}

export default function AdminTreasuryBudgetAllocationPage() {
  const qc = useQueryClient();
  const [fiscalYear, setFiscalYear] = useState(() => new Date().getFullYear());
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['department-expense-allocations', fiscalYear],
    queryFn: () => fetchDepartmentExpenseAllocations(fiscalYear),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data?.departments.length) {
        return;
      }
      const allocations = buildAllocationsPayload(data.departments, overrides);
      return saveDepartmentExpenseAllocations({
        fiscal_year: fiscalYear,
        allocations,
      });
    },
    onSuccess: async () => {
      toast.success('Budget allocations saved.');
      setOverrides({});
      await qc.invalidateQueries({ queryKey: ['treasury', 'department-budgets'] });
      await qc.invalidateQueries({ queryKey: ['department-expense-allocations'] });
      await refetch();
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Save failed');
    },
  });

  const depts = data?.departments;
  const sumEffective = depts ? depts.reduce((s, r) => s + effectiveAllocated(r, overrides), 0) : 0;
  const savedAdminEnvelopeSum = data?.totals?.admin_allocated_sum ?? 0;

  const years = useMemo(() => fiscalYearOptions(), []);

  return (
    <div className="flex flex-col gap-6 pb-12 w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 sm:ml-0 h-10 px-2 sm:px-4" asChild>
          <Link href="/admin/treasury" className="gap-2">
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">Back to Treasury</span>
          </Link>
        </Button>
      </div>

      <Card className="border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl leading-snug">
            Allocate department budgets (top-down)
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Set an expense envelope per department for the selected year. When filled in, the
            treasury dashboard uses this amount as &quot;allocated&quot; instead of rolling up
            program budgets. Leaving a field empty falls back to program-based totals (nothing is
            deleted from department programs).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[140px]">
              <label className="text-sm font-medium" htmlFor="fy">
                Fiscal year
              </label>
              <select
                id="fy"
                className="h-10 w-full sm:w-auto min-w-0 rounded-md border border-[var(--admin-border)] bg-background px-3 text-sm"
                value={fiscalYear}
                onChange={(e) => {
                  setFiscalYear(Number(e.target.value));
                  setOverrides({});
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              className="gap-2 bg-[var(--primary-brand,#082f49)] hover:opacity-90 w-full sm:w-auto shrink-0"
              disabled={mutation.isPending || isLoading || !depts?.length}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
              <Loader2 className="size-4 animate-spin" /> Loading departments…
            </div>
          ) : depts?.length ? (
            <>
              {/* Desktop / tablet: table */}
              <div className="hidden md:block rounded-lg border border-[var(--admin-border)] overflow-x-auto overscroll-x-contain touch-pan-x -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] bg-muted/30">
                      <th className="text-left p-3 font-semibold">Department</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">
                        From programs
                      </th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">
                        Admin envelope
                      </th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">
                        Effective allocated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {depts.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-[var(--admin-border)] last:border-0"
                      >
                        <td className="p-3 align-top">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.code}</div>
                        </td>
                        <td className="p-3 text-right tabular-nums text-muted-foreground align-top">
                          {formatCurrency(r.expense_budget_from_programs)}
                        </td>
                        <td className="p-3 text-right align-top">
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Use programs"
                            className="max-w-[140px] ml-auto text-right tabular-nums h-9 min-h-11 sm:min-h-9"
                            value={displayEnvelope(r, overrides)}
                            onChange={(e) =>
                              setOverrides((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            aria-label={`Admin expense budget for ${r.name}`}
                          />
                        </td>
                        <td className="p-3 text-right font-medium tabular-nums align-top">
                          {formatCurrency(effectiveAllocated(r, overrides))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards */}
              <div className="md:hidden space-y-3">
                {depts.map((r) => (
                  <div
                    key={`m-${r.id}`}
                    className="rounded-xl border border-[var(--admin-border)] bg-muted/10 dark:bg-white/[0.03] p-4 space-y-4"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-base leading-snug break-words">
                        {r.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.code}</div>
                    </div>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between gap-3 items-baseline">
                        <dt className="text-muted-foreground shrink-0">From programs</dt>
                        <dd className="tabular-nums text-right text-muted-foreground">
                          {formatCurrency(r.expense_budget_from_programs)}
                        </dd>
                      </div>
                      <div className="space-y-1.5">
                        <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                          Admin envelope
                        </dt>
                        <dd>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Use programs"
                            className="w-full text-right tabular-nums h-11 text-base sm:text-sm"
                            value={displayEnvelope(r, overrides)}
                            onChange={(e) =>
                              setOverrides((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            aria-label={`Admin expense budget for ${r.name}`}
                          />
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 items-baseline pt-3 border-t border-[var(--admin-border)]">
                        <dt className="font-medium text-foreground">Effective allocated</dt>
                        <dd className="tabular-nums font-semibold">
                          {formatCurrency(effectiveAllocated(r, overrides))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:items-baseline text-sm text-muted-foreground pt-1">
                <span className="break-words">
                  Sum of admin envelopes (saved):{' '}
                  <strong className="text-foreground tabular-nums">
                    {formatCurrency(savedAdminEnvelopeSum)}
                  </strong>
                </span>
                <span className="break-words">
                  Preview sum (effective column):{' '}
                  <strong className="text-foreground tabular-nums">
                    {formatCurrency(sumEffective)}
                  </strong>
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-6">No active departments found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
