'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, Receipt, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MemberAvatar from './MemberAvatar';
import ContributionStats from './ContributionStats';
import TransactionList from './TransactionList';
import { readableMemberTitle } from '@/components/treasury/membersFinance/exportMemberFinanceDocuments';
import { getTreasuryMemberPledges } from '@/lib/treasuryApi';
import { MemberContribution } from '@/types/memberFinance';

function formatGhsAmount(raw: string): string {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) {
    return raw;
  }
  return `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pledgeStatusBadgeClass(st: string): string {
  if (st === 'FULFILLED') {
    return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none';
  }
  if (st === 'CANCELLED') {
    return 'bg-slate-200 text-slate-700 hover:bg-slate-200 border-none';
  }
  return 'bg-amber-100 text-amber-900 hover:bg-amber-100 border-none';
}

interface Props {
  member: MemberContribution | null;
  // API integration point: wire these to actual PDF generation endpoints
  onStatement: (member: MemberContribution) => void;
  onReceipt: (member: MemberContribution) => void;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
      <div className="w-24 h-24 text-slate-200 dark:text-slate-600">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="34" r="18" stroke="currentColor" strokeWidth="3" />
          <path
            d="M16 82c0-17.673 14.327-32 32-32s32 14.327 32 32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="68" cy="68" r="12" stroke="currentColor" strokeWidth="2.5" />
          <path d="M64 68h8M68 64v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p
        className="text-lg font-semibold text-slate-500 dark:text-slate-300"
      >
        Select a member to view
      </p>
      <p
        className="text-lg font-semibold text-slate-500 dark:text-slate-300"
      >
        contribution details
      </p>
    </div>
  );
}

export default function MemberDetail({ member, onStatement, onReceipt }: Props) {
  const mid = member?.id;

  const {
    data: pledgeRows = [],
    isLoading: pledgesLoading,
    isError: pledgesError} = useQuery({
    queryKey: ['treasury', 'member-pledges-panel', mid ?? ''],
    queryFn: () => {
      if (!mid) {
        return Promise.resolve([]);
      }
      return getTreasuryMemberPledges(mid, { includeAllStatuses: true });
    },
    enabled: Boolean(mid)});

  if (!member) {
    return (
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-600 rounded-2xl flex flex-col overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  const displayName = readableMemberTitle(member);
  const avatarName =
    displayName.startsWith('Member (') && member.memberId ? member.memberId : member.name;

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-600 rounded-2xl flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Member header */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-4">
            <MemberAvatar name={avatarName} avatarUrl={member.avatarUrl} size={56} />
            <div className="min-w-0">
              <p
                className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                {displayName}
              </p>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span className="text-slate-300 dark:text-slate-600">⊞</span> {member.memberId}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span className="text-slate-300 dark:text-slate-600">☎</span> {member.phone}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Member since {member.memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* YTD Stats */}
        <ContributionStats member={member} />

        {/* Pledges (from My Giving; payments linked in Record Income update Paid) */}
        <div className="px-6 pb-5 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Pledges
            </h3>
          </div>
          {pledgesLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading pledges…
            </div>
          ) : pledgesError ? (
            <p className="text-sm text-red-600 dark:text-red-400 py-2">Could not load pledges.</p>
          ) : pledgeRows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-1">
              No pledges on file for this member.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th className="px-3 py-2 font-semibold">Title / year</th>
                    <th className="px-3 py-2 font-semibold text-right">Target</th>
                    <th className="px-3 py-2 font-semibold text-right">Paid</th>
                    <th className="px-3 py-2 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pledgeRows.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200">
                        <div>{p.title?.trim() || 'Giving pledge'}</div>
                        <div className="text-xs text-slate-500">{p.pledge_year}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-slate-200">
                        {formatGhsAmount(p.target_amount)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-teal-700 dark:text-teal-400 font-medium">
                        {formatGhsAmount(p.amount_fulfilled)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={pledgeStatusBadgeClass(p.status)}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="px-6 pb-6 flex-1 pt-5">
          <h3
            className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4"
          >
            Recent Transactions
          </h3>
          <TransactionList transactions={member.transactions} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700/80 flex gap-4 flex-shrink-0">
        <button
          onClick={() => onStatement(member)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-500 active:scale-95 transition-all"
        >
          <FileText size={16} />
          Statement
        </button>
        <button
          onClick={() => onReceipt(member)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-500 active:scale-95 transition-all"
        >
          <Receipt size={16} />
          Receipt
        </button>
      </div>
    </div>
  );
}
