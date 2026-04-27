'use client';

import MemberAvatar from './MemberAvatar';
import { readableMemberTitle } from '@/components/treasury/membersFinance/exportMemberFinanceDocuments';
import { MemberContribution } from '@/types/memberFinance';

interface Props {
  member: MemberContribution;
  isSelected: boolean;
  onClick: () => void;
}

export default function MemberCard({ member, isSelected, onClick }: Props) {
  const displayName = readableMemberTitle(member);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
        isSelected
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 dark:border-[var(--secretary-accent,#2FC4B2)] ring-1 ring-[var(--secretary-accent,#2FC4B2)]/20'
          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
      }`}
    >
      <MemberAvatar
        name={displayName.startsWith('Member (') ? member.memberId : member.name}
        avatarUrl={member.avatarUrl}
        size={44}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {displayName}
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-slate-300 dark:text-slate-500 text-[10px]">⊞</span>
            {member.memberId}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-slate-300 dark:text-slate-500 text-[10px]">☎</span>
            {member.phone}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-sm font-bold text-teal-600 dark:text-[var(--secretary-accent,#2FC4B2)]">
          GHS{member.totalYTD.toLocaleString()}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            member.status === 'Active'
              ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300'
          }`}
        >
          {member.status}
        </span>
      </div>
    </button>
  );
}
