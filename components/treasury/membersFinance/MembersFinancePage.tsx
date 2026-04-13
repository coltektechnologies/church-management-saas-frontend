'use client';

import { useState } from 'react';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import { MemberContribution } from '@/types/memberFinance';
import { MOCK_MEMBER_CONTRIBUTIONS } from '@/components/treasury/membersFinance/mockMemberFinance';

export default function MembersFinancePage() {
  const [selected, setSelected] = useState<MemberContribution | null>(null);

  // API integration point: swap MOCK_MEMBER_CONTRIBUTIONS with useSWR/useQuery fetching
  // e.g. const { data: members, isLoading } = useQuery(['members'], getMemberContributions)
  const members: MemberContribution[] = MOCK_MEMBER_CONTRIBUTIONS;

  // API integration point: generate and download PDF statement for member
  const handleStatement = (_member: MemberContribution) => {
    // e.g. const blob = await generateMemberStatement(member.id)
    // downloadBlob(blob, `${member.name}-statement.pdf`)
    alert(`Statement for ${_member.name} — wire to PDF API`);
  };

  // API integration point: generate and download receipt PDF for member
  const handleReceipt = (_member: MemberContribution) => {
    // e.g. const blob = await generateMemberReceipt(member.id)
    // downloadBlob(blob, `${member.name}-receipt.pdf`)
    alert(`Receipt for ${_member.name} — wire to PDF API`);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-theme(spacing.14)-theme(spacing.12))] min-h-0">
      {/* ── Left: member list ── */}
      <div className="w-full max-w-[420px] flex-shrink-0 flex flex-col min-h-0">
        <MemberList
          members={members}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          pageSize={7}
        />
      </div>

      {/* ── Right: member detail ── */}
      <MemberDetail member={selected} onStatement={handleStatement} onReceipt={handleReceipt} />
    </div>
  );
}
