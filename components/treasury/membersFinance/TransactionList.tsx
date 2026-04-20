'use client';

import { MemberTransaction, ContributionType } from '@/types/memberFinance';

interface Props {
  transactions: MemberTransaction[];
}

const TYPE_COLOR: Record<ContributionType, string> = {
  Tithe: 'bg-teal-400',
  Offering: 'bg-teal-400',
  Project: 'bg-teal-400',
  Donation: 'bg-blue-400',
};

function TransactionIcon({ type }: { type: ContributionType }) {
  return (
    <div
      className={`w-12 h-12 rounded-2xl ${TYPE_COLOR[type]} flex items-center justify-center flex-shrink-0`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-6 h-6 text-white"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </div>
  );
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>;
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-4">
          <TransactionIcon type={tx.type} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{tx.type}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {tx.date} · {tx.receiptNumber}
            </p>
          </div>
          <p className="text-sm font-bold text-green-600 flex-shrink-0">
            GHS{tx.amount.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
