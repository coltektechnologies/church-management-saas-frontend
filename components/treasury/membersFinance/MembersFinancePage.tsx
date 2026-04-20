'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import type { MemberContribution } from '@/types/memberFinance';
import {
  downloadContributionStatementPdf,
  downloadReceiptPdf,
} from '@/components/treasury/membersFinance/exportMemberFinanceDocuments';
import { fetchMembersFinanceMerged } from '@/services/membersFinanceDirectory';

const FILTERS = {
  period: 'this_year' as const,
  /** Backend caps at 100 — used only for the contributions aggregate query. */
  contributorsLimit: 100,
};

export default function MembersFinancePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['treasury', 'members-finance-directory', FILTERS],
    queryFn: () => fetchMembersFinanceMerged(FILTERS),
  });

  const members = data;

  const selected = useMemo(
    () => (selectedId ? (members.find((m) => m.id === selectedId) ?? null) : null),
    [members, selectedId]
  );

  const handleStatement = (member: MemberContribution) => {
    try {
      downloadContributionStatementPdf(member);
      toast.success('Statement PDF downloaded.');
    } catch {
      toast.error('Could not generate the statement PDF.');
    }
  };

  const handleReceipt = (member: MemberContribution) => {
    try {
      downloadReceiptPdf(member);
      toast.success('Receipt PDF downloaded.');
    } catch {
      toast.error('Could not generate the receipt PDF.');
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-theme(spacing.14)-theme(spacing.12))] min-h-0">
      {/* ── Left: member list ── */}
      <div className="w-full max-w-[420px] flex-shrink-0 flex flex-col min-h-0">
        <MemberList
          members={members}
          selectedId={selectedId}
          onSelect={(m) => setSelectedId(m.id)}
          pageSize={7}
          isLoading={isLoading}
          loadError={
            isError ? (error instanceof Error ? error.message : 'Could not load members.') : null
          }
        />
      </div>

      {/* ── Right: member detail ── */}
      <MemberDetail member={selected} onStatement={handleStatement} onReceipt={handleReceipt} />
    </div>
  );
}
