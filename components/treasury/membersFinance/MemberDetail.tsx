'use client';

import { FileText, Receipt } from 'lucide-react';
import MemberAvatar from './MemberAvatar';
import ContributionStats from './ContributionStats';
import TransactionList from './TransactionList';
import { MemberContribution } from '@/types/memberFinance';

interface Props {
  member: MemberContribution | null;
  // API integration point: wire these to actual PDF generation endpoints
  onStatement: (member: MemberContribution) => void;
  onReceipt: (member: MemberContribution) => void;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
      <div className="w-24 h-24 text-blue-200">
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
        className="text-lg font-semibold text-blue-300"
        style={{ fontFamily: "'OV Soge', sans-serif" }}
      >
        Select a member to view
      </p>
      <p
        className="text-lg font-semibold text-blue-300"
        style={{ fontFamily: "'OV Soge', sans-serif" }}
      >
        contribution details
      </p>
    </div>
  );
}

export default function MemberDetail({ member, onStatement, onReceipt }: Props) {
  if (!member) {
    return (
      <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Member header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size={56} />
            <div className="min-w-0">
              <p
                className="text-lg font-bold text-gray-900 truncate"
                style={{ fontFamily: "'OV Soge', sans-serif" }}
              >
                {member.name}
              </p>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="text-gray-300">⊞</span> {member.memberId}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="text-gray-300">☎</span> {member.phone}
                </span>
                <span className="text-xs text-gray-400">Member since {member.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* YTD Stats */}
        <ContributionStats member={member} />

        {/* Recent Transactions */}
        <div className="px-6 pb-6 flex-1">
          <h3
            className="text-base font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'OV Soge', sans-serif" }}
          >
            Recent Transactions
          </h3>
          <TransactionList transactions={member.transactions} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-5 border-t border-gray-100 flex gap-4 flex-shrink-0">
        <button
          onClick={() => onStatement(member)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all"
        >
          <FileText size={16} />
          Statement
        </button>
        <button
          onClick={() => onReceipt(member)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all"
        >
          <Receipt size={16} />
          Receipt
        </button>
      </div>
    </div>
  );
}
